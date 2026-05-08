// ===============================
// 🧠 NAVBAR SCROLL SYSTEM (FINAL CLEAN + FIXED)
// ===============================

const navbar = document.querySelector(".navbar");
const announcementBar = document.querySelector(".announcement");

let isCartOpen = false;

if (navbar) {

  // ===============================
  // 🧠 PAGE MODE
  // ===============================
  const body = document.body;

  const isOverlayPage =
    body.classList.contains("home-page") ||
    body.classList.contains("lookbook-page");

  let ticking = false;

  // ===============================
  // 🔄 UPDATE NAVBAR
  // ===============================
  function updateNavbar() {
    const scrollY = window.scrollY;

    // ===============================
    // 🎨 COLOR STATE
    // ===============================
    if (isOverlayPage) {
      navbar.classList.toggle("scrolled", scrollY > 80);
    } else {
      navbar.classList.add("scrolled"); // always white on non-overlay pages
    }

    // ===============================
    // 📦 HEADER COLLAPSE SYSTEM (FIXED)
    // ===============================
    const shouldCollapse = scrollY > 40;

    // 🔥 control announcement (visual)
    if (announcementBar) {
      announcementBar.classList.toggle("hidden", shouldCollapse);
    }

    // 🔥 control layout (this fixes gap / white bar)
    body.classList.toggle("header-collapsed", shouldCollapse);

    ticking = false;
  }

  // ===============================
  // ⚡ SCROLL HANDLER
  // ===============================
  function onScroll() {
    if (isCartOpen) {
      updateNavbar();
      return;
    }

    if (!ticking) {
      window.requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }

  // ===============================
  // 🚀 INIT
  // ===============================
  window.addEventListener("load", updateNavbar);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateNavbar);
}