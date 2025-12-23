# 🛠️ Kiosk Project Update Log

키오스크 프로젝트의 **장바구니 결제 기능 통합, 이미지 렌더링 방식 개선, 가격 계산 로직 리팩토링**에 대한 업데이트 내역입니다.

## 1. Backend Server (`ConfigTag.js`)

**주요 변경:** 장바구니 결제 시 데이터베이스 집계 오류 해결

* **API 수정 (`app.post('/api/orders')`)**
    * **변경 전:** 모든 `menuId`에 대해 `total_sales`를 +1 증가.
    * **변경 후:** `menuId`가 `'CART_ORDER'`(장바구니 통합 주문 ID)가 아닐 때만 판매량 집계 로직 실행.
    * **처리 방식:** 장바구니 주문은 판매량 집계에서 제외하고, 주문 내역에는 "아메리카노 외 N건" 등의 형태로 기록(GUEST 항목).
    * **이유:** 장바구니 주문은 단일 메뉴 ID가 존재하지 않으므로, DB 업데이트 시 발생하는 예외 상황을 방지하기 위함.

<br>

## 2. UI Components & Utils (`KioskScreens.js`)

**주요 변경:** 이미지 렌더링 고도화 및 가격 계산 로직 유틸리티화

### 🔧 Utility Functions (신규 추가)
* `getPrice(menu, temp)`: 메뉴 객체와 온도를 받아 변동 가격(예: ICE 옵션 추가금) 반환.
* `calcTotalPrice(...)`: 옵션(사이즈, 샷, 우유)을 포함한 최종 단일 메뉴 가격 계산.
* `calcCartTotal(cart)`: 장바구니 전체 항목의 (단가 × 수량) 총합 계산.

### 📱 UI Component Updates
* **ScreenMenu (메뉴판)**
    * 기존 이모지(Emoji) 출력 방식을 제거하고 DB의 `images` 필드를 렌더링하도록 수정.
    * `object-fit: contain` 레이아웃을 적용하여 이미지 비율 보정.
* **ScreenConfirm (첫 확인 화면) & ScreenFinalConfirm (최종 확인)**
    * **이미지:** 선택한 `temp`('hot'/'ice')에 따라 동적 이미지 로딩 (`item.images[temp]`).
    * **가격:** `getPrice` 및 `calcTotalPrice`를 적용하여 옵션이 포함된 정확한 금액 표시.
* **ScreenAdvOptions (상세 옵션)**
    * 내부 계산 로직을 삭제하고 공용 유틸리티 함수 `calcTotalPrice`로 로직 일원화 (리팩토링).
* **CartItemCard (장바구니 카드)**
    * 담긴 옵션(`hot`/`ice`)에 맞춰 아이콘 및 가격(아이스 추가금 등)을 정확히 반영.

<br>

## 3. Frontend Logic (`KioskApp.js`)

**주요 변경:** 화면 간 데이터 전달 최적화 및 결제 금액 산정 로직 수정

* **ScreenAdvOptions 데이터 전달**
    * 기존에 계산된 `basePrice`를 넘기던 방식에서, **메뉴 객체(`menu`)와 온도(`temp`) 자체**를 전달하도록 변경 (계산은 컴포넌트 내부에서 수행).

* **결제 금액 산정 (`billPrice`)**
    * **단일 메뉴 결제 시:** `isSingleFlow` 플래그 확인 후 `calcCartTotal(cart)`로 총액 계산.
    * **일반 주문 시:** `finalPrice` 혹은 `getPrice` 사용.
    * **수정 효과:** 장바구니에 여러 메뉴를 담아도 마지막 하나만 결제되던 버그 수정.

* **주문 전송 로직 (`useEffect`)**
    * `screen === 'processing'` 상태일 때 전송하는 페이로드(`payload`) 구조 이원화.
    * **Case 1 (장바구니 주문):**
        * `menuId`: `'CART_ORDER'`
        * `menuName`: "OOO 외 N건"
        * `totalPrice`: `calcCartTotal` 결과값
    * **Case 2 (일반 주문):**
        * 옵션 없는 주문을 대비해 `getPrice`로 가격 재계산 로직 추가하여 안정성 확보.