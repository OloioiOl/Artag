const admin = require('firebase-admin');

// 1. Firebase 접속
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const COLLECTION = "nfc_uids";
const OLD_ID = "0897477B";           // 🔴 현재 문서 이름 (이미지 참고)
const NEW_ID = "0487A342206880";     // 🟢 바꿀 문서 이름 (공백 제거 필수!)

async function main() {
  console.log(`🚀 문서 이동 시작: ${OLD_ID} -> ${NEW_ID}`);

  const oldRef = db.collection(COLLECTION).doc(OLD_ID);
  const newRef = db.collection(COLLECTION).doc(NEW_ID);

  // 1. 기존 데이터 가져오기
  const doc = await oldRef.get();
  if (!doc.exists) {
    console.error("❌ 오류: 기존 문서를 찾을 수 없습니다.");
    return;
  }

  const data = doc.data();

  // 2. 새 이름으로 데이터 저장 (복사)
  // (이왕 옮기는 김에 role이나 데이터가 맞는지 한 번 더 확인해서 저장)
  await newRef.set({
    ...data, // 기존 데이터 유지
    uid_pretty: "04 87 A3 42 20 68 80" // 화면 표시용은 공백 유지
  });

  // 3. 기존 문서 삭제
  await oldRef.delete();

  console.log("✅ 문서 이름 변경 완료!");
  console.log(`기존 ${OLD_ID} 문서는 삭제되었고,`);
  console.log(`새로운 ${NEW_ID} 문서가 생성되었습니다.`);
}

main().catch(console.error);