// ===============================
// PRODUCT CARD COMPONENT (FINAL — STABLE VARIANT SYSTEM)
// ===============================

import { loadImage } from "../core/imageLoader.js";
import { getProductImage } from "../core/imageResolver.js";


// ===============================
// 🧱 HTML TEMPLATE
// ===============================
export function createProductCard(product, options = {}) {
  const rawVariants =
    (Array.isArray(product.variants) && product.variants.length > 0)
      ? product.variants
      : (product.colors || []);

  const variants = rawVariants.map((v, index) => ({
    value: v.value || v.color?.value || "#000"
  }));

  const hasColors = variants.length > 1;

  const frontImage = getProductImage(product, { type: "front" });
  const backImage =
    getProductImage(product, { type: "back" }) || frontImage;

  return `
    <div class="product-card" data-id="${product.id}">
      
      <div class="product-media">
        <img src="${frontImage}" class="img-front" alt="${product.name}" />
        <img src="${backImage}" class="img-back" alt="${product.name}" />

        <div class="product-overlay"></div>
        <button class="quick-add-btn">+</button>
      </div>

      <div class="product-info">
        <p class="product-title">${product.name}</p>
        <p class="product-price">₱${product.price}</p>

        ${
          hasColors
            ? `
            <div class="product-swatches">
              ${variants.map((v, index) => `
                <span 
                  class="swatch ${index === 0 ? "active" : ""}"
                  data-index="${index}"
                  style="background:${v.value}"
                ></span>
              `).join("")}
            </div>
            `
            : ""
        }
      </div>

    </div>
  `;
}


