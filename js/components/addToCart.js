// ===============================
// 🛒 ADD TO CART COMPONENT (UPDATED 🔥)
// ===============================

export function initAddToCart({ addBtn }, getState, onAdd) {
  if (!addBtn) return;

  addBtn.addEventListener("click", () => {
    const { product, selectedSize } = getState();

    if (!product) return;

    // ❌ block if no size
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    // 🔥 SAFE COLOR + INDEX (NEW)
    const color = product.selectedColor || "Default";
    const colorIndex = product.selectedColorIndex || 0;

    // ✅ trigger external logic (cart service)
    onAdd(product, selectedSize, color, colorIndex);
  });
}