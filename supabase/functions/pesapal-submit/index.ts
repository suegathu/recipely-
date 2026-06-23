import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const PESAPAL_CONSUMER_KEY = Deno.env.get("PESAPAL_CONSUMER_KEY")!;
const PESAPAL_CONSUMER_SECRET = Deno.env.get("PESAPAL_CONSUMER_SECRET")!;
const PESAPAL_BASE_URL = Deno.env.get("PESAPAL_BASE_URL") ?? "https://pay.pesapal.com/v3/api";
const PESAPAL_CALLBACK_URL = Deno.env.get("PESAPAL_CALLBACK_URL") ?? "";
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

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pesapal auth failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.token;
}

async function registerIpn(token: string, ipnUrl: string): Promise<string> {
  const res = await fetch(`${PESAPAL_BASE_URL}/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: ipnUrl,
      ipn_notification_type: "POST",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IPN registration failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.ipn_id;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (order.customer_id !== user.id) {
      return new Response(JSON.stringify({ error: "Not your order" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getPesapalToken();

    const ipnUrl = `${SUPABASE_URL}/functions/v1/pesapal-ipn`;
    const ipnId = await registerIpn(token, ipnUrl);

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("email, display_name, phone")
      .eq("uid", user.id)
      .single();

    const submitRes = await fetch(`${PESAPAL_BASE_URL}/Transactions/SubmitOrderRequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: orderId,
        currency: "KES",
        amount: Number(order.total_amount),
        description: `Plitso Order #${orderId.slice(0, 8)}`,
        callback_url: PESAPAL_CALLBACK_URL || `${SUPABASE_URL}/functions/v1/pesapal-status?orderId=${orderId}`,
        notification_id: ipnId,
        billing_address: {
          email_address: profile?.email ?? user.email ?? "",
          phone_number: profile?.phone ?? "",
          first_name: profile?.display_name?.split(" ")[0] ?? "",
          last_name: profile?.display_name?.split(" ").slice(1).join(" ") ?? "",
        },
      }),
    });

    if (!submitRes.ok) {
      const errorText = await submitRes.text();
      return new Response(JSON.stringify({ error: `Pesapal submit failed: ${errorText}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const submitData = await submitRes.json();

    await supabase.from("orders").update({
      pesapal_order_tracking_id: submitData.order_tracking_id,
      pesapal_merchant_reference: orderId,
      updated_at: new Date().toISOString(),
    }).eq("id", orderId);

    return new Response(JSON.stringify({
      paymentUrl: submitData.redirect_url,
      orderTrackingId: submitData.order_tracking_id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
