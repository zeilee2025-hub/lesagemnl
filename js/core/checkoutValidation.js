// ==========================
// 🧠 VALIDATE CART BEFORE CHECKOUT (FINAL FIX)
// ==========================
import { getProductById } from "../services/productService.js";

export async function validateCartBeforeCheckout(cart) {
  const errors = [];

  // ===============================
  // ✅ GUARD
  // ===============================
  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return {
      valid: false,
      errors: ["Cart is empty"]
    };
  }

  for (const item of cart) {
    try {
      const product = await getProductById(item.id);

      // ❌ Product missing
      if (!product || !Array.isArray(product.variants)) {
        errors.push(`${item.name} is no longer available`);
        continue;
      }

      // ===============================
      // 🔥 FIX 1: FIND VARIANT (COLOR MATCH)
      // ===============================
      const variant =
        product.variants.find(v =>
          (v.name || "").toLowerCase() === (item.color || "").toLowerCase()
        ) ||
        product.variants[0];

      if (!variant) {
        errors.push(`${item.name} variant not found`);
        continue;
      }

      // ===============================
      // 🔥 FIX 2: VALIDATE SIZES
      // ===============================
      if (!Array.isArray(variant.sizes) || variant.sizes.length === 0) {
        errors.push(`${item.name} has no size data`);
        continue;
      }

      // ===============================
      // 🔥 FIX 3: FIND SIZE
      // ===============================
      const sizeData = variant.sizes.find(
        (s) =>
          String(s.size).trim().toUpperCase() ===
          String(item.size).trim().toUpperCase()
      );

      if (!sizeData) {
        errors.push(`${item.name} (${item.size}) is invalid`);
        continue;
      }

      // ===============================
      // 🔥 STOCK CHECK
      // ===============================
      if (sizeData.stock <= 0) {
        errors.push(`${item.name} (${item.size}) is out of stock`);
        continue;
      }

      if (item.quantity > sizeData.stock) {
        errors.push(
          `${item.name} (${item.size}) only has ${sizeData.stock} left`
        );
        continue;
      }

    } catch (error) {
      console.error("Validation error:", error);
      errors.push(`Failed to validate ${item.name}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}