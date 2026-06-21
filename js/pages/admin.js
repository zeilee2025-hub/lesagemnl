import { API_BASE_URL }
from "../services/config/api.js";

import {
  getOrders,
  updateOrderStatus
} from "../services/orderService.js";

import {
  renderOrders
} from "../components/adminUI.js";

import { auth }
from "../core/firebase.js";

import {

  onAuthStateChanged,
  signOut

} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


/* ==============================
   ADMIN AUTH PROTECTION
============================== */

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db }
from "../core/firebase.js";


onAuthStateChanged(

  auth,

  async (user) => {

    // ==============================
    // NOT LOGGED IN
    // ==============================
    if (!user) {

      window.location.href =
        "../admin-login.html";

      return;

    }

    try {

      // ==============================
      // GET USER PROFILE
      // ==============================
      const userRef =
        doc(
          db,
          "users",
          user.uid
        );

      const snapshot =
        await getDoc(userRef);

      if (!snapshot.exists()) {

        await signOut(auth);

        window.location.href =
          "../admin-login.html";

        return;

      }

      const userData =
        snapshot.data();

      // ==============================
      // ADMIN VALIDATION
      // ==============================
      if (
        userData.role !== "admin"
      ) {

        console.warn(
          "Unauthorized admin access attempt"
        );

        await signOut(auth);

        window.location.href =
          "../admin-login.html";

        return;

      }

      console.log(
        "Admin authenticated"
      );

    }

    catch (error) {

      console.error(
        "Admin auth error:",
        error
      );

      await signOut(auth);

      window.location.href =
        "../admin-login.html";

    }

  }

);


/* ==========================
   ADMIN ELEMENTS
========================== */

const ordersContainer =
  document.getElementById("admin-orders");

const filterButtons =
  document.querySelectorAll(".admin__filter-btn");

const searchInput =
  document.getElementById("order-search");

  const logoutBtn =
  document.getElementById(
    "admin-logout-btn"
  );


/* ==========================
   ADMIN STATE
========================== */

let allOrders = [];

let currentFilter = "ALL";

const cancelledFilterStates = [
  "CANCELLED",
  "REJECTED",
  "EXPIRED"
];

/* ==============================
   ADMIN LOGOUT
============================== */

if (logoutBtn) {

  logoutBtn.addEventListener(

    "click",

    async () => {

      await signOut(auth);

      window.location.href =
        "../admin-login.html";

    }

  );

}

/* ==========================
   ADMIN STATS
========================== */

function updateStats(orders) {

  const totalElement =
    document.getElementById("stat-total");

  const pendingElement =
    document.getElementById("stat-pending");

  const paidElement =
    document.getElementById("stat-paid");

  const revenueElement =
    document.getElementById("stat-revenue");

  if (!orders) return;

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(order =>
    order.orderState === "PENDING_PAYMENT" ||
    order.orderState === "PROOF_UPLOADED"
  ).length;

  const paidOrders = orders.filter(order =>
    order.orderState === "PAID" ||
    order.orderState === "SHIPPED" ||
    order.orderState === "COMPLETED"
  ).length;

  const revenueStates = [

  "PAID",
  "SHIPPED",
  "COMPLETED"

];

const totalRevenue = orders

  .filter(order => {

    return revenueStates.includes(
      order.orderState
    );

  })

  .reduce((sum, order) => {

    return sum + (
      Number(order.total) || 0
    );

  }, 0);

  if (totalElement) {
    totalElement.textContent = totalOrders;
  }

  if (pendingElement) {
    pendingElement.textContent = pendingOrders;
  }

  if (paidElement) {
    paidElement.textContent = paidOrders;
  }

  if (revenueElement) {
    revenueElement.textContent =
      `₱${totalRevenue.toLocaleString()}`;
  }

}


/* ==========================
   ADMIN FILTERING
========================== */

function getFilteredOrders() {

  let filteredOrders = [...allOrders];

  if (currentFilter === "CANCELLED") {

    filteredOrders = filteredOrders.filter(order => {
      return cancelledFilterStates.includes(
        order.orderState
      );
    });

  }

  else if (currentFilter !== "ALL") {

    filteredOrders = filteredOrders.filter(order => {
      return order.orderState === currentFilter;
    });

  }

  const searchValue =
    searchInput?.value?.toLowerCase()?.trim();

  if (searchValue) {

    filteredOrders = filteredOrders.filter(order => {

      const orderNumber =
        (order.orderNumber || order.id)
          .toLowerCase();

      return orderNumber.includes(searchValue);

    });

  }

  return filteredOrders;

}


function renderCurrentView() {

  const filteredOrders = getFilteredOrders();

  renderOrders(
    ordersContainer,
    filteredOrders
  );

  updateStats(allOrders);

}


/* ==========================
   ADMIN FILTERS
========================== */

function setupFilters() {

  if (!filterButtons.length) return;

  filterButtons.forEach(button => {

    button.addEventListener("click", () => {

      filterButtons.forEach(btn => {
        btn.classList.remove("active");
      });

      button.classList.add("active");

      currentFilter =
        button.dataset.filter;

      renderCurrentView();

    });

  });

}


/* ==========================
   ADMIN SEARCH
========================== */

function setupSearch() {

  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    renderCurrentView();
  });

}


/* ==========================
   ADMIN ORDER REFRESH
========================== */

