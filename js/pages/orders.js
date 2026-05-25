// ==========================
//  IMPORTS
// ==========================
import {
  getOrdersByEmail,
  getOrderById
}
from "../services/orderService.js";

import { renderOrderCard }
from "../components/orderCard.js";

import {
  getCurrentUser
} from "../services/authService.js";

// ==========================
//  ELEMENT
// ==========================
const container = document.getElementById("orders-container");

function renderOrdersSkeleton() {

  if (!container) return;

  container.innerHTML = `

    <div class="orders-skeleton">

      ${Array.from({ length: 3 }).map(() => `

        <div class="orders-skeleton-card">

          <div class="orders-skeleton-image"></div>

          <div class="orders-skeleton-content">

            <div class="orders-skeleton-line orders-skeleton-line--sm"></div>

            <div class="orders-skeleton-line orders-skeleton-line--lg"></div>

            <div class="orders-skeleton-line orders-skeleton-line--md"></div>

          </div>

        </div>

      `).join("")}

    </div>

  `;

}

// ==========================
//  INIT ORDERS (FETCH + RENDER)
// ==========================
async function initOrders() {
  if (!container) {
    renderOrdersSkeleton();
    console.error("❌ orders-container not found");
    return;
  }

  try {
    // ==========================
//  AUTH + GUEST EMAIL
// ==========================
const currentUser =
  getCurrentUser();

const email =

  currentUser?.email ||

  localStorage.getItem(
    "customerEmail"
  );

console.log(
  "EMAIL USED:",
  email
);

// ==========================
// LAST ORDER RECOVERY
// ==========================
if (!email) {

  const lastOrderId =
    localStorage.getItem(
      "lastOrderId"
    );

  // ==========================
  // NO RECOVERY FOUND
  // ==========================
  if (!lastOrderId) {

    container.innerHTML = `

      <p class="orders-empty">

        No orders found.

      </p>

    `;

    return;

  }

  console.log(
    "Recovering order:",
    lastOrderId
  );

  try {

    const recoveredOrder =
      await getOrderById(
        lastOrderId
      );

    if (!recoveredOrder) {

      container.innerHTML = `

        <p class="orders-empty">

          No orders found.

        </p>

      `;

      return;

    }

    container.innerHTML =
      renderOrderCard(
        recoveredOrder
      );

    return;

  } catch (error) {

    console.error(
      "Recovery failed:",
      error
    );

    container.innerHTML = `

      <p class="orders-empty">

        Failed to recover order.

      </p>

    `;

    return;

  }

}

    // ==========================
    //  FETCH ORDERS
    // ==========================
    let orders = await getOrdersByEmail(email);

    if (!Array.isArray(orders) || orders.length === 0) {
      container.innerHTML = "<p>No orders yet.</p>";
      return;
    }

    // ==========================
    //  SORT (LATEST FIRST)
    // ==========================
    orders.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // ==========================
    //  RENDER
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
//  SMART INTERACTION SYSTEM
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
    //  BUTTON ACTION (PRIORITY)
    // ==========================
    if (actionBtn) {
      e.stopPropagation();

      const action = actionBtn.dataset.action;


      //  UPLOAD PROOF
      if (action === "upload") {
        window.location.href = `order.html?orderId=${orderId}&action=upload`;
        return;
      }

      //  VIEW ORDER
      if (action === "view") {
        window.location.href = `order.html?orderId=${orderId}`;
        return;
      }

      //  TRACK ORDER
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
    //  CARD CLICK (DEFAULT)
    // ==========================
    window.location.href = `order.html?orderId=${orderId}`;
  });
}

// ==========================
//  START
// ==========================
initOrders();
setupNavigation();