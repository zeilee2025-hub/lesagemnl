// ==========================
// MANUAL PAYMENT ACTIONS
// ==========================
export function renderManualPaymentActions(order) {

  const container =
    document.getElementById(
      "confirmation-actions"
    );

  if (!container) return;


  // ==========================
  // RESET
  // ==========================
  container.innerHTML = "";


  // ==========================
  // VIEW ORDER BUTTON
  // ==========================
  const viewBtn =
    document.createElement("a");

  viewBtn.href =
    `order.html?id=${order.id}`;

  viewBtn.textContent =
    "View Order";

  viewBtn.className =
    "btn btn-pill btn-primary";


  // ==========================
  // CONTINUE SHOPPING BUTTON
  // ==========================
  const shopBtn =
    document.createElement("a");

  shopBtn.href = "/";

  shopBtn.textContent =
    "Continue shopping";

  shopBtn.className =
    "btn btn-pill btn-secondary";


  // ==========================
  // SHOW VIEW ORDER
  // ==========================
  if (
  order.orderState === "PAID" ||
  order.orderState === "SHIPPED" ||
  order.orderState === "COMPLETED"
) {

    container.appendChild(
      viewBtn
    );

  }


  // ==========================
  // ALWAYS SHOW SHOP BUTTON
  // ==========================
  container.appendChild(
    shopBtn
  );

}