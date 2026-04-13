// ===============================
// 🦶 FOOTER LOADER (STEP 1 FIX)
// ===============================

import { initFooter } from "./footer.js";

export async function loadFooter() {
  try {
    // ✅ FIXED PATH (footer is in ROOT)
    const res = await fetch("./footer.html");

    if (!res.ok) {
      throw new Error("Failed to load footer.html");
    }

    const html = await res.text();

    const container = document.getElementById("footer-container");

    if (!container) {
      console.warn("⚠️ footer-container not found");
      return;
    }

    container.innerHTML = html;

    // 🔥 INIT AFTER LOAD
    initFooter();

  } catch (error) {
    console.error("❌ Footer load error:", error);
  }
}

// ✅🔥 ADD THIS
document.addEventListener("DOMContentLoaded", () => {
  loadFooter();
});