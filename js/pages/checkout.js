import {
  getCart,
  saveCart
} from "../services/cartService.js";

import { renderCheckoutItems } from "../components/checkoutUI.js";

import {
  renderTotals,
  clearSummary
} from "../components/checkoutSummary.js";

import {
  initProvinces,
  setupProvinceSearch,
  selectedProvince,
  selectedRegion
} from "../components/locationUI.js";

import {
  getCheckoutFormData,
  validateCheckoutForm
} from "../core/checkoutForm.js";

import {
  clearError,
  showFormErrors
} from "../components/checkoutValidationUI.js";

import { calculateTotals } from "../core/checkoutLogic.js";
import { validateCartBeforeCheckout } from "../core/checkoutValidation.js";
import { syncCartWithStock } from "../core/stock.js";

import { createPaymentSession } from "../services/paymentService.js";
import { saveOrder } from "../services/orderService.js";

import {
  getCurrentUser
} from "../services/authService.js";


/* =========================
   DOM REFERENCES
========================= */

let itemsContainer;
let summaryContainer;

let provinceInput;
let provinceDropdown;

let citySelect;
let cityManualInput;
let cityFallbackTrigger;

let postalInput;

let isManualCity = false;


/* =========================
   STATE
========================= */

let cartData = [];
let paymentMethod = "PAYMONGO";

/* =========================
   SUMMARY UPDATE
========================= */

function updateSummary() {
  renderTotals({
    cartData,
    summaryContainer,
    citySelect,
    cityManualInput,
    isManualCity,
    selectedProvince,
    selectedRegion,
    paymentMethod
  });
}


/* =========================
   CART BADGE
========================= */

function updateCartBadge(cart) {
  const badge = document.getElementById("cart-badge");

  if (!badge) return;

  const count = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  badge.textContent = count;
}


/* =========================
   LOCAL STORAGE
========================= */

function saveCheckoutData(data) {
  localStorage.setItem(
    "checkoutData",
    JSON.stringify(data)
  );
}

function loadCheckoutData() {
  const data = localStorage.getItem("checkoutData");

  return data
    ? JSON.parse(data)
    : null;
}


/* =========================
   INIT
========================= */

async function init() {

  cacheDom();

  await initProvinces();

  setupProvinceSearch({
    provinceInput,
    provinceDropdown,

    citySelect,
    cityManualInput,
    cityFallbackTrigger,

    updateSummary,

    setManualCityMode: (
      value
    ) => {
      isManualCity = value;
    }
  });

  setupLocationEvents();

  hydrateCheckoutData();

  setupInputPersistence();

  setupCheckoutButton();

  await loadCheckout();

  setupPaymentSelection();

  updateCheckoutButton();

}

init();


/* =========================
   CACHE DOM
========================= */

function cacheDom() {
  itemsContainer = document.getElementById("checkout-items");
  summaryContainer = document.getElementById("checkout-summary");

  provinceInput = document.getElementById("checkout-province-input");
  provinceDropdown = document.getElementById("province-dropdown");

  citySelect = document.getElementById("checkout-city");

  postalInput = document.getElementById("checkout-postal");

  cityManualInput = document.getElementById("checkout-city-manual");

  cityFallbackTrigger = document.getElementById(
    "city-fallback-trigger"
  );
}


/* =========================
   HYDRATE STORAGE
========================= */

function hydrateCheckoutData() {
  const saved = loadCheckoutData();

  if (!saved) return;

  const emailInput = document.getElementById("checkout-email");
  const phoneInput = document.getElementById("checkout-phone");

  if (emailInput) {
    emailInput.value = saved.email || "";
  }

  if (phoneInput) {
    phoneInput.value = saved.phone || "";
  }
}


/* =========================
   INPUT PERSISTENCE
========================= */

function setupInputPersistence() {
  document.addEventListener("input", (event) => {

    saveCheckoutData({
      email: document.getElementById("checkout-email")?.value,
      phone: document.getElementById("checkout-phone")?.value
    });

    if (
      event.target.classList.contains("checkout__input")
    ) {
      clearError(event.target);
    }
  });
}


/* =========================
   CHECKOUT BUTTON
========================= */

function setupCheckoutButton() {
  document.addEventListener("click", (event) => {

    const button = event.target.closest("#checkout-btn");

    if (!button) return;

    handleCheckout();
  });
}


/* =========================
   LOCATION EVENTS
========================= */

function setupLocationEvents() {

  if (citySelect) {
    citySelect.addEventListener("change", () => {
      updateSummary();
    });
  }

  if (
    cityFallbackTrigger &&
    cityManualInput &&
    citySelect
  ) {

    cityFallbackTrigger.addEventListener("click", () => {

      cityManualInput.value = "";

      isManualCity = true;

      citySelect.style.display = "none";

      cityFallbackTrigger.style.display = "none";

      cityManualInput.style.display = "block";

      cityManualInput.focus();

      updateSummary();
    });
  }

  if (cityManualInput) {
    cityManualInput.addEventListener("input", () => {

      updateSummary();

    });
  }
}


/* =========================
   LOAD CHECKOUT
========================= */

