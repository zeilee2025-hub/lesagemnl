// ==========================
//  IMPORTS
// ==========================
import { listenToProducts, getProductById } from "../services/productService.js";

import { 
  addToCart, 
  updateCartBadge
} from "../services/cartService.js";

import { createProductCard, initProductCard } from "../components/productCard.js";
import { initSizeSelector } from "../components/sizeSelector.js";
import { initAnnouncement } from "../components/announcement.js";
import { initMarqueeDrag } from "../components/marquee.js";

//  SHARED CART
import { renderCart } from "../components/cartDrawer.js";
import { loadFooter } from "../components/footerLoader.js";

//  LOOKBOOK
import { renderLookbookCarousel } from "../components/lookbookCarousel.js";
import { initHero } from "../components/hero.js";


// ==========================
//  ELEMENTS
// ==========================
const container = document.getElementById("product-list");

const cartDrawer = document.getElementById("cart-drawer");
const cartOverlay = document.getElementById("cart-overlay");
const closeCartBtn = document.getElementById("close-cart");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotalContainer = document.getElementById("cart-total");
const cartIcon = document.getElementById("cart-icon");

//  MODAL
const modal = document.getElementById("quick-add-modal");
const modalOverlay = document.getElementById("quick-add-overlay");
const modalClose = document.getElementById("quick-add-close");

const qaTitle = document.getElementById("qa-title");
const qaPrice = document.getElementById("qa-price");
const qaSizes = document.getElementById("qa-sizes");
const qaColors = document.getElementById("qa-colors");
const qaAddBtn = document.getElementById("qa-add-btn");


// =========================
//  STATE
// ==========================
let currentProduct = null;
let selectedSize = null;
let selectedColor = null;
let allProducts = [];


// ==========================
//  INIT
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  initHero(); 

  initAnnouncement();
  initMarqueeDrag();

  const root = document.getElementById("lookbook-root");
  if (root) {
    renderLookbookCarousel(root);
  }
});

// ========================== 
//  DATA LISTENER
// ==========================l
window.addEventListener("load", () => {

  setTimeout(() => {

    listenToProducts((products) => {

      allProducts = products;

      products.forEach(product => {
        product.selectedVariant =
          product.variants?.[0] || null;
      });

      const featured = products
        .filter(p => p.featured === true)
        .sort((a, b) =>
          (a.order || 0) - (b.order || 0)
        );

      renderProducts(featured);

    });

  }, 1200);

});


// ==========================
//  PRODUCT GRID
// ==========================
function renderProducts(products) {
  if (!container) return;

  //  FORCE SINGLE GRID
  container.classList.add("product-grid");
  container.innerHTML = "";

  products.forEach((product, index) => {
    const allowModel = index === 1 || index === 2;

    const cardHTML = createProductCard(product, {
      allowModel,
      hoverMode: allowModel ? "model" : "back"
    });

    container.insertAdjacentHTML("beforeend", cardHTML);
  });

  const cards = container.querySelectorAll(".product-card");

  cards.forEach((card, index) => {
    const product = products[index];
    const allowModel = index === 1 || index === 2;

    initProductCard(card, handleQuickAdd, product, {
      allowModel,
      hoverMode: allowModel ? "model" : "back"
    });
  });

  qaAddBtn.disabled = true;
}


