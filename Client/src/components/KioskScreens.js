import React from 'react';

// ====== 유틸리티 (헬퍼 함수) ======
export function eulReul(word = '') {
  const ch = word.charCodeAt(word.length - 1);
  if (isNaN(ch) || ch < 0xac00 || ch > 0xd7a3) return '를';
  const jong = (ch - 0xac00) % 28; 
  return jong === 0 ? '를' : '을';
}

export const hoverify = (base, hover) => ({
  onMouseOver: (e) => (e.currentTarget.style.backgroundColor = hover),
  onMouseOut:  (e) => (e.currentTarget.style.backgroundColor = base),
});

// ====== 1. 홈 화면 ======
export function ScreenHome({ onCategorySelect, status }) {
  // DB의 category 필드명과 일치시키는 것이 핵심!
  const categories = [
    { id: 'coffee', label: '커피', icon: '☕' },
    { id: 'beverage', label: '음료', icon: '🥤' },
    { id: 'dessert', label: '빵 / 디저트', icon: '🍰' },
    { id: 'recommend', label: '추천 메뉴', icon: '⭐' }, // 'recommend'는 특수 로직 처리
  ];

  return (
    <div style={{ height: '100vh', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 생략 (기존과 동일) */}
      <div style={{ textAlign: 'center', margin: '40px 0 30px' }}>
        <div style={{ fontSize: 40, fontWeight: 800, color: '#0f7132', marginBottom: 8 }}>환영합니다 😊</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#111827' }}>원하는 메뉴를 선택해주세요</div>
        <div style={{ marginTop: 14, fontSize: 16, color: '#6b7280' }}>{status || "화면을 터치하거나 카드를 태그하세요"}</div>
      </div>

      <div style={{ flex: 1, padding: '0 50px 50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 30, maxWidth: 1000, width: '100%' }}>
          {categories.map((cat) => (
            <button key={cat.id} 
              // 클릭 시 카테고리 ID를 상위(App.js)로 전달!
              onClick={() => onCategorySelect(cat.id)}
              style={{ backgroundColor: '#166534', color: 'white', borderRadius: 30, padding: 80, border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, boxShadow: '0 12px 28px rgba(0,0,0,0.25)' }}
              {...hoverify('#166534', '#15803d')}
            >
              <div style={{ fontSize: 80 }}>{cat.icon}</div>
              <span style={{ fontSize: 36, fontWeight: 'bold' }}>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ====== 2. 메뉴 선택 (NFC) 화면 ======
export function ScreenMenu({ menus, top3, onSelect, onBack, onOrderOther }) { // onOrderOther 추가됨
  const displayList = (top3 && top3.length > 0) ? top3 : menus;
  const isRecommendation = (top3 && top3.length > 0);

  return (
    <div style={{ height: '100vh', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20, position: 'relative' }}>
      
      {/* 오른쪽 상단: 로그아웃(완전 처음으로) 버튼 */}
      <div style={{ position: 'absolute', top: 30, right: 30 }}>
         <button onClick={onBack} style={{ padding: '12px 24px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 'bold', cursor: 'pointer' }} {...hoverify('#ef4444', '#dc2626')}>✖ 로그아웃</button>
      </div>

      <div style={{ width: '100%', maxWidth: 1000 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ fontSize: 32, fontWeight: 'bold' }}>
            {isRecommendation ? "회원님을 위한 추천 메뉴 😊" : "메뉴를 선택해주세요"}
          </div>
          {/* 추천 화면일 때만 보이는 버튼 */}
          {isRecommendation && (
            <div style={{ marginTop: 10 }}>
              <button onClick={onOrderOther} style={{ padding: '10px 20px', backgroundColor: 'white', border: '2px solid #166534', color: '#166534', borderRadius: 20, fontWeight: 'bold', cursor: 'pointer' }}>
                📋 다른 메뉴 주문하기 (카테고리)
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 20, marginBottom: 24 }}>
          {/* ... (메뉴 리스트 렌더링 부분 기존과 동일) ... */}
          {displayList.map((item) => {
             /* 기존 렌더링 코드 유지 */
             return (
              <button key={item.id} onClick={() => onSelect(item.id)}
                style={{ backgroundColor: 'white', borderRadius: 24, overflow: 'hidden', border: '3px solid #1B5E20', boxShadow: '0 18px 28px rgba(0,0,0,0.25)', cursor: 'pointer', paddingBottom: 16 }}
              >
                <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72 }}>{item.emoji || '☕'}</div>
                <div style={{ padding: 12, textAlign: 'center' }}>
                  <div style={{ color: '#374151', fontSize: 16, fontWeight: 600 }}>{item.name}</div>
                  <div style={{ marginTop: 6, fontWeight: 'bold', fontSize: 18, color: '#0B3D0B' }}>{item.price ? item.price.toLocaleString() : 0}원</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ====== 3. 옵션 확인 화면 ======
export function ScreenConfirm({ selected, temp, cup, setTemp, setCup, onConfirm, onBack, onCancel }) {
  if (!selected) return null;
  const tempLabel = temp === 'hot' ? '따뜻한' : '시원한';
  const cupLabel  = cup === 'basic' ? '기본컵' : '테이크아웃컵';
  const tempColor = temp === 'hot' ? '#FF6B6B' : '#2986FF';

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 800, textAlign: 'center' }}>
        <div style={{ fontSize: 100, marginBottom: 20 }}>{selected.emoji}</div>
        <div style={{ fontSize: 28, fontWeight: 'bold' }}>
          <span style={{ color: tempColor }}>{tempLabel}</span> {selected.name} {eulReul(selected.name)}(을)<br/>
          {cupLabel}으로 준비해드릴까요?
        </div>
        <button onClick={onConfirm} style={{ marginTop: 24, width: '100%', padding: '16px', backgroundColor: '#166534', color: 'white', borderRadius: 16, fontSize: 20, border: 'none', cursor: 'pointer' }}>그대로 주문하기</button>
        
        <div style={{ marginTop: 14, display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onBack} style={{ padding: '14px', border: '1px solid #ddd', borderRadius: 14, cursor: 'pointer' }}>다른 메뉴</button>
          <div style={{ border: '1px solid #ddd', borderRadius: 14, padding: 10, display: 'flex', gap: 5 }}>
            <button onClick={() => setTemp('hot')} style={{ backgroundColor: temp==='hot'?'#ef4444':'#eee', color: temp==='hot'?'white':'black', border:'none', padding:'8px', borderRadius: 8 }}>Hot</button>
            <button onClick={() => setTemp('ice')} style={{ backgroundColor: temp==='ice'?'#3b82f6':'#eee', color: temp==='ice'?'white':'black', border:'none', padding:'8px', borderRadius: 8 }}>Ice</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ====== 4. 포장/매장 선택 화면 ======
export function ScreenFulfillment({ onSelect }) {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ fontSize: 40, fontWeight: 'bold', marginBottom: 60 }}>식사 장소를 선택해주세요</div>
      <div style={{ display: 'flex', gap: 40 }}>
        {/* 매장 */}
        <button onClick={() => onSelect('dinein')} 
          style={{ width: 300, height: 300, backgroundColor: '#FFFBE6', border: '2px solid #E6DFA8', borderRadius: 30, fontSize: 32, fontWeight: 'bold', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}
          {...hoverify('#FFFBE6', '#FFF5C0')}
        >
          <div style={{ fontSize: 80 }}>🍽️</div>
          매장 식사
        </button>
        {/* 포장 */}
        <button onClick={() => onSelect('takeout')} 
          style={{ width: 300, height: 300, backgroundColor: '#FFFBE6', border: '2px solid #E6DFA8', borderRadius: 30, fontSize: 32, fontWeight: 'bold', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}
          {...hoverify('#FFFBE6', '#FFF5C0')}
        >
          <div style={{ fontSize: 80 }}>🛍️</div>
          포장하기
        </button>
      </div>
    </div>
  );
}

// ====== 5. 결제 수단 선택 화면 ======
export function ScreenPayment({ onSelect, onBack }) {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ fontSize: 40, fontWeight: 'bold', marginBottom: 60 }}>결제 수단을 선택해주세요</div>
      <div style={{ display: 'flex', gap: 40 }}>
        <button onClick={() => onSelect('card')} 
          style={{ width: 260, height: 330, backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: 20, cursor: 'pointer' }}
        >
          <div style={{ fontSize: 80, marginTop: 60 }}>💳</div>
          <div style={{ fontSize: 28, fontWeight: 'bold', marginTop: 20, color: '#166534' }}>신용카드</div>
        </button>
        <button onClick={() => onSelect('mobile')} 
          style={{ width: 260, height: 330, backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: 20, cursor: 'pointer' }}
        >
          <div style={{ fontSize: 80, marginTop: 60 }}>📱</div>
          <div style={{ fontSize: 28, fontWeight: 'bold', marginTop: 20, color: '#166534' }}>모바일페이</div>
        </button>
      </div>
      <button onClick={onBack} style={{ marginTop: 40, padding: '12px 24px', border: '1px solid #ddd', borderRadius: 10, cursor: 'pointer' }}>뒤로가기</button>
    </div>
  );
}

// ====== 6. 결제 처리 중 (로딩) 화면 ======
export function ScreenProcessing() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: 80, height: 80, border: '8px solid #f3f3f3', borderTop: '8px solid #166534', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <div style={{ marginTop: 30, fontSize: 28, fontWeight: 'bold' }}>결제 승인 중입니다...</div>
      <div style={{ marginTop: 10, color: '#666' }}>잠시만 기다려주세요.</div>
    </div>
  );
}

// ====== 7. 주문 완료 화면 ======
export function ScreenDone({ onReset }) {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#166534', color: 'white' }}>
      <div style={{ fontSize: 100 }}>✅</div>
      <div style={{ fontSize: 48, fontWeight: 'bold', marginTop: 20 }}>주문이 완료되었습니다!</div>
      <div style={{ fontSize: 24, marginTop: 10, opacity: 0.9 }}>영수증을 챙겨주세요.</div>
      <button onClick={onReset} 
        style={{ marginTop: 60, padding: '20px 60px', backgroundColor: 'white', color: '#166534', fontSize: 24, fontWeight: 'bold', border: 'none', borderRadius: 50, cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
      >
        처음으로
      </button>
    </div>
  );
}