// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


// القيم هودي بتجيبهم من Firebase Console → Project Settings → SDK setup & config
const firebaseConfig = {
  apiKey: "AIzaSyDJrv8qKf61HrribICuJJg9taUt74JC0As",
  projectId: "rayane-website",
  storageBucket: "rayane-website.firebasestorage.app",
  messagingSenderId: "512804216743",
  appId: "1:512804216743:web:be988498dc3a31b4686082",
};

export const app = initializeApp(firebaseConfig);

// Firestore Database
export const db = getFirestore(app);

export const auth = getAuth(app);
