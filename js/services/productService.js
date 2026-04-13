// ===============================
// 🔌 FIREBASE
// ===============================
import { db } from "../core/firebase.js";

import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// ===============================
// 🧠 NORMALIZE SIZES
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
// 🧠 NORMALIZE PRODUCT (FINAL FIX)
// ===============================
function normalizeProduct(product) {
  console.log("🧠 NORMALIZING:", product.id);

  let variants = [];

  // ===============================
  // ✅ CASE 1: COLOR VARIANTS
  // ===============================
  if (Array.isArray(product.colors) && product.colors.length > 0) {

    variants = product.colors.map(color => {

      const sizes = normalizeSizes(
        (Array.isArray(color.sizes) && color.sizes.length > 0)
          ? color.sizes
          : product.sizes
      );

      return {
        name: color.name || "Default",

        // 🔥 ALWAYS ENSURE COLOR VALUE EXISTS
        value: color.value || "#000000",

        images: {
          front: color.images?.front || color.front || product.front || "",
          back: color.images?.back || color.back || product.back || "",
          model: color.images?.model || color.model || product.model || "",
          detail: color.images?.detail || color.detail || "",
          close: color.images?.close || color.close || ""
        },

        sizes: sizes.length ? sizes : [] // keep empty but controlled
      };
    });

  }

  // ===============================
  // ✅ CASE 2: SIMPLE PRODUCT
  // ===============================
  else if (Array.isArray(product.sizes) && product.sizes.length > 0) {

    variants = [
      {
        name: "Default",
        value: "#000000",

        images: {
          front: product.front || "",
          back: product.back || "",
          model: product.model || "",
          detail: product.detail || "",
          close: product.close || ""
        },

        sizes: normalizeSizes(product.sizes)
      }
    ];
  }

  // ===============================
  // 🔥 FAILSAFE (NEVER BREAK UI)
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

    // 🔥 KEEP ORIGINAL FOR COMPATIBILITY
    colors: Array.isArray(product.colors) ? product.colors : [],

    // 🔥 MAIN SYSTEM
    variants
  };
}


// ===============================
// 🛍️ REAL-TIME PRODUCTS LISTENER
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

      console.log("📦 PRODUCTS LOADED:", JSON.parse(JSON.stringify(products)));

      callback(products);
    },
    (error) => {
      console.error("❌ Product listener error:", error);
    }
  );
}


// ===============================
// 🔍 GET SINGLE PRODUCT
// ===============================
export async function getProductById(id) {
  try {
    const ref = doc(db, "products", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    return normalizeProduct({
      id: snap.id,
      ...snap.data()
    });
  } catch (error) {
    console.error("❌ getProductById error:", error);
    return null;
  }
}


// ===============================
// 📦 UPDATE PRODUCT STOCK
// ===============================
export async function updateProductStock(productId, updatedSizes) {
  try {
    if (!Array.isArray(updatedSizes)) {
      throw new Error("Invalid sizes data");
    }

    const ref = doc(db, "products", productId);

    await updateDoc(ref, {
      sizes: updatedSizes
    });

    console.log(`✅ Stock updated for product: ${productId}`);
  } catch (error) {
    console.error("❌ updateProductStock error:", error);
    throw error;
  }
}