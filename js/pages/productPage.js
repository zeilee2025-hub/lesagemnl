// ===============================
//  PRODUCT PAGE (ORCHESTRATOR)
// ===============================

import { getProductById } from "../services/productService.js";
import { updateCartBadge } from "../services/cartService.js";

// COMPONENTS
import { initProductGallery } from "../components/productGallery.js";
import { initSizeSelector } from "../components/sizeSelector.js";
import { initColorSelector } from "../components/colorSelector.js";
import { showToast } from "../components/toast.js";
import { renderCart } from "../components/cartDrawer.js";
import { renderSizeGuide } from "../components/sizeGuide.js";

// ACTIONS (NEW SYSTEM)
import { handleAddToCart, handleBuyNow } from "./productActions.js";


// ==========================
//  CART ERROR LISTENER
// ==========================
window.addEventListener("cartError", (e) => {
  showToast(e.detail.message);
});


// ==========================
//  GET PRODUCT ID
// ==========================
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");


// ==========================
//  ELEMENTS
// ==========================
const imageEl = document.getElementById("product-image");
const thumbnailsContainer = document.getElementById("product-thumbnails");

const nameEl = document.getElementById("product-name");
const priceEl = document.getElementById("product-price");
const descEl = document.getElementById("product-description");

const sizeContainer = document.getElementById("size-container");
const colorContainer = document.getElementById("color-container");

const addBtn = document.getElementById("add-to-cart-btn");

const selectedSizeText = document.getElementById("selected-size-text");
const stockMessage = document.getElementById("stock-message");
const sizeError = document.getElementById("size-error");

// SIZE CHART
const sizeChartBtn = document.getElementById("size-chart-btn");
const sizeChartModal = document.getElementById("size-chart-modal");
const sizeChartClose = document.getElementById("size-chart-close");
const sizeChartOverlay = document.querySelector(".modal__overlay");


// ==========================
// 📏 SIZE CHART CLOSE
// ==========================
sizeChartClose?.addEventListener("click", () => {
  sizeChartModal.classList.remove("active");
});

sizeChartOverlay?.addEventListener("click", () => {
  sizeChartModal.classList.remove("active");
});


// ==========================
//  STATE
// ==========================
let selectedSize = null;
let currentProduct = null;
let selectedVariantIndex = 0;


// ==========================
//  HELPERS
// ==========================
function formatSize(size) {
  if (!size) return "";
  return size === "ONE_SIZE" ? "One Size" : size;
}


// ==========================
//  INIT
// ==========================
init();

async function init() {
  updateCartBadge();

  if (!productId) {
    nameEl.textContent = "Product not found";
    return;
  }

  try {
    const product = await getProductById(productId);

    if (!product) {
      nameEl.textContent = "Product not found";
      return;
    }

    currentProduct = {
  ...product,
  type:
    product.type ||
    mapCategoryToType(
      product.category || product.name
    )
};

console.log("PRODUCT NAME:", product.name);
console.log("PRODUCT CATEGORY:", product.category);
console.log("PRODUCT TYPE:", currentProduct.type);

    currentProduct.selectedVariant = currentProduct.variants?.[0];

    // SAFE DEFAULT
    if (addBtn) {
      addBtn.disabled = true;
      addBtn.textContent = "ADD TO BAG";
    }

    renderProduct(currentProduct);

    // ==========================
    //  COLOR SELECTOR
    // ==========================
    initColorSelector(product.variants, colorContainer, (index) => {
      selectedVariantIndex = index;

      currentProduct.selectedVariant = currentProduct.variants[index];
      const selectedVariant = currentProduct.selectedVariant;

      selectedSize = null;
      stockMessage.textContent = "";

      if (addBtn) {
        addBtn.disabled = true;
        addBtn.textContent = "ADD TO BAG";
      }

      selectedSizeText.textContent =
        selectedVariant?.sizes?.length === 1
          ? "Selected: One Size"
          : "Select Size";

      initProductGallery(currentProduct, {
        imageEl,
        thumbnailsContainer
      });

      initSizeSelector(
        selectedVariant.sizes || [],
        {
          sizeContainer,
          addBtn
        },
        handleSizeChange
      );

      // ONE SIZE AUTO
      const sizes = selectedVariant.sizes || [];

      if (sizes.length === 1) {
        const item = sizes[0];
        const onlySize = typeof item === "string" ? item : item.size;

        selectedSize = onlySize;

        selectedSizeText.textContent = `Selected: ${formatSize(onlySize)}`;

        handleSizeChange(onlySize);
      }
    });


    // ==========================
    //  INITIAL SIZE SELECTOR
    // ==========================
    initSizeSelector(
      currentProduct.selectedVariant?.sizes || [],
      {
        sizeContainer,
        addBtn
      },
      handleSizeChange
    );

    // ONE SIZE AUTO INIT
    const sizes = currentProduct.selectedVariant?.sizes || [];

    if (sizes.length === 1) {
      const item = sizes[0];
      const onlySize = typeof item === "string" ? item : item.size;

      selectedSize = onlySize;

      selectedSizeText.textContent = `Selected: ${formatSize(onlySize)}`;

      handleSizeChange(onlySize);
    }


    // ==========================
    //  ACTIONS (NEW SYSTEM)
    // ==========================
    handleAddToCart(
  () => ({
    product: currentProduct,
    selectedSize
  }),
  openCart,
  (msg) => { sizeError.textContent = msg; }
);

handleBuyNow(
  () => ({
    product: currentProduct,
    selectedSize
  }),
  (msg) => { sizeError.textContent = msg; }
);

    // ==========================
    //  SIZE CHART
    // ==========================
    sizeChartBtn?.addEventListener("click", () => {
      const modalContent = document.querySelector(".modal__body");

      if (!modalContent || !currentProduct) return;

      modalContent.innerHTML = renderSizeGuide(
        currentProduct.type,
        selectedSize
      );

      sizeChartModal.classList.add("active");
    });

  } catch (error) {
    console.error("Error loading product:", error);
    nameEl.textContent = "Failed to load product";
  }
}


