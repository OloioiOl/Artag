// /* src/KioskApp.js */
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import io from 'socket.io-client';
// import { 
//   ScreenHome,
//   ScreenMenu,
//   ScreenConfirm,
//   ScreenOptions,
//   ScreenAdvOptions,
//   ScreenFinalConfirm,   // ✅ 새로 추가
//   ScreenPayment,
//   ScreenCard,
//   ScreenMobile,
//   ScreenProcessing,
//   ScreenDone 
// } from './components/KioskScreens';

// const API_URL = "http://localhost:8080";

// export default function KioskApp() {
//   // ====== 상태 관리 ======
//   const [screen, setScreen] = useState('home'); 
//   const [status, setStatus] = useState('');
  
//   const [menus, setMenus] = useState([]);
//   const [top3, setTop3] = useState(null); 
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [currentUid, setCurrentUid] = useState(null); 

//   // 주문 기본 옵션
//   const [selectedId, setSelectedId] = useState(null);
//   const [temp, setTemp] = useState('hot');
//   const [cup, setCup]   = useState('basic');
//   const [dine, setDine] = useState('takeout'); 
  
//   // 고급 옵션 (사이즈 / 샷 / 우유)
//   const [size, setSize] = useState('basic');     // basic | big | huge
//   const [shot, setShot] = useState(2);           // 기본 2샷
//   const [milk, setMilk] = useState('regular');   // regular | lowfat | soy | oat

//   // 결제 금액 (고급 옵션 반영)
//   const [finalPrice, setFinalPrice] = useState(null);

//   const [payMethod, setPayMethod] = useState('card');

//   const selectedMenu = menus.find(m => m.id === selectedId);

//   // ====== 1. 초기화 & 메뉴 로딩 ======
//   useEffect(() => {
//     axios.get(`${API_URL}/api/menus`)
//       .then(res => setMenus(res.data))
//       .catch(err => console.error("메뉴 로딩 실패:", err));
//   }, []);

//   // ====== 2. 소켓 연결 (NFC) ======
//   useEffect(() => {
//     const socket = io(API_URL);
    
//     socket.on('nfc_event', (data) => {
//       console.log("📡 소켓 수신:", data);

//       // [CASE A] 일반 회원 태그 (추천 모드)
//       if (data.type === 'TAG_ON') {
//         setTop3(data.top3);
//         setCurrentUid(data.uid); 
        
//         setSelectedCategory('recommend'); 
//         setScreen(prev => prev === 'home' ? 'nfc' : prev);
//         setStatus(`${data.uid}님, 환영합니다!`);
//       }
      
//       // [CASE B] 단일 메뉴 카드 태그 (바로 확인)
//       else if (data.type === 'TAG_MENU') {
//         setSelectedId(data.menu_id);
        
//         if (data.options) {
//           if (data.options.temp) setTemp(data.options.temp);
//           if (data.options.cup) setCup(data.options.cup);
//           if (data.options.takeout !== undefined) {
//             setDine(data.options.takeout ? 'takeout' : 'dinein');
//           }
//         }

//         setCurrentUid("GUEST"); 
//         setScreen('confirm');
//         setStatus("메뉴 카드가 인식되었습니다.");
//       }
//     });

//     return () => socket.disconnect();
//   }, []);

//   // ====== 3. 주문 전송 로직 ======
//   useEffect(() => {
//     if (screen === 'processing') {
//       const payload = {
//         uid: currentUid || "GUEST",
//         menuId: selectedId,
//         menuName: selectedMenu ? selectedMenu.name : "알수없음",
//         price: finalPrice ?? (selectedMenu?.price || 0),
//         options: { temp, cup, dine, size, shot, milk }
//       };

//       console.log("🚀 주문 전송 중:", payload);

//       axios.post(`${API_URL}/api/orders`, payload)
//         .then(res => {
//           console.log("✅ 주문 성공:", res.data);
//           setTimeout(() => setScreen('done'), 2000); 
//         })
//         .catch(err => {
//           console.error("❌ 주문 실패:", err);
//           alert("주문 처리에 실패했습니다.");
//           setScreen('home');
//         });
//     }
//   }, [screen]); // eslint 경고는 무시해도 됨

//   // ====== 4. 핸들러 ======

//   // 가상 태그 테스트
//   const handleVirtualTag = () => {
//     axios.post(`${API_URL}/api/test/tag`)
//       .then(res => {
//         console.log("🛠️ 가상 태그 요청 성공:", res.data);
//         if (res.data.type === 'MENU') alert("가상 메뉴 카드 태그됨!");
//         else alert("가상 유저 카드 태그됨!");
//       })
//       .catch(err => alert("테스트 실패: " + err));
//   };

//   const handleLogout = () => {
//     setScreen('home');
//     setTop3(null);
//     setSelectedCategory(null);
//     setSelectedId(null);
//     setCurrentUid(null);
//     setStatus('');

//     // 기본 옵션 리셋
//     setTemp('hot');
//     setCup('basic');
//     setDine('takeout');