async function loadCheckout() {

  try {

    const cart = getCart();

    cartData = Array.isArray(cart)
      ? cart
      : [];

    updateCartBadge(cartData);

    renderCheckoutItems(
      itemsContainer,
      cartData
    );

    if (!cartData.length) {
      clearSummary(summaryContainer);
      return;
    }

    updateSummary();

  } catch (error) {

    console.error(
      "Error loading cart:",
      error
    );

    if (itemsContainer) {
      itemsContainer.innerHTML =
        "<p>Failed to load cart.</p>";
    }
  }
}


/* =========================
   PAYMENT SELECTION
========================= */

function setupPaymentSelection() {

  const cards = document.querySelectorAll(
    ".payment-card"
  );

  cards.forEach((card) => {

    card.addEventListener("click", () => {

      cards.forEach((currentCard) => {
        currentCard.classList.remove(
  "payment-card--active"
);
      });

      card.classList.add(
  "payment-card--active"
);

      paymentMethod = card.dataset.method;

      updateCheckoutButton();

      updateSummary();

    });

  });

}


/* =========================
   UPDATE BUTTON
========================= */

function updateCheckoutButton() {

  const button =
    document.getElementById("checkout-btn");

  if (!button) return;

  if (paymentMethod === "PAYMONGO") {
    button.textContent =
      "Proceed to Payment";
  } else {
    button.textContent =
      "Place Order";
  }
}


/* =========================
   HANDLE CHECKOUT
========================= */

async function handleCheckout() {

  const button =
    document.getElementById(
      "checkout-btn"
    );

  if (!cartData.length) {
    alert("Your cart is empty.");
    return;
  }

  try {

    button.disabled = true;
    button.classList.add("is-disabled");
    button.textContent = "Processing...";

    const formData =
      getCheckoutFormData();

    const formValidation =
      validateCheckoutForm(formData);

    if (!formValidation.valid) {

      showFormErrors({
  errors:
    formValidation.errors,

  isManualCity
});

      resetButton(button);

      return;
    }


    /* =========================
       STOCK SYNC
    ========================= */

    const {
      updatedCart,
      changes
    } = await syncCartWithStock(
      cartData
    );

    if (!updatedCart.length) {

      alert(
        "All items are out of stock."
      );

      resetButton(button);

      return;
    }

    saveCart(updatedCart);

    cartData = updatedCart;

    if (changes.length > 0) {

  alert(
    "Cart updated:\n\n" +
    changes.join("\n")
  );

  renderCheckoutItems(
    itemsContainer,
    updatedCart
  );

  updateCartBadge(
    updatedCart
  );

  updateSummary();

  resetButton(button);

  return;

}


    /* =========================
       CART VALIDATION
    ========================= */

    const cartValidation =
      await validateCartBeforeCheckout(
        cartData
      );

    if (!cartValidation.valid) {

      alert(
        cartValidation.errors.join("\n")
      );

      resetButton(button);

      return;
    }


    /* =========================
       TOTALS
    ========================= */

    const totals =
      calculateTotals(
        cartData,
        selectedRegion
      );


    /* =========================
       CUSTOMER
    ========================= */

    const currentUser =
  getCurrentUser();

const customer = {
  ...formData,

  uid:
    currentUser?.uid || null,

  email:
    currentUser?.email ||
    formData.email,

  region:
    selectedRegion
};


/* =========================
   CREATE ORDER
========================= */

const orderId =
  await saveOrder({

    /* =========================
       CUSTOMER
    ========================= */

    email:
      customer.email,

    uid:
      customer.uid,

    firstName:
      customer.firstName,

    lastName:
      customer.lastName,

    phone:
      customer.phone,

    address:
      customer.address,

    city:
      customer.city,

    province:
      customer.province,


    /* =========================
       ORDER ITEMS
    ========================= */

    items:
      cartData,


    /* =========================
       TOTALS
    ========================= */

    subtotal:
      totals.subtotal,

    shippingFee:
      totals.shipping,

    total:
      totals.total,


    /* =========================
       NEW PRIMARY STATE SYSTEM
    ========================= */

    orderState:
      "PENDING_PAYMENT",


    /* =========================
       LEGACY COMPATIBILITY
    ========================= */

    status:
      "pending",

    paymentStatus:
      "PENDING",


    /* =========================
       PAYMENT
    ========================= */

    paymentMethod

});


/* =========================
   SAVE SESSION RECOVERY
========================= */

localStorage.setItem(
  "lastOrderId",
  orderId
);

localStorage.setItem(
  "customerEmail",
  customer.email
);


/* =========================
   PAYMENT FLOW
========================= */

if (paymentMethod === "PAYMONGO") {

  // =========================
  // CLEAR CART
  // =========================
  saveCart([]);

  updateCartBadge([]);

  // =========================
  // CREATE PAYMENT SESSION
  // =========================
  await createPaymentSession({

    items: cartData,

    totals,

    customer,

    orderId

  });

}

else {

  // =========================
  // CLEAR CART
  // =========================
  saveCart([]);

  updateCartBadge([]);

  // =========================
  // REDIRECT TO MANUAL PAYMENT
  // =========================
  window.location.href =
    `/manual-payment.html?id=${orderId}`;

}

} catch (error) {

  console.error(
    "Checkout error:",
    error
  );

  alert("Checkout failed.");

  resetButton(button);

}

}


/* =========================
   RESET BUTTON
========================= */

function resetButton(button) {

  if (!button) return;

  button.disabled = false;

  button.classList.remove(
    "is-disabled"
  );

  updateCheckoutButton();

}