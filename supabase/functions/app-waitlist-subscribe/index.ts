// Lista de espera do Almara+ no iPhone (página /lu, enquanto o app está em análise na Apple).
// Pública (o visitante não tem login): deployar com --no-verify-jwt. Guarda o e-mail em
// public.app_waitlist e manda um e-mail de confirmação (no máximo um por hora por e-mail). O
// consentimento é só para o aviso de quando o app chegar na App Store — não entra na newsletter
// nem no CRM. Resposta igual pra todo mundo: não revela se o e-mail já estava na lista.
import { makeResponders } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { sendAppWaitlistConfirmEmail } from "../_shared/email.ts";
import { parseWaitlistRequest } from "../_shared/waitlist.ts";

const RESEND_CONFIRM_MS = 60 * 60 * 1000;

Deno.serve(async (req) => {
  const { json, preflight } = makeResponders(req);
  const preflightResponse = preflight();
  if (preflightResponse) return preflightResponse;
  if (req.method !== "POST") return json({ code: "method_not_allowed", message: "Método não permitido." }, 405);

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return json({ code: "invalid_request", message: "Requisição inválida." }, 400);
    }
    const r = parseWaitlistRequest(body);
    if (!r) return json({ code: "invalid_email", message: "Confira o e-mail digitado." }, 400);

    const supabase = createAdminClient();
    const { error: insertError } = await supabase.from("app_waitlist").upsert(
      {
        email: r.email,
        platform: r.platform,
        source: r.source,
        utm_source: r.utmSource,
        utm_medium: r.utmMedium,
        journey: r.journey,
        consent_text_version: r.textVersion,
      },
      { onConflict: "email,platform", ignoreDuplicates: true },
    );
    if (insertError) throw insertError;

    const { data: row, error: readError } = await supabase
      .from("app_waitlist")
      .select("id, confirmed_at, unsubscribed_at, confirm_sent_at, confirm_token")
      .eq("email", r.email)
      .eq("platform", r.platform)
      .maybeSingle();
    if (readError) throw readError;

    const needsConfirmation = row != null && (!row.confirmed_at || row.unsubscribed_at != null);
    const recentlySent = row?.confirm_sent_at != null && Date.now() - Date.parse(row.confirm_sent_at) < RESEND_CONFIRM_MS;
    if (row && needsConfirmation && !recentlySent) {
      try {
        await sendAppWaitlistConfirmEmail(r.email, String(row.confirm_token));
        await supabase
          .from("app_waitlist")
          .update({ confirm_sent_at: new Date().toISOString(), consent_text_version: r.textVersion })
          .eq("id", row.id);
      } catch (e) {
        console.error("app-waitlist-subscribe: e-mail de confirmação falhou", (e as Error).message);
      }
    }

    return json({ ok: true, pendingConfirmation: true });
  } catch (e) {
    console.error("app-waitlist-subscribe error", e);
    return json({ code: "internal_error", message: "Não deu certo agora. Tente de novo em alguns minutos." }, 500);
  }
});
