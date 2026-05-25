// ==========================
// VALIDATE ADD TO CART
// ==========================
export function validateAddToCart(
  product,
  selectedSize,
  currentCart
) {

  // ==========================
  // NO SIZE SELECTED
  // ==========================
  if (!selectedSize) {

    return {
      valid: false,
      message: "Please select a size"
    };

  }

  // ==========================
  // RESOLVE VARIANT SIZES
  // ==========================
  const variantsSource =

  Array.isArray(product?.variants)

    ? product.variants

    : Array.isArray(product?.colors)

      ? product.colors

      : [];

const sizes =

  product.selectedVariant?.sizes ||

  variantsSource[0]?.sizes ||

  [];

  // ==========================
  // NO SIZE DATA
  // ==========================
  if (!sizes.length) {

    return {
      valid: false,
      message: "Product has no size data"
    };

  }

  // ==========================
  // FIND SELECTED SIZE
  // ==========================
  const sizeData = sizes.find(

    (s) =>

      String(s.size)
        .trim()
        .toUpperCase() ===

      String(selectedSize)
        .trim()
        .toUpperCase()

  );

  // ==========================
  // INVALID SIZE
  // ==========================
  if (!sizeData) {

    return {
      valid: false,
      message: "Invalid size selected"
    };

  }

  // ==========================
  // OUT OF STOCK
  // ==========================
  if ((sizeData.stock || 0) <= 0) {

    return {
      valid: false,
      message: "This size is out of stock"
    };

  }

  // ==========================
  // MATCH EXISTING CART ITEM
  // ==========================
  const existingItem = currentCart.find(

    (item) =>

      item.id === product.id &&

      String(item.size)
        .trim()
        .toUpperCase() ===

      String(selectedSize)
        .trim()
        .toUpperCase() &&

      String(item.color || "")
        .trim()
        .toLowerCase() ===

      String(product.selectedVariant?.name || "")
        .trim()
        .toLowerCase()

  );

  const currentQty =

    existingItem?.quantity || 0;

  // ==========================
  // EXCEEDS STOCK
  // ==========================
  if (

    currentQty + 1 >

    Number(sizeData.stock || 0)

  ) {

    return {

      valid: false,

      message:
        `Only ${sizeData.stock} item(s) available`

    };

  }

  // ==========================
  // VALID
  // ==========================
  return {
    valid: true
  };

}


// ==========================
// VALIDATE QUANTITY UPDATE
// ==========================
export function validateQuantityUpdate(
  product,
  size,
  newQty
) {

  // ==========================
  // RESOLVE VARIANT SIZES
  // ==========================
  const variantsSource =

  Array.isArray(product?.variants)

    ? product.variants

    : Array.isArray(product?.colors)

      ? product.colors

      : [];

const sizes =

  product.selectedVariant?.sizes ||

  variantsSource[0]?.sizes ||

  [];

  // ==========================
  // INVALID PRODUCT
  // ==========================
  if (!product || !sizes.length) {

    return {

      valid: false,

      message: "Invalid product data"

    };

  }

  // ==========================
  // FIND SIZE
  // ==========================
  const sizeData = sizes.find(

    (s) =>

      String(s.size)
        .trim()
        .toUpperCase() ===

      String(size)
        .trim()
        .toUpperCase()

  );

  // ==========================
  // INVALID SIZE
  // ==========================
  if (!sizeData) {

    return {

      valid: false,

      message: "Invalid size"

    };

  }

  // ==========================
  // OUT OF STOCK
  // ==========================
  if ((sizeData.stock || 0) <= 0) {

    return {

      valid: false,

      message: "Out of stock"

    };

  }

  // ==========================
  // EXCEEDS STOCK
  // ==========================
  if (

    newQty >

    Number(sizeData.stock || 0)

  ) {

    return {

      valid: false,

      message:
        `Only ${sizeData.stock} available`

    };

  }

  // ==========================
  // VALID
  // ==========================
  return {
    valid: true
  };

}