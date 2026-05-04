// ===============================
// 🦶 FOOTER (LOGIC ONLY — FINAL)
// ===============================

import { handleNewsletterSubscribe } from "../core/newsletter.js";
import { showToast } from "./toast.js";

// ===============================
// 🚀 INIT FOOTER LOGIC
// ===============================
export function initFooter() {
  const emailInput = document.getElementById("newsletter-email");
  const button = document.getElementById("newsletter-btn");
  const message = document.getElementById("newsletter-message");

  // 🛑 Prevent crash if footer not loaded
  if (!emailInput || !button || !message) {
    console.warn("⚠️ Newsletter elements missing");
    return;
  }

  // ===============================
  // 📩 SUBSCRIBE HANDLER
  // ===============================
  button.addEventListener("click", async () => {
    const email = emailInput.value.trim();

    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = "SUBSCRIBING...";

    message.textContent = "";

    try {
      const result = await handleNewsletterSubscribe(email);

      message.textContent = result.message;
      showToast(result.message);

      if (result.success) {
        emailInput.value = "";
      }

    } catch (err) {
      console.error("❌ Newsletter error:", err);
      message.textContent = "Something went wrong. Try again.";
      showToast("Subscription failed");
    }

    button.disabled = false;
    button.textContent = originalText;
  });

  // ===============================
  // 🎨 ICON INIT (SAFE)
  // ===============================
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 🛟 SAFETY RE-RUN (mobile / delayed DOM)
  setTimeout(() => {
    if (window.lucide) window.lucide.createIcons();
  }, 100);

  setTimeout(() => {
    if (window.lucide) window.lucide.createIcons();
  }, 300);
}