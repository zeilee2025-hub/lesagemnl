// ===============================
// 🖼 PRODUCT GALLERY COMPONENT (VARIANT FIXED)
// ===============================

export function initProductGallery(product, elements) {
  const { imageEl, thumbnailsContainer } = elements;

  let currentImageIndex = 0;

  // 🔥 ALWAYS RESOLVE VARIANT
  const resolvedProduct = {
    ...product,
    selectedVariant: product.selectedVariant || product.variants?.[0]
  };

  let productImages = buildImageArray(resolvedProduct);

  // ==========================
  // 🚀 INIT
  // ==========================
  if (!productImages.length) return;

  imageEl.src = productImages[0];

  renderThumbnails(productImages);

  // ==========================
  // 🧠 BUILD IMAGE ARRAY (FIXED)
  // ==========================
  function buildImageArray(product) {
    const images = [];

    const order = ["front", "back", "model", "detail", "close"];

    // 🔥 1. VARIANT LEVEL (CRITICAL FIX)
    if (product.selectedVariant?.images) {
      order.forEach(type => {
        if (product.selectedVariant.images[type]) {
          images.push(product.selectedVariant.images[type]);
        }
      });

      if (images.length) return images;
    }

    // 🔥 2. PRODUCT LEVEL (FALLBACK)
    if (product.images) {
      order.forEach(type => {
        if (product.images[type]) {
          images.push(product.images[type]);
        }
      });
    }

    return images;
  }

  // ==========================
  // 🖼 THUMBNAILS
  // ==========================
  function renderThumbnails(images) {
    if (!thumbnailsContainer) return;

    thumbnailsContainer.innerHTML = "";

    images.forEach((img, index) => {
      const thumb = document.createElement("img");
      thumb.src = img;
      thumb.classList.add("thumbnail");

      if (index === 0) thumb.classList.add("active");

      thumb.addEventListener("click", () => {
        imageEl.classList.add("image-fade");

        setTimeout(() => {
          imageEl.src = img;
          imageEl.classList.remove("image-fade");
        }, 150);

        currentImageIndex = index;

        thumbnailsContainer.querySelectorAll(".thumbnail").forEach(t => {
          t.classList.remove("active");
        });

        thumb.classList.add("active");
      });

      thumbnailsContainer.appendChild(thumb);
    });
  }

  // ==========================
  // 🖱 HOVER IMAGE
  // ==========================
  imageEl.addEventListener("mouseenter", () => {
    if (productImages.length > 1) {
      imageEl.src = productImages[1];
    }
  });

  imageEl.addEventListener("mouseleave", () => {
    imageEl.src = productImages[currentImageIndex];
  });
}