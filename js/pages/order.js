import { getOrderById } from "../services/orderService.js";

// ==========================
// 🚀 INIT
// ==========================
async function init() {
  try {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId") || params.get("id");

    if (!orderId) {
      showError("Invalid order.");
      return;
    }

    const order = await getOrderById(orderId);

    if (!order) {
      showError("Order not found.");
      return;
    }

    renderOrder(order);

  } catch (error) {
    console.error(error);
    showError("Failed to load order.");
  }
}

// ==========================
// 🎨 RENDER ORDER
// ==========================
function renderOrder(order) {
  const items = order.items || [];

  // ==========================
  // HEADER
  // ==========================
  document.getElementById("order-id").textContent =
    `Order #${order.orderNumber || order.id || "—"}`;

  document.getElementById("order-date").textContent =
    formatDate(order.createdAt);

  const statusEl = document.getElementById("order-status");
  applyStatus(statusEl, order.orderState);

  // ==========================
  // ITEMS
  // ==========================
  const itemsContainer = document.getElementById("order-items");

  if (!items.length) {
    itemsContainer.innerHTML = `<div class="empty-state">No items</div>`;
  } else {
    itemsContainer.innerHTML = items.map(item => `
      <div class="item">
        <div class="item-image">
          <img src="${item.image}" />
        </div>
        <div>
          <div class="item-name">${item.name}</div>
          <div class="item-meta">
            Size: ${item.size || "-"} • Qty: ${item.quantity || 1}
          </div>
          <div class="item-price">₱${Number(item.price).toLocaleString()}</div>
        </div>
      </div>
    `).join("");
  }

  // ==========================
  // SUMMARY
  // ==========================
  const subtotal = items.reduce(
    (sum, i) => sum + (i.price * i.quantity), 0
  );

  const shipping = order.shippingFee || 0;
  const total = order.total || subtotal + shipping;

  document.getElementById("summary-subtotal").textContent =
    `₱${subtotal.toLocaleString()}`;

  document.getElementById("summary-shipping").textContent =
    `₱${shipping.toLocaleString()}`;

  document.getElementById("summary-total").textContent =
    `₱${total.toLocaleString()}`;

  document.getElementById("summary-payment").textContent =
    order.paymentMethod || "—";

  // ==========================
  // SHIPPING
  // ==========================
  const shippingContainer = document.getElementById("shipping-info");

  shippingContainer.innerHTML = `
    <div class="info-row">
      <span class="label">Name:</span>
      ${order.firstName || ""} ${order.lastName || ""}
    </div>
    <div class="info-row">
      <span class="label">Phone:</span>
      ${order.phone || "—"}
    </div>
    <div class="info-row">
      <span class="label">Address:</span>
      ${order.address || "—"}
    </div>
  `;

  // ==========================
// TIMELINE
// ==========================
const timelineEl = document.getElementById("order-timeline-list");

const timelineSteps = [
  { key: "PENDING_PAYMENT", label: "Order Placed", date: order.createdAt },
  { key: "PAID", label: "Payment Confirmed" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "COMPLETED", label: "Delivered" }
];

const currentIndex = timelineSteps.findIndex(s => s.key === order.orderState);

timelineEl.innerHTML = timelineSteps.map((step, i) => `
  <div class="timeline-item ${i <= currentIndex ? "active" : ""}">
    <div class="timeline-dot"></div>
    <div class="timeline-content">
      <div class="timeline-title">${step.label}</div>
      ${
        step.date
          ? `<div class="timeline-date">${formatDate(step.date)}</div>`
          : ""
      }
    </div>
  </div>
`).join("");

  // ==========================
  // TRACKING
  // ==========================
  const trackingSection = document.getElementById("tracking-section");

  if (order.orderState === "SHIPPED" && order.trackingNumber) {
    trackingSection.classList.remove("hidden");

    document.getElementById("tracking-number").textContent =
      order.trackingNumber;

    document.getElementById("tracking-link").href =
      `https://www.jtexpress.ph/index/query/gzquery.html?billcodes=${order.trackingNumber}`;
  } else {
    trackingSection.classList.add("hidden");
  }

  // ==========================
  // PROOF
  // ==========================
  if (order.proofUrl) {
    const btn = document.getElementById("proof-toggle");
    const box = document.getElementById("proof-container");

    btn.classList.remove("hidden");

    box.innerHTML = `
      <img src="${order.proofUrl}" />
    `;

    box.classList.add("hidden");

    btn.onclick = () => {
      box.classList.toggle("hidden");

      btn.textContent = box.classList.contains("hidden")
        ? "View Proof"
        : "Hide Proof";
    };
  }

  // ==========================
  // COPY
  // ==========================
  const copyBtn = document.getElementById("copy-order-id");

  copyBtn.onclick = async () => {
    await navigator.clipboard.writeText(order.orderNumber || order.id);
    copyBtn.textContent = "Copied ✓";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
  };
}

// ==========================
// ✅ STATUS SYSTEM (NEW)
// ==========================
function applyStatus(el, stateRaw) {
  const state = stateRaw || "PENDING_PAYMENT";

  // text
  el.textContent = formatState(state);

  // reset classes safely
  el.className = "";

  const map = {
    PENDING_PAYMENT: "status-pending",
    PAID: "status-paid",
    SHIPPED: "status-shipped",
    COMPLETED: "status-completed",
    CANCELLED: "status-cancelled"
  };

  el.classList.add(map[state] || "status-pending");
}

// ==========================
// ERROR HANDLER
// ==========================
function showError(message) {
  document.body.innerHTML = `<p style="padding:40px;">${message}</p>`;
}

// ==========================
// HELPERS
// ==========================
function formatState(state) {
  return state
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString();
}

// ==========================
init();