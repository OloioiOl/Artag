/* src/components/KioskScreens.js */
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// ====== 유틸 ======

// ✅ 가격 계산 헬퍼 함수
// 메뉴 객체와 현재 온도(temp)를 받아서 최종 가격을 반환합니다.
export function getPrice(menu, temp) {
  if (!menu) return 0;
  
  // 1. 기본 가격
  let finalPrice = menu.price || 0;

  // 2. 변동 가격(var_price)이 있고, 해당 온도(temp)에 설정된 가격이 있다면 덮어씌움
  if (menu.var_price && menu.var_price[temp]) {
    finalPrice = menu.var_price[temp];
  }

  return finalPrice;
}

// ✅ [신규 추가] 옵션 포함 전체 가격 계산 함수
export function calcTotalPrice(menu, temp, size, shot, milk) {
  // 1. 기본 가격 (Hot/Ice 반영)
  let price = getPrice(menu, temp);

  // 2. 사이즈 옵션
  if (size === 'big') price += 500;
  if (size === 'huge') price += 1000;

  // 3. 샷 추가 (기본 2샷 초과 시 500원씩)
  // shot이 undefined일 수 있으므로 기본값 2 처리
  const currentShot = shot || 2;
  const extraShotCost = Math.max(currentShot - 2, 0) * 500;
  price += extraShotCost;

  // 4. 우유 변경
  if (milk === 'lowfat') price += 500;
  if (milk === 'soy') price += 500;
  if (milk === 'oat') price += 500;

  return price;
}

// ✅ [신규 추가] 장바구니 총액 계산 함수
export function calcCartTotal(cart) {
  if (!cart || cart.length === 0) return 0;

  // 배열을 순회하며 (단가 × 수량)을 모두 더함
  return cart.reduce((acc, item) => {
    // 1. 아이템의 온도(temp)에 맞는 단가 가져오기
    const unitPrice = getPrice(item.menu, item.options.temp || 'hot');
    
    // 2. 수량(qty) 곱해서 누적
    return acc + (unitPrice * item.qty);
  }, 0);
}

export function eulReul(word = '') {
  const ch = word.charCodeAt(word.length - 1);
  if (isNaN(ch) || ch < 0xac00 || ch > 0xd7a3) return '를';
  const jong = (ch - 0xac00) % 28;
  return jong === 0 ? '를' : '을';
}

export const hoverify = (base, hover) => ({
  onMouseOver: (e) => (e.currentTarget.style.backgroundColor = hover),
  onMouseOut: (e) => (e.currentTarget.style.backgroundColor = base),
});

// ====== 기준 화면 크기 + 스케일 레이아웃 ======
const BASE_WIDTH = 1024;
const BASE_HEIGHT = 768;

export function ScaledLayout({ children }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const { innerWidth, innerHeight } = window;
      const scaleX = innerWidth / BASE_WIDTH;
      const scaleY = innerHeight / BASE_HEIGHT;
      const nextScale = Math.min(scaleX, scaleY);
      setScale(nextScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const scaledWidth = BASE_WIDTH * scale;
  const scaledHeight = BASE_HEIGHT * scale;

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: '#ffffff',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          width: scaledWidth,
          minHeight: scaledHeight,
        }}
      >
        <div
          style={{
            width: BASE_WIDTH,
            minHeight: BASE_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------
 * 1. 홈 화면
 * ------------------------------------------------- */
export function ScreenHome({ onCategorySelect, status, onDebugClick }) {
  const categories = [
    { id: 'coffee', label: '커피', icon: '☕🥐🧁' },
    { id: 'beverage', label: '음료', icon: '🥤🧃🍹' },
    { id: 'dessert', label: '빵 / 디저트', icon: '🍰🧁🥐' },
    { id: 'recommend', label: '추천 메뉴', icon: '⭐✨🌟' },
  ];

  return (
    <ScaledLayout>
      <div
        style={{
          height: '100%',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems:'center',
        }}
      >
        {/* 언어 선택 */}
        <div
          style={{
            width:'100%',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            padding: 20,
          }}
        >
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: 'white',
              border: '2px solid #ddd',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            🇺🇸 English
          </button>
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            🇨🇳 中文
          </button>
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: 'white',
              border: '1px solid #3b82f6',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 14,
              fontweight:'bold',
            }}
          >
            🇰🇷 한국
          </button>
        </div>

        {/* 헤더 + 가상 NFC 버튼 */}
        <div style={{ textAlign: 'center', margin: '20px 0 20px' }}>
          <div
            style={{
              fontSize: 60,
              fontWeight: 800,
              color: '#0A400C',
              marginBottom: 8,
            }}
          >
            환영합니다 😊
          </div>
          <div
            style={{
              fontSize: 70,
              fontWeight: 800,
              color: '#111827',
            }}
          >
            원하는 메뉴를 선택해주세요
          </div>
          <div
            style={{
              marginTop: 14,
              fontSize: 16,
              color: '#6b7280',
            }}
          >
            {status || '화면을 터치하거나 카드를 태그하세요'}
          </div>

          {onDebugClick && (
            <div style={{ marginTop: 16 }}>
              <button
                onClick={onDebugClick}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#F15151',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  opacity: 0.9,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
                }}
                {...hoverify('#F15151', '#dc2626')}
              >
                🛠️ (TEST) 가상 NFC 태그
              </button>
            </div>
          )}
        </div>

        {/* 카테고리 4개 */}
        <div
          style={{
            flex: 1,
            width:'100%',
            padding: '0 50px 50px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxSizing:'border-box',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 30,
              maxWidth: 1000,
              width: '100%',
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategorySelect && onCategorySelect(cat.id)}
                style={{
                  backgroundColor: '#0A400C',
                  color: 'white',
                  borderRadius: 30,
                  padding: 80,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 20,
                  boxShadow: '0 18px 32px rgba(0,0,0,0.28)',
                }}
                {...hoverify('#0A400C', '#0b5a27')}
              >
                <div style={{ fontSize: 76 }}>{cat.icon}</div>
                <span
                  style={{
                    fontSize: 52,
                    fontWeight: 'bold',
                  }}
                >
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>
        {/* 하단: 전용 카드 안내  */}
        <div
          style={{
            width: '100%',
            padding: '50px 0 120px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: 900,
              color: '#0f5132',
              letterSpacing: -0.5,
              textShadow: '0 2px 4px rgba(0,0,0,0.15)',
            }}
          >
            전용 카드로 간편 주문하기
          </div>

          <div
            style={{
              fontSize: 60,
              color: '#0f5132',
              fontWeight: 800,
              animation: 'arrowBounce 1.4s infinite ease-in-out',
              marginTop: 2,
            }}
          >
            ▼
          </div>

          <style>
            {`
              @keyframes arrowBounce {
                0% { transform: translateY(0); opacity: 0.7; }
                50% { transform: translateY(10px); opacity: 1; }
                100% { transform: translateY(0); opacity: 0.7; }
              }
            `}
          </style>
        </div>
      </div>
    </ScaledLayout>
  );
}

/* -------------------------------------------------
 * 2. 메뉴 선택 화면 (추천/카테고리 공통)
 * ------------------------------------------------- */
