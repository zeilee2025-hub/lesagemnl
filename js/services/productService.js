// ===============================
// 🔌 FIREBASE
// ===============================
import {
  auth,
  db
} from "../core/firebase.js";

import { API_BASE_URL }
from "./config/api.js";

import {
  collection,
  onSnapshot,
  doc,
  getDoc
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
  throw new Error(
    "Direct client stock writes are disabled"
  );
}

// ===============================
// UPDATE PRODUCT DETAILS
// ===============================
export async function updateProductDetails(
  productId,
  updates
) {

  try {

    if (!productId) {
      throw new Error(
        "Product ID is required"
      );
    }

    if (
      !updates ||
      typeof updates !== "object" ||
      Array.isArray(updates)
    ) {
      throw new Error(
        "Updates must be an object"
      );
    }

    const allowedFields = [
      "name",
      "price",
      "description"
    ];

    const updateKeys =
      Object.keys(updates);

    const unsupportedFields =
      updateKeys.filter(key => {
        return !allowedFields.includes(key);
      });

    if (unsupportedFields.length) {
      throw new Error(
        `Unsupported product fields: ${unsupportedFields.join(", ")}`
      );
    }

    if (!updateKeys.length) {
      throw new Error(
        "No allowed product fields to update"
      );
    }

    const user =
      auth.currentUser;

    if (!user) {
      throw new Error(
        "Admin not authenticated"
      );
    }

    const token =
      await user.getIdToken();

    const response =
      await fetch(
        `${API_BASE_URL}/admin/update-product`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`
          },
          body: JSON.stringify({
            productId,
            updates
          })
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
        "Failed to update product"
      );
    }

    productCache.delete(productId);

    sessionStorage.removeItem(
      `product-${productId}`
    );

    return data;

  } catch (error) {

    console.error(
      "updateProductDetails error:",
      error
    );

    throw error;
  }

}

async function getAdminToken() {

  const user =
    auth.currentUser;

  if (!user) {
    throw new Error(
      "Admin not authenticated"
    );
  }

  return user.getIdToken();

}

async function parseApiResponse(
  response,
  fallbackMessage
) {

  const data =
    await response.json()
      .catch(() => {
        return {};
      });

  if (!response.ok) {
    throw new Error(
      data?.error ||
      fallbackMessage
    );
  }

  return data;

}

export async function adjustProductStock(
  adjustment
) {

  const token =
    await getAdminToken();

  const allowedPayload = {
    productId:
      adjustment.productId,
    branchType:
      adjustment.branchType,
    size:
      adjustment.size,
    delta:
      adjustment.delta,
    reason:
      adjustment.reason
  };

  if (adjustment.branchType !== "sizes") {
    allowedPayload.branchName =
      adjustment.branchName;
  }

  if (adjustment.note) {
    allowedPayload.note =
      adjustment.note;
  }

  const response =
    await fetch(
      `${API_BASE_URL}/admin/adjust-stock`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${token}`
        },
        body:
          JSON.stringify(allowedPayload)
      }
    );

  return parseApiResponse(
    response,
    "Failed to adjust stock"
  );

}

export async function getInventoryAdjustments(
  limit = 50
) {

  const token =
    await getAdminToken();

  const safeLimit =
    Math.min(
      Math.max(
        Number.parseInt(limit, 10) || 50,
        1
      ),
      100
    );

  const response =
    await fetch(
      `${API_BASE_URL}/admin/inventory-adjustments?limit=${safeLimit}`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  return parseApiResponse(
    response,
    "Failed to load inventory adjustments"
  );

}


// ===============================
// ATOMIC STOCK DEDUCTION
// ===============================
export async function deductStockTransaction(cart) {
  throw new Error(
    "Direct client stock deduction is disabled"
  );
}
