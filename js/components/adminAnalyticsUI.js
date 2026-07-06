import {
  escapeAttribute,
  escapeHtml
} from "./adminProductsUI.js";

export function renderAnalytics(
  container,
  data,
  options = {}
) {

  if (!container) return;

  if (options.loading) {
    container.innerHTML = `
      <p class="admin-analytics__empty">
        Loading analytics...
      </p>
    `;
    return;
  }

  if (options.error) {
    container.innerHTML = `
      <div class="admin-analytics__notice">
        <p>${escapeHtml(options.error)}</p>
        <button type="button" data-analytics-action="retry">
          Retry
        </button>
      </div>
    `;
    return;
  }

  if (!data) {
    container.innerHTML = `
      <p class="admin-analytics__empty">
        Analytics are not available yet.
      </p>
    `;
    return;
  }

  container.innerHTML = `
    ${renderBoundNotice(data)}
    ${renderKpis(data.kpis)}
    ${renderSalesTrend(data.salesTrend)}
    ${renderTopProducts(data.topProducts)}
    ${renderPaymentMethods(data.paymentMethods)}
    ${renderOrderStates(data.orderStates)}
    ${renderInventoryHealth(data.inventoryHealth)}
    ${renderSlowMoving(data.slowMoving, data.range)}
  `;

}

function renderBoundNotice(data) {

  if (!data?.truncated) {
    return "";
  }

  return `
    <p class="admin-analytics__bound-notice">
      Analytics are based on the current bounded admin scan.
    </p>
  `;

}

function renderKpis(kpis = {}) {

  return `
    <section class="admin-analytics-kpis">
      ${renderKpi("Net Sales", formatCurrency(kpis.netSales))}
      ${renderKpi("Orders", formatNumber(kpis.orders))}
      ${renderKpi("AOV", formatCurrency(kpis.averageOrderValue))}
      ${renderKpi("Items Sold", formatNumber(kpis.itemsSold))}
    </section>
  `;

}

