// /* -------------------------------------------------
//  * X. 주문 완료 + 전화번호 적립 화면 (단일 메뉴 NFC용)
//  * ------------------------------------------------- */
// export function ScreenDone({
//   orderNumber,
//   remainingSeconds = 10, // ❗ 안 넘기면 기본 10초
//   onReset,
// }) {
//   const [showStampModal, setShowStampModal] = React.useState(false);
//   const [phoneNumber, setPhoneNumber] = React.useState("010");
//   const [stampStep, setStampStep] = React.useState("input"); // 'input' | 'complete'

//   // 🔔 10초 카운트다운 (모달 열리면 일시정지)
//   const [seconds, setSeconds] = React.useState(remainingSeconds);

//   React.useEffect(() => {
//     // 모달(전화번호 적립 팝업)이 떠 있으면 타이머 멈춤
//     if (showStampModal) return;

//     const timer = setInterval(() => {
//       setSeconds((prev) => {
//         if (prev <= 1) {
//           clearInterval(timer);
//           onReset && onReset(); // 0초 되면 자동으로 처음으로
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     // 언마운트/화면 전환시 타이머 정리
//     return () => clearInterval(timer);
//   }, [showStampModal, onReset]);

//   // 전화번호 표시용 포맷 함수
//   const formatPhoneNumber = (num) => {
//     if (!num) return "";
//     const onlyNum = num.replace(/[^0-9]/g, "");
//     if (onlyNum.length <= 3) return onlyNum;
//     if (onlyNum.length <= 7) {
//       return `${onlyNum.slice(0, 3)}-${onlyNum.slice(3)}`;
//     }
//     return `${onlyNum.slice(0, 3)}-${onlyNum.slice(3, 7)}-${onlyNum.slice(
//       7,
//       11
//     )}`;
//   };

//   const handleNumClick = (digit) => {
//     setPhoneNumber((prev) => {
//       if (prev.length >= 11) return prev; // 최대 11자리
//       return prev + digit;
//     });
//   };

//   const handleClear = () => {
//     setPhoneNumber("010");
//   };

//   return (
//     <ScaledLayout>
//       <div
//         style={{
//           height: "100%",
//           backgroundColor: "#ffffff",
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           padding: 40,
//           position: "relative",
//         }}
//       >
//         {/* 기본 완료 화면 내용 */}
//         <div
//           style={{
//             width: "100%",
//             maxWidth: 1080,
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             textAlign: "center",
//             gap: 48,
//           }}
//         >
//           <div style={{ fontSize: 52, fontWeight: 900 }}>
//             주문이 완료되었어요
//           </div>

//           <div>
//             <div
//               style={{
//                 fontSize: 30,
//                 fontWeight: 700,
//                 color: "#166534",
//               }}
//             >
//               주문번호
//             </div>
//             <div
//               style={{
//                 fontSize: 80,
//                 fontWeight: 900,
//                 color: "#166534",
//               }}
//             >
//               {orderNumber}
//             </div>
//           </div>

//           <div
//             style={{
//               fontSize: 24,
//               color: "#111827",
//             }}
//           >
//             주문번호 확인 후 카운터에서 음료를 받아주세요
//           </div>

//           {/* 쿠폰 적립 안내 박스 */}
//           <div
//             style={{
//               width: "100%",
//               maxWidth: 900,
//               backgroundColor: "#f3f4f6",
//               padding: "30px 40px",
//               borderRadius: 24,
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 gap: 10,
//                 marginBottom: 12,
//               }}
//             >
//               <span style={{ fontSize: 28 }}>%</span>
//               <span
//                 style={{
//                   fontSize: 22,
//                   fontWeight: 800,
//                 }}
//               >
//                 쿠폰 적립 내역
//               </span>
//             </div>

//             <div
//               style={{
//                 fontSize: 32,
//                 fontWeight: 900,
//                 color: "#166534",
//                 marginBottom: 6,
//               }}
//             >
//               3회 적립
//             </div>

//             <div style={{ fontSize: 18, color: "#4b5563" }}>
//               10회 적립 후,{" "}
//               <b style={{ color: "#166534" }}>결제 시 2,000원</b>이 자동으로
//               할인됩니다.
//             </div>
//           </div>

//           {/* 🔔 10초 카운트다운 표시 (내부 state 사용) */}
//           <div
//             style={{
//               fontSize: 18,
//               color: "#6b7280",
//               marginTop: 10,
//               marginBottom: 10,
//               textDecoration: "underline",          
//               textUnderlineOffset: "4px",           
//               textDecorationThickness: "1.5px",
//             }}
//           >
//             {seconds}초 후 자동 닫힘
//           </div>

//           {/* 적립하기 버튼 */}
//           <button
//             onClick={() => {
//               setPhoneNumber("010");
//               setStampStep("input");
//               setShowStampModal(true); // 모달 열리면서 타이머 일시정지
//             }}
//             style={{
//               width: 800,
//               maxWidth: "100%",
//               height: 120,
//               backgroundColor: "#0f4c18",
//               borderRadius: 32,
//               border: "none",
//               color: "white",
//               fontSize: 36,
//               fontWeight: 900,
//               cursor: "pointer",
//               boxShadow: "0 16px 28px rgba(0,0,0,0.3)",
//             }}
//             {...hoverify("#0f4c18", "#0b3d12")}
//           >
//             할인 도장 적립하기
//           </button>

//           {/* 처음으로 버튼 */}
//           <button
//             onClick={onReset}
//             style={{
//               width: 800,
//               maxWidth: "100%",
//               height: 120,
//               backgroundColor: "#166534",
//               borderRadius: 32,
//               border: "none",
//               color: "white",
//               fontSize: 36,
//               fontWeight: 900,
//               cursor: "pointer",
//               boxShadow: "0 16px 28px rgba(0,0,0,0.25)",
//             }}
//             {...hoverify("#166534", "#0f5132")}
//           >
//             처음으로
//           </button>
//         </div>

