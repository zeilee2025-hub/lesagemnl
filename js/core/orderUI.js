// ==========================
// 🧠 ORDER UI STATE ENGINE
// ==========================

export function deriveOrderUI(order) {
  if (!order) {
    return fallbackState();
  }

  const {
    status = "pending",
    paymentStatus = "PENDING",
    proofUrl = null,
    trackingNumber = null
  } = order;

  if (status === "pending" && !proofUrl) {
    return {
      label: "Waiting for Payment",
      type: "pending",
      action: "upload",
      actionLabel: "Upload Proof"
    };
  }

  if (status === "pending" && proofUrl && paymentStatus === "PENDING") {
    return {
      label: "Under Review",
      type: "review",
      action: null,
      actionLabel: null
    };
  }

  if (status === "rejected") {
    return {
      label: "Payment Rejected",
      type: "cancelled",
      action: "upload",
      actionLabel: "Upload Again"
    };
  }

  if (paymentStatus === "PAID" && status === "processing") {
    return {
      label: "Payment Confirmed",
      type: "paid",
      action: "view",
      actionLabel: "View Order"
    };
  }

  if (status === "shipped") {
    return {
      label: "Shipped",
      type: "shipped",
      action: trackingNumber ? "track" : "view",
      actionLabel: trackingNumber ? "Track Order" : "View Order"
    };
  }

  if (status === "completed") {
    return {
      label: "Completed",
      type: "completed",
      action: "view",
      actionLabel: "View Order"
    };
  }

  return fallbackState();
}

function fallbackState() {
  return {
    label: "Processing",
    type: "pending",
    action: "view",
    actionLabel: "View Order"
  };
}