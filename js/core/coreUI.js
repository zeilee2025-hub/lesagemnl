// ==========================
// 🧠 ORDER UI STATE ENGINE
// ==========================

export function deriveOrderUI(order) {
  if (!order) {
    console.error("❌ deriveOrderUI: missing order");
    return fallbackState();
  }

  const {
    status = "pending",
    paymentStatus = "PENDING",
    proofUrl = null,
    trackingNumber = null
  } = order;

  // ==========================
  // 🟡 WAITING FOR PAYMENT
  // ==========================
  if (status === "pending" && !proofUrl) {
    return {
      label: "Waiting for Payment",
      type: "pending",
      action: "upload",
      actionLabel: "Upload Proof",
      clickable: true
    };
  }

  // ==========================
  // 🟡 UNDER REVIEW
  // ==========================
  if (status === "pending" && proofUrl && paymentStatus === "PENDING") {
    return {
      label: "Under Review",
      type: "review",
      action: null,
      actionLabel: null,
      clickable: true
    };
  }

  // ==========================
  // 🔴 PAYMENT REJECTED
  // ==========================
  if (status === "rejected") {
    return {
      label: "Payment Rejected",
      type: "cancelled",
      action: "upload",
      actionLabel: "Upload Again",
      clickable: true
    };
  }

  // ==========================
  // 🟢 PAYMENT CONFIRMED
  // ==========================
  if (paymentStatus === "PAID" && status === "processing") {
    return {
      label: "Payment Confirmed",
      type: "paid",
      action: "view",
      actionLabel: "View Order",
      clickable: true
    };
  }

  // ==========================
  // 🚚 SHIPPED
  // ==========================
  if (status === "shipped") {
    return {
      label: "Shipped",
      type: "shipped",
      action: trackingNumber ? "track" : "view",
      actionLabel: trackingNumber ? "Track Order" : "View Order",
      clickable: true
    };
  }

  // ==========================
  // 📦 COMPLETED
  // ==========================
  if (status === "completed") {
    return {
      label: "Completed",
      type: "completed",
      action: "view",
      actionLabel: "View Order",
      clickable: true
    };
  }

  // ==========================
  // ⚪ FALLBACK
  // ==========================
  return fallbackState();
}

// ==========================
// ⚪ FALLBACK STATE
// ==========================
function fallbackState() {
  return {
    label: "Processing",
    type: "pending",
    action: "view",
    actionLabel: "View Order",
    clickable: true
  };
}