// ===============================
// 🧠 FILTER PRODUCTS (FINAL + BULLETPROOF)
// ===============================
export function filterProducts(products, {
  category,
  search,
  sort
}) {
  let result = Array.isArray(products) ? [...products] : [];

  // ===============================
  // 🧩 CATEGORY (SAFE)
  // ===============================
  if (category && category !== "all") {
    result = result.filter(p => {
      if (!p.category) return false;
      return p.category.toLowerCase() === category.toLowerCase();
    });
  }

  // ===============================
  // 🔍 SEARCH (SAFE)
  // ===============================
  if (search) {
    const term = search.toLowerCase();

    result = result.filter(p =>
      (p.name || "").toLowerCase().includes(term)
    );
  }

  // ===============================
  // 📦 NORMALIZE SIZES (IMPORTANT)
  // ===============================
  result = result.map(p => {
    // ✅ already array
    if (Array.isArray(p.sizes)) return p;

    // ✅ object → array
    if (p.sizes && typeof p.sizes === "object") {
      const normalizedSizes = Object.entries(p.sizes).map(([size, stock]) => ({
        size,
        stock: Number(stock) || 0
      }));

      return {
        ...p,
        sizes: normalizedSizes
      };
    }

    // ✅ no sizes → keep as empty array
    return {
      ...p,
      sizes: []
    };
  });

  // ===============================
  // 📦 AVAILABILITY (FIXED CORRECTLY)
  // ===============================
  result = result.filter(p => {
    // ✅ No sizes at all → allow
    if (!p.sizes) return true;

    // ✅ Empty sizes → allow (KEY FIX)
    if (Array.isArray(p.sizes) && p.sizes.length === 0) return true;

    // ✅ If sizes exist → check stock
    const hasStock = p.sizes.some(s => (s.stock || 0) > 0);

    // ⚠️ IMPORTANT:
    // If ALL sizes = 0 → STILL SHOW PRODUCT (UX decision)
    // You can disable later in PDP instead
    return hasStock || true;
  });

  // ===============================
  // 🔄 SORT (SAFE)
  // ===============================
  if (sort === "newest") {
    result.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
  }

  if (sort === "price-asc") {
    result.sort((a, b) => (a.price || 0) - (b.price || 0));
  }

  if (sort === "price-desc") {
    result.sort((a, b) => (b.price || 0) - (a.price || 0));
  }

  return result;
}