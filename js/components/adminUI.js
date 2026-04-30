export function renderOrders(container, orders) {
  container.innerHTML = orders.map(order => {
    return `
      <div class="admin-order" data-id="${order.id}">
        
        <div class="admin-order-main">
          <div class="admin-order-top">
            <span class="admin-id">${order.id}</span>
            <span class="admin-status ${order.status}">
              ${formatStatus(order)}
            </span>
          </div>

          <div class="admin-order-bottom">
            <span>₱${calculateTotal(order.items || [])}</span>
            <span>${formatDate(order)}</span>
          </div>
        </div>

        <div class="admin-order-items hidden">
          
          ${renderCustomer(order)}

          ${renderProof(order)}

          ${renderItems(order.items || [])}

          ${renderTracking(order)}

          <div class="admin-actions">
            ${renderActions(order)}
          </div>

        </div>

      </div>
    `;
  }).join("");
}

// ==========================
// 🧑 CUSTOMER INFO (NEW)
// ==========================
function renderCustomer(order) {
  return `
    <div class="admin-customer">
      <p><strong>Customer</strong></p>
      <p>${order.firstName || ""} ${order.lastName || ""}</p>
      <p>${order.phone || "—"}</p>
      <p>
        ${order.address || "—"}<br/>
        ${order.city || ""}, ${order.province || ""}
      </p>
    </div>
  `;
}

// ==========================
// 🚚 TRACKING INPUT (NEW)
// ==========================
function renderTracking(order) {
  if (!(order.status === "processing" && order.paymentStatus === "PAID")) {
    return "";
  }

  return `
    <div class="admin-tracking">
      <p><strong>Shipping</strong></p>

      <input 
        type="text" 
        placeholder="Enter J&T Tracking Number"
        class="tracking-input"
        data-tracking-input
      />

      <p class="tracking-note">
        Courier: J&T Express
      </p>
    </div>
  `;
}

// ==========================
// 🔹 HELPERS
// ==========================
function calculateTotal(items = []) {
  return items.reduce((t, i) => t + i.price * i.quantity, 0);
}

function formatDate(order) {
  const date = order.paidAt || order.createdAt;
  if (!date) return "—";

  if (date?.toMillis) return new Date(date.toMillis()).toLocaleString();
  if (typeof date === "string") return new Date(date).toLocaleString();
  if (typeof date === "number") return new Date(date).toLocaleString();

  return "—";
}

function formatStatus(order) {
  const { status, paymentStatus, proofUrl } = order;

  if (status === "pending" && !proofUrl) return "Waiting for Payment";
  if (status === "pending" && proofUrl) return "Proof Uploaded";
  if (status === "processing" && paymentStatus === "PAID") return "Paid";
  if (status === "shipped") return "Shipped";
  if (status === "completed") return "Completed";
  if (status === "rejected") return "Rejected";

  return status;
}

function renderItems(items = []) {
  if (!items.length) return `<div class="admin-item">No items</div>`;

  return items.map(item => `
    <div class="admin-item">
      <span>${item.name}</span>
      <span>${item.size}</span>
      <span>x${item.quantity}</span>
      <span>₱${item.price}</span>
    </div>
  `).join("");
}

function renderProof(order) {
  if (!order.proofUrl) return "";

  return `
    <div class="admin-proof">
      <p>Payment Proof:</p>
      <img src="${order.proofUrl}" />
    </div>
  `;
}

// ==========================
// 🔥 ACTIONS (UPDATED)
// ==========================
function renderActions(order) {
  const { status, paymentStatus, proofUrl } = order;

  let buttons = "";

  if (status === "pending" && proofUrl && paymentStatus === "PENDING") {
    buttons = `
      <button data-action="approve">Approve</button>
      <button data-action="reject">Reject</button>
    `;
  }

  else if (status === "processing" && paymentStatus === "PAID") {
    buttons = `<button data-action="ship">Ship Order</button>`;
  }

  else if (status === "shipped") {
    buttons = `<button data-action="complete">Mark as Completed</button>`;
  }

  return buttons
    ? `<div class="admin-buttons">${buttons}</div>`
    : "";
}