async function refreshOrders() {

  let orders = await getOrders();

  if (!Array.isArray(orders)) {

    console.error(
      "Orders is not an array."
    );

    orders = [];

  }

  orders.sort((a, b) => {

    const dateA =
      new Date(a.paidAt || a.createdAt || 0);

    const dateB =
      new Date(b.paidAt || b.createdAt || 0);

    return dateB - dateA;

  });

  allOrders = orders;

  renderCurrentView();

}

/* ==========================
   ORDER STATE MACHINE
========================== */

const allowedTransitions = {

  PENDING_PAYMENT: [
    "PROOF_UPLOADED",
    "CANCELLED",
    "EXPIRED"
  ],

  PROOF_UPLOADED: [
    "PAID",
    "REJECTED"
  ],

  PAID: [
    "SHIPPED"
  ],

  SHIPPED: [
    "COMPLETED"
  ],

  COMPLETED: [],

  REJECTED: [],

  CANCELLED: [],

  EXPIRED: []

};


/* ==========================
   VALIDATE STATE TRANSITION
========================== */

function canTransition(

  currentState,
  nextState

) {

  return allowedTransitions[
    currentState
  ]?.includes(nextState);

}

/* ==========================
   ADMIN TOKEN
========================== */

async function getAdminHeaders() {

  const user =
    auth.currentUser;

  if (!user) {

    throw new Error(
      "Admin not authenticated"
    );

  }

  const token =
    await user.getIdToken();

  return {

    "Content-Type":
      "application/json",

    Authorization:
      `Bearer ${token}`

  };

}

/* ==========================
   ADMIN ACTIONS
========================== */

async function handleApprove(orderId) {

  const order =
    allOrders.find(order => {
      return order.id === orderId;
    });

  if (!order) {

    alert("Order not found");

    return;

  }

  if (

    !canTransition(
      order.orderState,
      "PAID"
    )

  ) {

    alert(
      "Invalid order transition"
    );

    return;

  }

  await fetch(
  `${API_BASE_URL}/approve-order`,
    {
      method: "POST",

      headers:
  await getAdminHeaders(),

      body: JSON.stringify({
        orderId
      })
    }
  );

}


async function handleReject(orderId) {

  const order =
    allOrders.find(order => {
      return order.id === orderId;
    });

  if (!order) {

    alert("Order not found");

    return;

  }

  if (

    !canTransition(
      order.orderState,
      "REJECTED"
    )

  ) {

    alert(
      "Invalid order transition"
    );

    return;

  }

  await fetch(
  `${API_BASE_URL}/reject-order`,
    {
      method: "POST",

      headers:
  await getAdminHeaders(),

      body: JSON.stringify({
        orderId
      })
    }
  );

}


async function handleShip(card, orderId) {

  const order =
    allOrders.find(order => {
      return order.id === orderId;
    });

  if (!order) {

    alert("Order not found");

    return;

  }

  if (

    !canTransition(
      order.orderState,
      "SHIPPED"
    )

  ) {

    alert(
      "Invalid order transition"
    );

    return;

  }

  const trackingInput =
    card.querySelector(
      "[data-tracking-input]"
    );

  const trackingNumber =
    trackingInput?.value?.trim();

  if (!trackingNumber) {

    alert(
      "Tracking number is required."
    );

    return;

  }

  await fetch(
  `${API_BASE_URL}/ship-order`,
    {
      method: "POST",

      headers:
  await getAdminHeaders(),

      body: JSON.stringify({
        orderId,
        trackingNumber
      })
    }
  );

}


async function handleComplete(orderId) {

  const order =
    allOrders.find(order => {
      return order.id === orderId;
    });

  if (!order) {

    alert("Order not found");

    return;

  }

  if (

    !canTransition(
      order.orderState,
      "COMPLETED"
    )

  ) {

    alert(
      "Invalid order transition"
    );

    return;

  }

  await updateOrderStatus(

  orderId,

  {
    orderState: "COMPLETED"
  },

  {
    action: "ORDER_COMPLETED"
  }

);

}




/* ==========================
   ADMIN INTERACTIONS
========================== */

function setupInteractions() {

  if (!ordersContainer) return;

  ordersContainer.addEventListener(
    "click",
    async (event) => {

      const orderCard =
        event.target.closest(".admin-order");

      if (!orderCard) return;

      const action =
        event.target.dataset.action;

      const clickedInsideContent =
        event.target.closest("input") ||
        event.target.closest("button") ||
        event.target.closest(
          ".admin-order__items"
        );

      if (!clickedInsideContent) {

        const orderItems =
          orderCard.querySelector(
            ".admin-order__items"
          );

        if (orderItems) {
          orderItems.classList.toggle(
            "hidden"
          );
        }

        return;

      }

      if (!action) return;

      const orderId =
        orderCard.dataset.id;

      try {

        if (action === "approve") {

          await handleApprove(orderId);

        }

        else if (action === "reject") {

          await handleReject(orderId);

        }

        else if (action === "ship") {

          await handleShip(
            orderCard,
            orderId
          );

        }

        else if (action === "complete") {

          await handleComplete(orderId);

        }

        await refreshOrders();

      }

      catch (error) {

        console.error(
          "Admin action error:",
          error
        );

      }

    }
  );

}


/* ==========================
   ADMIN INIT
========================== */

async function initAdmin() {

  if (!ordersContainer) return;

  try {

    await refreshOrders();

    setupFilters();
    setupSearch();
    setupInteractions();

  }

  catch (error) {

    console.error(
      "Admin load error:",
      error
    );

    ordersContainer.innerHTML =
      "<p>Failed to load orders.</p>";

  }

}


initAdmin();
