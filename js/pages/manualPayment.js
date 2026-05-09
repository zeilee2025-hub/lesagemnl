// ==========================
// IMPORTS
// ==========================
import { initPolicyModal } from "../components/policyModal.js";

import { db } from "../core/firebase.js";

import {
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
  new URLSearchParams(window.location.search);

const orderId =
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
    status,
    paymentStatus,
    proofUrl
  } = order;


  // ==========================
  // COMPLETED
  // ==========================
  if (status === "completed") {

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
  if (status === "shipped") {

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
  if (paymentStatus === "PAID") {

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
    status === "pending" &&
    proofUrl
  ) {

    title.textContent =
      "Order Received";

    subtitle.textContent =
      "Your payment is under review";

    stopManualPaymentCountdown();

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
    status,
    paymentStatus
  } = order;


  if (
    paymentStatus === "PAID" &&
    status !== "pending"
  ) {

    paymentSection.style.display =
      "none";

  } else {

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
    status,
    paymentStatus,
    proofUrl
  } = order;


  // ==========================
  // WAITING FOR PAYMENT
  // ==========================
  if (
    status === "pending" &&
    !proofUrl
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
  if (status === "rejected") {

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
    status === "pending" &&
    proofUrl &&
    paymentStatus === "PENDING"
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
  if (paymentStatus === "PAID") {

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
  if (status === "shipped") {

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
  // COMPLETED
  // ==========================
  if (status === "completed") {

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
// REAL-TIME ORDER LISTENER
// ==========================
function subscribeToOrder(orderId) {

  if (!orderId) return;


  const ref =
    doc(db, "orders", orderId);


  onSnapshot(ref, (snapshot) => {

    if (!snapshot.exists()) return;


    const order = {
      id: snapshot.id,
      ...snapshot.data()
    };


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
      order.createdAt &&
      order.paymentStatus !== "PAID" &&
      order.status === "pending" &&
      !order.proofUrl
    ) {

      let created;


      if (order.createdAt?.toMillis) {

        created =
          order.createdAt.toMillis();

      } else if (
        typeof order.createdAt === "number"
      ) {

        created =
          order.createdAt;

      } else if (
        typeof order.createdAt === "string"
      ) {

        created =
          new Date(order.createdAt)
            .getTime();

      } else {

        console.warn(
          "Invalid createdAt format",
          order.createdAt
        );

        return;

      }


      const expiryTime =
        created +
        (24 * 60 * 60 * 1000);


      startManualPaymentCountdown(
        expiryTime
      );

    } else {

      stopManualPaymentCountdown();

    }

  });

}


// ==========================
// INITIALIZE PAGE
// ==========================
document.addEventListener(
  "DOMContentLoaded",
  () => {

    initManualPaymentClipboard();

    initPolicyModal();

    subscribeToOrder(orderId);

    initManualPaymentUpload(orderId);

  }
);