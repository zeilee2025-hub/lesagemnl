// ==========================
// 🧠 VALIDATE ADD TO CART
// ==========================
export function validateAddToCart(product, selectedSize, currentCart) {
  // 1. ❌ No size selected
  if (!selectedSize) {
    return { valid: false, message: "Please select a size" };
  }

  // 2. ❌ No sizes in product
  if (!product.sizes || !product.sizes.length) {
    return { valid: false, message: "Product has no size data" };
  }

  // 3. 🔍 Find selected size
  const sizeData = product.sizes.find(
  (s) =>
    String(s.size).trim().toUpperCase() ===
    String(selectedSize).trim().toUpperCase()
);

  if (!sizeData) {
    return { valid: false, message: "Invalid size selected" };
  }

  // 4. ❌ Out of stock
  if (sizeData.stock <= 0) {
    return { valid: false, message: "This size is out of stock" };
  }

  // 5. 🔢 Check existing quantity in cart
  const existingItem = currentCart.find(
    (item) =>
      item.id === product.id &&
      item.size === selectedSize
  );

  const currentQty = existingItem ? existingItem.quantity : 0;

  // 6. ❌ Exceeds stock
  if (currentQty + 1 > sizeData.stock) {
    return {
      valid: false,
      message: `Only ${sizeData.stock} item(s) available`
    };
  }

  // ✅ All good
  return { valid: true };
}

// ==========================
// 🔢 VALIDATE QUANTITY UPDATE
// ==========================
export function validateQuantityUpdate(product, size, newQty) {
  if (!product || !product.sizes) {
    return { valid: false, message: "Invalid product data" };
  }

  const sizeData = product.sizes.find(
    (s) =>
      String(s.size).trim().toUpperCase() ===
      String(size).trim().toUpperCase()
  );

  if (!sizeData) {
    return { valid: false, message: "Invalid size" };
  }

  if (sizeData.stock <= 0) {
    return { valid: false, message: "Out of stock" };
  }

  if (newQty > sizeData.stock) {
    return {
      valid: false,
      message: `Only ${sizeData.stock} available`
    };
  }

  return { valid: true };
}