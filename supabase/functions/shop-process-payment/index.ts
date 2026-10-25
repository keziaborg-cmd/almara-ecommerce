import { makeResponders } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { createPayment, paymentIdempotencyKey } from "../_shared/mercadopago.ts";
import { applyPaymentUpdate } from "../_shared/payment-events.ts";
import { crmTrack, sanitizeTracking } from "../_shared/crm.ts";

interface RequestBody {
  orderNumber: string;
  accessToken: string;
  formData: Record<string, unknown>;
  tracking?: unknown;
}

Deno.serve(async (req) => {
  const { json, preflight } = makeResponders(req);
  const preflightResponse = preflight();
  if (preflightResponse) return preflightResponse;

  try {
    const { orderNumber, accessToken, formData, tracking: rawTracking }: RequestBody = await req.json();
    if (!orderNumber || !accessToken || !formData) {
      return json({ message: "Requisição inválida." }, 400);
    }
    const tracking = sanitizeTracking(rawTracking);

    const supabase = createAdminClient();

    const { data: order, error: orderError } = await supabase
      .from("shop_orders")
      .select("id, order_number, status, customer_id, nome, email, telefone, total_cents")
      .eq("order_number", orderNumber)
      .eq("access_token", accessToken)
      .maybeSingle();

    if (orderError) throw orderError;
    if (!order) return json({ message: "Pedido não encontrado." }, 404);

    if (order.status === "approved") {
      return json({ status: "approved" });
    }

    const { count: previousAttempts } = await supabase
      .from("shop_payment_attempts")
      .select("id", { count: "exact", head: true })
      .eq("order_id", order.id);

    const who = {
      email: order.email,
      phone: order.telefone,
      personName: order.nome,
      shopCustomerId: order.customer_id,
      anonymousId: tracking.anonymousId,
      sessionId: tracking.sessionId,
    };
    const attempt = (previousAttempts ?? 0) + 1;
    const paymentMethod = typeof formData.payment_method_id === "string" ? formData.payment_method_id : null;

    await crmTrack(supabase, {
      ...who,
      name: "payment_started",
      properties: { order_id: order.id, order_number: order.order_number, amount_cents: order.total_cents, payment_method: paymentMethod, attempt },
    });

    const functionsBaseUrl = Deno.env.get("SUPABASE_URL")!.replace(".supabase.co", ".functions.supabase.co");
    let payment;
    try {
      payment = await createPayment({
        formData,
        amountCents: order.total_cents,
        externalReference: order.order_number,
        notificationUrl: `${functionsBaseUrl}/shop-mercadopago-webhook`,
        idempotencyKey: await paymentIdempotencyKey(order.id, attempt, formData),
      });
    } catch (paymentErr) {
      await crmTrack(supabase, {
        ...who,
        name: "payment_failed",
        properties: { order_id: order.id, order_number: order.order_number, amount_cents: order.total_cents, payment_method: paymentMethod, attempt, reason: "processing_error" },
      });
      throw paymentErr;
    }

    const orderStatus = (await applyPaymentUpdate(supabase, payment, tracking)) ?? "pending";

    if (orderStatus === "rejected") {
      return json({
        status: "rejected",
        message: "Pagamento recusado. Verifique os dados e tente novamente.",
      });
    }

    // Pix vem "pending" na criação — a pessoa ainda precisa escanear/pagar
    // o QR Code. Repassa os dados prontos que o Mercado Pago já devolve
    // (nenhuma chamada extra necessária) pro frontend poder mostrá-los.
    const transactionData = payment.point_of_interaction?.transaction_data;
    const pix = transactionData?.qr_code
      ? {
          qrCode: transactionData.qr_code,
          qrCodeBase64: transactionData.qr_code_base64 ?? null,
          expiresAt: payment.date_of_expiration ?? null,
        }
      : undefined;

    return json({ status: orderStatus, mpPaymentId: payment.id, pix });
  } catch (err) {
    console.error("shop-process-payment error", err);
    return json({ message: "Erro ao processar o pagamento." }, 500);
  }
});
