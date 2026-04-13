// ===============================
// 🛒 CART SERVICE (FINAL — HARDENED + FIXED 🔥)
// ===============================

import { getProductImage } from "../core/imageResolver.js";

const STORAGE_KEY = "cart";


// ==========================
// 🔔 GLOBAL EVENT SYSTEM
// ==========================
function emitCartUpdate(detail = {}) {
  window.dispatchEvent(new CustomEvent("cartUpdated", { detail }));
}


// ==========================
// 📦 GET CART
// ==========================
export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}


// ==========================
// 💾 SAVE CART
// ==========================
export function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}


// ==========================
// 🔑 CREATE UNIQUE KEY
// ==========================
function createKey(id, size, color) {
  return `${id}_${size}_${color || "default"}`;
}


// ==========================
// 🖼️ IMAGE RESOLUTION (FIXED 🔥)
// ==========================
function resolveCartImage(product, colorName) {
  if (!product?.variants) return "";

  const variant =
    product.variants.find(v => v.name === colorName) ||
    product.variants[0];

  return (
    variant?.images?.front ||
    variant?.images?.main ||
    variant?.front ||
    getProductImage(product) ||
    ""
  );
}


// ==========================
// 🔒 COLOR NORMALIZATION
// ==========================
function normalizeColor(product, color) {
  if (!color) return "Default";

  // already correct
  if (product?.variants?.some(v => v.name === color)) {
    return color;
  }

  // hex → name
  if (color.startsWith("#") && product?.variants) {
    const match = product.variants.find(v => v.value === color);
    if (match) return match.name;
  }

  return color;
}


// ==========================
// ➕ ADD TO CART (FINAL FIX)
// ==========================
export function addToCart(product, size, color = "Default") {
  const cart = getCart();

  const normalizedColor = normalizeColor(product, color);

  const key = createKey(product.id, size, normalizedColor);

  const existing = cart.find(item => item.key === key);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      key,
      id: product.id,
      name: product.name,
      price: product.price,
      size,
      color: normalizedColor, // ✅ ONLY NAME
      quantity: 1,
      image: resolveCartImage(product, normalizedColor) // ✅ FIXED
    });
  }

  saveCart(cart);
  emitCartUpdate({ type: "add", key });
}


// ==========================
// ❌ REMOVE
// ==========================
export function removeFromCart(key) {
  const cart = getCart();
  const updated = cart.filter(item => item.key !== key);

  saveCart(updated);
  emitCartUpdate({ type: "remove", key });
}


// ==========================
// 🔄 UPDATE QUANTITY
// ==========================
export async function updateQuantity(key, newQty) {
  const cart = getCart();
  const item = cart.find(i => i.key === key);

  if (!item) return;
  if (newQty < 1) return;

  const { getProductById } = await import("../services/productService.js");

  const product = await getProductById(item.id);

  if (!product || !product.variants) return;

  const variant =
    product.variants.find(v => v.name === item.color) ||
    product.variants[0];

  if (!variant) return;

  const sizeData = variant.sizes?.find(
    s =>
      String(s.size).trim().toUpperCase() ===
      String(item.size).trim().toUpperCase()
  );

  const stock = sizeData?.stock || 0;

  if (newQty > stock) {
    alert(`Only ${stock} available for ${item.name} (${item.size})`);
    item.quantity = stock;
  } else {
    item.quantity = newQty;
  }

  saveCart(cart);
  emitCartUpdate({ type: "update", key });
}


// ==========================
// 💰 GET TOTAL
// ==========================
export function getCartTotal() {
  const cart = getCart();

  return cart.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}


// ==========================
// 🔔 CART BADGE
// ==========================
export function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  if (!badge) return;

  const cart = getCart();

  const totalQty = cart.reduce((sum, item) => {
    return sum + item.quantity;
  }, 0);

  badge.textContent = totalQty;
}