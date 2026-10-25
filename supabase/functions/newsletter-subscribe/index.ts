// Newsletter (pop-up e captura do blog): inscreve o e-mail como PENDENTE, manda o link de
// confirmação e entrega o cupom de primeira compra na tela. O consentimento de e-mail de marketing
// só vai pro CRM quando a pessoa confirma (newsletter_confirm, página /newsletter/confirmar) — assim
// ninguém inscreve nem reativa o e-mail de outra pessoa. Pública (visitante sem login): deployar
// com --no-verify-jwt.
//
// Privacidade: a resposta é sempre igual (o código da campanha é público; quem confere a primeira
// compra é o checkout), então não revela se um e-mail já é cliente ou já era inscrito. O link de
// confirmação sai no máximo uma vez por hora por e-mail, e o cupom vai no e-mail só na primeira
// inscrição de quem nunca comprou.
import { makeResponders } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { ruleFromCheck } from "../_shared/coupons.ts";
import { sendNewsletterConfirmEmail } from "../_shared/email.ts";

const WELCOME_COUPON = "PRIMEIRA10";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SOURCE_RE = /^[a-z0-9-]{1,120}$/;
const RESEND_CONFIRM_MS = 60 * 60 * 1000;

Deno.serve(async (req) => {
  const { json, preflight } = makeResponders(req);
  const preflightResponse = preflight();
  if (preflightResponse) return preflightResponse;
  if (req.method !== "POST") return json({ code: "method_not_allowed", message: "Método não permitido." }, 405);

  try {
    let body: { email?: unknown; source?: unknown; textVersion?: unknown };
    try {
      body = await req.json();
    } catch {
      return json({ code: "invalid_request", message: "Requisição inválida." }, 400);
    }
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      return json({ code: "invalid_email", message: "Confira o e-mail digitado." }, 400);
    }
    const supabase = createAdminClient();

    const textVersion = typeof body?.textVersion === "string" ? body.textVersion.slice(0, 40) : null;
    const source = typeof body?.source === "string" && SOURCE_RE.test(body.source) ? body.source : "popup";

    // A inscrição nasce pendente: o consentimento no CRM só é gravado quando a pessoa confirma pelo
    // link do e-mail (newsletter_confirm). Quem já está confirmado e ativo não recebe nada de novo;
    // quem saiu ou não confirmou recebe o link de novo, no máximo uma vez por hora.
    const { data: existing, error: findError } = await supabase
      .from("blog_subscribers")
      .select("id, confirmed_at, unsubscribed_at, confirm_sent_at, confirm_token")
      .eq("email", email)
      .maybeSingle();
    if (findError) throw findError;

    let sub = existing;
    let isNew = false;
    if (!sub) {
      const { data: inserted, error: insertError } = await supabase
        .from("blog_subscribers")
        .upsert({ email, source_slug: source, consent_text_version: textVersion }, { onConflict: "email", ignoreDuplicates: true })
        .select("id, confirmed_at, unsubscribed_at, confirm_sent_at, confirm_token");
      if (insertError) throw insertError;
      sub = inserted?.[0] ?? null;
      isNew = sub != null;
    }
    const needsConfirmation = sub != null && (!sub.confirmed_at || sub.unsubscribed_at != null);
    const recentlySent = sub?.confirm_sent_at != null && Date.now() - Date.parse(sub.confirm_sent_at) < RESEND_CONFIRM_MS;

    const { data: anyCheck, error: couponError } = await supabase.rpc("shop_coupon_check", { p_code: WELCOME_COUPON, p_email: null, p_subtotal_cents: 0 });
    if (couponError) throw couponError;
    const rule = ruleFromCheck(anyCheck);
    const coupon = rule && rule.kind === "percent" && rule.percentOff != null ? { code: rule.code, percentOff: rule.percentOff } : null;

    if (sub && needsConfirmation && !recentlySent) {
      // o cupom vai no e-mail só na primeira inscrição de quem nunca comprou
      let emailCoupon: typeof coupon = null;
      if (coupon && isNew) {
        const { data: mine } = await supabase.rpc("shop_coupon_check", { p_code: WELCOME_COUPON, p_email: email, p_subtotal_cents: 0 });
        if (ruleFromCheck(mine)) emailCoupon = coupon;
      }
      try {
        await sendNewsletterConfirmEmail(email, String(sub.confirm_token), emailCoupon);
        await supabase
          .from("blog_subscribers")
          .update({ confirm_sent_at: new Date().toISOString(), consent_text_version: textVersion })
          .eq("id", sub.id);
      } catch (e) {
        console.error("newsletter-subscribe: e-mail de confirmação falhou", (e as Error).message);
      }
    }

    // Resposta igual pra todo mundo: não revela se o e-mail já estava na lista.
    return json({ subscribed: true, pendingConfirmation: true, coupon });
  } catch (e) {
    console.error("newsletter-subscribe error", e);
    return json({ code: "internal_error", message: "Não deu certo agora. Tente de novo em alguns minutos." }, 500);
  }
});
