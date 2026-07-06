export function renderProductList(
  container,
  products
) {

  if (!container) return;

  if (!products.length) {
    container.innerHTML = `
      <p class="admin-products__empty">
        No products found.
      </p>
    `;

    return;
  }

  container.innerHTML = products.map(product => {

    const status =
      getProductStatus(product);

    return `
      <article
        class="admin-product"
        data-product-id="${escapeAttribute(product.id)}"
      >
        <div class="admin-product__media">
          ${renderProductImage(product)}
        </div>

        <div class="admin-product__main">
          <span class="admin-product__eyebrow">
            Product
          </span>

          <h2 class="admin-product__title">
            ${escapeHtml(getProductName(product))}
          </h2>

          ${
            status
              ? `
                <span class="admin-product__status">
                  ${escapeHtml(status)}
                </span>
              `
              : ""
          }
        </div>

        <div class="admin-product__meta">
          <span class="admin-product__price">
            ${formatCurrency(product.price)}
          </span>

          <span class="admin-product__stock">
            ${formatStockSummary(product)}
          </span>
        </div>

        <button
          type="button"
          class="admin-product__view"
          data-product-action="view"
        >
          View
        </button>
      </article>
    `;

  }).join("");

}

export function renderProductDetail(
  container,
  product
) {

  if (!container) return;

  if (!product) {
    container.innerHTML = `
      <div class="admin-product-detail">
        <button
          type="button"
          class="admin-product-detail__back"
          data-product-action="back"
        >
          Back to Products
        </button>

        <p class="admin-products__empty">
          Product not found.
        </p>
      </div>
    `;

    return;
  }

  const status =
    getProductStatus(product);

  container.innerHTML = `
    <article
      class="admin-product-detail"
      data-product-id="${escapeAttribute(product.id)}"
    >
      <button
        type="button"
        class="admin-product-detail__back"
        data-product-action="back"
      >
        Back to Products
      </button>

      <header class="admin-product-detail__header">
        <div>
          <span class="admin-product__eyebrow">
            Product
          </span>

          <h2 class="admin-product-detail__title">
            ${escapeHtml(getProductName(product))}
          </h2>

          <p class="admin-product-detail__id">
            ${escapeHtml(product.id)}
          </p>
        </div>

        <button
          type="button"
          class="admin-product-detail__edit"
          data-product-action="edit"
        >
          Edit
        </button>
      </header>

      <div class="admin-product-detail__meta">
        <div>
          <span class="admin-product__label">
            Price
          </span>

          <strong>
            ${formatCurrency(product.price)}
          </strong>
        </div>

        ${
          status
            ? `
              <div>
                <span class="admin-product__label">
                  Status
                </span>

                <strong>
                  ${escapeHtml(status)}
                </strong>
              </div>
            `
            : ""
        }

        <div>
          <span class="admin-product__label">
            Available Stock
          </span>

          <strong>
            ${formatStockSummary(product)}
          </strong>
        </div>
      </div>

      <div class="admin-product-detail__body">
        ${renderImageGallery(product)}
        ${renderDescription(product)}
        ${renderVariants(product)}
      </div>
    </article>
  `;

}

export function renderProductEdit(
  container,
  product,
  errorMessage = ""
) {

  if (!container) return;

  if (!product) {
    renderProductDetail(
      container,
      product
    );

    return;
  }

  container.innerHTML = `
    <article
      class="admin-product-detail"
      data-product-id="${escapeAttribute(product.id)}"
    >
      <button
        type="button"
        class="admin-product-detail__back"
        data-product-action="detail"
      >
        Back to Product
      </button>

      <header class="admin-product-detail__header">
        <div>
          <span class="admin-product__eyebrow">
            Edit Product
          </span>

          <h2 class="admin-product-detail__title">
            ${escapeHtml(getProductName(product))}
          </h2>
        </div>
      </header>

      <form class="admin-product-form">
        ${
          errorMessage
            ? `
              <p class="admin-product-form__error">
                ${escapeHtml(errorMessage)}
              </p>
            `
            : ""
        }

        <label class="admin-product-form__field">
          <span>Name</span>
          <input
            type="text"
            name="name"
            value="${escapeAttribute(getProductName(product))}"
            required
          />
        </label>

        <label class="admin-product-form__field">
          <span>Price</span>
          <input
            type="number"
            name="price"
            value="${escapeAttribute(getProductPriceValue(product))}"
            min="0"
            step="0.01"
            required
          />
        </label>

        <label class="admin-product-form__field">
          <span>Description</span>
          <textarea
            name="description"
            rows="7"
          >${escapeHtml(product.description || "")}</textarea>
        </label>

        <div class="admin-product-form__actions">
          <button
            type="submit"
            class="admin-product-form__save"
            data-product-action="save"
          >
            Save
          </button>

          <button
            type="button"
            class="admin-product-form__cancel"
            data-product-action="detail"
          >
            Cancel
          </button>
        </div>
      </form>
    </article>
  `;

}

export function getProductName(product) {

  return (
    product?.name ||
    product?.title ||
    "Untitled Product"
  );

}

export function calculateProductStock(product) {

  return getProductVariants(product).reduce(
    (sum, variant) => {
      return sum + getVariantStock(variant);
    },
    0
  );

}

export function validateProductDetailsForm(form) {

  const formData =
    new FormData(form);

  const name =
    String(formData.get("name") || "")
      .trim();

  const rawPrice =
    String(formData.get("price") ?? "")
      .trim();

  const price =
    Number(rawPrice);

  const description =
    String(formData.get("description") || "")
      .trim();

  if (!name) {
    throw new Error(
      "Product name is required."
    );
  }

  if (
    !rawPrice ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    throw new Error(
      "Price must be a valid non-negative number."
    );
  }

  return {
    name,
    price,
    description
  };

}

