import { derivePaymentLabel }
from "../core/orderUI.js";

const saleOrderStates = [
  "PAID",
  "SHIPPED",
  "COMPLETED"
];

const currencyDisplayOptions = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
};

export function renderOrders(container, orders) {

  container.innerHTML = orders.map(order => {

    return `
      <article
        class="admin-order"
        data-id="${order.id}"
      >

        <div class="admin-order__main">

          <div class="admin-order__top">

            <div class="admin-order__identity">
              <span class="admin-order__eyebrow">
                Order
              </span>

              <span class="admin-order__id">
                ${order.id}
              </span>
            </div>

            <span class="
              admin-order__status
              ${getStatusModifier(order)}
            ">
              ${formatStatus(order)}
            </span>

          </div>

          <div class="admin-order__bottom">

            <div>
              <div class="admin-order__customer-preview">
                ${formatCustomerName(order)}
              </div>

              <span class="admin-order__total-preview">
                &#8369;${calculateTotal(order)}
              </span>

              <div class="admin-order__payment-method">
                ${formatPaymentMethod(order)}
              </div>
            </div>

            <span class="admin-order__date">
              ${formatDate(order)}
            </span>

          </div>

          <button
            type="button"
            class="admin-order__view"
            data-action="view"
          >
            View Order
          </button>

        </div>

      </article>
    `;

  }).join("");

}

export function renderOverview(container, orders) {

  if (!container) return;

  const metrics =
    calculateOverviewMetrics(orders);

  const netSalesElement =
    document.getElementById("overview-net-sales");

  const ordersElement =
    document.getElementById("overview-orders");

  const aovElement =
    document.getElementById("overview-aov");

  const itemsSoldElement =
    document.getElementById("overview-items-sold");

  if (netSalesElement) {
    netSalesElement.textContent =
      formatCurrency(metrics.netSales, currencyDisplayOptions);
  }

  if (ordersElement) {
    ordersElement.textContent =
      metrics.orderCount.toLocaleString();
  }

  if (aovElement) {
    aovElement.textContent =
      formatCurrency(metrics.averageOrderValue, currencyDisplayOptions);
  }

  if (itemsSoldElement) {
    itemsSoldElement.textContent =
      metrics.itemsSold.toLocaleString();
  }

  const recentOrders =
    getRecentOrders(orders);

  if (!recentOrders.length) {
    container.innerHTML = `
      <p class="admin-overview__empty">
        No recent orders yet.
      </p>
    `;

    return;
  }

  container.innerHTML = recentOrders.map(order => {

    return `
      <article
        class="admin-overview-order"
        data-overview-order-id="${order.id}"
      >
        <div class="admin-overview-order__main">
          <span class="admin-overview-order__id">
            ${order.orderNumber || order.id}
          </span>

          <span class="admin-overview-order__customer">
            ${formatCustomerName(order)}
          </span>
        </div>

        <span class="admin-overview-order__total">
          ${formatCurrency(getStoredOrderTotal(order))}
        </span>

        <span class="
          admin-order__status
          ${getStatusModifier(order)}
        ">
          ${formatStatus(order)}
        </span>

        <span class="admin-overview-order__date">
          ${formatCompactDate(order, "createdAt")}
        </span>
      </article>
    `;

  }).join("");

}

export function renderOrderDetail(container, order) {

  if (!order) {

    container.innerHTML = `
      <div class="admin-order-detail">
        <button
          type="button"
          class="admin-order-detail__back"
          data-action="back"
        >
          Back to Orders
        </button>

        <p class="admin-order__empty">
          Order not found.
        </p>
      </div>
    `;

    return;

  }

  container.innerHTML = `
    <article
      class="admin-order-detail"
      data-id="${order.id}"
    >

      <button
        type="button"
        class="admin-order-detail__back"
        data-action="back"
      >
        Back to Orders
      </button>

      <header class="admin-order-detail__header">

        <div>
          <span class="admin-order__eyebrow">
            Order
          </span>

          <h2 class="admin-order-detail__title">
            ${order.orderNumber || order.id}
          </h2>
        </div>

        <span class="
          admin-order__status
          ${getStatusModifier(order)}
        ">
          ${formatStatus(order)}
        </span>

      </header>

      <div class="admin-order-detail__meta">

        <div>
          <span class="admin-order__label">
            Total
          </span>

          <strong>
            &#8369;${calculateTotal(order)}
          </strong>
        </div>

        <div>
          <span class="admin-order__label">
            Payment
          </span>

          <strong>
            ${formatPaymentMethod(order)}
          </strong>
        </div>

        <div>
          <span class="admin-order__label">
            Date
          </span>

          <strong>
            ${formatDate(order)}
          </strong>
        </div>

      </div>

      <div class="admin-order-detail__body">

        ${renderCustomer(order)}

        ${renderPayment(order)}

        ${renderProof(order)}

        ${renderItems(order.items || [])}

        ${renderSummary(order)}

        ${renderTracking(order)}

        ${renderTimeline(order)}

        <div class="admin-order__actions">
          ${renderActions(order)}
        </div>

      </div>

    </article>
  `;

}

