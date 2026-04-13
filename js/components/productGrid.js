import { createProductCard, initProductCard } from "./productCard.js";

export function renderProductGrid(container, products, onQuickAdd) {
  container.innerHTML = products
    .map(product => createProductCard(product))
    .join("");

  const cards = container.querySelectorAll(".product-card");

  cards.forEach((card, index) => {
  const product = products[index];
  initProductCard(card, onQuickAdd, product);
});
}