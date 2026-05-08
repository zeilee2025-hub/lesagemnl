// ===============================
// IMPORTS
// ===============================
import {
  listenToProducts,
  getProductById
} from "../services/productService.js";

import {
  renderProductGrid
} from "../components/productGrid.js";

import {
  filterProducts
} from "../core/filter.js";

import {
  addToCart,
  updateCartBadge,
  getCart
} from "../services/cartService.js";

import {
  syncCartWithStock
} from "../core/stock.js";

import {
  initSizeSelector
} from "../components/sizeSelector.js";

import {
  renderCart
} from "../components/cartDrawer.js";

import {
  validateCartAsync
} from "../core/cartValidationAsync.js";


// ===============================
// GET SEARCH FROM URL
// ===============================
function getSearchFromURL() {

  const params =
    new URLSearchParams(window.location.search);

  return params.get("search") || "";

}


// ===============================
// STATE
// ===============================
let allProducts = [];

let currentCategory = "all";
let currentSearch = "";
let currentSort = "newest";

let currentProduct = null;

let selectedSize = null;
let selectedColor = null;
let selectedVariant = null;


// ===============================
// DOM
// ===============================
const grid = document.getElementById("product-grid");
const searchInput =  document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const filterButtons = document.querySelectorAll(".shop__filter-btn");


// ===============================
// QUICK ADD MODAL
// ===============================
const modal = document.getElementById("quick-add-modal");
const overlay = document.getElementById("quick-add-overlay");
const closeBtn = document.getElementById("quick-add-close");
const qaTitle = document.getElementById("qa-title");
const qaPrice = document.getElementById("qa-price");
const qaSizes = document.getElementById("qa-sizes");
const qaColors = document.getElementById("qa-colors");
const qaAddBtn = document.getElementById("qa-add-btn");

// ===============================
// CART
// ===============================
const cartItemsContainer = document.getElementById("cart-items");
const cartTotalContainer = document.getElementById("cart-total");


// ===============================
// INIT
// ===============================
init();

function init() {

  if (!grid) return;

  currentSearch = getSearchFromURL();

  if (searchInput && currentSearch) {
    searchInput.value = currentSearch;
  }

  listenToProducts((products) => {

    allProducts =
      Array.isArray(products)
        ? products
        : [];

    validateCartOnLoad();

    updateUI();

  });

  updateCartBadge();

}


// ===============================
// SYNC CART ON LOAD
// ===============================
async function validateCartOnLoad() {

  const cart = getCart();

  if (!cart.length) return;

  const { updatedCart } =
    await syncCartWithStock(cart);

  if (
    JSON.stringify(cart) !==
    JSON.stringify(updatedCart)
  ) {

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );

    updateCartBadge();

  }

}


// ===============================
// UPDATE UI
// ===============================
function updateUI() {

  const filtered = filterProducts(
    allProducts,
    {
      category: currentCategory,
      search: currentSearch,
      sort: currentSort
    }
  );

  // ===============================
  // EMPTY STATE
  // ===============================
  if (!filtered.length) {

    grid.innerHTML = `
      <div class="no-results">
        <p class="no-results__title">
          No products found
        </p>

        <p class="no-results__subtitle">
          Try a different search
        </p>
      </div>
    `;

    return;
  }

  // ===============================
  // CURATED MODEL LAYOUT
  // ===============================
  const curatedProducts =
    filtered.map((product, index) => {

      const row =
        Math.floor(index / 3);

      const position =
        index % 3;

      let allowModel = false;

      if (
        (row % 3 === 0 && position === 1) ||
        (row % 3 === 1 && position === 0) ||
        (row % 3 === 2 && position === 1)
      ) {
        allowModel = true;
      }

      return {
        ...product,
        __allowModel: allowModel
      };

    });

  // ===============================
  // RENDER GRID
  // ===============================
  renderProductGrid(
    grid,
    curatedProducts,
    handleQuickAdd,
    {
      allowModel: true,
      hoverMode: "model"
    }
  );

}


// ===============================
// EVENTS
// ===============================
searchInput?.addEventListener(
  "input",
  (e) => {

    currentSearch =
      e.target.value || "";

    updateUI();

  }
);

sortSelect?.addEventListener(
  "change",
  (e) => {

    currentSort =
      e.target.value;

    updateUI();

  }
);

filterButtons.forEach((btn) => {

  btn.addEventListener("click", () => {

    // ===============================
    // ACTIVE FILTER STATE
    // ===============================
    filterButtons.forEach((button) => {

      button.classList.remove(
        "shop__filter-btn--active"
      );

    });

    btn.classList.add(
      "shop__filter-btn--active"
    );

    // ===============================
    // UPDATE CATEGORY
    // ===============================
    currentCategory =
      btn.dataset.category || "all";

    // ===============================
    // REFRESH UI
    // ===============================
    updateUI();

  });

});


