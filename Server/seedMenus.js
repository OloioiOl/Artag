const admin = require("firebase-admin");

// 1. 서비스 계정 키 가져오기
// (같은 폴더에 serviceAccountKey.json 파일이 있어야 합니다)
let serviceAccount;
try {
  serviceAccount = require("./serviceAccountKey.json");
} catch (e) {
  console.error("❌ 오류: serviceAccountKey.json 파일을 찾을 수 없습니다.");
  process.exit(1);
}

// 2. 파이어베이스 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// 3. 업로드할 풍성한 메뉴 데이터 📋
const MENUS = [
  // ☕ COFFEE
  { id: 'americano', name: '아메리카노', price: 4500, emoji: '🥤', category: 'coffee' },
  { id: 'latte', name: '카페라떼', price: 5000, emoji: '☕', category: 'coffee' },
  { id: 'vanilla_latte', name: '바닐라 라떼', price: 5500, emoji: '🍨', category: 'coffee' },
  { id: 'cappuccino', name: '카푸치노', price: 5000, emoji: '☁️', category: 'coffee' },
  { id: 'mocha', name: '카페 모카', price: 5800, emoji: '🍫', category: 'coffee' },
  { id: 'coldbrew', name: '콜드브루', price: 5200, emoji: '🧊', category: 'coffee' },
  { id: 'espresso', name: '에스프레소', price: 4000, emoji: '☕️', category: 'coffee' },
  // test 물
  { id: 'water', name: '물', price: 4000, emoji: '☕️', category: 'coffee' },

  // 🍹 BEVERAGE (Non-Coffee, Ade, Tea)
  { id: 'choco_latte', name: '초코 라떼', price: 5500, emoji: '🍫', category: 'beverage' },
  { id: 'greentea_latte', name: '녹차 라떼', price: 5800, emoji: '🍵', category: 'beverage' },
  { id: 'strawberry_latte', name: '딸기 라떼', price: 6000, emoji: '🍓', category: 'beverage' },
  { id: 'lemonade', name: '레몬 에이드', price: 5500, emoji: '🍋', category: 'beverage' },
  { id: 'grapefruit_ade', name: '자몽 에이드', price: 5800, emoji: '🍊', category: 'beverage' },
  { id: 'iced_tea', name: '복숭아 아이스티', price: 4500, emoji: '🍑', category: 'beverage' },
  { id: 'chamomile', name: '캐모마일 티', price: 4500, emoji: '🌼', category: 'beverage' },
  { id: 'peppermint', name: '페퍼민트 티', price: 4500, emoji: '🌿', category: 'beverage' },

  // 🧁 DESSERT (Bread, Cake)
  { id: 'croffle', name: '플레인 크로플', price: 3500, emoji: '🧇', category: 'dessert' },
  { id: 'cheese_cake', name: '치즈 케이크', price: 6500, emoji: '🧀', category: 'dessert' },
  { id: 'choco_cake', name: '초코 케이크', price: 6500, emoji: '🍰', category: 'dessert' },
  { id: 'bagel_cream', name: '베이글&크림치즈', price: 4500, emoji: '🥯', category: 'dessert' },
  { id: 'macaron', name: '마카롱(랜덤)', price: 2500, emoji: '🍭', category: 'dessert' },
  { id: 'sandwich', name: '햄치즈 샌드위치', price: 5500, emoji: '🥪', category: 'dessert' },
];

// 4. 데이터 업로드 함수
async function seedDatabase() {
  console.log(`🚀 메뉴 데이터 업로드를 시작합니다... (총 ${MENUS.length}개)`);
  
  const batch = db.batch(); // 한 번에 묶어서 전송 (효율적)

  MENUS.forEach((menu) => {
    // menu.id를 문서 이름으로 사용 (찾기 쉽도록)
    const docRef = db.collection('menus').doc(menu.id);
    batch.set(docRef, menu);
  });

  try {
    await batch.commit();
    console.log("✅ DB 구축 성공! 'menus' 컬렉션이 생성되었습니다.");
    console.log("👉 이제 Firebase Console에서 데이터를 확인해보세요.");
  } catch (error) {
    console.error("❌ 업로드 실패:", error);
  }
}

seedDatabase();