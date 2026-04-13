// ===============================
// 🔥 FIREBASE CORE (SINGLE SOURCE)
// ===============================

// Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

// Firestore
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Auth
import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


// ===============================
// 🔑 CONFIG
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyA_ADIYjoMUJiDMKbv0AInVSS2DG2dLeqM",
  authDomain: "lesage-mnl-4a217.firebaseapp.com",
  projectId: "lesage-mnl-4a217",
  storageBucket: "lesage-mnl-4a217.firebasestorage.app",
  messagingSenderId: "835289684174",
  appId: "1:835289684174:web:d8676085592e0ee5c3589f"
};


// ===============================
// 🚀 INIT APP
// ===============================
const app = initializeApp(firebaseConfig);


// ===============================
// 📦 EXPORTS
// ===============================
export const db = getFirestore(app);
export const auth = getAuth(app);


// ===============================
// 🔐 AUTH PERSISTENCE (CRITICAL)
// ===============================
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Auth persistence enabled");
  })
  .catch((error) => {
    console.error("❌ Auth persistence error:", error);
  });