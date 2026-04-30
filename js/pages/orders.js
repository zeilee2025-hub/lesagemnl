// ==========================
// 📦 IMPORTS
// ==========================
import { getOrdersByEmail } from "../services/orderService.js";
import { renderOrderCard } from "../components/orderCard.js";

// ==========================
// 📦 ELEMENT
// ==========================
const container = document.getElementById("orders-container");

// ==========================
// 🚀 INIT ORDERS (FETCH + RENDER)
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

    console.log("EMAIL USED:", email);

    if (!email) {
      container.innerHTML = "<p>No orders found. (No email detected)</p>";
      return;
    }

    // ==========================
    // 📦 FETCH ORDERS
    // ==========================
    let orders = await getOrdersByEmail(email);

    console.log("FETCHED ORDERS:", orders);

    if (!Array.isArray(orders) || orders.length === 0) {
      container.innerHTML = "<p>No orders yet.</p>";
      return;
    }

    // ==========================
    // 🔽 SORT (LATEST FIRST)
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
// 🔥 SMART INTERACTION SYSTEM
// ==========================
function setupNavigation() {
  if (!container) return;

  container.addEventListener("click", (e) => {
    const actionBtn = e.target.closest("[data-action]");
    const card = e.target.closest(".order-card");

    if (!card) return;

    const orderId = card.dataset.id;

    if (!orderId) {
      console.error("❌ Missing orderId");
      return;
    }

    // ==========================
    // 🎯 BUTTON ACTION (PRIORITY)
    // ==========================
    if (actionBtn) {
      e.stopPropagation();

      const action = actionBtn.dataset.action;

      console.log("👉 ACTION:", action, "ORDER:", orderId);

      // 📤 UPLOAD PROOF
      if (action === "upload") {
        window.location.href = `order.html?orderId=${orderId}&action=upload`;
        return;
      }

      // 👁 VIEW ORDER
      if (action === "view") {
        window.location.href = `order.html?orderId=${orderId}`;
        return;
      }

      // 🚚 TRACK ORDER
      if (action === "track") {
        const trackingNumber = card.dataset.tracking;

        if (!trackingNumber) {
          window.location.href = `order.html?orderId=${orderId}`;
          return;
        }

        window.open(
          `https://www.jtexpress.ph/index/query/gzquery.html?billcodes=${trackingNumber}`,
          "_blank"
        );

        return;
      }

      return;
    }

    // ==========================
    // 🧾 CARD CLICK (DEFAULT)
    // ==========================
    console.log("👉 CARD CLICK:", orderId);

    window.location.href = `order.html?orderId=${orderId}`;
  });
}

// ==========================
// 🚀 START
// ==========================
initOrders();
setupNavigation();