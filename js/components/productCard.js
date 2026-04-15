// ===============================
// PRODUCT CARD COMPONENT (FINAL — CLEAN + STATE DRIVEN)
// ===============================

import { loadImage } from "../core/imageLoader.js";
import { getProductImage } from "../core/imageResolver.js";


// ===============================
// 🧱 HTML TEMPLATE
// ===============================
export function createProductCard(product) {
  const variants =
    (Array.isArray(product.variants) && product.variants.length > 0)
      ? product.variants
      : (product.colors || []);

  const colorList = variants.map(v =>
    v.value || v.color?.value || "#000"
  );

  const hasColors = colorList.length > 1;

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
              ${colorList.map((colorHex, index) => `
                <span 
                  class="swatch ${index === 0 ? "active" : ""}"
                  data-index="${index}"
                  style="background:${colorHex}"
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
export function initProductCard(card, onQuickAdd, product) {
  let modelTimer;

  let state = {
    isHovering: false,
    modelReady: false,
    variantIndex: 0
  };

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

  const variants =
    (Array.isArray(product.variants) && product.variants.length > 0)
      ? product.variants
      : (product.colors || []);

  const hasColors = variants.length > 0;

  const hasModel =
    product.hasModel === true ||
    String(product.hasModel) === "true";

  const frontImg = card.querySelector(".img-front");
  const swatches = card.querySelectorAll(".swatch");

  const imageCache = {
    back: null,
    model: null
  };

  // ===============================
  // 🔥 RENDER SYSTEM
  // ===============================
  function renderImage() {
    const variant = variants[state.variantIndex] || variants[0];

    const front =
      variant?.images?.front ||
      variant?.front ||
      getProductImage(product, { type: "front" });

    const back =
      variant?.images?.back ||
      variant?.back ||
      getProductImage(product, { type: "back" }) ||
      front;

    const model =
      variant?.images?.model ||
      variant?.model ||
      getProductImage(product, { type: "model" });

    let src;

    if (!state.isHovering) {
      src = front;
    } else if (!state.modelReady) {
      src = imageCache.back || back;
    } else {
      src = imageCache.model || model || back;
    }

    if (frontImg) {
      swapImageSafely(frontImg, src);
    }
  }

  // ===============================
  // 🔥 PRELOAD
  // ===============================
  setTimeout(() => {
    const variant = variants[0];

    const back =
      variant?.images?.back ||
      variant?.back ||
      getProductImage(product, { type: "back" });

    const model =
      variant?.images?.model ||
      variant?.model ||
      getProductImage(product, { type: "model" });

    if (back) {
      loadImage(back, "low").then(() => {
        imageCache.back = back;
      });
    }

    if (hasModel && model) {
      loadImage(model, "low").then(() => {
        imageCache.model = model;
      });
    }
  }, 200);

  // ===============================
  // 🔥 HOVER
  // ===============================
  card.addEventListener("mouseenter", () => {
    state.isHovering = true;
    state.modelReady = false;

    renderImage();

    clearTimeout(modelTimer);

    modelTimer = setTimeout(() => {
      state.modelReady = true;
      renderImage();
    }, 400);
  });

  // ===============================
  // 🔥 LEAVE
  // ===============================
  card.addEventListener("mouseleave", () => {
    state.isHovering = false;
    state.modelReady = false;

    clearTimeout(modelTimer);
    renderImage();
  });

  // ===============================
  // 🛒 QUICK ADD
  // ===============================
  const quickAddBtn = card.querySelector(".quick-add-btn");

  if (quickAddBtn) {
    quickAddBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      let variant = null;

      if (variants.length > 0) {
        variant =
          variants.find(v => v.sizes && v.sizes.length > 0) ||
          variants[0];
      }

      if (!variant) {
        console.error("❌ No variant found", product);
        return;
      }

      onQuickAdd({
        product: {
          ...product,
          selectedVariant: variant
        }
      });
    });
  }

  // ===============================
  // 🎨 SWATCHES
  // ===============================
  if (swatches.length && hasColors) {
    swatches.forEach((swatch) => {
      const index = Number(swatch.dataset.index);

      swatch.addEventListener("mouseenter", () => {
        state.variantIndex = index;
        renderImage();

        swatches.forEach(s => s.classList.remove("active"));
        swatch.classList.add("active");
      });

      swatch.addEventListener("click", (e) => {
        e.stopPropagation();

        swatches.forEach(s => s.classList.remove("active"));
        swatch.classList.add("active");
      });
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