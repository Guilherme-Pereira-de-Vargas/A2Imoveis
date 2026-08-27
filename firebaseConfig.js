import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDCP5ngc0sUKmN9jvHbw6s5CWfXv_EmqiA",
  authDomain: "a2-imoveis.firebaseapp.com",
  projectId: "a2-imoveis",
  storageBucket: "a2-imoveis.firebasestorage.app",
  messagingSenderId: "285703062694",
  appId: "1:285703062694:web:97fcc3aa692e40f7c66067",
  measurementId: "G-RBPG1P2K63"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const database = getFirestore(app);

export let analytics;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});