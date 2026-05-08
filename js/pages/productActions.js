// ===============================
//  PRODUCT ACTIONS (EVENT-DRIVEN)
// ===============================

import { addToCart, getCart, updateCartBadge } from "../services/cartService.js";
import { showToast } from "../components/toast.js";

/**
 * Handles Add to Cart flow (EVENT BASED)
 */
export function handleAddToCart(getPayload, openCart, setSizeError) {

  window.addEventListener("triggerAddToCart", () => {
    const { product, selectedSize } = getPayload();
    const variant = product?.selectedVariant;

    // ❌ guard (multi-size only)
    if (!selectedSize && variant?.sizes?.length > 1) {
      setSizeError?.("Please select a size");
      return;
    }

    setSizeError?.("");

    const before = getCart().length;

    addToCart(product, selectedSize, variant?.name);

    const after = getCart().length;

    // ❌ blocked (stock / validation)
    if (after === before) return;

    updateCartBadge();

    const displaySize = selectedSize === "ONE_SIZE" ? "One Size" : selectedSize;

    showToast(
      `Added ${product.name} (${variant?.name} - ${displaySize}) to cart`
    );

    openCart?.();
  });
}


/**
 * Handles Buy Now flow (EVENT BASED)
 */
export function handleBuyNow(getPayload, setSizeError) {

  window.addEventListener("triggerBuyNow", () => {
    const { product, selectedSize } = getPayload();
    const variant = product?.selectedVariant;

    // ❌ guard
    if (!selectedSize && variant?.sizes?.length > 1) {
      setSizeError?.("Please select a size");
      return;
    }

    setSizeError?.("");

    const before = getCart().length;

    addToCart(product, selectedSize, variant?.name);

    const after = getCart().length;

    // ❌ blocked
    if (after === before) return;

    updateCartBadge();

    setTimeout(() => {
      window.location.href = "./checkout.html";
    }, 300);
  });
}