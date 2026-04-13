// ===============================
// 🧠 CART VALIDATION (ASYNC — BULLETPROOF 🔥)
// ===============================

import { getCart, saveCart } from "../services/cartService.js";
import { getProductById } from "../services/productService.js";


// ===============================
// 🔒 COLOR NORMALIZATION
// ===============================
function normalizeColor(product, color) {
  if (!color) return "Default";

  // exact match
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


// ===============================
// 🔍 SUPER SAFE VARIANT MATCH
// ===============================
function findVariant(product, color) {
  if (!product?.variants) return null;

  const normalized = (color || "").toLowerCase().trim();

  // ✅ 1. EXACT MATCH
  let variant = product.variants.find(v =>
    (v.name || "").toLowerCase().trim() === normalized
  );

  // ✅ 2. HEX MATCH
  if (!variant && color?.startsWith("#")) {
    variant = product.variants.find(v => v.value === color);
  }

  // ✅ 3. PARTIAL MATCH (CRITICAL FIX)
  if (!variant) {
    variant = product.variants.find(v =>
      (v.name || "").toLowerCase().includes(normalized)
    );
  }

  // ✅ 4. FINAL FALLBACK
  if (!variant) {
    console.warn("⚠️ Variant fallback used:", color);
    variant = product.variants[0];
  }

  return variant;
}


// ===============================
// 🔍 VALIDATION
// ===============================
export async function validateCartAsync() {
  const cart = getCart();

  let updated = false;

  for (const item of cart) {
    const product = await getProductById(item.id);

    if (!product || !Array.isArray(product.variants)) continue;

    // ===============================
    // 🔥 NORMALIZE COLOR
    // ===============================
    const normalizedColor = normalizeColor(product, item.color);

    if (normalizedColor !== item.color) {
      item.color = normalizedColor;
      updated = true;
    }

    // ===============================
    // 🔥 BULLETPROOF VARIANT MATCH
    // ===============================
    const variant = findVariant(product, item.color);

    if (!variant) continue;

    // ===============================
    // 🔥 SAFE SIZE MATCHING
    // ===============================
    const sizeData = variant.sizes?.find(s =>
      String(s.size).trim().toUpperCase() ===
      String(item.size).trim().toUpperCase()
    );

    // ⚠️ DO NOT REMOVE if size missing
    if (!sizeData) {
      console.warn("⚠️ Size not found, skipping:", item);
      continue;
    }

    const stock = typeof sizeData.stock === "number" ? sizeData.stock : 0;

    // ===============================
    // 🔥 STOCK RULES
    // ===============================
    if (stock === 0) {
      item.quantity = 0;
      updated = true;
    } else if (item.quantity > stock) {
      item.quantity = stock;
      updated = true;
    }
  }

  // ===============================
  // 🧹 CLEAN CART
  // ===============================
  const cleaned = cart.filter(item => item.quantity > 0);

  if (updated) {
    saveCart(cleaned);
    console.warn("⚠️ Cart normalized / adjusted");
  }
}