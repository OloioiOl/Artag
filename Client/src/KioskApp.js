/* src/KioskApp.js */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { 
  ScreenHome,
  ScreenMenu,
  ScreenConfirm,
  ScreenOptions,
  ScreenAdvOptions,
  ScreenFinalConfirm,  
  ScreenPayment,
  ScreenCard,
  ScreenMobile,
  ScreenProcessing,
  ScreenDone,
  ScreenCart,
  getPrice, //신규추가
  calcCartTotal
} from './components/KioskScreens';

const API_URL = "http://localhost:8080";

export default function KioskApp() {
  // 단일 메뉴 NFC 전용 플로우인지 여부
  const [isSingleFlow, setIsSingleFlow] = useState(false);

  // 장바구니 (단일 메뉴 카드용)
  const [cart, setCart] = useState([]); 
  // cart 원소 예시: { id, menu, qty, options: { temp, size, shot, milk } }

  // ====== 상태 관리 ======
  const [screen, setScreen] = useState('home'); 
  const [status, setStatus] = useState('');
  
  const [menus, setMenus] = useState([]);
  const [top3, setTop3] = useState(null); 
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentUid, setCurrentUid] = useState(null); 

  // 주문 기본 옵션
  const [selectedId, setSelectedId] = useState(null);
  const [temp, setTemp] = useState('hot');
  const [cup, setCup]   = useState('basic');
  const [dine, setDine] = useState('takeout'); 
  
  // 고급 옵션 (사이즈 / 샷 / 우유)
  const [size, setSize] = useState('basic');     // basic | big | huge
  const [shot, setShot] = useState(2);           // 기본 2샷
  const [milk, setMilk] = useState('regular');   // regular | lowfat | soy | oat

  // 결제 금액 (고급 옵션 반영)
  const [finalPrice, setFinalPrice] = useState(null);

  const [payMethod, setPayMethod] = useState('card');

  const selectedMenu = menus.find(m => m.id === selectedId);

  // 주문번호
  const [orderNumber, setOrderNumber] = useState(220);

  // 대기용
  const [pendingMenuTag, setPendingMenuTag] = useState(null);

  console.log("🟢 KioskApp 렌더, 현재 screen =", screen);


  // ====== 장바구니 핸들러 ======
  const handleCartQtyChange = (id, delta) => {
    setCart(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      )
    );
  };

  const handleCartRemove = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // ✅ 수정 버전
  const handleCartCheckout = (dineType) => {
    if (cart.length === 0) {
      alert("장바구니에 담긴 메뉴가 없습니다.");
      return;
    }

    const first = cart[0];

    // 장바구니 첫 메뉴를 기준으로 옵션 세팅
    setSelectedId(first.id);                       // 메뉴 ID
    setTemp(first.options?.temp || 'ice');
    setSize(first.options?.size || 'basic');
    setShot(first.options?.shot || 2);
    setMilk(first.options?.milk || 'regular');

    // 모달에서 고른 받을 방법 반영
    setDine(dineType);                             // 'takeout' | 'dinein'
    setCup(dineType === 'takeout' ? 'togo' : 'basic');

    setIsSingleFlow(true);                         // 단일메뉴 NFC 플로우
    setPayMethod('card');                          // 결제수단 카드로 고정
    setScreen('card');                             // ✅ 바로 카드 결제 화면으로 이동
  };



  // ====== 1. 초기화 & 메뉴 로딩 ======
  useEffect(() => {
    axios.get(`${API_URL}/api/menus`)
      .then(res => {
        console.log("🔥 [DEBUG] /api/menus 응답:", res.data);  // ✅ 이 줄만 추가
        setMenus(res.data);
      })
      .catch(err => console.error("메뉴 로딩 실패:", err));
  }, []);


  // ====== 2. 소켓 연결 (NFC) ======
  // ====== 2. 소켓 연결 (NFC) ======
  useEffect(() => {
    const socket = io(API_URL);

    socket.on("nfc_event", (data) => {
      console.log("소켓 수신:", data);
      console.log("현재 screen(before) =", screen);

      const { type } = data;

      // [CASE A] 일반 회원 태그 (개인화 NFC)
            // [CASE A] 일반 회원 태그 (개인화 NFC)
      if (type === "TAG_ON") {
        setTop3(data.top3);
        setCurrentUid(data.uid);

        setSelectedCategory("recommend");
       // ✅ 개인화 모드로 전환할 때는
       //    단일메뉴 플로우/장바구니 상태를 모두 초기화하고
       //    무조건 개인화 메뉴 화면으로 보낸다.
        setIsSingleFlow(false);
        setCart([]);
        setScreen("nfc");

        setStatus(`${data.uid}님, 환영합니다!`);
        return; // 여기서 끝
      }


      // [CASE B] 단일 메뉴 카드 태그
      if (type === "TAG_MENU" || type === "MENU") {
        console.log("👉 TAG_MENU 분기 진입");

        // 메뉴가 아직 안 불러졌으면 방어
        if (menus.length === 0) {
          console.warn("⏳ 메뉴 데이터 로딩 중입니다. 잠시 후 다시 시도해주세요.");
          return;
        }

        const menuId = data.menu_id; // 예: "coldbrew"
        console.log("단일 메뉴 카드 menuId:", menuId);
        console.log("현재 메뉴 ID 목록:", menus.map(m => m.id));

        const found = menus.find((m) => m.id === menuId);

        if (!found) {
          console.warn("❌ 단일 메뉴 카드에 해당하는 메뉴를 찾지 못했습니다:", menuId);
          setStatus("메뉴 정보를 찾을 수 없습니다.");
          return;
        }

        const baseOptions = {
          temp: data.options?.temp || "ice",
          size: data.options?.size || "basic",
          shot: data.options?.shot || 2,
          milk: data.options?.milk || "regular",
        };

        setIsSingleFlow(true);
        setCurrentUid("GUEST");

        setCart((prev) => {
          const existing = prev.find((item) => item.id === menuId);
          if (existing) {
            return prev.map((item) =>
              item.id === menuId ? { ...item, qty: item.qty + 1 } : item
            );
          }
          return [
            ...prev,
            {
              id: menuId,
              menu: found,
              qty: 1,
              options: baseOptions,
            },
          ];
        });

        console.log("🟢 setScreen('cart') 호출!");
        setScreen("cart");          // ✅ 여기서 화면을 cart 로 강제 변경
        setStatus("메뉴 카드가 인식되었습니다.");
        return;
      }

      // 혹시 모르는 타입
      console.log("❓ 알 수 없는 NFC 타입:", data);
    });

    return () => socket.disconnect();
  }, [menus, screen]);   // menus, screen 둘 다 의존성에 넣자






  // ====== 3. 주문 전송 로직 ======
  useEffect(() => {
    if (screen === 'processing') {

      let payload = {};

      if (isSingleFlow) {
        // ✅ [CASE 1] 장바구니 주문 (NFC 카드 모드)
        const totalAmount = calcCartTotal(cart);
        const firstItem = cart[0];
        
        // 메뉴 이름을 "아메리카노 외 N건" 형식으로 만듦
        const summaryName = cart.length > 1 
          ? `${firstItem.menu.name} 외 ${cart.length - 1}건`
          : firstItem.menu.name;

        payload = {
          uid: currentUid || "GUEST", // 보통 GUEST
          menuId: "CART_ORDER",       // 장바구니 주문임을 표시 (또는 firstItem.id)
          menuName: summaryName,      // "아메리카노 외 2건"
          price: totalAmount,         // ✅ 전체 합산 금액 전송!
          options: { 
             mode: 'cart_nfc',
             detail: cart // (선택) 나중에 상세 내역 필요하면 cart 배열 자체를 옵션에 저장
          }
        };

      } else {
        // ✅ [CASE 2] 일반 개별 주문 (기존 로직 유지)
        const calcPrice = finalPrice ?? getPrice(selectedMenu, temp);
        payload = {
          uid: currentUid || "GUEST",
          menuId: selectedId,
          menuName: selectedMenu ? selectedMenu.name : "알수없음",
          price: calcPrice,
          options: { temp, cup, dine, size, shot, milk }
        };
      }

      console.log("🚀 주문 전송 중:", payload);

      axios.post(`${API_URL}/api/orders`, payload)
        .then(res => {
          console.log("✅ 주문 성공:", res.data);
          setTimeout(() => setScreen('done'), 2000); 
        })
        .catch(err => {
          console.error("❌ 주문 실패:", err);
          alert("주문 처리에 실패했습니다.");
          setScreen('home');
        });
    }
  }, [screen]); // eslint 경고는 무시해도 됨


  // ====== 4. 핸들러 ======
  // 가상 태그 테스트
  const handleVirtualTag = () => {
    axios.post(`${API_URL}/api/test/tag`)
      .then(res => {
        console.log("🛠️ 가상 태그 요청 성공:", res.data);
        if (res.data.type === 'MENU') alert("가상 메뉴 카드 태그됨!");
        else alert("가상 유저 카드 태그됨!");
      })
      .catch(err => alert("테스트 실패: " + err));
  };

  const handleLogout = () => {
    setScreen('home');
    setTop3(null);
    setSelectedCategory(null);
    setSelectedId(null);
    setCurrentUid(null);
    setStatus('');

    // 기본 옵션 리셋
    setTemp('hot');
    setCup('basic');
    setDine('takeout');

    // 고급 옵션 리셋
    setSize('basic');
    setShot(2);
    setMilk('regular');
    setFinalPrice(null);


    // ✅ 단일메뉴 / 장바구니 상태도 같이 초기화
    setIsSingleFlow(false);
    setCart([]);
  };

  // ✅ 완료 화면에서 10초 후 / “처음으로” 눌렀을 때 호출
  const handleDoneReset = () => {
    setOrderNumber(prev => prev + 1);  // 주문번호 220 → 221 → 222 …
    handleLogout();                    // 화면/옵션 전체 초기화
  };

  const handleOrderOther = () => {
    setScreen('home');
    setTop3(null); 
    setSelectedCategory(null);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setScreen('nfc');
  };

  const handleDirectOrder = () => {
    setScreen('payment'); 
  };


  // ====== 5. 렌더링 라우터 ======
  
  if (screen === 'home') {
    return (
      <ScreenHome 
        onCategorySelect={handleCategorySelect} 
        status={status}
        onDebugClick={handleVirtualTag}
      />
    );
  }
  
  if (screen === 'nfc') {
    let displayData = [];
    let recommendTextMode = null; 
    if (selectedCategory === 'recommend') {
      if (top3 && top3.length > 0) {
        displayData = top3.map(t => {
          const original = menus.find(m => m.id === t.menu_id) || {};
          return { ...original, ...t };
        });
        recommendTextMode = 'personal';  // ⭐ 자주 드시던 메뉴 모드
      } else {
      // ⭐ [변경] 이름 대신 ID 목록을 사용 (DB에 저장된 정확한 id 입력 필수)
      const RECOMMEND_IDS = ['americano', 'latte', 'citron_tea','lemonade','misutgaru','piece_cake','castella','croffle','sandwich'];

      // id 기준으로 메뉴 객체 찾아서, 순서도 고정
      displayData = RECOMMEND_IDS
        .map((id) => menus.find((m) => m.id === id))
        .filter(Boolean); // 혹시 ID가 틀려서 못 찾은 경우(undefined) 제거
        
      recommendTextMode = 'today';     // ⭐ 오늘의 추천 메뉴 모드
    }
    } else {
      displayData = menus.filter(m => m.category === selectedCategory);
    }

    return (
      <ScreenMenu 
        items={displayData}
        isRecommendMode={selectedCategory === 'recommend'}
        recommendTextMode={recommendTextMode}    // ⭐ 새 props 전달
        onSelect={(id) => { setSelectedId(id); setScreen('confirm'); }} 
        onBack={handleLogout}         
        onOrderOther={handleOrderOther}
      />
    );
  }

  if (screen === 'confirm') {
    return (
      <ScreenConfirm 
        selected={selectedMenu} 
        temp={temp} 
        cup={cup}
        onDirectOrder={handleDirectOrder} 
        onChangeOptions={() => setScreen('options')} 
      />
    );
  }

  // 온도/받는 방식 기본 옵션
  if (screen === 'options') {
    return (
      <ScreenOptions
        temp={temp} setTemp={setTemp}
        dine={dine} setDine={setDine}
        setCup={setCup}
        onOrder={() => setScreen('finalConfirm')}    // 기본 옵션만 쓰고 바로 결제
        onMoreOptions={() => setScreen('advOptions')} // ✅ 고급 옵션으로
        onBack={() => setScreen('confirm')}
      />
    );
  }

  // 고급 옵션 (사이즈/샷/우유)
  if (screen === 'advOptions') {

    return (
      <ScreenAdvOptions
        menu={selectedMenu}
        temp={temp}
        size={size} setSize={setSize}
        shot={shot} setShot={setShot}
        milk={milk} setMilk={setMilk}
        onCancel={() => setScreen('options')}
        onApply={(total) => {
          setFinalPrice(total);
          setScreen('finalConfirm');        // ✅ 최종 확인 화면으로 이동
        }}
      />
    );
  }


  // ───────── cart: 단일 메뉴 NFC 장바구니 화면 ─────────
  if (screen === 'cart') {
  console.log("🛒 ScreenCart 렌더링!");
  return (
    <ScreenCart
      cart={cart}
      onQtyChange={handleCartQtyChange}
      onRemove={handleCartRemove}
      onReset={handleLogout}
      onCheckout={handleCartCheckout}
    />
  );
}



  // 옵션까지 포함한 최종 확인 화면
  if (screen === 'finalConfirm') {
  return (
    <ScreenFinalConfirm
      selected={selectedMenu}
      temp={temp}
      dine={dine}
      size={size}
      shot={shot}
      milk={milk}

      // ✅ 그대로 주문하기 → 바로 카드 결제 화면으로
      onDirectOrder={() => {
        setPayMethod('card');   // 결제 방식 상태도 카드로 고정
        setScreen('card');      // ScreenCard 로 바로 이동
      }}

      // 온도·포장 바꾸기 → 기본 옵션 화면으로
      onBack={() => setScreen('options')}

      // 다른 메뉴 선택하기 → 메뉴 선택 화면으로
      onChangeMenu={() => {
        setSelectedId(null);
        setScreen('nfc');
      }}
    />
  );
}



  if (screen === 'payment') {
    return (
      <ScreenPayment 
        onSelectCard={() => { setPayMethod('card'); setScreen('card'); }}
        onSelectMobile={() => { setPayMethod('mobile'); setScreen('mobile'); }}
      />
    );
  }

 const billPrice = isSingleFlow 
  ? calcCartTotal(cart) 
  : (finalPrice ?? getPrice(selectedMenu, temp));

  if (screen === 'card') {
    return (
      <ScreenCard
        payAmount={billPrice}
        onProcess={() => setScreen('processing')}
        onBack={() => setScreen('payment')}
        onShowOrder={() => {
          // 단일메뉴 NFC → 장바구니 / 개인화 NFC → 기존 최종확인 화면
          if (isSingleFlow) setScreen('cart');
          else setScreen('finalConfirm');
        }}
      />
    );
  }


  if (screen === 'mobile') {
    return (
      <ScreenMobile
        payAmount={billPrice}
        onProcess={() => setScreen('processing')}
        onBack={() => setScreen('payment')}
        onShowOrder={() => setScreen('finalConfirm')}
      />
    );
  }

    if (screen === 'processing') {
    return (
      <ScreenProcessing
        payMethod={payMethod}
        onCancel={() => setScreen('payment')}
      />
    );
  }

  if (screen === 'done') {
    return (
    <ScreenDone
    orderNumber={orderNumber}      // 주문번호
    onReset={handleDoneReset}      // 처음으로
    enableStamp={isSingleFlow}     // ✅ 단일메뉴 NFC일 때만 도장/전화번호 화면 활성화
    />
  );
}




  // 이 아래는 딱 한 줄만 남기기
  return <div>키오스크 로딩중...</div>;
}