export function ScreenMenu({
  items,
  onSelect,
  onBack,
  onOrderOther,
  isRecommendMode,
  recommendTextMode,           // ⭐ 추가
}) {
  // ⭐ 추가: 추천 모드에 따른 타입 구분
  const mode = recommendTextMode || 'personal';
  const isTodayRecommend = isRecommendMode && mode === 'today';
  const isPersonalRecommend = isRecommendMode && mode === 'personal';
  return (
    <div
      style={{
        height: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2vh 2vw',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* 초기화 버튼 */}
      {onBack && (
        <div style={{ position: 'absolute', top: 30, right: 30 }}>
          <button
            onClick={onBack}
            style={{
              padding: '12px 24px',
              backgroundColor: '#F15151',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
            {...hoverify('#F15151', '#dc2626')}
          >
            ✖ 초기화
          </button>
        </div>
      )}

      <div
        style={{
          width: '100%',
          maxWidth: 1000,
          margin: '0 auto',
        }}
      >
        {/* 상단 문구 */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '3vh',
          }}
        >
          <div
            style={{
              fontSize: 'clamp(24px, 3.2vw, 32px)',
              fontWeight: 'bold',
            }}
          >
            {isRecommendMode ? (
              isTodayRecommend
                ? '오늘의 추천 메뉴입니다 ☕'          // ⭐ 오늘의 추천
                : '자주 드시던 메뉴를 준비했어요 😊'   // ⭐ 개인화 추천
            ) : (
              '메뉴를 선택해주세요'
            )}
          </div>
          <div
            style={{
              fontSize: 'clamp(18px, 2.2vw, 22px)',
              marginTop: '0.6vh',
            }}
          >
            {isRecommendMode ? (
              isTodayRecommend
                ? '따뜻하게 즐기기 좋은 오늘의 추천 메뉴 3가지입니다.' // ⭐ 오늘용 문구
                : '회원님의 취향을 반영한 추천 메뉴입니다'             // 기존 개인화 문구
            ) : (
              '원하는 메뉴를 선택해주세요'
            )}
          </div>
        </div>

        {/* 메뉴 카드 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 'clamp(12px, 2vw, 20px)',
            marginBottom: '2.4vh',
          }}
        >
          {items && items.length > 0 ? (
            items.map((item) => {
              const price = item.price || 0;

              const imgFileName = item.images 
                ? (item.images.hot || item.images.ice || item.images.only) 
                : null;
              const imgSrc = imgFileName ? `/images/menus/${imgFileName}` : null;
              const name = item.name || '메뉴';

              return (
                <button
                  key={item.id || name}
                  onClick={() => onSelect && onSelect(item.id)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 24,
                    overflow: 'hidden',
                    border: '3px solid #1B5E20',
                    boxShadow: '0 18px 28px rgba(0, 0, 0, 0.25)',
                    cursor: 'pointer',
                    paddingBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width:'100%',
                      height: 'clamp(110px, 16vh, 140px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'clamp(52px, 6vw, 72px)',
                    }}
                  >
                    
                    {imgSrc ? (
                      <img 
                        src={imgSrc} 
                        alt={name} 
                        style={{ 
                          width: '100%', height: '100%', 
                          objectFit: 'contain',}} 
                      />
                    ) : (
                      item.emoji || '☕' 
                    )}
                  </div>
                  <div
                    style={{
                      padding: 12,
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        color: '#374151',
                        fontSize: 'clamp(14px, 1.6vw, 16px)',
                        fontWeight: 600,
                        wordBreak: 'keep-all'
                      }}
                    >
                      {name}
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        fontWeight: 'bold',
                        fontSize: 'clamp(16px, 1.8vw, 18px)',
                        color: '#0B3D0B',
                      }}
                    >
                      {price.toLocaleString('ko-KR')}원
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div
              style={{
                gridColumn: 'span 3',
                textAlign: 'center',
                padding: 40,
                color: '#666',
              }}
            >
              표시할 메뉴가 없습니다.
            </div>
          )}
        </div>

        {/* 추천 모드일 때만 전체 메뉴 버튼 */}
        {isRecommendMode && onOrderOther && (
          <button
            onClick={onOrderOther}
            style={{
              width: '100%',
              padding: 'clamp(12px, 1.8vh, 16px) 20px',
              backgroundColor: '#0A400C',
              color: 'white',
              border: 'none',
              borderRadius: 16,
              fontSize: 'clamp(18px, 2.2vw, 20px)',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
            {...hoverify('#0A400C', '#0b5a27')}
          >
            📋 전체 메뉴 보기 (로그인 유지)
          </button>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------
 * 3. 메뉴 확인 화면
 * ------------------------------------------------- */
export function ScreenConfirm({ selected, temp, cup, dine, onDirectOrder, onChangeOptions, onChangeMenu,}) {
  if (!selected) return null;

  const tempLabel = temp === 'hot' ? '따뜻한' : '차가운';
  const cupLabel = cup === 'basic' ? '기본컵' : '테이크아웃컵';
  const tempColor = temp === 'hot' ? '#F15151' : '#0B51FF';
  const name = selected.name || '';

  // temp가 'hot'이면 selected.images.hot을, 'ice'면 selected.images.ice를 가져옴
  const imgFileName = selected.images 
  ? (selected.images[temp] || selected.images.only) : null
  const imgSrc = imgFileName ? `/images/menus/${imgFileName}` : null;

  const curPrice=getPrice(selected,temp);

  const dineValue = dine || 'takeout';
  const dinePrefix =
    dine === 'takeout' ? '매장에서 ' : '포장해서 ';
  const dineSuffix = '드시겠어요?';

  return (
    <ScaledLayout>
      <div
        style={{
          height: '100%',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 1000,
            textAlign: 'center',
          }}
        >
         {/* ⭐️ [수정] 이미지 영역 */}
          <div
            style={{
              width: 420,
              height: 420,
              borderRadius: 32,
              backgroundColor: '#ffffff',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 160,
              boxShadow: '0 22px 32px rgba(0,0,0,0.15)',
              overflow: 'hidden', // 이미지가 튀어나가지 않게
            }}
          >
            {imgSrc ? (
              <img 
                src={imgSrc} 
                alt={name}
                style={{ width: '80%', height: '80%', objectFit: 'contain' }} 
              />
            ) : (
              selected.emoji || '🍹'
            )}
          </div>

          {/* 1줄: 온도 + 메뉴명 + 조사 */}
          <div
            style={{
              marginTop: 36,
              lineHeight: 1.3,
              fontWeight: 900,
            }}
          >
            {/* 따뜻한 / 차가운 */}
            <span
              style={{
                fontSize: 56,
                color: tempColor,
                fontWeight: 900,
              }}
            >
              {tempLabel + ' '}
            </span>

            {/* 메뉴명 */}
            <span
              style={{
                fontSize: 56,
                color: '#0A400C',
                fontWeight: 900,
              }}
            >
              {name}
            </span>

            {/* 조사 를/을 */}
            <span
              style={{
                fontSize: 40,
                marginLeft: 4,
                color: '#111827',
                fontWeight: 800,
              }}
            >
              {eulReul(name)}
            </span>
          </div>

          {/* 2줄: 포장해서 / 매장에서 + 질문 */}
          <div
            style={{
              marginTop: 8,
              lineHeight: 1.3,
              fontWeight: 800,
            }}
          >
            <span
              style={{
                fontSize: 56,
                color: '#0A400C',
                fontWeight: 900,
              }}
            >
              {dinePrefix}
            </span>

            <span
              style={{
                fontSize: 40,
                marginLeft: 6,
                color: '#111827',
                fontWeight: 800,
              }}
            >
              {dineSuffix}
            </span>
          </div>

          {/* 그대로 주문하기 – 넓은 초록 버튼 */}
          <button
            onClick={onDirectOrder}
            style={{
              marginTop: 70,
              width: 760,
              height: 150,
              borderRadius: 32,
              backgroundColor: '#0A400C',
              border: 'none',
              color: 'white',
              fontSize: 48,
              fontWeight: 900,
              boxShadow: '0 20px 32px rgba(0,0,0,0.28)',
              cursor: 'pointer',
            }}
            {...hoverify('#0A400C', '#0b5a27')}
          >
            그대로 주문하기
          </button>

          {/* 아래 정사각형 버튼 2개 */}
          <div
            style={{
              marginTop: 40,
              display: 'flex',
              justifyContent: 'center',
              gap: 40,
            }}
          >
            {/* ⚠ 다른 메뉴 선택하기 – 지금은 App에서 콜백이 없어서 동작 X (UI만 맞춰둠) */}
            <button
              onClick={onChangeMenu}
              style={{
                width: 360,
                height: 324,
                backgroundColor: '#888888',
                borderRadius: 32,
                border: 'none',
                color: 'white',
                fontSize: 48,
                fontWeight: 800,
                boxShadow: '0 16px 28px rgba(0,0,0,0.22)',
                cursor: 'pointer',
              }}
              {...hoverify('#888888', '#6b7280')}
            >
              다른 메뉴
              <br />
              선택하기
            </button>

            {/* 온도·포장 바꾸기 – App에서 넘어온 onChangeOptions 사용 */}
            <button
              onClick={onChangeOptions}
              style={{
                width: 360,
                height: 324,
                backgroundColor: '#626950',
                borderRadius: 32,
                border: 'none',
                color: 'white',
                fontSize: 48,
                fontWeight: 800,
                boxShadow: '0 16px 28px rgba(0,0,0,0.22)',
                cursor: 'pointer',
              }}
              {...hoverify('#626950', '#4b4f3d')}
            >
              온도·포장
              <br />
              바꾸기
            </button>
          </div>
        </div>
      </div>
    </ScaledLayout>
  );
}


/* -------------------------------------------------
 * 4. 기본 옵션 화면 (온도 + 받는 방식)
* ------------------------------------------------- */
export function ScreenOptions({
  temp,
  setTemp,
  dine,
  setDine,
  setCup,
  onOrder,
  onBack,
  onMoreOptions,  // ✅ 추가
}) {
  const TITLE_FONT_SIZE = 44;

  const makeTempCardStyle = (active, borderColor) => ({
    width: 350,
    height: 240,
    borderRadius: 32,
    border: active ? `4px solid ${borderColor}` : '4px solid #888888',
    backgroundColor: 'white',
    boxShadow: active
      ? '0 16px 28px rgba(0,0,0,0.18)'
      : '0 10px 20px rgba(0,0,0,0.10)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    cursor: 'pointer',
    fontSize: 44,
    fontWeight: 800,
    gap: 10,
  });

  const makeDineCardStyle = (active) => ({
    width: 350,
    height: 400,
    borderRadius: 32,
    border: active ? '4px solid #0f7132' : '4px solid #e5e7eb',
    backgroundColor: active ? '#f4ffec' : 'white',
    boxShadow: active
      ? '0 18px 32px rgba(0,0,0,0.20)'
      : '0 12px 24px rgba(0,0,0,0.12)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 46,
    paddingBottom: 46,
    paddingLeft: 40,
    paddingRight: 40,
    cursor: 'pointer',
    fontSize: 44,
    fontWeight: 800,
    gap: 10,
  });

  return (
    <ScaledLayout>
      <div
        style={{
          height: '100%',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 830,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: 80,
          }}
        >
          {/* ─ 온도 선택 ─ */}
          <div>
            <div
              style={{
                fontSize: TITLE_FONT_SIZE,
                fontWeight: 900,
                marginBottom: 32,
              }}
            >
              온도를 선택해주세요
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              {/* 차갑게 */}
              <button
                onClick={() => setTemp('ice')}
                style={makeTempCardStyle(temp === 'ice', '#0B51FF')}
              >
                <div style={{ fontSize: 70 }}>🧊</div>
                <div>차갑게</div>
              </button>

              {/* 따뜻하게 */}
              <button
                onClick={() => setTemp('hot')}
                style={makeTempCardStyle(temp === 'hot', '#F15151')}
              >
                <div style={{ fontSize: 70 }}>🔥</div>
                <div>따뜻하게</div>
              </button>
            </div>
          </div>

          {/* ─ 받을 방법 선택 ─ */}
          <div>
            <div
              style={{
                fontSize: TITLE_FONT_SIZE,
                fontWeight: 900,
                marginBottom: 32,
              }}
            >
              받을 방법을 선택해주세요
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              {/* 포장하기 */}
              <button
                onClick={() => {
                  setDine('takeout');
                  setCup('togo');
                }}
                style={makeDineCardStyle(dine === 'takeout')}
              >
                <div style={{ fontSize: 70 }}>🛍️</div>
                <div>포장하기</div>
              </button>

              {/* 먹고 가기 */}
              <button
                onClick={() => {
                  setDine('dinein');
                  setCup('basic');
                }}
                style={makeDineCardStyle(dine === 'dinein')}
              >
                <div style={{ fontSize: 70 }}>🍽️</div>
                <div>먹고 가기</div>
              </button>
            </div>
          </div>

          {/* ─ 하단 버튼 영역 ─ */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              alignItems: 'center'
            }}
          >
            {/* 큰 초록 버튼 : 적용하기 (바로 주문으로 이어짐) */}
            <button
              onClick={() => {
                const nextDine = dine || 'takeout';
                setDine(nextDine);
                setCup(nextDine === 'takeout' ? 'togo' : 'basic');
                if (onOrder) onOrder();
              }}
              style={{
                width: 870,        
                height: 140,      
                backgroundColor: '#0A400C',
                borderRadius: 32,    
                border: 'none',
                color: 'white',
                fontSize: 44,       
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 18px 32px rgba(0,0,0,0.25)',
                marginBottom: 20,
              }}
              {...hoverify('#0A400C', '#0b5a27')}
            >
              적용하기
            </button>

            {/* 아래 두 개 버튼 (취소 / 옵션 더보기) */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 40,
              }}
            >
              {/* 왼쪽: 다른 메뉴 선택하기 (메뉴 화면으로) */}
              <button
                onClick={onBack}
                style={{
                  width: 415,
                  height: 120,
                  backgroundColor: '#888888',
                  borderRadius: 32,
                  border: 'none',
                  color: 'white',
                  fontSize: 44,
                  fontWeight: 800,
                  boxShadow: '0 16px 28px rgba(0,0,0,0.22)',
                  cursor: 'pointer',
                }}
                {...hoverify('#888888', '#6b7280')}
              >
                취소하기
              </button>

              {/* 오른쪽: 온도·포장 바꾸기 (기본 옵션 화면으로) */}
              <button
                onClick={onMoreOptions}
                style={{
                  width: 415,
                  height: 120,
                  backgroundColor: '#626950',
                  borderRadius: 32,
                  border: 'none',
                  color: 'white',
                  fontSize: 44,
                  fontWeight: 800,
                  boxShadow: '0 16px 28px rgba(0,0,0,0.22)',
                  cursor: 'pointer',
                }}
                {...hoverify('#626950', '#4b4f3d')}
              >
                옵션 더보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </ScaledLayout>
  );
}





/* -------------------------------------------------
 * 4-B. 고급 옵션 화면 (사이즈/샷/우유/합계)
 * ------------------------------------------------- */
export function ScreenAdvOptions({
  menu,
  temp,
  size,
  setSize,
  shot,
  setShot,
  milk,
  setMilk,
  onApply,
  onCancel,
}) {
  const sectionTitleStyle = {
    fontSize: 40,
    fontWeight: 900,
    textAlign: 'center',
    marginBottom: 40,
  };

  const cupButton = (w, h, active) => ({
    width: w,
    height: h,
    borderRadius: 32,
    border: active ? '4px solid #0A400C' : '4px solid #888888',
    backgroundColor: active ? '#effdf3' : 'white',
    boxShadow: active
      ? '0 14px 30px rgba(0,0,0,0.18)'
      : '0 10px 22px rgba(0,0,0,0.10)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 30,
    fontWeight: 900,
    cursor: 'pointer',
    padding: 16,
    gap: 10,
  });

  const milkButton = (active) => ({
    width: 210,
    height: 160,
    borderRadius: 28,
    border: active ? '4px solid #0A400C' : '4px solid #888888',
    backgroundColor: active ? '#effdf3' : 'white',
    boxShadow: active
      ? '0 14px 30px rgba(0,0,0,0.18)'
      : '0 10px 22px rgba(0,0,0,0.10)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 30,
    fontWeight: 700,
    cursor: 'pointer',
    gap: 6,
  });

  const totalPrice=calcTotalPrice(menu, temp, size, shot, milk);

  return (
    <ScaledLayout>
      <div
        style={{
          height: '100%',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 1080,
            display: 'flex',
            flexDirection: 'column',
            gap: 72,
          }}
        >
          {/* 음료 크기 */}
          <div>
            <div style={sectionTitleStyle}>음료 크기</div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                width: 900,
                margin: '0 auto',
              }}
            >
              <button
                onClick={() => setSize && setSize('basic')}
                style={cupButton(200, 160, size === 'basic')}
              >
                <div style={{ fontSize: 30 }}>기본</div>
                <div style={{ fontSize: 28, fontWeight: 600 }}>
                  360ml
                </div>
              </button>

              <button
                onClick={() => setSize && setSize('big')}
                style={cupButton(200, 180, size === 'big')}
              >
                <div style={{ fontSize: 30 }}>큰 컵</div>
                <div style={{ fontSize: 28, fontWeight: 600 }}>
                  470ml
                </div>
                <div style={{ fontSize: 26, color: '#0A400C' }}>
                  +500원
                </div>
              </button>

              <button
                onClick={() => setSize && setSize('huge')}
                style={cupButton(200, 200, size === 'huge')}
              >
                <div style={{ fontSize: 30 }}>아주 큰 컵</div>
                <div style={{ fontSize: 28, fontWeight: 600 }}>
                  650ml
                </div>
                <div style={{ fontSize: 26, color: '#0A400C' }}>
                  +1,000원
                </div>
              </button>
            </div>
          </div>

          {/* 샷 */}
          <div
            style={{
              width: 960,
              height: 360,
              borderRadius: 32,
              backgroundColor: '#f4f4f4',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 32,
              margin: '0 auto',
            }}
          >
            <div style={{ fontSize: 40, fontWeight: 900 }}>
              에스프레소 샷
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 60,
              }}
            >
              <button
                onClick={() =>
                  setShot && setShot((s) => Math.max(0, (s || 0) - 1))
                }
                style={{
                  width: 140,
                  height: 96,
                  borderRadius: 24,
                  border: '4px solid #888888',
                  backgroundColor: 'white',
                  fontSize: 42,
                  fontWeight: 900,
                }}
              >
                –
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 48,
                    fontWeight: 900,
                  }}
                >
                  {shot}
                </span>
                {shot === 2 && (
                  <span
                    style={{
                      fontSize: 30,
                      fontWeight: 700,
                      color: '#4b5563',
                    }}
                  >
                    (기본)
                  </span>
                )}
              </div>

              <button
                onClick={() => setShot && setShot((s) => (s || 0) + 1)}
                style={{
                  width: 140,
                  height: 96,
                  borderRadius: 24,
                  border: 'none',
                  backgroundColor: '#0A400C',
                  color: 'white',
                  fontSize: 42,
                  fontWeight: 900,
                }}
              >
                +
              </button>
            </div>

            <div style={{ fontSize: 30, color: '#6b7280', fontWeight: 800 }}>
              +{Math.max(shot - 2, 0) * 500}원
            </div>
          </div>

          {/* 우유 */}
          <div>
            <div style={sectionTitleStyle}>우유 변경</div>
            <div
              style={{
                width: 900,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: '0 auto',
              }}
            >
              <button
                onClick={() => setMilk && setMilk('regular')}
                style={milkButton(milk === 'regular')}
              >
                <div>일반</div>
              </button>

              <button
                onClick={() => setMilk && setMilk('lowfat')}
                style={milkButton(milk === 'lowfat')}
              >
                <div>저지방</div>
                <div style={{ color: '#0A400C' }}>+500원</div>
              </button>

              <button
                onClick={() => setMilk && setMilk('soy')}
                style={milkButton(milk === 'soy')}
              >
                <div>두유</div>
                <div style={{ color: '#0A400C' }}>+500원</div>
              </button>

              <button
                onClick={() => setMilk && setMilk('oat')}
                style={milkButton(milk === 'oat')}
              >
                <div>귀리우유</div>
                <div style={{ color: '#0A400C' }}>+500원</div>
              </button>
            </div>
          </div>

          {/* 합계 + 버튼 */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              textAlign: 'center',
              color: '#0A400C',
              marginTop: 8,
            }}
          >
            합계: {totalPrice.toLocaleString()}원
          </div>

          <div
            style={{
              width: 900,
              display: 'flex',
              justifyContent: 'space-between',
              margin: '0 auto',
              marginTop: 8,
            }}
          >
            <button
              onClick={onCancel}
              style={{
                width: 420,
                height: 150,
                borderRadius: 32,
                backgroundColor: '#888888',
                border: 'none',
                fontSize: 40,
                fontWeight: 800,
                color: '#ffffff',
                boxShadow: '0 12px 26px rgba(0,0,0,0.15)',
              }}
              {...hoverify('#888888', '#6b7280')}
            >
              취소하기
            </button>

            <button
              onClick={() => onApply && onApply(totalPrice)}
              style={{
                width: 420,
                height: 150,
                borderRadius: 32,
                backgroundColor: '#0A400C',
                border: 'none',
                fontSize: 40,
                fontWeight: 900,
                color: 'white',
                boxShadow: '0 12px 26px rgba(0,0,0,0.25)',
              }}
              {...hoverify('#0A400C', '#0b5a27')}
            >
              적용하기
            </button>
          </div>
        </div>
      </div>
    </ScaledLayout>
  );
}

