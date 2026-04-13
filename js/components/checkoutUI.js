// ===============================
// 🧾 CHECKOUT UI (FINAL CLEAN)
// ===============================

export function renderCheckoutItems(container, items) {
  if (!container) return;

  // ================= EMPTY STATE
  if (!items || items.length === 0) {
    renderEmptyState(container);
    return;
  }

  // ================= RENDER ITEMS
  container.innerHTML = items.map(item => `
    <div class="checkout-item">

      <div class="checkout-item__media">
        <img 
          src="${item.image || ''}" 
          alt="${item.name}" 
          class="checkout-item__image"
          onerror="this.style.display='none'"
        />
      </div>

      <div class="checkout-item__info">
        <p class="checkout-item__name">${item.name}</p>

        <p class="checkout-item__meta">
          ${item.size} • ${item.color || "Default"}
        </p>

        <p class="checkout-item__qty">
          Qty: ${item.quantity}
        </p>
      </div>

      <div class="checkout-item__price">
        ₱${(item.price * item.quantity).toLocaleString()}
      </div>

    </div>
  `).join("");
}

// ===============================
// 📭 EMPTY STATE
// ===============================
export function renderEmptyState(container) {
  container.innerHTML = `
    <div class="checkout-empty">
      <p>Your cart is empty</p>
      <a href="/" class="checkout-empty__link">Continue Shopping</a>
    </div>
  `;
}