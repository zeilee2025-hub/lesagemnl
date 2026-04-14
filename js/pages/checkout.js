import { getCart, saveCart } from "../services/cartService.js";
import { renderCheckoutItems } from "../components/checkoutUI.js";
import { calculateTotals } from "../core/checkoutLogic.js";
import { validateCartBeforeCheckout } from "../core/checkoutValidation.js";
import { syncCartWithStock } from "../core/stock.js";
import { createPaymentSession } from "../services/paymentService.js";

import {
  getRegions,
  getCities,
  findRegionByProvince
} from "../services/locationService.js";

import { getZone } from "../services/shippingService.js";

// ✅ NEW
import {
  getCheckoutFormData,
  validateCheckoutForm
} from "../core/checkoutForm.js";

// ==========================
// 📦 DOM REFERENCES
// ==========================
let itemsContainer;
let summaryContainer;

let provinceInput;
let provinceDropdown;
let citySelect;
let postalInput;

// ==========================
// 🧠 STATE
// ==========================
let cartData = [];
let selectedRegion = "";
let selectedProvince = "";
let allProvinces = [];

// ==========================
// 🛒 CART BADGE
// ==========================
function updateCartBadge(cart) {
  const badge = document.getElementById("cart-badge");
  if (!badge) return;

  const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  badge.textContent = count;
}

// ==========================
// 💾 LOCAL STORAGE
// ==========================
function saveCheckoutData(data) {
  localStorage.setItem("checkoutData", JSON.stringify(data));
}

function loadCheckoutData() {
  const data = localStorage.getItem("checkoutData");
  return data ? JSON.parse(data) : null;
}

// ==========================
// 🚀 INIT
// ==========================
async function init() {
  itemsContainer = document.getElementById("checkout-items");
  summaryContainer = document.getElementById("checkout-summary");

  provinceInput = document.getElementById("checkout-province-input");
  provinceDropdown = document.getElementById("province-dropdown");
  citySelect = document.getElementById("checkout-city");
  postalInput = document.getElementById("checkout-postal");

  await initProvinces();
  setupProvinceSearch();

  if (citySelect) {
    citySelect.addEventListener("change", renderTotals);
  }

  const saved = loadCheckoutData();
  if (saved) {
    document.getElementById("checkout-email").value = saved.email || "";
    document.getElementById("checkout-phone").value = saved.phone || "";
  }

  document.addEventListener("input", (e) => {
    saveCheckoutData({
      email: document.getElementById("checkout-email")?.value,
      phone: document.getElementById("checkout-phone")?.value
    });

    if (e.target.classList.contains("checkout__input")) {
      clearError(e.target);
    }
  });

  document.addEventListener("click", (e) => {
  if (e.target.id === "checkout-btn") {
    handleCheckout();
  }
});

  await loadCheckout();
}

init();

// ==========================
// 🌍 PROVINCES
// ==========================
async function initProvinces() {
  const regions = await getRegions();

  allProvinces = [];

  regions.forEach(region => {
    region.provinces.forEach(p => {
      allProvinces.push(p.name);
    });
  });

  allProvinces.sort((a, b) => a.localeCompare(b));
}

// ==========================
// 🔍 SEARCH
// ==========================
function setupProvinceSearch() {
  if (!provinceInput || !provinceDropdown) return;

  provinceInput.addEventListener("input", () => {
    const query = provinceInput.value.toLowerCase();

    const filtered = allProvinces.filter(p =>
      p.toLowerCase().includes(query)
    );

    renderProvinceDropdown(filtered);
  });

  provinceInput.addEventListener("focus", () => {
    renderProvinceDropdown(allProvinces);
  });

  document.addEventListener("click", (e) => {
    if (!provinceDropdown.contains(e.target) && e.target !== provinceInput) {
      provinceDropdown.style.display = "none";
    }
  });
}

// ==========================
// 📋 DROPDOWN
// ==========================
function renderProvinceDropdown(list) {
  provinceDropdown.innerHTML = "";

  if (!list.length) {
    provinceDropdown.style.display = "none";
    return;
  }

  list.forEach(name => {
    const item = document.createElement("div");
    item.className = "dropdown-item";
    item.textContent = name;

    item.addEventListener("click", async () => {
      provinceInput.value = name;
      provinceDropdown.style.display = "none";
      selectedProvince = name;
      await handleProvinceSelection(name);
    });

    provinceDropdown.appendChild(item);
  });

  provinceDropdown.style.display = "block";
}

// ==========================
// 🧠 HANDLE LOCATION
// ==========================
async function handleProvinceSelection(province) {
  const resolvedRegion = await findRegionByProvince(province);

  if (resolvedRegion) {
    selectedRegion = resolvedRegion;
  }

  const cities = await getCities(resolvedRegion, province);

  citySelect.innerHTML = `<option value="">Select City</option>`;

  cities.forEach(c => {
    citySelect.innerHTML += `<option value="${c}">${c}</option>`;
  });

  if (cities.length === 1) {
    citySelect.value = cities[0];
  }

  renderTotals();
}

