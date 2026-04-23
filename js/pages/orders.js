// ==========================
// 📦 ORDERS PAGE LOGIC (FIXED)
// ==========================

import { getOrdersByEmail } from "../services/orderService.js";
import { renderOrderCard } from "../components/orderCard.js";

const container = document.getElementById("orders-container");

// ==========================
// 🚀 INIT
// ==========================
async function initOrders() {
  if (!container) {
    console.error("❌ orders-container not found");
    return;
  }

  try {
    // ==========================
    // 📧 GET EMAIL
    // ==========================
    const email = localStorage.getItem("customerEmail");

    console.log("Customer Email:", email);

    if (!email) {
      container.innerHTML = "<p>No orders found. (No email detected)</p>";
      return;
    }

    // ==========================
    // 📦 FETCH ORDERS
    // ==========================
    let orders = await getOrdersByEmail(email);

    if (!Array.isArray(orders) || orders.length === 0) {
      container.innerHTML = "<p>No orders yet.</p>";
      return;
    }

    // ==========================
    // 🔽 SORT
    // ==========================
    orders.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // ==========================
    // 🎨 RENDER
    // ==========================
    container.innerHTML = orders.map(order => {
      return renderOrderCard(order);
    }).join("");

  } catch (error) {
    console.error("❌ Orders load error:", error);
    container.innerHTML = "<p>Failed to load orders.</p>";
  }
}

// ==========================
// 🔥 CLICK HANDLER (FIXED)
// ==========================
function setupNavigation() {
  if (!container) return;

  container.addEventListener("click", (e) => {
    const card = e.target.closest(".order-card");
    if (!card) return;

    const orderId = card.dataset.id;

    console.log("👉 CLICKED ORDER:", orderId);

    if (!orderId) {
      console.error("❌ Missing orderId");
      return;
    }

    // 🔥 FORCE NAVIGATION
    window.location.href = `order.html?orderId=${orderId}`;
  });
}

// ==========================
// 🚀 START
// ==========================
initOrders();
setupNavigation();