// ==========================
//  QUICK ADD MODAL (UPDATED)
// ==========================
function handleQuickAdd({ product, colorIndex }) {

  if (!product) return;

  currentProduct = product;

  selectedSize = null;

  const variant =
    product.selectedVariant ||
    product.variants?.[colorIndex] ||
    product.variants?.[0];

  selectedColor =
    variant?.name || "Default";

  qaAddBtn.disabled = true;

qaAddBtn.textContent = "ADD TO CART";
qaAddBtn.onclick = null;

  qaTitle.textContent =
    product.name;

  qaPrice.textContent =
    `₱${product.price}`;

  // ==========================
  // RESET COLORS
  // ==========================
  qaColors.innerHTML = "";

  const variants =
    product.variants || [];

  // ==========================
  // RENDER COLOR SWATCHES
  // ==========================
  variants.forEach((variant, index) => {

    const swatch =
      document.createElement("span");

    swatch.className =
      "quick-add__color-swatch";

    swatch.style.background =
      variant.value || "#000";

    // DEFAULT ACTIVE
    if (index === 0) {
      swatch.classList.add("active");
    }

    // ==========================
    // COLOR CLICK
    // ==========================
    swatch.addEventListener("click", () => {

      selectedColor =
        variant.name;

      currentProduct.selectedVariant =
        variant;

      selectedSize = null;

      qaAddBtn.disabled = true;

      renderSizes(variant);

      // ==========================
// AUTO SELECT ONE SIZE
// ==========================
const sizes =
  variant?.sizes || [];

if (sizes.length === 1) {

  selectedSize =
    sizes[0].size;

  qaAddBtn.disabled = false;

  setTimeout(() => {

    const btn =
      qaSizes.querySelector(
        ".product-size__option"
      );

    if (btn) {

      btn.classList.add(
        "product-size__option--active"
      );

    }

  }, 0);

}

      // ==========================
      // ACTIVE SWATCH
      // ==========================
      qaColors
        .querySelectorAll(
          ".quick-add__color-swatch"
        )
        .forEach((s) => {
          s.classList.remove("active");
        });

      swatch.classList.add("active");

    });

    qaColors.appendChild(swatch);

  });

  // ==========================
  // RENDER SIZES
  // ==========================
  function renderSizes(variantData) {

    const sizes =
      variantData?.sizes || [];

    qaSizes.innerHTML = "";

    // ==========================
    // OUT OF STOCK
    // ==========================
    if (!sizes.length) {

  qaSizes.innerHTML = `
    <p class="quick-add__no-sizes">
      Out of stock
    </p>
  `;

  qaAddBtn.disabled = false;

  qaAddBtn.textContent = "VIEW PRODUCT";

  qaAddBtn.onclick = () => {
    window.location.href =
  `./product.html?id=${currentProduct.id}`;
  };

  return;

}

    // ==========================
    // SHOW ONE SIZE LABEL
    // ==========================
    const displaySizes =
      sizes.map((s) => ({
        ...s,
        size:
          s.size === "OS"
            ? "ONE SIZE"
            : s.size
      }));

    initSizeSelector(
      displaySizes,
      {
        sizeContainer: qaSizes,
        addBtn: qaAddBtn
      },
      (size) => {

        selectedSize =
          size === "ONE SIZE"
            ? "OS"
            : size;

      }
    );

  }

  // ==========================
  // INITIAL SIZE RENDER
  // ==========================
  renderSizes(variant);

  // ==========================
// AUTO SELECT SINGLE SIZE
// ==========================
const sizes =
  variant?.sizes || [];

if (sizes.length === 1) {

  selectedSize =
    sizes[0].size;

  qaAddBtn.disabled = false;

  setTimeout(() => {

    const btn =
      qaSizes.querySelector(
        ".product-size__option"
      );

    if (btn) {

      btn.classList.add(
        "product-size__option--active"
      );

    }

  }, 0);

}

  // ==========================
  // OPEN MODAL
  // ==========================
  modal.classList.add("active");

  modalOverlay.classList.add("active");

}

// ==========================
//  ADD TO CART
// ==========================
qaAddBtn?.addEventListener("click", async () => {

  if (
    !currentProduct ||
    !selectedSize
  ) {
    return;
  }

  const freshProduct =
    await getProductById(
      currentProduct.id
    );

  if (!freshProduct) return;

  const variant =
    freshProduct.variants?.find(
      (v) =>
        (v.name || "")
          .toLowerCase()
          .trim() ===
        (selectedColor || "")
          .toLowerCase()
          .trim()
    ) ||
    freshProduct.variants?.[0];

  if (!variant) return;

  const finalColor =
    variant.name;

  addToCart(
    freshProduct,
    selectedSize,
    finalColor
  );

  updateCartBadge();

  closeModal();

  openCart();

});

// ==========================
//  CLOSE MODAL
// ==========================
function closeModal() {

  modal.classList.remove("active");

  modalOverlay.classList.remove("active");

}

modalOverlay?.addEventListener(
  "click",
  closeModal
);

modalClose?.addEventListener(
  "click",
  closeModal
);

document.addEventListener("keydown", (e) => {

  if (e.key === "Escape") {
    closeModal();
  }

});


// ==========================
//  CART SYSTEM
// ==========================
function openCart() {

  cartDrawer.classList.add(
    "cart-drawer--active"
  );

  cartOverlay.classList.add(
    "cart-overlay--active"
  );

  renderCart(
    cartItemsContainer,
    cartTotalContainer
  );

}

function closeCart() {

  cartDrawer.classList.remove(
    "cart-drawer--active"
  );

  cartOverlay.classList.remove(
    "cart-overlay--active"
  );

}

// ==========================
//  DRAWER EVENTS
// ==========================
cartIcon?.addEventListener("click", openCart);
closeCartBtn?.addEventListener("click", closeCart);
cartOverlay?.addEventListener("click", closeCart);


// ==========================
//  FOOTER INIT
// ==========================
loadFooter();