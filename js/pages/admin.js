import { API_BASE_URL }
from "../services/config/api.js";

import {
  getOrders,
  updateOrderStatus
} from "../services/orderService.js";

import {
  listenToProducts,
  adjustProductStock,
  getInventoryAdjustments,
  updateProductDetails
} from "../services/productService.js";

import {
  renderOrders,
  renderOrderDetail,
  renderOverview
} from "../components/adminUI.js";

import {
  renderProductList,
  renderProductDetail,
  renderProductEdit,
  validateProductDetailsForm
} from "../components/adminProductsUI.js";

import {
  deriveInventoryRows,
  filterInventoryRows,
  renderInventory,
  renderInventoryHistory
} from "../components/adminInventoryUI.js";

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

const overviewRecentOrdersContainer =
  document.getElementById(
    "overview-recent-orders"
  );

const productsContainer =
  document.getElementById("admin-products");

const productSearchInput =
  document.getElementById("product-search");

const inventoryContainer =
  document.getElementById("admin-inventory");

const inventorySearchInput =
  document.getElementById("inventory-search");

const inventoryFilterButtons =
  document.querySelectorAll(
    "[data-inventory-filter]"
  );

const inventoryViewButtons =
  document.querySelectorAll(
    "[data-inventory-view]"
  );

const filterButtons =
  document.querySelectorAll(".admin__filter-btn");

const searchInput =
  document.getElementById("order-search");

const logoutBtn =
  document.getElementById(
    "admin-logout-btn"
  );

const adminShell =
  document.querySelector(
    ".admin-shell"
  );

const adminNavButtons =
  document.querySelectorAll(
    "[data-admin-section]"
  );

const adminPanels =
  document.querySelectorAll(
    "[data-admin-panel]"
  );

const mobileMenuBtn =
  document.getElementById(
    "admin-mobile-menu-btn"
  );

const mobileCloseBtn =
  document.getElementById(
    "admin-mobile-close-btn"
  );

const shellBackdrop =
  document.getElementById(
    "admin-shell-backdrop"
  );


/* ==========================
   ADMIN STATE
========================== */

let allOrders = [];

let currentFilter = "ALL";

let selectedOrderId = null;

let allProducts = [];

let selectedProductId = null;

let productView = "list";

let productUnsubscribe = null;

let productSaveInFlight = false;

let currentInventoryFilter = "ALL";

let currentInventoryView = "stock";

let currentInventoryRows = [];

let selectedInventoryRowId = null;

let inventoryAdjustmentDraft = {
  delta: "",
  reason: "",
  note: ""
};

let inventoryAdjustmentSubmitting = false;

let inventoryAdjustmentMessage = "";

let inventoryAdjustments = [];

let inventoryHistoryLoading = false;

const cancelledFilterStates = [
  "CANCELLED",
  "REJECTED",
  "EXPIRED"
];

/* ==========================
   ADMIN NAVIGATION
========================== */

function closeMobileNavigation() {

  if (!adminShell) return;

  adminShell.classList.remove(
    "nav-open"
  );

  if (mobileMenuBtn) {
    mobileMenuBtn.setAttribute(
      "aria-expanded",
      "false"
    );
  }

  if (shellBackdrop) {
    shellBackdrop.hidden = true;
  }

}

function openMobileNavigation() {

  if (!adminShell) return;

  adminShell.classList.add(
    "nav-open"
  );

  if (mobileMenuBtn) {
    mobileMenuBtn.setAttribute(
      "aria-expanded",
      "true"
    );
  }

  if (shellBackdrop) {
    shellBackdrop.hidden = false;
  }

}

function setActiveAdminSection(section) {

  if (!section) return;

  adminNavButtons.forEach(button => {

    const isActive =
      button.dataset.adminSection === section;

    button.classList.toggle(
      "active",
      isActive
    );

    if (isActive) {
      button.setAttribute(
        "aria-current",
        "page"
      );
    }

    else {
      button.removeAttribute(
        "aria-current"
      );
    }

  });

  adminPanels.forEach(panel => {

    const isActive =
      panel.dataset.adminPanel === section;

    panel.hidden =
      !isActive;

    panel.classList.toggle(
      "active",
      isActive
    );

  });

  closeMobileNavigation();

}

