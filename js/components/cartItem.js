// ===============================
//  CART ITEM COMPONENT
// ===============================

export function createCartItem(item) {
  const div = document.createElement("div");

  div.className = "cart-item";

  div.setAttribute("data-key", item.key);

  div.innerHTML = `
    <img
      src="${item.image}"
      class="cart-item__image"
      alt="${item.name}"
    />

    <div class="cart-item__info">

      <!-- NAME -->
      <div class="cart-item__name">
        ${item.name}
      </div>

      <!-- META -->
      <div class="cart-item__meta">
        ${item.size} • ${item.color || "Default"}
      </div>

      <!-- SUBTOTAL -->
      <div class="cart-item__subtotal">
        ₱${item.price * item.quantity}
      </div>

      <!-- BOTTOM -->
      <div class="cart-item__bottom">

        <!-- QUANTITY -->
        <div class="cart-qty">

          <button
            class="cart-qty__btn decrease"
            data-key="${item.key}"
            aria-label="Decrease Quantity"
          >
            −
          </button>

          <span class="cart-qty__value">
            ${item.quantity}
          </span>

          <button
            class="cart-qty__btn increase"
            data-key="${item.key}"
            aria-label="Increase Quantity"
          >
            +
          </button>

        </div>

        <!-- ACTIONS -->
        <div class="cart-item__actions">

          <button
            class="cart-item__remove"
            data-key="${item.key}"
          >
            Remove
          </button>

        </div>

      </div>

    </div>
  `;

  return div;
}