// ==========================
// 🛒 LOAD CART
// ==========================
async function loadCheckout() {
  try {
    const cart = getCart();
    cartData = Array.isArray(cart) ? cart : [];

    updateCartBadge(cartData);

    renderCheckoutItems(itemsContainer, cartData);

    if (!cartData.length) {
      clearSummary();
      return;
    }

    renderTotals();
    // attachCheckoutButton();

  } catch (error) {
    console.error("Error loading cart:", error);
    if (itemsContainer) {
      itemsContainer.innerHTML = "<p>Failed to load cart.</p>";
    }
  }
}

// ==========================
// 🧹 CLEAR
// ==========================
function clearSummary() {
  if (summaryContainer) summaryContainer.innerHTML = "";
}

// ==========================
// 🚚 DELIVERY
// ==========================
function getDeliveryEstimate(zone) {
  return zone === "NCR"
    ? "3–5 business days"
    : "7–10 business days";
}

// ==========================
// 💰 TOTALS
// ==========================
function renderTotals() {
  const totals = calculateTotals(cartData, selectedRegion);

  const hasLocation =
    selectedRegion &&
    selectedProvince &&
    citySelect?.value;

  const zone = hasLocation ? getZone(selectedRegion) : null;
  const deliveryEstimate = hasLocation
    ? getDeliveryEstimate(zone)
    : null;

  if (summaryContainer) {
    summaryContainer.innerHTML = `
      <div class="summary">

        <div class="summary__row">
          <span>Subtotal</span>
          <span>₱${totals.subtotal.toLocaleString()}</span>
        </div>

        <div class="summary__row">
          <span>Shipping ${zone ? `(${zone})` : ""}</span>
          <span>
            ${
              hasLocation
                ? (totals.isFreeShipping ? "Free" : `₱${totals.shipping}`)
                : "—"
            }
          </span>
        </div>

        <div class="summary__row">
          <span>Estimated delivery</span>
          <span>${hasLocation ? deliveryEstimate : "—"}</span>
        </div>

        ${
          hasLocation && !totals.isFreeShipping
            ? `<p class="summary__free">
                 <span class="summary__free-amount">₱${totals.remainingForFree}</span> more to reach free shipping
               </p>`
            : hasLocation && totals.isFreeShipping
            ? `<p class="summary__free success">
                 You’ve unlocked free shipping!
               </p>`
            : ""
        }

        <div class="summary__divider"></div>

        <div class="summary__total">
          <span>Total</span>
          <span>₱${totals.total.toLocaleString()}</span>
        </div>

        <button class="summary__btn" id="checkout-btn">
          Proceed to Payment
        </button>

      </div>
    `;
  }
}

// ==========================
// ❌ VALIDATION UI
// ==========================
function clearError(input) {
  if (!input) return;

  input.classList.remove("input-error");

  const error = input.parentElement.querySelector(".input-error-text");
  if (error) error.remove();
}

function showFormErrors(errors) {
  Object.entries(errors).forEach(([field, message]) => {
    const input = getInputByField(field);
    if (!input) return;

    input.classList.add("input-error");

    let errorEl = input.parentElement.querySelector(".input-error-text");

    if (!errorEl) {
      errorEl = document.createElement("div");
      errorEl.className = "input-error-text";
      input.parentElement.appendChild(errorEl);
    }

    errorEl.textContent = message;
  });
}

function getInputByField(field) {
  const map = {
    email: "checkout-email",
    phone: "checkout-phone",
    firstName: "checkout-first-name",
    lastName: "checkout-last-name",
    address: "checkout-address",
    province: "checkout-province-input",
    city: "checkout-city",
    postal: "checkout-postal"
  };

  return document.getElementById(map[field]);
}

// ==========================
// 💳 CHECKOUT (FINAL)
// ==========================
async function handleCheckout() {
  const btn = document.getElementById("checkout-btn");

  if (!cartData.length) {
    alert("Your cart is empty.");
    return;
  }

  try {
    btn.disabled = true;
    btn.textContent = "Processing...";

    // 🧠 FORM
    const formData = getCheckoutFormData();

    const formValidation = validateCheckoutForm(formData);

    if (!formValidation.valid) {
      showFormErrors(formValidation.errors);
      resetButton(btn);
      return;
    }

    // 🔄 STOCK
    const { updatedCart, changes } = await syncCartWithStock(cartData);

    if (!updatedCart.length) {
      alert("All items are out of stock.");
      resetButton(btn);
      return;
    }

    saveCart(updatedCart);
    cartData = updatedCart;

    if (changes.length > 0) {
      alert("Cart updated:\n\n" + changes.join("\n"));
      renderTotals();
      resetButton(btn);
      return;
    }

    // 🛒 CART VALIDATION
    const validation = await validateCartBeforeCheckout(cartData);

    if (!validation.valid) {
      alert(validation.errors.join("\n"));
      resetButton(btn);
      return;
    }

    // 💰 TOTALS
    const totals = calculateTotals(cartData, selectedRegion);

    // 📦 CUSTOMER
    const customer = {
      ...formData,
      region: selectedRegion
    };

    // 🚀 PAYMENT
    await createPaymentSession({
      items: cartData,
      totals,
      customer
    });

  } catch (error) {
    console.error("Checkout error:", error);
    alert("Checkout failed.");
    resetButton(btn);
  }
}

// ==========================
// 🔄 RESET
// ==========================
function resetButton(btn) {
  if (!btn) return;
  btn.disabled = false;
  btn.textContent = "Proceed to Payment";
}