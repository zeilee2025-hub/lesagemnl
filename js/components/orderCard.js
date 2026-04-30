// ==========================
// 🧾 ORDER CARD (CONNECTED SYSTEM)
// ==========================

import { deriveOrderUI } from "../core/orderUI.js";

export function renderOrderCard(order) {
  if (!order) {
    console.error("❌ renderOrderCard: missing order");
    return "";
  }

  const orderId = order.id || order.orderId || "";

  if (!orderId) {
    console.error("❌ Missing order.id:", order);
  }

  const ui = deriveOrderUI(order);

  // ==========================
  // 📦 ITEMS SUMMARY
  // ==========================
  const items = order.items || [];

  const firstItem = items[0] || {};
  const extraCount = items.length - 1;

  const itemName = firstItem.name || "Product";
  const itemImage = firstItem.image || "/images/placeholder.png";

  const itemSummary =
    extraCount > 0
      ? `${itemName} +${extraCount} more`
      : itemName;

  // ==========================
  // 💰 TOTAL
  // ==========================
  const total =
    order.total ||
    items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  // ==========================
  // 📅 DATE
  // ==========================
  const date = formatDate(order.createdAt);

  return `
    <div class="order-card" data-id="${orderId}">

      <!-- LEFT: IMAGE -->
      <div class="order-card__image">
        <img src="${itemImage}" alt="${itemName}" />
      </div>

      <!-- CENTER: INFO -->
      <div class="order-card__info">

        <div class="order-card__top">
          <span class="order-card__id">
            #${order.orderNumber || order.id}
          </span>

          <span class="order-card__status status-${ui.type}">
            ${ui.label}
          </span>
        </div>

        <div class="order-card__meta">
          <span class="order-card__item">
            ${itemSummary}
          </span>

          <span class="order-card__date">
            ${date}
          </span>
        </div>

      </div>

      <!-- RIGHT: TOTAL + ACTION -->
      <div class="order-card__side">

        <div class="order-card__total">
          ₱${Number(total).toLocaleString()}
        </div>

        ${
          ui.action
            ? `
          <button class="order-card__action" data-action="${ui.action}">
            ${ui.actionLabel}
          </button>
        `
            : `
          <div class="order-card__action disabled">
            ${ui.label}
          </div>
        `
        }

      </div>

    </div>
  `;
}

// ==========================
// 📅 FORMAT DATE
// ==========================
function formatDate(date) {
  if (!date) return "—";

  if (typeof date === "string") {
    return new Date(date).toLocaleDateString();
  }

  if (typeof date === "number") {
    return new Date(date).toLocaleDateString();
  }

  if (date?.toMillis) {
    return new Date(date.toMillis()).toLocaleDateString();
  }

  return "—";
}