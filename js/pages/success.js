import { API_BASE_URL }
from "../services/config/api.js";

// ==========================
//  SUCCESS PAGE (BACKEND-DRIVEN)
// ==========================

document.addEventListener("DOMContentLoaded", init);

async function init() {

  const orderText = document.getElementById("order-id");
  if (!orderText) return;

  try {
    // ==========================
    //  GET ORDER ID FROM URL
    // ==========================
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");

    if (!orderId) {
      showError("Invalid order.");
      return;
    }

    // ==========================
//  RENDER ORDER ID IMMEDIATELY
// ==========================
orderText.textContent =
  `#${orderId}`;

    // ==========================
    //  VERIFY ORDER FROM BACKEND
    // ==========================
    const res = await fetch(
  `${API_BASE_URL}/order-status?orderId=${orderId}`
);

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch order");
    }

    // ==========================
// RESTORE CUSTOMER SESSION
// ==========================
if (data.email) {

  localStorage.setItem(
    "customerEmail",
    data.email
  );

}

// ==========================
// RESTORE LAST ORDER
// ==========================
localStorage.setItem(
  "lastOrderId",
  orderId
);

    // ==========================
    //  WAIT UNTIL PAID
    // ==========================
    if (data.paymentStatus !== "PAID") {
  showError("Payment not confirmed yet.");
  return;
}

// ==========================
// RESTORE CUSTOMER SESSION
// ==========================
if (data.email) {

  localStorage.setItem(
    "customerEmail",
    data.email
  );

  console.log(
    "Customer email restored:",
    data.email
  );

}
    // ==========================
    //  DISPLAY SUCCESS
    // ==========================
    orderText.textContent =
  `#${orderId}`;

    // ==========================
    //  CLEAR CART (SAFE)
    // ==========================
    localStorage.removeItem("cart");

  } catch (error) {
    console.error(" Success error:", error);
    showError("Something went wrong.");
  }
}

// ==========================
//  ERROR HANDLER
// ==========================
function showError(message) {
  document.body.innerHTML = `
    <div style="padding:40px;text-align:center;">
      <h2>${message}</h2>
      <a href="shop.html">Back to shop</a>
    </div>
  `;
}