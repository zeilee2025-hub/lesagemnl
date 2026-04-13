// ===============================
// 💰 CALCULATE SUBTOTAL
// ===============================
export function calculateSubtotal(items) {
  if (!items || items.length === 0) return 0;

  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
}

// ===============================
// 🚚 CALCULATE TOTALS (DYNAMIC SHIPPING)
// ===============================
export function calculateTotals(items, region = "Metro Manila") {
  const subtotal = calculateSubtotal(items);

  let shipping = 0;

  // 🎯 FREE SHIPPING
  if (subtotal >= 2000) {
    shipping = 0;
  } else if (subtotal > 0) {
    // 📍 REGION LOGIC
    if (region === "Metro Manila") {
      shipping = 99;
    } else {
      shipping = 149;
    }
  }

  const total = subtotal + shipping;

  return {
    subtotal,
    shipping,
    total,

    // 🧠 EXTRA (for UI)
    isFreeShipping: subtotal >= 2000,
    remainingForFree: Math.max(0, 2000 - subtotal)
  };
}