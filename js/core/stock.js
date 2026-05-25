import {
  getProductById,
  updateProductStock
} from "../services/productService.js";


// ==========================
// RESOLVE PRODUCT VARIANT
// ==========================
function resolveVariant(product, item) {

  const variants =
    Array.isArray(product.variants)
      ? product.variants
      : [];

  const hasSingleVariant =
    variants.length === 1;

  const matchedVariant =
    variants.find((v) =>

      String(v.name || "")
        .trim()
        .toLowerCase() ===

      String(item.color || "")
        .trim()
        .toLowerCase()

    );

  // ==========================
  // STRICT MATCH
  // ==========================
  if (matchedVariant) {
    return matchedVariant;
  }

  // ==========================
  // SAFE SINGLE VARIANT FALLBACK
  // ==========================
  if (hasSingleVariant) {
    return variants[0];
  }

  return null;

}


// ==========================
// SYNC CART WITH STOCK
// ==========================
export async function syncCartWithStock(cart) {

  const updatedCart = [];

  const changes = [];

  for (const item of cart) {

    try {

      const product =
        await getProductById(item.id);

      // ==========================
      // PRODUCT REMOVED
      // ==========================
      if (!product) {

        changes.push(
          `${item.name} was removed (no longer available)`
        );

        continue;

      }

      // ==========================
      // RESOLVE VARIANT
      // ==========================
      const variant =
        resolveVariant(product, item);

      if (!variant) {

        changes.push(
          `${item.name} variant is no longer available`
        );

        continue;

      }

      // ==========================
      // VALIDATE SIZES
      // ==========================
      const sizes =
        Array.isArray(variant.sizes)
          ? variant.sizes
          : [];

      if (!sizes.length) {

        changes.push(
          `${item.name} is out of stock`
        );

        continue;

      }

      // ==========================
      // MATCH SIZE
      // ==========================
      const sizeData =
        sizes.find((s) =>

          String(s.size)
            .trim()
            .toUpperCase() ===

          String(item.size)
            .trim()
            .toUpperCase()

        );

      // ==========================
      // INVALID SIZE
      // ==========================
      if (!sizeData) {

        changes.push(
          `${item.name} (${item.size}) was removed (invalid size)`
        );

        continue;

      }

      const stock =
        Number(sizeData.stock) || 0;

      // ==========================
      // OUT OF STOCK
      // ==========================
      if (stock <= 0) {

        changes.push(
          `${item.name} (${item.size}) is out of stock and was removed`
        );

        continue;

      }

      // ==========================
      // ADJUST QUANTITY
      // ==========================
      if (item.quantity > stock) {

        updatedCart.push({

          ...item,

          quantity: stock

        });

        changes.push(
          `${item.name} (${item.size}) quantity adjusted to ${stock}`
        );

      }

      // ==========================
      // VALID ITEM
      // ==========================
      else {

        updatedCart.push(item);

      }

    }

    catch (error) {

      console.error(
        "Stock sync error:",
        error
      );

      changes.push(
        `Failed to validate ${item.name}`
      );

    }

  }

  return {

    updatedCart,
    changes

  };

}


// ==========================
// DEDUCT STOCK
// ==========================
export async function deductStock(cart) {

  for (const item of cart) {

    const product =
      await getProductById(item.id);

    // ==========================
    // PRODUCT MISSING
    // ==========================
    if (!product) {

      throw new Error(
        `${item.name} no longer exists`
      );

    }

    // ==========================
    // RESOLVE VARIANT
    // ==========================
    const variant =
      resolveVariant(product, item);

    if (!variant) {

      throw new Error(
        `${item.name} variant no longer exists`
      );

    }

    // ==========================
    // VALIDATE SIZES
    // ==========================
    const sizes =
      Array.isArray(variant.sizes)
        ? variant.sizes
        : [];

    if (!sizes.length) {

      throw new Error(
        `${item.name} has no stock data`
      );

    }

    // ==========================
    // TRACK MATCHED SIZE
    // ==========================
    let matchedSize = false;

    // ==========================
    // UPDATE SIZES
    // ==========================
    const updatedSizes =
      sizes.map((s) => {

        const isMatch =

          String(s.size)
            .trim()
            .toUpperCase() ===

          String(item.size)
            .trim()
            .toUpperCase();

        if (!isMatch) {
          return s;
        }

        matchedSize = true;

        const currentStock =
          Number(s.stock) || 0;

        const newStock =
          currentStock - item.quantity;

        // ==========================
        // PREVENT NEGATIVE STOCK
        // ==========================
        if (newStock < 0) {

          throw new Error(
            `${item.name} stock changed, try again`
          );

        }

        return {

          ...s,

          stock: newStock

        };

      });

    // ==========================
    // INVALID SIZE
    // ==========================
    if (!matchedSize) {

      throw new Error(
        `${item.name} size no longer exists`
      );

    }

    // ==========================
    // UPDATE PRODUCT STOCK
    // ==========================
    await updateProductStock(

      item.id,

      variant.name,

      updatedSizes

    );

  }

}