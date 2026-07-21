// ===============================
// 🔌 FIREBASE
// ===============================
import { db } from "../core/firebase.js";

import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===============================
// PRODUCT CACHE
// ===============================
const productCache = new Map();

let productsCache = null;


// ===============================
//  NORMALIZE SIZES
// ===============================
function normalizeSizes(sizes) {
  if (!Array.isArray(sizes)) return [];

  return sizes.map(s =>
    typeof s === "string"
      ? { size: s, stock: 0 }
      : s
  );
}


// ===============================
//  NORMALIZE PRODUCT (FINAL)
// ===============================
function normalizeProduct(product) {

  let variants = [];

  // ===============================
  //  CASE 1: COLOR VARIANTS
  // ===============================
  if (Array.isArray(product.colors) && product.colors.length > 0) {

    variants = product.colors.map(color => {

      const sizes = normalizeSizes(
  Array.isArray(color.sizes)
    ? color.sizes
    : []
);

      return {
        name: color.name || "Default",

        //  ALWAYS ENSURE COLOR VALUE EXISTS
        value: color.value || "#000000",

        images: {
          front:
            color.images?.front ||
            color.front ||
            product.images?.front ||
            product.front ||
            "",

          back:
            color.images?.back ||
            color.back ||
            product.images?.back ||
            product.back ||
            "",

          model:
            color.images?.model ||
            color.model ||
            product.images?.model || //  FIX
            product.model ||
            "",

          detail:
            color.images?.detail ||
            color.detail ||
            product.images?.detail ||
            product.detail ||
            "",

          close:
            color.images?.close ||
            color.close ||
            product.images?.close ||
            product.close ||
            ""
        },

        sizes: sizes.length ? sizes : []
      };
    });

  }

  // ===============================
  //  CASE 2: SIMPLE PRODUCT
  // ===============================
  else if (Array.isArray(product.sizes) && product.sizes.length > 0) {

    variants = [
      {
        name: "Default",
        value: "#000000",

        images: {
          front:
            product.images?.front ||
            product.front ||
            "",

          back:
            product.images?.back ||
            product.back ||
            "",

          model:
            product.images?.model || //  FIX
            product.model ||
            "",

          detail:
            product.images?.detail ||
            product.detail ||
            "",

          close:
            product.images?.close ||
            product.close ||
            ""
        },

        sizes: normalizeSizes(product.sizes)
      }
    ];
  }

  // ===============================
// FAILSAFE (NEVER BREAK UI)
// ===============================
else {
  variants = [
    {
      name: "Default",
      value: "#000000",
      images: {
        front: "",
        back: "",
        model: "",
        detail: "",
        close: ""
      },
      sizes: []
    }
  ];
}

return {
  ...product,

  hasModel: product.hasModel === true,

  // KEEP ORIGINAL FOR COMPATIBILITY
  colors: Array.isArray(product.colors)
    ? product.colors
    : [],

  // MAIN SYSTEM
  variants
};
}


// ===============================
// REAL-TIME PRODUCTS LISTENER
// ===============================
export function listenToProducts(callback) {
  const colRef = collection(db, "products");

  return onSnapshot(
    colRef,
    (snapshot) => {
      const products = snapshot.docs.map((docSnap) =>
        normalizeProduct({
          id: docSnap.id,
          ...docSnap.data()
        })
      );

      console.log(
        "PRODUCTS LOADED:",
        JSON.parse(JSON.stringify(products))
      );

      callback(products);
    },
    (error) => {
      console.error(
        "Product listener error:",
        error
      );
    }
  );
}

// ===============================
// GET SINGLE PRODUCT
// ===============================
export async function getProductById(
  id,
  options = {}
) {

  const {
    fresh = false
  } = options;

  try {

    // ===============================
    // MEMORY CACHE
    // ===============================
    if (

  !fresh &&

  productCache.has(id)

) {

  return productCache.get(id);

}

    // ===============================
    // SESSION CACHE
    // ===============================
    const sessionKey =
      `product-${id}`;

    const cached =
  sessionStorage.getItem(sessionKey);

if (

  !fresh &&

  cached

) {

  const parsed =
    JSON.parse(cached);

  productCache.set(id, parsed);

  return parsed;

}

    // ===============================
    // FIRESTORE FETCH
    // ===============================
    const ref = doc(
      db,
      "products",
      id
    );

    const snap =
      await getDoc(ref);

    if (!snap.exists()) {
      return null;
    }

    const normalized =
      normalizeProduct({
        id: snap.id,
        ...snap.data()
      });

    // ===============================
    // SAVE CACHE
    // ===============================
    productCache.set(
      id,
      normalized
    );

    sessionStorage.setItem(
      sessionKey,
      JSON.stringify(normalized)
    );

    return normalized;

  } catch (error) {

    console.error(
      "getProductById error:",
      error
    );

    return null;
  }
}


