// ===============================
// 🖼 PRODUCT GALLERY COMPONENT (ULTRA PREMIUM)
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
  imageEl.style.opacity = "1";
  imageEl.style.transform = "scale(1.02) translate(0, 0)";

  renderThumbnails(productImages);
  initAdvancedMovement(); // 🔥 ULTRA SMOOTH

  // ==========================
  // 🧠 BUILD IMAGE ARRAY
  // ==========================
  function buildImageArray(product) {
    const images = [];
    const order = ["front", "back", "model", "detail", "close"];

    if (product.selectedVariant?.images) {
      order.forEach(type => {
        if (product.selectedVariant.images[type]) {
          images.push(product.selectedVariant.images[type]);
        }
      });

      if (images.length) return images;
    }

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
        if (currentImageIndex === index) return;

        imageEl.style.opacity = "0";

        setTimeout(() => {
          imageEl.src = img;
          imageEl.style.transform = "scale(1.02) translate(0, 0)";
          imageEl.style.opacity = "1";
        }, 180);

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
  // 🎯 ULTRA-SMOOTH MOVEMENT
  // ==========================
  function initAdvancedMovement() {
    const container = imageEl.parentElement;
    if (!container) return;

    let bounds = null;

    let targetX = 0;
    let targetY = 0;

    let currentX = 0;
    let currentY = 0;

    let isHovering = false;

    // 🔥 prevent stacking
    container.onmouseenter = null;
    container.onmousemove = null;
    container.onmouseleave = null;

    container.addEventListener("mouseenter", () => {
      bounds = container.getBoundingClientRect();
      isHovering = true;
    });

    container.addEventListener("mousemove", (e) => {
      if (!bounds) return;

      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;

      // 🔥 REDUCED strength (important)
      targetX = (x / bounds.width - 0.5) * 3.5;
      targetY = (y / bounds.height - 0.5) * 3.5;
    });

    container.addEventListener("mouseleave", () => {
      isHovering = false;
      targetX = 0;
      targetY = 0;
    });

    // 🔥 SMOOTH LOOP (THIS FIXES SHAKE)
    function animate() {
      // easing
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      const scale = isHovering ? 1.04 : 1.02;

      imageEl.style.transform = `scale(${scale}) translate(${currentX}px, ${currentY}px)`;

      requestAnimationFrame(animate);
    }

    animate();
  }
}