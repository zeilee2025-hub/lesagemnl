// ==========================
// 📦 IMPORTS
// ==========================
import { uploadProof } from "../services/uploadService.js";
import { updateOrderProof } from "../services/orderService.js";
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
    return "Waiting for payment";
  }

  if (status === "pending" && proofUrl && paymentStatus === "PENDING") {
    return "Under review";
  }

  if (status === "processing" && paymentStatus === "PAID") {
    return "Payment verified";
  }

  if (status === "shipped") {
    return "Shipped";
  }

  if (status === "completed") {
    return "Completed";
  }

  if (status === "rejected") {
    return "Payment rejected";
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

  // ✅ CLEAR SUCCESS INFO FIRST (VERY IMPORTANT)
  const successBox = document.getElementById("confirmation-success-info");
  if (successBox) successBox.innerHTML = "";

  const { status, paymentStatus, proofUrl } = order;

  // ==========================
// 📦 COMPLETED
// ==========================
if (status === "completed") {
  title.textContent = "Order Delivered";
  subtitle.textContent = "We hope you enjoy your piece";

  stopTimer();

  const statusInline = document.getElementById("order-status-inline");
  if (statusInline) statusInline.textContent = "";

  const successBox = document.getElementById("confirmation-success-info");
  if (successBox) {
    successBox.innerHTML = `
      <div class="confirmation__success-item">More drops coming soon!</div>
      <div class="confirmation__success-item">If there’s any issue, feel free to contact us.</div>
    `;
  }

  return;
}

  // ==========================
  // 🚚 SHIPPED
  // ==========================
  if (status === "shipped") {
  title.textContent = "Your order has been shipped";
  subtitle.textContent = "Track your shipment for updates";

  stopTimer();

  const statusInline = document.getElementById("order-status-inline");
  if (statusInline) statusInline.textContent = "";

  const successBox = document.getElementById("confirmation-success-info");
  if (successBox) {
    successBox.innerHTML = `
      <div class="confirmation__success-item">Metro Manila: 3–5 business days</div>
      <div class="confirmation__success-item">Provincial: 7–10 business days</div>
      <div class="confirmation__success-item">Delivery times may vary depending on location and courier operations.</div>
    `;
  }

  return;
}

  // ==========================
  // 🟢 PAID
  // ==========================
  if (paymentStatus === "PAID") {
    title.textContent = "Payment confirmed!";
    subtitle.textContent = "Your order is now being prepared";

    stopTimer();

    const statusInline = document.getElementById("order-status-inline");
    if (statusInline) {
      statusInline.textContent = "";
    }

    // ✅ SUCCESS INFO (THIS WAS MISSING)
    if (successBox) {
      successBox.innerHTML = `
        <div class="confirmation__success-item">We’ve received your payment</div>
        <div class="confirmation__success-item">We’ll keep you updated via email</div>
        <div class="confirmation__success-item">Orders typically ship within 24–48 hours</div>
      `;
    }

    return;
  }

  // ==========================
  // 🟡 UNDER REVIEW
  // ==========================
  if (status === "pending" && proofUrl) {
    title.textContent = "Order Received";
    subtitle.textContent = "Your payment is under review";

    stopTimer();

    return;
  }

  // ==========================
  // 🟡 DEFAULT (WAITING)
  // ==========================
  title.textContent = "Order Received";
  subtitle.textContent = "Complete your payment to confirm your order";
}

// ==========================
// ⏹ STOP TIMER
// ==========================
function stopTimer() {
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
  const statusInline = document.getElementById("order-status-inline");
  if (!statusInline) return;

  function update() {
    const now = Date.now();
    const diff = expiryTimestamp - now;

    if (diff <= 0) {
      statusInline.textContent = "Expired";
      statusInline.setAttribute("data-status", "expired");

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

    statusInline.textContent = `Waiting for payment · ${timeText} left`;
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

    // 🧾 ORDER ID
    const orderIdEl = document.getElementById("order-id");
    if (orderIdEl && order) {
      orderIdEl.textContent = order.orderNumber || order.id;
    }

    // 🏷 STATUS
    const statusInline = document.getElementById("order-status-inline");
    const label = getStatusLabel(order);

    if (statusInline) {
      statusInline.setAttribute("data-status", label);
    }

    //  UI
    handleUploadState(order);
    renderOrderSummary(order);
    updateHeaderUI(order);
    togglePaymentUI(order);
    renderActions(order);

    // ⏱ TIMER CONDITION (FIXED)
    if (
      order.createdAt &&
      order.paymentStatus !== "PAID" &&
      order.status === "pending" &&
      !order.proofUrl
    ) {
      if (!countdownStarted) {
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
    } else {
      stopTimer();
      countdownStarted = false;
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

  // 🔴 REJECTED → allow re-upload
  if (status === "rejected") {
    submitBtn.disabled = false;
    uploadBtn.disabled = false;
    submitBtn.textContent = "Upload New Proof";

    const fileInput = document.getElementById("proof-input");
    const fileName = document.getElementById("file-name");

    if (fileInput) fileInput.value = "";
    if (fileName) fileName.textContent = "No file selected";

    window.__selectedFile = null;

    return;
  }

  // 🟡 uploaded → waiting admin
  if (status === "pending" && proofUrl && paymentStatus === "PENDING") {
    submitBtn.disabled = true;
    uploadBtn.disabled = true;
    submitBtn.textContent = "Under review";
    stopTimer();
    return;
  }

  // 🟢 PAID
  if (paymentStatus === "PAID") {
    submitBtn.disabled = true;
    uploadBtn.disabled = true;
    submitBtn.textContent = "Payment verified";
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
// 🎯 CTA BUTTONS (NEW)
// ==========================
function renderActions(order) {
  const container = document.getElementById("confirmation-actions");
  if (!container) return;

  container.innerHTML = "";

  const viewBtn = document.createElement("a");
  viewBtn.href = `order.html?id=${order.id}`;
  viewBtn.textContent = "View Order";
  viewBtn.className = "btn-primary";

  const shopBtn = document.createElement("a");
  shopBtn.href = "/";
  shopBtn.textContent = "Continue shopping";
  shopBtn.className = "btn-secondary";

  // show View Order ONLY after payment or beyond
  if (
    order.paymentStatus === "PAID" ||
    order.status === "shipped" ||
    order.status === "completed"
  ) {
    container.appendChild(viewBtn);
  }

  container.appendChild(shopBtn);
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

  window.__selectedFile = null;

  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener("click", () => fileInput.click());
  }

  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      window.__selectedFile = e.target.files[0];

      if (window.__selectedFile) {
        fileName.textContent = window.__selectedFile.name;
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener("click", async () => {
      try {
        if (!window.__selectedFile) {
          alert("Please select a new file");
          return;
        }

        if (!orderId) {
          alert("Missing order ID");
          return;
        }

        submitBtn.textContent = "Uploading...";
        submitBtn.disabled = true;

        const url = await uploadProof(window.__selectedFile, orderId);

        await updateOrderProof(orderId, url);

        submitBtn.textContent = "Under review";
        fileName.textContent = "Payment proof uploaded";
        submitBtn.disabled = true;

      } catch (error) {
        console.error(error);

        submitBtn.textContent = "Confirm payment";
        submitBtn.disabled = false;
      }
    });
  }

});