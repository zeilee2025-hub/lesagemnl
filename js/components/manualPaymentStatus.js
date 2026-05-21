// ==========================
// MANUAL PAYMENT STATUS
// ==========================

let countdownInterval = null;


// ==========================
// STATUS LABEL
// ==========================
export function getManualPaymentStatusLabel(order) {

  const {
  orderState
} = order;

    // ==========================
  // WAITING FOR PAYMENT
  // ==========================
  if (
    orderState === "PENDING_PAYMENT"
  ) {

    return "Waiting for payment";

  }


  // ==========================
  // UNDER REVIEW
  // ==========================
  if (
    orderState === "PROOF_UPLOADED"
  ) {

    return "Under review";

  }


  // ==========================
  // PAYMENT VERIFIED
  // ==========================
  if (
    orderState === "PAID"
  ) {

    return "Payment verified";

  }


  // ==========================
  // SHIPPED
  // ==========================
  if (
    orderState === "SHIPPED"
  ) {

    return "Shipped";

  }


  // ==========================
  // COMPLETED
  // ==========================
  if (
    orderState === "COMPLETED"
  ) {

    return "Completed";

  }


  // ==========================
  // REJECTED
  // ==========================
  if (
    orderState === "REJECTED"
  ) {

    return "Payment rejected";

  }

  // ==========================
// EXPIRED
// ==========================
if (

  orderState ===
    "EXPIRED"

) {

  return "Payment expired";

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

  if (countdownInterval) {

    clearInterval(
      countdownInterval
    );

    countdownInterval = null;

  }


  // ==========================
  // RESET STATUS UI
  // ==========================
  const statusInline =
    document.getElementById(
      "order-status-inline"
    );

  if (statusInline) {

    statusInline.textContent = "";

  }

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


  // ==========================
  // AUTO EXPIRE ORDER
  // ==========================
  if (

    window.currentOrder &&

    window.currentOrder.orderState ===
      "PENDING_PAYMENT"

  ) {

    import("../services/orderService.js")

      .then(async ({
        updateOrderStatus
      }) => {

        try {

          await updateOrderStatus(

            window.currentOrder.id,

            {
              orderState:
                "EXPIRED"
            },

            {
              action:
                "ORDER_EXPIRED"
            }

          );

          console.log(
            "Order expired automatically"
          );

        }

        catch (error) {

          console.error(
            "Expiration update failed:",
            error
          );

        }

      });

  }


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