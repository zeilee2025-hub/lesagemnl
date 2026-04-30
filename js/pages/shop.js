// ===============================
// 🧪 DEBUG
// ===============================
console.log("SHOP JS LOADED");

// ===============================
// IMPORTS
// ===============================
import { listenToProducts, getProductById } from "../services/productService.js";
import { renderProductGrid } from "../components/productGrid.js";
import { filterProducts } from "../core/filter.js";
import { 
  addToCart, 
  updateCartBadge,
  getCart
} from "../services/cartService.js";
import { syncCartWithStock } from "../core/stock.js";
import { initSizeSelector } from "../components/sizeSelector.js";
import { renderCart } from "../components/cartDrawer.js";
import { validateCartAsync } from "../core/cartValidationAsync.js";


// ===============================
// 🔍 GET SEARCH FROM URL
// ===============================
function getSearchFromURL() {
  const params = new URLSearchParams(window.location.search);
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
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const filterButtons = document.querySelectorAll(".filter-btn");

// MODAL
const modal = document.getElementById("quick-add-modal");
const overlay = document.getElementById("quick-add-overlay");
const closeBtn = document.getElementById("quick-add-close");

const qaTitle = document.getElementById("qa-title");
const qaPrice = document.getElementById("qa-price");
const qaSizes = document.getElementById("qa-sizes");
const qaColors = document.getElementById("qa-colors");
const qaAddBtn = document.getElementById("qa-add-btn");

// CART (RENDER ONLY)
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
    allProducts = Array.isArray(products) ? products : [];

    validateCartOnLoad();
    updateUI();
  });

  updateCartBadge();
}


// ===============================
// 🔄 SYNC CART ON LOAD
// ===============================
async function validateCartOnLoad() {
  const cart = getCart();
  if (!cart.length) return;

  const { updatedCart } = await syncCartWithStock(cart);

  if (JSON.stringify(cart) !== JSON.stringify(updatedCart)) {
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    updateCartBadge();
  }
}


// ===============================
// UPDATE UI
// ===============================
function updateUI() {
  const filtered = filterProducts(allProducts, {
    category: currentCategory,
    search: currentSearch,
    sort: currentSort
  });

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="no-results">
        <p class="no-results-title">No products found</p>
        <p class="no-results-sub">Try a different search</p>
      </div>
    `;
    return;
  }

  // 🔥 APPLY PATTERN: [2nd, 3rd, 1st] PER ROW
  const curatedProducts = filtered.map((product, index) => {
    const row = Math.floor(index / 3); // row index
    const position = index % 3;        // 0,1,2

    let allowModel = false;

    if (
      (row % 3 === 0 && position === 1) || // row 1 → 2nd
      (row % 3 === 1 && position === 2) || // row 2 → 3rd
      (row % 3 === 2 && position === 0)    // row 3 → 1st
    ) {
      allowModel = true;
    }

    return {
      ...product,
      __allowModel: allowModel
    };
  });

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
searchInput?.addEventListener("input", (e) => {
  currentSearch = e.target.value || "";
  updateUI();
});

sortSelect?.addEventListener("change", (e) => {
  currentSort = e.target.value;
  updateUI();
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    currentCategory = btn.dataset.category || "all";
    updateUI();
  });
});


// ===============================
// 🛒 QUICK ADD
// ===============================
function handleQuickAdd({ product }) {

  currentProduct = product;
  selectedSize = null;

  const variants = product.variants || [];
  if (!variants.length) return;

  selectedVariant =
    product.selectedVariant ||
    variants.find(v => v.sizes && v.sizes.length > 0) ||
    variants[0];

  selectedColor = selectedVariant?.name || "Default";

  qaAddBtn.disabled = true;

  qaTitle.textContent = product.name;
  qaPrice.textContent = `₱${product.price}`;

  qaColors.innerHTML = variants.map((variant, i) => {
    const color = variant.value || "#000";

    return `
      <button 
        class="qa-color-swatch ${i === 0 ? "active" : ""}"
        data-index="${i}"
        style="background:${color}"
      ></button>
    `;
  }).join("");

  renderSizes(selectedVariant);

  const sizes = selectedVariant?.sizes || [];
  if (sizes.length === 1) {
    selectedSize = sizes[0].size;
    qaAddBtn.disabled = false;

    setTimeout(() => {
      const btn = qaSizes.querySelector("button");
      if (btn) btn.classList.add("active");
    }, 0);
  }

  modal.classList.add("active");
  overlay.classList.add("active");
}


// ===============================
// 🎨 COLOR CLICK
// ===============================
qaColors.addEventListener("click", (e) => {
  const btn = e.target.closest(".qa-color-swatch");
  if (!btn) return;

  const index = Number(btn.dataset.index);

  const variants = currentProduct.variants || [];

  selectedVariant = variants[index];
  selectedColor = selectedVariant?.name || "Default";

  selectedSize = null;
  qaAddBtn.disabled = true;

  qaColors.querySelectorAll(".qa-color-swatch").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  renderSizes(selectedVariant);

  const sizes = selectedVariant?.sizes || [];
  if (sizes.length === 1) {
    selectedSize = sizes[0].size;
    qaAddBtn.disabled = false;

    setTimeout(() => {
      const btn = qaSizes.querySelector("button");
      if (btn) btn.classList.add("active");
    }, 0);
  }
});


// ===============================
// 📏 SIZE RENDER
// ===============================
function renderSizes(variant) {
  const sizes = variant?.sizes || [];

  qaSizes.innerHTML = "";

  if (!sizes.length) {
    qaSizes.innerHTML = `<p class="no-sizes">Out of stock</p>`;
    return;
  }

  const displaySizes = sizes.map(s => ({
    ...s,
    size: s.size === "OS" ? "ONE SIZE" : s.size
  }));

  initSizeSelector(
    displaySizes,
    {
      sizeContainer: qaSizes,
      addBtn: qaAddBtn
    },
    (size) => {
      selectedSize = size === "ONE SIZE" ? "OS" : size;
    }
  );
}


// ===============================
// 🛒 ADD TO CART
// ===============================
qaAddBtn?.addEventListener("click", async () => {
  if (!currentProduct || !selectedSize) return;

  const freshProduct = await getProductById(currentProduct.id);
  if (!freshProduct) return;

  const variant =
    freshProduct.variants?.find(v =>
      (v.name || "").toLowerCase().trim() ===
      (selectedColor || "").toLowerCase().trim()
    ) ||
    freshProduct.variants?.[0];

  if (!variant) return;

  const finalColor = variant.name;

  addToCart(freshProduct, selectedSize, finalColor);

  updateCartBadge();
  closeModal();

  // 🔥 OPEN CART
  const cartDrawer = document.getElementById("cart-drawer");
  const cartOverlay = document.getElementById("cart-overlay");

  cartDrawer?.classList.add("active");
  cartOverlay?.classList.add("active");

  // 🔥 RENDER
  renderCart(cartItemsContainer, cartTotalContainer);

  // 🔥 MICRO FEEDBACK
  qaAddBtn.textContent = "ADDED";
  qaAddBtn.disabled = true;

  setTimeout(() => {
    qaAddBtn.textContent = "ADD TO CART";
    qaAddBtn.disabled = false;
  }, 800);

  validateCartAsync();
});


// ===============================
// ❌ CLOSE MODAL
// ===============================
function closeModal() {
  modal.classList.remove("active");
  overlay.classList.remove("active");
}

overlay?.addEventListener("click", closeModal);
closeBtn?.addEventListener("click", closeModal);