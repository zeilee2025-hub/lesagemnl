// ==========================
// 💳 PAYMENT SERVICE (PAYMONGO - UPDATED)
// ==========================

export async function createPaymentSession({ items, customer, totals }) {
  try {
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Invalid cart items");
    }

    if (!totals || !totals.total) {
      throw new Error("Invalid totals");
    }

    // ==========================
    // 🔥 CALL YOUR BACKEND
    // ==========================
    const res = await fetch("http://localhost:3000/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items,

        // ✅ FULL CUSTOMER DATA
        customer: {
          email: customer?.email || null,
          name: customer?.name || "",
          address: customer?.address || "",
          city: customer?.city || "",
          phone: customer?.phone || "",
          region: customer?.region || ""
        },

        // ✅ NEW — SEND TOTALS
        totals: {
          subtotal: totals.subtotal,
          shipping: totals.shipping,
          total: totals.total
        }
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Payment session failed");
    }

    if (!data.checkoutUrl) {
      throw new Error("No checkout URL returned");
    }

    // ==========================
    // 🚀 REDIRECT TO PAYMONGO
    // ==========================
    window.location.href = data.checkoutUrl;

  } catch (error) {
    console.error("❌ Payment error:", error);
    alert("Payment failed. Please try again.");
    throw error;
  }
}