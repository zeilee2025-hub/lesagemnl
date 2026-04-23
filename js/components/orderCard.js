// ==========================
// 🧾 ORDER CARD COMPONENT (IMPROVED - FIXED)
// ==========================
export function renderOrderCard(order) {
  if (!order) {
    console.error("❌ renderOrderCard: missing order");
    return "";
  }

  // 🔥 Ensure ID exists (CRITICAL FIX)
  const orderId = order.id || order.orderId || "";

  if (!orderId) {
    console.error("❌ Missing order.id in orderCard:", order);
  }

  const itemsHTML = (order.items || []).map(item => `
    <div class="order-item">
      <img 
        src="${item.image}" 
        alt="${item.name}" 
        class="order-item-image"
      />
      <div class="order-item-info">
        <p class="name">${item.name}</p>
        <p class="meta">Size: ${item.size} • Qty: ${item.quantity}</p>
        <p class="price">₱${Number(item.price).toLocaleString()}</p>
      </div>
    </div>
  `).join("");

  // ==========================
  // 🔥 STATE SYSTEM
  // ==========================
  const state = order.orderState || "PENDING_PAYMENT";

  const statusClass = getStatusClass(state);
  const statusLabel = formatState(state);

  // ==========================
  // 💰 TOTAL
  // ==========================
  const total = (order.items || []).reduce(
    (sum, i) => sum + (i.price * i.quantity),
    0
  );

  // ==========================
  // 📅 DATE
  // ==========================
  const date = formatDate(order.createdAt);

  return `
    <div class="order-card" data-id="${orderId}">

      <!-- HEADER -->
      <div class="order-header">
        <span class="order-id">
  #${order.orderNumber || order.id}
</span>
        <span class="order-status ${statusClass}">
          ${statusLabel}
        </span>
      </div>

      <!-- ITEMS -->
      <div class="order-items">
        ${itemsHTML || `<p class="no-items">No items</p>`}
      </div>

      <!-- FOOTER -->
      <div class="order-footer">
        <span class="order-date">${date}</span>
        <span class="order-total">₱${total.toLocaleString()}</span>
      </div>

    </div>
  `;
}

// ==========================
// 🎨 STATUS CLASS
// ==========================
function getStatusClass(state) {
  switch (state) {
    case "PAID":
      return "paid";
    case "SHIPPED":
      return "shipped";
    case "COMPLETED":
      return "completed";
    case "PENDING_PAYMENT":
      return "pending";
    case "PROOF_UPLOADED":
      return "review";
    default:
      return "pending";
  }
}

// ==========================
// ✨ FORMAT STATE TEXT
// ==========================
function formatState(state) {
  return state
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

// ==========================
// 📅 FORMAT DATE
// ==========================
function formatDate(date) {
  if (!date) return "—";

  if (typeof date === "string") {
    return new Date(date).toLocaleString();
  }

  if (typeof date === "number") {
    return new Date(date).toLocaleString();
  }

  if (date?.toMillis) {
    return new Date(date.toMillis()).toLocaleString();
  }

  return "—";
}