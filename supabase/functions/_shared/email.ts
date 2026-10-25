const RESEND_API = "https://api.resend.com/emails";
const FROM_ADDRESS = "Almara <ola@almara.com.br>";

function resendApiKey(): string {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) throw new Error("RESEND_API_KEY not configured");
  return key;
}

function formatCentsBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Tudo que vem do pedido (nome, endereço, CEP — digitados no checkout) passa por aqui antes de entrar
// no HTML: sem isso, um nome como "<a href=...>" virava link de verdade num e-mail com a marca Almara.
export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export interface OrderConfirmationEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalCents: number;
  /** Chás depois do desconto do cupom (sem frete). */
  subtotalCents: number;
  shippingFeeCents: number;
  couponCode: string | null;
  items: { name: string; qty: number; unitPriceCents: number }[];
  shipping: {
    rua: string;
    numero: string;
    complemento: string | null;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
}

export function buildOrderConfirmationHtml(data: OrderConfirmationEmailData): string {
  const e = escapeHtml;
  const itemsHtml = data.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${i.qty}× ${e(i.name)}</td><td style="padding:6px 0;text-align:right">${formatCentsBRL(i.unitPriceCents * i.qty)}</td></tr>`,
    )
    .join("");
  const itemsCents = data.items.reduce((sum, i) => sum + i.unitPriceCents * i.qty, 0);
  const discountCents = itemsCents - data.subtotalCents;
  const discountHtml =
    discountCents > 0
      ? `<tr><td style="padding:6px 0">Desconto${data.couponCode ? ` (${e(data.couponCode)})` : ""}</td><td style="padding:6px 0;text-align:right">− ${formatCentsBRL(discountCents)}</td></tr>`
      : "";
  const shippingHtml = `<tr><td style="padding:6px 0">Frete</td><td style="padding:6px 0;text-align:right">${data.shippingFeeCents > 0 ? formatCentsBRL(data.shippingFeeCents) : "grátis"}</td></tr>`;
  const s = data.shipping;

  return `
    <div style="font-family:sans-serif;color:#1a1a1a;max-width:480px;margin:0 auto">
      <h2 style="color:#013f24">Pedido confirmado!</h2>
      <p>Olá, ${e(data.customerName)}. Seu pagamento foi aprovado e o pedido <strong>${e(data.orderNumber)}</strong> já está sendo preparado.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        ${itemsHtml}
        ${discountHtml}
        ${shippingHtml}
        <tr>
          <td style="padding-top:10px;border-top:1px solid #ddd;font-weight:bold">Total</td>
          <td style="padding-top:10px;border-top:1px solid #ddd;text-align:right;font-weight:bold">${formatCentsBRL(data.totalCents)}</td>
        </tr>
      </table>
      <p style="margin-top:20px">
        <strong>Endereço de entrega</strong><br/>
        ${e(s.rua)}, ${e(s.numero)}${s.complemento ? ` - ${e(s.complemento)}` : ""}<br/>
        ${e(s.bairro)} — ${e(s.cidade)}/${e(s.uf)}<br/>
        CEP ${e(s.cep)}
      </p>
      <p style="margin-top:24px;color:#666;font-size:13px">Qualquer dúvida, é só responder este e-mail.</p>
    </div>
  `;
}

export async function sendOrderConfirmationEmail(data: OrderConfirmationEmailData): Promise<void> {
  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: data.customerEmail,
      subject: `Pedido ${data.orderNumber} confirmado — Almara`,
      html: buildOrderConfirmationHtml(data),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend email send failed: ${res.status} ${text}`);
  }
}

const SITE = "https://almara.com.br";

/**
 * E-mail de confirmação da newsletter (double opt-in). O link abre /newsletter/confirmar, onde a
 * pessoa clica pra confirmar (POST — scanners de link abrem o GET sozinhos). Quando é a primeira
 * inscrição de quem nunca comprou, leva também o cupom de primeira compra.
 */
export async function sendNewsletterConfirmEmail(
  to: string,
  confirmToken: string,
  coupon: { code: string; percentOff: number } | null,
): Promise<void> {
  const confirmUrl = `${SITE}/newsletter/confirmar?t=${encodeURIComponent(confirmToken)}`;
  const couponBlock = coupon
    ? `
      <p>E o seu cupom de <strong>${coupon.percentOff}% nos chás</strong> na primeira compra (já vale, mesmo antes de confirmar):</p>
      <p style="margin:20px 0;text-align:center">
        <span style="display:inline-block;padding:12px 22px;border:2px dashed #568833;border-radius:10px;font-size:22px;font-weight:bold;letter-spacing:2px;color:#013f24">${coupon.code}</span>
      </p>
      <p>É só digitar o código no carrinho. Ele vale para a primeira compra feita com este e-mail, sobre o valor dos chás (o frete não entra).</p>`
    : "";
  const html = `
    <div style="font-family:sans-serif;color:#1a1a1a;max-width:480px;margin:0 auto">
      <h2 style="color:#013f24">Confirme sua inscrição</h2>
      <p>Recebemos um pedido para inscrever este e-mail na newsletter da Almara. Para começar a receber nossos conteúdos, confirme:</p>
      <p style="margin:24px 0;text-align:center">
        <a href="${confirmUrl}" style="display:inline-block;padding:12px 24px;border-radius:999px;background:#013f24;color:#fffdf8;text-decoration:none;font-weight:bold">Confirmar inscrição</a>
      </p>${couponBlock}
      <p style="margin-top:24px;color:#666;font-size:13px">Se não foi você, é só ignorar este e-mail: sem a confirmação, você não entra na lista.</p>
    </div>
  `;
  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to,
      subject: coupon ? `Confirme sua inscrição (e seu cupom de ${coupon.percentOff}%) — Almara` : "Confirme sua inscrição na newsletter — Almara",
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend email send failed: ${res.status} ${await res.text()}`);
}
