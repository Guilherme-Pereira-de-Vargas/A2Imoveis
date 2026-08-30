import { initializeApp } from "firebase/app";
import { getAuth, browserLocalPersistence } from "firebase/auth";
import { Platform, LogBox } from "react-native";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from 'firebase/functions';
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

// Suppress known Firebase Auth warning in React Native environments
// (the SDK sometimes logs guidance about using the react-native adapter).
LogBox.ignoreLogs(['@firebase/auth: Auth']);


let auth;

if (Platform.OS === "web") {
  // On web, use the standard getAuth (persistence can be configured separately if needed)
  auth = getAuth(app);
} else {
  try {
    const { initializeAuth, getReactNativePersistence } = require('firebase/auth/react-native');
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (e) {
    // If react-native adapter is not available, fall back to getAuth.
    // This may still emit a warning depending on environment.
    auth = getAuth(app);
  }
}

export { auth };


export const database = getFirestore(app);
export const functions = getFunctions(app);


// analytics removed — not used in this project
