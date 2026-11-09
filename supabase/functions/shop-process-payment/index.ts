import { makeResponders } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { createPayment, paymentIdempotencyKey } from "../_shared/mercadopago.ts";
import { applyPaymentUpdate } from "../_shared/payment-events.ts";
import { couponBlockReason } from "../_shared/coupon-recheck.ts";
import { crmTrack, sanitizeTracking } from "../_shared/crm.ts";
import { kitsOnSale, paymentMethodAllowedForKits, PIX_BEFORE_HOLD_END_MS } from "../_shared/kits.ts";

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
      .select("id, order_number, status, customer_id, nome, email, telefone, total_cents, coupon_code, shop_order_items(subtotal_cents, shop_products(kind))")
      .eq("order_number", orderNumber)
      .eq("access_token", accessToken)
      .maybeSingle();

    if (orderError) throw orderError;
    if (!order) return json({ message: "Pedido não encontrado." }, 404);

    if (order.status === "approved") {
      return json({ status: "approved" });
    }

    // Cupom conferido de novo com o subtotal só das latas avulsas (kit não entra no cupom).
    const isKit = (i: { shop_products: { kind: string } | { kind: string }[] | null }) =>
      (Array.isArray(i.shop_products) ? i.shop_products[0]?.kind : i.shop_products?.kind) === "kit";
    const hasKits = order.shop_order_items.some(isKit);
    const latasSubtotalCents = order.shop_order_items.filter((i) => !isKit(i)).reduce((sum, i) => sum + i.subtotal_cents, 0);
    const couponBlocked = await couponBlockReason(supabase, order, latasSubtotalCents);
    if (couponBlocked) {
      return json({ code: "coupon_unavailable", message: couponBlocked }, 409);
    }

    // Kit: só no período, nada de boleto (pago dias depois) e, com trava no banco, a unidade ainda
    // tem que estar livre — dois pagamentos pela última unidade passam um de cada vez aqui.
    let pixExpiresAtMs: number | null = null;
    if (hasKits) {
      if (!kitsOnSale(Date.now())) {
        return json({ code: "kits_unavailable", message: "Os kits estão disponíveis só de 27/11 a 30/11." }, 409);
      }
      if (!paymentMethodAllowedForKits(formData.payment_method_id, formData.payment_type_id)) {
        return json({ code: "payment_method_not_allowed", message: "Pedidos com kit são pagos por Pix ou cartão." }, 400);
      }
      const { data: hold, error: holdError } = await supabase.rpc("shop_kit_hold", { p_order_id: order.id });
      if (holdError) throw holdError;
      const h = hold as { ok?: boolean; name?: string; hold_until?: string } | null;
      if (!h?.ok) {
        return json({ code: "kit_sold_out", message: `${h?.name ?? "Este kit"} esgotou. Volte ao carrinho e refaça o pedido.` }, 409);
      }
      pixExpiresAtMs = h.hold_until ? Date.parse(h.hold_until) - PIX_BEFORE_HOLD_END_MS : null;
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
        pixExpiresAtMs,
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
