/* src/KioskApp.js */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { 
  ScreenHome, ScreenMenu, ScreenConfirm, 
  ScreenFulfillment, ScreenPayment, ScreenProcessing, ScreenDone 
} from './components/KioskScreens';

const API_URL = "http://localhost:8080";

export default function KioskApp() {
  // ====== 상태 관리 ======
  const [screen, setScreen] = useState('home'); 
  const [status, setStatus] = useState('');
  
  const [menus, setMenus] = useState([]);
  const [top3, setTop3] = useState(null); // 추천 메뉴 데이터
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ★ 핵심: 현재 로그인한 사용자 ID (이게 있으면 로그인 상태)
  const [currentUid, setCurrentUid] = useState(null); 

  // 주문 정보 상태
  const [selectedId, setSelectedId] = useState(null);
  const [temp, setTemp] = useState('hot');
  const [cup, setCup]   = useState('basic');
  const [dine, setDine] = useState('dinein'); 

  const selectedMenu = menus.find(m => m.id === selectedId);

  // ====== 1. 초기화 & 메뉴 로딩 ======
  useEffect(() => {
    axios.get(`${API_URL}/api/menus`)
      .then(res => setMenus(res.data))
      .catch(err => console.error("메뉴 로딩 실패:", err));
  }, []);

  // ====== 2. 소켓 연결 (NFC 감지) ======
  useEffect(() => {
    const socket = io(API_URL);
    socket.on('nfc_event', (data) => {
      if (data.type === 'TAG_ON') {
        setTop3(data.top3);
        setCurrentUid(data.uid); // ★ UID 저장 (로그인!)
        
        // 태그 시 자동으로 '추천 메뉴' 모드로 진입
        setSelectedCategory('recommend'); 
        setScreen(prev => prev === 'home' ? 'nfc' : prev);
        setStatus(`${data.uid}님, 환영합니다!`);
      }
    });
    return () => socket.disconnect();
  }, []);

  // ====== 3. 결제 및 주문 전송 ======
  useEffect(() => {
    if (screen === 'processing') {
      const payload = {
        uid: currentUid || "GUEST", // ★ 로그인 상태면 UID, 아니면 GUEST
        menuId: selectedId,
        menuName: selectedMenu ? selectedMenu.name : "알수없음",
        options: { temp, cup, dine }
      };

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
  }, [screen]);


  // ====== 4. 화면 전환 핸들러 (여기가 중요!) ======

  // A. 완전 초기화 (로그아웃) - '처음으로' 버튼
  const handleLogout = () => {
    setScreen('home');
    setTop3(null);
    setSelectedCategory(null);
    setSelectedId(null);
    
    setCurrentUid(null); // ★ UID 삭제 (완전 로그아웃)
    setStatus('');       // 환영 메시지 삭제
    
    setTemp('hot');
    setCup('basic');
  };

  // B. 로그인 유지하고 홈으로 (다른 메뉴 주문) - '다른 메뉴' 버튼
  const handleOrderOther = () => {
    setScreen('home');
    setTop3(null); 
    setSelectedCategory(null);
    // ★ currentUid는 건드리지 않음! (로그인 유지)
    // ★ status도 유지해서 "OOO님" 문구가 홈화면에 남아있게 함
  };

  // C. 카테고리 선택
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setScreen('nfc');
  };


  // ====== 5. 렌더링 라우터 ======
  
  if (screen === 'home') {
    // 로그인 상태면 문구 뒤에 (로그인됨) 표시 등 자유롭게 꾸밈
    return <ScreenHome onCategorySelect={handleCategorySelect} status={status} />;
  }
  
  if (screen === 'nfc') {
    let displayList = [];

    // 추천 모드
    if (selectedCategory === 'recommend') {
      if (top3 && top3.length > 0) {
        displayList = top3.map(t => {
          const original = menus.find(m => m.id === t.menu_id) || {};
          return { ...original, ...t };
        });
      } else {
        displayList = menus; 
      }
    } 
    // 일반 카테고리 모드
    else {
      displayList = menus.filter(m => m.category === selectedCategory);
    }

    return (
      <ScreenMenu 
        menus={menus}          
        top3={displayList}
        isRecommendMode={selectedCategory === 'recommend'} // 추천 화면인지 알려줌
        onSelect={(id) => { setSelectedId(id); setScreen('confirm'); }} 
        onLogout={handleLogout}         // ✖ 로그아웃
        onOrderOther={handleOrderOther} // 📋 다른 메뉴 (로그인 유지)
      />
    );
  }

  if (screen === 'confirm') {
    return <ScreenConfirm 
      selected={selectedMenu} temp={temp} setTemp={setTemp} cup={cup} setCup={setCup}
      onConfirm={() => setScreen('fulfillment')} 
      onBack={() => setScreen('nfc')}
    />;
  }

  if (screen === 'fulfillment') {
    return <ScreenFulfillment onSelect={(type) => { setDine(type); setScreen('payment'); }} />;
  }

  if (screen === 'payment') {
    return <ScreenPayment onSelect={() => setScreen('processing')} onBack={() => setScreen('fulfillment')} />;
  }

  if (screen === 'processing') return <ScreenProcessing />;
  
  // 결제 완료 후 '처음으로'를 누르면 로그아웃 시킴 (원하면 유지시켜도 됨)
  if (screen === 'done') return <ScreenDone onReset={handleLogout} />;

  return <div>로딩중...</div>;
}