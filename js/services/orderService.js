// ==========================
// 📦 ORDER SERVICE (CLEAN - GUEST)
// ==========================

// ==========================
// 🔌 FIREBASE
// ==========================
import { db } from "../core/firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ==========================
// ✅ SAVE ORDER (GUEST)
// ==========================
export async function saveOrder(order) {
  try {
    // ✅ Only require items (email is optional now)
    if (!order || !order.items?.length) {
      throw new Error("Invalid order data");
    }

    const orderData = {
      email: order.email || null, // ✅ optional
      items: order.items,
      total: order.total || 0,
      status: order.status || "pending",
      createdAt: new Date().toISOString()
    };

    console.log("🔥 Saving order:", orderData);

    const docRef = await addDoc(collection(db, "orders"), orderData);

    console.log("✅ Order saved:", docRef.id);

    return docRef.id;

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
// 📧 GET ORDERS BY EMAIL (OPTIONAL FEATURE)
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
// 🔄 UPDATE ORDER STATUS (ADMIN)
// ==========================
export async function updateOrderStatus(orderId, newStatus) {
  try {
    if (!orderId) throw new Error("Missing orderId");

    const orderRef = doc(db, "orders", orderId);

    await updateDoc(orderRef, {
      status: newStatus
    });

    console.log(`✅ Order ${orderId} updated → ${newStatus}`);

  } catch (error) {
    console.error("❌ UPDATE STATUS ERROR:", error);
    throw error;
  }
}