// ===============================
// 🎨 COLOR SELECTOR
// ===============================
export function initColorSelector(variants, container, onSelect) {
  if (!container || !variants?.length) return;

  container.innerHTML = "";

  variants.forEach((variant, index) => {
    const swatch = document.createElement("button");

    swatch.className = "color-swatch";
    swatch.dataset.index = index;
    swatch.title = variant.color;

    swatch.style.background = variant.value || "#000";

    if ((variant.value || "").toLowerCase() === "#ffffff") {
      swatch.style.border = "1px solid #ccc";
    }

    if (index === 0) swatch.classList.add("active");

    swatch.addEventListener("click", () => {
      container.querySelectorAll(".color-swatch").forEach(s =>
        s.classList.remove("active")
      );

      swatch.classList.add("active");

      onSelect(index);
    });

    container.appendChild(swatch);
  });

  // 🔥 AUTO SELECT FIRST
  onSelect(0);
}