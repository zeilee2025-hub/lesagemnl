import { listenToProducts } from "../services/productService.js";
import { addToCart } from "../services/cartService.js";

const container = document.getElementById("product-list");

// 🔥 CURRENT DROP (CHANGE THIS WHEN YOU ADD NEW DROPS)
const CURRENT_DROP = "DROP 01";

listenToProducts((products) => {
  if (!container) return;

  // Clear container
  container.innerHTML = "";

  // 🔥 Filter products by drop
  const filtered = products.filter(
    (product) => product.drop === CURRENT_DROP
  );

  // 🔥 If no products found
  if (filtered.length === 0) {
    container.innerHTML = `<p class="no-products">No products in this drop.</p>`;
    return;
  }

  // 🔥 Render products
  filtered.forEach((product) => {
    const card = document.createElement("div");
    card.classList.add("product-card");

    card.innerHTML = `
      <div class="product-image">
        <img 
          src="${product.frontImage}" 
          alt="${product.name}"
          loading="lazy"
        />
      </div>

      <div class="product-info">
        <h3>${product.name}</h3>
        <p>₱${product.price}</p>
      </div>

      <button class="add-to-cart">+</button>
    `;

    const img = card.querySelector("img");
    const button = card.querySelector(".add-to-cart");

    // 🔥 HOVER IMAGE SWAP
    if (product.backImage) {
      card.addEventListener("mouseenter", () => {
        img.src = product.backImage;
      });

      card.addEventListener("mouseleave", () => {
        img.src = product.frontImage;
      });
    }

    // 🔥 ADD TO CART
    button.addEventListener("click", () => {
      addToCart(product, 1);
    });

    container.appendChild(card);
  });
});