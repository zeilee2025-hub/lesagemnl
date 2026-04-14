import { getProductById } from "../services/productService.js";
import { addToCart, getCart } from "../services/cartService.js";
import { validateCartBeforeCheckout } from "../core/checkoutValidation.js";

// ✅ COMPONENTS
import { initProductGallery } from "../components/productGallery.js";
import { initSizeSelector } from "../components/sizeSelector.js";
import { initColorSelector } from "../components/colorSelector.js";
import { initAddToCart } from "../components/addToCart.js";
import { showToast } from "../components/toast.js";
import { renderCart } from "../components/cartDrawer.js";

import { updateCartBadge } from "../services/cartService.js";
import { renderSizeGuide } from "../components/sizeGuide.js";

// ==========================
// 📦 GET PRODUCT ID FROM URL
// ==========================
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

// ==========================
// 🧱 ELEMENTS
// ==========================
const imageEl = document.getElementById("product-image");
const thumbnailsContainer = document.getElementById("product-thumbnails");

const nameEl = document.getElementById("product-name");
const priceEl = document.getElementById("product-price");
const descEl = document.getElementById("product-description");

const sizeContainer = document.getElementById("size-container");
const colorContainer = document.getElementById("color-container");

const addBtn = document.getElementById("add-to-cart-btn");
const buyNowBtn = document.getElementById("buy-now-btn");

const selectedSizeText = document.getElementById("selected-size-text");
const stockMessage = document.getElementById("stock-message");
const sizeError = document.getElementById("size-error");

// 🔥 SIZE CHART
const sizeChartBtn = document.getElementById("size-chart-btn");
const sizeChartModal = document.getElementById("size-chart-modal");
const sizeChartClose = document.getElementById("size-chart-close");
const sizeChartOverlay = document.querySelector(".size-chart-overlay");

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
// 🧠 STATE
// ==========================
let selectedSize = null;
let currentProduct = null;
let selectedVariantIndex = 0;

// ==========================
// 🚀 INIT
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
      type: product.type || mapCategoryToType(product.category)
    };

    // 🔥 SET DEFAULT VARIANT
    currentProduct.selectedVariant = currentProduct.variants?.[0];

    renderProduct(currentProduct);

    // ==========================
    // 🎨 COLOR SELECTOR (FIXED)
    // ==========================
    initColorSelector(product.variants, colorContainer, (index) => {
      selectedVariantIndex = index;

      // 🔥 UPDATE REAL STATE
      currentProduct.selectedVariant = currentProduct.variants[index];
      const selectedVariant = currentProduct.selectedVariant;

      // 🔥 RESET SIZE
      selectedSize = null;
      selectedSizeText.textContent = "Select Size";
      stockMessage.textContent = "";

      // 🔥 UPDATE GALLERY
      initProductGallery(currentProduct, {
        imageEl,
        thumbnailsContainer
      });

      // 🔥 UPDATE SIZES
      initSizeSelector(
        selectedVariant.sizes || [],
        {
          sizeContainer,
          addBtn
        },
        handleSizeChange
      );
    });

    // ==========================
    // 📏 INITIAL SIZE SELECTOR
    // ==========================
    initSizeSelector(
      currentProduct.selectedVariant?.sizes || [],
      {
        sizeContainer,
        addBtn
      },
      handleSizeChange
    );

    // ==========================
    // 🛒 ADD TO CART (FIXED)
    // ==========================
    initAddToCart(
      { addBtn },
      () => ({
        product: currentProduct,
        selectedSize
      }),
      (product, size) => {
        const variant = product.selectedVariant;

        if (!size && variant?.sizes?.length > 1) {
          sizeError.textContent = "Please select a size";
          return;
        }

        sizeError.textContent = "";

        addToCart(product, size, variant.name); // ✅ FIXED
        updateCartBadge();

        showToast(
          `Added ${product.name} (${variant.name} - ${size}) to cart`
        );

        openCart();
      }
    );

    // ==========================
    // ⚡ BUY NOW (FIXED)
    // ==========================
    buyNowBtn?.addEventListener("click", () => {
      const variant = currentProduct.selectedVariant;

      if (!selectedSize && variant?.sizes?.length > 1) {
        sizeError.textContent = "Please select a size";
        return;
      }

      sizeError.textContent = "";

      buyNowBtn.textContent = "PROCESSING...";
      buyNowBtn.disabled = true;

      addToCart(currentProduct, selectedSize, variant.name); // ✅ FIXED

      updateCartBadge();

      setTimeout(() => {
        window.location.href = "./checkout.html";
      }, 300);
    });

    // ==========================
    // 📏 SIZE CHART
    // ==========================
    sizeChartBtn?.addEventListener("click", () => {
      const modalContent = document.querySelector(".size-guide-modal__body");

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
// 📏 SIZE CHANGE HANDLER
// ==========================
function handleSizeChange(size) {
  selectedSize = size;

  if (!stockMessage || !selectedSizeText) return;

  stockMessage.classList.remove("low");

  const currentVariant = currentProduct?.selectedVariant;
  if (!currentVariant) return;

  const selectedItem = currentVariant.sizes?.find(
    s => s.size === size
  );

  if (selectedItem) {
    const stock = selectedItem.stock;

    selectedSizeText.textContent = `Selected: ${size}`;

    if (stock <= 0) {
      stockMessage.textContent = "Out of stock";
    } else if (stock <= 3) {
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
// 🎨 RENDER PRODUCT
// ==========================
function renderProduct(product) {
  initProductGallery(product, {
    imageEl,
    thumbnailsContainer
  });

  nameEl.textContent = product.name;

  const styleEl = document.querySelector(".product__style");

  if (styleEl && product.style) {
    styleEl.textContent = formatStyle(product.style);
  }

  priceEl.textContent = `₱${product.price.toLocaleString()}`;
  descEl.innerHTML = product.description || "No description available.";

  renderFeatures(product.features);
}

// ==========================
// 📋 FEATURES
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
// 🎨 FORMAT STYLE
// ==========================
function formatStyle(style) {
  if (!style) return "";

  return style
    .replace("-", " ")
    .replace(/\b\w/g, l => l.toUpperCase()) + " Fit";
}

// ==========================
// 🧠 CATEGORY → TYPE
// ==========================
function mapCategoryToType(category) {
  const c = String(category || "").toLowerCase();

  if (c.includes("top")) return "tee";

  return null;
}

// ==========================
// 🛒 OPEN CART
// ==========================
function openCart() {
  const cartDrawer = document.getElementById("cart-drawer");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  cartDrawer?.classList.add("active");
  cartOverlay?.classList.add("active");

  renderCart(cartItems, cartTotal);
}