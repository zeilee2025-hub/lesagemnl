// ==========================
// 📦 IMPORTS
// ==========================
import { uploadProof } from "../services/uploadService.js";
import { updateOrderStatus } from "../services/orderService.js";
import { initPolicyModal } from "../components/modal.js";

import { db } from "../core/firebase.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ==========================
// 📦 GET ORDER ID
// ==========================
const params = new URLSearchParams(window.location.search);
const orderId = params.get("id");

console.log("Order ID:", orderId);

if (!orderId) {
  console.warn("No order ID found in URL");
}

const orderIdEl = document.getElementById("order-id");
if (orderIdEl) {
  orderIdEl.textContent = orderId || "N/A";
}

// ==========================
// 🏷 STATUS LABEL HELPER
// ==========================
function getStatusLabel(order) {
  const { status, paymentStatus, proofUrl } = order;

  if (status === "pending" && !proofUrl) {
    return "Waiting for Payment";
  }

  if (status === "pending" && proofUrl && paymentStatus === "PENDING") {
    return "Under Review";
  }

  if (status === "processing" && paymentStatus === "PAID") {
    return "Payment Verified";
  }

  if (status === "shipped") {
    return "Shipped";
  }

  if (status === "completed") {
    return "Completed";
  }

  if (status === "rejected") {
    return "Payment Rejected";
  }

  return "—";
}

// ==========================
// 🧠 HEADER UI (UNIFIED)
// ==========================
function updateHeaderUI(order) {
  const title = document.querySelector(".confirmation__title");
  const subtitle = document.getElementById("confirmation-subtitle");

  if (!title || !subtitle) return;

  const { status, paymentStatus } = order;

  // 📦 COMPLETED (HIGHEST PRIORITY)
  if (status === "completed") {
    title.textContent = "Order delivered!";
    subtitle.textContent = "Thank you for shopping with us";
    stopTimer();
    return;
  }

  // 🚚 SHIPPED
  if (status === "shipped") {
    title.textContent = "Your order is on the way!";
    subtitle.textContent = "Track your shipment for updates";
    stopTimer();
    return;
  }

  // 🟢 PAID
  if (paymentStatus === "PAID") {
    title.textContent = "Payment confirmed!";
    subtitle.textContent = "Your order is now being prepared";
    stopTimer();
    return;
  }

  // 🟡 NOT PAID
  if (paymentStatus === "PENDING") {
    title.textContent = "We’ve received your order!";
    subtitle.textContent = "Complete your payment to confirm your order";
  }
}

