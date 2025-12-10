1. ConfigTag.js (Node.js 백엔드 서버)
장바구니 결제 기능 추가로 인해 발생한 데이터베이스 오류를 해결하기 위해 수정.
•	app.post('/api/orders', ...) (주문 저장 API)
o	변경 전: 들어오는 모든 menuId에 대해 total_sales를 +1 증가시킴.
o	변경 후: menuId가 'CART_ORDER'(장바구니 통합 주문 ID)가 아닐 때만 판매량 집계 로직을 실행하도록 if문 예외 처리 추가. 즉 판매량 집계는 되지 않고, GUEST 항목에 아메리카노 외 N건 등으로 기록 (이 부분은 NFC로 다수 메뉴 주문 후 확인 필요)
o	이유: 장바구니 주문은 실제 존재하는 단일 메뉴 ID가 아니므로, DB 업데이트 시 오류가 발생하는 것을 방지.
________________________________________
2. KioskScreens.js (UI 컴포넌트 & 유틸리티)
이미지 표시, 가격 계산 로직의 변화.
•	유틸리티 함수 (상단 추가)
o	getPrice(menu, temp): 메뉴 객체와 온도를 받아서, var_price 맵을 확인해 변동 가격(예: 아이스 3500원)을 반환.
o	calcTotalPrice(menu, temp, size, shot, milk): 옵션(사이즈, 샷, 우유)까지 모두 포함한 최종 가격을 계산.
o	calcCartTotal(cart): 장바구니 배열 전체를 순회하며 (단가 × 수량)의 총합을 계산.
•	ScreenMenu (메뉴판)
o	변경: 기존 emoji 출력 부분을 삭제하고, DB의 images 필드를 확인하여 이미지를 렌더링하도록 수정.
o	디자인: 이미지 비율이 제각각이어도 깨지지 않도록 object-fit: contain과 clamp 등을 사용해 레이아웃 보정.
•	ScreenConfirm (첫 확인 화면)
o	이미지: 선택한 temp('hot'/'ice')에 따라 동적으로 다른 이미지 파일(item.images[temp])을 표시.ㅎg
o	가격: getPrice 함수를 사용하여 온도에 따른 정확한 가격(예: 아이스 선택 시 가격 인상)을 표시.
•	ScreenAdvOptions (옵션 상세 선택)
o	리팩토링: 내부에서 calcTotal 함수로 따로 계산하던 로직을 삭제.
o	변경: 상단에 만든 공용 함수 calcTotalPrice를 사용하여 가격 계산 로직을 일원화.
•	ScreenFinalConfirm (최종 확인)
o	이미지: 옵션 변경 후 돌아왔을 때 변경된 온도 이미지를 반영.
o	가격: 기존엔 기본 가격만 표시했으나, calcTotalPrice를 적용하여 옵션(샷, 사이즈 등)이 포함된 최종 금액을 표시하도록 수정.
•	CartItemCard (장바구니 카드)
o	이미지: 카드에 담긴 options.temp 정보에 맞춰 Hot/Ice 이미지를 구분하여 표시.
o	가격: getPrice를 적용하여 아이스 메뉴인 경우 인상된 가격으로 표시.
________________________________________
3. KioskApp.js (프론트엔드 로직 컨트롤러)
화면 간 데이터 전달 방식과 결제 금액 산정 로직이 수정.
•	ScreenAdvOptions 렌더링 부분
o	변경: 기존에는 계산된 basePrice를 넘겨줬으나, 이제는 메뉴 객체 자체(menu)와 온도(temp)를 넘겨주도록 변경. (계산은 컴포넌트 내부에서 공용 함수로 수행)
•	결제 금액 변수 (billPrice) 정의
o	변경: 결제 화면(ScreenCard, ScreenMobile)으로 넘길 금액을 결정할 때 로직 분기 추가.
	단일 메뉴 흐름(isSingleFlow)일 때: calcCartTotal(cart) 사용하여 장바구니 총액 계산.
	일반 주문 흐름일 때: finalPrice 혹은 getPrice 사용.
o	이유: 장바구니에 여러 개를 담아도 메뉴 하나만 결제되는 버그 수정.
•	useEffect (주문 전송 로직)
o	변경: screen === 'processing'일 때 전송하는 데이터(payload) 구조를 이원화.
o	Case 1 (장바구니): menuId를 'CART_ORDER'로 설정하고, 메뉴 이름을 "아메리카노 외 N건"으로 가공, 가격은 calcCartTotal 총액으로 전송.
o	Case 2 (일반): 기존 로직 유지하되, 옵션 없이 바로 주문할 경우를 대비해 getPrice로 가격 재계산 로직 추가.
