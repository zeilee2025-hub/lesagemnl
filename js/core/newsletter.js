// ===============================
// 🧠 NEWSLETTER CORE
// ===============================

import { subscribeEmail } from "../services/newsletterService.js";

// ===============================
// 📧 EMAIL VALIDATION (STRICT)
// ===============================
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// ===============================
// 🚀 MAIN HANDLER
// ===============================
export async function handleNewsletterSubscribe(email) {
  try {
    // normalize input
    const cleanEmail = email.trim().toLowerCase();

    // ❌ empty check
    if (!cleanEmail) {
      return {
        success: false,
        message: "Enter your email."
      };
    }

    // ❌ invalid format
    if (!isValidEmail(cleanEmail)) {
      return {
        success: false,
        message: "Invalid email format."
      };
    }

    // 🔥 call service
    return await subscribeEmail(cleanEmail);

  } catch (error) {
    console.error("❌ Core error:", error);

    return {
      success: false,
      message: "Something went wrong."
    };
  }
}