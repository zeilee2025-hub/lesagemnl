import { calculateTotals } from "../core/checkoutLogic.js";

import { getZone } from "../services/shippingService.js";


/* =========================
   DELIVERY ESTIMATE
========================= */

function getDeliveryEstimate(
  region,
  province
) {

  return (
    region === "NCR" ||
    province === "Metro Manila"
  )
    ? "3–5 business days"
    : "7–10 business days";

}


/* =========================
   RENDER TOTALS
========================= */

function renderTotals({
  cartData,
  summaryContainer,
  citySelect,
  cityManualInput,
  isManualCity,
  selectedProvince,
  selectedRegion,
  paymentMethod
}) {

  const totals =
    calculateTotals(
      cartData,
      selectedRegion,
      selectedProvince
    );


  /* =========================
     LOCATION STATE
  ========================= */

  const cityValueRaw =
    isManualCity
      ? cityManualInput?.value
      : citySelect?.value;

  const cityValue =
    cityValueRaw?.trim();

  const hasLocation =
    selectedRegion &&
    selectedProvince &&
    cityValue;


  /* =========================
     SHIPPING
  ========================= */

  const zone =
    hasLocation
      ? getZone(
          selectedRegion,
          selectedProvince
        )
      : null;

  const deliveryEstimate =
    hasLocation
      ? getDeliveryEstimate(
          selectedRegion,
          selectedProvince
        )
      : null;


  /* =========================
     SHIPPING LABEL
  ========================= */

  let shippingLabel = "—";

  if (hasLocation) {

    shippingLabel =
      totals.isFreeShipping
        ? "Free"
        : `₱${totals.shipping}`;

  }


  /* =========================
     FREE SHIPPING UI
  ========================= */

  let freeShippingMarkup = "";

  if (
    hasLocation &&
    !totals.isFreeShipping
  ) {

    freeShippingMarkup = `
      <p class="summary__free">
        <span class="summary__free-amount">
          ₱${totals.remainingForFree}
        </span>
        more to reach free shipping
      </p>
    `;

  }

  if (
    hasLocation &&
    totals.isFreeShipping
  ) {

    freeShippingMarkup = `
      <p class="summary__free success">
        You’ve unlocked free shipping!
      </p>
    `;

  }


  /* =========================
     RENDER
  ========================= */

  if (summaryContainer) {

    summaryContainer.innerHTML = `
      <div class="summary">

        <div class="summary__row">
          <span>Subtotal</span>

          <span>
            ₱${totals.subtotal.toLocaleString()}
          </span>
        </div>

        <div class="summary__row">
          <span>
            Shipping ${
              zone
                ? `(${zone})`
                : ""
            }
          </span>

          <span>
            ${shippingLabel}
          </span>
        </div>

        <div class="summary__row">
          <span>
            Estimated delivery
          </span>

          <span>
            ${
              hasLocation
                ? deliveryEstimate
                : "—"
            }
          </span>
        </div>

        ${freeShippingMarkup}

        <div class="summary__divider"></div>

        <div class="summary__total">
          <span>Total</span>

          <span>
            ₱${totals.total.toLocaleString()}
          </span>
        </div>

        <button
          class="summary__btn"
          id="checkout-btn"
        >
          ${
            paymentMethod === "PAYMONGO"
              ? "Proceed to Payment"
              : "Place Order"
          }
        </button>

      </div>
    `;
  }

}


/* =========================
   CLEAR SUMMARY
========================= */

function clearSummary(
  summaryContainer
) {

  if (!summaryContainer) return;

  summaryContainer.innerHTML = "";

}


export {
  renderTotals,
  clearSummary
};
