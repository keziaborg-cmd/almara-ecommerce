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

export interface OrderConfirmationEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalCents: number;
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

function buildHtml(data: OrderConfirmationEmailData): string {
  const itemsHtml = data.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${i.qty}× ${i.name}</td><td style="padding:6px 0;text-align:right">${formatCentsBRL(i.unitPriceCents * i.qty)}</td></tr>`,
    )
    .join("");

  return `
    <div style="font-family:sans-serif;color:#1a1a1a;max-width:480px;margin:0 auto">
      <h2 style="color:#013f24">Pedido confirmado!</h2>
      <p>Olá, ${data.customerName}. Seu pagamento foi aprovado e o pedido <strong>${data.orderNumber}</strong> já está sendo preparado.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        ${itemsHtml}
        <tr>
          <td style="padding-top:10px;border-top:1px solid #ddd;font-weight:bold">Total</td>
          <td style="padding-top:10px;border-top:1px solid #ddd;text-align:right;font-weight:bold">${formatCentsBRL(data.totalCents)}</td>
        </tr>
      </table>
      <p style="margin-top:20px">
        <strong>Endereço de entrega</strong><br/>
        ${data.shipping.rua}, ${data.shipping.numero}${data.shipping.complemento ? ` - ${data.shipping.complemento}` : ""}<br/>
        ${data.shipping.bairro} — ${data.shipping.cidade}/${data.shipping.uf}<br/>
        CEP ${data.shipping.cep}
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
      html: buildHtml(data),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend email send failed: ${res.status} ${text}`);
  }
}

// Descadastro da newsletter por e-mail (a política promete link em toda comunicação promocional).
const UNSUBSCRIBE_MAILTO = "mailto:ola@almara.com.br?subject=Cancelar%20inscri%C3%A7%C3%A3o%20na%20newsletter";

/** E-mail do pop-up da newsletter: o cupom de primeira compra. */
export async function sendWelcomeCouponEmail(to: string, code: string, percentOff: number): Promise<void> {
  const html = `
    <div style="font-family:sans-serif;color:#1a1a1a;max-width:480px;margin:0 auto">
      <h2 style="color:#013f24">Que bom ter você por aqui</h2>
      <p>Obrigado por se inscrever na newsletter da Almara. Como prometido, aqui está o seu cupom de <strong>${percentOff}% nos chás</strong> na primeira compra:</p>
      <p style="margin:20px 0;text-align:center">
        <span style="display:inline-block;padding:12px 22px;border:2px dashed #568833;border-radius:10px;font-size:22px;font-weight:bold;letter-spacing:2px;color:#013f24">${code}</span>
      </p>
      <p>É só digitar o código no carrinho. Ele vale para a primeira compra feita com este e-mail, sobre o valor dos chás (o frete não entra).</p>
      <p style="margin:24px 0;text-align:center">
        <a href="https://almara.com.br/produtos" style="display:inline-block;padding:12px 24px;border-radius:999px;background:#013f24;color:#fffdf8;text-decoration:none;font-weight:bold">Ver os chás</a>
      </p>
      <p style="margin-top:24px;color:#666;font-size:13px">Você recebeu este e-mail porque se inscreveu na newsletter em almara.com.br. <a href="${UNSUBSCRIBE_MAILTO}" style="color:#666">Cancelar inscrição</a>.</p>
    </div>
  `;
  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to,
      subject: `Seu cupom de ${percentOff}% na primeira compra — Almara`,
      html,
      headers: { "List-Unsubscribe": `<${UNSUBSCRIBE_MAILTO}>` },
    }),
  });
  if (!res.ok) throw new Error(`Resend email send failed: ${res.status} ${await res.text()}`);
}
