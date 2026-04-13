import { getOrders, updateOrderStatus } from "../services/orderService.js";
import { renderOrders } from "../components/adminUI.js";

const container = document.getElementById("admin-orders");

// 🎯 toggle expand (UI interaction only)
function setupInteractions() {
  container.addEventListener("click", async (e) => {
    console.log("👆 CLICK DETECTED");

    const card = e.target.closest(".admin-order");
    if (!card) return;

    const action = e.target.dataset.action;
    console.log("🎯 ACTION:", action);

    // 🔥 HANDLE BUTTON CLICK
    if (action) {
      const orderId = card.dataset.id;
      console.log("🔥 CALLING UPDATE:", orderId);

      try {
        if (action === "ship") {
          await updateOrderStatus(orderId, "shipped");
        }

        if (action === "complete") {
          await updateOrderStatus(orderId, "completed");
        }

        // 🔁 REFRESH UI
        const orders = await getOrders();

        orders.sort((a, b) => {
          return new Date(b.paidAt || b.createdAt) - new Date(a.paidAt || a.createdAt);
        });

        renderOrders(container, orders);

      } catch (error) {
        console.error("❌ ACTION ERROR:", error);
      }

      return; // 🚫 STOP expand toggle
    }

    // 🔓 NORMAL EXPAND
    const items = card.querySelector(".admin-order-items");
    if (!items) return;

    items.classList.toggle("hidden");
  });
}

// 🚀 init
async function initAdmin() {
  try {
    const orders = await getOrders();

    // sort newest first
    orders.sort((a, b) => {
      return new Date(b.paidAt || b.createdAt) - new Date(a.paidAt || a.createdAt);
    });

    // render via component
    renderOrders(container, orders);

    // attach interactions AFTER render
    setupInteractions();

  } catch (error) {
    console.error("ADMIN LOAD ERROR:", error);
    container.innerHTML = "<p>Failed to load orders.</p>";
  }
}

initAdmin();