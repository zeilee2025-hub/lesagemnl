// ===============================
//  CART SERVICE (FINAL — STOCK SAFE + VARIANT-AWARE )
// ===============================

import { getProductImage } from "../core/imageResolver.js";

const STORAGE_KEY = "cart";


// ==========================
//  GLOBAL EVENT SYSTEM
// ==========================
function emitCartUpdate(detail = {}) {
  window.dispatchEvent(new CustomEvent("cartUpdated", { detail }));
}

function emitCartError(message) {
  window.dispatchEvent(
    new CustomEvent("cartError", { detail: { message } })
  );
}


// ==========================
//  GET CART
// ==========================
export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}


// ==========================
//  SAVE CART
// ==========================
export function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}


// ==========================
//  CREATE UNIQUE KEY
// ==========================
function createKey(id, size, color) {
  return `${id}_${size}_${color || "default"}`;
}


// ==========================
//  IMAGE RESOLUTION
// ==========================
function resolveCartImage(product, colorName) {
  const variantsSource =

  Array.isArray(product?.variants)

    ? product.variants

    : Array.isArray(product?.colors)

      ? product.colors

      : [];

if (!variantsSource.length) return "";

  const variant =

  variantsSource.find(
    v => v.name === colorName
  ) ||

  variantsSource[0];

  return (
    variant?.images?.front ||
    variant?.images?.main ||
    variant?.front ||
    getProductImage(product) ||
    ""
  );
}


// ==========================
//  COLOR NORMALIZATION
// ==========================
function normalizeColor(product, color) {
  if (!color) return "Default";

  if (product?.variants?.some(v => v.name === color)) {
    return color;
  }

  if (color.startsWith("#") && product?.variants) {
    const match = product.variants.find(v => v.value === color);
    if (match) return match.name;
  }

  return color;
}


// ==========================
//  GET VARIANT + STOCK
// ==========================
function getVariant(product, color) {

  const variantsSource =

    Array.isArray(product.variants)

      ? product.variants

      : Array.isArray(product.colors)

        ? product.colors

        : [];

  return (

    product.selectedVariant ||

    variantsSource.find(
      v => v.name === color
    ) ||

    variantsSource[0]

  );

}

function getSizeStock(variant, size) {
  if (!variant?.sizes) return 0;

  const sizeData = variant.sizes.find(
    s =>
      String(s.size).trim().toUpperCase() ===
      String(size).trim().toUpperCase()
  );

  return sizeData?.stock ?? 0;
}


// ==========================
//  ADD TO CART (STOCK SAFE)
// ==========================
export function addToCart(product, size, color = "Default") {
  const cart = getCart();

  const normalizedColor = normalizeColor(product, color);

  const variant = getVariant(product, normalizedColor);
  if (!variant) return;

  const stock = getSizeStock(variant, size);

  //  OUT OF STOCK
  if (stock <= 0) {
    emitCartError("This size is out of stock");
    return;
  }

  const key = createKey(product.id, size, normalizedColor);

  const existing = cart.find(item => item.key === key);

  const currentQty = existing ? existing.quantity : 0;

  //  EXCEEDS STOCK
  if (currentQty + 1 > stock) {
    emitCartError(`Only ${stock} available`);
    return;
  }

  if (existing) {
    existing.quantity += 1;
  } else {
  cart.push({
  key,
  id: product.id,
  name: product.name,
  price: product.price,
  size,
  color: normalizedColor,
  quantity: 1,

  //  CACHE STOCK
  stock: Number(stock) || 0,

  image: resolveCartImage(product, normalizedColor)
});
  }

  saveCart(cart);
  emitCartUpdate({ type: "add", key });
}


// ==========================
//  REMOVE
// ==========================
export function removeFromCart(key) {
  const cart = getCart();
  const updated = cart.filter(item => item.key !== key);

  saveCart(updated);
  emitCartUpdate({ type: "remove", key });
}


// ==========================
//  UPDATE QUANTITY (FAST)
// ==========================
export async function updateQuantity(
  key,
  newQty
) {

  const cart = getCart();

  const item =
    cart.find(i => i.key === key);

  if (!item) return;

  if (newQty < 1) return;

  //  USE CACHED STOCK
  const stock =
  typeof item.stock === "number"
    ? item.stock
    : 0;

  if (newQty > stock) {

    emitCartError(
      `Only ${stock} available for ${item.name} (${item.size})`
    );

    item.quantity = stock;

  } else {

    item.quantity = newQty;

  }

  saveCart(cart);

  emitCartUpdate({
    type: "update",
    key
  });

}


// ==========================
//  GET TOTAL
// ==========================
export function getCartTotal() {
  const cart = getCart();

  return cart.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}


// ==========================
//  CART BADGE
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