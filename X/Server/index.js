/**
 * NFC → Firestore (UID별 1문서 고정) + TOP3(메뉴 기준) 세션 푸시
 *
 * - 문서ID = 공백/콜론 제거 대문자 UID (예: "1DF10A11091080")
 * - 컬렉션:
 * nfc_uids/{uid}                     : 카드 1장당 문서
 * nfc_uids/{uid}/orders/{orderId}    : 주문 이력 (여기서 TOP3 집계)
 * kiosk_sessions/{readerId}          : 리더기별 세션(프론트 실시간 구독)
 *
 * 필요 패키지: pcsclite, firebase-admin
 * npm i pcsclite firebase-admin
 * 서비스계정 키: ./serviceAccountKey.json
 */

const pcsclite = require("pcsclite");
const admin = require("firebase-admin");

// ====== 설정 ======
const UID_COLLECTION = "nfc_uids";           // UID별 문서
const ORDERS_SUBCOLLECTION = "orders";       // 주문 이력 서브컬렉션
const SESSION_COLLECTION = "kiosk_sessions"; // 프론트가 구독할 세션 컬렉션

const WRITE_SCAN_HISTORY = true;             // scans 서브컬렉션 이력 기록 여부
const DUPLICATE_SUPPRESS_MS = 1500;          // 중복 태깅 억제(ms)
const GET_UID_APDU = Buffer.from([0xFF, 0xCA, 0x00, 0x00, 0x00]); // ACR122U 등

// TOP3 집계 파라미터
const ORDER_HISTORY_LIMIT = 500;             // 최근 몇 건까지 볼지
const FALLBACK_TO_NAME = true;               // menu_id 없으면 menu_name으로 집계 시도
const AGGREGATE_BY = "MENU_ONLY";            // 정책 1: 메뉴 기준(옵션은 합산)

// =====================================

// Firebase Admin 초기화
let serviceAccount;
try {
  serviceAccount = require("./serviceAccountKey.json");
} catch (e) {
  console.error("❌ serviceAccountKey.json을 찾을 수 없습니다. 같은 폴더에 두세요.");
  process.exit(1);
}
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
console.log("✅ 파이어베이스 연결 성공!");

// ====== 유틸 ======
function stripStatusWord(buf) {
  if (
    Buffer.isBuffer(buf) &&
    buf.length >= 2 &&
    buf[buf.length - 2] === 0x90 &&
    buf[buf.length - 1] === 0x00
  ) {
    return buf.slice(0, -2);
  }
  return buf;
}
function toPrettyUid(buf) {
  return buf.toString("hex").toUpperCase().match(/.{1,2}/g).join(" ");
}
function toDocId(pretty) {
  return pretty.replace(/\s|:/g, "").toUpperCase();
}
function toSessionId(readerName) {
  return String(readerName || "unknown").replace(/[^a-zA-Z0-9_-]/g, "_");
}

// 중복 스캔 방지용 메모리
let lastSeenByReader = new Map(); // key: reader.name, value: { uidDocId, ts }

// ====== TOP3 집계 (메뉴 기준: 옵션 무시) ======
async function getTop3MenusForCard(uidRef) {
  const ordersSnap = await uidRef
    .collection(ORDERS_SUBCOLLECTION)
    .orderBy("created_at", "desc")
    .limit(ORDER_HISTORY_LIMIT)
    .get();

  if (ordersSnap.empty) return [];

  const counter = new Map();
  const lastAt = new Map();

  for (const doc of ordersSnap.docs) {
    const o = doc.data();

    // 정책 1: 메뉴 기준 (옵션은 무시)
    let key = o.menu_id;
    if (!key && FALLBACK_TO_NAME) key = `name::${o.menu_name || "UNKNOWN"}`;
    if (!key) continue;

    // 횟수 카운트
    const c = (counter.get(key) || 0) + 1;
    counter.set(key, c);

    // 최근 주문 시각 추적(동률 정렬용)
    const ts =
      o.created_at && o.created_at.toDate ? o.created_at.toDate().getTime() : 0;
    if (!lastAt.has(key) || ts > lastAt.get(key)) lastAt.set(key, ts);
  }

  // 정렬: count desc → last_ts desc
  const arr = Array.from(counter.entries())
    .map(([key, count]) => ({ key, count, last_ts: lastAt.get(key) || 0 }))
    .sort((a, b) => (b.count - a.count) || (b.last_ts - a.last_ts));

  // 응답 포맷
  const top3 = [];
  for (const it of arr.slice(0, 3)) {
    if (it.key.startsWith("name::")) {
      top3.push({
        menu_id: null,
        menu_name: it.key.replace(/^name::/, ""),
        count: it.count,
        last_ts: it.last_ts,
      });
    } else {
      top3.push({
        menu_id: it.key,
        menu_name: null, // 필요 시 프론트에서 menus/{menuId} 읽어 이름 합치기
        count: it.count,
        last_ts: it.last_ts,
      });
    }
  }
  return top3;
}