function stopTimer() {
  const expiry = document.getElementById("order-expiry-top");
  if (expiry) expiry.textContent = "—";

  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

// ==========================
// 💳 TOGGLE PAYMENT UI
// ==========================
function togglePaymentUI(order) {
  const paymentSection = document.querySelector(".payment-details");
  if (!paymentSection) return;

  const { status, paymentStatus } = order;

  if (paymentStatus === "PAID" && status !== "pending") {
    paymentSection.style.display = "none";
  } else {
    paymentSection.style.display = "block";
  }
}

// ==========================
// ⏱ ORDER COUNTDOWN
// ==========================
let countdownStarted = false;
let countdownInterval = null;

function startOrderCountdown(expiryTimestamp) {
  const el = document.getElementById("order-expiry");
  const elTop = document.getElementById("order-expiry-top");

  if (!el && !elTop) return;

  function update() {
    const now = Date.now();
    const diff = expiryTimestamp - now;

    if (diff <= 0) {
      const statusTop = document.getElementById("order-status-top");
      const statusDetails = document.getElementById("order-status");

      if (statusTop) {
        statusTop.textContent = "Expired";
        statusTop.setAttribute("data-status", "expired");
      }

      if (statusDetails) {
        statusDetails.textContent = "Expired";
        statusDetails.setAttribute("data-status", "expired");
      }

      if (el) el.textContent = "Expired";
      if (elTop) elTop.textContent = "Expired";

      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }

      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const timeText =
      String(hours).padStart(2, "0") + ":" +
      String(minutes).padStart(2, "0") + ":" +
      String(seconds).padStart(2, "0");

    if (el) el.textContent = timeText;
    if (elTop) elTop.textContent = timeText;
  }

  update();

  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(update, 1000);
}

// ==========================
// 📡 REAL-TIME ORDER LISTENER
// ==========================
function subscribeToOrder(orderId) {
  if (!orderId) return;

  const ref = doc(db, "orders", orderId);

  onSnapshot(ref, (snapshot) => {
    if (!snapshot.exists()) return;

    const order = {
      id: snapshot.id,
      ...snapshot.data()
    };

    // ==========================
    // 🧾 SHOW ORDER NUMBER (FIX)
    // ==========================
    const orderIdEl = document.getElementById("order-id");
    if (orderIdEl && order) {
      orderIdEl.textContent =
        order.orderNumber || order.id;
    }

    // ==========================
    // 🏷 STATUS LABEL
    // ==========================
    const statusTop = document.getElementById("order-status-top");
    const label = getStatusLabel(order);

    if (statusTop) {
      statusTop.textContent = label;
      statusTop.setAttribute("data-status", label);
    }

    // ==========================
    // 🔄 UI UPDATES
    // ==========================
    handleUploadState(order);
    renderOrderSummary(order);
    updateHeaderUI(order);
    togglePaymentUI(order);

    // ==========================
    // ⏱ COUNTDOWN LOGIC
    // ==========================
    if (
      !countdownStarted &&
      order.createdAt &&
      order.paymentStatus !== "PAID" &&
      order.status !== "completed" &&
      order.status !== "shipped"
    ) {
      let created;

      if (order.createdAt?.toMillis) {
        created = order.createdAt.toMillis();
      } else if (typeof order.createdAt === "number") {
        created = order.createdAt;
      } else if (typeof order.createdAt === "string") {
        created = new Date(order.createdAt).getTime();
      } else {
        console.warn("Invalid createdAt format", order.createdAt);
        return;
      }

      const expiryTime = created + (24 * 60 * 60 * 1000);

      startOrderCountdown(expiryTime);
      countdownStarted = true;
    }
  });
}

// ==========================
// 🔒 HANDLE UPLOAD STATE
// ==========================
function handleUploadState(order) {
  const submitBtn = document.getElementById("submit-proof");
  const uploadBtn = document.getElementById("upload-btn");

  if (!submitBtn || !uploadBtn) return;

  const { status, paymentStatus, proofUrl } = order;

  // 🟡 waiting for upload
  if (status === "pending" && !proofUrl) {
    submitBtn.disabled = false;
    uploadBtn.disabled = false;
    submitBtn.textContent = "Confirm payment";
    return;
  }

  // 🟡 uploaded → waiting admin
  if (status === "pending" && proofUrl && paymentStatus === "PENDING") {
    submitBtn.disabled = true;
    uploadBtn.disabled = true;
    submitBtn.textContent = "Under Review";
    return;
  }

  // 🟢 PAID
if (paymentStatus === "PAID") {
  submitBtn.disabled = true;
  uploadBtn.disabled = true;
  submitBtn.textContent = "Payment Verified";
  return;
}

  // 🚚 shipped
  if (status === "shipped") {
    submitBtn.disabled = true;
    uploadBtn.disabled = true;
    submitBtn.textContent = "Shipped";
    return;
  }

  // 📦 completed
  if (status === "completed") {
    submitBtn.disabled = true;
    uploadBtn.disabled = true;
    submitBtn.textContent = "Completed";
    return;
  }
}

// ==========================
// 🧾 ORDER SUMMARY
// ==========================
function renderOrderSummary(order) {
  const container = document.getElementById("order-summary");
  if (!container) return;

  const items = order.items || [];

  let html = `<p class="order-summary__title">Order Summary</p>`;

  html += items.map(item => {
    const name = item.name || "Unnamed Product";
    const size = item.size || "—";
    const quantity = item.quantity || 0;
    const price = item.price || 0;
    const image = item.image || "/images/placeholder.png";

    const itemTotal = price * quantity;

    return `
      <div class="order-summary__item">
        <div class="order-summary__img">
          <img src="${image}" alt="${name}" onerror="this.src='/images/placeholder.png'" />
        </div>

        <div class="order-summary__details">
          <div class="order-summary__name">${name}</div>
          <div class="order-summary__meta">
            ${size} × ${quantity}
          </div>
        </div>

        <div class="order-summary__price">
          ₱${itemTotal.toLocaleString()}
        </div>
      </div>
    `;
  }).join("");

  const subtotal = order.subtotal ?? items.reduce((total, item) => {
  return total + (item.price || 0) * (item.quantity || 0);
}, 0);

const shipping = order.shippingFee || 0;
const total = order.total ?? (subtotal + shipping);

  html += `
    <div class="order-summary__breakdown">
      <div><span>Subtotal</span><span>₱${subtotal.toLocaleString()}</span></div>
      <div><span>Shipping</span><span>₱${shipping.toLocaleString()}</span></div>
    </div>

    <div class="order-summary__total">
      <span>Total</span>
      <span>₱${total.toLocaleString()}</span>
    </div>
  `;

  container.innerHTML = html;
}

// ==========================
// 📋 COPY BUTTON
// ==========================
function initCopyButtons() {
  // ==========================
  // 🏦 EXISTING COPY BUTTONS
  // ==========================
  const buttons = document.querySelectorAll(".copy-btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const text = btn.getAttribute("data-copy");
      if (!text) return;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
      }

      const original = btn.textContent;
      btn.textContent = "Copied";
      btn.classList.add("copied");

      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove("copied");
      }, 1200);
    });
  });

  // ==========================
  // 🆔 ORDER ID COPY BUTTON
  // ==========================
  const orderCopyBtn = document.getElementById("copy-order-btn");
  const orderIdEl = document.getElementById("order-id");

  if (orderCopyBtn && orderIdEl) {
    orderCopyBtn.addEventListener("click", () => {
      const text = orderIdEl.textContent;
      if (!text) return;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
      }

      const original = orderCopyBtn.textContent;
      orderCopyBtn.textContent = "Copied";
      orderCopyBtn.classList.add("copied");

      setTimeout(() => {
        orderCopyBtn.textContent = original;
        orderCopyBtn.classList.remove("copied");
      }, 1200);
    });
  }
}

