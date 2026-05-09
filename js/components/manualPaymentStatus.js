// ==========================
// MANUAL PAYMENT STATUS
// ==========================

let countdownInterval = null;


// ==========================
// STATUS LABEL
// ==========================
export function getManualPaymentStatusLabel(order) {

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

    return "Waiting for payment";

  }


  // ==========================
  // UNDER REVIEW
  // ==========================
  if (
    status === "pending" &&
    proofUrl &&
    paymentStatus === "PENDING"
  ) {

    return "Under review";

  }


  // ==========================
  // PAYMENT VERIFIED
  // ==========================
  if (
    status === "processing" &&
    paymentStatus === "PAID"
  ) {

    return "Payment verified";

  }


  // ==========================
  // SHIPPED
  // ==========================
  if (status === "shipped") {

    return "Shipped";

  }


  // ==========================
  // COMPLETED
  // ==========================
  if (status === "completed") {

    return "Completed";

  }


  // ==========================
  // REJECTED
  // ==========================
  if (status === "rejected") {

    return "Payment rejected";

  }


  // ==========================
  // FALLBACK
  // ==========================
  return "—";

}


// ==========================
// STOP COUNTDOWN
// ==========================
export function stopManualPaymentCountdown() {

  if (!countdownInterval) return;


  clearInterval(
    countdownInterval
  );

  countdownInterval = null;

}


// ==========================
// START COUNTDOWN
// ==========================
export function startManualPaymentCountdown(
  expiryTimestamp
) {

  const statusInline =
    document.getElementById(
      "order-status-inline"
    );

  if (!statusInline) return;


  // ==========================
  // RESET EXISTING TIMER
  // ==========================
  stopManualPaymentCountdown();


  // ==========================
  // UPDATE TIMER
  // ==========================
  function updateCountdown() {

    const now =
      Date.now();

    const diff =
      expiryTimestamp - now;


    // ==========================
    // EXPIRED
    // ==========================
    if (diff <= 0) {

      statusInline.textContent =
        "Expired";

      statusInline.setAttribute(
        "data-status",
        "expired"
      );

      stopManualPaymentCountdown();

      return;

    }


    // ==========================
    // TIME CALCULATION
    // ==========================
    const hours = Math.floor(
      diff / (1000 * 60 * 60)
    );

    const minutes = Math.floor(
      (diff / (1000 * 60)) % 60
    );

    const seconds = Math.floor(
      (diff / 1000) % 60
    );


    // ==========================
    // FORMAT
    // ==========================
    const timeText =
      String(hours).padStart(2, "0") +
      ":" +
      String(minutes).padStart(2, "0") +
      ":" +
      String(seconds).padStart(2, "0");


    // ==========================
    // RENDER
    // ==========================
    statusInline.textContent =
      `Waiting for payment · ${timeText} left`;

  }


  // ==========================
  // INITIAL RENDER
  // ==========================
  updateCountdown();


  // ==========================
  // START INTERVAL
  // ==========================
  countdownInterval =
    setInterval(
      updateCountdown,
      1000
    );

}