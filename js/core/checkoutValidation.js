// ==========================
// VALIDATE CART BEFORE CHECKOUT
// ==========================

import { getProductById }
from "../services/productService.js";

export async function validateCartBeforeCheckout(cart) {

  const errors = [];

  // ===============================
  // GUARD
  // ===============================
  if (
    !cart ||
    !Array.isArray(cart) ||
    cart.length === 0
  ) {

    return {

      valid: false,

      errors: [
        "Cart is empty"
      ]

    };

  }

  // ===============================
  // VALIDATE EACH ITEM
  // ===============================
  for (const item of cart) {

    try {

      const product =
  await getProductById(
    item.id,
    {
      fresh: true
    }
  );

      // ===============================
      // SUPPORT BOTH:
      // variants OR colors
      // ===============================
      const variantsSource =

        Array.isArray(product?.variants)

          ? product.variants

          : Array.isArray(product?.colors)

            ? product.colors

            : [];

      // ===============================
      // PRODUCT INVALID
      // ===============================
      if (
        !product ||
        !variantsSource.length
      ) {

        errors.push(
          `${item.name} is no longer available`
        );

        continue;

      }

      // ===============================
      // FIND VARIANT
      // ===============================
      const variant =

        variantsSource.find((v) =>

          String(v.name || "")
            .trim()
            .toLowerCase() ===

          String(item.color || "")
            .trim()
            .toLowerCase()

        ) ||

        variantsSource[0];

      // ===============================
      // INVALID VARIANT
      // ===============================
      if (!variant) {

        errors.push(
          `${item.name} variant not found`
        );

        continue;

      }

      // ===============================
      // VALIDATE SIZES
      // ===============================
      const sizes =

        Array.isArray(variant.sizes)

          ? variant.sizes

          : [];

      if (!sizes.length) {

        errors.push(
          `${item.name} has no size data`
        );

        continue;

      }

      // ===============================
      // FIND SIZE
      // ===============================
      const sizeData =
        sizes.find((s) =>

          String(s.size)
            .trim()
            .toUpperCase() ===

          String(item.size)
            .trim()
            .toUpperCase()

        );

      // ===============================
      // INVALID SIZE
      // ===============================
      if (!sizeData) {

        errors.push(
          `${item.name} (${item.size}) is invalid`
        );

        continue;

      }

      // ===============================
      // STOCK CHECK
      // ===============================
      const stock =
        Number(sizeData.stock) || 0;

      if (stock <= 0) {

        errors.push(
          `${item.name} (${item.size}) is out of stock`
        );

        continue;

      }

      // ===============================
      // QUANTITY CHECK
      // ===============================
      if (item.quantity > stock) {

        errors.push(
          `${item.name} (${item.size}) only has ${stock} left`
        );

        continue;

      }

    }

    catch (error) {

      console.error(
        "Validation error:",
        error
      );

      errors.push(
        `Failed to validate ${item.name}`
      );

    }

  }

  // ===============================
  // RESULT
  // ===============================
  return {

    valid:
      errors.length === 0,

    errors

  };

}