export function renderOrders(container, orders) {

  container.innerHTML = orders.map(order => {

    return `
      <article
        class="admin-order"
        data-id="${order.id}"
      >

        <div class="admin-order__main">

          <div class="admin-order__top">

            <span class="admin-order__id">
              ${order.id}
            </span>

            <span class="
              admin-order__status
              ${getStatusModifier(order)}
            ">
              ${formatStatus(order)}
            </span>

          </div>

          <div class="admin-order__bottom">

  <div>

    <span>
      ₱${calculateTotal(order)}
    </span>

    <div class="admin-order__payment-method">

      ${
        order.paymentMethod === "PAYMONGO"

          ? "PayMongo"

          : "Manual Payment"
      }

    </div>

  </div>

  <span>
    ${formatDate(order)}
  </span>

</div>

        <div class="
          admin-order__items
          hidden
        ">

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

      </article>
    `;

  }).join("");

}


/* ==========================
   CUSTOMER
========================== */

function renderCustomer(order) {

  return `
    <div class="admin-order__customer">

      <p class="admin-order__section-title">
        Customer
      </p>

      <p>
        ${order.firstName || ""}
        ${order.lastName || ""}
      </p>

      <p>
        ${order.phone || "—"}
      </p>

      <p>
        ${order.address || "—"}
        <br/>
        ${order.city || ""},
        ${order.province || ""}
      </p>

    </div>
  `;

}


/* ==========================
   TRACKING
========================== */
function renderTracking(order) {

  /* ==========================
     PAID → SHOW INPUT
  ========================== */

  if (
    order.orderState === "PAID"
  ) {

    return `
      <div class="admin-order__tracking">

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


  /* ==========================
     SHIPPED → SHOW SAVED TRACKING
  ========================== */

  if (
  order.orderState === "SHIPPED" ||
  order.orderState === "COMPLETED"
) {

    return `
      <div class="admin-order__tracking">

        <p class="admin-order__section-title">
          Shipment Details
        </p>

        <p class="admin-order__tracking-display">
          Tracking Number:
          <strong>
            ${order.trackingNumber || "—"}
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

  if (!date) return "—";

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

  return "—";

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

    return "—";

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
      <div class="admin-order__item">
        No items
      </div>
    `;

  }

  return items.map(item => {

    return `
      <div class="admin-order__item">

        <span>
          ${item.name}
        </span>

        <span>
          ${item.size}
        </span>

        <span>
          x${item.quantity}
        </span>

        <span>
          ₱${item.price}
        </span>

      </div>
    `;

  }).join("");

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

    <div class="admin-order__summary">

      <div class="admin-order__summary-row">

        <span>Subtotal</span>

        <span>₱${subtotal}</span>

      </div>

      <div class="admin-order__summary-row">

        <span>Shipping</span>

        <span>₱${shippingFee}</span>

      </div>

      <div class="admin-order__summary-row admin-order__summary-row--total">

        <span>Total</span>

        <span>₱${total}</span>

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
    <div class="admin-order__proof">

      <p class="admin-order__section-title">
        Payment Proof
      </p>

      <img
        src="${order.proofUrl}"
        class="admin-order__proof-image"
      />

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

    <div class="admin-order__timeline">

      <p class="admin-order__section-title">
        Timeline
      </p>

      ${logs.map(log => {

        return `

          <div class="admin-order__timeline-item">

            <div class="admin-order__timeline-action">

              ${formatLogAction(log.action)}

            </div>

            <div class="admin-order__timeline-date">

              ${formatLogDate(log.timestamp)}

            </div>

            ${log.details?.trackingNumber

              ? `

                <div class="admin-order__timeline-meta">

                  Tracking:
                  ${log.details.trackingNumber}

                </div>

              `

              : ""

            }

          </div>

        `;

      }).join("")}

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

  /* ==========================
     PROOF UPLOADED
  ========================== */

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


  /* ==========================
     PAID
  ========================== */

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


  /* ==========================
     SHIPPED
  ========================== */

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