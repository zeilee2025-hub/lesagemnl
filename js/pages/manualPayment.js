// ==========================
// IMPORTS
// ==========================

import { API_BASE_URL }
from "../services/config/api.js";

import { initPolicyModal } from "../components/policyModal.js";

import {
  initManualPaymentClipboard
} from "../components/manualPaymentClipboard.js";

import {
  renderManualPaymentSummary
} from "../components/manualPaymentSummary.js";

import {
  renderManualPaymentActions
} from "../components/manualPaymentActions.js";

import {
  initManualPaymentUpload
} from "../components/manualPaymentUpload.js";

import {
  getManualPaymentStatusLabel,
  stopManualPaymentCountdown,
  startManualPaymentCountdown
} from "../components/manualPaymentStatus.js";


// ==========================
// GET ORDER ID
// ==========================
const params =
  new URLSearchParams(
    window.location.search
  );

const orderId =

  params.get("orderId") ||

  params.get("id");


if (!orderId) {

  console.warn(
    "No order ID found in URL"
  );

}


// ==========================
// INITIAL ORDER ID UI
// ==========================
const orderIdEl =
  document.getElementById("order-id");

if (orderIdEl) {

  orderIdEl.textContent =
    orderId || "N/A";

}


// ==========================
// HEADER UI
// ==========================
function updateHeaderUI(order) {

  const title =
    document.querySelector(
      ".manual-payment__title"
    );

  const subtitle =
    document.getElementById(
      "confirmation-subtitle"
    );

  const successBox =
    document.getElementById(
      "confirmation-success-info"
    );


  if (
    !title ||
    !subtitle
  ) return;


    // ==========================
  // RESET
  // ==========================
  if (successBox) {

    successBox.innerHTML = "";

  }


  const {
    orderState,
    proofUrl
  } = order;


  // ==========================
  // EXPIRED
  // ==========================
  if (orderState === "EXPIRED") {

    title.textContent =
      "Payment Expired";

    subtitle.textContent =
      "This order is no longer payable";

    stopManualPaymentCountdown();

    const statusInline =
      document.getElementById(
        "order-status-inline"
      );

    if (statusInline) {

      statusInline.textContent = "";

    }

    if (successBox) {

      successBox.innerHTML = `
        <div class="manual-payment__success-item">
          This payment window has expired.
        </div>

        <div class="manual-payment__success-item">
          Please place a new order if you'd still like to purchase this item.
        </div>
      `;

    }

    return;

  }


  // ==========================
  // COMPLETED
  // ==========================
  if (orderState === "COMPLETED") {

    title.textContent =
      "Order Delivered";

    subtitle.textContent =
      "We hope you enjoy your piece";

    stopManualPaymentCountdown();

    const statusInline =
      document.getElementById(
        "order-status-inline"
      );

    if (statusInline) {

      statusInline.textContent = "";

    }

    if (successBox) {

      successBox.innerHTML = `
        <div class="manual-payment__success-item">
          More drops coming soon!
        </div>

        <div class="manual-payment__success-item">
          If there’s any issue, feel free to contact us.
        </div>
      `;

    }

    return;

  }

  // ==========================
  // SHIPPED
  // ==========================
  if (orderState === "SHIPPED") {

    title.textContent =
      "Your order has been shipped";

    subtitle.textContent =
      "Track your shipment for updates";

    stopManualPaymentCountdown();

    const statusInline =
      document.getElementById(
        "order-status-inline"
      );

    if (statusInline) {

      statusInline.textContent = "";

    }

    if (successBox) {

      successBox.innerHTML = `
        <div class="manual-payment__success-item">
          Metro Manila: 3–5 business days
        </div>

        <div class="manual-payment__success-item">
          Provincial: 7–10 business days
        </div>

        <div class="manual-payment__success-item">
          Delivery times may vary depending on
          location and courier operations.
        </div>
      `;

    }

    return;

  }


  // ==========================
  // PAID
  // ==========================
  if (orderState === "PAID") {

    title.textContent =
      "Payment confirmed!";

    subtitle.textContent =
      "Your order is now being prepared";

    stopManualPaymentCountdown();

    const statusInline =
      document.getElementById(
        "order-status-inline"
      );

    if (statusInline) {

      statusInline.textContent = "";

    }

    if (successBox) {

      successBox.innerHTML = `
        <div class="manual-payment__success-item">
          We’ve received your payment
        </div>

        <div class="manual-payment__success-item">
          We’ll keep you updated via email
        </div>

        <div class="manual-payment__success-item">
          Orders typically ship within 24–48 hours
        </div>
      `;

    }

    return;

  }


  // ==========================
// UNDER REVIEW
// ==========================
if (
  orderState === "PROOF_UPLOADED"
) {

  title.textContent =
    "Order Received";

  subtitle.textContent =
    "Your payment is under review";

  stopManualPaymentCountdown();

  const statusInline =
    document.getElementById(
      "order-status-inline"
    );

  if (statusInline) {

    statusInline.textContent = "";

  }

  if (successBox) {

    successBox.innerHTML = `
      <div class="manual-payment__success-item">
        We’ve received your payment proof
      </div>

      <div class="manual-payment__success-item">
        Our team is currently verifying your payment
      </div>

      <div class="manual-payment__success-item">
        You’ll receive an email once your payment has been approved
      </div>
    `;

  }

  return;

}


  // ==========================
  // DEFAULT
  // ==========================
  title.textContent =
    "Order Received";

  subtitle.textContent =
    "Complete your payment to confirm your order";

}