// ===============================
// UPDATE PRODUCT STOCK
// ===============================
export async function updateProductStock(
  productId,
  variantName,
  updatedSizes
) {

  try {

    if (!Array.isArray(updatedSizes)) {
      throw new Error(
        "Invalid sizes data"
      );
    }

    const ref = doc(
      db,
      "products",
      productId
    );

    // ===============================
    // GET CURRENT PRODUCT
    // ===============================
    const snap =
      await getDoc(ref);

    if (!snap.exists()) {
      throw new Error(
        "Product not found"
      );
    }

    const data =
      snap.data();

    const colors =
      Array.isArray(data.colors)
        ? [...data.colors]
        : [];

    // ===============================
    // FIND TARGET VARIANT
    // ===============================
    const variantIndex =
      colors.findIndex(
        (variant) =>
          String(variant.name)
            .trim()
            .toLowerCase() ===
          String(variantName)
            .trim()
            .toLowerCase()
      );

    if (variantIndex === -1) {
      throw new Error(
        "Variant not found"
      );
    }

    // ===============================
    // UPDATE TARGET VARIANT
    // ===============================
    colors[variantIndex] = {
      ...colors[variantIndex],
      sizes: updatedSizes
    };

    // ===============================
    // WRITE UPDATED COLORS
    // ===============================
    await updateDoc(ref, {
      colors
    });

    console.log(
      `Variant stock updated: ${productId}`
    );

  } catch (error) {

    console.error(
      "updateProductStock error:",
      error
    );

    throw error;
  }
}


// ===============================
// ATOMIC STOCK DEDUCTION
// ===============================
export async function deductStockTransaction(cart) {

  try {

    await runTransaction(
      db,
      async (transaction) => {

        for (const item of cart) {

          // ===============================
          // PRODUCT REF
          // ===============================
          const productRef = doc(
            db,
            "products",
            item.id
          );

          // ===============================
          // FETCH LATEST SNAPSHOT
          // ===============================
          const snap =
            await transaction.get(productRef);

          if (!snap.exists()) {
            throw new Error(
              `${item.name} no longer exists`
            );
          }

          const product =
            snap.data();

          // ===============================
          // VALIDATE COLORS
          // ===============================
          const colors =
            Array.isArray(product.colors)
              ? [...product.colors]
              : [];

          // ===============================
          // FIND VARIANT
          // ===============================
          const variantIndex =
            colors.findIndex(
              (variant) =>
                String(variant.name)
                  .trim()
                  .toLowerCase() ===
                String(item.color)
                  .trim()
                  .toLowerCase()
            );

          if (variantIndex === -1) {
            throw new Error(
              `${item.name} variant unavailable`
            );
          }

          const variant =
            colors[variantIndex];

          // ===============================
          // VALIDATE SIZES
          // ===============================
          const sizes =
            Array.isArray(variant.sizes)
              ? [...variant.sizes]
              : [];

          const sizeIndex =
            sizes.findIndex(
              (size) =>
                String(size.size)
                  .trim()
                  .toUpperCase() ===
                String(item.size)
                  .trim()
                  .toUpperCase()
            );

          if (sizeIndex === -1) {
            throw new Error(
              `${item.name} size unavailable`
            );
          }

          const sizeData =
            sizes[sizeIndex];

          const currentStock =
            Number(sizeData.stock) || 0;

          // ===============================
          // REVALIDATE STOCK
          // ===============================
          if (currentStock <= 0) {
            throw new Error(
              `${item.name} is sold out`
            );
          }

          if (item.quantity > currentStock) {
            throw new Error(
              `${item.name} only has ${currentStock} left`
            );
          }

          // ===============================
          // DEDUCT STOCK
          // ===============================
          sizes[sizeIndex] = {
            ...sizeData,
            stock:
              currentStock - item.quantity
          };

          // ===============================
          // UPDATE VARIANT
          // ===============================
          colors[variantIndex] = {
            ...variant,
            sizes
          };

          // ===============================
          // ATOMIC WRITE
          // ===============================
          transaction.update(
            productRef,
            { colors }
          );

        }

      }
    );

    console.log(
      "Atomic stock deduction success"
    );

  } catch (error) {

    console.error(
      "deductStockTransaction error:",
      error
    );

    throw error;
  }
}