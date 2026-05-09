// ===============================
//  PRODUCT SIZE SELECTOR (BEM SYSTEM)
// ===============================

let globalSelectedSize = null;

export function initSizeSelector(sizes, elements, onSelect) {
  const { sizeContainer, addBtn } = elements;

  let selectedSize = null;

  //  Reset
  globalSelectedSize = null;
  sizeContainer.innerHTML = "";

  //  Ensure correct container class
  sizeContainer.classList.add("product-size__options");

  if (!sizes || !sizes.length) return;

  if (addBtn) addBtn.disabled = true;

  // ===============================
  //  ONE SIZE MODE
  // ===============================
  const isOneSize = sizes.length === 1;

  if (isOneSize) {
    const item = sizes[0];

    const sizeRaw = typeof item === "string" ? item : item.size;
    const stock = typeof item === "string" ? 0 : item.stock;

    const size = String(sizeRaw).trim().toUpperCase();

    const btn = document.createElement("button");
    btn.classList.add(
  "product-size__option",
  "product-size__option--active",
  "product-size__option--auto"
);

    btn.textContent = "ONE SIZE";
    btn.setAttribute("data-size", size);

    const isOutOfStock = stock <= 0;

    if (isOutOfStock) {
      btn.classList.add("product-size__option--disabled");
      btn.setAttribute("aria-disabled", "true");

      if (addBtn) addBtn.disabled = true;
    } else {
      selectedSize = size;
      globalSelectedSize = size;

      if (addBtn) addBtn.disabled = false;

      if (onSelect) onSelect(size);
    }

    sizeContainer.appendChild(btn);
    return;
  }

  // ===============================
  //  MULTI SIZE MODE
  // ===============================
  sizes.forEach(item => {
    const btn = document.createElement("button");
    btn.classList.add("product-size__option");

    const sizeRaw = typeof item === "string" ? item : item.size;
    const stock = typeof item === "string" ? 0 : item.stock;

    const size = String(sizeRaw).trim().toUpperCase();

    btn.textContent = size;
    btn.setAttribute("data-size", size);

    const isOutOfStock = stock <= 0;

    if (isOutOfStock) {
      btn.classList.add("product-size__option--disabled");
      btn.setAttribute("aria-disabled", "true");
    }

    btn.addEventListener("click", () => {
      if (isOutOfStock) return;

      //  remove active
      sizeContainer.querySelectorAll(".product-size__option").forEach(b => {
  b.classList.remove("product-size__option--active");
});

      //  set active
      btn.classList.add("product-size__option--active");

      selectedSize = size;
      globalSelectedSize = size;

      if (addBtn) addBtn.disabled = false;

      if (onSelect) onSelect(selectedSize);
    });

    sizeContainer.appendChild(btn);
  });
}


// ===============================
// GLOBAL ACCESS
// ===============================
export function getSelectedSize() {
  return globalSelectedSize;
}