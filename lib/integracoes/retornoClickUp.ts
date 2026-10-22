/**
 * Volta do ClickUp pro app Almara+ (Integração de Tarefas, Fase 2 — 2026-10-21).
 *
 * O ClickUp (OAuth 2.0) devolve ?code=…&state=… nesta URL. Repassamos os dois ao app com um 302 pra
 * almara://integracoes/clickup; o app confere o state e manda o código pra função do Supabase, que
 * troca pelo token com o client_secret (só no servidor). O código sozinho não vale nada sem o secret.
 *
 * Route handler, fora do layout do site: sem analytics nem scripts. Só repassa valores com formato
 * válido; qualquer outra coisa vira error=.
 */
export const DESTINO_APP = "almara://integracoes/clickup";

const CODIGO = /^[A-Za-z0-9_-]{8,256}$/;
const STATE = /^[A-Za-z0-9]{16,64}$/;

export function destinoClickUp(url: string): string {
  const p = new URL(url).searchParams;
  const code = p.get("code") ?? "";
  const state = p.get("state") ?? "";
  if (CODIGO.test(code) && STATE.test(state)) return `${DESTINO_APP}?${new URLSearchParams({ code, state })}`;
  return `${DESTINO_APP}?${new URLSearchParams({ error: p.get("error")?.slice(0, 60) || "sem_codigo" })}`;
}

export const CABECALHOS_RETORNO: Record<string, string> = {
  "Referrer-Policy": "no-referrer",
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};
