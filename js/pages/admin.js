// ==========================
// 📦 ADMIN PAGE LOGIC (FINAL)
// ==========================

import { getOrders, updateOrderStatus } from "../services/orderService.js";
import { renderOrders } from "../components/adminUI.js";

const container = document.getElementById("admin-orders");

// ==========================
// 🔍 STATE
// ==========================
let allOrders = [];
let currentFilter = "ALL";

// ==========================
// 📊 STATS SYSTEM
// ==========================
function updateStats(orders) {
  const totalEl = document.getElementById("stat-total");
  const pendingEl = document.getElementById("stat-pending");
  const paidEl = document.getElementById("stat-paid");
  const revenueEl = document.getElementById("stat-revenue");

  if (!orders) return;

  const total = orders.length;

  const pending = orders.filter(o =>
    o.orderState === "PENDING_PAYMENT" ||
    o.orderState === "PROOF_UPLOADED"
  ).length;

  const paid = orders.filter(o =>
    o.orderState === "PAID" ||
    o.orderState === "SHIPPED" ||
    o.orderState === "COMPLETED"
  ).length;

  const revenue = orders
    .filter(o => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  if (totalEl) totalEl.textContent = total;
  if (pendingEl) pendingEl.textContent = pending;
  if (paidEl) paidEl.textContent = paid;
  if (revenueEl) revenueEl.textContent = `₱${revenue.toLocaleString()}`;
}

// ==========================
// 🧠 FILTER LOGIC
// ==========================
function applyFilters() {
  let filtered = [...allOrders];

  if (currentFilter !== "ALL") {
    filtered = filtered.filter(order =>
      order.orderState === currentFilter
    );
  }

  renderOrders(container, filtered);
  updateStats(filtered);
}

// ==========================
// 🔘 FILTER HANDLER
// ==========================
function setupFilters() {
  const buttons = document.querySelectorAll(".filter-btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      currentFilter = btn.dataset.filter;

      applyFilters();
    });
  });
}

// ==========================
// 🔍 SEARCH SYSTEM
// ==========================
function setupSearch() {
  const searchInput = document.getElementById("order-search");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase().trim();

    let filtered = [...allOrders];

    // Apply filter first
    if (currentFilter !== "ALL") {
      filtered = filtered.filter(order =>
        order.orderState === currentFilter
      );
    }

    // Then search
    if (value) {
      filtered = filtered.filter(order => {
        const orderNumber = (order.orderNumber || order.id).toLowerCase();
        return orderNumber.includes(value);
      });
    }

    renderOrders(container, filtered);
    updateStats(filtered);
  });
}

// ==========================
// 🔄 REFRESH SYSTEM
// ==========================
async function refreshOrders() {
  let orders = await getOrders();

  if (!Array.isArray(orders)) {
    console.error("❌ Orders is not an array. FIXING...");
    orders = [];
  }

  orders.sort((a, b) => {
    const dateA = new Date(a.paidAt || a.createdAt || 0);
    const dateB = new Date(b.paidAt || b.createdAt || 0);
    return dateB - dateA;
  });

  allOrders = orders;

  applyFilters();
}

// ==========================
// 🎯 HANDLE INTERACTIONS
// ==========================
function setupInteractions() {
  if (!container) return;

  container.addEventListener("click", async (e) => {
    const card = e.target.closest(".admin-order");
    if (!card) return;

    const action = e.target.dataset.action;

    // ==========================
    // 🔥 HANDLE ACTIONS
    // ==========================
    if (action) {
      const orderId = card.dataset.id;

      try {
        let updates = null;

        // ==========================
        // ✅ APPROVE (BACKEND HANDLED)
        // ==========================
        if (action === "approve") {
          await fetch("http://localhost:3000/approve-order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ orderId })
          });
        }

        // ==========================
        // ❌ REJECT
        // ==========================
        else if (action === "reject") {
          updates = {
            status: "rejected",
            orderState: "REJECTED"
          };
        }

        // ==========================
        // 🚚 SHIP
        // ==========================
        else if (action === "ship") {
          updates = {
            status: "shipped",
            orderState: "SHIPPED"
          };
        }

        // ==========================
        // 📦 COMPLETE
        // ==========================
        else if (action === "complete") {
          updates = {
            status: "completed",
            orderState: "COMPLETED"
          };
        }

        // ==========================
        // 🔄 APPLY NON-APPROVE UPDATES
        // ==========================
        if (updates) {
          await updateOrderStatus(orderId, updates);
        }

        // ==========================
        // 🔄 REFRESH UI
        // ==========================
        await refreshOrders();

      } catch (error) {
        console.error("❌ ACTION ERROR:", error);
      }

      return;
    }

    // ==========================
    // 🔓 TOGGLE DETAILS
    // ==========================
    const items = card.querySelector(".admin-order-items");
    if (!items) return;

    items.classList.toggle("hidden");
  });
}

// ==========================
// 🚀 INIT ADMIN
// ==========================
async function initAdmin() {
  if (!container) return;

  try {
    await refreshOrders();

    setupInteractions();
    setupSearch();
    setupFilters();

  } catch (error) {
    console.error("❌ ADMIN LOAD ERROR:", error);
    container.innerHTML = "<p>Failed to load orders.</p>";
  }
}

initAdmin();