// ====== 세션 문서 쓰기 ======
async function pushSessionForReader(readerName, payload) {
  const sessionId = toSessionId(readerName);
  const ref = db.collection(SESSION_COLLECTION).doc(sessionId);
  await ref.set(
    { ...payload, updated_at: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  );
  return sessionId;
}

// ====== 메인 ======
function startNFCListener() {
  const pcsc = pcsclite();

  pcsc.on("reader", (reader) => {
    console.log(`▶️ 리더기 발견: ${reader.name}`);
    console.log("--- 💳 카드 태그 대기 중 ---");

    reader.on("status", (status) => {
      const changes = reader.state ^ status.state;
      if (!changes) return;

      // 1. 카드 올림 (Card Present)
      const presentNow = status.state & reader.SCARD_STATE_PRESENT;
      const wasNotPresent = changes & reader.SCARD_STATE_PRESENT;
      
      if (wasNotPresent && presentNow) {
        reader.connect(
          { share_mode: reader.SCARD_SHARE_SHARED },
          async (err, protocol) => {
            if (err) {
              console.error("❌ connect error:", err);
              return;
            }

            reader.transmit(GET_UID_APDU, 40, protocol, async (err, data) => {
              if (err) {
                console.error("❌ transmit error:", err);
                reader.disconnect(reader.SCARD_LEAVE_CARD, () => {});
                return;
              }

              try {
                const raw = stripStatusWord(data);
                const uidPretty = toPrettyUid(raw);
                const uidDocId = toDocId(uidPretty);

                // 리더별 중복 억제
                const now = Date.now();
                const last =
                  lastSeenByReader.get(reader.name) || { uidDocId: null, ts: 0 };
                if (
                  last.uidDocId === uidDocId &&
                  now - last.ts < DUPLICATE_SUPPRESS_MS
                ) {
                  console.log(
                    `⏱️ 중복 스캔 무시 (${DUPLICATE_SUPPRESS_MS}ms): ${uidPretty}`
                  );
                  reader.disconnect(reader.SCARD_LEAVE_CARD, () => {});
                  return;
                }
                lastSeenByReader.set(reader.name, { uidDocId, ts: now });

                console.log(`✅ 카드 감지! UID: ${uidPretty}`);

                // 1) UID 문서 upsert
                const uidRef = db.collection(UID_COLLECTION).doc(uidDocId);
                const snap = await uidRef.get();
                if (snap.exists) {
                  await uidRef.set(
                    {
                      uid_pretty: uidPretty,
                      last_seen: admin.firestore.FieldValue.serverTimestamp(),
                      last_reader: reader.name || "unknown",
                      scan_count: admin.firestore.FieldValue.increment(1),
                    },
                    { merge: true }
                  );
                } else {
                  await uidRef.set({
                    uid_pretty: uidPretty,
                    first_seen: admin.firestore.FieldValue.serverTimestamp(),
                    last_seen: admin.firestore.FieldValue.serverTimestamp(),
                    last_reader: reader.name || "unknown",
                    scan_count: 1,
                  });
                }

                // (옵션) 스캔 이력
                if (WRITE_SCAN_HISTORY) {
                  await uidRef.collection("scans").add({
                    at: admin.firestore.FieldValue.serverTimestamp(),
                    reader: reader.name || "unknown",
                  });
                }

                console.log(
                  `🔥 저장 성공 → 문서ID=${uidDocId} (${UID_COLLECTION})`
                );

                // 2) TOP3 계산 (메뉴 기준)
                const top3 = await getTop3MenusForCard(uidRef);
                console.log("🥤 TOP3:", top3);

                // 3) 세션 문서에 푸시 → 프론트 실시간 구독 (TOP3 전송)
                const sessionId = await pushSessionForReader(reader.name, {
                  screen: "TOP3",
                  uid_pretty: uidPretty,
                  uid_doc: uidDocId,
                  top3, 
                });
                console.log(
                  `📡 세션 업데이트 완료 (TOP3) → ${SESSION_COLLECTION}/${sessionId}`
                );
              } catch (e) {
                console.error("❌ 처리 중 에러:", e);
              } finally {
                reader.disconnect(reader.SCARD_LEAVE_CARD, (err) => {
                  if (err) console.error("disconnect error:", err);
                });
              }
            });
          }
        );
      }

      // 2. 카드 제거 (Card Removed)
      const removedNow = !(status.state & reader.SCARD_STATE_PRESENT);
      const wasPresent = changes & reader.SCARD_STATE_PRESENT;
      
      if (wasPresent && removedNow) {
        // [수정됨] 카드가 제거되어도 Firestore로 HOME 신호를 보내지 않음.
        // 오직 로그만 출력하여 프론트엔드 화면을 유지시킴.
        console.log("↩️ 카드 제거됨 (화면 유지 - Firestore 전송 안함)");
        
        /* // (삭제된 로직) 아래 코드가 프론트엔드를 강제로 초기화하던 주범입니다.
        pushSessionForReader(reader.name, {
          screen: "HOME", 
          uid_pretty: null,
          top3: null,
        }).catch((e) => console.error("세션 HOME 푸시 에러:", e));
        */
      }
    });

    reader.on("error", (err) => console.error("Reader error:", err));
    reader.on("end", () => console.log(`🛑 리더기 제거: ${reader.name}`));
  });

  pcsc.on("error", (err) => console.error("PCSC error:", err));

  // 안전 종료
  process.on("SIGINT", () => {
    console.log("\n👋 종료합니다.");
    try {
      pcsc.close();
    } catch (_) {}
    process.exit(0);
  });
}

startNFCListener();