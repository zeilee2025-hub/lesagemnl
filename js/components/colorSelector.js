// ===============================
//  COLOR SELECTOR
// ===============================

export function initColorSelector(
  variants,
  container,
  onSelect
) {

  if (!container || !variants?.length) return;

  container.innerHTML = "";

  variants.forEach((variant, index) => {

    const swatch =
      document.createElement("button");

    swatch.classList.add(
      "product-detail__color-swatch"
    );

    swatch.dataset.index = index;

    swatch.title = variant.color;

    swatch.style.background =
      variant.value || "#000";

    // WHITE SWATCH
    if (
      (variant.value || "").toLowerCase() === "#ffffff"
    ) {
      swatch.classList.add(
        "product-detail__color-swatch--light"
      );
    }

    // ACTIVE DEFAULT
    if (index === 0) {
      swatch.classList.add("active");
    }

    swatch.addEventListener("click", () => {

      container
        .querySelectorAll(
          ".product-detail__color-swatch"
        )
        .forEach(item => {
          item.classList.remove("active");
        });

      swatch.classList.add("active");

      onSelect(index);

    });

    container.appendChild(swatch);

  });

  // AUTO SELECT FIRST
  onSelect(0);

}