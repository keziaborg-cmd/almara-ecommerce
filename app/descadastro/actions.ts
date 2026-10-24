"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Descadastro pelo link da mensagem. Não há login: o id da mensagem (UUID aleatório que só a
 * pessoa recebeu) é o que autoriza, e a função do banco só retira o consentimento do canal
 * daquela mensagem. É POST de propósito: scanners de link dos provedores de e-mail abrem o GET
 * sozinhos, e isso não pode descadastrar ninguém.
 */
export async function unsubscribe(formData: FormData): Promise<void> {
  const m = String(formData.get("m") ?? "");
  if (!UUID_RE.test(m)) redirect("/descadastro?erro=link");
  let channel: string | null = null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("crm_unsubscribe", { p_message_id: m });
    if (error) throw error;
    channel = data;
  } catch (e) {
    console.error(JSON.stringify({ src: "site-unsubscribe", evt: "failed", message: e instanceof Error ? e.message.slice(0, 120) : "erro" }));
    redirect(`/descadastro?m=${m}&erro=falha`);
  }
  redirect(channel ? `/descadastro?ok=${channel}` : "/descadastro?erro=link");
}

/** Descadastro da newsletter pelo token do e-mail (link "Cancelar inscrição"). Mesmo cuidado: POST. */
export async function unsubscribeNewsletter(formData: FormData): Promise<void> {
  const n = String(formData.get("n") ?? "");
  if (!UUID_RE.test(n)) redirect("/descadastro?erro=link");
  let channel: string | null = null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("newsletter_unsubscribe", { p_token: n });
    if (error) throw error;
    channel = data;
  } catch (e) {
    console.error(JSON.stringify({ src: "site-unsubscribe", evt: "newsletter_failed", message: e instanceof Error ? e.message.slice(0, 120) : "erro" }));
    redirect(`/descadastro?n=${n}&erro=falha`);
  }
  redirect(channel ? `/descadastro?ok=${channel}` : "/descadastro?erro=link");
}
