// ==========================
// 🧾 ORDER CARD COMPONENT
// ==========================
export function renderOrderCard(order) {
  const itemsHTML = order.items.map(item => `
    <div class="order-item">
      <img src="${item.image}" alt="${item.name}" />
      <div class="order-item-info">
        <p class="name">${item.name}</p>
        <p class="meta">Size: ${item.size} • Qty: ${item.quantity}</p>
        <p class="price">₱${item.price.toLocaleString()}</p>
      </div>
    </div>
  `).join("");

  const statusClass = order.status === "paid" ? "paid" : "pending";

  return `
    <div class="order-card">
      <div class="order-header">
        <span class="order-id">#${order.id}</span>
        <span class="order-status ${statusClass}">
          ${order.status.toUpperCase()}
        </span>
      </div>

      <div class="order-items">
        ${itemsHTML}
      </div>

      <div class="order-footer">
        <span class="order-date">
          ${new Date(order.createdAt).toLocaleString()}
        </span>
        <span class="order-total">
          ₱${order.items.reduce((sum, i) => sum + i.price * i.quantity, 0).toLocaleString()}
        </span>
      </div>
    </div>
  `;
}