// ==========================
// TOGGLE PAYMENT UI
// ==========================
function togglePaymentUI(order) {

  const paymentSection =
    document.querySelector(
      ".payment-details"
    );

  if (!paymentSection) return;


  const {
    orderState
  } = order;


  if (

  orderState === "PROOF_UPLOADED" ||
  orderState === "PAID" ||
  orderState === "SHIPPED" ||
  orderState === "COMPLETED" ||
  orderState === "EXPIRED"

) {

    paymentSection.style.display =
      "none";

  }

  else {

    paymentSection.style.display =
      "block";

  }

}


// ==========================
// HANDLE UPLOAD STATE
// ==========================
function handleUploadState(order) {

  const submitBtn =
    document.getElementById(
      "submit-proof"
    );

  const uploadBtn =
    document.getElementById(
      "upload-btn"
    );


  if (
    !submitBtn ||
    !uploadBtn
  ) return;


  const {
  orderState,
  proofUrl
} = order;


  // ==========================
  // WAITING FOR PAYMENT
  // ==========================
  if (
  orderState === "PENDING_PAYMENT"
) {

    submitBtn.disabled = false;
    uploadBtn.disabled = false;

    submitBtn.classList.remove(
      "is-disabled"
    );

    uploadBtn.classList.remove(
      "is-disabled"
    );

    submitBtn.textContent =
      "Confirm payment";

    return;

  }


  // ==========================
  // REJECTED
  // ==========================
  if (orderState === "REJECTED") {

    submitBtn.disabled = false;
    uploadBtn.disabled = false;

    submitBtn.classList.remove(
      "is-disabled"
    );

    uploadBtn.classList.remove(
      "is-disabled"
    );

    submitBtn.textContent =
      "Upload New Proof";

    const fileInput =
      document.getElementById(
        "proof-input"
      );

    const fileName =
      document.getElementById(
        "file-name"
      );

    if (fileInput) {

      fileInput.value = "";

    }

    if (fileName) {

      fileName.textContent =
        "No file selected";

    }

    return;

  }


  // ==========================
  // UNDER REVIEW
  // ==========================
  if (
  orderState === "PROOF_UPLOADED"
) {

    submitBtn.disabled = true;
    uploadBtn.disabled = true;

    submitBtn.classList.add(
      "is-disabled"
    );

    uploadBtn.classList.add(
      "is-disabled"
    );

    submitBtn.textContent =
      "Under review";

    stopManualPaymentCountdown();

    return;

  }


  // ==========================
  // PAID
  // ==========================
  if (orderState === "PAID") {

    submitBtn.disabled = true;
    uploadBtn.disabled = true;

    submitBtn.classList.add(
      "is-disabled"
    );

    uploadBtn.classList.add(
      "is-disabled"
    );

    submitBtn.textContent =
      "Payment verified";

    return;

  }


  // ==========================
  // SHIPPED
  // ==========================
  if (orderState === "SHIPPED") {

    submitBtn.disabled = true;
    uploadBtn.disabled = true;

    submitBtn.classList.add(
      "is-disabled"
    );

    uploadBtn.classList.add(
      "is-disabled"
    );

    submitBtn.textContent =
      "Shipped";

    return;

  }

  // ==========================
// EXPIRED
// ==========================
if (

  orderState === "EXPIRED"

) {

  submitBtn.disabled = true;
  uploadBtn.disabled = true;

  submitBtn.classList.add(
    "is-disabled"
  );

  uploadBtn.classList.add(
    "is-disabled"
  );

  submitBtn.textContent =
    "Payment expired";

  stopManualPaymentCountdown();

  return;

}


  // ==========================
  // COMPLETED
  // ==========================
  if (orderState === "COMPLETED") {

    submitBtn.disabled = true;
    uploadBtn.disabled = true;

    submitBtn.classList.add(
      "is-disabled"
    );

    uploadBtn.classList.add(
      "is-disabled"
    );

    submitBtn.textContent =
      "Completed";

  }

}