function setupAdminNavigation() {

  if (
    !adminNavButtons.length ||
    !adminPanels.length
  ) {
    return;
  }

  adminNavButtons.forEach(button => {

    button.addEventListener(
      "click",
      () => {
        setActiveAdminSection(
          button.dataset.adminSection
        );
      }
    );

  });

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener(
      "click",
      openMobileNavigation
    );
  }

  if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener(
      "click",
      closeMobileNavigation
    );
  }

  if (shellBackdrop) {
    shellBackdrop.addEventListener(
      "click",
      closeMobileNavigation
    );
  }

  setActiveAdminSection("orders");

}

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

  renderOverview(
    overviewRecentOrdersContainer,
    allOrders
  );

  if (selectedOrderId) {

    const selectedOrder =
      allOrders.find(order => {
        return order.id === selectedOrderId;
      });

    renderOrderDetail(
      ordersContainer,
      selectedOrder
    );

    updateStats(allOrders);

    return;

  }

  const filteredOrders = getFilteredOrders();

  renderOrders(
    ordersContainer,
    filteredOrders
  );

  updateStats(allOrders);

}

function openOrderDetail(orderId) {

  if (!orderId) return;

  selectedOrderId = orderId;

  setActiveAdminSection("orders");

  renderCurrentView();

}


/* ==========================
   ADMIN PRODUCTS
========================== */

function getSelectedProduct() {

  if (!selectedProductId) {
    return null;
  }

  return allProducts.find(product => {
    return product.id === selectedProductId;
  });

}

function getFilteredProducts() {

  const searchValue =
    productSearchInput?.value
      ?.toLowerCase()
      ?.trim();

  if (!searchValue) {
    return [...allProducts];
  }

  return allProducts.filter(product => {

    const name =
      String(
        product.name ||
        product.title ||
        ""
      ).toLowerCase();

    const id =
      String(product.id || "")
        .toLowerCase();

    return (
      name.includes(searchValue) ||
      id.includes(searchValue)
    );

  });

}

function renderProductsView(
  errorMessage = ""
) {

  if (!productsContainer) return;

  if (productView === "detail") {
    renderProductDetail(
      productsContainer,
      getSelectedProduct()
    );

    return;
  }

  if (productView === "edit") {
    renderProductEdit(
      productsContainer,
      getSelectedProduct(),
      errorMessage
    );

    return;
  }

  renderProductList(
    productsContainer,
    getFilteredProducts()
  );

}

function renderInventoryView() {

  if (!inventoryContainer) return;

  const rows =
    deriveInventoryRows(allProducts);

  const filteredRows =
    filterInventoryRows(
      rows,
      currentInventoryFilter,
      inventorySearchInput?.value || ""
    );

  currentInventoryRows =
    filteredRows;

  if (currentInventoryView === "history") {
    renderInventoryHistory(
      inventoryContainer,
      inventoryAdjustments,
      {
        loading:
          inventoryHistoryLoading
      }
    );

    return;
  }

  renderInventory(
    inventoryContainer,
    filteredRows,
    {
      selectedRowId:
        selectedInventoryRowId,
      adjustmentDraft:
        inventoryAdjustmentDraft,
      submitting:
        inventoryAdjustmentSubmitting,
      message:
        inventoryAdjustmentMessage
    }
  );

}

function setupProductListener() {

  if (
    !productsContainer ||
    productUnsubscribe
  ) {
    return;
  }

  productUnsubscribe =
    listenToProducts((products) => {

      allProducts =
        Array.isArray(products)
          ? products
          : [];

      if (
        selectedProductId &&
        !getSelectedProduct()
      ) {
        productView = "list";
        selectedProductId = null;
      }

      renderProductsView();
      renderInventoryView();

    });

}

