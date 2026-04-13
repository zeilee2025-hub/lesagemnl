import { renderCart } from "./cartDrawer.js";
import { updateCartBadge } from "../services/cartService.js";

document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // 🔥 PAGE ENTER ANIMATION
  // ===============================
  document.body.classList.add("page-enter");

  // ===============================
  // 🔥 FORCE SCROLL TO TOP
  // ===============================
  window.scrollTo(0, 0);

  // ===============================
  // 🔥 INITIAL + REAL-TIME BADGE SYNC
  // ===============================
  updateCartBadge();

  window.addEventListener("cartUpdated", () => {
    updateCartBadge();
  });

  // ===============================
  // 🧠 NAVBAR SCROLL SYSTEM (OVERLAY UPGRADE)
  // ===============================

  const navbar = document.querySelector(".navbar");
  const announcementBar = document.querySelector(".announcement-bar");

  let isCartOpen = false;

  if (navbar && announcementBar) {

    const isOverlayPage = document.body.classList.contains("overlay-page");

    const homeHero = document.querySelector(".hero");
    const lookbookHero = document.querySelector(".lookbook-hero");

    let ticking = false;

    function getTriggerHeight() {
      if (isOverlayPage) {
        if (homeHero) return homeHero.offsetHeight;
        if (lookbookHero) return lookbookHero.offsetHeight;
      }

      return announcementBar.offsetHeight;
    }

    function updateNavbar() {
      const scrollY = window.scrollY;
      const triggerHeight = getTriggerHeight();

      const isAtTop = scrollY <= triggerHeight;
      const isPastTrigger = scrollY > triggerHeight;

      navbar.classList.toggle("scrolled", !isAtTop);
      announcementBar.classList.toggle("hidden", isPastTrigger);

      if (!document.body.classList.contains("lookbook-page")) {
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
  // 🛒 CART DRAWER (GLOBAL CONTROL)
  // ==========================

  const cartIcon = document.getElementById("cart-icon");
  const cartDrawer = document.getElementById("cart-drawer");
  const cartOverlay = document.getElementById("cart-overlay");
  const closeCartBtn = document.getElementById("close-cart");

  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  cartIcon?.addEventListener("click", () => {

    // 🚫 DISABLE CART DRAWER ON CART PAGE
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

  // 🔥 KEEP NAVBAR RESPONSIVE WHEN SCROLLING INSIDE CART
  cartOverlay?.addEventListener("wheel", () => {
    if (navbar) {
      const event = new Event("scroll");
      window.dispatchEvent(event);
    }
  }, { passive: true });

  cartDrawer?.addEventListener("wheel", () => {
    if (navbar) {
      const event = new Event("scroll");
      window.dispatchEvent(event);
    }
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