/* -------------------------------------------------
 * 7-B. 고급 옵션까지 포함한 최종 확인 화면
 * ------------------------------------------------- */
export function ScreenFinalConfirm({
  selected,
  temp,
  dine,
  size,
  shot,
  milk,
  onDirectOrder,
  onBack,        // 온도·포장 바꾸기
  onChangeMenu,  // ✅ 새로 추가: 다른 메뉴 선택하기
}) {
  if (!selected) return null;

  const tempLabel = temp === 'hot' ? '따뜻한' : '차가운';
  const tempColor = temp === 'hot' ? '#F15151' : '#0B51FF';
  const name = selected.name || '';

  // 포장 / 매장 문장
  const dinePrefix =
    dine === 'takeout' ? '포장해서 ' : '매장에서 ';
  const dineSuffix = '드시겠어요?';

  // 고급 옵션 텍스트 (회색 박스 전용)
  const sizeLabel =
    size === 'big'
      ? '큰 컵'
      : size === 'huge'
      ? '아주 큰 컵'
      : '기본 컵';

  const shotLabel = `${shot}샷${shot === 2 ? ' (기본)' : ''}`;

  const milkLabel =
    milk === 'lowfat'
      ? '저지방'
      : milk === 'soy'
      ? '두유'
      : milk === 'oat'
      ? '귀리우유'
      : '일반우유';

  const optionLine = `옵션: ${sizeLabel} / ${shotLabel} / ${milkLabel}`;

  const imgFileName = selected.images 
  ? (selected.images[temp] || selected.images.only)  : null;
  const imgSrc = imgFileName ? `/images/menus/${imgFileName}` : null;

  const curPrice=calcTotalPrice(selected,temp,size,shot,milk);

  return (
    <ScaledLayout>
      <div
        style={{
          height: '100%',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 1000,
            textAlign: 'center',
          }}
        >
          {/* ⭐️ [수정] 이미지 영역 */}
          <div
            style={{
              width: 420,
              height: 420,
              borderRadius: 32,
              backgroundColor: '#ffffff',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 160,
              boxShadow: '0 22px 32px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}
          >
            {imgSrc ? (
              <img 
                src={imgSrc} 
                alt={name}
                style={{ width: '80%', height: '80%', objectFit: 'contain' }} 
              />
            ) : (
              selected.emoji || '🍹'
            )}
          </div>

          {/* 메인 문장 */}
          <div
            style={{
              marginTop: 36,
              fontSize: 46,
              fontWeight: 900,
              lineHeight: 1.4,
            }}
          >
            <span style={{ color: tempColor }}>{tempLabel} </span>
            <span style={{ color:  '#0A400C'}}>{name}</span>
            {eulReul(name)}
            <br />
            <span style={{ color: '#0A400C' }}>{dinePrefix}</span>
            <span>{dineSuffix}</span>
          </div>

          {/* ✅ 옵션 요약 – 화면 가로만큼 꽉 찬 회색 박스 */}
          <div
            style={{
              marginTop: 34,
              padding: '18px 32px',
              borderRadius: 0,
              backgroundColor: '#f3f4f6',
              color: '#4b5563',
              fontSize: 38,
              fontWeight: 600,
              display: 'block',
              width: '100%',
              maxWidth: 1000,
              boxSizing: 'border-box',
            }}
          >
            {optionLine}
          </div>

          {/* ✅ [신규 추가] 최종 가격 표시 (버튼 바로 위) */}
          <div style={{ marginTop: 30, fontSize: 50, fontWeight: 900, color: '#0f7132' }}>
            총 {curPrice.toLocaleString()}원
          </div>

          {/* 그대로 주문하기 */}
          <button
            onClick={onDirectOrder}
            style={{
              marginTop: 70,
              width: 760,
              height: 150,
              borderRadius: 32,
              backgroundColor: '#0A400C',
              border: 'none',
              color: 'white',
              fontSize: 48,
              fontWeight: 900,
              boxShadow: '0 20px 32px rgba(0,0,0,0.28)',
              cursor: 'pointer',
            }}
            {...hoverify('#0A400C', '#0b5a27')}
          >
            그대로 주문하기
          </button>

          {/* 아래 두 버튼 */}
          <div
            style={{
              marginTop: 40,
              display: 'flex',
              justifyContent: 'center',
              gap: 40,
            }}
          >
            {/* 왼쪽: 다른 메뉴 선택하기 */}
            <button
              onClick={onChangeMenu}
              style={{
                width: 360,
                height: 324,
                backgroundColor: '#888888',
                borderRadius: 32,
                border: 'none',
                color: 'white',
                fontSize: 48,
                fontWeight: 800,
                boxShadow: '0 16px 28px rgba(0,0,0,0.22)',
                cursor: 'pointer',
              }}
              {...hoverify('#888888', '#6b7280')}
            >
              다른 메뉴
              <br />
              선택하기
            </button>

            {/* 오른쪽: 온도·포장 바꾸기 */}
            <button
              onClick={onBack}
              style={{
                width: 360,
                height: 324,
                backgroundColor: '#626950',
                borderRadius: 32,
                border: 'none',
                color: 'white',
                fontSize: 48,
                fontWeight: 800,
                boxShadow: '0 16px 28px rgba(0,0,0,0.22)',
                cursor: 'pointer',
              }}
              {...hoverify('#626950', '#4b4f3d')}
            >
              온도·포장
              <br />
              바꾸기
            </button>
          </div>
        </div>
      </div>
    </ScaledLayout>
  );
}




/* -------------------------------------------------
 * 5. 결제 수단 선택
 * ------------------------------------------------- */
export function ScreenPayment({ onSelectCard, onSelectMobile }) {
  return (
    <ScaledLayout>
      <div
        style={{
          height: '100%',
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 1080,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 'auto',
            marginBottom: 'auto',
          }}
        >
          <div
            style={{
              fontSize: 78,
              fontWeight: 800,
              marginBottom: 140,
            }}
          >
            <span style={{ color: '#0b4a23' }}>결제 수단</span>을
            선택해주세요
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 80,
            }}
          >
            <button
              onClick={onSelectCard}
              style={{
                width: 380,
                height: 420,
                backgroundColor: '#FEFAE0',
                border: '1px solid #AFAFAF',
                borderRadius: 28,
                boxShadow: '0 14px 28px rgba(0,0,0,0.18)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              {...hoverify('#FEFAE0', '#F5F0C8')}
            >
              <div
                style={{
                  fontSize: 120,
                  marginBottom: 20,
                }}
              >
                💳
              </div>
              <div
                style={{
                  fontSize: 44,
                  fontWeight: 900,
                  color: '#0b4a23',
                }}
              >
                카드
              </div>
            </button>

            <button
              onClick={onSelectMobile}
              style={{
                width: 380,
                height: 420,
                backgroundColor: '#FEFAE0',
                border: '2px solid #AFAFAF',
                borderRadius: 28,
                boxShadow: '0 14px 28px rgba(0,0,0,0.18)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 18,
              }}
              {...hoverify('#FEFAE0', '#F5F0C8')}
            >
              <div
                style={{
                  fontSize: 120,
                  marginBottom: 20,
                }}
              >
                📱
              </div>
              <div
                style={{
                  fontSize: 44,
                  fontWeight: 900,
                  color: '#0b4a23',
                }}
              >
                모바일 페이
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontSize: 22,
                  color: '#333',
                  lineHeight: 1.4,
                }}
              >
                카카오 / 네이버 / 기프티콘
                <br />
                금액권 등
              </div>
            </button>
          </div>
        </div>
      </div>
    </ScaledLayout>
  );
}

