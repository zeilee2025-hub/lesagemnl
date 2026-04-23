import { getOrderById } from "../services/orderService.js";

const container = document.getElementById("order-container");

// ==========================
// 🚀 INIT
// ==========================
async function init() {
  if (!container) {
    console.error("❌ order-container not found");
    return;
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");

    if (!orderId) {
      container.innerHTML = "<p>Invalid order.</p>";
      return;
    }

    console.log("📦 Loading order:", orderId);

    const order = await getOrderById(orderId);

    if (!order) {
      container.innerHTML = "<p>Order not found.</p>";
      return;
    }

    renderOrder(order);

  } catch (error) {
    console.error("❌ ORDER LOAD ERROR:", error);
    container.innerHTML = "<p>Failed to load order.</p>";
  }
}

// ==========================
// 🎨 RENDER ORDER (UPDATED)
// ==========================
function renderOrder(order) {
  const state = order.orderState || "PENDING_PAYMENT";

  const itemsHTML = (order.items || []).map(item => `
    <div class="order-item">
      <img src="${item.image}" class="order-item-image" />
      <div class="order-item-info">
        <p class="name">${item.name}</p>
        <p class="meta">Size: ${item.size} • Qty: ${item.quantity}</p>
        <p class="price">₱${Number(item.price).toLocaleString()}</p>
      </div>
    </div>
  `).join("");

  const subtotal = (order.items || []).reduce(
    (sum, i) => sum + (i.price * i.quantity),
    0
  );

  const shipping = order.shippingFee || 0;
  const total = order.total || (subtotal + shipping);

  const orderNumber = order.orderNumber || order.id;

  container.innerHTML = `
    <div class="order-detail">

      <!-- HEADER -->
      <div class="order-header">
        <div>
          <h2>
            Order #<span id="order-id">${orderNumber}</span>
            <button id="copy-order-btn" class="copy-order-btn">Copy</button>
          </h2>
          <p class="order-date">${formatDate(order.createdAt)}</p>
        </div>
        <span class="order-status ${getStatusClass(state)}">
          ${formatState(state)}
        </span>
      </div>

      <!-- ITEMS -->
      <div class="order-section">
        <h3>Items</h3>
        <div class="order-items">
          ${itemsHTML || `<p class="no-items">No items</p>`}
        </div>
      </div>

      <!-- SUMMARY -->
      <div class="order-section">
        <h3>Summary</h3>
        <div class="order-summary">
          <div class="row">
            <span>Subtotal</span>
            <span>₱${subtotal.toLocaleString()}</span>
          </div>
          <div class="row">
            <span>Shipping</span>
            <span>₱${shipping.toLocaleString()}</span>
          </div>
          <div class="row total">
            <span>Total</span>
            <strong>₱${total.toLocaleString()}</strong>
          </div>
          <div class="row">
            <span>Payment</span>
            <span>${order.paymentMethod || "—"}</span>
          </div>
        </div>
      </div>

      <!-- TIMELINE -->
      <div class="order-section">
        <h3>Order Progress</h3>
        <div class="timeline">
          ${renderTimeline(state)}
        </div>
      </div>

      <!-- PAYMENT PROOF -->
      ${order.proofUrl ? `
      <div class="order-section">
        <h3>Payment Proof</h3>
        <button class="proof-toggle">View Proof</button>
        <div class="order-proof hidden">
          <img src="${order.proofUrl}" alt="Payment Proof" />
        </div>
      </div>
      ` : ""}

      <!-- SHIPPING -->
      <div class="order-section">
        <h3>Shipping Information</h3>
        <div class="order-shipping">
          <p><strong>Name:</strong> ${order.firstName || ""} ${order.lastName || ""}</p>
          <p><strong>Phone:</strong> ${order.phone || "—"}</p>
          <p><strong>Address:</strong> ${order.address || "—"}</p>
          <p><strong>City:</strong> ${order.city || "—"}</p>
          <p><strong>Province:</strong> ${order.province || "—"}</p>
        </div>
      </div>

    </div>
  `;

  // ==========================
  // 📋 COPY ORDER NUMBER
  // ==========================
  initCopyOrderButton();

  // ==========================
  // 🔥 PROOF TOGGLE
  // ==========================
  const toggleBtn = container.querySelector(".proof-toggle");
  const proof = container.querySelector(".order-proof");

  if (toggleBtn && proof) {
    toggleBtn.addEventListener("click", () => {
      proof.classList.toggle("hidden");

      toggleBtn.textContent = proof.classList.contains("hidden")
        ? "View Proof"
        : "Hide Proof";
    });
  }
}

// ==========================
// 📋 COPY FUNCTION
// ==========================
function initCopyOrderButton() {
  const btn = document.getElementById("copy-order-btn");
  const orderIdEl = document.getElementById("order-id");

  if (!btn || !orderIdEl) return;

  btn.addEventListener("click", async () => {
    const text = orderIdEl.textContent?.trim();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);

      const original = btn.textContent;
      btn.textContent = "Copied ✓";
      btn.classList.add("copied");

      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove("copied");
      }, 1200);

    } catch (err) {
      console.error("Copy failed:", err);
    }
  });
}

// ==========================
// 🧭 TIMELINE
// ==========================
function renderTimeline(state) {
  const steps = [
    "PENDING_PAYMENT",
    "PAID",
    "SHIPPED",
    "COMPLETED"
  ];

  const currentIndex = steps.indexOf(state);

  return steps.map((step, index) => {
    const active = index <= currentIndex ? "active" : "";

    return `
      <div class="timeline-step ${active}">
        <div class="dot"></div>
        <p>${formatState(step)}</p>
      </div>
    `;
  }).join("");
}

// ==========================
// 🎨 HELPERS
// ==========================
function getStatusClass(state) {
  switch (state) {
    case "PAID": return "paid";
    case "SHIPPED": return "shipped";
    case "COMPLETED": return "completed";
    default: return "pending";
  }
}

function formatState(state) {
  return state
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

function formatDate(date) {
  if (!date) return "—";

  if (typeof date === "string") {
    return new Date(date).toLocaleString();
  }

  if (date?.toMillis) {
    return new Date(date.toMillis()).toLocaleString();
  }

  return "—";
}

// ==========================
// 🚀 START
// ==========================
init();