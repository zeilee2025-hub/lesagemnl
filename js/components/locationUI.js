import {
  getRegions,
  getCities,
  findRegionByProvince
} from "../services/locationService.js";


/* =========================
   STATE
========================= */

let selectedRegion = "";
let selectedProvince = "";

let allProvinces = [];


/* =========================
   INIT PROVINCES
========================= */

async function initProvinces() {

  const regions =
    await getRegions();

  allProvinces = [];

  regions.forEach((region) => {

    region.provinces.forEach(
      (province) => {

        allProvinces.push(
          province.name
        );

      }
    );

  });

  allProvinces.sort(
    (a, b) => a.localeCompare(b)
  );

}


/* =========================
   PROVINCE SEARCH
========================= */

function setupProvinceSearch({
  provinceInput,
  provinceDropdown,
  citySelect,
  cityManualInput,
  cityFallbackTrigger,
  updateSummary,
  setManualCityMode
}) {

  if (
    !provinceInput ||
    !provinceDropdown
  ) {
    return;
  }


  provinceInput.addEventListener(
    "input",
    () => {

      const query =
        provinceInput.value.toLowerCase();

      const filtered =
        allProvinces.filter(
          (province) => {

            return province
              .toLowerCase()
              .includes(query);

          }
        );

      renderProvinceDropdown({
        list: filtered,
        provinceInput,
        provinceDropdown,
        citySelect,
        cityManualInput,
        cityFallbackTrigger,
        updateSummary,
        setManualCityMode
      });

    }
  );


  provinceInput.addEventListener(
    "focus",
    () => {

      renderProvinceDropdown({
        list: allProvinces,
        provinceInput,
        provinceDropdown,
        citySelect,
        cityManualInput,
        cityFallbackTrigger,
        updateSummary,
        setManualCityMode
      });

    }
  );


  document.addEventListener(
    "click",
    (event) => {

      const clickedOutside =
        !provinceDropdown.contains(
          event.target
        ) &&
        event.target !== provinceInput;

      if (clickedOutside) {
        provinceDropdown.style.display =
          "none";
      }

    }
  );

}


/* =========================
   PROVINCE DROPDOWN
========================= */

function renderProvinceDropdown({
  list,
  provinceInput,
  provinceDropdown,
  citySelect,
  cityManualInput,
  cityFallbackTrigger,
  updateSummary,
  setManualCityMode
}) {

  provinceDropdown.innerHTML = "";

  if (!list.length) {

    provinceDropdown.style.display =
      "none";

    return;
  }


  list.forEach((provinceName) => {

    const item =
      document.createElement("div");

    item.className =
      "dropdown-item";

    item.textContent =
      provinceName;


    item.addEventListener(
      "click",
      async () => {

        provinceInput.value =
          provinceName;

        provinceDropdown.style.display =
          "none";

        selectedProvince =
          provinceName;

        await handleProvinceSelection({
          province:
            provinceName,

          citySelect,
          cityManualInput,
          cityFallbackTrigger,
          updateSummary,
          setManualCityMode
        });

      }
    );

    provinceDropdown.appendChild(
      item
    );

  });

  provinceDropdown.style.display =
    "block";

}


/* =========================
   HANDLE PROVINCE
========================= */

async function handleProvinceSelection({
  province,
  citySelect,
  cityManualInput,
  cityFallbackTrigger,
  updateSummary,
  setManualCityMode
}) {

  const resolvedRegion =
    await findRegionByProvince(
      province
    );

  if (resolvedRegion) {
    selectedRegion =
      resolvedRegion;
  }


  const cities =
    await getCities(
      resolvedRegion,
      province
    );


  /* =========================
     RESET UI
  ========================= */

  if (cityFallbackTrigger) {
    cityFallbackTrigger.style.display =
      "none";
  }

  setManualCityMode(false);


  if (cityManualInput) {

    cityManualInput.style.display =
      "none";

    cityManualInput.value = "";

  }


  if (citySelect) {

    citySelect.style.display =
      "block";

    citySelect.innerHTML =
      `<option value="">Select City</option>`;

  }


  /* =========================
     NO CITIES
  ========================= */

  if (!cities.length) {

    if (citySelect) {
      citySelect.style.display =
        "none";
    }

    if (cityFallbackTrigger) {
      cityFallbackTrigger.style.display =
        "none";
    }

    if (cityManualInput) {
      cityManualInput.style.display =
        "block";
    }

    setManualCityMode(true);

    updateSummary();

    return;
  }


  /* =========================
     RENDER CITIES
  ========================= */

  cities.forEach((city) => {

    citySelect.innerHTML += `
      <option value="${city}">
        ${city}
      </option>
    `;

  });


  /* =========================
     FALLBACK OPTION
  ========================= */

  if (
    cityFallbackTrigger &&
    cities.length > 1
  ) {

    cityFallbackTrigger.style.display =
      "block";

  }


  /* =========================
     AUTO SELECT
  ========================= */

  if (cities.length === 1) {
    citySelect.value = cities[0];
  }

  updateSummary();

}


export {
  initProvinces,
  setupProvinceSearch,
  selectedProvince,
  selectedRegion
};