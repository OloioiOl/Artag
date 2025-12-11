/**
 * [ConfigTag.js] NFC Kiosk Server (Final Integrated Version)
 * - Bug Fixed: canonicalStringify Removed
 * - Feature Added: Single Menu Tag Support
 * - Feature Added: Virtual Test Button Support
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const pcsclite = require('pcsclite');
const admin = require('firebase-admin');

// ====== 1. 서버 및 미들웨어 설정 ======
const app = express();
const server = http.createServer(app);
const PORT = 8080;

app.use(cors());
app.use(express.json()); 

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// ====== 2. Firebase Admin 초기화 ======
let serviceAccount;
try {
  serviceAccount = require("./serviceAccountKey.json");
} catch (e) {
  console.error("❌ 오류: serviceAccountKey.json 파일이 없습니다.");
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const UID_COLLECTION = "nfc_uids";
const ORDERS_SUBCOLLECTION = "orders";
const MENU_COLLECTION = "menus";

// ====== 3. API 엔드포인트 ======

// [GET] 메뉴 목록
app.get('/api/menus', async (req, res) => {
  try {
    const snapshot = await db.collection(MENU_COLLECTION).get();
    const menuList = snapshot.docs.map(doc => doc.data());
    res.json(menuList);
  } catch (error) {
    res.status(500).json({ error: "메뉴 로딩 실패" });
  }
});

// [POST] 주문 저장
app.post('/api/orders', async (req, res) => {
  const { uid, menuId, menuName, options } = req.body; 
  if (!uid || !menuId) return res.status(400).json({ error: "필수 정보 누락" });

  try {
    const batch = db.batch();
    const uidDocId = uid.replace(/\s|:/g, "").toUpperCase();
    
    // 1) 주문 이력
    const userOrderRef = db.collection(UID_COLLECTION).doc(uidDocId)
                           .collection(ORDERS_SUBCOLLECTION).doc(); 
    batch.set(userOrderRef, {
      menu_id: menuId,
      menu_name: menuName,
      options: options || {}, 
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // 2) 판매량 집계
    if (menuId !== 'CART_ORDER') {
      const menuRef = db.collection(MENU_COLLECTION).doc(menuId);
      batch.update(menuRef, { total_sales: admin.firestore.FieldValue.increment(1) });
    }

    // 3) 방문 기록 (GUEST가 아닐 때만)
    if (uid !== 'GUEST') {
        const uidRef = db.collection(UID_COLLECTION).doc(uidDocId);
        batch.set(uidRef, {
            scan_count: admin.firestore.FieldValue.increment(1),
            last_seen: admin.firestore.FieldValue.serverTimestamp(),
            uid_pretty: uid
        }, { merge: true });
    }

    await batch.commit();
    console.log(`✅ [주문 저장] ${uid} - ${menuName}`);
    res.json({ success: true });
  } catch (e) {
    console.error("❌ 주문 저장 실패:", e);
    res.status(500).json({ error: "서버 오류" });
  }
});

// 🛠️ [POST] 가상 태그 테스트 (버튼용)
app.post('/api/test/tag', async (req, res) => {
  try {
    // "BUTTON"이라는 UID로 로직 수행
    const result = await processTagLogic("04F8142BC12A81"); 
    res.json({ success: true, type: result.type });
  } catch (e) {
    res.status(500).json({ error: "Test Failed" });
  }
});


// ====== 4. 로직 함수들 ======

// A. 개인화 추천 (옵션 무시, ID 기준)
async function getPersonalTop3(uidRef) {
  if (uidRef.id === "GUEST") return []; // GUEST 제외

  const ordersSnap = await uidRef.collection(ORDERS_SUBCOLLECTION)
    .orderBy("created_at", "desc").limit(100).get();

  if (ordersSnap.empty) return []; 

  const counter = new Map();
  for (const doc of ordersSnap.docs) {
    const mId = doc.data().menu_id;
    counter.set(mId, (counter.get(mId) || 0) + 1);
  }

  const sorted = [...counter.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  return sorted.map(([mId, count]) => ({ menu_id: mId, count }));
}

// B. 글로벌 베스트
async function getGlobalTop3() {
  const snapshot = await db.collection(MENU_COLLECTION)
    .orderBy('total_sales', 'desc').limit(3).get();

  if (snapshot.empty) return [];
  return snapshot.docs.map(doc => ({
    menu_id: doc.data().id,
    tag: 'BEST'
  }));
}

// C. 🔥 [핵심] 태그 처리 로직 (User vs Menu 분기)
async function processTagLogic(uid) {
  const uidDocId = uid.replace(/\s|:/g, "").toUpperCase();
  const docRef = db.collection(UID_COLLECTION).doc(uidDocId);
  
  console.log(`🔔 [Logic Start] 태그 처리: ${uid}`);

  // 1. 문서 확인 (역할 구분)
  const docSnap = await docRef.get();
  
  // [CASE 1] 단일 메뉴 카드인지 확인
 
  if (docSnap.exists) {
    const data = docSnap.data();
    if (data.role === 'MENU') {
      console.log(`🍔 [NFC] 메뉴 카드 감지됨: ${data.fixed_menu_id}`);
      
      io.emit('nfc_event', {
        type: 'TAG_MENU', // 프론트에서 바로 장바구니/확인 화면으로 이동
        menu_id: data.fixed_menu_id,
        options: data.fixed_options || {}
      });
      return { success: true, type: 'MENU' }; // 종료
    }
  }

  // [CASE 2] 일반 유저 (로그인)
  console.log(`👤 [NFC] 일반 회원 로그인: ${uid}`);

  // 2-1. 방문 기록 업데이트
  await docRef.set({
    uid_pretty: uid,
    last_seen: admin.firestore.FieldValue.serverTimestamp(),
    scan_count: admin.firestore.FieldValue.increment(1)
  }, { merge: true });

  // 2-2. 추천 알고리즘
  let finalTop3 = await getPersonalTop3(docRef);

  // 2-3. 글로벌 보충
  if (finalTop3.length < 3) {
    const globalBests = await getGlobalTop3();
    for (const item of globalBests) {
      if (finalTop3.length >= 3) break;
      // 중복 검사 (Menu ID 기준)
      const isDuplicate = finalTop3.some(personal => personal.menu_id === item.menu_id);
      if (!isDuplicate) finalTop3.push(item);
    }
  }

  // 2-4. 소켓 전송
  io.emit('nfc_event', {
    type: 'TAG_ON', // 프론트에서 로그인/추천 화면으로 이동
    uid: uid,
    top3: finalTop3
  });

  return { success: true, type: 'USER' };
}


// ====== 5. NFC 리스너 ======
function stripStatusWord(buf) {
  if (Buffer.isBuffer(buf) && buf.length >= 2 && buf[buf.length - 2] === 0x90 && buf[buf.length - 1] === 0x00) return buf.slice(0, -2);
  return buf;
}
function toPrettyUid(buf) {
  return buf.toString("hex").toUpperCase().match(/.{1,2}/g).join(" ");
}

const DUPLICATE_SUPPRESS_MS = 900;
let lastSeenByReader = new Map();

function startNFCListener() {
  const pcsc = pcsclite();
  const GET_UID_APDU = Buffer.from([0xFF, 0xCA, 0x00, 0x00, 0x00]);

  pcsc.on("reader", (reader) => {
    console.log(`▶️ 리더기 감지됨: ${reader.name}`);
    
    reader.on("status", (status) => {
      const changes = reader.state ^ status.state;
      if (!changes) return;
      const presentNow = status.state & reader.SCARD_STATE_PRESENT;
      const wasNotPresent = changes & reader.SCARD_STATE_PRESENT;

      if (wasNotPresent && presentNow) {
        reader.connect({ share_mode: reader.SCARD_SHARE_SHARED }, (err, protocol) => {
          if (err) return;
          reader.transmit(GET_UID_APDU, 40, protocol, async (err, data) => {
            if (err) { reader.disconnect(reader.SCARD_LEAVE_CARD, ()=>{}); return; }

            try {
              const raw = stripStatusWord(data);
              const uidPretty = toPrettyUid(raw);
              const uidDocId = uidPretty.replace(/\s|:/g, "").toUpperCase();

              // 중복 방지
              const now = Date.now();
              const last = lastSeenByReader.get(reader.name) || { ts: 0, id: '' };
              if (last.id === uidDocId && now - last.ts < DUPLICATE_SUPPRESS_MS) {
                console.log(`⏱️ 중복 태깅 무시: ${uidPretty}`);
                reader.disconnect(reader.SCARD_LEAVE_CARD, ()=>{});
                return;
              }
              lastSeenByReader.set(reader.name, { id: uidDocId, ts: now });

              // 🔥 핵심 로직 호출 (여기로 모든 로직 위임)
              await processTagLogic(uidPretty);

            } catch (e) {
              console.error("❌ 처리 중 에러:", e);
            } finally {
              reader.disconnect(reader.SCARD_LEAVE_CARD, ()=>{});
            }
          });
        });
      }
    });
    reader.on("error", (err) => console.error("Reader Error:", err));
  });
  pcsc.on("error", (err) => console.error("PCSC Error:", err));
}

// ====== 6. 서버 실행 ======
startNFCListener();
server.listen(PORT, () => {
  console.log(`
  ┌──────────────────────────────────────────────┐
  │  🚀 Kiosk Full Server Started on Port ${PORT} │
  │  👉 Ready for User & Menu Tags               │
  └──────────────────────────────────────────────┘
  `);
});