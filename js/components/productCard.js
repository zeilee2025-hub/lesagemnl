// ===============================
// PRODUCT CARD COMPONENT (FINAL — UNIFIED VARIANT SYSTEM)
// ===============================

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
  const hasModel = product.hasModel === true;

  const frontImage = getProductImage(product, { type: "front" });
  const backImage = getProductImage(product, { type: "back" });
  const modelImage = hasModel
    ? getProductImage(product, { type: "model" })
    : null;

  return `
    <div class="product-card" data-id="${product.id}">
      
      <div class="product-media">

        <img src="${frontImage}" class="img-front" alt="${product.name}" />
        <img src="${backImage}" class="img-back" alt="${product.name}" />

        ${
          hasModel
            ? `<img src="${modelImage}" class="img-model" alt="${product.name}" />`
            : ""
        }

        <div class="product-overlay"></div>

        <button class="quick-add-btn" aria-label="Add to cart">+</button>

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
  let hoverTimer;

  const variants =
    (Array.isArray(product.variants) && product.variants.length > 0)
      ? product.variants
      : (product.colors || []);

  const hasColors = variants.length > 0;
  const hasModel = product.hasModel === true;

  const frontImg = card.querySelector(".img-front");
  const backImg = card.querySelector(".img-back");
  const modelImg = card.querySelector(".img-model");
  const swatches = card.querySelectorAll(".swatch");

  let selectedIndex = 0;

  // ===============================
  // 🔥 HOVER SYSTEM
  // ===============================
  card.addEventListener("mouseenter", () => {
    hoverTimer = setTimeout(() => {
      card.classList.add("hover-deep");
    }, 250);
  });

  card.addEventListener("mouseleave", () => {
    clearTimeout(hoverTimer);
    card.classList.remove("hover-deep");

    if (hasColors) {
      const variant = variants[selectedIndex];

      const front =
        variant?.images?.front ||
        variant?.front ||
        getProductImage(product, { type: "front" });

      const back =
        variant?.images?.back ||
        variant?.back ||
        getProductImage(product, { type: "back" });

      if (frontImg && front) frontImg.src = front;
      if (backImg && back) backImg.src = back;

      if (hasModel && modelImg) {
        const model =
          variant?.images?.model ||
          variant?.model ||
          getProductImage(product, { type: "model" });

        if (model) modelImg.src = model;
      }

    } else {
      if (frontImg) frontImg.src = getProductImage(product, { type: "front" });
      if (backImg) backImg.src = getProductImage(product, { type: "back" });

      if (hasModel && modelImg) {
        modelImg.src = getProductImage(product, { type: "model" });
      }
    }
  });

  // ===============================
  // 🛒 QUICK ADD (CRITICAL FIX)
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
        selectedIndex = index;

        const variant = variants[index];

        const front =
          variant?.images?.front ||
          variant?.front ||
          getProductImage(product, { type: "front" });

        const back =
          variant?.images?.back ||
          variant?.back ||
          getProductImage(product, { type: "back" });

        if (frontImg && front) frontImg.src = front;
        if (backImg && back) backImg.src = back;

        if (hasModel && modelImg) {
          const model =
            variant?.images?.model ||
            variant?.model ||
            getProductImage(product, { type: "model" });

          if (model) modelImg.src = model;
        }

        swatches.forEach(s => s.classList.remove("active"));
        swatch.classList.add("active");
      });

      swatch.addEventListener("click", (e) => {
        e.stopPropagation();

        selectedIndex = index;

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
}