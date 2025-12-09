/* src/components/KioskScreens.js */
import React, { useEffect, useState } from 'react';

// ====== 유틸 ======
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
        }}
      >
        {/* 언어 선택 */}
        <div
          style={{
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
              border: '2px solid #3b82f6',
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
              border: '1px solid #ddd',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            🇰🇷 한국
          </button>
        </div>

        {/* 헤더 + 가상 NFC 버튼 */}
        <div style={{ textAlign: 'center', margin: '40px 0 30px' }}>
          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: '#0f7132',
              marginBottom: 8,
            }}
          >
            환영합니다 😊
          </div>
          <div
            style={{
              fontSize: 32,
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
            <div style={{ marginTop: 20 }}>
              <button
                onClick={onDebugClick}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  opacity: 0.8,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}
                {...hoverify('#ef4444', '#dc2626')}
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
            padding: '0 50px 50px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
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
                  boxShadow: '0 12px 28px rgba(0,0,0,0.25)',
                }}
                {...hoverify('#166534', '#15803d')}
              >
                <div style={{ fontSize: 80 }}>{cat.icon}</div>
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 'bold',
                  }}
                >
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
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
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
            {...hoverify('#ef4444', '#dc2626')}
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
              const emoji = item.emoji || '☕';
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
                      height: 'clamp(110px, 16vh, 140px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'clamp(52px, 6vw, 72px)',
                    }}
                  >
                    {emoji}
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
              backgroundColor: '#166534',
              color: 'white',
              border: 'none',
              borderRadius: 16,
              fontSize: 'clamp(18px, 2.2vw, 20px)',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
            {...hoverify('#166534', '#0f5132')}
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
export function ScreenConfirm({ selected, temp, cup, onDirectOrder, onChangeOptions }) {
  if (!selected) return null;

  const tempLabel = temp === 'hot' ? '따뜻한' : '차가운';
  const cupLabel = cup === 'basic' ? '기본컵' : '테이크아웃컵';
  const tempColor = temp === 'hot' ? '#FF6B6B' : '#2986FF';
  const name = selected.name || '';

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
          {/* 음료 카드 (이모지) */}
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
            }}
          >
            {selected.emoji || '🍹'}
          </div>

          {/* 문장 1줄 + 1줄 */}
          <div
            style={{
              marginTop: 36,
              fontSize: 52,
              fontWeight: 900,
              lineHeight: 1.32,
            }}
          >
            <span style={{ color: tempColor }}>{tempLabel} </span>
            <span style={{ color: '#166534' }}>{name}</span>
            {eulReul(name)}
          </div>

          <div
            style={{
              marginTop: 12,
              fontSize: 42,
              fontWeight: 800,
              lineHeight: 1.28,
            }}
          >
            {cupLabel}으로 준비해드릴까요?
          </div>

          {/* 그대로 주문하기 – 넓은 초록 버튼 */}
          <button
            onClick={onDirectOrder}
            style={{
              marginTop: 70,
              width: 800,
              height: 150,
              borderRadius: 32,
              backgroundColor: '#0f7132',
              border: 'none',
              color: 'white',
              fontSize: 42,
              fontWeight: 900,
              boxShadow: '0 20px 32px rgba(0,0,0,0.28)',
              cursor: 'pointer',
            }}
            {...hoverify('#0f7132', '#0b5a27')}
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
              style={{
                width: 360,
                height: 324,
                backgroundColor: '#8b8b8b',
                borderRadius: 32,
                border: 'none',
                color: 'white',
                fontSize: 42,
                fontWeight: 800,
                boxShadow: '0 16px 28px rgba(0,0,0,0.22)',
                cursor: 'pointer',
              }}
              {...hoverify('#8b8b8b', '#7a7a7a')}
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
                backgroundColor: '#6b7551',
                borderRadius: 32,
                border: 'none',
                color: 'white',
                fontSize: 42,
                fontWeight: 800,
                boxShadow: '0 16px 28px rgba(0,0,0,0.22)',
                cursor: 'pointer',
              }}
              {...hoverify('#6b7551', '#5e6849')}
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
  const TITLE_FONT_SIZE = 38;

  const makeTempCardStyle = (active, borderColor) => ({
    width: 350,
    height: 200,
    borderRadius: 32,
    border: active ? `4px solid ${borderColor}` : '4px solid #e5e7eb',
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
    fontSize: 26,
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
    fontSize: 28,
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
                style={makeTempCardStyle(temp === 'ice', '#2563eb')}
              >
                <div style={{ fontSize: 43 }}>🧊</div>
                <div>차갑게</div>
              </button>

              {/* 따뜻하게 */}
              <button
                onClick={() => setTemp('hot')}
                style={makeTempCardStyle(temp === 'hot', '#f97316')}
              >
                <div style={{ fontSize: 43 }}>🔥</div>
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
                <div style={{ fontSize: 52 }}>🛍️</div>
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
                <div style={{ fontSize: 52 }}>🍽️</div>
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
                width: '100%',
                padding: '24px 20px',
                backgroundColor: '#0f7132',
                borderRadius: 24,
                border: 'none',
                color: 'white',
                fontSize: 28,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 18px 32px rgba(0,0,0,0.25)',
              }}
              {...hoverify('#0f7132', '#0b5a27')}
            >
              적용하기
            </button>

            {/* 아래 두 개 버튼 (취소 / 옵션 더보기) */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 20,
              }}
            >
              <button
                onClick={onBack}
                style={{
                  flex: 1,
                  padding: '20px 20px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: 24,
                  border: 'none',
                  color: '#4b5563',
                  fontSize: 24,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 10px 22px rgba(0,0,0,0.18)',
                }}
              >
                취소하기
              </button>

              {onMoreOptions && (
                <button
                  onClick={onMoreOptions}
                  style={{
                    flex: 1,
                    padding: '20px 20px',
                    backgroundColor: '#6b7056',
                    borderRadius: 24,
                    border: 'none',
                    color: '#ffffff',
                    fontSize: 24,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 10px 22px rgba(0,0,0,0.18)',
                  }}
                >
                  옵션 더보기
                </button>
              )}
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
  basePrice = 0,
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
    border: active ? '4px solid #0f7132' : '4px solid #d1d5db',
    backgroundColor: active ? '#effdf3' : 'white',
    boxShadow: active
      ? '0 14px 30px rgba(0,0,0,0.18)'
      : '0 10px 22px rgba(0,0,0,0.10)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 24,
    fontWeight: 800,
    cursor: 'pointer',
    padding: 16,
    gap: 6,
  });

  const milkButton = (active) => ({
    width: 210,
    height: 160,
    borderRadius: 28,
    border: active ? '4px solid #0f7132' : '4px solid #d1d5db',
    backgroundColor: active ? '#effdf3' : 'white',
    boxShadow: active
      ? '0 14px 30px rgba(0,0,0,0.18)'
      : '0 10px 22px rgba(0,0,0,0.10)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 22,
    fontWeight: 700,
    cursor: 'pointer',
    gap: 4,
  });

  const calcTotal = () => {
    let price = basePrice || 0;

    const extraShotCost = Math.max(shot - 2, 0) * 500;
    price += extraShotCost;

    if (size === 'big') price += 500;
    if (size === 'huge') price += 1000;

    if (milk === 'lowfat') price += 500;
    if (milk === 'soy') price += 500;
    if (milk === 'oat') price += 500;

    return price;
  };

  const totalPrice = calcTotal();

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
                <div style={{ fontSize: 26 }}>기본</div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>
                  360ml
                </div>
              </button>

              <button
                onClick={() => setSize && setSize('big')}
                style={cupButton(200, 180, size === 'big')}
              >
                <div style={{ fontSize: 26 }}>큰 컵</div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>
                  470ml
                </div>
                <div style={{ fontSize: 18, color: '#0f7132' }}>
                  +500원
                </div>
              </button>

              <button
                onClick={() => setSize && setSize('huge')}
                style={cupButton(200, 200, size === 'huge')}
              >
                <div style={{ fontSize: 26 }}>아주 큰 컵</div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>
                  650ml
                </div>
                <div style={{ fontSize: 18, color: '#0f7132' }}>
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
            <div style={{ fontSize: 36, fontWeight: 900 }}>
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
                  border: '4px solid #d1d5db',
                  backgroundColor: 'white',
                  fontSize: 40,
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
                      fontSize: 24,
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
                  backgroundColor: '#0f7132',
                  color: 'white',
                  fontSize: 42,
                  fontWeight: 900,
                }}
              >
                +
              </button>
            </div>

            <div style={{ fontSize: 22, color: '#6b7280' }}>
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
                <div style={{ color: '#0f7132' }}>+500원</div>
              </button>

              <button
                onClick={() => setMilk && setMilk('soy')}
                style={milkButton(milk === 'soy')}
              >
                <div>두유</div>
                <div style={{ color: '#0f7132' }}>+500원</div>
              </button>

              <button
                onClick={() => setMilk && setMilk('oat')}
                style={milkButton(milk === 'oat')}
              >
                <div>귀리우유</div>
                <div style={{ color: '#0f7132' }}>+500원</div>
              </button>
            </div>
          </div>

          {/* 합계 + 버튼 */}
          <div
            style={{
              fontSize: 42,
              fontWeight: 900,
              textAlign: 'center',
              color: '#0f7132',
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
                backgroundColor: '#d1d5db',
                border: 'none',
                fontSize: 32,
                fontWeight: 800,
                color: '#4b5563',
                boxShadow: '0 12px 26px rgba(0,0,0,0.15)',
              }}
            >
              취소하기
            </button>

            <button
              onClick={() => onApply && onApply(totalPrice)}
              style={{
                width: 420,
                height: 150,
                borderRadius: 32,
                backgroundColor: '#0f7132',
                border: 'none',
                fontSize: 32,
                fontWeight: 900,
                color: 'white',
                boxShadow: '0 12px 26px rgba(0,0,0,0.25)',
              }}
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
  const tempColor = temp === 'hot' ? '#FF6B6B' : '#2986FF';
  const name = selected.name || '';

  const dineText =
    dine === 'takeout' ? '포장해서 드시겠어요?' : '매장에서 드시겠어요?';

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
          {/* 음료 카드 (이미지/이모지) */}
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
            }}
          >
            {selected.emoji || '🍹'}
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
            <span style={{ color: '#166534' }}>{name}</span>
            {eulReul(name)}
            <br />
            <span>{dineText}</span>
          </div>

          {/* ✅ 옵션 요약 – 화면 가로만큼 꽉 찬 회색 박스 */}
          <div
            style={{
              marginTop: 24,
              padding: '18px 32px',
              borderRadius: 0,
              backgroundColor: '#f3f4f6',
              color: '#4b5563',
              fontSize: 20,
              fontWeight: 600,
              display: 'block',
              width: '100%',
              maxWidth: 1000,
              boxSizing: 'border-box',
            }}
          >
            {optionLine}
          </div>

          {/* 그대로 주문하기 */}
          <button
            onClick={onDirectOrder}
            style={{
              marginTop: 60,
              width: 800,
              height: 140,
              borderRadius: 32,
              backgroundColor: '#0f7132',
              border: 'none',
              color: 'white',
              fontSize: 40,
              fontWeight: 900,
              boxShadow: '0 20px 32px rgba(0,0,0,0.28)',
              cursor: 'pointer',
            }}
            {...hoverify('#0f7132', '#0b5a27')}
          >
            그대로 주문하기
          </button>

          {/* 아래 두 버튼 */}
          <div
            style={{
              marginTop: 36,
              display: 'flex',
              justifyContent: 'center',
              gap: 40,
            }}
          >
            {/* ✅ 왼쪽: 다른 메뉴 선택하기 (메뉴 화면으로) */}
            <button
              onClick={onChangeMenu}
              style={{
                width: 360,
                height: 120,
                backgroundColor: '#8b8b8b',
                borderRadius: 32,
                border: 'none',
                color: 'white',
                fontSize: 32,
                fontWeight: 800,
                boxShadow: '0 16px 28px rgba(0,0,0,0.22)',
                cursor: 'pointer',
              }}
            >
              다른 메뉴
              <br />
              선택하기
            </button>

            {/* ✅ 오른쪽: 온도·포장 바꾸기 (기본 옵션 화면으로) */}
            <button
              onClick={onBack}
              style={{
                width: 360,
                height: 120,
                backgroundColor: '#6b7551',
                borderRadius: 32,
                border: 'none',
                color: 'white',
                fontSize: 32,
                fontWeight: 800,
                boxShadow: '0 16px 28px rgba(0,0,0,0.22)',
                cursor: 'pointer',
              }}
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
          }}
        >
          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              marginBottom: 60,
            }}
          >
            <span style={{ color: '#0b4a23' }}>결제 수단</span>을
            선택해주세요
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 50,
            }}
          >
            <button
              onClick={onSelectCard}
              style={{
                width: 260,
                height: 330,
                backgroundColor: '#fdf6d6',
                border: '1px solid #f5e7a9',
                borderRadius: 20,
                boxShadow: '0 8px 15px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 80,
                  marginBottom: 12,
                }}
              >
                💳
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 'bold',
                  color: '#0b4a23',
                }}
              >
                카드
              </div>
            </button>

            <button
              onClick={onSelectMobile}
              style={{
                width: 260,
                height: 330,
                backgroundColor: '#fdf6d6',
                border: '1px solid #f5e7a9',
                borderRadius: 20,
                boxShadow: '0 8px 15px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 10,
              }}
            >
              <div
                style={{
                  fontSize: 80,
                  marginBottom: 12,
                }}
              >
                📱
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 'bold',
                  color: '#0b4a23',
                }}
              >
                모바일 페이
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 16,
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
export function ScreenCard({ payAmount = 0, onProcess, onBack, onShowOrder, }) {
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
            justifyContent: 'space-between',
            gap: 40,
          }}
        >
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
                fontSize: 44,
                fontWeight: 900,
                lineHeight: 1.4,
              }}
            >
              <span style={{ color: '#0f7132' }}>신용카드</span>를 넣어주세요
            </div>

            <div
              style={{
                marginTop: 10,
                marginBottom: 10,
                cursor: 'pointer',
              }}
              onClick={onProcess}
            >
              <span style={{ fontSize: 160 }}>💳</span>
            </div>

            <div
              style={{
                fontSize: 30,
                fontWeight: 800,
                color: '#0f7132',
              }}
            >
              결제금액: {amountText}원
            </div>

            <button
              type="button"
              onClick={onShowOrder} 
              style={{
                marginTop: 10,
                padding: '12px 32px',
                borderRadius: 16,
                border: 'none',
                backgroundColor: '#6b7056',
                color: '#ffffff',
                fontSize: 20,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              주문목록 보기
            </button>
          </div>

          <div
            style={{
              width: '100%',
              marginBottom: 40,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24,
            }}
          >
            <button
              onClick={onBack}
              style={{
                width: '100%',
                maxWidth: 720,
                padding: '26px 40px',
                backgroundColor: '#0f7132',
                borderRadius: 28,
                border: 'none',
                color: '#ffffff',
                fontSize: 26,
                fontWeight: 800,
                boxShadow: '0 18px 30px rgba(0,0,0,0.28)',
                cursor: 'pointer',
              }}
              {...hoverify('#0f7132', '#0b5a27')}
            >
              다른 수단으로 결제하기
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
export function ScreenMobile({ payAmount = 0, onProcess, onBack, onShowOrder, }) {
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
            justifyContent: 'space-between',
            gap: 40,
          }}
        >
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
                fontSize: 44,
                fontWeight: 900,
                lineHeight: 1.4,
              }}
            >
              <span style={{ color: '#0f7132' }}>바코드</span>를 인식해주세요
            </div>

            <div
              style={{
                marginTop: 10,
                marginBottom: 10,
                cursor: 'pointer',
              }}
              onClick={onProcess}
            >
              <span style={{ fontSize: 160 }}>📲</span>
            </div>

            <div
              style={{
                fontSize: 30,
                fontWeight: 800,
                color: '#0f7132',
              }}
            >
              결제금액: {amountText}원
            </div>

            <button
              type="button"
              onClick={onShowOrder}
              style={{
                marginTop: 10,
                padding: '12px 32px',
                borderRadius: 16,
                border: 'none',
                backgroundColor: '#6b7056',
                color: '#ffffff',
                fontSize: 20,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              주문목록 보기
            </button>
          </div>

          <div
            style={{
              width: '100%',
              marginBottom: 40,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24,
            }}
          >
            <button
              onClick={onBack}
              style={{
                width: '100%',
                maxWidth: 720,
                padding: '26px 40px',
                backgroundColor: '#0f7132',
                borderRadius: 28,
                border: 'none',
                color: '#ffffff',
                fontSize: 26,
                fontWeight: 800,
                boxShadow: '0 18px 30px rgba(0,0,0,0.28)',
                cursor: 'pointer',
              }}
              {...hoverify('#0f7132', '#0b5a27')}
            >
              다른 수단으로 결제하기
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
                border: '1px solid #e5e7eb',
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

  // 🔐 단일메뉴 NFC용 도장 적립 상태들
  const [showStampModal, setShowStampModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('010');
  const [stampStep, setStampStep] = useState('input'); // 'input' | 'complete'

  // ✅ 타이머: 기본 10초 카운트다운 + 모달 열리면 일시정지
  useEffect(() => {
    // 도장 모달 열려 있고, 스탬프 기능 활성 상태라면 타이머 멈춤
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

  // 주문번호 표시
  const displayOrder =
    typeof orderNumber === 'number' ? orderNumber : '—';

  // 📞 전화번호 포맷터
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
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40,
          position: 'relative',
        }}
      >
        {/* 기본 완료 화면 내용 (개인화 / 단일메뉴 공통) */}
        <div
          style={{
            width: '100%',
            maxWidth: 1080,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 48,
          }}
        >
          <div style={{ fontSize: 52, fontWeight: 900 }}>
            주문이 완료되었어요
          </div>

          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: '#166534',
            }}
          >
            주문번호
          </div>

          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: '#166534',
            }}
          >
            {displayOrder}
          </div>

          <div
            style={{
              fontSize: 24,
              color: '#111827',
            }}
          >
            주문번호 확인 후 카운터에서 음료를 받아주세요
          </div>

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
              <span style={{ fontSize: 28 }}>%</span>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                }}
              >
                쿠폰 적립 내역
              </span>
            </div>

            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: '#166534',
                marginBottom: 6,
              }}
            >
              3회 적립
            </div>

            <div
              style={{
                fontSize: 18,
                color: '#4b5563',
              }}
            >
              10회 적립 후,{' '}
              <b style={{ color: '#166534' }}>결제 시 2,000원</b>이 자동으로
              할인됩니다.
            </div>
          </div>

          {/* ⏱ 10초 카운트다운 표시 */}
          <div
            style={{
              fontSize: 18,
              color: '#6b7280',
              textDecoration: 'underline',
              textUnderlineOffset: '4px',
              textDecorationThickness: '1.5px',
              textDecorationColor: '#9ca3af',
            }}
          >
            {seconds}초 후 자동 닫힘
          </div>

          {/* ✅ 단일메뉴 NFC일 때만 노출되는 버튼 */}
          {enableStamp && (
            <button
              onClick={() => {
                setPhoneNumber('010');
                setStampStep('input');
                setShowStampModal(true);
              }}
              style={{
                width: 800,
                maxWidth: '100%',
                height: 120,
                backgroundColor: '#0f4c18',
                borderRadius: 32,
                border: 'none',
                color: 'white',
                fontSize: 36,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 16px 28px rgba(0,0,0,0.3)',
              }}
              {...hoverify('#0f4c18', '#0b3d12')}
            >
              할인 도장 적립하기
            </button>
          )}

          {/* 공통: 처음으로 버튼 */}
          <button
            onClick={onReset}
            style={{
              width: 800,
              maxWidth: '100%',
              height: 120,
              backgroundColor: '#166534',
              borderRadius: 32,
              border: 'none',
              color: 'white',
              fontSize: 36,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 16px 28px rgba(0,0,0,0.25)',
            }}
            {...hoverify('#166534', '#0f5132')}
          >
            처음으로
          </button>
        </div>

        {/* ✅ 단일메뉴 NFC에서만 표시되는 도장 적립 모달 */}
        {enableStamp && showStampModal && (
          <div
            style={{
              position: 'fixed',      // ✅ 화면 기준으로 고정
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,              // ✅ 네 방향 다 0
              backgroundColor: 'rgba(0,0,0,0.75)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,           // ✅ 가장 위로
            }}
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
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              }}
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
                        backgroundColor: '#e5e7eb',
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
                        backgroundColor: '#0f4c18',
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
                        color: '#0f4c18',
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
                onClick={() => setShowStampModal(false)}
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
    currentItems.length < itemsPerPage || endIdx >= cart.length;

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
          width: "100%",
          height: "100%",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 40,
          paddingBottom: 40,
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* 타이틀 */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            marginBottom: 30,
          }}
        >
          장바구니
        </div>

        {/* 메인 컨테이너 (피그마 965 x 1240 비율) */}
        <div
          style={{
            position: "relative",
            width: 880,
            height: 1130,
            maxWidth: "100%",
            margin: "0 auto",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* 왼쪽 화살표 */}
          {totalPages > 1 && currentPage > 0 && (
            <button
              onClick={handlePrevPage}
              style={{
                position: "absolute",
                left: -60,
                top: "50%",
                transform: "translateY(-50%)",
                width: 50,
                height: 120,
                borderRadius: 16,
                border: "none",
                backgroundColor: "#064e3b",
                color: "white",
                fontSize: 32,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
                zIndex: 10,
              }}
              {...hoverify("#064e3b", "#022c22")}
            >
              ◀
            </button>
          )}

          {/* 오른쪽 화살표 */}
          {totalPages > 1 && currentPage < totalPages - 1 && (
            <button
              onClick={handleNextPage}
              style={{
                position: "absolute",
                right: -60,
                top: "50%",
                transform: "translateY(-50%)",
                width: 50,
                height: 120,
                borderRadius: 16,
                border: "none",
                backgroundColor: "#064e3b",
                color: "white",
                fontSize: 32,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
                zIndex: 10,
              }}
              {...hoverify("#064e3b", "#022c22")}
            >
              ▶
            </button>
          )}

          {/* 2 x 2 그리드 (카드 450 x 550, 간격 140 느낌) */}
          <div
            style={{
              width: 880,
              height: 1130,
              display: "grid",
              gridTemplateColumns: "repeat(2, 450px)",
              gridTemplateRows: "repeat(2, 550px)",
              justifyContent: "space-between",
              alignContent: "space-between",
              rowGap: 100,
              columnGap: 50,
              boxSizing: "border-box",
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
                  border: "3px dashed #22c55e",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    width: 110,
                    height: 110,
                    borderRadius: "50%",
                    border: "5px solid #22c55e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 18,
                  }}
                >
                  <span
                    style={{
                      fontSize: 68,
                      fontWeight: 700,
                      color: "#22c55e",
                      marginTop: -4,
                    }}
                  >
                    +
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#065f46",
                    textAlign: "center",
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
                position: "absolute",
                bottom: -40,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {Array.from({ length: totalPages }).map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    width: idx === currentPage ? 12 : 8,
                    height: idx === currentPage ? 12 : 8,
                    borderRadius: "50%",
                    backgroundColor:
                      idx === currentPage ? "#064e3b" : "#d1d5db",
                    transition: "all 0.3s",
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
            display: "flex",
            flexDirection: "row",
            gap: 40,
          }}
        >
          <button
            onClick={onReset}
            style={{
              width: 260,
              height: 110,
              borderRadius: 32,
              border: "none",
              backgroundColor: "#9b9b9b",
              color: "#ffffff",
              fontSize: 34,
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 16px 28px rgba(0,0,0,0.25)",
            }}
            {...hoverify("#9ca3af", "#6b7280")}
          >
            처음으로
          </button>

          <button
            onClick={handleCheckoutClick}
            disabled={!hasItems}
            style={{
              width: 260,
              height: 110,
              borderRadius: 32,
              border: "none",
              backgroundColor: hasItems ? "#0b5d35" : "#d1d5db",
              color: "#ffffff",
              fontSize: 34,
              fontWeight: 900,
              cursor: hasItems ? "pointer" : "not-allowed",
              boxShadow: hasItems
                ? "0 18px 34px rgba(0,0,0,0.35)"
                : "none",
              opacity: hasItems ? 1 : 0.5,
            }}
            {...(hasItems ? hoverify("#064e3b", "#022c22") : {})}
          >
            결제하기
          </button>
        </div>

        {/* 받을 방법 선택 모달 (전체 화면 덮기) */}
        {showDineModal && (
          <div
            style={{
              position: "fixed",          // ✅ 화면에 고정
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,                  // ✅ 네 방향 다 0 → 항상 전체 화면
              backgroundColor: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,               // ✅ 어떤 내용 위에도 올라오도록
            }}
            onClick={() => setShowDineModal(false)}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: 32,
                padding: 50,
                maxWidth: 520,
                textAlign: "center",
                boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
              }}
              onClick={(e) => e.stopPropagation()}   // 모달 안 클릭 시 닫히지 않게
            >
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 900,
                  marginBottom: 36,
                }}
              >
                받을 방법을 선택해주세요
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 28,
                  justifyContent: "center",
                  marginBottom: 30,
                }}
              >
                {/* 포장하기 */}
                <button
                  onClick={() => handleDineSelect("takeout")}
                  style={{
                    width: 210,
                    height: 260,
                    backgroundColor: "#FEFCE8",
                    border: "3px solid #6B705C",
                    borderRadius: 28,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 18,
                    boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
                  }}
                  {...hoverify("#fffbeb", "#fef3c7")}
                >
                  <div style={{ fontSize: 80 }}>🛍️</div>
                  <div
                    style={{
                      fontSize: 30,
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
                    width: 210,
                    height: 260,
                    backgroundColor: "#fffbeb",
                    border: "3px solid #6B705C",
                    borderRadius: 28,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 18,
                    boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
                  }}
                  {...hoverify("#FEFCE8", "#F7F3D6")}
                >
                  <div style={{ fontSize: 80 }}>🍽️</div>
                  <div
                    style={{
                      fontSize: 30,
                      fontWeight: 800,
                      color: "#064e3b",
                    }}
                  >
                    먹고 가기
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowDineModal(false)}
                style={{
                  marginTop: 8,
                  padding: "14px 32px",
                  backgroundColor: "#8B8B7A",
                  color: "white",
                  border: "none",
                  borderRadius: 16,
                  fontSize: 20,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
                {...hoverify("#6b7280", "#4b5563")}
              >
                ✕ 닫기
              </button>
            </div>
          </div>
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
  const badgeColor = options?.temp === "hot" ? "#ef4444" : "#2563eb";

  return (
    <div
      style={{
        width: 420,
        height: 500,
        display: "flex",
        flexDirection: "column",
        padding: 24,
        borderRadius: 24,
        border: "3px solid #0f5132",
        backgroundColor: "white",
        boxShadow: "0 14px 26px rgba(0,0,0,0.18)",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* 온도 배지 */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 18,
          backgroundColor: badgeColor,
          color: "white",
          padding: "6px 14px",
          borderRadius: 14,
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        {tempBadge}
      </div>

      {/* 상단 이미지 + 이름/가격 */}
      <div
        style={{
          marginTop: 40,
          marginBottom: 20,
          display: "flex",
          gap: 18,
        }}
      >
        <div
          style={{
            width: 110,
            height: 150,
            borderRadius: 18,
            backgroundColor: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
          }}
        >
          {menu.emoji || "☕"}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
            }}
          >
            {menu.name}
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#0f766e",
              fontWeight: 800,
            }}
          >
            {menu.price.toLocaleString()}원
          </div>
        </div>
      </div>

      {/* 중앙: 수량 컨트롤 */}
      <div
        style={{
          marginTop: 10,
          marginBottom: 26,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 18,
        }}
      >
        <button
          onClick={() => onQtyChange(item.id, -1)}
          style={{
            width: 60,
            height: 60,
            borderRadius: 14,
            border: "2px solid #d1d5db",
            background: "white",
            fontSize: 24,
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          -
        </button>

        <div
          style={{
            width: 40,
            textAlign: "center",
            fontSize: 26,
            fontWeight: 900,
          }}
        >
          {qty}
        </div>

        <button
          onClick={() => onQtyChange(item.id, +1)}
          style={{
            width: 70,
            height: 70,
            borderRadius: 14,
            border: "none",
            background: "#064e3b",
            color: "white",
            fontSize: 26,
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          +
        </button>
      </div>

      {/* 하단: 삭제 버튼 */}
      <div
        style={{
          marginTop: "auto",
          width: "100%",
        }}
      >
        <button
          onClick={() => onRemove(item.id)}
          style={{
            width: "100%",
            height: 70,
            borderRadius: 18,
            border: "none",
            background: "#7b7b7b",
            color: "white",
            fontSize: 20,
            fontWeight: 800,
            cursor: "pointer",
          }}
          {...hoverify("#6b7280", "#4b5563")}
        >
          🗑 삭제
        </button>
      </div>
    </div>
  );
}



