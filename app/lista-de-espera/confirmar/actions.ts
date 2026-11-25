"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Confirmação da lista de espera do Almara+ (iPhone) pelo link do e-mail. Mesmo cuidado da
 * newsletter: POST de propósito, porque scanners de link dos provedores de e-mail abrem o GET sozinhos.
 */
export async function confirmWaitlist(formData: FormData): Promise<void> {
  const t = String(formData.get("t") ?? "");
  if (!UUID_RE.test(t)) redirect("/lista-de-espera/confirmar?erro=link");
  let ok = false;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("app_waitlist_confirm", { p_token: t });
    if (error) throw error;
    ok = data === true;
  } catch (e) {
    console.error(JSON.stringify({ src: "site-waitlist-confirm", evt: "failed", message: e instanceof Error ? e.message.slice(0, 120) : "erro" }));
    redirect(`/lista-de-espera/confirmar?t=${t}&erro=falha`);
  }
  redirect(ok ? "/lista-de-espera/confirmar?ok=1" : "/lista-de-espera/confirmar?erro=link");
}
