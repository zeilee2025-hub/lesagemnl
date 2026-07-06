import {
  escapeAttribute,
  escapeHtml,
  getPrimaryImage,
  getProductName,
  getProductVariantSource,
  getSizeLabel
} from "./adminProductsUI.js";

const lowStockThreshold = 3;

export function deriveInventoryRows(products = []) {

  return products.flatMap(product => {

    const variantSource =
      getProductVariantSource(product);

    const variants =
      variantSource.variants;

    if (!variants.length) {
      return [createInventoryRow(
        product,
        {
          name: "Default",
          value: "#000",
          sizes: []
        },
        null,
        {
          field: null,
          variantIndex: -1,
          sizeIndex: -1
        }
      )];
    }

    return variants.flatMap((variant, variantIndex) => {

      const sizes =
        Array.isArray(variant.sizes)
          ? variant.sizes
          : [];

      if (!sizes.length) {
        return [
          createInventoryRow(
            product,
            variant,
            null,
            {
              field: variantSource.field,
              variantIndex,
              sizeIndex: -1
            }
          )
        ];
      }

      return sizes.map((size, sizeIndex) => {
        return createInventoryRow(
          product,
          variant,
          size,
          {
            field: variantSource.field,
            variantIndex,
            sizeIndex
          }
        );
      });

    });

  }).sort(compareInventoryRows);

}

export function filterInventoryRows(
  rows,
  filter,
  searchValue
) {

  const query =
    String(searchValue || "")
      .trim()
      .toLowerCase();

  return rows.filter(row => {

    if (
      filter === "LOW" &&
      row.stockStatus !== "low"
    ) {
      return false;
    }

    if (
      filter === "OUT" &&
      row.stockStatus !== "out"
    ) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [
      row.productName,
      row.productId,
      row.variantName,
      row.sizeLabel
    ].some(value => {
      return String(value || "")
        .toLowerCase()
        .includes(query);
    });

  });

}

export function renderInventory(
  container,
  rows
) {

  if (!container) return;

  if (!rows.length) {
    container.innerHTML = `
      <p class="admin-inventory__empty">
        No inventory rows found.
      </p>
    `;

    return;
  }

  container.innerHTML = rows.map(row => {
    return `
      <article
        class="admin-inventory-row"
        data-product-id="${escapeAttribute(row.productId)}"
        data-inventory-row-id="${escapeAttribute(row.id)}"
      >
        <div class="admin-inventory-row__media">
          ${renderInventoryImage(row)}
        </div>

        <div class="admin-inventory-row__product">
          <span class="admin-inventory-row__eyebrow">
            Product
          </span>

          <strong>
            ${escapeHtml(row.productName)}
          </strong>

          <span>
            ${escapeHtml(row.productId)}
          </span>
        </div>

        <div class="admin-inventory-row__unit">
          <span class="admin-inventory-row__eyebrow">
            Variant / Size
          </span>

          <strong>
            ${escapeHtml(row.variantName)}
          </strong>

          <span>
            ${escapeHtml(row.sizeLabel)}
          </span>
        </div>

        <div class="admin-inventory-row__stock">
          <span class="admin-inventory-row__eyebrow">
            Available
          </span>

          <strong>
            ${row.stock.toLocaleString()}
          </strong>

          <span>
            available
          </span>
        </div>

        <span class="
          admin-inventory-row__badge
          ${getStockBadgeClass(row)}
        ">
          ${escapeHtml(row.stockLabel)}
        </span>

        <button
          type="button"
          class="admin-inventory-row__view"
          data-inventory-action="view-product"
        >
          View Product
        </button>
      </article>
    `;
  }).join("");

}

function createInventoryRow(
  product,
  variant,
  size,
  source
) {

  const variantName =
    variant?.name || "Default";

  const sizeLabel =
    size
      ? getSizeLabel(size)
      : "No sizes";

  const stockResult =
    normalizeStockValue(size);

  const stock =
    stockResult.stock;

  const stockStatus =
    getStockStatus(stock);

  return {
    id: [
      product?.id || "unknown-product",
      source?.field || "none",
      source?.variantIndex ?? -1,
      variantName,
      source?.sizeIndex ?? -1,
      sizeLabel
    ].join("::"),
    productId: product?.id || "",
    productName: getProductName(product),
    image: getPrimaryImage(product),
    variantName,
    variantValue: variant?.value || "#000",
    sizeLabel,
    stock,
    malformedStock:
      stockResult.malformedStock,
    source: {
      productId:
        product?.id || "",
      variantField:
        source?.field || null,
      variantIndex:
        source?.variantIndex ?? -1,
      variantName,
      sizeIndex:
        source?.sizeIndex ?? -1,
      sizeLabel
    },
    stockStatus,
    stockLabel: getStockLabel(stockStatus)
  };

}

function normalizeStockValue(size) {

  if (!size) {
    return {
      stock: 0,
      malformedStock: true
    };
  }

  if (typeof size === "string") {
    return {
      stock: 0,
      malformedStock: true
    };
  }

  const rawStock =
    size.stock;

  if (
    rawStock === undefined ||
    rawStock === null
  ) {
    return {
      stock: 0,
      malformedStock: true
    };
  }

  const stock =
    typeof rawStock === "string"
      ? Number(rawStock.trim())
      : Number(rawStock);

  if (!Number.isFinite(stock)) {
    return {
      stock: 0,
      malformedStock: true
    };
  }

  return {
    stock,
    malformedStock: false
  };

}

function getStockStatus(stock) {

  if (stock <= 0) {
    return "out";
  }

  if (stock <= lowStockThreshold) {
    return "low";
  }

  return "available";

}

function getStockLabel(status) {

  if (status === "out") {
    return "Out of Stock";
  }

  if (status === "low") {
    return "Low Stock";
  }

  return "Available";

}

function compareInventoryRows(a, b) {

  return [
    a.productName.localeCompare(b.productName),
    a.variantName.localeCompare(b.variantName),
    a.sizeLabel.localeCompare(b.sizeLabel)
  ].find(result => result !== 0) || 0;

}

function renderInventoryImage(row) {

  if (!row.image) {
    return `
      <span class="admin-inventory-row__image-placeholder">
        No Image
      </span>
    `;
  }

  return `
    <img
      src="${escapeAttribute(row.image)}"
      alt="${escapeAttribute(row.productName)}"
      loading="lazy"
    />
  `;

}

function getStockBadgeClass(row) {

  if (row.stockStatus === "out") {
    return "admin-inventory-row__badge--out";
  }

  if (row.stockStatus === "low") {
    return "admin-inventory-row__badge--low";
  }

  return "admin-inventory-row__badge--available";

}