function setupProductSearch() {

  if (!productSearchInput) return;

  productSearchInput.addEventListener(
    "input",
    () => {
      productView = "list";
      selectedProductId = null;
      renderProductsView();
    }
  );

}

function setupInventoryFilters() {

  if (!inventoryFilterButtons.length) return;

  inventoryFilterButtons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        inventoryFilterButtons.forEach(btn => {
          btn.classList.remove("active");
        });

        button.classList.add("active");

        currentInventoryFilter =
          button.dataset.inventoryFilter;

        renderInventoryView();

      }
    );

  });

}

async function loadInventoryAdjustments() {

  inventoryHistoryLoading = true;
  renderInventoryView();

  try {
    const data =
      await getInventoryAdjustments(50);

    inventoryAdjustments =
      Array.isArray(data.adjustments)
        ? data.adjustments
        : [];
  }

  catch (error) {
    console.error(
      "Inventory history error:",
      error
    );

    inventoryAdjustments = [];
  }

  finally {
    inventoryHistoryLoading = false;
    renderInventoryView();
  }

}

function setupInventoryViews() {

  if (!inventoryViewButtons.length) return;

  inventoryViewButtons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        inventoryViewButtons.forEach(btn => {
          btn.classList.remove("active");
        });

        button.classList.add("active");

        currentInventoryView =
          button.dataset.inventoryView || "stock";

        selectedInventoryRowId = null;
        inventoryAdjustmentMessage = "";

        if (currentInventoryView === "history") {
          loadInventoryAdjustments();
          return;
        }

        renderInventoryView();

      }
    );

  });

}

function setupInventorySearch() {

  if (!inventorySearchInput) return;

  inventorySearchInput.addEventListener(
    "input",
    renderInventoryView
  );

}

function openProductDetail(productId) {

  if (!productId) return;

  selectedProductId = productId;
  productView = "detail";

  setActiveAdminSection("products");

  renderProductsView();

}