//     // 고급 옵션 리셋
//     setSize('basic');
//     setShot(2);
//     setMilk('regular');
//     setFinalPrice(null);
//   };

//   const handleOrderOther = () => {
//     setScreen('home');
//     setTop3(null); 
//     setSelectedCategory(null);
//   };

//   const handleCategorySelect = (category) => {
//     setSelectedCategory(category);
//     setScreen('nfc');
//   };

//   const handleDirectOrder = () => {
//     setScreen('payment'); 
//   };

//   // ====== 5. 렌더링 라우터 ======
  
//   if (screen === 'home') {
//     return (
//       <ScreenHome 
//         onCategorySelect={handleCategorySelect} 
//         status={status}
//         onDebugClick={handleVirtualTag}
//       />
//     );
//   }
  
//   if (screen === 'nfc') {
//     let displayData = [];
//     if (selectedCategory === 'recommend') {
//       if (top3 && top3.length > 0) {
//         displayData = top3.map(t => {
//           const original = menus.find(m => m.id === t.menu_id) || {};
//           return { ...original, ...t };
//         });
//       } else {
//         displayData = menus; 
//       }
//     } else {
//       displayData = menus.filter(m => m.category === selectedCategory);
//     }

//     return (
//       <ScreenMenu 
//         items={displayData}
//         isRecommendMode={selectedCategory === 'recommend'}
//         onSelect={(id) => { setSelectedId(id); setScreen('confirm'); }} 
//         onBack={handleLogout}         
//         onOrderOther={handleOrderOther}
//       />
//     );
//   }

//   if (screen === 'confirm') {
//     return (
//       <ScreenConfirm 
//         selected={selectedMenu} 
//         temp={temp} 
//         cup={cup}
//         onDirectOrder={handleDirectOrder} 
//         onChangeOptions={() => setScreen('options')} 
//       />
//     );
//   }

//   // 온도/받는 방식 기본 옵션
//   if (screen === 'options') {
//     return (
//       <ScreenOptions
//         temp={temp} setTemp={setTemp}
//         dine={dine} setDine={setDine}
//         setCup={setCup}
//         onOrder={() => setScreen('finalConfirm')}      // 기본 옵션만 쓰고 바로 결제
//         onMoreOptions={() => setScreen('advOptions')} // ✅ 고급 옵션으로
//         onBack={() => setScreen('confirm')}
//       />
//     );
//   }

//   // 고급 옵션 (사이즈/샷/우유)
//   if (screen === 'advOptions') {
//     return (
//       <ScreenAdvOptions
//         basePrice={selectedMenu?.price || 0}
//         size={size} setSize={setSize}
//         shot={shot} setShot={setShot}
//         milk={milk} setMilk={setMilk}
//         onCancel={() => setScreen('options')}
//         onApply={(total) => {
//           setFinalPrice(total);
//           setScreen('finalConfirm');        // ✅ 최종 확인 화면으로 이동
//         }}
//       />
//     );
//   }

//   // 옵션까지 포함한 최종 확인 화면
//   if (screen === 'finalConfirm') {
//   return (
//     <ScreenFinalConfirm
//       selected={selectedMenu}
//       temp={temp}
//       dine={dine}
//       size={size}
//       shot={shot}
//       milk={milk}

//       // ✅ 그대로 주문하기 → 바로 카드 결제 화면으로
//       onDirectOrder={() => {
//         setPayMethod('card');   // 결제 방식 상태도 카드로 고정
//         setScreen('card');      // ScreenCard 로 바로 이동
//       }}

//       // 온도·포장 바꾸기 → 기본 옵션 화면으로
//       onBack={() => setScreen('options')}

//       // 다른 메뉴 선택하기 → 메뉴 선택 화면으로
//       onChangeMenu={() => {
//         setSelectedId(null);
//         setScreen('nfc');
//       }}
//     />
//   );
// }



//   if (screen === 'payment') {
//     return (
//       <ScreenPayment 
//         onSelectCard={() => { setPayMethod('card'); setScreen('card'); }}
//         onSelectMobile={() => { setPayMethod('mobile'); setScreen('mobile'); }}
//       />
//     );
//   }

//   if (screen === 'card') {
//     return (
//       <ScreenCard 
//         payAmount={finalPrice ?? (selectedMenu?.price || 0)}
//         onProcess={() => setScreen('processing')} 
//         onBack={() => setScreen('payment')}
//         onShowOrder={() => setScreen('finalConfirm')}
//       />
//     );
//   }

//   if (screen === 'mobile') {
//     return (
//       <ScreenMobile 
//         payAmount={finalPrice ?? (selectedMenu?.price || 0)}
//         onProcess={() => setScreen('processing')} 
//         onBack={() => setScreen('payment')}
//         onShowOrder={() => setScreen('finalConfirm')}
//       />
//     );
//   }

//   if (screen === 'processing') {
//     return <ScreenProcessing payMethod={payMethod} onCancel={handleLogout} />;
//   }
  
//   if (screen === 'done') {
//     return <ScreenDone onReset={handleLogout} />;
//   }

//   return <div>키오스크 로딩중...</div>;
// }

