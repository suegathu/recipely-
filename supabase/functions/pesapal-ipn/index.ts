import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PESAPAL_CONSUMER_KEY = Deno.env.get("PESAPAL_CONSUMER_KEY")!;
const PESAPAL_CONSUMER_SECRET = Deno.env.get("PESAPAL_CONSUMER_SECRET")!;
const PESAPAL_BASE_URL = Deno.env.get("PESAPAL_BASE_URL") ?? "https://pay.pesapal.com/v3/api";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function getPesapalToken(): Promise<string> {
  const res = await fetch(`${PESAPAL_BASE_URL}/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      consumer_key: PESAPAL_CONSUMER_KEY,
      consumer_secret: PESAPAL_CONSUMER_SECRET,
    }),
  });
  const data = await res.json();
  return data.token;
}

Deno.serve(async (req) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let orderTrackingId: string | null = null;
  let merchantReference: string | null = null;
  let notificationType: string | null = null;

  if (req.method === "POST") {
    const body = await req.json().catch(() => ({}));
    orderTrackingId = body.OrderTrackingId ?? null;
    merchantReference = body.OrderMerchantReference ?? null;
    notificationType = body.OrderNotificationType ?? null;
  } else if (req.method === "GET") {
    const url = new URL(req.url);
    orderTrackingId = url.searchParams.get("OrderTrackingId");
    merchantReference = url.searchParams.get("OrderMerchantReference");
    notificationType = url.searchParams.get("OrderNotificationType");
  }

  if (!orderTrackingId) {
    return new Response("Missing OrderTrackingId", { status: 400 });
  }

  await supabase.from("ipn_logs").insert({
    order_tracking_id: orderTrackingId,
    merchant_reference: merchantReference,
    notification_type: notificationType,
    payload: { orderTrackingId, merchantReference, notificationType, method: req.method },
  });

  try {
    const token = await getPesapalToken();

    const statusRes = await fetch(
      `${PESAPAL_BASE_URL}/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      },
    );

    if (!statusRes.ok) {
      return new Response("Failed to verify transaction", { status: 500 });
    }

    const status = await statusRes.json();
    const statusDesc = (status.payment_status_description ?? "").toLowerCase();

    let orderStatus: string | null = null;
    if (statusDesc === "completed") orderStatus = "paid";
    else if (statusDesc === "failed" || statusDesc === "invalid") orderStatus = "cancelled";

    const updates: Record<string, unknown> = {
      pesapal_payment_status: status.payment_status_description,
      pesapal_payment_method: status.payment_method,
      pesapal_transaction_date: status.created_date,
      updated_at: new Date().toISOString(),
    };
    if (orderStatus) updates.status = orderStatus;

    await supabase
      .from("orders")
      .update(updates)
      .eq("pesapal_order_tracking_id", orderTrackingId);

    return new Response(JSON.stringify({
      orderTrackingId,
      status: status.payment_status_description,
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("IPN processing error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
