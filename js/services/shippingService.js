// /services/shippingService.js

// ==============================
// REGION -> ZONE MAPPING
// ==============================
const REGION_TO_ZONE = {
  // Luzon, including Metro Manila
  NCR: "Luzon",
  "Region I": "Luzon",
  "Region II": "Luzon",
  "Region III": "Luzon",
  "Region IV-A": "Luzon",
  "Region IV-B": "Luzon",
  "Region V": "Luzon",

  // Visayas
  "Region VI": "Visayas",
  "Region VII": "Visayas",
  "Region VIII": "Visayas",

  // Mindanao
  "Region IX": "Mindanao",
  "Region X": "Mindanao",
  "Region XI": "Mindanao",
  "Region XII": "Mindanao",
  "Region XIII": "Mindanao",
  BARMM: "Mindanao"
};

// ==============================
// ZONE -> FLAT RATE
// ==============================
const SHIPPING_RATES = {
  Luzon: 95,
  Visayas: 100,
  Mindanao: 110
};

// ==============================
// GET ZONE
// ==============================
export function getZone(region, province = "") {
  if (province === "Metro Manila") {
    return "Luzon";
  }

  return REGION_TO_ZONE[region] || "Luzon";
}

// ==============================
// GET SHIPPING FEE
// ==============================
export function getShippingFee(region, province = "") {
  const zone = getZone(region, province);

  return SHIPPING_RATES[zone] || SHIPPING_RATES.Luzon;
}