// ===============================
// QUICK ADD
// ===============================
function handleQuickAdd({
  product,
  colorIndex
}) {

  currentProduct = product;

  selectedSize = null;

  const variants =
    product.variants || [];

  if (!variants.length) return;

  selectedVariant =
    product.selectedVariant ||
    variants[colorIndex] ||
    variants.find(
      variant =>
        variant.sizes &&
        variant.sizes.length > 0
    ) ||
    variants[0];

  selectedColor =
    selectedVariant?.name || "Default";

  qaAddBtn.disabled = true;

  qaTitle.textContent =
    product.name;

  qaPrice.textContent =
    `₱${product.price}`;

  // ===============================
  // RENDER COLORS
  // ===============================
  qaColors.innerHTML =
    variants.map((variant, index) => {

      const color =
        variant.value || "#000";

      return `
        <button
          class="quick-add__color-swatch ${index === 0 ? "active" : ""}"
          data-index="${index}"
          style="background:${color}"
        ></button>
      `;

    }).join("");

  renderSizes(selectedVariant);

  // ===============================
  // Aae ONE SIZE
  // ===============================
  const sizes =
    selectedVariant?.sizes || [];

  if (sizes.length === 1) {

  selectedSize =
    sizes[0].size;

  qaAddBtn.disabled = false;

  setTimeout(() => {

    const button =
      qaSizes.querySelector(
        ".product-size__option"
      );

    if (button) {

      button.classList.add(
        "product-size__option--active"
      );

    }

  }, 0);

}

  modal.classList.add("active");
  overlay.classList.add("active");

}

// ===============================
// COLOR CLICK
// ===============================
qaColors.addEventListener("click", (e) => {

  const button =
    e.target.closest(
      ".quick-add__color-swatch"
    );

  if (!button) return;

  const index =
    Number(button.dataset.index);

  const variants =
    currentProduct.variants || [];

  selectedVariant =
    variants[index];

  selectedColor =
    selectedVariant?.name || "Default";

  selectedSize = null;

  qaAddBtn.disabled = true;

  qaColors
    .querySelectorAll(
      ".quick-add__color-swatch"
    )
    .forEach((swatch) => {
      swatch.classList.remove("active");
    });

  button.classList.add("active");

  renderSizes(selectedVariant);

  // ===============================
// AUTO ONE SIZE
// ===============================
const sizes =
  selectedVariant?.sizes || [];

if (sizes.length === 1) {

  selectedSize =
    sizes[0].size;

  qaAddBtn.disabled = false;

  setTimeout(() => {

    const button =
      qaSizes.querySelector(
        ".product-size__option"
      );

    if (button) {

      button.classList.add(
        "product-size__option--active"
      );

    }

  }, 0);

}

});

// ===============================
// RENDER SIZES
// ===============================
function renderSizes(variant) {

  const sizes =
    variant?.sizes || [];

  qaSizes.innerHTML = "";

  // ===============================
  // OUT OF STOCK
  // ===============================
  if (!sizes.length) {

    qaSizes.innerHTML = `
      <p class="quick-add__no-sizes">
        Out of stock
      </p>
    `;

    return;
  }

  // ===============================
  // DISPLAY SIZES
  // ===============================
  const displaySizes =
    sizes.map((sizeItem) => ({
      ...sizeItem,
      size:
        sizeItem.size === "OS"
          ? "ONE SIZE"
          : sizeItem.size
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


// ===============================
// ADD TO CART
// ===============================
qaAddBtn?.addEventListener(
  "click",
  async () => {

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

    // ===============================
    // MATCH VARIANT
    // ===============================
    const variant =
      freshProduct.variants?.find(
        (variantItem) => {

          return (
            (variantItem.name || "")
              .toLowerCase()
              .trim() ===
            (selectedColor || "")
              .toLowerCase()
              .trim()
          );

        }
      ) ||
      freshProduct.variants?.[0];

    if (!variant) return;

    const finalColor =
      variant.name;

    // ===============================
    // ADD TO CART
    // ===============================
    addToCart(
      freshProduct,
      selectedSize,
      finalColor
    );

    updateCartBadge();

    closeModal();

    // ===============================
    // OPEN CART
    // ===============================
    const cartDrawer =
      document.getElementById(
        "cart-drawer"
      );

    const cartOverlay =
      document.getElementById(
        "cart-overlay"
      );

    cartDrawer?.classList.add(
  "cart-drawer--active"
);

cartOverlay?.classList.add(
  "cart-overlay--active"
);

    // ===============================
    // RENDER CART
    // ===============================
    renderCart(
      cartItemsContainer,
      cartTotalContainer
    );

    // ===============================
    // MICRO FEEDBACK
    // ===============================
    qaAddBtn.textContent = "ADDED";

    qaAddBtn.disabled = true;

    setTimeout(() => {

      qaAddBtn.textContent =
        "ADD TO CART";

      qaAddBtn.disabled = false;

    }, 800);

    validateCartAsync();

  }
);


// ===============================
// CLOSE MODAL
// ===============================
function closeModal() {

  modal.classList.remove("active");

  overlay.classList.remove("active");

}

overlay?.addEventListener(
  "click",
  closeModal
);

closeBtn?.addEventListener(
  "click",
  closeModal
);


// ===============================
// QUICK VIEW CONNECTION
// ===============================
window.addEventListener(
  "triggerQuickView",
  (e) => {

    const { productId } =
      e.detail;

    if (!productId) return;

    const product =
      allProducts.find(
        (productItem) =>
          productItem.id === productId
      );

    if (!product) return;

    handleQuickAdd({ product });

  }
);