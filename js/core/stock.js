import { getProductById, updateProductStock } from "../services/productService.js";


// ==========================
// 🔄 SYNC CART WITH STOCK (FIXED ✅)
// ==========================
export async function syncCartWithStock(cart) {
  const updatedCart = [];
  const changes = [];

  for (const item of cart) {
    try {
      const product = await getProductById(item.id);

      // ❌ Product missing
      if (!product) {
        changes.push(`${item.name} was removed (no longer available)`);
        continue;
      }

      // ✅ FIND MATCHING VARIANT (SAFE NORMALIZATION)
      const variant =
        product.variants?.find(v =>
          (v.name || "").toLowerCase().trim() ===
          (item.color || "").toLowerCase().trim()
        ) ||
        product.variants?.[0];

      if (!variant) {
        changes.push(`${item.name} has invalid variant`);
        continue;
      }

      const sizes = Array.isArray(variant.sizes) ? variant.sizes : [];

      // ❌ No sizes
      if (!sizes.length) {
        changes.push(`${item.name} is out of stock`);
        continue;
      }

      // ✅ MATCH SIZE (SAFE)
      const sizeData = sizes.find(
        (s) =>
          String(s.size).trim().toUpperCase() ===
          String(item.size).trim().toUpperCase()
      );

      // ❌ Invalid size
      if (!sizeData) {
        changes.push(`${item.name} (${item.size}) was removed (invalid size)`);
        continue;
      }

      const stock = Number(sizeData.stock) || 0;

      // ❌ Out of stock
      if (stock <= 0) {
        changes.push(`${item.name} (${item.size}) is out of stock and was removed`);
        continue;
      }

      // ⚠️ Adjust quantity safely
      if (item.quantity > stock) {
        updatedCart.push({
          ...item,
          quantity: stock
        });

        changes.push(
          `${item.name} (${item.size}) quantity adjusted to ${stock}`
        );
      } else {
        updatedCart.push(item);
      }

    } catch (error) {
      console.error("Stock sync error:", error);
      changes.push(`Failed to validate ${item.name}`);
    }
  }

  return {
    updatedCart,
    changes
  };
}


// ==========================
// 🔥 DEDUCT STOCK (FIXED ✅)
// ==========================
export async function deductStock(cart) {
  for (const item of cart) {
    const product = await getProductById(item.id);

    if (!product) {
      throw new Error(`${item.name} no longer exists`);
    }

    // ✅ FIND VARIANT
    const variant =
      product.variants?.find(v =>
        (v.name || "").toLowerCase().trim() ===
        (item.color || "").toLowerCase().trim()
      ) ||
      product.variants?.[0];

    if (!variant) {
      throw new Error(`${item.name} has invalid variant`);
    }

    const sizes = Array.isArray(variant.sizes) ? variant.sizes : [];

    if (!sizes.length) {
      throw new Error(`${item.name} has no stock data`);
    }

    // ✅ UPDATE SIZES INSIDE VARIANT
    const updatedSizes = sizes.map((s) => {
      if (
        String(s.size).trim().toUpperCase() ===
        String(item.size).trim().toUpperCase()
      ) {
        const newStock = (Number(s.stock) || 0) - item.quantity;

        if (newStock < 0) {
          throw new Error(`${item.name} stock changed, try again`);
        }

        return {
          ...s,
          stock: newStock
        };
      }

      return s;
    });

    // ⚠️ IMPORTANT:
    // Your DB currently expects root "sizes"
    // (we keep compatibility to avoid breaking your backend)
    await updateProductStock(item.id, updatedSizes);
  }
}