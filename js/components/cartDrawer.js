// ===============================
// 🛒 CART DRAWER (STEP 4 — POLISHED 🔥)
// ===============================

import {
  getCart,
  updateQuantity,
  removeFromCart,
  getCartTotal
} from "../services/cartService.js";

import { validateCartBeforeCheckout } from "../core/checkoutValidation.js";


// ===============================
// 🧠 INITIAL RENDER (ONLY ON OPEN)
// ===============================
export function renderCart(cartItemsContainer, cartTotalContainer) {
  const cart = getCart();

  if (!cartItemsContainer || !cartTotalContainer) return;

  cartItemsContainer.innerHTML = "";

  // ================= EMPTY
  if (!cart.length) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty">
        <p class="empty-title">Your cart is empty</p>
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
  // 🔥 EVENT DELEGATION (STAYS)
  // ===============================
  cartItemsContainer.onclick = async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const key = btn.dataset.key;
    if (!key) return;

    const cart = getCart();
    const item = cart.find(i => i.key === key);
    if (!item) return;

    if (btn.classList.contains("increase")) {
      await updateQuantity(key, item.quantity + 1);
    }

    if (btn.classList.contains("decrease")) {
      if (item.quantity <= 1) return;
      await updateQuantity(key, item.quantity - 1);
    }

    if (btn.classList.contains("cart-remove")) {
      removeFromCart(key);
    }
  };
}


// ===============================
// 🧱 CREATE ITEM NODE (REUSABLE)
// ===============================
function createCartItem(item) {
  const div = document.createElement("div");
  div.className = "cart-item";
  div.setAttribute("data-key", item.key);

  div.innerHTML = `
    <div class="cart-item-row">

      <img src="${item.image}" class="cart-item-img" />

      <div class="cart-item-info">

        <div class="cart-item-name">${item.name}</div>

        <div class="cart-item-meta">
          ${item.size} • ${item.color || "Default"}
        </div>

        <div class="cart-item-subtotal">
  ₱${item.price * item.quantity}
</div>

        <div class="cart-controls">
          <div class="cart-qty">
            <button class="qty-btn decrease" data-key="${item.key}">−</button>

            <span class="cart-qty-value">${item.quantity}</span>

            <button class="qty-btn increase" data-key="${item.key}">+</button>
          </div>

          <button class="cart-remove" data-key="${item.key}">Remove</button>
        </div>

      </div>

    </div>
  `;

  return div;
}


// ===============================
// 🔄 PARTIAL UPDATE HANDLER
// ===============================
function handleCartUpdate({ type, key }) {
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  if (!cartItems || !cartTotal) return;

  const cart = getCart();

  // 🟢 ADD
  if (type === "add") {
    const item = cart.find(i => i.key === key);
    if (!item) return;

    const existing = cartItems.querySelector(`[data-key="${key}"]`);

    if (existing) {
      updateItem(key);
    } else {
      const newItem = createCartItem(item);
      cartItems.appendChild(newItem);
    }
  }

  // 🟡 UPDATE
  if (type === "update") {
    updateItem(key);
  }

  // 🔴 REMOVE (WITH ANIMATION 🔥)
  if (type === "remove") {
    const el = cartItems.querySelector(`[data-key="${key}"]`);

    if (el) {
      el.classList.add("removing");

      setTimeout(() => {
        el.remove();

        if (!cart.length) {
          cartItems.innerHTML = `
            <div class="cart-empty">
              <p class="empty-title">Your cart is empty</p>
            </div>
          `;
        }
      }, 250);
    }
  }

  // 💰 ALWAYS update total (WITH ANIMATION)
  updateTotal(cartTotal);
}


// ===============================
// 🟡 UPDATE SINGLE ITEM (WITH BUMP 🔥)
// ===============================
function updateItem(key) {
  const cart = getCart();
  const item = cart.find(i => i.key === key);
  if (!item) return;

  const el = document.querySelector(`[data-key="${key}"]`);
  if (!el) return;

  const qtyEl = el.querySelector(".cart-qty-value");
  const subtotalEl = el.querySelector(".cart-item-subtotal");

  // 🟡 Quantity bump
  if (qtyEl) {
    qtyEl.classList.remove("bump");
    void qtyEl.offsetWidth; // force reflow
    qtyEl.classList.add("bump");

    qtyEl.textContent = item.quantity;
  }

  // 💰 Subtotal update
  if (subtotalEl) {
    subtotalEl.textContent = `₱${item.price * item.quantity}`;
  }
}


// ===============================
// 💰 UPDATE TOTAL (WITH FADE 🔥)
// ===============================
function updateTotal(container) {
  const totalEl = container.querySelector(".cart-total-price");
  if (!totalEl) return;

  totalEl.classList.add("updating");

  setTimeout(() => {
    totalEl.textContent = `₱${getCartTotal()}`;
    totalEl.classList.remove("updating");
  }, 120);
}


// ===============================
// 💰 INITIAL TOTAL RENDER
// ===============================
function renderTotal(container) {
  container.innerHTML = `
    <div class="cart-total-row">
      <span>Total</span>
      <span class="cart-total-price">₱${getCartTotal()}</span>
    </div>

    <button id="checkout-btn" class="cart-checkout-btn">
      Checkout
    </button>
  `;

  document.getElementById("checkout-btn").addEventListener("click", async () => {
    const cart = getCart();

    const result = await validateCartBeforeCheckout(cart);

    if (!result.valid) {
      alert(result.errors.join("\n"));
      return;
    }

    window.location.href = "./checkout.html";
  });
}


// ===============================
// 🔔 GLOBAL EVENT (SMART UPDATE 🔥)
// ===============================
window.addEventListener("cartUpdated", (e) => {
  handleCartUpdate(e.detail || {});
});