/* -------------------------------------------------
 * 6-A. 카드 결제 대기 화면
 * ------------------------------------------------- */
export function ScreenCard({ payAmount = 0, onProcess, onBack, onShowOrder, onCancel, }) {
  const amountText = payAmount.toLocaleString('ko-KR');

  return (
    <ScaledLayout>
      <div
        style={{
          height: '100%',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          paddingTop: 120,
          paddingBottom: 40,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 1080,
            height: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            justifyContent: 'flex-start',   
            gap: 40,
          }}
        >
          {/* 상단 텍스트 + 카드 아이콘 + 금액 + 주문목록 보기 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: 40,
              gap: 40,
            }}
          >
            <div
              style={{
                fontSize: 80,
                fontWeight: 900,
                lineHeight: 1.4,
              }}
            >
              <span style={{ color: '#0A400C' }}>신용카드</span>를 넣어주세요
            </div>

            <div
              style={{
                marginTop: 10,
                marginBottom: 10,
                cursor: 'pointer',
              }}
              onClick={onProcess}
            >
              <span style={{ fontSize: 270 }}>💳</span>
            </div>

            <div
              style={{
                fontSize: 60,
                fontWeight: 800,
                color: '#0A400C',
              }}
            >
              결제금액: {amountText}원
            </div>

            <button
              type="button"
              onClick={onShowOrder}
              style={{
                marginTop: 10,
                padding: '20px 56px',
                borderRadius: 26,
                border: 'none',
                backgroundColor: '#626950',
                color: '#ffffff',
                fontSize: 32,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 10px 20px rgba(0,0,0,0.18)',
              }}
              {...hoverify('#626950', '#4b4f3d')}
            >
              주문목록 보기
            </button>
          </div>

          {/* 하단 두 개 버튼 영역 */}
          <div
            style={{
              width: '100%',
              marginTop: 80,
              marginBottom: 40,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24,
            }}
          >
            {/* 1) 다른 수단으로 결제하기 (초록) */}
            <button
              onClick={onBack}
              style={{
                width: 870,                
                height: 140,             
                backgroundColor: '#0A400C',
                borderRadius: 32,
                border: 'none',
                color: '#ffffff',
                fontSize: 48,
                fontWeight: 900,
                boxShadow: '0 18px 32px rgba(0,0,0,0.28)',
                cursor: 'pointer',
              }}
              {...hoverify('#0A400C', '#0b5a27')}
            >
              다른 수단으로 결제하기
            </button>

            {/* 2) 취소하기 (회색) */}
            <button
              onClick={onCancel}
              style={{
                width: 870,                
                height: 140,               
                backgroundColor: '#888888',
                borderRadius: 32,
                border: 'none',
                color: '#ffffff',
                fontSize: 48,
                fontWeight: 900,
                boxShadow: '0 18px 32px rgba(0,0,0,0.25)',
                cursor: 'pointer',
              }}
              {...hoverify('#888888', '#6b7280')}
            >
              취소하기
            </button>
          </div>

        </div>
      </div>
    </ScaledLayout>
  );
}

