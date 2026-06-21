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
              <span class="admin-order__total-preview">
                &#8369;${calculateTotal(order)}
              </span>

              <div class="admin-order__payment-method">
                ${
                  order.paymentMethod === "PAYMONGO"
                    ? "PayMongo"
                    : "Manual Payment"
                }
              </div>
            </div>

            <span class="admin-order__date">
              ${formatDate(order)}
            </span>

          </div>

          <div class="
            admin-order__items
            hidden
          ">

            <div class="admin-order__expanded-inner">

              ${renderCustomer(order)}

              ${renderProof(order)}

              ${renderItems(order.items || [])}

              ${renderSummary(order)}

              ${renderTracking(order)}

              ${renderTimeline(order)}

              <div class="admin-order__actions">
                ${renderActions(order)}
              </div>

            </div>

          </div>

        </div>

      </article>
    `;

  }).join("");

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


function formatDate(order) {

  const date =
    order.paidAt ||
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
                  Size ${item.size || "&mdash;"} &middot; Qty ${item.quantity || 1}
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