export function isQualifyingSaleOrder(order) {

  return saleOrderStates.includes(
    order?.orderState
  );

}

export function calculateOverviewMetrics(orders = []) {

  const qualifyingOrders =
    orders.filter(isQualifyingSaleOrder);

  const netSales =
    qualifyingOrders.reduce((sum, order) => {
      return sum + getStoredOrderTotal(order);
    }, 0);

  const orderCount =
    qualifyingOrders.length;

  const itemsSold =
    qualifyingOrders.reduce((sum, order) => {
      return sum + getOrderItemQuantityTotal(order);
    }, 0);

  const averageOrderValue =
    orderCount
      ? netSales / orderCount
      : 0;

  return {
    netSales,
    orderCount,
    averageOrderValue,
    itemsSold
  };

}


/* ==========================
   CUSTOMER
========================== */

function renderCustomer(order) {

  return `
    <div class="admin-order__section admin-order__customer">

      <p class="admin-order__section-title">
        Customer
      </p>

      <div class="admin-order__customer-grid">

        <div>
          <span class="admin-order__label">
            Name
          </span>

          <p>
            ${order.firstName || ""}
            ${order.lastName || ""}
          </p>
        </div>

        <div>
          <span class="admin-order__label">
            Phone
          </span>

          <p>
            ${order.phone || "&mdash;"}
          </p>
        </div>

        <div class="admin-order__customer-address">
          <span class="admin-order__label">
            Address
          </span>

          <p>
            ${order.address || "&mdash;"}
            <br/>
            ${order.city || ""},
            ${order.province || ""}
          </p>
        </div>

      </div>

    </div>
  `;

}


/* ==========================
   PAYMENT
========================== */

function renderPayment(order) {

  return `
    <div class="admin-order__section admin-order__payment">

      <p class="admin-order__section-title">
        Payment
      </p>

      <div class="admin-order__customer-grid">
        <div>
          <span class="admin-order__label">
            Method
          </span>

          <p>
            ${formatPaymentMethod(order)}
          </p>
        </div>

        <div>
          <span class="admin-order__label">
            Status
          </span>

          <p>
            ${order.paymentStatus || "&mdash;"}
          </p>
        </div>
      </div>

    </div>
  `;

}


/* ==========================
   TRACKING
========================== */

function renderTracking(order) {

  if (
    order.orderState === "PAID"
  ) {

    return `
      <div class="admin-order__section admin-order__tracking">

        <p class="admin-order__section-title">
          Shipping
        </p>

        <input
          type="text"
          placeholder="Enter J&T Tracking Number"
          class="admin-order__tracking-input"
          data-tracking-input
        />

        <p class="admin-order__tracking-note">
          Courier: J&T Express
        </p>

      </div>
    `;

  }

  if (
    order.orderState === "SHIPPED" ||
    order.orderState === "COMPLETED"
  ) {

    return `
      <div class="admin-order__section admin-order__tracking">

        <p class="admin-order__section-title">
          Shipment Details
        </p>

        <p class="admin-order__tracking-display">
          Tracking Number:
          <strong>
            ${order.trackingNumber || "&mdash;"}
          </strong>
        </p>

        <p class="admin-order__tracking-display">
          Courier:
          <strong>
            ${order.courier || "J&T Express"}
          </strong>
        </p>

      </div>
    `;

  }

  return "";

}


/* ==========================
   HELPERS
========================== */

function calculateTotal(order) {

  const subtotal = (order.items || []).reduce(
    (total, item) => {
      return total + (
        item.price * item.quantity
      );
    },
    0
  );

  return subtotal + (
    Number(order.shippingFee) || 0
  );

}

function getStoredOrderTotal(order) {

  const total =
    Number(order?.total);

  if (!Number.isFinite(total)) {
    return 0;
  }

  return total;

}

