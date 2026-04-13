// /services/shippingService.js

// ==============================
// 🗺 REGION → ZONE MAPPING (FULL PH)
// ==============================
const REGION_TO_ZONE = {
  // NCR
  "NCR": "NCR",

  // LUZON
  "Region I": "Luzon",
  "Region II": "Luzon",
  "Region III": "Luzon",
  "Region IV-A": "Luzon",
  "Region V": "Luzon",

  // SPECIAL (ISLAND AREAS)
  "Region IV-B": "Island", // Palawan, Mindoro

  // VISAYAS
  "Region VI": "Visayas",
  "Region VII": "Visayas",
  "Region VIII": "Visayas",

  // MINDANAO
  "Region IX": "Mindanao",
  "Region X": "Mindanao",
  "Region XI": "Mindanao",
  "Region XII": "Mindanao",
  "Region XIII": "Mindanao"
};

// ==============================
// 💰 ZONE → BASE RATE (0–500g)
// ==============================
const SHIPPING_RATES = {
  NCR: 85,
  Luzon: 95,
  Visayas: 100,
  Mindanao: 105,
  Island: 115
};

// ==============================
// 📦 GET ZONE
// ==============================
export function getZone(region) {
  return REGION_TO_ZONE[region] || "Luzon";
}

// ==============================
// 🚚 GET SHIPPING FEE (MVP: flat)
// ==============================
export function getShippingFee(region) {
  const zone = getZone(region);
  return SHIPPING_RATES[zone] || 95;
}