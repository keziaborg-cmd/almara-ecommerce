"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Confirmação da newsletter pelo link do e-mail. O token (UUID aleatório que só chegou na caixa de
 * entrada da pessoa) é o que prova que o e-mail é dela. É POST de propósito: scanners de link dos
 * provedores de e-mail abrem o GET sozinhos, e isso não pode confirmar ninguém.
 */
export async function confirmNewsletter(formData: FormData): Promise<void> {
  const t = String(formData.get("t") ?? "");
  if (!UUID_RE.test(t)) redirect("/newsletter/confirmar?erro=link");
  let ok = false;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("newsletter_confirm", { p_token: t });
    if (error) throw error;
    ok = data === true;
  } catch (e) {
    console.error(JSON.stringify({ src: "site-newsletter-confirm", evt: "failed", message: e instanceof Error ? e.message.slice(0, 120) : "erro" }));
    redirect(`/newsletter/confirmar?t=${t}&erro=falha`);
  }
  redirect(ok ? "/newsletter/confirmar?ok=1" : "/newsletter/confirmar?erro=link");
}
