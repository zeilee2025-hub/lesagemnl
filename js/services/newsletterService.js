// ===============================
// 📩 NEWSLETTER SERVICE (FIRESTORE)
// ===============================

import { db } from "../core/firebase.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const COLLECTION_NAME = "newsletter_subscribers";

// ===============================
// 📥 SUBSCRIBE EMAIL
// ===============================
export async function subscribeEmail(email) {
  try {
    // normalize (extra safety)
    const cleanEmail = email.trim().toLowerCase();

    // reference using email as ID
    const ref = doc(db, COLLECTION_NAME, cleanEmail);

    // 🔥 directly attempt to create (NO READ)
    await setDoc(ref, {
      email: cleanEmail,
      createdAt: serverTimestamp()
    });

    return {
      success: true,
      message: "Subscribed successfully."
    };

  } catch (error) {
    console.error("❌ Newsletter error:", error);

    // 🔥 if blocked by rules (duplicate)
    if (error.code === "permission-denied") {
      return {
        success: false,
        message: "Already subscribed."
      };
    }

    return {
      success: false,
      message: "Something went wrong."
    };
  }
}