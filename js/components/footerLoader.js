// ===============================
// 🦶 FOOTER LOADER (FINAL — DEBUG + PRODUCTION SAFE)
// ===============================

import { initFooter } from "./footer.js";

// ===============================
// 📦 LOAD FOOTER HTML
// ===============================
export async function loadFooter() {
  const container = document.getElementById("footer-container");

  if (!container) {
    console.warn("⚠️ footer-container not found in DOM");
    return;
  }

  try {
    // ✅ FIXED PATH (RELATIVE — WORKS ON ALL PAGES + VERCEL)
    const path = "./footer.html";
    console.log("📦 Fetching footer from:", path);

    const res = await fetch(path);

    console.log("📡 Fetch response status:", res.status);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const html = await res.text();

    // 🔍 DEBUG: Check raw HTML
    console.log("📄 Footer HTML loaded:", html);

    if (!html || !html.trim()) {
      throw new Error("❌ Footer HTML is EMPTY");
    }

    // ✅ Inject HTML
    container.innerHTML = html;

    console.log("✅ Footer injected into DOM");

    // 🔍 DEBUG: Confirm injection
    setTimeout(() => {
      console.log("🧪 Footer container after inject:", container.innerHTML);
    }, 100);

    // ===============================
    // 🚀 INIT FOOTER LOGIC
    // ===============================
    try {
      initFooter();
      console.log("✅ Footer logic initialized");
    } catch (err) {
      console.error("❌ Footer init error:", err);
    }

  } catch (error) {
    console.error("❌ Footer load error:", error);

    // 🚨 FALLBACK UI (VISIBLE DEBUG)
    container.innerHTML = `
      <div style="
        padding: 40px;
        background: #111;
        color: #fff;
        text-align: center;
        font-size: 14px;
        letter-spacing: 0.08em;
      ">
        ⚠️ Footer failed to load<br/>
        <span style="opacity:0.6;">Check console for details</span>
      </div>
    `;
  }
}

// ===============================
// 🚀 AUTO INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DOM loaded → loading footer...");
  loadFooter();
});