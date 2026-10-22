// Pop-up da newsletter: inscreve o e-mail, registra o consentimento de e-mail de marketing no CRM e
// entrega o cupom de primeira compra (na resposta, pra mostrar na tela, e por e-mail). Pública
// (visitante sem login): deployar com --no-verify-jwt.
//
// Privacidade: o código da campanha volta SEMPRE igual na tela (é público; quem confere a primeira
// compra é o checkout), então a resposta não revela se um e-mail já é cliente ou já era inscrito.
// O e-mail com o cupom só sai na PRIMEIRA inscrição de quem nunca comprou — assim a função também
// não vira um jeito de mandar e-mail repetido pra qualquer pessoa.
import { makeResponders } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { crmTrack, sanitizeTracking } from "../_shared/crm.ts";
import { ruleFromCheck } from "../_shared/coupons.ts";
import { sendWelcomeCouponEmail } from "../_shared/email.ts";

const WELCOME_COUPON = "PRIMEIRA10";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

Deno.serve(async (req) => {
  const { json, preflight } = makeResponders(req);
  const preflightResponse = preflight();
  if (preflightResponse) return preflightResponse;
  if (req.method !== "POST") return json({ code: "method_not_allowed", message: "Método não permitido." }, 405);

  try {
    let body: { email?: unknown; textVersion?: unknown; tracking?: unknown };
    try {
      body = await req.json();
    } catch {
      return json({ code: "invalid_request", message: "Requisição inválida." }, 400);
    }
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      return json({ code: "invalid_email", message: "Confira o e-mail digitado." }, 400);
    }
    const textVersion = typeof body?.textVersion === "string" ? body.textVersion.slice(0, 40) : null;
    const tracking = sanitizeTracking(body?.tracking);
    const supabase = createAdminClient();

    // Inscrição (a mesma lista do blog). Já inscrito = segue, sem erro.
    const { data: inserted, error: insertError } = await supabase
      .from("blog_subscribers")
      .upsert({ email, source_slug: "popup" }, { onConflict: "email", ignoreDuplicates: true })
      .select("id");
    if (insertError) throw insertError;
    const isNew = (inserted ?? []).length > 0;

    // newsletter_subscribed já grava o consentimento de e-mail no CRM (crm.consents), com a versão do texto.
    await crmTrack(supabase, {
      email,
      anonymousId: tracking.anonymousId,
      sessionId: tracking.sessionId,
      name: "newsletter_subscribed",
      properties: { source: "newsletter_popup", text_version: textVersion },
      idempotencyKey: `newsletter:${email}:popup`,
    });

    const { data: anyCheck, error: couponError } = await supabase.rpc("shop_coupon_check", { p_code: WELCOME_COUPON, p_email: null, p_subtotal_cents: 0 });
    if (couponError) throw couponError;
    const rule = ruleFromCheck(anyCheck);
    if (!rule || rule.kind !== "percent" || rule.percentOff == null) return json({ subscribed: true, coupon: null });

    if (isNew) {
      const { data: mine } = await supabase.rpc("shop_coupon_check", { p_code: WELCOME_COUPON, p_email: email, p_subtotal_cents: 0 });
      if (ruleFromCheck(mine)) {
        try {
          await sendWelcomeCouponEmail(email, rule.code, rule.percentOff);
        } catch (e) {
          console.error("newsletter-subscribe: e-mail do cupom falhou", (e as Error).message);
        }
      }
    }
    return json({ subscribed: true, coupon: { code: rule.code, percentOff: rule.percentOff } });
  } catch (e) {
    console.error("newsletter-subscribe error", e);
    return json({ code: "internal_error", message: "Não deu certo agora. Tente de novo em alguns minutos." }, 500);
  }
});