// ==========================
// 📁 FILE SELECT + SUBMIT
// ==========================
document.addEventListener("DOMContentLoaded", () => {

  initCopyButtons();
  initPolicyModal();
  subscribeToOrder(orderId);

  const fileInput = document.getElementById("proof-input");
  const uploadBtn = document.getElementById("upload-btn");
  const fileName = document.getElementById("file-name");
  const submitBtn = document.getElementById("submit-proof");
  const successEl = document.getElementById("upload-success");

  let selectedFile = null;

  if (successEl) {
    successEl.style.display = "none";
  }

  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener("click", () => fileInput.click());
  }

  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      selectedFile = e.target.files[0];

      if (selectedFile) {
        fileName.textContent = selectedFile.name;
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener("click", async () => {
      try {
        if (!selectedFile) return;

        if (!orderId) {
          alert("Missing order ID");
          return;
        }

        submitBtn.textContent = "Uploading...";
        submitBtn.disabled = true;

        const url = await uploadProof(selectedFile, orderId);

        await updateOrderStatus(orderId, {
  proofUrl: url,
  orderState: "PROOF_UPLOADED"
});

        submitBtn.textContent = "Under Review";
        fileName.textContent = "Payment proof uploaded";
        submitBtn.disabled = true;

        if (successEl) {
          successEl.style.display = "block";
        }

      } catch (error) {
        console.error(error);

        submitBtn.textContent = "Confirm payment";
        submitBtn.disabled = false;
      }
    });
  }

});