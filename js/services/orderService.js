// ==========================
// 🔌 FIREBASE (READ ONLY NOW)
// ==========================
import { db } from "../core/firebase.js";

import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ==========================
// 🆔 ORDER ID GENERATOR (NEW)
// ==========================
function generateOrderId() {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `LSM-${random}`;
}

// ==========================
// ✅ SAVE ORDER (NOW VIA BACKEND)
// ==========================
export async function saveOrder(order) {
  try {
    if (!order || !order.items?.length) {
      throw new Error("Invalid order data");
    }

    const orderData = {
      email: order.email || null,
      items: order.items,

      // 💰 PRICING
      subtotal: order.subtotal || 0,
      shippingFee: order.shippingFee || 0,
      total: order.total || 0,

      // 📦 STATUS
      status: "pending",
      paymentStatus: "PENDING",
      orderState: "PENDING_PAYMENT",
      paymentMethod: order.paymentMethod || "UNKNOWN",

      // 👤 CUSTOMER
      firstName: order.firstName || "",
      lastName: order.lastName || "",
      phone: order.phone || "",

      // 📍 ADDRESS
      address: order.address || "",
      city: order.city || "",
      province: order.province || ""
    };

    console.log("🔥 Sending order to backend:", orderData);

    // ✅ GENERATE CLEAN ORDER ID
    const orderId = generateOrderId();

    // ==========================
    // 🚀 SEND TO BACKEND
    // ==========================
    const res = await fetch("http://localhost:3000/create-manual-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        order: {
          id: orderId,
          ...orderData
        }
      })
    });

    if (!res.ok) {
      throw new Error("Failed to create order in backend");
    }

    console.log("✅ Order successfully created via backend:", orderId);

    return orderId;

  } catch (error) {
    console.error("❌ SAVE ORDER ERROR:", error);
    throw error;
  }
}

// ==========================
// 📦 GET ALL ORDERS (ADMIN)
// ==========================
export async function getOrders() {
  try {
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error("❌ FETCH ORDERS ERROR:", error);
    throw error;
  }
}

// ==========================
// 📧 GET ORDERS BY EMAIL
// ==========================
export async function getOrdersByEmail(email) {
  try {
    if (!email) return [];

    const q = query(
      collection(db, "orders"),
      where("email", "==", email),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error("❌ FETCH EMAIL ORDERS ERROR:", error);
    return [];
  }
}

// ==========================
// 🔍 GET SINGLE ORDER
// ==========================
export async function getOrderById(orderId) {
  try {
    if (!orderId) throw new Error("Missing orderId");

    const orderRef = doc(db, "orders", orderId);
    const snapshot = await getDoc(orderRef);

    if (!snapshot.exists()) {
      throw new Error("Order not found");
    }

    return {
      id: snapshot.id,
      ...snapshot.data()
    };

  } catch (error) {
    console.error("❌ GET ORDER ERROR:", error);
    throw error;
  }
}

// ==========================
// 🔄 UPDATE ORDER (FLEXIBLE)
// ==========================
export async function updateOrderStatus(orderId, updates) {
  try {
    if (!orderId) throw new Error("Missing orderId");
    if (!updates || typeof updates !== "object") {
      throw new Error("Updates must be an object");
    }

    const orderRef = doc(db, "orders", orderId);

    await updateDoc(orderRef, updates);

    console.log(`✅ Order ${orderId} updated →`, updates);

  } catch (error) {
    console.error("❌ UPDATE ORDER ERROR:", error);
    throw error;
  }
}

export async function updateOrderProof(orderId, proofUrl) {
  try {
    const ref = doc(db, "orders", orderId);

    await updateDoc(ref, {
      proofUrl,
      paymentStatus: "PENDING",
      status: "pending",
      orderState: "PROOF_UPLOADED"
    });

    console.log("✅ Proof uploaded & saved");

  } catch (error) {
    console.error("❌ Failed to save proof:", error);
    throw error;
  }
}