function renderKpi(label, value) {

  return `
    <div>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;

}

function renderSalesTrend(trend = []) {

  const maxRevenue =
    Math.max(
      ...trend.map(bucket => Number(bucket.revenue) || 0),
      0
    );

  return `
    <section class="admin-analytics-section">
      <header>
        <h2>Sales Over Time</h2>
      </header>

      ${
        trend.length && maxRevenue > 0
          ? `
            <div class="admin-analytics-trend">
              ${trend.map(bucket => {
                const height =
                  maxRevenue
                    ? Math.max(
                      6,
                      (Number(bucket.revenue) || 0) / maxRevenue * 100
                    )
                    : 0;

                return `
                  <div class="admin-analytics-trend__bar">
                    <span
                      style="height:${height}%"
                      aria-label="${escapeAttribute(`${bucket.period}: ${formatCurrency(bucket.revenue)} from ${formatNumber(bucket.orders)} orders`)}"
                    ></span>
                    <small>${escapeHtml(bucket.period)}</small>
                    <em>${formatCurrency(bucket.revenue)}</em>
                  </div>
                `;
              }).join("")}
            </div>
          `
          : `
            <p class="admin-analytics__empty">
              No paid sales in this range.
            </p>
          `
      }
    </section>
  `;

}

function renderTopProducts(products = []) {

  return `
    <section class="admin-analytics-section">
      <header>
        <h2>Top Products</h2>
      </header>

      ${
        products.length
          ? `
            <div class="admin-analytics-list">
              ${products.map(product => `
                <article
                  class="admin-analytics-row"
                  ${product.productId
                    ? `data-analytics-product-id="${escapeAttribute(product.productId)}"`
                    : ""}
                >
                  <strong>${escapeHtml(product.productName)}</strong>
                  <span>${formatNumber(product.unitsSold)} units</span>
                  <span>${formatCurrency(product.revenue)}</span>
                  <span>${formatNumber(product.orderCount)} orders</span>
                </article>
              `).join("")}
            </div>
          `
          : `
            <p class="admin-analytics__empty">
              No product sales in this range.
            </p>
          `
      }
    </section>
  `;

}

function renderPaymentMethods(methods = []) {

  return renderMetricRows(
    "Payment Methods",
    methods,
    "No payment methods in this range.",
    item => `
      <strong>${escapeHtml(formatPaymentMethod(item.method))}</strong>
      <span>${formatNumber(item.orders)} orders</span>
      <span>${formatCurrency(item.revenue)}</span>
      <span>${formatPercent(item.share)}</span>
    `
  );

}

function renderOrderStates(states = []) {

  return renderMetricRows(
    "Order States",
    states,
    "No orders in this range.",
    item => `
      <strong>${escapeHtml(formatOrderState(item.state))}</strong>
      <span>${formatNumber(item.count)} orders</span>
      <span>${formatPercent(item.share)}</span>
    `
  );

}

function renderMetricRows(
  title,
  rows,
  emptyText,
  renderRow
) {

  return `
    <section class="admin-analytics-section">
      <header>
        <h2>${escapeHtml(title)}</h2>
      </header>

      ${
        rows.length
          ? `
            <div class="admin-analytics-list">
              ${rows.map(row => `
                <article class="admin-analytics-row">
                  ${renderRow(row)}
                </article>
              `).join("")}
            </div>
          `
          : `
            <p class="admin-analytics__empty">
              ${escapeHtml(emptyText)}
            </p>
          `
      }
    </section>
  `;

}

function renderInventoryHealth(health = {}) {

  return `
    <section class="admin-analytics-section">
      <header>
        <h2>Inventory Health</h2>
      </header>

      <div class="admin-analytics-health">
        ${renderKpi("Available Positions", formatNumber(health.availablePositions))}
        ${renderKpi("Low Stock Positions", formatNumber(health.lowStockPositions))}
        ${renderKpi("Out of Stock Positions", formatNumber(health.outOfStockPositions))}
        ${renderKpi("Malformed Rows", formatNumber(health.malformedRows))}
      </div>
    </section>
  `;

}

function renderSlowMoving(rows = [], range = "30D") {

  return `
    <section class="admin-analytics-section">
      <header>
        <h2>Slow-Moving Stock</h2>
      </header>

      ${
        rows.length
          ? `
            <div class="admin-analytics-list">
              ${rows.map(row => `
                <article class="admin-analytics-row">
                  <strong>${escapeHtml(row.productName)}</strong>
                  <span>${escapeHtml(row.branchName)} / ${escapeHtml(row.size)}</span>
                  <span>${formatNumber(row.stock)} in stock</span>
                  <span>0 units sold in ${escapeHtml(range)}</span>
                </article>
              `).join("")}
            </div>
          `
          : `
            <p class="admin-analytics__empty">
              No slow-moving stock in this range.
            </p>
          `
      }
    </section>
  `;

}

function formatCurrency(value) {
  return `\u20b1${(Number(value) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatNumber(value) {
  return (Number(value) || 0)
    .toLocaleString();
}

function formatPercent(value) {
  return `${((Number(value) || 0) * 100).toFixed(1)}%`;
}

function formatPaymentMethod(value) {
  const text =
    String(value || "UNKNOWN")
      .trim()
      .toUpperCase();

  if (
    text === "LOCAL" ||
    text === "MANUAL" ||
    text === "MANUAL_PAYMENT" ||
    text === "UNKNOWN"
  ) {
    return "Manual Payment";
  }

  if (text === "QRPH") {
    return "QRPH";
  }

  return text.replace(/_/g, " ");
}

function formatOrderState(value) {
  const labels = {
    PENDING_PAYMENT: "Waiting for Payment",
    PROOF_UPLOADED: "Proof Uploaded",
    PAID: "Paid",
    SHIPPED: "Shipped",
    COMPLETED: "Completed",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
    EXPIRED: "Expired"
  };

  return labels[value] || value || "Unknown";
}
