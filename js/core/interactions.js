// ===============================
//  GLOBAL INTERACTION SYSTEM (FINAL CLEAN)
// ===============================

// ===============================
// GLOBAL CLICK HANDLER
// ===============================
document.addEventListener("click", (e) => {
  const actionEl = e.target.closest("[data-action]");
  if (!actionEl) return;

  const action = actionEl.dataset.action;
  const id = actionEl.dataset.id;

  // ===============================
  //  QUICK VIEW (PRODUCT CARD)
  // ===============================
  if (action === "quick-view") {
  e.preventDefault();      // ✅ stop link navigation
  e.stopPropagation();     // ✅ stop bubbling to <a>

  if (!id) return;

  window.dispatchEvent(
    new CustomEvent("triggerQuickView", {
      detail: { productId: id }
    })
  );

  return;
}

  // ===============================
  //  ADD TO CART (PDP)
  // ===============================
  if (action === "add-to-cart") {
    window.dispatchEvent(new CustomEvent("triggerAddToCart"));
    return;
  }

  // ===============================
  //  BUY NOW (PDP)
  // ===============================
  if (action === "buy-now") {
    window.dispatchEvent(new CustomEvent("triggerBuyNow"));
    return;
  }
});