// ==========================
//  SIZE CHANGE HANDLER
// ==========================
function handleSizeChange(size) {
  selectedSize = size;

  if (!stockMessage || !selectedSizeText) return;

  stockMessage.classList.remove("low");

  const currentVariant = currentProduct?.selectedVariant;
  if (!currentVariant) return;

  const sizes = currentVariant.sizes || [];

  const selectedItem = sizes.find(s => {
    const sSize = typeof s === "string" ? s : s.size;
    return String(sSize).toUpperCase() === String(size).toUpperCase();
  });

  selectedSizeText.textContent = `Selected: ${formatSize(size)}`;

  if (!selectedItem) {
    stockMessage.textContent = "";
    sizeError.textContent = "";
    return;
  }

  const stock = typeof selectedItem === "string" ? 0 : selectedItem.stock;

  if (stock <= 0) {
    stockMessage.textContent = "Out of stock";
  } else {
    if (stock <= 3) {
      stockMessage.textContent = `Only ${stock} left`;
      stockMessage.classList.add("low");
    } else if (stock <= 5) {
      stockMessage.textContent = "Low stock";
      stockMessage.classList.add("low");
    } else {
      stockMessage.textContent = "";
    }
  }

  sizeError.textContent = "";
}


// ==========================
//  RENDER PRODUCT
// ==========================
function renderProduct(product) {
  initProductGallery(product, {
    imageEl,
    thumbnailsContainer
  });

  nameEl.textContent = product.name;

  const styleEl = document.querySelector(".product-detail__style");

  if (styleEl && product.style) {
    styleEl.textContent = formatStyle(product.style);
  }

  priceEl.textContent = `₱${product.price.toLocaleString()}`;
  descEl.innerHTML = product.description || "No description available.";

  renderFeatures(product.features);
}


// ==========================
//  FEATURES
// ==========================
function renderFeatures(features) {
  const container = document.getElementById("product-features");

  if (!container || !features) return;

  if (Array.isArray(features)) {
    container.innerHTML = `
      <ul>
        ${features.map(item => `<li>${item}</li>`).join("")}
      </ul>
    `;
  } else {
    const items = features.split("  ");
    container.innerHTML = `
      <ul>
        ${items.map(item => `<li>${item.trim()}</li>`).join("")}
      </ul>
    `;
  }
}


// ==========================
//  FORMAT STYLE
// ==========================
function formatStyle(style) {
  if (!style) return "";

  return style
    .replace("-", " ")
    .replace(/\b\w/g, l => l.toUpperCase()) + " Fit";
}


// ==========================
//  CATEGORY → TYPE
// ==========================
function mapCategoryToType(category) {
  const c = String(category || "")
    .trim()
    .toLowerCase();

  // TOPS
  if (c.includes("top")) return "tee";

  // RACERBACK
  if (c.includes("racer")) return "racerback";

  // MUSCLE
  if (c.includes("muscle")) return "muscle";

  // PANTS / BOTTOMS
if (
  c.includes("pant") ||
  c.includes("bottom")
) {
  return "pants";
}

// JORTZ / SHORTS
if (
  c.includes("jort") ||
  c.includes("short")
) {
  return "jortz";
}

  // HOODIE
  if (c.includes("hoodie")) return "hoodie";

  // SWEATSHIRT
  if (c.includes("sweat")) return "sweatshirt";

  // ACCESSORY
  if (c.includes("accessory")) return "accessory";

  return null;
}


// ==========================
//  OPEN CART
// ==========================
function openCart() {
  const cartDrawer = document.getElementById("cart-drawer");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  cartDrawer?.classList.add(
  "cart-drawer--active"
);

cartOverlay?.classList.add(
  "cart-overlay--active"
);

  renderCart(cartItems, cartTotal);
}