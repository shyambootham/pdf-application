// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "pdfapplication-155c9.firebaseapp.com",
  projectId: "pdfapplication-155c9",
  storageBucket: "pdfapplication-155c9.appspot.com",
  messagingSenderId: "864969249071",
  appId: "1:864969249071:web:1be23edc88db565f7a91da",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
