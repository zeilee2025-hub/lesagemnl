// ===============================
// ADD TO CART COMPONENT
// ===============================

export function initAddToCart(
  { addBtn },
  getState,
  onAdd
) {

  if (!addBtn) return;

  addBtn.addEventListener("click", () => {

    const {
      product,
      selectedSize
    } = getState();


    // ==========================
    // NO PRODUCT
    // ==========================
    if (!product) {
      return;
    }


    // ==========================
    // NO SIZE
    // ==========================
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }


    // ==========================
    // SAFE COLOR
    // ==========================
    const color =
      product.selectedColor || "Default";


    // ==========================
    // GET VARIANT
    // ==========================
    const variant =
      product.selectedVariant ||
      product.variants?.find(
        (v) => v.name === color
      ) ||
      product.variants?.[0];


    // ==========================
    // NO VARIANT
    // ==========================
    if (!variant) {
      return;
    }


    // ==========================
    // GET SIZE STOCK
    // ==========================
    const sizeData =
      Array.isArray(variant.sizes)
        ? variant.sizes.find(
            (s) =>
              String(s.size)
                .trim()
                .toUpperCase() ===
              String(selectedSize)
                .trim()
                .toUpperCase()
          )
        : null;

    const stock =
      sizeData?.stock ?? 0;


    // ==========================
    // OUT OF STOCK
    // ==========================
    if (stock <= 0) {
      alert("This size is out of stock");
      return;
    }


    // ==========================
    // SAFE COLOR INDEX
    // ==========================
    const colorIndex =
      product.selectedColorIndex || 0;


    // ==========================
    // ADD TO CART
    // ==========================
    onAdd(
      product,
      selectedSize,
      color,
      colorIndex
    );


    // ==========================
    // CLOSE QUICK ADD MODAL
    // ==========================
    const quickAddModal =
      document.getElementById(
        "quick-add-modal"
      );

    quickAddModal?.classList.remove(
      "active"
    );


    // ==========================
    // AUTO OPEN CART
    // ==========================
    const cartDrawer =
      document.getElementById(
        "cart-drawer"
      );

    const cartOverlay =
      document.getElementById(
        "cart-overlay"
      );

    if (
      cartDrawer &&
      cartOverlay
    ) {

      // OPEN DRAWER
      cartDrawer.classList.add(
        "cart-drawer--active"
      );

      // OPEN OVERLAY
      cartOverlay.classList.add(
        "cart-overlay--active"
      );

    }

  });

}