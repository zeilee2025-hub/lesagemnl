// ===============================
// 🛒 ADD TO CART COMPONENT (FINAL — STOCK SAFE + UI BLOCK 🔥)
// ===============================

export function initAddToCart({ addBtn }, getState, onAdd) {
  if (!addBtn) return;

  addBtn.addEventListener("click", () => {
    const { product, selectedSize } = getState();

    // ❌ No product
    if (!product) return;

    // ❌ No size selected
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    // 🔥 SAFE COLOR
    const color = product.selectedColor || "Default";

    // ==========================
    // 📦 GET VARIANT (same logic as cartService)
    // ==========================
    const variant =
      product.selectedVariant ||
      product.variants?.find(v => v.name === color) ||
      product.variants?.[0];

    // ❌ No variant
    if (!variant) return;

    // ==========================
    // 📏 GET SIZE STOCK
    // ==========================
    const sizeData = Array.isArray(variant.sizes)
      ? variant.sizes.find(
          (s) =>
            String(s.size).trim().toUpperCase() ===
            String(selectedSize).trim().toUpperCase()
        )
      : null;

    const stock = sizeData?.stock ?? 0;

    // ==========================
    // ❌ BLOCK IF OUT OF STOCK (UI LEVEL)
    // ==========================
    if (stock <= 0) {
      // Optional: you can replace this with toast later
      alert("This size is out of stock");
      return;
    }

    // 🔥 SAFE COLOR INDEX
    const colorIndex = product.selectedColorIndex || 0;

    // ==========================
    // ✅ PROCEED TO CART SERVICE
    // ==========================
    onAdd(product, selectedSize, color, colorIndex);
  });
}