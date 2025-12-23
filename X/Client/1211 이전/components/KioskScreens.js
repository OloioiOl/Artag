/* src/components/KioskScreens.js */
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

// ====== 1. 홈 화면 (ScreenHome) ======
export function ScreenHome({ onCategorySelect, status }) {
  // ★ Backend API의 카테고리 ID와 UI를 매핑합니다.
  const categories = [
    { id: 'coffee', label: '커피', icon: '☕🥐🧁' },
    { id: 'beverage', label: '음료', icon: '🥤🧃🍹' },
    { id: 'dessert', label: '빵 / 디저트', icon: '🍰🧁🥐' },
    { id: 'recommend', label: '추천 메뉴', icon: '⭐✨🌟' },
  ];

  return (
    <div style={{ height: '100vh', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      {/* 언어 선택 (Design only) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: 20 }}>
        <button style={{ padding: '10px 20px', backgroundColor: 'white', border: '2px solid #3b82f6', borderRadius: 10, cursor: 'pointer', fontSize: 14 }}>🇺🇸 English</button>
        <button style={{ padding: '10px 20px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: 10, cursor: 'pointer', fontSize: 14 }}>🇨🇳 中文</button>
        <button style={{ padding: '10px 20px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: 10, cursor: 'pointer', fontSize: 14 }}>🇰🇷 한국</button>
      </div>

      <div style={{ textAlign: 'center', margin: '40px 0 30px' }}>
        <div style={{ fontSize: 40, fontWeight: 800, color: '#0f7132', marginBottom: 8 }}>환영합니다 😊</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#111827' }}>원하는 메뉴를 선택해주세요</div>
        <div style={{ marginTop: 14, fontSize: 16, color: '#6b7280' }}>{status || "화면을 터치하거나 카드를 태그하세요"}</div>
      </div>

      <div style={{ flex: 1, padding: '0 50px 50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 30, maxWidth: 1000, width: '100%' }}>
          {categories.map((cat) => (
            <button key={cat.id} 
              onClick={() => onCategorySelect(cat.id)} // ★ 부모에게 ID 전달
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

// ====== 2. 메뉴 선택 화면 (ScreenMenu) ======
export function ScreenMenu({ items, onSelect, onBack, onOrderOther, isRecommendMode }) {
  // 이제 items는 부모(App.js)가 이미 필터링과 데이터 결합을 끝낸 상태입니다.
  
  return (
    <div style={{ height: '100vh', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20, position: 'relative' }}>
      
      {/* 로그아웃/초기화 버튼 */}
      <div style={{ position: 'absolute', top: 30, right: 30 }}>
         <button onClick={onBack} style={{ padding: '12px 24px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 'bold', cursor: 'pointer' }} {...hoverify('#ef4444', '#dc2626')}>✖ 초기화</button>
      </div>

      <div style={{ width: '100%', maxWidth: 1000 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ fontSize: 32, fontWeight: 'bold' }}>
            {isRecommendMode ? "회원님을 위한 추천 메뉴 😊" : "메뉴를 선택해주세요"}
          </div>
          {isRecommendMode && (
            <div style={{ marginTop: 10 }}>
              <button onClick={onOrderOther} style={{ padding: '10px 20px', backgroundColor: 'white', border: '2px solid #166534', color: '#166534', borderRadius: 20, fontWeight: 'bold', cursor: 'pointer' }}>
                📋 전체 메뉴 보기 (로그인 유지)
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 20, marginBottom: 24 }}>
          {/* items 배열이 비어있을 경우 예외처리 */}
          {items && items.length > 0 ? items.map((item) => {
             // 데이터 안전장치: 가격이나 이모지가 없으면 기본값 표시
             const price = item.price ? item.price.toLocaleString() : '0';
             const emoji = item.emoji || '☕'; 
             const name = item.name || '로딩 중...';

             return (
              <button key={item.id || Math.random()} onClick={() => onSelect(item.id)}
                style={{ backgroundColor: 'white', borderRadius: 24, overflow: 'hidden', border: '3px solid #1B5E20', boxShadow: '0 18px 28px rgba(0,0,0,0.25)', cursor: 'pointer', paddingBottom: 16 }}
              >
                <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72 }}>{emoji}</div>
                <div style={{ padding: 12, textAlign: 'center' }}>
                  <div style={{ color: '#374151', fontSize: 16, fontWeight: 600 }}>{name}</div>
                  <div style={{ marginTop: 6, fontWeight: 'bold', fontSize: 18, color: '#0B3D0B' }}>{price}원</div>
                </div>
              </button>
            );
          }) : (
            <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: 40, color: '#666' }}>
              표시할 메뉴가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ====== 3. 메뉴 확인 (ScreenConfirm) ======
export function ScreenConfirm({ selected, temp, cup, onDirectOrder, onChangeOptions }) {
  if (!selected) return null;
  const tempLabel = temp === 'hot' ? '따뜻한' : '시원한';
  const cupLabel  = cup === 'basic' ? '기본컵' : '테이크아웃컵';
  const tempColor = temp === 'hot' ? '#FF6B6B' : '#2986FF';
  const name = selected.name;

  return (
    <div style={{ height: '100vh', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 800, textAlign: 'center' }}>
        <div style={{ height: 180, width: 180, backgroundColor: 'white', margin: '0 auto', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100, boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }}>
          {selected.emoji}
        </div>
        <div style={{ marginTop: 24, fontSize: 28, fontWeight: 'bold', lineHeight: 1.35 }}>
          <span style={{ color: tempColor, fontWeight: 800 }}>{tempLabel}</span> {name}{eulReul(name)}
        </div>
        <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700 }}>{cupLabel}으로 준비해드릴까요?</div>

        <button onClick={onDirectOrder} style={{ marginTop: 24, width: '100%', padding: '16px 20px', backgroundColor: '#166534', color: 'white', border: 'none', borderRadius: 16, fontSize: 20, fontWeight: 'bold', cursor: 'pointer' }} {...hoverify('#166534', '#0f5132')}>
          그대로 주문하기
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginTop: 14 }}>
          <button onClick={onChangeOptions} style={{ padding: '14px 16px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: 14, fontWeight: 700, cursor: 'pointer' }}>
            온도, 포장 바꾸기
          </button>
        </div>
      </div>
    </div>
  );
}

// ====== 4. 옵션 선택 (ScreenOptions - 통합됨) ======
export function ScreenOptions({ temp, setTemp, dine, setDine, setCup, onOrder, onBack }) {
  return (
    <div style={{ height: '100vh', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 360, textAlign: 'center' }}>
        
        {/* 온도 선택 */}
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>온도를 선택해주세요</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
          <button onClick={() => setTemp('ice')} style={{ flex: 1, padding: '16px 12px', borderRadius: 16, border: temp === 'ice' ? '3px solid #1d4ed8' : '2px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer', fontSize: 18, fontWeight: 600 }}>
            <div style={{ fontSize: 30, marginBottom: 4 }}>🧊</div> 차갑게
          </button>
          <button onClick={() => setTemp('hot')} style={{ flex: 1, padding: '16px 12px', borderRadius: 16, border: temp === 'hot' ? '3px solid #f97316' : '2px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer', fontSize: 18, fontWeight: 600 }}>
            <div style={{ fontSize: 30, marginBottom: 4 }}>🔥</div> 따뜻하게
          </button>
        </div>

        {/* 식사 방법 선택 */}
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>받을 방법을 선택해주세요</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
          <button onClick={() => { setDine('takeout'); setCup('togo'); }} style={{ flex: 1, padding: '18px 12px', borderRadius: 16, border: dine === 'takeout' ? '3px solid #0f5132' : '2px solid #e5e7eb', backgroundColor: '#f9fafb', cursor: 'pointer', fontSize: 18, fontWeight: 600 }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>🛍️</div> 포장하기
          </button>
          <button onClick={() => { setDine('dinein'); setCup('basic'); }} style={{ flex: 1, padding: '18px 12px', borderRadius: 16, border: dine === 'dinein' ? '3px solid #0f5132' : '2px solid #e5e7eb', backgroundColor: '#f9fafb', cursor: 'pointer', fontSize: 18, fontWeight: 600 }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>🍽️</div> 먹고 가기
          </button>
        </div>

        {/* 주문 버튼 */}
        <button onClick={onOrder} style={{ width: '100%', padding: '14px 20px', backgroundColor: '#0f7132', borderRadius: 18, border: 'none', color: 'white', fontSize: 20, fontWeight: 800, marginBottom: 12, cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.25)' }} {...hoverify('#0f7132', '#0b5a27')}>
          변경 완료 및 주문
        </button>
        <button onClick={onBack} style={{ width: '100%', padding: '12px 20px', backgroundColor: '#e5e7eb', borderRadius: 18, border: 'none', color: '#4b5563', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
          취소
        </button>
      </div>
    </div>
  );
}

// ====== 5. 결제 수단 선택 (ScreenPayment) ======
export function ScreenPayment({ onSelectCard, onSelectMobile }) {
  return (
    <div style={{ height: '100vh', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 900, textAlign: 'center' }}>
        <div style={{ fontSize: 40, fontWeight: 800, marginBottom: 60 }}>
          <span style={{ color: '#0b4a23' }}>결제 수단</span>을 선택해주세요
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 50 }}>
          <button onClick={onSelectCard} style={{ width: 260, height: 330, backgroundColor: '#fdf6d6', border: '1px solid #f5e7a9', borderRadius: 20, boxShadow: '0 8px 15px rgba(0,0,0,0.15)', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ fontSize: 80, marginBottom: 12 }}>💳</div>
            <div style={{ fontSize: 30, fontWeight: 'bold', color: '#0b4a23' }}>카드</div>
          </button>
          <button onClick={onSelectMobile} style={{ width: 260, height: 330, backgroundColor: '#fdf6d6', border: '1px solid #f5e7a9', borderRadius: 20, boxShadow: '0 8px 15px rgba(0,0,0,0.15)', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 10 }}>
            <div style={{ fontSize: 80, marginBottom: 12 }}>📱</div>
            <div style={{ fontSize: 30, fontWeight: 'bold', color: '#0b4a23' }}>모바일 페이</div>
            <div style={{ marginTop: 10, fontSize: 16, color: '#333', lineHeight: 1.4 }}>카카오 / 네이버 / 기프티콘</div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ====== 6. 결제 상세 화면 (ScreenCard / ScreenMobile) ======
export function ScreenCard({ onProcess, onBack }) {
  return (
    <div style={{ height: '100vh', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={onProcess}>
      <div style={{ width: '100%', maxWidth: 1024, textAlign: 'center' }}>
        <div style={{ fontSize: 40, fontWeight: 'bold', marginBottom: 80, lineHeight: 1.4 }}>
          <span style={{ color: '#0f7132' }}>신용카드</span>를 넣어 주세요
        </div>
        <div style={{ fontSize: 140 }}>💳</div>
        <div style={{ marginTop: 40 }}><button onClick={(e) => { e.stopPropagation(); onBack(); }} style={{ padding: '20px 40px', backgroundColor: '#0f7132', borderRadius: 24, border: 'none', color: 'white', fontSize: 22, fontWeight: 700, cursor: 'pointer' }}>다른 수단으로 결제하기</button></div>
      </div>
    </div>
  );
}

export function ScreenMobile({ onProcess, onBack }) {
  return (
    <div style={{ height: '100vh', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={onProcess}>
      <div style={{ width: '100%', maxWidth: 1024, textAlign: 'center' }}>
        <div style={{ fontSize: 40, fontWeight: 'bold', marginBottom: 80, lineHeight: 1.4 }}>
          <span style={{ color: '#0f7132' }}>바코드</span>를 인식해주세요
        </div>
        <div style={{ fontSize: 140 }}>📲</div>
        <div style={{ marginTop: 40 }}><button onClick={(e) => { e.stopPropagation(); onBack(); }} style={{ padding: '20px 40px', backgroundColor: '#0f7132', borderRadius: 24, border: 'none', color: 'white', fontSize: 22, fontWeight: 700, cursor: 'pointer' }}>다른 수단으로 결제하기</button></div>
      </div>
    </div>
  );
}

// ====== 7. 로딩 및 완료 (ScreenProcessing / ScreenDone) ======
export function ScreenProcessing() {
  return (
    <div style={{ height: '100vh', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>결제 진행중…</div>
        <div style={{ margin: '20px auto 10px', width: 80, height: 80, borderRadius: '50%', border: '8px solid #d1fae5', borderTopColor: '#10b981', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
      </div>
    </div>
  );
}

export function ScreenDone({ onReset }) {
  return (
    <div style={{ height: '100vh', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20, textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: 100 }}>✅</div>
        <div style={{ fontSize: 40, fontWeight: 'bold', marginBottom: 10 }}>주문 완료!</div>
        <button onClick={onReset} style={{ marginTop: 40, padding: '14px 40px', backgroundColor: '#166534', color: 'white', border: 'none', borderRadius: 14, fontSize: 18, fontWeight: 'bold', cursor: 'pointer' }}>처음으로</button>
      </div>
    </div>
  );
}