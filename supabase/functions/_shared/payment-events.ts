import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { mapMpStatusToOrderStatus, type MpPayment } from "./mercadopago.ts";
import { sendOrderConfirmationEmail } from "./email.ts";
import { crmTrack, parseRequestedConsents, type CrmTracking } from "./crm.ts";

type OrderStatus = ReturnType<typeof mapMpStatusToOrderStatus>;

interface OrderRow {
  id: string;
  order_number: string;
  status: OrderStatus;
  mp_payment_id: string | null;
  customer_id: string | null;
  nome: string;
  email: string;
  telefone: string;
  total_cents: number;
  subtotal_cents: number;
  shipping_fee_cents: number;
  coupon_code: string | null;
  requested_consents: unknown;
  rua: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  shop_order_items: { product_slug: string; product_name: string; qty: number; unit_price_cents: number }[];
}

const ORDER_COLUMNS =
  "id, order_number, status, mp_payment_id, customer_id, nome, email, telefone, total_cents, subtotal_cents, shipping_fee_cents, coupon_code, requested_consents, rua, numero, complemento, bairro, cidade, uf, cep, shop_order_items(product_slug, product_name, qty, unit_price_cents)";

// status do Mercado Pago -> evento do CRM. "rejected" é recusa (emissor/antifraude); erro
// técnico ao criar o pagamento é payment_failed, registrado em shop-process-payment.
export function paymentEventName(status: string, statusDetail: string | null | undefined): string {
  switch (status) {
    case "approved":
      return "payment_approved";
    case "rejected":
      return "payment_refused";
    case "cancelled":
      return statusDetail === "expired" ? "payment_expired" : "payment_cancelled";
    case "refunded":
    case "charged_back":
      return "payment_refunded";
    default:
      return "payment_pending";
  }
}

export function paymentMatchesOrder(payment: MpPayment, totalCents: number): boolean {
  if (payment.currency_id !== "BRL" || typeof payment.transaction_amount !== "number") return false;
  return Math.round(payment.transaction_amount * 100) === totalCents;
}