function getOrderItemQuantityTotal(order) {

  return (order?.items || []).reduce(
    (sum, item) => {
      return sum + getItemQuantity(item);
    },
    0
  );

}

function getItemQuantity(item) {

  const quantity =
    Number(item?.quantity ?? 1);

  if (!Number.isFinite(quantity)) {
    return 1;
  }

  return quantity;

}

function formatCurrency(value, options = {}) {

  const amount =
    Number(value) || 0;

  return `\u20b1${amount.toLocaleString(undefined, options)}`;

}

function getRecentOrders(orders = []) {

  return [...orders]
    .sort((a, b) => {
      return getCreatedTimestamp(b) -
        getCreatedTimestamp(a);
    })
    .slice(0, 5);

}

function getCreatedTimestamp(order) {

  const date =
    order?.createdAt;

  if (!date) return 0;

  if (date?.toMillis) {
    return date.toMillis();
  }

  const timestamp =
    new Date(date).getTime();

  if (!Number.isFinite(timestamp)) {
    return 0;
  }

  return timestamp;

}


function formatCustomerName(order) {

  const name = [
    order.firstName,
    order.lastName
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || "Customer";

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


function formatDate(order, field) {

  const date =
    field
      ? order?.[field]
      : order.paidAt ||
        order.createdAt;

  if (!date) return "&mdash;";

  if (date?.toMillis) {
    return new Date(
      date.toMillis()
    ).toLocaleString();
  }

  if (typeof date === "string") {
    return new Date(date)
      .toLocaleString();
  }

  if (typeof date === "number") {
    return new Date(date)
      .toLocaleString();
  }

  return "&mdash;";

}


function formatCompactDate(order, field) {

  const date =
    field
      ? order?.[field]
      : order.paidAt ||
        order.createdAt;

  if (!date) return "&mdash;";

  const parsedDate =
    date?.toMillis
      ? new Date(date.toMillis())
      : new Date(date);

  if (
    Number.isNaN(parsedDate.getTime())
  ) {
    return "&mdash;";
  }

  const dateLabel = parsedDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const timeLabel = parsedDate.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit"
  });

  return `${dateLabel} &middot; ${timeLabel}`;

}


function formatStatus(order) {

  const state =
    order.orderState;

  const statusMap = {
    PENDING_PAYMENT:
      "Waiting for Payment",

    PROOF_UPLOADED:
      "Proof Uploaded",

    PAID:
      "Paid",

    SHIPPED:
      "Shipped",

    COMPLETED:
      "Completed",

    REJECTED:
      "Rejected",

    CANCELLED:
      "Cancelled",

    EXPIRED:
      "Expired"
  };

  return (
    statusMap[state] ||
    "Unknown"
  );

}


/* ==========================
   LOG FORMATTERS
========================== */

function formatLogAction(action) {

  const map = {
    PAYMENT_APPROVED:
      "Payment Approved",

    PAYMENT_REJECTED:
      "Payment Rejected",

    PAYMENT_WEBHOOK_CONFIRMED:
      "Payment Confirmed",

    ORDER_SHIPPED:
      "Order Shipped",

    ORDER_COMPLETED:
      "Order Completed"
  };

  return map[action] || action;

}


function formatLogDate(timestamp) {

  if (!timestamp) {
    return "&mdash;";
  }

  return new Date(timestamp)
    .toLocaleString();

}


/* ==========================
   STATUS MODIFIER
========================== */

function getStatusModifier(order) {

  const state =
    order.orderState;

  const modifierMap = {
    PENDING_PAYMENT:
      "admin-order__status--pending",

    PROOF_UPLOADED:
      "admin-order__status--pending",

    PAID:
      "admin-order__status--paid",

    SHIPPED:
      "admin-order__status--shipped",

    COMPLETED:
      "admin-order__status--completed",

    CANCELLED:
      "admin-order__status--cancelled",

    REJECTED:
      "admin-order__status--rejected",

    EXPIRED:
      "admin-order__status--expired"
  };

  return (
    modifierMap[state] || ""
  );

}


/* ==========================
   ORDER ITEMS
========================== */

