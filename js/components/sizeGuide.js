// ==========================
// 📏 SIZE GUIDE COMPONENT
// ==========================

export function renderSizeGuide(type, selectedSize) {
  const data = getSizeData(type);

  // ❌ NO DATA
  if (!data) {
    return `
      <div class="size-guide__empty">
        <p>Size guide not available for this product.</p>
      </div>
    `;
  }

  return `
    <div class="size-guide__content">
      
      <h2 class="size-guide__title">SIZE GUIDE</h2>
      <p class="size-guide__unit">All measurements in inches</p>

      <table class="size-guide__table">
        
        <thead>
          <tr>
            ${data.headers.map(header => `<th>${header}</th>`).join("")}
          </tr>
        </thead>

        <tbody>
          ${data.rows
            .map(row => {
              const isActive =
                String(row[0]).trim().toUpperCase() ===
                String(selectedSize || "").trim().toUpperCase();

              return `
                <tr class="${isActive ? "active" : ""}">
                  ${row.map(cell => `<td>${cell}</td>`).join("")}
                </tr>
              `;
            })
            .join("")}
        </tbody>

      </table>

    </div>
  `;
}

// ==========================
// 📊 SIZE DATA (FINAL FIXED)
// ==========================

function getSizeData(type) {
  // ✅ SAFETY NORMALIZATION (VERY IMPORTANT)
  const t = String(type || "")
    .trim()
    .toLowerCase();

  // 🔍 DEBUG (you can remove later)
  console.log("SIZE GUIDE TYPE:", t);

  if (!t) return null;

  // 🧥 HOODIE
  if (t === "hoodie") {
    return {
      headers: ["Size", "Length", "Width", "Sleeve", "Shoulder"],
      rows: [
        ["S", 27, 24.5, 18, 8.5],
        ["M", 28, 25.5, 19, 9],
        ["L", 29, 26.5, 20, 9.5],
        ["XL", 30, 27.5, 21, 10],
        ["XXL", 31, 28.5, 22, 10.5],
      ],
    };
  }

  // 👕 TEE
  if (t === "tee") {
    return {
      headers: ["Size", "Length", "Width", "Sleeve"],
      rows: [
        ["S", 28, 23, 10],
        ["M", 29, 24, 10.5],
        ["L", 30, 25, 11],
        ["XL", 31, 26, 11.5],
      ],
    };
  }

  // 💪 MUSCLE
  if (t === "muscle") {
    return {
      headers: ["Size", "Length", "Width"],
      rows: [
        ["S", 24.2, 15],
        ["M", 26.2, 15.2],
        ["L", 27.3, 19],
      ],
    };
  }

  // 🧥 SWEATSHIRT
  if (t === "sweatshirt") {
    return {
      headers: ["Size", "Length", "Width"],
      rows: [
        ["S", 22, 24],
        ["M", 23, 25],
        ["L", 24, 26],
        ["XL", 28, 27],
      ],
    };
  }

  // 🧢 ACCESSORY
  if (t === "accessory") {
    return {
      headers: ["Size", "Description"],
      rows: [["OS", "One Size Fits Most"]],
    };
  }

  // 🚫 DEFAULT
  return null;
}