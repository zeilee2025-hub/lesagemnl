// ==========================
// 💳 PAYMENT SERVICE (PAYMONGO - UPDATED)
// ==========================

export async function createPaymentSession({ items, customer, totals, orderId }) {
  try {
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Invalid cart items");
    }

    if (!totals || !totals.total) {
      throw new Error("Invalid totals");
    }

    if (!orderId) {
      throw new Error("Missing orderId");
    }

    const res = await fetch("http://localhost:3000/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items,

        customer: {
          email: customer?.email || null,
          name: customer?.name || "",
          address: customer?.address || "",
          city: customer?.city || "",
          phone: customer?.phone || "",
          region: customer?.region || ""
        },

        totals: {
          subtotal: totals.subtotal,
          shipping: totals.shipping,
          total: totals.total
        },

        orderId   // 🔥 CRITICAL LINK
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Payment session failed");
    }

    if (!data.checkoutUrl) {
      throw new Error("No checkout URL returned");
    }

    window.location.href = data.checkoutUrl;

  } catch (error) {
    console.error("❌ Payment error:", error);
    alert("Payment failed. Please try again.");
    throw error;
  }
}