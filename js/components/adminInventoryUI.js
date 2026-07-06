import {
  escapeAttribute,
  escapeHtml,
  getPrimaryImage,
  getProductName,
  getSizeLabel
} from "./adminProductsUI.js";

const lowStockThreshold = 3;

export function deriveInventoryRows(products = []) {

  return products.flatMap(product => {

    const variantSource =
      getInventoryVariantSource(product);

    const variants =
      variantSource.variants;

    if (!variants.length) {
      const sizes =
        Array.isArray(product?.sizes)
          ? product.sizes
          : [];

      if (sizes.length) {
        return sizes.map((size, sizeIndex) => {
          return createInventoryRow(
            product,
            {
              name: "Default",
              value: "#000",
              sizes
            },
            size,
            {
              field: null,
              variantIndex: -1,
              sizeIndex
            }
          );
        });
      }

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

function getInventoryVariantSource(product) {

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
  rows,
  options = {}
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

  container.innerHTML = `
    ${
      options.message &&
      !options.selectedRowId
        ? `
          <p class="admin-inventory__message">
            ${escapeHtml(options.message)}
          </p>
        `
        : ""
    }

    ${rows.map(row => {
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

        <div class="admin-inventory-row__actions">
          ${
            row.canAdjust
              ? `
                <button
                  type="button"
                  class="admin-inventory-row__view"
                  data-inventory-action="adjust-stock"
                >
                  Adjust
                </button>
              `
              : `
                <span class="admin-inventory-row__locked">
                  Read Only
                </span>
              `
          }

          <button
            type="button"
            class="admin-inventory-row__view"
            data-inventory-action="view-product"
          >
            View Product
          </button>
        </div>

        ${
          options.selectedRowId === row.id
            ? renderAdjustmentPanel(
              row,
              options
            )
            : ""
        }
      </article>
    `;
  }).join("")}
  `;

}

export function renderInventoryHistory(
  container,
  adjustments = [],
  options = {}
) {

  if (!container) return;

  if (options.loading) {
    container.innerHTML = `
      <p class="admin-inventory__empty">
        Loading adjustment history...
      </p>
    `;

    return;
  }

  if (!adjustments.length) {
    container.innerHTML = `
      <p class="admin-inventory__empty">
        No stock adjustments yet.
      </p>
    `;

    return;
  }

  container.innerHTML = adjustments.map(adjustment => {
    return `
      <article class="admin-inventory-history">
        <div>
          <span class="admin-inventory-row__eyebrow">
            ${escapeHtml(formatAdjustmentDate(adjustment.createdAt))}
          </span>

          <strong>
            ${escapeHtml(adjustment.productName || adjustment.productId)}
          </strong>

          <span>
            ${escapeHtml(adjustment.branchName)}
            /
            ${escapeHtml(adjustment.size)}
          </span>
        </div>

        <div class="admin-inventory-history__delta">
          <strong>
            ${formatSignedNumber(adjustment.delta)}
          </strong>

          <span>
            ${Number(adjustment.stockBefore).toLocaleString()}
            ->
            ${Number(adjustment.stockAfter).toLocaleString()}
          </span>
        </div>

        <div>
          <span class="admin-inventory-row__eyebrow">
            Reason
          </span>

          <strong>
            ${escapeHtml(adjustment.reason)}
          </strong>

          <span>
            ${escapeHtml(adjustment.adminEmail || adjustment.adminUid || "Admin")}
          </span>
        </div>
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
    stockLabel: getStockLabel(stockStatus),
    canAdjust:
      canAdjustInventoryRow(
        product,
        variantName,
        sizeLabel,
        stockResult,
        source
      )
  };

}

function canAdjustInventoryRow(
  product,
  variantName,
  sizeLabel,
  stockResult,
  source
) {

  return Boolean(
    product?.id &&
    variantName &&
    sizeLabel &&
    sizeLabel !== "No sizes" &&
    !stockResult.malformedStock &&
    (
      source?.field === "colors" ||
      source?.field === "variants"
    )
  );

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

function renderAdjustmentPanel(
  row,
  options
) {

  const draft =
    options.adjustmentDraft || {};

  const deltaValue =
    String(draft.delta || "");

  const delta =
    Number(deltaValue);

  const validDelta =
    Number.isInteger(delta) &&
    delta !== 0;

  const predicted =
    validDelta
      ? row.stock + delta
      : row.stock;

  const invalidResult =
    validDelta &&
    predicted < 0;

  const disabled =
    options.submitting ||
    !validDelta ||
    invalidResult ||
    !draft.reason ||
    (
      draft.reason === "OTHER" &&
      !String(draft.note || "").trim()
    );

  return `
    <form class="admin-inventory-adjustment">
      ${
        options.message
          ? `
            <p class="admin-inventory-adjustment__message">
              ${escapeHtml(options.message)}
            </p>
          `
          : ""
      }

      <div class="admin-inventory-adjustment__context">
        <span>
          Current Stock:
          <strong>${row.stock.toLocaleString()}</strong>
        </span>

        <span>
          Result:
          <strong>
            <span data-inventory-adjustment-result>
            ${
              invalidResult
                ? "Invalid"
                : predicted.toLocaleString()
            }
            </span>
          </strong>
        </span>
      </div>

      <label>
        <span>Adjustment</span>
        <input
          type="number"
          name="delta"
          step="1"
          value="${escapeAttribute(deltaValue)}"
          placeholder="+5 or -2"
          data-inventory-adjustment-field="delta"
        />
      </label>

      <label>
        <span>Reason</span>
        <select
          name="reason"
          data-inventory-adjustment-field="reason"
        >
          <option value="">Select reason</option>
          ${renderReasonOption("RESTOCK", draft.reason)}
          ${renderReasonOption("CORRECTION", draft.reason)}
          ${renderReasonOption("DAMAGED", draft.reason)}
          ${renderReasonOption("RETURN", draft.reason)}
          ${renderReasonOption("OTHER", draft.reason)}
        </select>
      </label>

      <label>
        <span>Note</span>
        <textarea
          name="note"
          maxlength="300"
          rows="3"
          data-inventory-adjustment-field="note"
        >${escapeHtml(draft.note || "")}</textarea>
      </label>

      <div class="admin-inventory-adjustment__actions">
        <button
          type="submit"
          data-inventory-adjustment-submit
          ${disabled ? "disabled" : ""}
        >
          Save Adjustment
        </button>

        <button
          type="button"
          data-inventory-action="cancel-adjustment"
        >
          Cancel
        </button>
      </div>
    </form>
  `;

}

function renderReasonOption(
  reason,
  selectedReason
) {

  return `
    <option
      value="${reason}"
      ${selectedReason === reason ? "selected" : ""}
    >
      ${reason}
    </option>
  `;

}

function formatSignedNumber(value) {

  const number =
    Number(value) || 0;

  return number > 0
    ? `+${number.toLocaleString()}`
    : number.toLocaleString();

}

function formatAdjustmentDate(value) {

  if (!value) return "Pending";

  const date =
    new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Pending";
  }

  return date.toLocaleString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }
  );

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
