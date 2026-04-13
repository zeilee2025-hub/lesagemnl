// ===============================
// 📏 SIZE SELECTOR COMPONENT (FINAL CLEAN)
// ===============================

// ✅ Optional global access (future-proof)
let globalSelectedSize = null;

export function initSizeSelector(sizes, elements, onSelect) {
  const { sizeContainer, addBtn } = elements;

  let selectedSize = null;

  // 🧹 Clear container
  sizeContainer.innerHTML = "";
  sizeContainer.classList.add("qa-sizes");

  // 🚫 Guard
  if (!sizes || !sizes.length) return;

  // 🔒 Disable add-to-cart initially
  if (addBtn) addBtn.disabled = true;

  sizes.forEach(item => {
    const btn = document.createElement("button");
    btn.classList.add("qa-size");

    // 🧠 Normalize data
    const sizeRaw = typeof item === "string" ? item : item.size;
    const stock = typeof item === "string" ? 0 : item.stock;

    const size = String(sizeRaw).trim().toUpperCase();

    btn.textContent = size;
    btn.setAttribute("data-size", size);

    const isOutOfStock = stock <= 0;

    // 🚫 Out-of-stock state (VISIBLE but not selectable)
    if (isOutOfStock) {
      btn.classList.add("qa-size--disabled");
      btn.setAttribute("aria-disabled", "true");

      // ❌ REMOVE HARD DISABLE (this was hiding them visually)
      // btn.disabled = true;
    }

    // 🎯 Click handler
    btn.addEventListener("click", () => {
      if (isOutOfStock) return;

      // ❌ Remove active from all
      sizeContainer.querySelectorAll(".qa-size").forEach(b => {
        b.classList.remove("active");
      });

      // ✅ Set active
      btn.classList.add("active");

      selectedSize = size;
      globalSelectedSize = size;

      // 🔓 Enable add-to-cart
      if (addBtn) addBtn.disabled = false;

      // 📤 Send to parent
      if (onSelect) onSelect(selectedSize);
    });

    sizeContainer.appendChild(btn);
  });
}

// ===============================
// 🌐 OPTIONAL GLOBAL ACCESS
// ===============================
export function getSelectedSize() {
  return globalSelectedSize;
}