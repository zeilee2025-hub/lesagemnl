import {
  escapeAttribute,
  escapeHtml
} from "./adminProductsUI.js";

import { derivePaymentLabel }
from "../core/orderUI.js";

export function filterCustomers(
  customers = [],
  typeFilter = "ALL",
  searchValue = ""
) {

  const query =
    String(searchValue || "")
      .trim()
      .toLowerCase();

  return customers.filter(customer => {
    if (
      typeFilter !== "ALL" &&
      customer.type !== typeFilter
    ) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [
      customer.name,
      customer.email,
      customer.phone
    ].some(value => {
      return String(value || "")
        .toLowerCase()
        .includes(query);
    });
  });

}

export function renderCustomers(
  container,
  customers = [],
  options = {}
) {

  if (!container) return;

  if (options.loading) {
    container.innerHTML = `
      <p class="admin-customers__empty">
        Loading customers...
      </p>
    `;
    return;
  }

  if (options.error) {
    container.innerHTML = `
      <div class="admin-customers__notice">
        <p>${escapeHtml(options.error)}</p>
        <button type="button" data-customer-action="retry">
          Retry
        </button>
      </div>
    `;
    return;
  }

  if (!customers.length) {
    container.innerHTML = `
      <p class="admin-customers__empty">
        ${options.emptyMessage || "No customers yet."}
      </p>
    `;
    return;
  }

  container.innerHTML = `
    ${renderBoundNotice(options)}

    <div class="admin-customers-list">
      ${customers.map(customer => {
        return `
          <article
            class="admin-customer-row"
            data-customer-key="${escapeAttribute(customer.customerKey)}"
          >
            <div class="admin-customer-row__identity">
              <strong>
                ${escapeHtml(formatCustomerName(customer))}
              </strong>
              <span>
                ${escapeHtml(formatFallback(customer.email))}
              </span>
            </div>

            <span class="admin-customer-row__type">
              ${formatCustomerType(customer)}
            </span>

            <span>
              ${formatNumber(customer.orderCount)}
            </span>

            <span>
              ${formatNumber(customer.paidOrderCount)}
            </span>

            <span>
              ${formatCurrency(customer.totalSpent)}
            </span>

            <span>
              ${formatDate(customer.lastOrderAt)}
            </span>

            <button
              type="button"
              class="admin-customer-row__view"
              data-customer-action="view"
            >
              View Customer
            </button>
          </article>
        `;
      }).join("")}
    </div>
  `;

}

function renderBoundNotice(options = {}) {

  if (!options.truncated) {
    return "";
  }

  return `
    <p class="admin-customers__bound-notice">
      Customer totals are based on the current bounded admin scan.
    </p>
  `;

}

export function renderCustomerMetrics(
  container,
  customers = []
) {

  if (!container) return;

  const registered =
    customers.filter(customer => {
      return customer.type === "registered";
    }).length;

  const guests =
    customers.filter(customer => {
      return customer.type === "guest";
    }).length;

  const revenue =
    customers.reduce((sum, customer) => {
      return sum + (
        Number(customer.totalSpent) || 0
      );
    }, 0);

  container.innerHTML = `
    <div>
      <span>Customers</span>
      <strong>${formatNumber(customers.length)}</strong>
    </div>
    <div>
      <span>Registered</span>
      <strong>${formatNumber(registered)}</strong>
    </div>
    <div>
      <span>Guests</span>
      <strong>${formatNumber(guests)}</strong>
    </div>
    <div>
      <span>Customer Revenue</span>
      <strong>${formatCurrency(revenue)}</strong>
    </div>
  `;

}

export function renderCustomerDetail(
  container,
  detail,
  options = {}
) {

  if (!container) return;

  if (options.loading) {
    container.innerHTML = `
      <p class="admin-customers__empty">
        Loading customer...
      </p>
    `;
    return;
  }

  if (options.error) {
    container.innerHTML = `
      <div class="admin-customers__notice">
        <button
          type="button"
          data-customer-action="back"
        >
          Back to Customers
        </button>
        <p>${escapeHtml(options.error)}</p>
      </div>
    `;
    return;
  }

  const customer =
    detail?.customer;

  if (!customer) {
    container.innerHTML = "";
    return;
  }

  const orders =
    detail.orders || [];

  container.innerHTML = `
    <article class="admin-customer-detail">
      <button
        type="button"
        class="admin-customer-detail__back"
        data-customer-action="back"
      >
        Back to Customers
      </button>

      <header class="admin-customer-detail__header">
        <div>
          <span class="admin-customer-row__type">
            ${formatCustomerType(customer)}
          </span>
          <h2>
            ${escapeHtml(formatCustomerName(customer))}
          </h2>
        </div>
      </header>

      <div class="admin-customer-detail__meta">
        ${renderMeta("Email", customer.email)}
        ${renderMeta("Phone", customer.phone)}
        ${renderMeta("First Order", formatDate(customer.firstOrderAt))}
        ${renderMeta("Last Order", formatDate(customer.lastOrderAt))}
        ${renderMeta("Orders", formatNumber(customer.orderCount))}
        ${renderMeta("Paid Orders", formatNumber(customer.paidOrderCount))}
        ${renderMeta("Total Spent", formatCurrency(customer.totalSpent))}
      </div>

      <section class="admin-customer-orders">
        <p class="admin-customer-orders__title">
          Order History
        </p>

        ${renderBoundNotice(options)}

        ${
          orders.length
            ? orders.map(renderCustomerOrder).join("")
            : `
              <p class="admin-customers__empty">
                No orders for this customer.
              </p>
            `
        }
      </section>
    </article>
  `;

}

function renderCustomerOrder(order) {

  return `
    <article
      class="admin-customer-order"
      data-customer-order-id="${escapeAttribute(order.id)}"
    >
      <div>
        <strong>${escapeHtml(order.id)}</strong>
        <span>${formatDate(order.createdAt)}</span>
      </div>
      <span>${escapeHtml(formatOrderState(order.orderState))}</span>
      <span>${escapeHtml(formatPaymentMethod(order))}</span>
      <span>${formatCurrency(order.total)}</span>
      <button
        type="button"
        data-customer-action="open-order"
      >
        View Order
      </button>
    </article>
  `;

}

function renderMeta(label, value) {

  return `
    <div>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(formatFallback(value))}</strong>
    </div>
  `;

}

function formatCustomerName(customer) {
  return customer?.name ||
    customer?.email ||
    "Customer";
}

function formatCustomerType(customer) {
  return customer?.type === "registered"
    ? "REGISTERED"
    : "GUEST";
}

function formatFallback(value) {
  const text =
    String(value || "").trim();

  return text || "\u2014";
}

function formatNumber(value) {
  return (Number(value) || 0)
    .toLocaleString();
}

function formatCurrency(value) {
  return `\u20b1${(Number(value) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatDate(value) {
  if (!value) return "\u2014";

  const date =
    new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "\u2014";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatOrderState(state) {
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

  return labels[state] || "Unknown";
}

function formatPaymentMethod(order) {
  const label =
    derivePaymentLabel(order);

  if (
    !label ||
    label === "—" ||
    label === "LOCAL" ||
    label === "MANUAL_PAYMENT" ||
    label === "UNKNOWN"
  ) {
    return "Manual Payment";
  }

  return label;
}
