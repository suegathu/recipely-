import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const PESAPAL_CONSUMER_KEY = Deno.env.get("PESAPAL_CONSUMER_KEY")!;
const PESAPAL_CONSUMER_SECRET = Deno.env.get("PESAPAL_CONSUMER_SECRET")!;
const PESAPAL_BASE_URL = Deno.env.get("PESAPAL_BASE_URL") ?? "https://pay.pesapal.com/v3/api";

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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const orderTrackingId = url.searchParams.get("orderTrackingId");

    if (!orderTrackingId) {
      const body = await req.json().catch(() => ({}));
      if (!body.orderTrackingId) {
        return new Response(JSON.stringify({ error: "orderTrackingId required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const trackingId = orderTrackingId ?? (await req.json().catch(() => ({}))).orderTrackingId;
    const token = await getPesapalToken();

    const res = await fetch(
      `${PESAPAL_BASE_URL}/Transactions/GetTransactionStatus?orderTrackingId=${trackingId}`,
      {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      },
    );

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Failed to check status" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();

    return new Response(JSON.stringify({
      status: data.payment_status_description,
      method: data.payment_method,
      amount: data.amount,
      currency: data.currency,
      description: data.description,
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
