// ==========================
// 📄 LOOKBOOK PAGE CONTROLLER
// ==========================

import { renderLookbookCarousel } from "../components/lookbookCarousel.js";

// ==========================
// 🚀 INIT PAGE
// ==========================
function initLookbookPage() {
  const root = document.getElementById("lookbook-root");

  if (!root) {
    console.error("❌ Lookbook root container not found (#lookbook-root)");
    return;
  }

  // 🔥 Mount carousel
  renderLookbookCarousel(root);
}

// ==========================
// 🌐 DOM READY
// ==========================
window.addEventListener("DOMContentLoaded", () => {
  initLookbookPage();
});