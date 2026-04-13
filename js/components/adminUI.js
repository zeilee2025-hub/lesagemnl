export function renderOrders(container, orders) {
  container.innerHTML = orders.map(order => {
    return `
      <div class="admin-order" data-id="${order.id}">
        
        <div class="admin-order-main">
          <div class="admin-order-top">
            <span class="admin-id">${order.id}</span>
            <span class="admin-status ${order.status}">${order.status}</span>
          </div>

          <div class="admin-order-bottom">
            <span>₱${calculateTotal(order.items || [])}</span>
            <span>${formatDate(order)}</span>
          </div>
        </div>

        <div class="admin-order-items hidden">
          ${renderItems(order.items || [])}

          <div class="admin-actions">
            ${renderActions(order.status)}
          </div>
        </div>

      </div>
    `;
  }).join("");
}

// 🔹 helpers (UI-level only)

function calculateTotal(items = []) {
  return items.reduce((t, i) => t + i.price * i.quantity, 0);
}

function formatDate(order) {
  return order.paidAt || order.createdAt || "—";
}

function renderItems(items = []) {
  if (!items.length) {
    return `<div class="admin-item">No items</div>`;
  }

  return items.map(item => `
    <div class="admin-item">
      <span>${item.name}</span>
      <span>${item.size}</span>
      <span>x${item.quantity}</span>
      <span>₱${item.price}</span>
    </div>
  `).join("");
}

// 🔹 NEW — status buttons (UI only)
function renderActions(status) {
  let buttons = "";

  if (status === "paid") {
    buttons = `<button data-action="ship">Mark as Shipped</button>`;
  }

  if (status === "shipped") {
    buttons = `<button data-action="complete">Mark as Completed</button>`;
  }

  return buttons
    ? `<div class="admin-buttons">${buttons}</div>`
    : "";
}