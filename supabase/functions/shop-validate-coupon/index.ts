// Pré-visualização do cupom no carrinho. Pública (o visitante não tem login): deployar com
// --no-verify-jwt. Diz se o código vale agora e qual a regra; o desconto que vale de verdade é o
// que shop-create-order recalcula (lá também entra o limite por cliente, com o e-mail do pedido).
import { makeResponders } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { looksLikeCouponCode, normalizeCouponCode, ruleFromCheck } from "../_shared/coupons.ts";

Deno.serve(async (req) => {
  const { json, preflight } = makeResponders(req);
  const preflightResponse = preflight();
  if (preflightResponse) return preflightResponse;
  if (req.method !== "POST") return json({ code: "method_not_allowed", message: "Método não permitido." }, 405);

  try {
    let body: { code?: unknown; subtotalCents?: unknown };
    try {
      body = await req.json();
    } catch {
      return json({ code: "invalid_request", message: "Requisição inválida." }, 400);
    }
    const code = typeof body?.code === "string" ? normalizeCouponCode(body.code) : "";
    if (!looksLikeCouponCode(code)) return json({ code: "invalid_coupon", message: "Código de desconto inválido." }, 400);
    const subtotal = Number.isInteger(body?.subtotalCents) && (body.subtotalCents as number) >= 0 ? (body.subtotalCents as number) : 0;

    const { data: check, error } = await createAdminClient().rpc("shop_coupon_check", {
      p_code: code,
      p_email: null,
      p_subtotal_cents: subtotal,
    });
    if (error) throw error;
    const rule = ruleFromCheck(check);
    if (!rule) {
      const reason = (check as { reason?: unknown } | null)?.reason;
      return json({ code: "invalid_coupon", message: typeof reason === "string" ? reason : "Código de desconto inválido." }, 400);
    }
    return json({ coupon: rule });
  } catch (e) {
    console.error("shop-validate-coupon error", e);
    return json({ code: "internal_error", message: "Não foi possível validar o cupom agora." }, 500);
  }
});
