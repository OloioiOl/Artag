/**
 * [ConfigTag.js] NFC Kiosk Server (Final Complete Version)
 * * 1. API: 메뉴 조회(GET) & 주문 저장(POST + 옵션/판매량 집계)
 * 2. NFC: 태그 시 하이브리드 알고리즘 (개인 취향 + 가게 베스트) TOP3 추천
 * 3. Socket: 실시간 프론트엔드 화면 전환
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

// CORS 허용 & JSON 파싱 (POST 요청 처리용)
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

// 컬렉션 상수
const UID_COLLECTION = "nfc_uids";      // 유저 정보
const ORDERS_SUBCOLLECTION = "orders";  // 유저별 주문 기록 (하위)
const MENU_COLLECTION = "menus";        // 메뉴 정보 (전체 판매량 포함)

// ====== 3. API 엔드포인트 ======

// [GET] 메뉴 목록 가져오기
app.get('/api/menus', async (req, res) => {
  try {
    const snapshot = await db.collection(MENU_COLLECTION).get();
    // total_sales 필드도 같이 나가지만 프론트에서 안 쓰면 그만입니다.
    const menuList = snapshot.docs.map(doc => doc.data());
    console.log(`📥 [API] 메뉴 목록 요청됨 (${menuList.length}개)`);
    res.json(menuList);
  } catch (error) {
    console.error("❌ 메뉴 조회 실패:", error);
    res.status(500).json({ error: "메뉴 로딩 실패" });
  }
});

// 🔥 [POST] 주문 기록 저장 (옵션 저장 + 전체 판매량 집계)
app.post('/api/orders', async (req, res) => {
  const { uid, menuId, menuName, options } = req.body; 

  if (!uid || !menuId) {
    return res.status(400).json({ error: "필수 정보 누락" });
  }

  try {
    const batch = db.batch(); // 트랜잭션처럼 한 번에 처리

    const uidDocId = uid.replace(/\s|:/g, "").toUpperCase();
    
    // 1) 개인 주문 이력 저장 (옵션 포함)
    const userOrderRef = db.collection(UID_COLLECTION).doc(uidDocId)
                           .collection(ORDERS_SUBCOLLECTION).doc(); 
    
    batch.set(userOrderRef, {
      menu_id: menuId,
      menu_name: menuName,
      options: options || {}, 
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // 2) 가게 전체 판매량 집계 (해당 메뉴 total_sales + 1)
    const menuRef = db.collection(MENU_COLLECTION).doc(menuId);
    // increment는 필드가 없으면 생성해주므로 안전합니다.
    batch.update(menuRef, {
      total_sales: admin.firestore.FieldValue.increment(1)
    });

    // 3) 개인 방문 정보 업데이트
    const uidRef = db.collection(UID_COLLECTION).doc(uidDocId);
    batch.set(uidRef, {
        scan_count: admin.firestore.FieldValue.increment(1),
        last_seen: admin.firestore.FieldValue.serverTimestamp(),
        uid_pretty: uid // 혹시 문서가 없을 때를 대비해
    }, { merge: true });

    await batch.commit(); // 저장 실행
    console.log(`✅ [주문 저장] ${uid} - ${menuName} / 옵션: ${JSON.stringify(options)}`);
    res.json({ success: true });

  } catch (e) {
    console.error("❌ 주문 저장 실패:", e);
    res.status(500).json({ error: "서버 내부 오류" });
  }
});

// 접속 확인용
app.get('/', (req, res) => res.send('🚀 Kiosk Backend Server is Running!'));


// ====== 4. 추천 알고리즘 (Logic) ======

// A. 개인화 추천 (옵션까지 포함해서 카운팅)
async function getPersonalTop3(uidRef) {
  // 최근 100건 조회
  const ordersSnap = await uidRef.collection(ORDERS_SUBCOLLECTION)
    .orderBy("created_at", "desc").limit(100).get();

  if (ordersSnap.empty) return []; 

  const counter = new Map();

  for (const doc of ordersSnap.docs) {
    const data = doc.data();
    const mId = data.menu_id;
    const opts = data.options || {};
    
    // 메뉴ID + 옵션을 합쳐서 고유키 생성 (아아 vs 뜨아 구분)
    const uniqueKey = JSON.stringify({ id: mId, opts: opts });
    counter.set(uniqueKey, (counter.get(uniqueKey) || 0) + 1);
  }

  // 내림차순 정렬 후 상위 3개만
  const sorted = [...counter.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  return sorted.map(([keyStr, count]) => {
    const { id, opts } = JSON.parse(keyStr);
    return {
      menu_id: id,
      options: opts,
      count
    };
  });
}

// B. 가게 전체 베스트 (Fallback)
async function getGlobalTop3() {
  // 판매량 높은 순으로 넉넉히 10개 가져옴 (중복 제거 대비)
  const snapshot = await db.collection(MENU_COLLECTION)
    .orderBy('total_sales', 'desc')
    .limit(10) 
    .get();

  if (snapshot.empty) return [];

  return snapshot.docs.map(doc => {
    const d = doc.data();
    return {
      menu_id: d.id,
      // 글로벌 추천은 기본 옵션(Hot/Basic)을 제안
      options: { temp: 'hot', cup: 'basic' }, 
      count: d.total_sales || 0,
      tag: 'BEST' // 프론트에서 '인기' 뱃지 표시용
    };
  });
}


// ====== 5. NFC 리스너 및 소켓 처리 ======
// 유틸리티 함수들
function stripStatusWord(buf) {
  if (Buffer.isBuffer(buf) && buf.length >= 2 && buf[buf.length - 2] === 0x90 && buf[buf.length - 1] === 0x00) return buf.slice(0, -2);
  return buf;
}
function toPrettyUid(buf) {
  return buf.toString("hex").toUpperCase().match(/.{1,2}/g).join(" ");
}
function toDocId(pretty) {
  return pretty.replace(/\s|:/g, "").toUpperCase();
}

// 중복 태깅 방지 변수
const DUPLICATE_SUPPRESS_MS = 1500;
let lastSeenByReader = new Map();

// [유틸] 객체 키 정렬 함수 (중복 검사 필수!)
function canonicalStringify(obj) {
  if (typeof obj !== 'object' || obj === null) return JSON.stringify(obj);
  const keys = Object.keys(obj).sort(); // 키를 가나다순 정렬
  const sortedObj = {};
  keys.forEach(key => { sortedObj[key] = obj[key]; });
  return JSON.stringify(sortedObj);
}

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

      // [카드 태그 됨]
      if (wasNotPresent && presentNow) {
        reader.connect({ share_mode: reader.SCARD_SHARE_SHARED }, (err, protocol) => {
          if (err) return;
          reader.transmit(GET_UID_APDU, 40, protocol, async (err, data) => {
            if (err) { reader.disconnect(reader.SCARD_LEAVE_CARD, ()=>{}); return; }

            try {
              // 1. UID 파싱
              const raw = stripStatusWord(data);
              const uidPretty = toPrettyUid(raw);
              const uidDocId = toDocId(uidPretty);

              // 2. 중복 방지
              const now = Date.now();
              const last = lastSeenByReader.get(reader.name) || { ts: 0, id: '' };
              if (last.id === uidDocId && now - last.ts < DUPLICATE_SUPPRESS_MS) {
                console.log(`⏱️ 중복 태깅 무시: ${uidPretty}`);
                reader.disconnect(reader.SCARD_LEAVE_CARD, ()=>{});
                return;
              }
              lastSeenByReader.set(reader.name, { id: uidDocId, ts: now });

              console.log(`🔔 [NFC] 카드 인식: ${uidPretty}`);

              // 3. 방문 기록 (scan_count)
              const uidRef = db.collection(UID_COLLECTION).doc(uidDocId);
              await uidRef.set({
                uid_pretty: uidPretty,
                last_seen: admin.firestore.FieldValue.serverTimestamp()
              }, { merge: true });

              // 4. 🔥 하이브리드 TOP3 계산 🔥
              
              // 4-1) 개인 기록 가져오기
              let finalTop3 = await getPersonalTop3(uidRef);

              // 4-2) 부족하면 글로벌 베스트로 채우기
              if (finalTop3.length < 3) {
                console.log(`ℹ️ 개인 추천 부족(${finalTop3.length}개). 가게 베스트로 보충합니다.`);
                const globalBests = await getGlobalTop3();

                for (const item of globalBests) {
                  if (finalTop3.length >= 3) break; // 3개 차면 중단

                  // 🚨 중복 검사 (수정된 부분)
                  // JSON.stringify 대신 canonicalStringify 사용!
                  const isDuplicate = finalTop3.some(personal => 
                    personal.menu_id === item.menu_id &&
                    canonicalStringify(personal.options) === canonicalStringify(item.options)
                  );

                  if (!isDuplicate) {
                    finalTop3.push(item);
                  }
                }
              }

              console.log(`✅ 최종 추천 목록(${finalTop3.length}개) 전송`);

              // 5. 소켓으로 프론트에 전송
              io.emit('nfc_event', {
                type: 'TAG_ON',
                uid: uidPretty,
                top3: finalTop3
              });

            } catch (e) {
              console.error("❌ 처리 중 에러:", e);
            } finally {
              reader.disconnect(reader.SCARD_LEAVE_CARD, ()=>{});
            }
          });
        });
      }
    });
    
    reader.on("end", () => console.log(`🛑 리더기 연결 해제`));
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
  │  👉 Ready for API & Socket & NFC             │
  └──────────────────────────────────────────────┘
  `);
});