function renderProductImage(product) {

  const image =
    getPrimaryImage(product);

  if (!image) {
    return `
      <span class="admin-product__image-placeholder">
        No Image
      </span>
    `;
  }

  return `
    <img
      src="${escapeAttribute(image)}"
      alt="${escapeAttribute(getProductName(product))}"
      loading="lazy"
    />
  `;

}

function renderImageGallery(product) {

  const images =
    getProductImages(product);

  if (!images.length) {
    return `
      <section class="admin-product-detail__section">
        <p class="admin-product-detail__section-title">
          Images
        </p>

        <p class="admin-products__empty">
          No images available.
        </p>
      </section>
    `;
  }

  return `
    <section class="admin-product-detail__section">
      <p class="admin-product-detail__section-title">
        Images
      </p>

      <div class="admin-product-gallery">
        ${images.map(image => `
          <div class="admin-product-gallery__item">
            <img
              src="${escapeAttribute(image)}"
              alt="${escapeAttribute(getProductName(product))}"
              loading="lazy"
            />
          </div>
        `).join("")}
      </div>
    </section>
  `;

}

function renderDescription(product) {

  return `
    <section class="admin-product-detail__section">
      <p class="admin-product-detail__section-title">
        Description
      </p>

      <p class="admin-product-detail__description">
        ${
          product.description
            ? escapeHtml(product.description)
            : "No description available."
        }
      </p>
    </section>
  `;

}

function renderVariants(product) {

  const variants =
    getProductVariants(product);

  if (!variants.length) {
    return `
      <section class="admin-product-detail__section">
        <p class="admin-product-detail__section-title">
          Variants
        </p>

        <p class="admin-products__empty">
          No variants available.
        </p>
      </section>
    `;
  }

  return `
    <section class="admin-product-detail__section">
      <p class="admin-product-detail__section-title">
        Variants
      </p>

      <div class="admin-product-variants">
        ${variants.map(variant => `
          <div class="admin-product-variant">
            <div class="admin-product-variant__header">
              <span class="admin-product-variant__swatch"
                style="background:${escapeAttribute(variant.value || "#000")}"
              ></span>

              <strong>
                ${escapeHtml(variant.name || "Default")}
              </strong>

              <span>
                ${getVariantStock(variant).toLocaleString()} available
              </span>
            </div>

            ${renderSizes(variant)}
          </div>
        `).join("")}
      </div>
    </section>
  `;

}

function renderSizes(variant) {

  const sizes =
    Array.isArray(variant.sizes)
      ? variant.sizes
      : [];

  if (!sizes.length) {
    return `
      <p class="admin-products__empty">
        No sizes available.
      </p>
    `;
  }

  return `
    <div class="admin-product-sizes">
      ${sizes.map(size => `
        <div class="admin-product-size">
          <span>
            ${escapeHtml(getSizeLabel(size))}
          </span>

          <strong>
            ${getSizeStock(size).toLocaleString()} available
          </strong>
        </div>
      `).join("")}
    </div>
  `;

}

export function getProductVariants(product) {

  return getProductVariantSource(product)
    .variants;

}

export function getProductVariantSource(product) {

  if (
    Array.isArray(product?.variants) &&
    product.variants.length
  ) {
    return {
      field: "variants",
      variants: product.variants
    };
  }

  if (
    Array.isArray(product?.colors) &&
    product.colors.length
  ) {
    return {
      field: "colors",
      variants: product.colors
    };
  }

  return {
    field: null,
    variants: []
  };

}

export function getVariantStock(variant) {

  return (variant?.sizes || []).reduce(
    (sum, size) => {
      return sum + getSizeStock(size);
    },
    0
  );

}

export function getSizeStock(size) {

  if (typeof size === "string") {
    return 0;
  }

  const stock =
    Number(size?.stock);

  if (!Number.isFinite(stock)) {
    return 0;
  }

  return stock;

}

export function getSizeLabel(size) {

  if (typeof size === "string") {
    return size;
  }

  return size?.size || "OS";

}

function formatStockSummary(product) {

  const stock =
    calculateProductStock(product);

  return `${stock.toLocaleString()} available`;

}

function getProductStatus(product) {

  if (
    Object.prototype.hasOwnProperty.call(
      product,
      "status"
    )
  ) {
    return String(product.status || "Unspecified");
  }

  return null;

}

function getProductPriceValue(product) {

  const price =
    Number(product?.price);

  if (!Number.isFinite(price)) {
    return "";
  }

  return String(price);

}

function formatCurrency(value) {

  const amount =
    Number(value) || 0;

  return `\u20b1${amount.toLocaleString()}`;

}

export function getPrimaryImage(product) {

  return getProductImages(product)[0] || "";

}

function getProductImages(product) {

  const images = [];

  collectImageSet(
    images,
    product?.images
  );

  [
    "front",
    "back",
    "model",
    "detail",
    "close"
  ].forEach(key => {
    if (product?.[key]) {
      images.push(product[key]);
    }
  });

  getProductVariants(product).forEach(variant => {
    collectImageSet(
      images,
      variant.images
    );

    [
      "front",
      "back",
      "model",
      "detail",
      "close"
    ].forEach(key => {
      if (variant?.[key]) {
        images.push(variant[key]);
      }
    });
  });

  return [...new Set(
    images.filter(Boolean)
  )];

}

function collectImageSet(images, imageSet) {

  if (!imageSet) return;

  [
    "front",
    "back",
    "model",
    "detail",
    "close"
  ].forEach(key => {
    if (imageSet[key]) {
      images.push(imageSet[key]);
    }
  });

}

export function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}

export function escapeAttribute(value) {

  return escapeHtml(value);

}
