const MP_API = "https://api.mercadopago.com";

function accessToken(): string {
  const token = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");
  return token;
}

export interface MpPreferenceItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: "BRL";
}

export async function createPreference(params: {
  items: MpPreferenceItem[];
  externalReference: string;
  notificationUrl: string;
  payerEmail: string;
}): Promise<{ id: string }> {
  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: params.items,
      external_reference: params.externalReference,
      notification_url: params.notificationUrl,
      payer: { email: params.payerEmail },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mercado Pago preference creation failed: ${res.status} ${text}`);
  }

  return res.json();
}

export interface MpPixTransactionData {
  qr_code?: string;
  qr_code_base64?: string;
  ticket_url?: string;
}

export interface MpPayment {
  id: number;
  status: string;
  status_detail: string;
  external_reference: string;
  payment_method_id?: string;
  payment_type_id?: string;
  transaction_amount?: number;
  currency_id?: string;
  // Presentes só em pagamentos Pix — a API já devolve isso pronto na criação
  // do pagamento, sem precisar de chamada extra.
  date_of_expiration?: string;
  point_of_interaction?: {
    transaction_data?: MpPixTransactionData;
  };
}

// O formData vem do navegador (Payment Brick): dele só aproveitamos os dados do meio de
// pagamento (token do cartão, parcelas, emissor, pagador). Valor, referência e URL de
// notificação são sempre do servidor — senão o comprador escolheria quanto paga.
export function buildPaymentBody(
  formData: Record<string, unknown>,
  params: { amountCents: number; externalReference: string; notificationUrl: string },
): Record<string, unknown> {
  return {
    ...formData,
    transaction_amount: params.amountCents / 100,
    external_reference: params.externalReference,
    notification_url: params.notificationUrl,
  };
}

// Chave estável pro mesmo envio: clique duplo ou reenvio com o mesmo token de cartão (o Brick
// gera um token novo a cada envio) cai no mesmo pagamento do Mercado Pago em vez de cobrar
// duas vezes. Nova tentativa (outro token, ou depois de uma tentativa registrada) = chave nova.
export async function paymentIdempotencyKey(
  orderId: string,
  attempt: number,
  formData: Record<string, unknown>,
): Promise<string> {
  const source = [formData.payment_method_id, formData.token].map((v) => (typeof v === "string" ? v : "")).join(":");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(source));
  const hash = Array.from(new Uint8Array(digest).slice(0, 8), (b) => b.toString(16).padStart(2, "0")).join("");
  return `${orderId}:${attempt}:${hash}`;
}

export async function createPayment(params: {
  formData: Record<string, unknown>;
  amountCents: number;
  externalReference: string;
  notificationUrl: string;
  idempotencyKey: string;
}): Promise<MpPayment> {
  const res = await fetch(`${MP_API}/v1/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": params.idempotencyKey,
    },
    body: JSON.stringify(buildPaymentBody(params.formData, params)),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Mercado Pago payment creation failed: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

export async function getPayment(paymentId: string | number): Promise<MpPayment> {
  const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken()}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mercado Pago payment lookup failed: ${res.status} ${text}`);
  }
  return res.json();
}

export function mapMpStatusToOrderStatus(mpStatus: string): "pending" | "approved" | "rejected" | "cancelled" {
  if (mpStatus === "approved") return "approved";
  if (mpStatus === "rejected") return "rejected";
  if (mpStatus === "cancelled" || mpStatus === "refunded" || mpStatus === "charged_back") return "cancelled";
  return "pending";
}
