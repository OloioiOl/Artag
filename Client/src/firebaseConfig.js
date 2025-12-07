// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCr11Syu3pcaIOXOToaA394g_un55YDZ-c",
  authDomain: "capstone-a65d6.firebaseapp.com",
  projectId: "capstone-a65d6",
  storageBucket: "capstone-a65d6.firebasestorage.app",
  messagingSenderId: "460745462683",
  appId: "1:460745462683:web:a100aea8826140a642c73e",
  measurementId: "G-VW0V3GHKW9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);