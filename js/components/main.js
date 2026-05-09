import "./search.js";

import { renderCart } from "./cartDrawer.js";
import { updateCartBadge } from "../services/cartService.js";

window.addEventListener("load", () => {

  // ===============================
  // PAGE ENTER ANIMATION
  // ===============================
  document.body.classList.add("page-enter");


  // ===============================
  // INITIAL + REAL-TIME BADGE SYNC
  // ===============================
  updateCartBadge();

  window.addEventListener("cartUpdated", () => {
    updateCartBadge();
  });


  // ==========================
  // ACTIVE NAV LINK
  // ==========================
  const navLinks = document.querySelectorAll(".nav-link");

  const currentPath = window.location.pathname;

  navLinks.forEach((link) => {
    const linkPath = new URL(link.href).pathname;

    if (linkPath === currentPath) {
      link.classList.add("active");
    }
  });


  // ==========================
  // CART DRAWER
  // ==========================
  const cartIcon =
    document.getElementById("cart-icon");

  const cartDrawer =
    document.getElementById("cart-drawer");

  const cartOverlay =
    document.getElementById("cart-overlay");

  const closeCartBtn =
    document.getElementById("close-cart");

  const cartItems =
    document.getElementById("cart-items");

  const cartTotal =
    document.getElementById("cart-total");


  // ==========================
  // OPEN CART
  // ==========================
  cartIcon?.addEventListener("click", () => {

    if (
      document.body.classList.contains(
        "cart-page"
      )
    ) {
      return;
    }

    if (!cartDrawer || !cartOverlay) {
      return;
    }

    cartDrawer.classList.add(
      "cart-drawer--active"
    );

    cartOverlay.classList.add(
      "cart-overlay--active"
    );

    renderCart(cartItems, cartTotal);

  });


  // ==========================
  // CLOSE CART
  // ==========================
  function closeCart() {

    cartDrawer?.classList.remove(
      "cart-drawer--active"
    );

    cartOverlay?.classList.remove(
      "cart-overlay--active"
    );

  }


  // ==========================
  // CLOSE EVENTS
  // ==========================
  closeCartBtn?.addEventListener(
    "click",
    closeCart
  );

  cartOverlay?.addEventListener(
    "click",
    closeCart
  );


  // ==========================
  // LOOKBOOK TRANSITION
  // ==========================
  const lookbookLinks =
    document.querySelectorAll(
      'a[href$="lookbook.html"]'
    );

  lookbookLinks.forEach((link) => {

    link.addEventListener("click", (e) => {

      e.preventDefault();

      document.body.classList.add(
        "page-exit"
      );

      setTimeout(() => {
        window.location.href = link.href;
      }, 320);

    });

  });


  // ===============================
  // ICON INIT
  // ===============================
  if (window.lucide) {
    window.lucide.createIcons();
  }

});