// Único caminho pra aplicar o estado de um pagamento do Mercado Pago a um pedido — usado tanto
// na resposta síncrona (shop-process-payment) quanto no webhook, pra os dois nunca divergirem.
// Devolve o status do pedido depois da atualização, ou null se o pedido não existe.
export async function applyPaymentUpdate(
  supabase: SupabaseClient,
  payment: MpPayment,
  tracking: CrmTracking = {},
): Promise<OrderStatus | null> {
  const { data, error } = await supabase
    .from("shop_orders")
    .select(ORDER_COLUMNS)
    .eq("order_number", payment.external_reference)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const order = data as unknown as OrderRow;

  const now = new Date().toISOString();
  const mpPaymentId = String(payment.id);
  const amountCents = payment.transaction_amount != null ? Math.round(payment.transaction_amount * 100) : null;

  const { error: attemptError } = await supabase.from("shop_payment_attempts").upsert(
    {
      order_id: order.id,
      mp_payment_id: mpPaymentId,
      payment_method_id: payment.payment_method_id ?? null,
      payment_type_id: payment.payment_type_id ?? null,
      status: payment.status,
      status_detail: payment.status_detail ?? null,
      amount_cents: amountCents,
      updated_at: now,
    },
    { onConflict: "mp_payment_id" },
  );
  if (attemptError) console.error("shop_payment_attempts upsert failed", attemptError.message);

  // Só aprova se o Mercado Pago cobrou exatamente o total do pedido, em reais. Um pagamento
  // "approved" com outro valor/moeda não confirma nada: o pedido fica pendente com
  // mp_status_detail = amount_mismatch pra alguém conferir (e estornar) no painel.
  const amountMismatch = payment.status === "approved" && !paymentMatchesOrder(payment, order.total_cents);
  if (amountMismatch) {
    console.error("approved payment does not match order total", {
      order_number: order.order_number,
      mp_payment_id: mpPaymentId,
      amount_cents: amountCents,
      currency_id: payment.currency_id ?? null,
      total_cents: order.total_cents,
    });
  }
  let orderStatus: OrderStatus = amountMismatch ? "pending" : mapMpStatusToOrderStatus(payment.status);

  // Pedido aprovado só muda por causa do próprio pagamento que aprovou (estorno/chargeback) —
  // uma notificação atrasada de outra tentativa (ex.: Pix antigo expirando depois que o cartão
  // aprovou) não pode rebaixar o pedido. A condição vai no próprio UPDATE pra valer mesmo com
  // webhook e resposta síncrona chegando ao mesmo tempo.
  const { data: updated, error: updateError } = await supabase
    .from("shop_orders")
    .update({
      mp_payment_id: mpPaymentId,
      mp_payment_status: payment.status,
      mp_status_detail: amountMismatch ? "amount_mismatch" : (payment.status_detail ?? null),
      status: orderStatus,
      updated_at: now,
    })
    .eq("id", order.id)
    .or(`status.neq.approved,mp_payment_id.eq.${mpPaymentId}`)
    .select("id");
  if (updateError) throw updateError;
  if ((updated?.length ?? 0) === 0) {
    orderStatus = "approved";
    if (payment.status === "approved") {
      console.error("second approved payment for an already approved order — refund needed", {
        order_number: order.order_number,
        mp_payment_id: mpPaymentId,
      });
    }
  }

  if (amountMismatch) return orderStatus;

  const who = {
    email: order.email,
    phone: order.telefone,
    personName: order.nome,
    shopCustomerId: order.customer_id,
    anonymousId: tracking.anonymousId,
    sessionId: tracking.sessionId,
  };
  const items = order.shop_order_items.map((i) => ({
    product_id: i.product_slug,
    product_name: i.product_name,
    quantity: i.qty,
    price_cents: i.unit_price_cents,
  }));

  await crmTrack(supabase, {
    ...who,
    name: paymentEventName(payment.status, payment.status_detail),
    properties: {
      order_id: order.id,
      order_number: order.order_number,
      mp_payment_id: mpPaymentId,
      amount_cents: amountCents,
      payment_method: payment.payment_method_id ?? null,
      payment_type: payment.payment_type_id ?? null,
      status: payment.status,
      reason: payment.status_detail ?? null,
    },
    idempotencyKey: `mp:${mpPaymentId}:${payment.status}`,
    verified: payment.status === "approved",
  });

  if (payment.status === "approved") {
    // Trava atômica: só quem preencher confirmed_at primeiro confirma (o webhook do Mercado Pago
    // reenvia e pode chegar ao mesmo tempo que a resposta síncrona do cartão).
    const { data: won, error: confirmError } = await supabase
      .from("shop_orders")
      .update({ confirmed_at: now })
      .eq("id", order.id)
      .is("confirmed_at", null)
      .select("id");
    if (confirmError) throw confirmError;

    if ((won?.length ?? 0) > 0) {
      const orderProps = {
        order_id: order.id,
        order_number: order.order_number,
        total_cents: order.total_cents,
        coupon: order.coupon_code,
        items,
      };
      // pagamento aprovado: o dado do pedido passa a valer como identidade confirmada
      const paid = { ...who, verified: true };
      await crmTrack(supabase, { ...paid, name: "order_confirmed", properties: orderProps, idempotencyKey: `order:${order.order_number}:confirmed` });
      await crmTrack(supabase, { ...paid, name: "checkout_completed", properties: orderProps, idempotencyKey: `order:${order.order_number}:checkout_completed` });

      // consentimentos marcados no checkout só valem com o pedido pago (e o CRM não deixa um
      // consentimento de checkout desfazer um descadastro)
      const requested = parseRequestedConsents(order.requested_consents);
      for (const channel of requested?.channels ?? []) {
        await crmTrack(supabase, {
          ...paid,
          name: "consent_granted",
          properties: { channel, source: "checkout", text_version: requested?.textVersion ?? null, order_number: order.order_number },
          idempotencyKey: `order:${order.order_number}:consent:${channel}`,
        });
      }

      try {
        await sendOrderConfirmationEmail({
          orderNumber: order.order_number,
          customerName: order.nome,
          customerEmail: order.email,
          totalCents: order.total_cents,
          subtotalCents: order.subtotal_cents,
          shippingFeeCents: order.shipping_fee_cents,
          couponCode: order.coupon_code,
          items: order.shop_order_items.map((i) => ({ name: i.product_name, qty: i.qty, unitPriceCents: i.unit_price_cents })),
          shipping: {
            rua: order.rua,
            numero: order.numero,
            complemento: order.complemento,
            bairro: order.bairro,
            cidade: order.cidade,
            uf: order.uf,
            cep: order.cep,
          },
        });
        await crmTrack(supabase, {
          ...paid,
          name: "email_sent",
          properties: { template: "order_confirmation", kind: "transactional", order_number: order.order_number },
          idempotencyKey: `order:${order.order_number}:email:confirmation`,
        });
      } catch (emailErr) {
        // Não interrompe a confirmação do pedido — só registra pra investigar depois.
        console.error("order confirmation email failed", emailErr);
      }
    }
  }

  if (payment.status === "refunded" || payment.status === "charged_back") {
    await crmTrack(supabase, {
      ...who,
      name: "order_cancelled",
      properties: { order_id: order.id, order_number: order.order_number, reason: payment.status },
      idempotencyKey: `order:${order.order_number}:cancelled`,
    });
  }

  return orderStatus;
}
