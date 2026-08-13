// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDCP5ngc0sUKmN9jvHbw6s5CWfXv_EmqiA",
  authDomain: "a2-imoveis.firebaseapp.com",
  projectId: "a2-imoveis",
  storageBucket: "a2-imoveis.firebasestorage.app",
  messagingSenderId: "285703062694",
  appId: "1:285703062694:web:97fcc3aa692e40f7c66067",
  measurementId: "G-RBPG1P2K63"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);