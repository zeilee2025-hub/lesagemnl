// ==========================
//  ORDER UI STATE ENGINE
// ==========================

export function deriveOrderUI(order) {

  if (!order) {

    return fallbackState();

  }


  const {

    orderState =
      "PENDING_PAYMENT",

    trackingNumber =
      null

  } = order;


  // ==========================
  // WAITING FOR PAYMENT
  // ==========================
  if (

    orderState ===
      "PENDING_PAYMENT"

  ) {

    return {

      label:
        "Waiting for Payment",

      type:
        "pending",

      action:
        "upload",

      actionLabel:
        "Upload Proof"

    };

  }


  // ==========================
  // UNDER REVIEW
  // ==========================
  if (

    orderState ===
      "PROOF_UPLOADED"

  ) {

    return {

      label:
        "Under Review",

      type:
        "review",

      action:
        null,

      actionLabel:
        null

    };

  }


  // ==========================
  // REJECTED
  // ==========================
  if (

    orderState ===
      "REJECTED"

  ) {

    return {

      label:
        "Payment Rejected",

      type:
        "cancelled",

      action:
        "upload",

      actionLabel:
        "Upload Again"

    };

  }

  // ==========================
// EXPIRED
// ==========================
if (

  orderState ===
    "EXPIRED"

) {

  return {

    label:
      "Payment Expired",

    type:
      "cancelled",

    action:
      "view",

    actionLabel:
      "View Order"

  };

}

  // ==========================
  // PAID
  // ==========================
  if (

    orderState ===
      "PAID"

  ) {

    return {

      label:
        "Payment Confirmed",

      type:
        "paid",

      action:
        "view",

      actionLabel:
        "View Order"

    };

  }


  // ==========================
  // SHIPPED
  // ==========================
  if (

    orderState ===
      "SHIPPED"

  ) {

    return {

      label:
        "Shipped",

      type:
        "shipped",

      action:
        trackingNumber
          ? "track"
          : "view",

      actionLabel:
        trackingNumber
          ? "Track Order"
          : "View Order"

    };

  }


  // ==========================
  // COMPLETED
  // ==========================
  if (

    orderState ===
      "COMPLETED"

  ) {

    return {

      label:
        "Completed",

      type:
        "completed",

      action:
        "view",

      actionLabel:
        "View Order"

    };

  }


  return fallbackState();

}


// ==========================
// FALLBACK
// ==========================
function fallbackState() {

  return {

    label:
      "Processing",

    type:
      "pending",

    action:
      "view",

    actionLabel:
      "View Order"

  };

}