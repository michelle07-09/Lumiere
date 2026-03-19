// ── Lumière Mobile — Supabase Helper ─────────────────────────────────────────
// Same database as web, orders tagged with source: "mobile"

const SUPABASE_URL      = "https://dcroqgupxhvcoshgezzt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_5OcpmINr0I15sHXz3Puhgg_98j3QyaW";

/**
 * Save an order to Supabase from the mobile app.
 * @param {Object} orderData — same shape as web, source auto-set to "mobile"
 * @returns {{ success: boolean, order: Object }}
 */
export async function saveOrder(orderData) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "apikey":        SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Prefer":        "return=representation",
      },
      body: JSON.stringify({
        ...orderData,
        source: "mobile",   // ← distinguishes from web orders
        currency: orderData.currency || "USD",
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Supabase error:", errText);
      throw new Error(errText);
    }

    const data = await res.json();
    return { success: true, order: data[0] };

  } catch (e) {
    console.error("saveOrder failed:", e);
    // Fallback: return local ID so checkout still completes
    return { success: false, order: { id: `MOB-${Date.now()}` } };
  }
}

/**
 * Fetch orders for this device (not used yet, ready for order history screen)
 * @param {string} email — filter by customer email
 */
export async function fetchOrdersByEmail(email) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/orders?select=*&customer->>email=eq.${encodeURIComponent(email)}&order=created_at.desc`;
    const res = await fetch(url, {
      headers: {
        "apikey":        SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (e) {
    console.error("fetchOrders failed:", e);
    return [];
  }
}