/* -------------------------------------------------
 * 6-B. 모바일 결제 대기 화면
 * ------------------------------------------------- */
export function ScreenMobile({ payAmount = 0, onProcess, onBack, onShowOrder, onCancel, }) {
  const amountText = payAmount.toLocaleString('ko-KR');

  return (
    <ScaledLayout>
      <div
        style={{
          height: '100%',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          paddingTop: 120,
          paddingBottom: 40,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 1080,
            height: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            justifyContent: 'flex-start',
            gap: 40,
          }}
        >
          {/* 상단 텍스트 + 아이콘 + 금액 + 주문목록 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: 40,
              gap: 40,
            }}
          >
            <div
              style={{
                fontSize: 80,
                fontWeight: 900,
                lineHeight: 1.4,
              }}
            >
              <span style={{ color: '#0A400C' }}>바코드</span>를 인식해주세요
            </div>

            <div
              style={{
                marginTop: 10,
                marginBottom: 10,
                cursor: 'pointer',
              }}
              onClick={onProcess}
            >
              <span style={{ fontSize: 270 }}>📲</span>
            </div>

            <div
              style={{
                fontSize: 60,
                fontWeight: 800,
                color: '#0A400C',
              }}
            >
              결제금액: {amountText}원
            </div>

            <button
              type="button"
              onClick={onShowOrder}
              style={{
                marginTop: 10,
                padding: '20px 56px',
                borderRadius: 26,
                border: 'none',
                backgroundColor: '#626950',
                color: '#ffffff',
                fontSize: 32,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 10px 20px rgba(0,0,0,0.18)',
              }}
              {...hoverify('#626950', '#4b4f3d')}
            >
              주문목록 보기
            </button>
            </div>

            {/* 하단 두 개 버튼 영역 */}
            <div
              style={{
                width: '100%',
                marginTop: 80,
                marginBottom: 40,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 24,
              }}
            >
              {/* 1) 다른 수단으로 결제하기 */}
              <button
                onClick={onBack}
                style={{
                  width: 870,          
                  height: 140,         
                  backgroundColor: '#0A400C',
                  borderRadius: 32,
                  border: 'none',
                  color: '#ffffff',
                  fontSize: 48,
                  fontWeight: 900,
                  boxShadow: '0 18px 32px rgba(0,0,0,0.28)',
                  cursor: 'pointer',
                }}
                {...hoverify('#0A400C', '#0b5a27')}
              >
                다른 수단으로 결제하기
              </button>

              {/* 2) 취소하기  */}
              <button
                onClick={onCancel}
                style={{
                  width: 870,          
                  height: 140,       
                  backgroundColor: '#888888',
                  borderRadius: 32,
                  border: 'none',
                  color: '#ffffff',
                  fontSize: 48,
                  fontWeight: 900,
                  boxShadow: '0 18px 32px rgba(0,0,0,0.25)',
                  cursor: 'pointer',
                }}
                {...hoverify('#888888', '#6b7280')}
              >
                취소하기
              </button>
            </div>
        </div>
      </div>
    </ScaledLayout>
  );
}

