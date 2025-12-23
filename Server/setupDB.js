/**
 * setupDB.js (Enhanced Version)
 * - 모든 카드의 하위 컬렉션(orders)까지 완벽하게 제거 후 초기화
 */
const admin = require('firebase-admin');

// 1. Firebase 접속
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// 상수 설정
const COLLECTION = "nfc_uids";
const TARGET_UID = "1D264114091080"; // 시나리오를 적용할 타겟 유저

// ★ [중요] 실제 DB의 메뉴 ID와 일치시켜주세요!
const MENUS = {
  LATTE: "latte",       
  CAKE: "cheese_cake",       
  ICED_TEA: "iced_tea" 
};

async function main() {
  console.log("🚀 [Factory Reset] DB 완전 초기화 및 시딩 시작...");
  
  // 전체 문서를 가져옵니다.
  const snapshot = await db.collection(COLLECTION).get();
  
  // 메인 업데이트를 위한 배치
  let batch = db.batch();
  let opCount = 0; // 배치 작업 수 카운트 (500개 제한 방지용)

  console.log(`총 ${snapshot.size}개의 카드를 검사합니다.`);

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const docRef = db.collection(COLLECTION).doc(doc.id);
    const subCollectionPath = `${COLLECTION}/${doc.id}/orders`;

    // 🧹 [STEP 1] 무조건 하위 컬렉션(orders)부터 비웁니다.
    // (메뉴판이든, 삭제할 유저든, 타겟 유저든 과거의 주문 기록은 모두 삭제)
    await deleteCollection(db, subCollectionPath, 100);
    
    // ---

    // 🎯 [STEP 2-A] 타겟 유저 (1D264114091080) 세팅
    if (doc.id.replace(/\s/g, '') === TARGET_UID.replace(/\s/g, '')) {
      console.log(`🎯 [타겟 유저] 발견: ${doc.id} -> 데이터 초기화`);
      batch.set(docRef, {
        uid_pretty: "1D 26 41 14 09 10 80",
        role: "USER",
        scan_count: 23, // 10+8+5
        last_seen: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // 🍔 [STEP 2-B] 메뉴판 카드 변환 (fixed_menu_id가 있는 경우)
    else if (data.fixed_menu_id) {
      console.log(`🍔 [메뉴판 변환] ${doc.id} -> ${data.fixed_menu_id}`);
      
      const updateData = {
        role: "MENU",
        uid_pretty: data.uid_pretty || doc.id,
        fixed_menu_id: data.fixed_menu_id,
        fixed_options: data.fixed_options || { temp: "hot", cup: "basic" },
        // 불필요 필드 삭제
        scan_count: admin.firestore.FieldValue.delete(),
        last_seen: admin.firestore.FieldValue.delete(),
        is_americano_card: admin.firestore.FieldValue.delete(),
        is_fixed_menu_card: admin.firestore.FieldValue.delete(),
        orders: admin.firestore.FieldValue.delete()
      };
      batch.update(docRef, updateData);
    } 

    // 🗑️ [STEP 2-C] 그 외 잡다한 기록 삭제
    else {
      console.log(`🗑️ [삭제] ${doc.id} (일반/테스트 기록)`);
      batch.delete(docRef);
    }

    opCount++;
    // 배치는 500개까지만 가능하므로 중간 커밋 (안전장치)
    if (opCount >= 400) {
      await batch.commit();
      batch = db.batch();
      opCount = 0;
    }
  }

  // 남은 배치 실행
  if (opCount > 0) await batch.commit();
  console.log("✨ 1차 정리 완료 (하위 컬렉션 삭제 + 역할 부여)");


  // === [STEP 3] 타겟 유저의 가짜 주문 기록(Seeding) 생성 ===
  console.log("📦 타겟 유저 주문 기록(Seeding) 생성 중...");
  
  const targetRef = db.collection(COLLECTION).doc(TARGET_UID);
  
  // 주문 생성 헬퍼
  const createOrders = async (menuId, count) => {
    const promises = [];
    for (let i = 0; i < count; i++) {
      promises.push(
        targetRef.collection("orders").add({
          menu_id: menuId,
          menu_name: "Test Menu", 
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          options: { temp: "hot", cup: "basic" } 
        })
      );
    }
    await Promise.all(promises);
  };

  await createOrders(MENUS.LATTE, 10);
  await createOrders(MENUS.CAKE, 8);
  await createOrders(MENUS.ICED_TEA, 5);

  console.log(`✅ 모든 작업 완료! DB가 깨끗해졌습니다.`);
}


// 🔥 하위 컬렉션 삭제 함수 (재귀적이지 않음, 단일 레벨 삭제)
async function deleteCollection(db, collectionPath, batchSize) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(db, query, resolve) {
  const snapshot = await query.get();
  const batchSize = snapshot.size;
  if (batchSize === 0) {
    resolve();
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}

main().catch(console.error);