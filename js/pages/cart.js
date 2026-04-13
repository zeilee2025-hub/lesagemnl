// ===============================
// 🛒 CART PAGE (EVENT-DRIVEN 🔥)
// ===============================

import {
  getCart,
  removeFromCart,
  updateQuantity,
  saveCart
} from "../services/cartService.js";

import { syncCartWithStock } from "../core/stock.js";

// ✅ IMPORTS
import { getProductById } from "../services/productService.js";
import { validateQuantityUpdate } from "../core/cartValidation.js";

const container = document.getElementById("cart-container");
const checkoutBtn = document.getElementById("checkout-btn");

// 🆕 MOBILE SELECTORS
const mobileTotal = document.querySelector(".mobile-total");
const mobileCheckoutBtn = document.getElementById("mobile-checkout-btn");

loadCart();

// ==========================
// 🛒 LOAD CART (WITH SYNC 🔥)
// ==========================
async function loadCart() {
  const cart = getCart();

  const { updatedCart, changes } = await syncCartWithStock(cart);

  saveCart(updatedCart);

  if (updatedCart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <p class="empty-title">Your cart is empty</p>
        <p class="empty-sub">Start adding pieces to your rotation.</p>
      </div>
    `;

    if (checkoutBtn) {
      checkoutBtn.textContent = "CHECKOUT ₱0"; // ✅ FIXED (removed dot)
    }

    if (mobileTotal) {
      mobileTotal.textContent = "₱0"; // 🆕 MOBILE SYNC
    }

    return;
  }

  renderCart(updatedCart);

  if (changes.length > 0) {
    console.log("Cart updated:", changes);
  }
}

// ==========================
// 🎨 RENDER CART
// ==========================
function renderCart(cart) {
  container.innerHTML = "";

  let total = 0;

  cart.forEach(item => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const lowStockWarning =
      item.stock && item.stock <= 3
        ? `<p class="cart-stock-warning">Only ${item.stock} left</p>`
        : "";

    const itemEl = document.createElement("div");

    itemEl.innerHTML = `
      <div class="cart-item">

        <img src="${item.image}" alt="${item.name}" />

        <div class="cart-info">

          <h3 class="cart-item-name">${item.name}</h3>

          <p class="cart-item-meta">Size: ${item.size}</p>

          ${lowStockWarning}

          <div class="cart-bottom">

            <div class="cart-controls">
              <button class="minus" data-key="${item.key}">−</button>
              <span>${item.quantity}</span>
              <button class="plus" data-key="${item.key}">+</button>
            </div>

            <div class="cart-actions">
              <p class="cart-item-price">₱${item.price.toLocaleString()}</p>

              <button class="remove" data-key="${item.key}">
                Remove
              </button>
            </div>

          </div>

        </div>
      </div>
    `;

    container.appendChild(itemEl);
  });

  // ✅ DESKTOP BUTTON UPDATE
  if (checkoutBtn) {
    checkoutBtn.textContent = `CHECKOUT ₱${total.toLocaleString()}`;
  }

  // 🆕 MOBILE BAR UPDATE
  if (mobileTotal) {
    mobileTotal.textContent = `₱${total.toLocaleString()}`;
  }
}

// ==========================
// 🔥 EVENT DELEGATION (ITEM ACTIONS)
// ==========================
container.addEventListener("click", async (e) => {
  const btn = e.target;

  // ➕ PLUS
  if (btn.classList.contains("plus")) {
    const key = btn.dataset.key;

    const cart = getCart();
    const item = cart.find(i => i.key === key);
    if (!item) return;

    const newQty = item.quantity + 1;

    const product = await getProductById(item.id);
    const result = validateQuantityUpdate(product, item.size, newQty);

    if (!result.valid) {
      alert(result.message);
      return;
    }

    await updateQuantity(key, newQty);
  }

  // ➖ MINUS
  if (btn.classList.contains("minus")) {
    const key = btn.dataset.key;

    const cart = getCart();
    const item = cart.find(i => i.key === key);
    if (!item || item.quantity <= 1) return;

    const newQty = item.quantity - 1;

    await updateQuantity(key, newQty);
  }

  // ❌ REMOVE
  if (btn.classList.contains("remove")) {
    const key = btn.dataset.key;

    removeFromCart(key);
  }
});

// ==========================
// 🔔 GLOBAL CART SYNC
// ==========================
window.addEventListener("cartUpdated", () => {
  loadCart();
});


// ==========================
// 🧾 CHECKOUT BUTTON (FIXED 🔥)
// ==========================
document.addEventListener("click", async (e) => {

  // DESKTOP CHECKOUT
  if (e.target.id === "checkout-btn") {
    const cart = getCart();

    if (!cart.length) {
      alert("Your cart is empty");
      return;
    }

    window.location.href = "/checkout.html";
  }

  // 🆕 MOBILE CHECKOUT
  if (e.target.id === "mobile-checkout-btn") {
    const cart = getCart();

    if (!cart.length) {
      alert("Your cart is empty");
      return;
    }

    window.location.href = "/checkout.html";
  }

});