// ===============================
// 🎯 INTERACTION LOGIC
// ===============================
export function initProductCard(card, onQuickAdd, product, options = {}) {
  let modelTimer;

  const config = {
    allowModel: options.allowModel ?? true,
    hoverMode: options.hoverMode ?? "model"
  };

  let state = {
    isHovering: false,
    modelReady: false,
    activeVariantIndex: 0,
    hoverVariantIndex: null
  };

  function getCurrentVariantIndex() {
    return state.hoverVariantIndex !== null
      ? state.hoverVariantIndex
      : state.activeVariantIndex;
  }

  function isValidSrc(src) {
    return typeof src === "string" && src.trim() !== "";
  }

  function swapImageSafely(imgEl, newSrc) {
    if (!imgEl || !isValidSrc(newSrc) || imgEl.src === newSrc) return;

    const temp = new Image();
    temp.src = newSrc;

    temp.onload = () => {
      imgEl.src = newSrc;
    };
  }

  // ===============================
// 🔥 NORMALIZED VARIANTS (CRITICAL)
// ===============================
const rawVariants =
  (Array.isArray(product.variants) && product.variants.length > 0)
    ? product.variants
    : (product.colors || []);

const variants = rawVariants.map((v, index) => {
  const modelSrc = v.model || v?.images?.model || null;

  return {
    name: v.name || `variant-${index}`,
    front: v.front || v?.images?.front || null,
    back: v.back || v?.images?.back || null,

    // 🔥 CLEAN MODEL (normalized)
    model: typeof modelSrc === "string" ? modelSrc.trim() : null,

    value: v.value || v.color?.value || "#000",
    sizes: v.sizes || []
  };
});

const hasColors = variants.length > 1;


// ===============================
// 🔥 STRICT MODEL DETECTION (FIXED)
// ===============================
const hasModel =
  config.allowModel &&
  (product.__allowModel === undefined || product.__allowModel === true) &&
  variants.some(v => {
    if (!v.model) return false;

    const url = v.model;

    return (
      url !== "" &&
      url !== "null" &&
      url !== "undefined" &&
      url.startsWith("http")
    );
  });


// ===============================
// 🎯 ELEMENTS
// ===============================
const frontImg = card.querySelector(".img-front");
const swatches = card.querySelectorAll(".swatch");

const imageCache = {};

  // ===============================
// 🔥 RENDER
// ===============================
function renderImage() {
  const index = getCurrentVariantIndex();

  const variant = variants[index] || variants[0];
  const variantKey = variant.name || index;

  if (!imageCache[variantKey]) {
    imageCache[variantKey] = { back: null, model: null };
  }

  const front = variant.front || getProductImage(product, { type: "front" });
  const back = variant.back || null;
  const model = variant.model || null;

  let src;

  const isHovered = card.matches(":hover");

  // ===============================
  // 🧠 IMAGE LOGIC
  // ===============================
  if (!isHovered) {
    src = front;

  } else if (config.hoverMode === "back") {
    src = back || front;

  } else {
    if (!state.modelReady) {
      src = back || front;
    } else {
      src = model || back || front;
    }
  }

  // ===============================
  // 🔥 MODEL STATE (EDGE-TO-EDGE CONTROL)
  // ===============================
  card.classList.remove("is-model");

  if (isHovered && state.modelReady && model) {
    card.classList.add("is-model");
  }

  // ===============================
  // 🎯 APPLY IMAGE
  // ===============================
  swapImageSafely(frontImg, src);
}

  // ===============================
  // 🔥 PRELOAD (SAFE)
  // ===============================
  setTimeout(() => {
    variants.forEach((variant, index) => {
      const key = variant.name || index;

      if (!imageCache[key]) {
        imageCache[key] = { back: null, model: null };
      }

      const cache = imageCache[key];

      if (variant.back) {
        loadImage(variant.back, "low").then(() => {
          cache.back = variant.back;
        });
      }

      if (hasModel && variant.model) {
        loadImage(variant.model, "low").then(() => {
          cache.model = variant.model;
        });
      }
    });
  }, 200);

  // ===============================
// 🔥 HOVER (FIXED)
// ===============================
card.addEventListener("mouseenter", () => {
  state.isHovering = true;
  state.modelReady = false;

  console.log("HOVER START"); // debug

  renderImage();

  clearTimeout(modelTimer);

  if (config.hoverMode === "model" && hasModel) {
    modelTimer = setTimeout(() => {
      state.modelReady = true;
      renderImage();
    }, 800);
  }
});

card.addEventListener("mouseleave", () => {
  state.isHovering = false;
  state.modelReady = false;

  console.log("HOVER END"); // debug

  clearTimeout(modelTimer);
  renderImage();
});

  // ===============================
  // 🎨 SWATCHES (FIXED)
  // ===============================
  if (swatches.length && hasColors) {
    swatches.forEach((swatch) => {
      const index = Number(swatch.dataset.index);

      swatch.addEventListener("mouseenter", () => {
        state.hoverVariantIndex = index;
        renderImage();
      });

      swatch.addEventListener("click", (e) => {
        e.stopPropagation();

        state.activeVariantIndex = index;

        swatches.forEach(s => s.classList.remove("active"));
        swatch.classList.add("active");

        renderImage();
      });
    });
  }

  // ===============================
// 🛒 QUICK ADD (FIXED — ROUTE TO PDP )
// ===============================
const quickAddBtn = card.querySelector(".quick-add-btn");

if (quickAddBtn) {
  quickAddBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    // ==========================
    // 🔒 SAFETY: Ensure product exists
    // ==========================
    if (!product || !product.id) return;

    const productId = product.id;

    // ==========================
    // 🚀 REDIRECT TO PDP
    // (PDP handles size + stock properly)
    // ==========================
    window.location.href = `./product.html?id=${productId}`;
  });
}

  // ===============================
  // 🧭 NAVIGATION
  // ===============================
  card.addEventListener("click", () => {
    const productId = card.dataset.id;
    window.location.href = `./product.html?id=${productId}`;
  });

  // ===============================
  // 🔥 INITIAL RENDER
  // ===============================
  renderImage();
}