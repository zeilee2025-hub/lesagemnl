// ===============================
// 🧠 UNIVERSAL IMAGE RESOLVER (FINAL — VARIANT FIXED)
// ===============================

// ===============================
// 🔄 NORMALIZE PATH
// ===============================
function normalizePath(img) {
  if (!img) return "/assets/placeholder.jpg";

  if (typeof img === "string" && img.startsWith("http")) return img;

  if (img.startsWith("/")) return img;

  return "/" + img;
}


// ===============================
// 🖼️ GET PRODUCT IMAGE
// ===============================
export function getProductImage(product, {
  type = "front",
  colorIndex = 0
} = {}) {
  if (!product) return "/assets/placeholder.jpg";

  // ===============================
  // 🧠 TYPE NORMALIZATION
  // ===============================
  let resolvedType = type;

  if (type === "primary") {
    resolvedType = product?.hasModel === false ? "front" : "model";
  }

  if (type === "hover") {
    resolvedType = "back";
  }

  if (resolvedType === "model" && product.hasModel === false) {
    resolvedType = "front";
  }

  let img = null;

  // ===============================
  // 🔥 0. SELECTED VARIANT (CRITICAL FIX)
  // ===============================
  if (product?.selectedVariant?.images) {
    img =
      product.selectedVariant.images[resolvedType] ||
      product.selectedVariant.images.front ||
      product.selectedVariant.images.model ||
      product.selectedVariant.images.back;

    if (img) return normalizePath(img);
  }

  // ===============================
  // 🎨 1. COLOR LEVEL (LEGACY SUPPORT)
  // ===============================
  if (Array.isArray(product.colors) && product.colors.length > 0) {
    const color = product.colors[colorIndex] || product.colors[0];

    if (color) {
      img =
        color?.images?.[resolvedType] ||
        color?.[resolvedType] ||
        (Array.isArray(color?.images) ? color.images[0] : null);

      if (img) return normalizePath(img);
    }
  }

  // ===============================
  // 🖼️ 2. PRODUCT IMAGES
  // ===============================
  if (product.images) {
    if (typeof product.images === "object" && !Array.isArray(product.images)) {
      img =
        product.images[resolvedType] ||
        product.images.front ||
        product.images.main ||
        product.images.model ||
        Object.values(product.images)[0];

      if (img) return normalizePath(img);
    }

    if (Array.isArray(product.images)) {
      if (product.images.length > 0) {
        return normalizePath(product.images[0]);
      }
    }
  }

  // ===============================
  // 🧱 3. FLAT STRUCTURE
  // ===============================
  if (product[resolvedType]) {
    return normalizePath(product[resolvedType]);
  }

  // ===============================
  // 🧩 4. CART ITEM SUPPORT
  // ===============================
  if (product.image) {
    return normalizePath(product.image);
  }

  // ===============================
  // 🚫 FINAL FALLBACK
  // ===============================
  return "/assets/placeholder.jpg";
}