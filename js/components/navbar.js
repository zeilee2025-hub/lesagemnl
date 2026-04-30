import { renderCart } from "./cartDrawer.js";
import { updateCartBadge } from "../services/cartService.js";

window.addEventListener("load", () => {

  // ===============================
  // 🔥 PAGE ENTER ANIMATION
  // ===============================
  document.body.classList.add("page-enter");

  // ===============================
  // 🔥 INITIAL + REAL-TIME BADGE SYNC
  // ===============================
  updateCartBadge();

  window.addEventListener("cartUpdated", () => {
    updateCartBadge();
  });

  // ===============================
  // 🧠 NAVBAR SCROLL SYSTEM (FINAL CLEAN)
  // ===============================

  const navbar = document.querySelector(".navbar");
  const announcementBar = document.querySelector(".announcement-bar");

  let isCartOpen = false;

  if (navbar) {

    const isOverlayPage = document.body.classList.contains("overlay-page");

    let ticking = false;

    function getTriggerHeight() {
  if (isOverlayPage) {
    const hero =
      document.querySelector(".hero") ||
      document.querySelector(".lookbook-hero");

    if (hero) {
      return hero.offsetHeight - 100; // 🔥 key fix
    }

    return 120; // fallback
  }

  return announcementBar ? announcementBar.offsetHeight : 0;
}

    function updateNavbar() {
      const scrollY = window.scrollY;
      const triggerHeight = getTriggerHeight();

      const isAtTop = scrollY <= triggerHeight;
      const isPastTrigger = scrollY > triggerHeight;

      // ✅ BACKGROUND
      navbar.classList.toggle("scrolled", !isAtTop);

      // ✅ ANNOUNCEMENT BAR
      if (announcementBar) {
        announcementBar.classList.toggle("hidden", isPastTrigger);
      }

      // ✅ SHIFT CONTROL
      if (document.body.classList.contains("lookbook-page")) {
        navbar.classList.remove("shift-up"); // never hide in lookbook
      } else {
        navbar.classList.toggle("shift-up", isPastTrigger);
      }

      ticking = false;
    }

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

    // ✅ INITIAL RUN
    updateNavbar();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateNavbar);
  }

  // ==========================
  // 🔍 SEARCH FUNCTIONALITY
  // ==========================

  const searchIcon = document.getElementById("search-icon");
  const searchInput = document.getElementById("search-input");

  searchIcon?.addEventListener("click", () => {
    searchInput.classList.toggle("active");
    searchInput.focus();
  });

  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (!query) return;

      window.location.href = `/shop.html?search=${encodeURIComponent(query)}`;
    }
  });

  // ==========================
  // 🔗 ACTIVE NAV LINK
  // ==========================

  const navLinks = document.querySelectorAll(".nav-link");
  const currentPath = window.location.pathname;

  navLinks.forEach(link => {
    const linkPath = new URL(link.href).pathname;

    if (linkPath === currentPath) {
      link.classList.add("active");
    }
  });

  // ==========================
  // 🛒 CART DRAWER
  // ==========================

  const cartIcon = document.getElementById("cart-icon");
  const cartDrawer = document.getElementById("cart-drawer");
  const cartOverlay = document.getElementById("cart-overlay");
  const closeCartBtn = document.getElementById("close-cart");

  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  cartIcon?.addEventListener("click", () => {

    if (document.body.classList.contains("cart-page")) return;
    if (!cartDrawer || !cartOverlay) return;

    isCartOpen = true;

    cartDrawer.classList.add("active");
    cartOverlay.classList.add("active");

    renderCart(cartItems, cartTotal);
  });

  function closeCart() {
    isCartOpen = false;

    cartDrawer?.classList.remove("active");
    cartOverlay?.classList.remove("active");
  }

  closeCartBtn?.addEventListener("click", closeCart);
  cartOverlay?.addEventListener("click", closeCart);

  // keep navbar responsive while scrolling cart
  cartOverlay?.addEventListener("wheel", () => {
    if (navbar) window.dispatchEvent(new Event("scroll"));
  }, { passive: true });

  cartDrawer?.addEventListener("wheel", () => {
    if (navbar) window.dispatchEvent(new Event("scroll"));
  }, { passive: true });

  // ==========================
  // 🔥 LOOKBOOK TRANSITION
  // ==========================

  const lookbookLinks = document.querySelectorAll('a[href$="lookbook.html"]');

  lookbookLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      document.body.classList.add("page-exit");

      setTimeout(() => {
        window.location.href = link.href;
      }, 320);
    });
  });

});