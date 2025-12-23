/* src/KioskApp.js */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { 
  ScreenHome, ScreenMenu, ScreenConfirm, 
  ScreenOptions, ScreenPayment, ScreenCard, ScreenMobile,
  ScreenProcessing, ScreenDone 
} from './components/KioskScreens';

const API_URL = "http://localhost:8080";

export default function KioskApp() {
  // ====== 상태 관리 ======
  // 화면 흐름: home -> nfc -> confirm -> options -> payment -> card/mobile -> processing -> done
  const [screen, setScreen] = useState('home'); 
  const [status, setStatus] = useState('');
  
  const [menus, setMenus] = useState([]);
  const [top3, setTop3] = useState(null); // 서버에서 받은 추천 메뉴
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ★ 로그인 상태 (NFC 태그 시 설정됨)
  const [currentUid, setCurrentUid] = useState(null); 

  // 주문 정보 상태
  const [selectedId, setSelectedId] = useState(null);
  const [temp, setTemp] = useState('hot');
  const [cup, setCup]   = useState('basic');
  const [dine, setDine] = useState('takeout'); // 기본값 설정
  
  // 결제 수단 (UI 표시용)
  const [payMethod, setPayMethod] = useState('card');

  const selectedMenu = menus.find(m => m.id === selectedId);

  // ====== 1. 초기화 & 메뉴 로딩 (그대로 유지) ======
  useEffect(() => {
    axios.get(`${API_URL}/api/menus`)
      .then(res => setMenus(res.data))
      .catch(err => console.error("메뉴 로딩 실패:", err));
  }, []);

  // ====== 2. 소켓 연결 (NFC 감지 - 그대로 유지) ======
  useEffect(() => {
    const socket = io(API_URL);
    socket.on('nfc_event', (data) => {
      if (data.type === 'TAG_ON') {
        setTop3(data.top3);
        setCurrentUid(data.uid); 
        
        // 태그 시 자동으로 '추천 메뉴' 모드로 진입
        setSelectedCategory('recommend'); 
        setScreen(prev => prev === 'home' ? 'nfc' : prev);
        setStatus(`${data.uid}님, 환영합니다!`);
      }
    });
    return () => socket.disconnect();
  }, []);

  // ====== 3. 결제 및 주문 전송 (Trigger 시점 변경됨) ======
  useEffect(() => {
    // 'processing' 화면에 진입하면 자동으로 서버에 주문 전송
    if (screen === 'processing') {
      const payload = {
        uid: currentUid || "GUEST",
        menuId: selectedId,
        menuName: selectedMenu ? selectedMenu.name : "알수없음",
        options: { temp, cup, dine }
      };

      console.log("🚀 주문 전송 중:", payload);

      axios.post(`${API_URL}/api/orders`, payload)
        .then(res => {
          console.log("✅ 주문 성공:", res.data);
          setTimeout(() => setScreen('done'), 2000); // 2초 후 완료 화면
        })
        .catch(err => {
          console.error("❌ 주문 실패:", err);
          alert("주문 처리에 실패했습니다.");
          setScreen('home');
        });
    }
  }, [screen]);


  // ====== 4. 화면 전환 핸들러 (New Flow 적용) ======

  // A. 완전 초기화 (로그아웃)
  const handleLogout = () => {
    setScreen('home');
    setTop3(null);
    setSelectedCategory(null);
    setSelectedId(null);
    setCurrentUid(null); // 로그아웃
    setStatus('');
    // 옵션 초기화
    setTemp('hot');
    setCup('basic');
    setDine('takeout');
  };

  // B. 로그인 유지하고 홈으로 (다른 메뉴 주문)
  const handleOrderOther = () => {
    setScreen('home');
    setTop3(null); 
    setSelectedCategory(null);
    // currentUid 유지
  };

  // C. 카테고리 선택
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setScreen('nfc');
  };

  // D. 바로 주문하기 (기본값으로 결제 수단 선택 화면 이동)
  const handleDirectOrder = () => {
    // 기본 옵션 확인 (필요시 여기서 강제 설정 가능)
    setScreen('payment'); 
  };


  // ====== 5. 렌더링 라우터 (업그레이드) ======
  
  if (screen === 'home') {
    return <ScreenHome onCategorySelect={handleCategorySelect} status={status} />;
  }
  
  if (screen === 'nfc') {
    let displayData = [];

    // [핵심 로직 1] 추천 모드일 때: top3 데이터와 전체 메뉴(menus)를 합칩니다(Hydration).
    if (selectedCategory === 'recommend') {
      if (top3 && top3.length > 0) {
        displayData = top3.map(t => {
          // top3의 menu_id와 일치하는 원본 메뉴 정보를 찾습니다.
          const original = menus.find(m => m.id === t.menu_id) || {};
          // 원본 정보(가격,이모지)에 추천 정보(순위 등)를 덮어씌워 반환
          return { ...original, ...t };
        });
      } else {
        // 추천 데이터가 아직 없으면 빈 배열 혹은 전체 메뉴 보여주기
        displayData = menus; 
      }
    } 
    // [핵심 로직 2] 일반 카테고리 모드일 때: 해당 카테고리만 필터링
    else {
      displayData = menus.filter(m => m.category === selectedCategory);
    }

    return (
      <ScreenMenu 
        items={displayData}  // ★ 수정됨: menus/top3를 따로 주지 않고 완성된 'items'만 줍니다.
        isRecommendMode={selectedCategory === 'recommend'}
        onSelect={(id) => { setSelectedId(id); setScreen('confirm'); }} 
        onBack={handleLogout}         
        onOrderOther={handleOrderOther}
      />
    );
  }

  if (screen === 'confirm') {
    return <ScreenConfirm 
      selected={selectedMenu} 
      temp={temp} 
      cup={cup}
      onDirectOrder={handleDirectOrder} // "그대로 주문하기" -> 결제수단 선택
      onChangeOptions={() => setScreen('options')} // "옵션 변경" -> 옵션 화면
    />;
  }

  // ★ New: 통합된 옵션 화면
  if (screen === 'options') {
    return <ScreenOptions
      temp={temp} setTemp={setTemp}
      dine={dine} setDine={setDine}
      setCup={setCup} // 내부에서 포장/매장 선택 시 컵도 자동 설정됨
      onOrder={() => setScreen('payment')} // 변경 후 결제수단 선택으로
      onBack={() => setScreen('confirm')}
    />;
  }

  // ★ New: 결제 수단 선택 화면
  if (screen === 'payment') {
    return <ScreenPayment 
      onSelectCard={() => { setPayMethod('card'); setScreen('card'); }}
      onSelectMobile={() => { setPayMethod('mobile'); setScreen('mobile'); }}
    />;
  }

  // ★ New: 카드 결제 시뮬레이션 화면
  if (screen === 'card') {
    return <ScreenCard 
      onProcess={() => setScreen('processing')} // 화면 터치 시 결제 진행
      onBack={() => setScreen('payment')}
    />;
  }

  // ★ New: 모바일 결제 시뮬레이션 화면
  if (screen === 'mobile') {
    return <ScreenMobile 
      onProcess={() => setScreen('processing')} // 화면 터치 시 결제 진행
      onBack={() => setScreen('payment')}
    />;
  }

  // 주문 처리 중 (API 호출)
  if (screen === 'processing') return <ScreenProcessing />;
  
  // 완료 화면
  if (screen === 'done') return <ScreenDone onReset={handleLogout} />;

  return <div>키오스크 로딩중...</div>;
}