async function saveProductDetails(form) {

  if (productSaveInFlight) return;

  const product =
    getSelectedProduct();

  if (!product) return;

  const updates =
    validateProductDetailsForm(form);

  productSaveInFlight = true;

  try {

    await updateProductDetails(
      product.id,
      updates
    );

    allProducts = allProducts.map(item => {
      if (item.id !== product.id) {
        return item;
      }

      return {
        ...item,
        ...updates
      };
    });

    productView = "detail";

    renderProductsView();

  }

  finally {
    productSaveInFlight = false;
  }

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

      selectedOrderId = null;

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
    selectedOrderId = null;
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
        event.target.closest(
          ".admin-order, .admin-order-detail"
        );

      if (!orderCard) return;

      const action =
        event.target.dataset.action;

      if (action === "back") {

        selectedOrderId = null;

        renderCurrentView();

        return;

      }

      const clickedInsideContent =
        event.target.closest("input") ||
        event.target.closest("button") ||
        event.target.closest(
          ".admin-order-detail__body"
        ) ||
        event.target.closest(
          ".admin-order__items"
        );

      if (!clickedInsideContent) {

        selectedOrderId =
          orderCard.dataset.id;

        renderCurrentView();

        return;

      }

      if (!action) return;

      const orderId =
        orderCard.dataset.id;

      try {

        if (action === "view") {

          selectedOrderId = orderId;

          renderCurrentView();

          return;

        }

        else if (action === "approve") {

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

function setupOverviewInteractions() {

  if (!overviewRecentOrdersContainer) return;

  overviewRecentOrdersContainer.addEventListener(
    "click",
    (event) => {

      const orderRow =
        event.target.closest(
          "[data-overview-order-id]"
        );

      if (!orderRow) return;

      openOrderDetail(
        orderRow.dataset.overviewOrderId
      );

    }
  );

}

function setupProductInteractions() {

  if (!productsContainer) return;

  productsContainer.addEventListener(
    "click",
    (event) => {

      const actionElement =
        event.target.closest(
          "[data-product-action]"
        );

      const action =
        actionElement?.dataset.productAction;

      const productCard =
        event.target.closest(
          ".admin-product[data-product-id]"
        );

      if (!action && productCard) {
        selectedProductId =
          productCard.dataset.productId;

        productView = "detail";

        renderProductsView();

        return;
      }

      if (!action) return;

      if (action === "back") {
        productView = "list";
        selectedProductId = null;
        renderProductsView();
        return;
      }

      if (action === "view" && productCard) {
        selectedProductId =
          productCard.dataset.productId;

        productView = "detail";

        renderProductsView();
        return;
      }

      if (action === "detail") {
        productView = "detail";
        renderProductsView();
        return;
      }

      if (action === "edit") {
        productView = "edit";
        renderProductsView();
      }

    }
  );

  productsContainer.addEventListener(
    "submit",
    async (event) => {

      const form =
        event.target.closest(
          ".admin-product-form"
        );

      if (!form) return;

      event.preventDefault();

      try {
        await saveProductDetails(form);
      }

      catch (error) {
        renderProductsView(
          error.message ||
          "Failed to save product."
        );
      }

    }
  );

}

function getInventoryRowById(rowId) {

  return currentInventoryRows.find(row => {
    return row.id === rowId;
  });

}

function resetInventoryAdjustmentDraft() {

  inventoryAdjustmentDraft = {
    delta: "",
    reason: "",
    note: ""
  };

  inventoryAdjustmentMessage = "";

}

function getInventoryAdjustmentValidation(row) {

  const delta =
    Number(inventoryAdjustmentDraft.delta);

  if (
    !Number.isInteger(delta) ||
    delta === 0
  ) {
    return "Adjustment must be a non-zero integer.";
  }

  if (row.stock + delta < 0) {
    return "Adjustment would create negative stock.";
  }

  if (!inventoryAdjustmentDraft.reason) {
    return "Reason is required.";
  }

  if (
    inventoryAdjustmentDraft.reason === "OTHER" &&
    !String(inventoryAdjustmentDraft.note || "").trim()
  ) {
    return "Note is required for OTHER adjustments.";
  }

  return "";

}

function updateInventoryAdjustmentPreview(form, row) {

  if (
    !form ||
    !row
  ) {
    return;
  }

  const delta =
    Number(inventoryAdjustmentDraft.delta);

  const validDelta =
    Number.isInteger(delta) &&
    delta !== 0;

  const predicted =
    validDelta
      ? row.stock + delta
      : row.stock;

  const resultElement =
    form.querySelector(
      "[data-inventory-adjustment-result]"
    );

  if (resultElement) {
    resultElement.textContent =
      validDelta &&
      predicted < 0
        ? "Invalid"
        : predicted.toLocaleString();
  }

  const submitButton =
    form.querySelector(
      "[data-inventory-adjustment-submit]"
    );

  if (submitButton) {
    submitButton.disabled = Boolean(
      inventoryAdjustmentSubmitting ||
      getInventoryAdjustmentValidation(row)
    );
  }

}

async function submitInventoryAdjustment(rowId) {

  if (inventoryAdjustmentSubmitting) return;

  const row =
    getInventoryRowById(rowId);

  if (
    !row ||
    !row.canAdjust
  ) {
    inventoryAdjustmentMessage =
      "This row cannot be adjusted safely.";
    renderInventoryView();
    return;
  }

  const validationMessage =
    getInventoryAdjustmentValidation(row);

  if (validationMessage) {
    inventoryAdjustmentMessage =
      validationMessage;
    renderInventoryView();
    return;
  }

  inventoryAdjustmentSubmitting = true;
  inventoryAdjustmentMessage = "";
  renderInventoryView();

  try {
    const data =
      await adjustProductStock({
        productId:
          row.productId,
        branchType:
          row.source.variantField,
        branchName:
          row.source.variantName,
        size:
          row.source.sizeLabel,
        delta:
          Number(inventoryAdjustmentDraft.delta),
        reason:
          inventoryAdjustmentDraft.reason,
        note:
          inventoryAdjustmentDraft.note
      });

    const result =
      data.adjustment;

    selectedInventoryRowId = null;
    resetInventoryAdjustmentDraft();
    inventoryAdjustmentMessage =
      result
        ? `Saved: ${result.stockBefore} -> ${result.stockAfter}`
        : "Stock adjustment saved.";
  }

  catch (error) {
    inventoryAdjustmentMessage =
      error.message ||
      "Failed to adjust stock.";
  }

  finally {
    inventoryAdjustmentSubmitting = false;
    renderInventoryView();
  }

}

function setupInventoryInteractions() {

  if (!inventoryContainer) return;

  inventoryContainer.addEventListener(
    "click",
    (event) => {

      const row =
        event.target.closest(
          "[data-product-id]"
        );

      if (!row) return;

      const action =
        event.target.dataset.inventoryAction;

      if (action === "adjust-stock") {
        selectedInventoryRowId =
          row.dataset.inventoryRowId;
        resetInventoryAdjustmentDraft();
        renderInventoryView();
        return;
      }

      if (action === "cancel-adjustment") {
        selectedInventoryRowId = null;
        resetInventoryAdjustmentDraft();
        renderInventoryView();
        return;
      }

      if (
        action === "view-product" ||
        (
          !event.target.closest("button") &&
          !event.target.closest("form")
        )
      ) {
        openProductDetail(
          row.dataset.productId
        );
      }

    }
  );

  inventoryContainer.addEventListener(
    "input",
    (event) => {

      const field =
        event.target.dataset
          .inventoryAdjustmentField;

      if (!field) return;

      inventoryAdjustmentDraft = {
        ...inventoryAdjustmentDraft,
        [field]:
          event.target.value
      };

      inventoryAdjustmentMessage = "";

      const form =
        event.target.closest(
          ".admin-inventory-adjustment"
        );

      const row =
        event.target.closest(
          "[data-inventory-row-id]"
        );

      updateInventoryAdjustmentPreview(
        form,
        getInventoryRowById(
          row?.dataset.inventoryRowId
        )
      );

    }
  );

  inventoryContainer.addEventListener(
    "change",
    (event) => {

      const field =
        event.target.dataset
          .inventoryAdjustmentField;

      if (!field) return;

      inventoryAdjustmentDraft = {
        ...inventoryAdjustmentDraft,
        [field]:
          event.target.value
      };

      inventoryAdjustmentMessage = "";

      const form =
        event.target.closest(
          ".admin-inventory-adjustment"
        );

      const row =
        event.target.closest(
          "[data-inventory-row-id]"
        );

      updateInventoryAdjustmentPreview(
        form,
        getInventoryRowById(
          row?.dataset.inventoryRowId
        )
      );

    }
  );

  inventoryContainer.addEventListener(
    "submit",
    async (event) => {

      const form =
        event.target.closest(
          ".admin-inventory-adjustment"
        );

      if (!form) return;

      event.preventDefault();

      const row =
        event.target.closest(
          "[data-inventory-row-id]"
        );

      if (!row) return;

      await submitInventoryAdjustment(
        row.dataset.inventoryRowId
      );

    }
  );

}


/* ==========================
   ADMIN INIT
========================== */

async function initAdmin() {

  if (!ordersContainer) return;

  try {

    setupAdminNavigation();

    await refreshOrders();

    setupFilters();
    setupSearch();
    setupInteractions();
    setupOverviewInteractions();
    setupProductListener();
    setupProductSearch();
    setupProductInteractions();
    setupInventoryViews();
    setupInventoryFilters();
    setupInventorySearch();
    setupInventoryInteractions();

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
