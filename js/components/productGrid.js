// ===============================
// PRODUCT GRID COMPONENT
// ===============================

import {
  createProductCard,
  initProductCard
} from "./productCard.js";


// ===============================
// RENDER PRODUCT GRID
// ===============================
export function renderProductGrid(
  container,
  products,
  onQuickAdd,
  options = {}
) {

  if (!container) return;

  // ===============================
  // EMPTY STATE GUARD
  // ===============================
  if (
    !Array.isArray(products) ||
    !products.length
  ) {
    container.innerHTML = "";
    return;
  }

  // ===============================
  // DEFAULT CONFIG
  // ===============================
  const config = {
    allowModel:
      options.allowModel ?? true,

    hoverMode:
      options.hoverMode ?? "model"
  };

  // ===============================
  // RENDER HTML
  // ===============================
  container.innerHTML = products
    .map(product =>
      createProductCard(product, config)
    )
    .join("");

  // ===============================
  // INIT CARDS
  // ===============================
  const cards =
    container.querySelectorAll(".product-card");

  cards.forEach((card, index) => {

    const product = products[index];

    initProductCard(
      card,
      onQuickAdd,
      product,
      config
    );

  });

}