function renderItems(items = []) {

  if (!items.length) {

    return `
      <div class="admin-order__section admin-order__line-items">
        <p class="admin-order__section-title">
          Items
        </p>

        <div class="admin-order__empty">
          No items
        </div>
      </div>
    `;

  }

  return `
    <div class="admin-order__section admin-order__line-items">

      <p class="admin-order__section-title">
        Items
      </p>

      <div class="admin-order__item-list">

        ${items.map(item => {

          return `
            <div class="admin-order__item">

              <div class="admin-order__item-media">
                ${
                  item.image
                    ? `
                      <img
                        src="${item.image}"
                        alt="${item.name || "Product"}"
                        loading="lazy"
                      />
                    `
                    : ""
                }
              </div>

              <div class="admin-order__item-main">
                <span class="admin-order__item-name">
                  ${item.name}
                </span>

                <span class="admin-order__item-meta">
                  Color ${item.color || "&mdash;"} &middot; Size ${item.size || "&mdash;"} &middot; Qty ${item.quantity || 1}
                </span>
              </div>

              <span class="admin-order__item-price">
                &#8369;${item.price}
              </span>

            </div>
          `;

        }).join("")}

      </div>

    </div>
  `;

}


function renderSummary(order) {

  const subtotal = (order.items || []).reduce(
    (total, item) => {
      return total + (
        item.price * item.quantity
      );
    },
    0
  );

  const shippingFee =
    Number(order.shippingFee) || 0;

  const total =
    subtotal + shippingFee;

  return `
    <div class="admin-order__section admin-order__summary">

      <p class="admin-order__section-title">
        Totals
      </p>

      <div class="admin-order__summary-panel">

        <div class="admin-order__summary-row">
          <span>Subtotal</span>
          <span>&#8369;${subtotal}</span>
        </div>

        <div class="admin-order__summary-row">
          <span>Shipping</span>
          <span>&#8369;${shippingFee}</span>
        </div>

        <div class="admin-order__summary-row admin-order__summary-row--total">
          <span>Total</span>
          <span>&#8369;${total}</span>
        </div>

      </div>

    </div>
  `;

}


/* ==========================
   PAYMENT PROOF
========================== */

function renderProof(order) {

  if (!order.proofUrl) {
    return "";
  }

  return `
    <div class="admin-order__section admin-order__proof">

      <p class="admin-order__section-title">
        Payment Proof
      </p>

      <div class="admin-order__proof-frame">
        <img
          src="${order.proofUrl}"
          class="admin-order__proof-image"
        />
      </div>

    </div>
  `;

}


/* ==========================
   ORDER TIMELINE
========================== */

function renderTimeline(order) {

  const logs =
    order.logs || [];

  if (!logs.length) {
    return "";
  }

  return `
    <div class="admin-order__section admin-order__timeline">

      <p class="admin-order__section-title">
        Timeline
      </p>

      <div class="admin-order__timeline-list">

        ${logs.map(log => {

          return `
            <div class="admin-order__timeline-item">

              <div class="admin-order__timeline-dot"></div>

              <div class="admin-order__timeline-content">

                <div class="admin-order__timeline-action">
                  ${formatLogAction(log.action)}
                </div>

                <div class="admin-order__timeline-date">
                  ${formatLogDate(log.timestamp)}
                </div>

                ${log.details?.trackingNumber
                  ? `
                    <div class="admin-order__timeline-meta">
                      Tracking: ${log.details.trackingNumber}
                    </div>
                  `
                  : ""
                }

              </div>

            </div>
          `;

        }).join("")}

      </div>

    </div>
  `;

}


/* ==========================
   ACTIONS
========================== */

function renderActions(order) {

  const state =
    order.orderState;

  let buttons = "";

  if (
    state === "PROOF_UPLOADED"
  ) {

    buttons = `
      <button
        class="
          admin-order__button
          admin-order__button--approve
        "
        data-action="approve"
      >
        Approve
      </button>

      <button
        class="
          admin-order__button
          admin-order__button--reject
        "
        data-action="reject"
      >
        Reject
      </button>
    `;

  }

  else if (
    state === "PAID"
  ) {

    buttons = `
      <button
        class="
          admin-order__button
          admin-order__button--ship
        "
        data-action="ship"
      >
        Ship Order
      </button>
    `;

  }

  else if (
    state === "SHIPPED"
  ) {

    buttons = `
      <button
        class="
          admin-order__button
          admin-order__button--complete
        "
        data-action="complete"
      >
        Mark as Completed
      </button>
    `;

  }

  return buttons
    ? `
      <div class="admin-order__buttons">
        ${buttons}
      </div>
    `
    : "";

}
