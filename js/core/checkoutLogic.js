import { getShippingFee } from "../services/shippingService.js";

// ===============================
// CALCULATE SUBTOTAL
// ===============================
export function calculateSubtotal(items) {
  if (!items || items.length === 0) return 0;

  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
}

// ===============================
// CALCULATE TOTALS (DYNAMIC SHIPPING)
// ===============================
export function calculateTotals(
  items,
  region = "NCR",
  province = "Metro Manila"
) {
  const subtotal = calculateSubtotal(items);

  let shipping = 0;

  if (subtotal >= 2000) {
    shipping = 0;
  } else if (subtotal > 0) {
    shipping = getShippingFee(region, province);
  }

  const total = subtotal + shipping;

  return {
    subtotal,
    shipping,
    total,
    isFreeShipping: subtotal >= 2000,
    remainingForFree: Math.max(0, 2000 - subtotal)
  };
}
