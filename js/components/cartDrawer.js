// ===============================
//  CART DRAWER
// ===============================

import {
  getCart,
  updateQuantity,
  removeFromCart,
  getCartTotal
} from "../services/cartService.js";

import { validateCartBeforeCheckout } from "../core/checkoutValidation.js";
import { createCartItem } from "./cartItem.js";


// ===============================
//  INITIAL RENDER
// ===============================
export function renderCart(cartItemsContainer, cartTotalContainer) {
  const cart = getCart();

  if (!cartItemsContainer || !cartTotalContainer) return;

  cartItemsContainer.innerHTML = "";

  // ================= EMPTY
  if (!cart.length) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty">
        <p class="cart-empty__title">
          Your cart is empty
        </p>
      </div>
    `;

    cartTotalContainer.innerHTML = "";

    return;
  }

  // ================= ITEMS
  cart.forEach((item) => {
    const itemEl = createCartItem(item);
    cartItemsContainer.appendChild(itemEl);
  });

  renderTotal(cartTotalContainer);

  // ===============================
  //  EVENT DELEGATION
  // ===============================
  cartItemsContainer.onclick = async (e) => {
    const btn = e.target.closest("button");

    if (!btn) return;

    const key = btn.dataset.key;

    if (!key) return;

    const cart = getCart();

    const item = cart.find((i) => i.key === key);

    if (!item) return;

    // ================= INCREASE
    if (btn.classList.contains("increase")) {
      await updateQuantity(key, item.quantity + 1);
    }

    // ================= DECREASE
    if (btn.classList.contains("decrease")) {
      if (item.quantity <= 1) return;

      await updateQuantity(key, item.quantity - 1);
    }

    // ================= REMOVE
    if (btn.classList.contains("cart-item__remove")) {
      removeFromCart(key);
    }
  };
}


// ===============================
//  PARTIAL UPDATE HANDLER
// ===============================
function handleCartUpdate({ type, key }) {
  const cartItems = document.getElementById("cart-items");

  const cartTotal = document.getElementById("cart-total");

  if (!cartItems || !cartTotal) return;

  const cart = getCart();

  // ================= ADD
  if (type === "add") {
    const item = cart.find((i) => i.key === key);

    if (!item) return;

    const existing = cartItems.querySelector(
      `[data-key="${key}"]`
    );

    if (existing) {
      updateItem(key);
    } else {
      const newItem = createCartItem(item);

      cartItems.appendChild(newItem);
    }
  }

  // ================= UPDATE
  if (type === "update") {
    updateItem(key);
  }

  // ================= REMOVE
  if (type === "remove") {
    const el = cartItems.querySelector(
      `[data-key="${key}"]`
    );

    if (el) {
      // BEM MODIFIER
      el.classList.add("cart-item--removing");

      setTimeout(() => {
        el.remove();

        if (!cart.length) {
          cartItems.innerHTML = `
            <div class="cart-empty">
              <p class="cart-empty__title">
                Your cart is empty
              </p>
            </div>
          `;
        }
      }, 250);
    }
  }

  // ================= UPDATE TOTAL
  updateTotal(cartTotal);
}


// ===============================
//  UPDATE SINGLE ITEM
// ===============================
function updateItem(key) {
  const cart = getCart();

  const item = cart.find((i) => i.key === key);

  if (!item) return;

  const el = document.querySelector(
    `#cart-items [data-key="${key}"]`
  );

  if (!el) return;

  const qtyEl = el.querySelector(".cart-qty__value");

  const subtotalEl = el.querySelector(
    ".cart-item__subtotal"
  );

  // ================= QUANTITY BUMP
  if (qtyEl) {
    qtyEl.classList.remove(
      "cart-qty__value--bump"
    );

    void qtyEl.offsetWidth;

    qtyEl.classList.add(
      "cart-qty__value--bump"
    );

    qtyEl.textContent = item.quantity;
  }

  // ================= SUBTOTAL
  if (subtotalEl) {
    subtotalEl.textContent =
      `₱${item.price * item.quantity}`;
  }
}


// ===============================
//  UPDATE TOTAL
// ===============================
function updateTotal(container) {
  const totalEl = container.querySelector(
    ".cart-footer__price"
  );

  if (!totalEl) return;

  // BEM MODIFIER
  totalEl.classList.add(
    "cart-footer__price--updating"
  );

  setTimeout(() => {
    totalEl.textContent =
      `₱${getCartTotal()}`;

    totalEl.classList.remove(
      "cart-footer__price--updating"
    );
  }, 120);
}

// ===============================
//  INITIAL TOTAL RENDER
// ===============================
function renderTotal(container) {
  container.innerHTML = `
    <button
      id="checkout-btn"
      class="cart-checkout-btn"
    >

      <span class="cart-checkout-btn__label">
        Checkout
      </span>

      <span class="cart-checkout-btn__divider">
  •
</span>

      <span class="cart-checkout-btn__price">
        ₱${getCartTotal()}
      </span>

    </button>
  `;

  document
    .getElementById("checkout-btn")
    .addEventListener(
      "click",
      async () => {

        const cart = getCart();

        const result =
          await validateCartBeforeCheckout(cart);

        if (!result.valid) {
          alert(result.errors.join("\n"));

          return;
        }

        window.location.href =
          "./checkout.html";
      }
    );
}

// ===============================
//  GLOBAL CART EVENT
// ===============================
window.addEventListener(
  "cartUpdated",
  (e) => {
    handleCartUpdate(e.detail || {});
  }
);