import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


// All required firebase keys
const firebaseConfig = {
  apiKey: "AIzaSyDGqkmywdIKf2cG3cskRmxyfa_SDpffPUA",
  authDomain: "islamic-calorie-tracker.firebaseapp.com",
  databaseURL: "https://islamic-calorie-tracker-default-rtdb.firebaseio.com",
  projectId: "islamic-calorie-tracker",
  storageBucket: "islamic-calorie-tracker.firebasestorage.app",
  messagingSenderId: "210601938211",
  appId: "1:210601938211:web:6070a09f39cc3ff2d61096",
  measurementId: "G-NSYQX0VLJR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);