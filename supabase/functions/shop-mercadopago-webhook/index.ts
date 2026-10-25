import { createAdminClient } from "../_shared/supabase-admin.ts";
import { getPayment } from "../_shared/mercadopago.ts";
import { applyPaymentUpdate } from "../_shared/payment-events.ts";

// No CORS/apikey needed — Mercado Pago calls this server-to-server.
// Always re-fetch the payment by id from MP's API rather than trusting the
// notification body, so a forged payload can't inject a fake status.
Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    let type = url.searchParams.get("type") ?? url.searchParams.get("topic");
    let paymentId = url.searchParams.get("data.id") ?? url.searchParams.get("id");

    if (!paymentId && req.method === "POST") {
      const body = await req.json().catch(() => null);
      type = type ?? body?.type ?? body?.action?.split(".")[0];
      paymentId = paymentId ?? body?.data?.id;
    }

    // Id de pagamento do Mercado Pago é numérico; qualquer outra coisa (barra, "?", "..")
    // mudaria o caminho consultado na API com o token da loja.
    if (type !== "payment" || !paymentId || !/^\d{1,20}$/.test(String(paymentId))) {
      return new Response("ok", { status: 200 });
    }

    const payment = await getPayment(paymentId);
    if (!payment.external_reference) {
      return new Response("ok", { status: 200 });
    }

    await applyPaymentUpdate(createAdminClient(), payment);
    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("shop-mercadopago-webhook error", err);
    // Still 200 — MP retries aggressively on non-2xx and we don't want a
    // transient DB hiccup to trigger a storm of redundant retries.
    return new Response("ok", { status: 200 });
  }
});
