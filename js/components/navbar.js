// ===============================
//  NAVBAR SCROLL SYSTEM
// ===============================

const navbar = document.querySelector(".navbar");
const announcementBar = document.querySelector(".announcement");

let isCartOpen = false;

if (navbar) {

  // ===============================
  //  PAGE MODE
  // ===============================
  const body = document.body;

  const isOverlayPage =
    body.classList.contains("home-page") ||
    body.classList.contains("lookbook-page");

  let ticking = false;

  // ===============================
  //  UPDATE NAVBAR
  // ===============================
  function updateNavbar() {

    const scrollY = window.scrollY;

    // ===============================
    //  COLOR STATE
    // ===============================
    if (isOverlayPage) {

      navbar.classList.toggle("scrolled", scrollY > 80);

    } else {

      // always white on non-overlay pages
      navbar.classList.add("scrolled");

    }

    // ===============================
    //  HEADER COLLAPSE SYSTEM
    // ===============================
    const shouldCollapse = scrollY > 40;

    // announcement visibility
    if (announcementBar) {
      announcementBar.classList.toggle("hidden", shouldCollapse);
    }

    // layout control
    body.classList.toggle("header-collapsed", shouldCollapse);

    ticking = false;
  }

  // ===============================
  //  SCROLL HANDLER
  // ===============================
  function onScroll() {

    // freeze navbar while mobile menu open
    if (document.body.classList.contains("menu-open")) {
      return;
    }

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

  window.addEventListener(
    "scroll",
    onScroll,
    { passive: true }
  );

  window.addEventListener("resize", updateNavbar);
}