/**
 * Volta do Trello pro app Almara+ (Integração de Tarefas, Fase 1 — decisão da Kezia, 2026-10-21).
 *
 * O Trello devolve o token no fragmento da URL (#token=…), que nunca chega ao servidor. Esta página
 * lê o fragmento no navegador, limpa a URL (history.replaceState, pra o token não ficar no histórico)
 * e abre o app em almara://integracoes/trello#token=…; o app manda o token direto pra função do
 * Supabase, que valida, cifra e guarda.
 *
 * Por isso é um route handler e não uma page: não passa pelo layout do site, então não carrega
 * analytics, pixel nem nenhum script de terceiros. A CSP só libera este script (pelo hash).
 */
import { createHash } from "node:crypto";

export const DESTINO_APP = "almara://integracoes/trello";

export const SCRIPT_RETORNO = `(function(){var p=new URLSearchParams(location.hash.slice(1));history.replaceState(null,"",location.pathname);var t=p.get("token");var d="${DESTINO_APP}#"+(t&&/^[A-Za-z0-9]{32,128}$/.test(t)?"token="+t:"error="+encodeURIComponent(p.get("error")||"sem_token"));var a=document.getElementById("voltar");a.href=d;a.hidden=false;location.replace(d);})();`;

const ESTILO = `body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0c3123;color:#fffdf8;font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:24px;box-sizing:border-box}main{max-width:360px}h1{font-weight:400;font-size:24px;margin:0 0 10px}p{color:#d5e3c8;line-height:1.5;margin:0 0 22px}a{display:inline-block;padding:14px 26px;border-radius:28px;background:#fbe7a8;color:#3d2f0c;text-decoration:none}`;

const hash = (s: string) => `'sha256-${createHash("sha256").update(s).digest("base64")}'`;

export const CSP = [
  "default-src 'none'",
  `script-src ${hash(SCRIPT_RETORNO)}`,
  `style-src ${hash(ESTILO)}`,
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join("; ");

export const HTML_RETORNO = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Voltando pro Almara+</title><style>${ESTILO}</style></head><body><main><h1>Voltando pro Almara+</h1><p>Se o app não abrir sozinho, toque no botão.</p><a id="voltar" href="${DESTINO_APP}" hidden>Abrir o Almara+</a></main><script>${SCRIPT_RETORNO}</script></body></html>`;

export const CABECALHOS_RETORNO: Record<string, string> = {
  "Content-Type": "text/html; charset=utf-8",
  "Content-Security-Policy": CSP,
  "Referrer-Policy": "no-referrer",
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Content-Type-Options": "nosniff",
};