// ==========================
// FETCH ORDER
// ==========================
async function fetchOrder() {

  if (!orderId) return;

  try {

    const response =
      await fetch(

        `${API_BASE_URL}/order-status?orderId=${orderId}`

      );

    const order =
      await response.json();

    if (!response.ok) {

      throw new Error(
        order.error ||
        "Failed to fetch order"
      );

    }

    // ==========================
    // STORE ORDER
    // ==========================
    window.currentOrder =
      order;

    // ==========================
    // ORDER ID
    // ==========================
    const orderIdEl =
      document.getElementById(
        "order-id"
      );

    if (orderIdEl) {

      orderIdEl.textContent =
        order.orderNumber || order.id;

    }

    // ==========================
    // STATUS LABEL
    // ==========================
    const statusInline =
      document.getElementById(
        "order-status-inline"
      );

    const label =
      getManualPaymentStatusLabel(order);

    if (statusInline) {

      statusInline.setAttribute(
        "data-status",
        label
      );

    }

    // ==========================
    // UI
    // ==========================
    handleUploadState(order);

    renderManualPaymentSummary(order);

    updateHeaderUI(order);

    togglePaymentUI(order);

    renderManualPaymentActions(order);

    // ==========================
    // COUNTDOWN
    // ==========================
    if (

      order.expiresAt &&

      order.orderState ===
        "PENDING_PAYMENT"

    ) {

      const expiryTime =
        new Date(
          order.expiresAt
        ).getTime();

      startManualPaymentCountdown(
        expiryTime
      );

    }

    else {

      stopManualPaymentCountdown();

    }

  }

  catch (error) {

    console.error(
      "Order polling error:",
      error
    );

  }

}

// ==========================
// INITIALIZE PAGE
// ==========================
document.addEventListener(
  "DOMContentLoaded",
  () => {

    initManualPaymentClipboard();

    initPolicyModal();

    initManualPaymentUpload(
      orderId
    );

    // ==========================
    // INITIAL FETCH
    // ==========================
    fetchOrder();

    // ==========================
    // POLLING
    // ==========================
    setInterval(

      fetchOrder,

      5000

    );

  }
);