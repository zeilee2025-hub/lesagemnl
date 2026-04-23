// ===============================
// 🧠 GET FORM DATA
// ===============================
export function getCheckoutFormData() {
  const citySelect = document.getElementById("checkout-city");
  const cityManual = document.getElementById("checkout-city-manual");

  return {
    email: document.getElementById("checkout-email")?.value.trim(),
    phone: document.getElementById("checkout-phone")?.value.trim(),
    firstName: document.getElementById("checkout-first-name")?.value.trim(),
    lastName: document.getElementById("checkout-last-name")?.value.trim(),
    address: document.getElementById("checkout-address")?.value.trim(),
    apartment: document.getElementById("checkout-apartment")?.value.trim(),
    province: document.getElementById("checkout-province-input")?.value.trim(),

    // 👇 THIS IS THE FIX
    city: (cityManual?.value || citySelect?.value || "").trim(),

    postal: document.getElementById("checkout-postal")?.value.trim(),
  };
}

// ===============================
// ✅ VALIDATE FORM
// ===============================
export function validateCheckoutForm(data) {
  const errors = {};

  // EMAIL
  if (!data.email) {
    errors.email = "Email is required";
  } else if (!/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.email = "Invalid email format";
  }

  // PHONE
  if (!data.phone) {
    errors.phone = "Phone is required";
  }

  // NAME
  if (!data.firstName) errors.firstName = "Required";
  if (!data.lastName) errors.lastName = "Required";

  // ADDRESS
  if (!data.address) errors.address = "Street address required";

  // LOCATION
  if (!data.province) errors.province = "Select a province";
  if (!data.city || !data.city.trim()) {
  errors.city = "Enter your city";
}

  // POSTAL
  if (!data.postal) {
    errors.postal = "Postal code required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}