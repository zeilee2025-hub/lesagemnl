// ===============================
//  CART PAGE
// ===============================

import {
  getCart,
  removeFromCart,
  updateQuantity,
  saveCart,
  getCartTotal
} from "../services/cartService.js";

import { syncCartWithStock } from "../core/stock.js";
import { createCartItem } from "../components/cartItem.js";

// ===============================
//  ELEMENTS
// ===============================

const container = document.getElementById("cart-container");

const checkoutBtn =
  document.getElementById("checkout-btn");

const mobileTotal =
  document.querySelector(".mobile-total");

const mobileCheckoutBtn =
  document.getElementById("mobile-checkout-btn");

// ===============================
//  INIT
// ===============================

loadCart();

// ===============================
//  LOAD CART
// ===============================

async function loadCart() {

  const cart = getCart();

  // STOCK SYNC ONLY ON PAGE LOAD
  const {
    updatedCart,
    changes
  } = await syncCartWithStock(cart);

  saveCart(updatedCart);

  renderCart(updatedCart);

  if (changes.length > 0) {
    console.log(
      "Cart updated:",
      changes
    );
  }
}

// ===============================
//  RENDER CART
// ===============================

function renderCart(cart) {

  // EMPTY STATE
  if (!cart.length) {

    container.innerHTML = `
      <div class="cart-empty">

        <p class="cart-empty__title">
          Your cart is empty
        </p>

        <p class="cart-empty__subtext">
          Start adding pieces to your rotation.
        </p>

      </div>
    `;

    updateTotals(0);

    return;
  }

  // BUILD HTML
  const fragment =
    document.createDocumentFragment();

  cart.forEach(item => {

    const itemEl =
      createCartItem(item);

    fragment.appendChild(itemEl);

  });

  // SINGLE DOM UPDATE
  container.innerHTML = "";
  container.appendChild(fragment);

  // TOTALS
  const total = getCartTotal();

  updateTotals(total);

}

// ===============================
//  UPDATE TOTALS
// ===============================

function updateTotals(total) {

  const formatted =
    `₱${total.toLocaleString()}`;

  // DESKTOP
  if (checkoutBtn) {

    checkoutBtn.textContent =
      `CHECKOUT ${formatted}`;

  }

  // MOBILE
  if (mobileTotal) {

    mobileTotal.textContent =
      formatted;

  }

}

// ===============================
//  CART INTERACTIONS
// ===============================

container.addEventListener(
  "click",
  async (e) => {

    const btn =
      e.target.closest("button");

    if (!btn) return;

    const key =
      btn.dataset.key;

    if (!key) return;

    const cart = getCart();

    const item =
      cart.find(i => i.key === key);

    if (!item) return;

   // ===========================
//  INCREASE
// ===========================

if (
  btn.classList.contains("increase")
) {

  // PREVENT SPAM CLICKING
  if (btn.disabled) return;

  btn.disabled = true;

  try {

    const newQty =
      item.quantity + 1;

    // 🔥 FAST STOCK CHECK
    if (
      item.stock &&
      newQty > item.stock
    ) {

      alert(
        `Only ${item.stock} available`
      );

      return;

    }

    await updateQuantity(
      key,
      newQty
    );

  } finally {

    btn.disabled = false;

  }

}

    // ===========================
    //  DECREASE
    // ===========================

    if (
      btn.classList.contains("decrease")
    ) {

      if (item.quantity <= 1) {
        return;
      }

      if (btn.disabled) return;

      btn.disabled = true;

      try {

        const newQty =
          item.quantity - 1;

        await updateQuantity(
          key,
          newQty
        );

      } finally {

        btn.disabled = false;

      }

    }

    // ===========================
    //  REMOVE
    // ===========================

    if (
      btn.classList.contains(
        "cart-item__remove"
      )
    ) {

      const itemEl =
        btn.closest(".cart-item");

      // REMOVE ANIMATION
      if (itemEl) {

        itemEl.classList.add(
          "cart-item--removing"
        );

        setTimeout(() => {

          removeFromCart(key);

        }, 180);

      } else {

        removeFromCart(key);

      }

    }

  }
);

// ===============================
//  GLOBAL CART UPDATE
// ===============================

window.addEventListener(
  "cartUpdated",
  () => {

    const cart = getCart();

    renderCart(cart);

  }
);

// ===============================
//  CHECKOUT
// ===============================

document.addEventListener(
  "click",
  async (e) => {

    // DESKTOP
    if (
      e.target.id === "checkout-btn"
    ) {

      const cart = getCart();

      if (!cart.length) {

        alert("Your cart is empty");

        return;

      }

      window.location.href =
        "/checkout.html";

    }

    // MOBILE
    if (
      e.target.id ===
      "mobile-checkout-btn"
    ) {

      const cart = getCart();

      if (!cart.length) {

        alert("Your cart is empty");

        return;

      }

      window.location.href =
        "/checkout.html";

    }

  }
);