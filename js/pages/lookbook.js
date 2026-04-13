// ==========================
// 📦 IMPORTS
// ==========================
import { initAnnouncement } from "../components/announcement.js";
import { loadFooter } from "../components/footerLoader.js";
import { renderLookbookCarousel } from "../components/lookbookCarousel.js";


// ==========================
// 🚀 INIT
// ==========================
document.addEventListener("DOMContentLoaded", () => {

  // ==========================
  // 🔝 GLOBAL INIT
  // ==========================
  initAnnouncement();
  loadFooter();


  // ==========================
  // 🔁 LOOKBOOK CAROUSEL
  // ==========================
  const root = document.getElementById("lookbook-root");

  if (root) {
    renderLookbookCarousel(root);
  }

});