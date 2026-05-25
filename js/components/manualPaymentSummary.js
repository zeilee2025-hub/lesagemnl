// ==========================
// MANUAL PAYMENT SUMMARY
// ==========================
export function renderManualPaymentSummary(order) {

  const container =
    document.getElementById(
      "order-summary"
    );

  if (!container) return;


  // ==========================
// ORDER ITEMS
// ==========================
const items =
  order.items ||
  order.cartItems ||
  order.products ||
  [];


  // ==========================
  // HEADER
  // ==========================
  let html = `
    <p class="order-summary__title">
      Order Summary
    </p>
  `;


  // ==========================
  // ITEMS
  // ==========================
  html += items.map((item) => {

    const name =
      item.name ||
      "Unnamed Product";

    const size =
      item.size || "—";

    const quantity =
      item.quantity || 0;

    const price =
      item.price || 0;

    const image =
      item.image ||
      "/images/placeholder.png";


    const itemTotal =
      price * quantity;


    return `
      <div class="order-summary__item">

        <div class="order-summary__img">

          <img
            src="${image}"
            alt="${name}"
            loading="lazy"
            onerror="this.onerror=null;this.src='/images/placeholder.png';"
          />

        </div>

        <div class="order-summary__details">

          <div class="order-summary__name">
            ${name}
          </div>

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


  // ==========================
  // TOTALS
  // ==========================
  const subtotal =
    order.subtotal ??
    items.reduce((total, item) => {

      return (
        total +
        (item.price || 0) *
        (item.quantity || 0)
      );

    }, 0);


  const shipping =
    order.shippingFee || 0;


  const total =
    order.total ??
    (subtotal + shipping);


  // ==========================
  // BREAKDOWN
  // ==========================
  html += `
    <div class="order-summary__breakdown">

      <div>
        <span>Subtotal</span>
        <span>
          ₱${subtotal.toLocaleString()}
        </span>
      </div>

      <div>
        <span>Shipping</span>
        <span>
          ₱${shipping.toLocaleString()}
        </span>
      </div>

    </div>

    <div class="order-summary__total">

      <span>Total</span>

      <span>
        ₱${total.toLocaleString()}
      </span>

    </div>
  `;


  // ==========================
  // RENDER
  // ==========================
  container.innerHTML = html;

}