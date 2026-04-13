// ===============================
// 🦶 FOOTER (NEWSLETTER LOGIC)
// ===============================

import { handleNewsletterSubscribe } from "../core/newsletter.js";
import { showToast } from "./toast.js";

export function initFooter() {
  const emailInput = document.getElementById("newsletter-email");
  const button = document.getElementById("newsletter-btn");
  const message = document.getElementById("newsletter-message");

  if (!emailInput || !button || !message) {
    console.warn("⚠️ Newsletter elements missing");
    return;
  }

  button.addEventListener("click", async () => {
    const email = emailInput.value;

    // 🔒 loading state
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = "SUBSCRIBING...";

    // clear previous message
    message.textContent = "";

    // 🔥 call core (NOT service directly)
    const result = await handleNewsletterSubscribe(email);

    // 🧠 update UI (neutral)
    message.textContent = result.message;

    // 🔥 toast
    showToast(result.message);

    // reset input if success
    if (result.success) {
      emailInput.value = "";
    }

    // 🔓 restore button
    button.disabled = false;
    button.textContent = originalText;
  });
}