/* -------------------------------------------------
 * 7. 결제 중 화면
 * ------------------------------------------------- */
export function ScreenProcessing({ payMethod, onCancel }) {
  const title =
    payMethod === 'card'
      ? '카드 결제 진행중…'
      : '모바일 페이 결제 진행중…';

  return (
    <ScaledLayout>
      <div
        style={{
          height: '100%',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          paddingTop: 120,
          paddingBottom: 40,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 1080,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              marginBottom: 16,
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: 18,
              color: '#374151',
              marginBottom: 32,
            }}
          >
            결제가 처리되는 동안 잠시만 기다려주세요.
          </div>

          <div
            style={{
              margin: '20px auto 10px',
              width: 90,
              height: 90,
              borderRadius: '50%',
              border: '8px solid #d1fae5',
              borderTopColor: '#10b981',
              animation: 'spin 1s linear infinite',
            }}
          />
          <style>
            {`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}
          </style>

          <div style={{ marginTop: 32 }}>
            <button
              onClick={onCancel}
              style={{
                padding: '12px 18px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #888888',
                borderRadius: 14,
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </ScaledLayout>
  );
}


/* -------------------------------------------------
 * 8. 완료 화면 (주문번호 + 10초 자동 닫힘)
 *    + 단일메뉴 NFC용 할인 도장 적립 모달(옵션)
 * ------------------------------------------------- */
export function ScreenDone({ orderNumber, onReset, enableStamp = false }) {
  const [seconds, setSeconds] = useState(10);

  // 단일메뉴 NFC용 도장 적립 상태들
  const [showStampModal, setShowStampModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('010');
  const [stampStep, setStampStep] = useState('input'); // 'input' | 'complete'

  // 타이머: 기본 10초 카운트다운 + 모달 열리면 일시정지
  useEffect(() => {
    if (enableStamp && showStampModal) return;

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onReset && onReset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [enableStamp, showStampModal, onReset]);

  const displayOrder =
    typeof orderNumber === 'number' ? orderNumber : '—';

  const formatPhoneNumber = (num) => {
    if (!num) return '';
    const onlyNum = num.replace(/[^0-9]/g, '');
    if (onlyNum.length <= 3) return onlyNum;
    if (onlyNum.length <= 7) {
      return `${onlyNum.slice(0, 3)}-${onlyNum.slice(3)}`;
    }
    return `${onlyNum.slice(0, 3)}-${onlyNum.slice(3, 7)}-${onlyNum.slice(
      7,
      11
    )}`;
  };

  const handleNumClick = (digit) => {
    setPhoneNumber((prev) => {
      if (prev.length >= 11) return prev;
      return prev + digit;
    });
  };

  const handleClear = () => {
    setPhoneNumber('010');
  };

  return (
    <ScaledLayout>
      <div
        style={{
          height: '100%',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          paddingTop: 120,
          paddingBottom: 40,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 1080,
            height: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            justifyContent: 'flex-start',
            gap: 40,
          }}
        >
          {/* 상단 완료 정보 */}
          <div style={{ fontSize: 78, fontWeight: 900 }}>
            주문이 완료되었어요
          </div>

          <div
            style={{
              fontSize: 60,
              fontWeight: 700,
              color: '#0A400C',
            }}
          >
            주문번호
          </div>

          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: '#0A400C',
            }}
          >
            {displayOrder}
          </div>

          <div
            style={{
              fontSize: 38,
              color: '#111827',
            }}
          >
            주문번호 확인 후 카운터에서 음료를 받아주세요
          </div>

          {/* 쿠폰 정보 */}
          <div
            style={{
              width: '100%',
              maxWidth: 900,
              backgroundColor: '#f3f4f6',
              padding: '30px 40px',
              borderRadius: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 10,
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 48 }}>%</span>
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                }}
              >
                쿠폰 적립 내역
              </span>
            </div>

            <div
              style={{
                fontSize: 48,
                fontWeight: 900,
                color: '#0A400C',
                marginBottom: 6,
              }}
            >
              3회 적립
            </div>

            <div
              style={{
                fontSize: 30,
                color: '#4b5563',
              }}
            >
              10회 적립 후,{' '}
              <b style={{ color: '#0A400C' }}>결제 시 2,000원</b>이 자동으로
              할인됩니다.
            </div>
          </div>

          {/* 10초 카운트다운 */}
          <div
            style={{
              fontSize: 30,
              color: '#6b7280',
              textDecoration: 'underline',
              textUnderlineOffset: '4px',
              textDecorationThickness: '1.5px',
              textDecorationColor: '#888888',
            }}
          >
            {seconds}초 후 자동 닫힘
          </div>

          {/* 하단 버튼 영역 */}
          <div
            style={{
              width: '100%',
              marginTop: 80,
              marginBottom: 40,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24,
            }}
          >
            {/* 단일메뉴 NFC: 할인 도장 */}
            {enableStamp && (
              <button
                onClick={() => {
                  setPhoneNumber('010');
                  setStampStep('input');
                  setShowStampModal(true);
                }}
                style={{
                  width: 870,
                  height: 140,
                  backgroundColor: '#0A400C',
                  borderRadius: 32,
                  border: 'none',
                  color: 'white',
                  fontSize: 48,
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 18px 32px rgba(0,0,0,0.28)',
                }}
                {...hoverify('#0A400C', '#0b5a27')}
              >
                할인 도장 적립하기
              </button>
            )}

            {/* 처음으로 버튼 */}
            <button
              onClick={onReset}
              style={{
                width: 870,
                height: 140,
                backgroundColor: '#0A400C',  
                borderRadius: 32,
                border: 'none',
                color: '#ffffff',
                fontSize: 48,
                fontWeight: 900,
                boxShadow: '0 18px 32px rgba(0,0,0,0.25)',
                cursor: 'pointer',
              }}
              {...hoverify('#0A400C', '#0b5a27')}
            >
              처음으로
            </button>
          </div>
        </div>

        {/* 도장 적립 모달 */}
        {enableStamp && showStampModal && (
          <StampPortal
            stampStep={stampStep}
            setStampStep={setStampStep}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            formatPhoneNumber={formatPhoneNumber}
            handleNumClick={handleNumClick}
            handleClear={handleClear}
            onClose={() => setShowStampModal(false)}
          />
        )}
      </div>
    </ScaledLayout>
  );
}


/* 키패드 버튼 스타일 */
const keypadBtnStyle = {
  padding: 20,
  fontSize: 28,
  fontWeight: 'bold',
  backgroundColor: '#f0f4f8',
  border: 'none',
  borderRadius: 12,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

/* -------------------------------------------------
 * StampPortal : 모달을 document.body 에 직접 렌더링
 *  → transform(scale)을 무시하고 화면 전체를 덮게 만들기
 * ------------------------------------------------- */
function StampPortal({
  stampStep,
  setStampStep,
  phoneNumber,
  setPhoneNumber,
  formatPhoneNumber,
  handleNumClick,
  handleClear,
  onClose,
}) {
  // SSR 대비
  if (typeof document === 'undefined') return null;

  return createPortal(
    (
      <div
        style={{
          position: 'fixed',
          inset: 0, // top:0, right:0, bottom:0, left:0
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
        }}
        onClick={onClose}
      >
        <div
          style={{
            width: 500,
            backgroundColor: 'white',
            borderRadius: 32,
            padding: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 14px 36px rgba(0,0,0,0.4)',
          }}
          onClick={(e) => e.stopPropagation()} // 모달 안 클릭 시 닫히지 않게, 적립 팝업 사이즈

        >
          {/* STEP 1: 번호 입력 */}
          {stampStep === 'input' && (
            <>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  marginBottom: 30,
                }}
              >
                핸드폰 번호를 입력해주세요
              </div>

              <div
                style={{
                  width: '100%',
                  padding: '20px 0',
                  backgroundColor: '#eee',
                  borderRadius: 12,
                  textAlign: 'center',
                  fontSize: 32,
                  fontWeight: 'bold',
                  letterSpacing: 2,
                  marginBottom: 30,
                }}
              >
                {formatPhoneNumber(phoneNumber)}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 12,
                  width: '100%',
                  marginBottom: 30,
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumClick(num.toString())}
                    style={keypadBtnStyle}
                  >
                    {num}
                  </button>
                ))}

                <button
                  onClick={handleClear}
                  style={{
                    ...keypadBtnStyle,
                    backgroundColor: '#888888',
                    fontSize: 24,
                  }}
                >
                  지움
                </button>

                <button
                  onClick={() => handleNumClick('0')}
                  style={keypadBtnStyle}
                >
                  0
                </button>

                <button
                  onClick={() => setStampStep('complete')}
                  style={{
                    ...keypadBtnStyle,
                    backgroundColor: '#0A400C',
                    color: 'white',
                    fontSize: 24,
                  }}
                >
                  완료
                </button>
              </div>
            </>
          )}

          {/* STEP 2: 적립 완료 */}
          {stampStep === 'complete' && (
            <>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  marginBottom: 10,
                }}
              >
                {phoneNumber.slice(-4)}님,
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  marginBottom: 40,
                }}
              >
                적립이 완료되었습니다
              </div>

              <div
                style={{
                  width: '100%',
                  backgroundColor: '#f3f4f6',
                  padding: '30px 20px',
                  borderRadius: 20,
                  textAlign: 'center',
                  marginBottom: 40,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 24,
                      backgroundColor: 'black',
                      color: 'white',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    %
                  </span>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                    }}
                  >
                    쿠폰 적립 내역
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 900,
                    color: '#0A400C',
                    marginBottom: 10,
                  }}
                >
                  3회 적립
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: '#666',
                  }}
                >
                  10회 적립 후, 다음 결제 시 2,000원이 자동
                  할인됩니다.
                </div>
              </div>
            </>
          )}

          <button
            onClick={onClose}
            style={{
              padding: '15px 40px',
              backgroundColor: '#888',
              color: 'white',
              borderRadius: 12,
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
            }}
          >
            ✕ 닫기
          </button>
        </div>
      </div>
    ),
    document.body
  );
}







/* -------------------------------------------------
 * 7-B. 단일 메뉴 NFC 장바구니 화면 (페이지네이션)
 *  - 한 페이지에 최대 4개 카드 표시 (2x2 그리드)
 *  - 5개 이상이면 좌우 화살표로 페이지 이동
 *  - "추가할 메뉴카드를 태그해주세요" 플러스 박스는 항상 마지막 카드 다음에 표시
 *  - 결제하기 버튼 클릭 시 받을 방법 선택 모달 표시
 * ------------------------------------------------- */
/* -------------------------------------------------
 * 7-B. 단일 메뉴 NFC 장바구니 화면 (페이지네이션)
 * ------------------------------------------------- */
/* -------------------------------------------------
 * 7-B. 단일 메뉴 NFC 장바구니 화면 (페이지네이션)
 * ------------------------------------------------- */
export function ScreenCart({
  cart,
  onQtyChange,
  onRemove,
  onReset,
  onCheckout, // 받을 방법 선택 후 결제 진행
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [showDineModal, setShowDineModal] = useState(false);

  const hasItems = cart && cart.length > 0;
  const itemsPerPage = 4;
  const totalPages = Math.ceil((cart.length + 1) / itemsPerPage); // +1 플러스 박스

  const startIdx = currentPage * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentItems = cart.slice(startIdx, endIdx);

  const showPlusBox =
    currentItems.length < itemsPerPage;

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage((p) => p + 1);
  };

  const handleCheckoutClick = () => {
    if (!hasItems) return;
    setShowDineModal(true);
  };

  const handleDineSelect = (dineType) => {
    setShowDineModal(false);
    if (onCheckout) onCheckout(dineType); // 'takeout' | 'dinein'
  };



    return (
    <ScaledLayout>
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: 40,
          paddingBottom: 40,
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* 타이틀 */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            marginBottom: 30,
          }}
        >
          장바구니
        </div>

        {/* 메인 컨테이너 (피그마 965 x 1240 비율) */}
        <div
          style={{
            position: 'relative',
            width: 880,
            height: 1130,
            maxWidth: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* 왼쪽 화살표 */}
          {totalPages > 1 && currentPage > 0 && (
            <button
              onClick={handlePrevPage}
              style={{
                position: 'absolute',
                left: -60,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 50,
                height: 120,
                borderRadius: 16,
                border: 'none',
                backgroundColor: '#0A400C',
                color: 'white',
                fontSize: 32,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
                zIndex: 10,
              }}
              {...hoverify('#0A400C', '#0b5a27')}
            >
              ◀
            </button>
          )}

          {/* 오른쪽 화살표 */}
          {totalPages > 1 && currentPage < totalPages - 1 && (
            <button
              onClick={handleNextPage}
              style={{
                position: 'absolute',
                right: -60,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 50,
                height: 120,
                borderRadius: 16,
                border: 'none',
                backgroundColor: '#0A400C',
                color: 'white',
                fontSize: 32,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
                zIndex: 10,
              }}
              {...hoverify('#0A400C', '#0b5a27')}
            >
              ▶
            </button>
          )}

          {/* 2 x 2 그리드 (카드 450 x 550, 간격 140) */}
          <div
            style={{
              width: 880,
              height: 1130,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 450px)',
              gridTemplateRows: 'repeat(2, 550px)',
              justifyContent: 'space-between',
              alignContent: 'space-between',
              rowGap: 100,
              columnGap: 50,
              boxSizing: 'border-box',
            }}
          >
            {currentItems.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onQtyChange={onQtyChange}
                onRemove={onRemove}
              />
            ))}

            {/* 플러스 박스 */}
            {showPlusBox && (
              <div
                style={{
                  width: 420,
                  height: 500,
                  borderRadius: 24,
                  border: '3px dashed #0A400C',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    width: 110,
                    height: 110,
                    borderRadius: '50%',
                    border: '5px solid #0A400C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 18,
                  }}
                >
                  <span
                    style={{
                      fontSize: 68,
                      fontWeight: 700,
                      color: '#0A400C',
                      marginTop: -4,
                    }}
                  >
                    +
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 800,
                    color: '#000000',
                    textAlign: 'center',
                    lineHeight: 1.6,
                  }}
                >
                  추가할 메뉴카드를
                  <br />
                  태그해주세요
                </div>
              </div>
            )}
          </div>

          {/* 페이지 인디케이터 */}
          {totalPages > 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: -40,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {Array.from({ length: totalPages }).map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    width: idx === currentPage ? 12 : 8,
                    height: idx === currentPage ? 12 : 8,
                    borderRadius: '50%',
                    backgroundColor:
                      idx === currentPage ? '#0A400C' : '#888888',
                    transition: 'all 0.3s',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* 하단 버튼 영역 */}
        <div
          style={{
            marginTop: 48,
            display: 'flex',
            flexDirection: 'row',
            gap: 40,
          }}
        >
          <button
            onClick={onReset}
            style={{
              width: 415,
              height: 120,
              borderRadius: 32,
              border: 'none',
              backgroundColor: '#888888',
              color: '#ffffff',
              fontSize: 32,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 16px 28px rgba(0,0,0,0.22)',
            }}
            {...hoverify('#888888', '#6b7280')}
          >
            처음으로
          </button>

          <button
            onClick={handleCheckoutClick}
            disabled={!hasItems}
            style={{
              width: 415,
              height: 120,
              borderRadius: 32,
              border: 'none',
              backgroundColor: hasItems ? '#0A400C' : '#888888',
              color: '#ffffff',
              fontSize: 32,
              fontWeight: 800,
              cursor: hasItems ? 'pointer' : 'not-allowed',
              boxShadow: hasItems
                ? '0 18px 28px rgba(0,0,0,0.22)'
                : 'none',
              opacity: hasItems ? 1 : 0.5,
            }}
            {...(hasItems ? hoverify('#0A400C', '#0b5a27') : {})}
          >
            결제하기
          </button>
        </div>

        {/* 받을 방법 선택 모달 */}
        {/* 받을 방법 선택 모달 (포탈로 전체 화면 덮기) */}
        {showDineModal &&
        typeof document !== "undefined" &&
        createPortal(
            (
            <div
                style={{
                position: "fixed",
                inset: 0, // top/left/right/bottom 모두 0
                backgroundColor: "rgba(0,0,0,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: "24px 16px",    
                boxSizing: "border-box",
                }}
                onClick={() => setShowDineModal(false)}
            >
                <div
                style={{
                    backgroundColor: "white",
                    borderRadius: 36,
                    padding: 64,
                    width: 700,
                    maxWidth: "90vw",
                    minHeight: 480,
                    textAlign: "center",
                    boxShadow: "0 28px 80px rgba(0,0,0,0.4)",
                }}
                onClick={(e) => e.stopPropagation()} // 안쪽 클릭 시 닫히지 않게
                >
                {/* 제목 */}
                <div
                    style={{
                    fontSize: 48,
                    fontWeight: 900,
                    marginBottom: 48,
                    whiteSpace: "nowrap",   // 줄바꿈 방지
                    textAlign: "center",
                    width: "100%",
                    }}
                >
                    받을 방법을 선택해주세요
                </div>

                {/* 포장 / 먹고 가기 버튼 영역 */}
                <div
                    style={{
                    display: "flex",
                    gap: 36,
                    justifyContent: "center",
                    marginBottom: 40,
                    }}
                >
                    {/* 포장하기 */}
                    <button
                    onClick={() => handleDineSelect("takeout")}
                    style={{
                        width: 260,
                        height: 310,
                        backgroundColor: "#FEFAE0",
                        border: "3px solid #626950",
                        borderRadius: 32,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 22,
                        boxShadow: "0 12px 30px rgba(0,0,0,0.16)",
                    }}
                    {...hoverify("#FEFAE0", "#fef3c7")}
                    >
                    <div style={{ fontSize: 110 }}>🛍️</div>
                    <div
                        style={{
                        fontSize: 36,
                        fontWeight: 800,
                        color: "#3F3F2F",
                        }}
                    >
                        포장하기
                    </div>
                    </button>

                    {/* 먹고 가기 */}
                    <button
                    onClick={() => handleDineSelect("dinein")}
                    style={{
                        width: 260,
                        height: 310,
                        backgroundColor: "#FEFAE0",
                        border: "3px solid #626950",
                        borderRadius: 32,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 22,
                        boxShadow: "0 12px 30px rgba(0,0,0,0.16)",
                    }}
                    {...hoverify("#FEFAE0", "#F7F3D6")}
                    >
                    <div style={{ fontSize: 110 }}>🍽️</div>
                    <div
                        style={{
                        fontSize: 36,
                        fontWeight: 800,
                        color: "#0A400C",
                        }}
                    >
                        먹고 가기
                    </div>
                    </button>
                </div>

                {/* 닫기 버튼 */}
                <button
                    onClick={() => setShowDineModal(false)}
                    style={{
                    marginTop: 8,
                    padding: "16px 40px",
                    backgroundColor: "#626950",
                    color: "white",
                    border: "none",
                    borderRadius: 18,
                    fontSize: 22,
                    fontWeight: 700,
                    cursor: "pointer",
                    }}
                    {...hoverify("#6b7280", "#4b5563")}
                >
                    ✕ 닫기
                </button>
                </div>
            </div>
            ),
            document.body
        )}
      </div>
    </ScaledLayout>
  );
}





// -------------------------------------------------
// Cart 아이템 카드 (단일메뉴 NFC)
// -------------------------------------------------
function CartItemCard({ item, onQtyChange, onRemove }) {
  const { menu, qty, options } = item;

  const tempBadge =
    options?.temp === "hot" ? "🔥 따뜻한" : "❄️ 차가운";
   const badgeColor =
    options?.temp === 'hot' ? '#F15151' : '#0B51FF';

  // 장바구니에 담긴 옵션(options.temp)에 맞는 이미지를 가져옵니다.
  const currentTemp = options?.temp || 'hot'; 
  const imgFileName = menu.images 
  ? (menu.images[currentTemp] || menu.images.only) : null;
  const imgSrc = imgFileName ? `/images/menus/${imgFileName}` : null;

  // [추가] 가격 계산 로직 (여기가 핵심!)
  const displayPrice = getPrice(menu, currentTemp);

  return (
    <div
      style={{
        width: 420,
        height: 520,
        display: 'flex',
        flexDirection: 'column',
        padding: 24,
        borderRadius: 24,
        border: '3px solid #0f5132',
        backgroundColor: 'white',
        boxShadow: '0 14px 26px rgba(0,0,0,0.18)',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* 온도 배지 */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          right: 16,
          backgroundColor: badgeColor,
          color: 'white',
          padding: '10px 22px',
          borderRadius: 18,
          fontSize: 20,
          fontWeight: 900,
          boxShadow: '0 4px 10px rgba(0,0,0,0.18)',
        }}
      >
        {tempBadge}
      </div>

      {/* 상단 영역: 왼쪽 이미지 / 오른쪽 텍스트 */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          marginTop: 60,
          marginBottom: 26,
        }}
      >
        {/* 왼쪽 이미지 */}
        <div
          style={{
            width: 180,
            height: 190,
            borderRadius: 22,
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 60,
            flexShrink: 0,
          }}
        >
          {imgSrc ? (
            <img 
              src={imgSrc} 
              alt={menu.name} 
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius:22}}
            />
          ) : (
            menu.emoji || "☕"
          )}
        </div>

        <div
          style={{
            flex: 1,
            textAlign: 'left',
            marginLeft: 18,
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 900,
              marginBottom: 10,
            }}
          >
            {menu.name}
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: '#0A400C',
            }}
          >
            {displayPrice.toLocaleString()}원 {/* 가격 수정 */}
          </div>
        </div>
      </div>

      {/* 중앙: 수량 컨트롤 */}
      <div
        style={{
          marginTop: 20,
          marginBottom: 10,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 32,
        }}
      >
        <button
          onClick={() => onQtyChange(item.id, -1)}
          style={{
            width: 120,
            height: 70,
            borderRadius: 8,
            border: '2px solid #888888',
            background: 'white',
            fontSize: 32,
            fontWeight: 900,
            cursor: 'pointer',
          }}
        >
          -
        </button>

        <div
          style={{
            width: 44,
            textAlign: 'center',
            fontSize: 28,
            fontWeight: 900,
          }}
        >
          {qty}
        </div>

        <button
          onClick={() => onQtyChange(item.id, +1)}
          style={{
            width: 120,
            height: 70,
            borderRadius: 8,
            border: 'none',
            background: '#0A400C',
            color: 'white',
            fontSize: 32,
            fontWeight: 900,
            cursor: 'pointer',
          }}
        >
          +
        </button>
      </div>

      {/* 삭제 버튼 */}
      <div style={{ marginTop: 'auto' }}>
        <button
          onClick={() => onRemove(item.id)}
          style={{
            width: '100%',
            height: 72,
            borderRadius: 18,
            border: 'none',
            background: '#777777',
            color: 'white',
            fontSize: 22,
            fontWeight: 800,
            cursor: 'pointer',
          }}
          {...hoverify('#777777', '#4b5563')}
        >
          🗑 삭제
        </button>
      </div>
    </div>
  );
}



