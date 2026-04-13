// /services/locationService.js

// ==========================
// 🧠 CACHE (prevents re-fetch)
// ==========================
let locationsCache = null;

// ==========================
// 🚀 LOAD DATA (LAZY)
// ==========================
async function loadLocations() {
  if (locationsCache) return locationsCache;

  try {
    const res = await fetch("/data/ph-locations.json");

    if (!res.ok) {
      throw new Error("Failed to load location data");
    }

    const data = await res.json();

    locationsCache = data;
    return data;

  } catch (error) {
    console.error("LocationService Error:", error);
    return { regions: [] }; // fallback (prevents crash)
  }
}

// ==========================
// 📍 GET REGIONS
// ==========================
export async function getRegions() {
  const data = await loadLocations();
  return data.regions || [];
}

// ==========================
// 🏙 GET PROVINCES
// ==========================
export async function getProvinces(regionName) {
  if (!regionName) return [];

  const data = await loadLocations();

  const region = data.regions.find(r => r.name === regionName);
  return region?.provinces || [];
}

// ==========================
// 🏢 GET CITIES
// ==========================
export async function getCities(regionName, provinceName) {
  if (!regionName || !provinceName) return [];

  const data = await loadLocations();

  const region = data.regions.find(r => r.name === regionName);
  const province = region?.provinces.find(p => p.name === provinceName);

  return province?.cities || [];
}

// ==========================
// 🔁 FIND REGION BY PROVINCE (NEW)
// ==========================
export async function findRegionByProvince(provinceName) {
  if (!provinceName) return null;

  const data = await loadLocations();

  for (const region of data.regions) {
    const match = region.provinces.find(p => p.name === provinceName);

    if (match) {
      return region.name;
    }
  }

  return null;
}