//         {/* 적립 모달 Overlay */}
//         {showStampModal && (
//           <div
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               width: "100%",
//               height: "100%",
//               backgroundColor: "rgba(0,0,0,0.75)",
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               zIndex: 1000,
//             }}
//           >
//             <div
//               style={{
//                 width: 500,
//                 backgroundColor: "white",
//                 borderRadius: 32,
//                 padding: 40,
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
//               }}
//             >
//               {/* STEP 1: 번호 입력 */}
//               {stampStep === "input" && (
//                 <>
//                   <div
//                     style={{
//                       fontSize: 28,
//                       fontWeight: 800,
//                       marginBottom: 30,
//                     }}
//                   >
//                     핸드폰 번호를 입력해주세요
//                   </div>

//                   {/* 번호 표시창 */}
//                   <div
//                     style={{
//                       width: "100%",
//                       padding: "20px 0",
//                       backgroundColor: "#eee",
//                       borderRadius: 12,
//                       textAlign: "center",
//                       fontSize: 32,
//                       fontWeight: "bold",
//                       letterSpacing: 2,
//                       marginBottom: 30,
//                     }}
//                   >
//                     {formatPhoneNumber(phoneNumber)}
//                   </div>

//                   {/* 키패드 그리드 */}
//                   <div
//                     style={{
//                       display: "grid",
//                       gridTemplateColumns: "1fr 1fr 1fr",
//                       gap: 12,
//                       width: "100%",
//                       marginBottom: 30,
//                     }}
//                   >
//                     {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
//                       <button
//                         key={num}
//                         onClick={() => handleNumClick(num.toString())}
//                         style={keypadBtnStyle}
//                       >
//                         {num}
//                       </button>
//                     ))}
//                     {/* 지움 버튼 */}
//                     <button
//                       onClick={handleClear}
//                       style={{
//                         ...keypadBtnStyle,
//                         backgroundColor: "#e5e7eb",
//                         fontSize: 24,
//                       }}
//                     >
//                       지움
//                     </button>
//                     {/* 0 버튼 */}
//                     <button
//                       onClick={() => handleNumClick("0")}
//                       style={keypadBtnStyle}
//                     >
//                       0
//                     </button>
//                     {/* 완료 버튼 */}
//                     <button
//                       onClick={() => setStampStep("complete")}
//                       style={{
//                         ...keypadBtnStyle,
//                         backgroundColor: "#0f4c18",
//                         color: "white",
//                         fontSize: 24,
//                       }}
//                     >
//                       완료
//                     </button>
//                   </div>
//                 </>
//               )}

//               {/* STEP 2: 적립 완료 */}
//               {stampStep === "complete" && (
//                 <>
//                   <div
//                     style={{
//                       fontSize: 28,
//                       fontWeight: 800,
//                       marginBottom: 10,
//                     }}
//                   >
//                     {phoneNumber.slice(-4)}님,
//                   </div>
//                   <div
//                     style={{
//                       fontSize: 32,
//                       fontWeight: 900,
//                       marginBottom: 40,
//                     }}
//                   >
//                     적립이 완료되었습니다
//                   </div>

//                   {/* 쿠폰 정보 박스 */}
//                   <div
//                     style={{
//                       width: "100%",
//                       backgroundColor: "#f3f4f6",
//                       padding: "30px 20px",
//                       borderRadius: 20,
//                       textAlign: "center",
//                       marginBottom: 40,
//                     }}
//                   >
//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "center",
//                         alignItems: "center",
//                         gap: 10,
//                         marginBottom: 10,
//                       }}
//                     >
//                       <span
//                         style={{
//                           fontSize: 24,
//                           backgroundColor: "black",
//                           color: "white",
//                           borderRadius: "50%",
//                           width: 32,
//                           height: 32,
//                           display: "flex",
//                           alignItems: "center",
//                           justifyContent: "center",
//                         }}
//                       >
//                         %
//                       </span>
//                       <span
//                         style={{
//                           fontSize: 20,
//                           fontWeight: 800,
//                         }}
//                       >
//                         쿠폰 적립 내역
//                       </span>
//                     </div>
//                     <div
//                       style={{
//                         fontSize: 36,
//                         fontWeight: 900,
//                         color: "#0f4c18",
//                         marginBottom: 10,
//                       }}
//                     >
//                       3회 적립
//                     </div>
//                     <div
//                       style={{
//                         fontSize: 14,
//                         color: "#666",
//                       }}
//                     >
//                       10회 적립 후, 다음 결제 시 2,000원이 자동
//                       할인됩니다.
//                     </div>
//                   </div>
//                 </>
//               )}

//               {/* 공통 닫기 버튼 */}
//               <button
//                 onClick={() => setShowStampModal(false)} // 모달 닫히면 타이머 다시 진행
//                 style={{
//                   padding: "15px 40px",
//                   backgroundColor: "#888",
//                   color: "white",
//                   borderRadius: 12,
//                   border: "none",
//                   fontSize: 20,
//                   cursor: "pointer",
//                 }}
//               >
//                 ✕ 닫기
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </ScaledLayout>
//   );
// }

// /* 키패드 버튼 스타일 */
// const keypadBtnStyle = {
//   padding: 20,
//   fontSize: 28,
//   fontWeight: "bold",
//   backgroundColor: "#f0f4f8",
//   border: "none",
//   borderRadius: 12,
//   cursor: "pointer",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
// };
