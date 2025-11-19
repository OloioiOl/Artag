import React, { useEffect, useState } from 'react';
import { db } from './firebaseConfig'; 
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore"; 

/* 샘플 메뉴 데이터 */
const DRINKS = [
  { id: 'americano', name: '아메리카노', price: 4500, emoji: '🥤' },
  { id: 'latte', name: '라떼', price: 5200, emoji: '☕' },
  { id: 'coldbrew', name: '콜드브루', price: 5000, emoji: '🧋' },
];

/* 백엔드 설정 (리더기 ID 일치 필수) */
const SESSION_COLLECTION = "kiosk_sessions";
const KIOSK_ID = "ACS_ACR122_0"; 

/* 헬퍼 함수들 */
function eulReul(word = '') {
  const ch = word.charCodeAt(word.length - 1);
  if (isNaN(ch) || ch < 0xac00 || ch > 0xd7a3) return '를';
  const jong = (ch - 0xac00) % 28; 
  return jong === 0 ? '를' : '을';
}

const hoverify = (base, hover) => ({
  onMouseOver: (e) => (e.currentTarget.style.backgroundColor = hover),
  onMouseOut:  (e) => (e.currentTarget.style.backgroundColor = base),
});

export default function KioskApp() {
  const [screen, setScreen] = useState('home');
  const [status, setStatus] = useState(''); 
  
  const [selectedId, setSelectedId] = useState(null);
  const [temp, setTemp] = useState('hot');
  const [cup, setCup]   = useState('basic');
  const [dine, setDine] = useState(null);
  const [payMethod, setPayMethod] = useState(null); 
  
  /* 백엔드 추천 메뉴 */
  const [top3Menu, setTop3Menu] = useState(null);
  const selected = DRINKS.find(d => d.id === selectedId) || null;

  /* 세션 초기화 (Firestore 정리) */
  const clearSession = async () => {
    try {
      const sessionRef = doc(db, SESSION_COLLECTION, KIOSK_ID);
      await setDoc(sessionRef, {
        screen: "HOME", 
        updated_at: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error("세션 초기화 실패:", e);
    }
  };

  /* 초기화 (화면 리셋) */
  const resetAll = () => {
    setScreen('home'); 
    setStatus('');
    setSelectedId(null); 
    setTemp('hot'); 
    setCup('basic'); 
    setDine(null);
    setPayMethod(null);
    setTop3Menu(null); 
    
    // 수동 초기화 시에도 Firestore 상태 동기화
    clearSession();
  };

  /* 📡 Firestore 실시간 감지 (정석 로직 복원) */
  useEffect(() => {
    const sessionRef = doc(db, SESSION_COLLECTION, KIOSK_ID);
    
    // 구독 시작
    const unsubscribe = onSnapshot(sessionRef, (docSnap) => {
      if (!docSnap.exists()) {
        setStatus(`기기 연결 확인 필요 (${KIOSK_ID})`);
        return;
      }
      
      const data = docSnap.data();
      console.log("백엔드 데이터 수신:", data);

      // 1. 카드 태그 신호 (TOP3)
      if (data.screen === "TOP3") {
        setTop3Menu(data.top3 || []); 
        if (data.uid_pretty) {
          setStatus(`${data.uid_pretty}님, 반가워요!`);
        }
        // 홈 화면일 때만 이동 (중복 이동 방지)
        if (screen === 'home') {
          setScreen('nfc');
        }
      }
      // 2. 초기화 신호 (HOME)
      else if (data.screen === "HOME") {
        console.log("백엔드 리셋 신호 수신 -> 초기화");
        // 무한 루프 방지를 위해 현재 화면이 home이 아닐 때만 실행
        if (screen !== 'home') {
            setScreen('home');
            // resetAll()을 여기서 호출하면 clearSession() 때문에 루프 돌 수 있으므로 상태만 리셋
            setSelectedId(null);
            setTop3Menu(null);
        }
      }
    }, (error) => {
      console.error("Firestore 구독 오류:", error);
    });
    
    return () => unsubscribe();
  }, [screen]); 

  /* 결제 완료 자동 타이머 */
  useEffect(() => {
    if (screen !== 'processing') return;
    const t = setTimeout(() => setScreen('done'), 2000);
    return () => clearTimeout(t);
  }, [screen]);


  /* ───────────────── 1) 처음화면 ───────────────── */
  if (screen === 'home') {
    return (
      <div style={{ height: '100vh', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
        {/* 언어 선택 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: 20 }}>
          <button style={{ padding: '10px 20px', backgroundColor: 'white', border: '2px solid #3b82f6', borderRadius: 10, cursor: 'pointer', fontSize: 14 }}>🇺🇸 English</button>
          <button style={{ padding: '10px 20px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: 10, cursor: 'pointer', fontSize: 14 }}>🇨🇳 中文</button>
          <button style={{ padding: '10px 20px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: 10, cursor: 'pointer', fontSize: 14 }}>🇰🇷 한국</button>
        </div>

        {/* 헤더 */}
        <div style={{ textAlign: 'center', margin: '40px 0 30px' }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: '#0f7132', marginBottom: 8 }}>
            환영합니다 😊
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#111827' }}>
            원하는 메뉴를 선택해주세요
          </div>
          
          {/* 상태 메시지 */}
          <div style={{ marginTop: 14, fontSize: 16, color: '#6b7280' }}>
             {status || "NFC 카드를 태그해주세요..."}
          </div>
        </div>

        {/* 카테고리 */}
        <div style={{ flex: 1, padding: '0 50px 50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 30, maxWidth: 1000, width: '100%' }}>
            {['커피', '음료', '빵 / 디저트', '추천 메뉴'].map((label, idx) => (
              <button key={label}
                style={{
                  backgroundColor: '#166534',
                  color: 'white',
                  borderRadius: 30,
                  padding: 80,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 20,
                  boxShadow: '0 12px 28px rgba(0,0,0,0.25)'  
                }}
                {...hoverify('#166534', '#15803d')}
                onClick={() => setScreen('nfc')}
              >
                <div style={{ fontSize: 80 }}>{idx===0?'☕🥐🧁':idx===1?'🥤🧃🍹':idx===2?'🍰🧁🥐':'⭐✨🌟'}</div>
                <span style={{ fontSize: 36, fontWeight: 'bold' }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: 20, textAlign: 'center', borderTop: '1px solid #eee', color: '#999' }}>
          전용 NFC 카드를 리더기에 태그하면 주문이 시작됩니다.
        </div>
      </div>
    );
  }

  /* ───────────────── 2) 메뉴 리스트 ───────────────── */
  if (screen === 'nfc') {
    const menuToShow = top3Menu && top3Menu.length > 0 ? top3Menu : DRINKS;

    return (
      <div style={{ height: '100vh', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20, position: 'relative' }}>
        
        {/* 뒤로가기 버튼 */}
        <div style={{ position: 'absolute', top: 30, right: 30 }}>
           <button 
             onClick={resetAll}
             style={{
               padding: '12px 24px',
               backgroundColor: '#ef4444', 
               color: 'white',
               border: 'none',
               borderRadius: 12,
               fontSize: 16,
               fontWeight: 'bold',
               cursor: 'pointer'
             }}
             {...hoverify('#ef4444', '#dc2626')}
           >
             ✖ 처음으로
           </button>
        </div>

        <div style={{ width: '100%', maxWidth: 1000 }}>
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>
              {top3Menu ? "회원님을 위한 추천 메뉴 😊" : "메뉴를 선택해주세요"}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 20, marginBottom: 24 }}>
            {menuToShow.map((d) => {
              const rawId = d.id || d.menu_id;
              const fallbackDrink = DRINKS.find(dr => dr.id === rawId);
              
              const menuItem = {
                id: rawId,
                name: d.name || d.menu_name || fallbackDrink?.name || "이름 없음",
                price: d.price || fallbackDrink?.price || 0,
                emoji: d.emoji || fallbackDrink?.emoji || '🥤'
              };

              return (
                <button
                  key={menuItem.id}
                  onClick={() => {
                    setSelectedId(menuItem.id);
                    setScreen('confirm');
                  }}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 24,
                    overflow: 'hidden',
                    border: '3px solid',
                    borderColor: selectedId === menuItem.id ? '#0B3D0B' : '#1B5E20',
                    boxShadow: '0 18px 28px rgba(0, 0, 0, 0.25)', 
                    cursor: 'pointer',
                    paddingBottom: 16
                  }}
                >
                  <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72 }}>
                    {menuItem.emoji}
                  </div>
                  <div style={{ padding: 12, textAlign: 'center' }}>
                    <div style={{ color: '#374151', fontSize: 16, fontWeight: 600 }}>
                      {menuItem.name}
                    </div>
                    <div style={{ marginTop: 6, fontWeight: 'bold', fontSize: 18, color: '#0B3D0B' }}>
                      {menuItem.price.toLocaleString('ko-KR')}원
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            style={{ width: '100%', padding: '16px 20px', backgroundColor: '#166534', color: 'white', border: 'none', borderRadius: 16, fontSize: 20, fontWeight: 'bold', cursor: 'pointer' }}
            {...hoverify('#166534', '#0f5132')}
          >
            전체 메뉴 보기
          </button>
        </div>
      </div>
    );
  }

  /* ───────────────── 3) 메뉴 옵션 선택 (confirm) ───────────────── */
  if (screen === 'confirm') {
    const tempLabel = temp === 'hot' ? '따뜻한' : '시원한'; 
    const cupLabel  = cup === 'basic' ? '기본컵' : '테이크아웃컵';
    const name = selected ? selected.name : '';
    const tempColor = temp === 'hot' ? '#FF6B6B' : '#2986FF';

    return (
      <div style={{ height: '100vh', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 800, textAlign: 'center' }}>
          <div style={{ height: 180, width: 180, backgroundColor: 'white', margin: '0 auto', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100, boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }}>
            {selected ? selected.emoji : '❓'}
          </div>
          <div style={{ marginTop: 24, fontSize: 28, fontWeight: 'bold', lineHeight: 1.35 }}>
            <span style={{ color: tempColor, fontWeight: 800 }}>{tempLabel}</span>{' '}
            {name} {eulReul(name)}(을)
          </div>
          <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700 }}>{cupLabel}으로 준비해드릴까요?</div>

          <button
            onClick={() => setScreen('fulfillment')}
            style={{ marginTop: 24, width: '100%', padding: '16px 20px', backgroundColor: '#166534', color: 'white', border: 'none', borderRadius: 16, fontSize: 20, fontWeight: 'bold', cursor: 'pointer' }}
            {...hoverify('#166534', '#0f5132')}
          >
            그대로 주문하기
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginTop: 14 }}>
            <button
              onClick={() => setScreen('nfc')}
              style={{ padding: '14px 16px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              다른 메뉴 선택하기
            </button>
            <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>온도·컵 바꾸기</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                {[
                  { on: temp === 'hot', label: '따뜻한', set: () => setTemp('hot') },
                  { on: temp === 'ice', label: '시원한', set: () => setTemp('ice') },
                  { on: cup === 'basic', label: '기본컵', set: () => setCup('basic') },
                  { on: cup === 'togo', label: '테이크아웃컵', set: () => setCup('togo') }
                ].map(b => (
                  <button key={b.label} onClick={b.set}
                    style={{ padding: '10px 14px', borderRadius: 10, cursor: 'pointer', backgroundColor: b.on ? '#16a34a' : '#f3f4f6', color: b.on ? 'white' : '#111827', border: '1px solid #e5e7eb' }}>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ───────────────── 4) 포장 여부 ───────────────── */
  if (screen === 'fulfillment') {
    return (
      <div style={{ height: '100vh', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 960, textAlign: 'center' }}>
          <div style={{ fontSize: 48, fontWeight: 900, marginBottom: 12 }}>
            <span style={{ color: '#0F5132' }}>받을 방법</span><span>을 선택해주세요</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 60 }}>선택 후 결제가 시작됩니다.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 40, maxWidth: 800, margin: '0 auto' }}>
            <button onClick={() => { setDine('takeout'); setPayMethod('card'); setScreen('card'); }}
              style={{ backgroundColor: '#FFFBE6', border: '1px solid #E6DFA8', borderRadius: 20, padding: 50, width: '100%', cursor: 'pointer', boxShadow: '0 8px 18px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <div style={{ fontSize: 80 }}>🛍️</div>
              <div style={{ fontSize: 32, fontWeight: 'bold', color: '#0F5132' }}>가져가기</div>
            </button>
            <button onClick={() => { setDine('dinein'); setPayMethod('card'); setScreen('card'); }}
              style={{ backgroundColor: '#FFFBE6', border: '1px solid #E6DFA8', borderRadius: 20, padding: 50, width: '100%', cursor: 'pointer', boxShadow: '0 8px 18px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <div style={{ fontSize: 80 }}>🍽️</div>
              <div style={{ fontSize: 32, fontWeight: 'bold', color: '#0F5132' }}>먹고 가기</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ───────────────── 5) 결제수단 선택 ───────────────── */
  if (screen === "payment") {
    return (
      <div style={{ height: "100vh", backgroundColor: "#ffffff", display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}>
        <div style={{ width: "100%", maxWidth: 900, textAlign: "center" }}>
          <div style={{ fontSize: 40, fontWeight: "800", marginBottom: 60 }}>
            <span style={{ color: "#0b4a23" }}>결제 수단</span>을 선택해주세요
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 50 }}>
            <button onClick={() => { setPayMethod("card"); setScreen("card"); }}
              style={{ width: 260, height: 330, backgroundColor: "#fdf6d6", border: "1px solid #f5e7a9", borderRadius: 20, boxShadow: "0 8px 15px rgba(0,0,0,0.15)", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <div style={{ fontSize: 80, marginBottom: 12 }}>💳</div>
              <div style={{ fontSize: 30, fontWeight: "bold", color: "#0b4a23" }}>카드</div>
            </button>
            <button onClick={() => { setPayMethod("mobile"); setScreen("mobile"); }}
              style={{ width: 260, height: 330, backgroundColor: "#fdf6d6", border: "1px solid #f5e7a9", borderRadius: 20, boxShadow: "0 8px 15px rgba(0,0,0,0.15)", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 10 }}>
              <div style={{ fontSize: 80, marginBottom: 12 }}>📱</div>
              <div style={{ fontSize: 30, fontWeight: "bold", color: "#0b4a23" }}>모바일 페이</div>
              <div style={{ marginTop: 10, fontSize: 16, color: "#333", lineHeight: 1.4 }}>카카오 / 네이버 / 기프티콘 <br /> 금액권 등</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ───────────────── 6-A) 카드 결제 ───────────────── */
  if (screen === 'card') {
    return (
      <div style={{ height: '100vh', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1024, height: '100%', padding: '80px 80px 64px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 40, fontWeight: 'bold', marginBottom: 80, lineHeight: 1.4 }}>
            <span style={{ color: '#0f7132' }}>신용카드</span><span>를 넣어 주세요</span>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: 140 }}>💳</span>
          </div>
          <div style={{ marginTop: 40, marginBottom: 16 }}>
            <button onClick={() => setScreen('payment')}
              style={{ minWidth: 360, padding: '20px 40px', backgroundColor: '#0f7132', borderRadius: 24, border: 'none', color: '#ffffff', fontSize: 22, fontWeight: 700, boxShadow: '0 14px 24px rgba(0,0,0,0.25)', cursor: 'pointer' }}
              {...hoverify('#0f7132', '#0b5a27')}>
              다른 수단으로 결제하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ───────────────── 6-B) 모바일 결제 ───────────────── */
  if (screen === 'mobile') {
    return (
      <div style={{ height: '100vh', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1024, height: '100%', padding: '80px 80px 64px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 40, fontWeight: 'bold', lineHeight: 1.4, marginBottom: 80 }}>
            <span style={{ color: '#0f7132' }}>바코드</span><span>를 인식해주세요</span>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: 140 }}>📲</span>
          </div>
          <div style={{ marginTop: 40, marginBottom: 16 }}>
            <button onClick={() => setScreen('payment')}
              style={{ minWidth: 360, padding: '20px 40px', backgroundColor: '#0f7132', borderRadius: 24, border: 'none', color: '#ffffff', fontSize: 22, fontWeight: 700, boxShadow: '0 14px 24px rgba(0,0,0,0.25)', cursor: 'pointer' }}
              {...hoverify('#0f7132', '#0b5a27')}>
              다른 수단으로 결제하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ───────────────── 7) 처리중 ───────────────── */
  if (screen === 'processing') {
    return (
      <div style={{ height: '100vh', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 720, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>
            {payMethod === 'card' ? '카드 결제' : '모바일 페이 결제'} 진행중…
          </div>
          <div style={{ fontSize: 16, color: '#374151', marginBottom: 24 }}>결제가 처리되는 동안 잠시만 기다려주세요.</div>
          <div style={{ margin: '20px auto 10px', width: 80, height: 80, borderRadius: '50%', border: '8px solid #d1fae5', borderTopColor: '#10b981', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
          <div style={{ marginTop: 26 }}>
            <button onClick={() => setScreen('payment')}
              style={{ padding: '10px 14px', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 12, cursor: 'pointer' }}>
              취소
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ───────────────── 8) 완료 ───────────────── */
  if (screen === 'done') {
    const tempLabel = temp === 'hot' ? '따뜻한' : '아이스';
    const cupLabel  = cup  === 'basic' ? '기본컵' : '테이크아웃컵';
    const dineLabel = dine === 'takeout' ? '포장' : '매장';
    return (
      <div style={{ height: '100vh', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20, textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: 40, fontWeight: 'bold', marginBottom: 10 }}>주문 완료!</div>
          <div style={{ fontSize: 20, color: '#374151', marginBottom: 24 }}>
            {selected ? `${tempLabel} ${selected.name} · ${cupLabel} · ${dineLabel}` : '항목 없음'}
          </div>
          <button onClick={resetAll}
            style={{ padding: '14px 18px', backgroundColor: '#166534', color: 'white', border: 'none', borderRadius: 14, fontSize: 18, fontWeight: 'bold', cursor: 'pointer' }}
            {...hoverify('#166534', '#0f5132')}>
            처음으로
          </button>
        </div>
      </div>
    );
  }

  return null;
}