// ===============================
// LOOKBOOK ITEM (HTML ONLY)
// ===============================

export function createLookbookItem(pair) {
  const img1 = pair[0] || "";
  const img2 = pair[1] || "";

  return `
    <div class="lookbook-slide">
      <div class="lookbook-image">
        <img src="${img1}" alt="lookbook" />
      </div>
      <div class="lookbook-image">
        <img src="${img2}" alt="lookbook" />
      </div>
    </div>
  `;
}