// ===============================
// 🖼 PRODUCT GALLERY COMPONENT
// ===============================

export function initProductGallery(product, elements) {
  const { imageEl, thumbnailsContainer } = elements;

  let currentImageIndex = 0;

  // ==========================
  // RESOLVE VARIANT
  // ==========================
  const resolvedProduct = {
    ...product,
    selectedVariant:
      product.selectedVariant || product.variants?.[0]
  };

  const productImages = buildImageArray(resolvedProduct);

  // ==========================
  // INIT
  // ==========================
  if (!productImages.length) return;

  imageEl.src = productImages[0];
  imageEl.style.opacity = "1";
  imageEl.style.transform = "scale(1.02) translate(0, 0)";

  renderThumbnails(productImages);
  initAdvancedMovement();

  // ==========================
  // BUILD IMAGE ARRAY
  // ==========================
  function buildImageArray(product) {
    const images = [];

    const order = [
      "front",
      "back",
      "model",
      "detail",
      "close"
    ];

    // VARIANT IMAGES
    if (product.selectedVariant?.images) {

      order.forEach(type => {
        if (product.selectedVariant.images[type]) {
          images.push(
            product.selectedVariant.images[type]
          );
        }
      });

      if (images.length) return images;
    }

    // FALLBACK PRODUCT IMAGES
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
  // THUMBNAILS
  // ==========================
  function renderThumbnails(images) {

    if (!thumbnailsContainer) return;

    thumbnailsContainer.innerHTML = "";

    images.forEach((img, index) => {

      const thumb = document.createElement("img");

      thumb.src = img;

      thumb.classList.add(
        "product-detail__thumbnail"
      );

      if (index === 0) {
        thumb.classList.add("active");
      }

      thumb.addEventListener("click", () => {

        if (currentImageIndex === index) return;

        imageEl.classList.add("image-fade");

        setTimeout(() => {

          imageEl.src = img;

          imageEl.style.transform =
            "scale(1.02) translate(0, 0)";

          imageEl.classList.remove("image-fade");

        }, 180);

        currentImageIndex = index;

        thumbnailsContainer
          .querySelectorAll(
            ".product-detail__thumbnail"
          )
          .forEach(thumbnail => {
            thumbnail.classList.remove("active");
          });

        thumb.classList.add("active");

      });

      thumbnailsContainer.appendChild(thumb);

    });
  }

  // ==========================
  // ADVANCED MOVEMENT
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

    // PREVENT STACKING
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

      // REDUCED STRENGTH
      targetX =
        (x / bounds.width - 0.5) * 3.5;

      targetY =
        (y / bounds.height - 0.5) * 3.5;

    });

    container.addEventListener("mouseleave", () => {

      isHovering = false;

      targetX = 0;
      targetY = 0;

    });

    // ==========================
    // SMOOTH ANIMATION LOOP
    // ==========================
    function animate() {

      currentX +=
        (targetX - currentX) * 0.06;

      currentY +=
        (targetY - currentY) * 0.06;

      const scale =
        isHovering ? 1.04 : 1.02;

      imageEl.style.transform =
        `scale(${scale}) translate(${currentX}px, ${currentY}px)`;

      requestAnimationFrame(animate);

    }

    animate();
  }
}