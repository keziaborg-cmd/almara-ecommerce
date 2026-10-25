// Mesmo padrão de lib/site.ts (aqui não dá pra importar TS).
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://almara.com.br").replace(/\/+$/, "");

/** Caminhos renomeados no rebrand: os endereços antigos redirecionam (301) pros novos. */
const RENAMED_PATHS = [
  { from: "/smartea-mais", to: "/almara-mais" },
  { from: "/blog/autor/equipe-smartea", to: "/blog/autor/equipe-almara" },
  { from: "/flora.png", to: "/mara.png" },
  { from: "/flora-cha.png", to: "/mara-cha.png" },
];

const LEGACY_HOST = "(?:www\\.)?smartea\\.com\\.br";

/**
 * Domínio antigo → domínio novo, 301 com caminho e query. Só liga com REDIRECT_LEGACY_DOMAIN=1
 * (Vercel → Environment Variables), DEPOIS que o domínio novo estiver respondendo com HTTPS — ligado
 * antes, mandaria todo mundo pra um endereço fora do ar. O arquivo de verificação do Google fica de
 * fora: o Search Console precisa dele no domínio antigo durante a "Mudança de endereço".
 * Os caminhos renomeados vão direto pro endereço final (um salto só, não dois).
 *
 * @param {Record<string, string | undefined>} [env]
 */
export function legacyDomainRedirects(env = process.env) {
  if (env.REDIRECT_LEGACY_DOMAIN !== "1") return [];
  return [
    ...RENAMED_PATHS.map(({ from, to }) => ({
      source: from,
      has: [{ type: "host", value: LEGACY_HOST }],
      destination: `${SITE_URL}${to}`,
      statusCode: 301,
    })),
    {
      source: "/:path((?!google1e4100e11d0ac91d\\.html$).*)",
      has: [{ type: "host", value: LEGACY_HOST }],
      destination: `${SITE_URL}/:path`,
      statusCode: 301,
    },
  ];
}

const SUPABASE_ORIGIN = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
  } catch {
    return "https://*.supabase.co";
  }
})();

/**
 * Content-Security-Policy do site. Sem nonce (exigiria renderizar toda página na hora, sem cache):
 * 'unsafe-inline' nos scripts fica, mas só carregam scripts/conexões/frames dos domínios abaixo,
 * ninguém enquadra o site e não há plugin. Lista levantada em 2026-10-25 (GA4, Meta Pixel desligado,
 * Mercado Pago Bricks, Supabase, ViaCEP). Começa em Report-Only: o navegador só avisa no console.
 * A página de retorno do Trello tem CSP própria, mais fechada (lib/integracoes/retornoTrello.ts).
 */
export const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://*.googletagmanager.com https://connect.facebook.net https://sdk.mercadopago.com https://http2.mlstatic.com",
  "style-src 'self' 'unsafe-inline' https://http2.mlstatic.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://http2.mlstatic.com",
  "media-src 'self' blob:",
  `connect-src 'self' ${SUPABASE_ORIGIN} https://viacep.com.br https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://connect.facebook.net https://www.facebook.com https://api.mercadopago.com https://*.mercadopago.com https://*.mercadolibre.com https://*.mercadolivre.com https://http2.mlstatic.com`,
  "frame-src https://*.mercadopago.com https://*.mercadolibre.com https://*.mercadolivre.com https://www.mercadolivre.com.br https://www.googletagmanager.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "report-uri /api/csp-report",
].join("; ");

export const SECURITY_HEADERS = [
  { key: "Content-Security-Policy-Report-Only", value: CSP },
  // endereço completo (com ?token= do pedido) nunca vai pra outro site no Referer
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: "/((?!integracoes/trello/retorno).*)", headers: SECURITY_HEADERS }];
  },
  async redirects() {
    return [
      ...legacyDomainRedirects(),
      // A política antiga (/privacidade) foi substituída pela versão que também cobre o
      // aplicativo Almara+. O redirect mantém válidos os links já publicados — carrinho,
      // rodapé e qualquer URL indexada — apontando todos para o documento único.
      { source: "/privacidade", destination: "/politica-de-privacidade", permanent: true },
      // Rebrand Smartea → Almara: endereços antigos continuam funcionando com 301 (permanente),
      // o código que os buscadores tratam como mudança definitiva de URL.
      ...RENAMED_PATHS.map(({ from, to }) => ({ source: from, destination: to, statusCode: 301 })),
    ];
  },
};

export default nextConfig;
