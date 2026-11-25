// Para onde mandar quem quer baixar o Almara+. O QR Code e os botões do site apontam SEMPRE pra
// almara.com.br/app (app/app/route.ts), que decide pelo aparelho: assim o QR impresso não muda
// quando o app entrar nas lojas — basta preencher os links abaixo.
//
// Enquanto o app não está publicado, os dois ficam null e todo mundo vai pra página do Almara+.
// iPhone: em análise na Apple. Quando for aprovado, preencher APP_STORE_ID (o número de
// apps.apple.com/br/app/id…) e trocar APP_STORE_LIVE para true — a página /lu deixa de mostrar
// "Em breve na App Store" e a lista de espera.
export const APP_STORE_ID: string | null = null;
export const APP_STORE_LIVE = false;
export const APP_STORE_URL: string | null = APP_STORE_LIVE && APP_STORE_ID ? `https://apps.apple.com/br/app/id${APP_STORE_ID}` : null;
// Android: publicado no Google Play (produção, Brasil) desde 08/11/2026.
export const PLAY_PACKAGE = "com.almaraplus.app";
export const PLAY_STORE_URL: string | null = `https://play.google.com/store/apps/details?id=${PLAY_PACKAGE}`;

export const APP_FALLBACK_PATH = "/almara-mais";

/** Link do QR Code da página de pedido confirmado (com a origem pra medir quem chegou por ele). */
export const ORDER_QR_PATH = "/app?utm_source=site&utm_medium=qr&utm_campaign=pedido_confirmado";

export type AppPlatform = "ios" | "android" | "other";

export function platformFromUserAgent(ua: string | null): AppPlatform {
  if (!ua) return "other";
  if (/android/i.test(ua)) return "android";
  // iPadOS se apresenta como Mac; "Mobile" separa iPad de um Mac de verdade
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && /mobile/i.test(ua))) return "ios";
  return "other";
}

/** Destino do /app: a loja do aparelho, se o app já estiver nela; senão a página do Almara+ (com os
 * parâmetros de campanha, pra a visita entrar no CRM com a origem). */
export function appDestination(
  platform: AppPlatform,
  search: URLSearchParams,
  stores: { ios: string | null; android: string | null } = { ios: APP_STORE_URL, android: PLAY_STORE_URL },
): string {
  const utm = new URLSearchParams();
  for (const [k, v] of search) if (k.startsWith("utm_") && v.length <= 80) utm.set(k, v);
  if (platform === "ios" && stores.ios) return stores.ios;
  if (platform === "android" && stores.android) {
    if (!utm.size) return stores.android;
    // o Google Play repassa "referrer" pro app (atribuição da instalação)
    const u = new URL(stores.android);
    u.searchParams.set("referrer", utm.toString());
    return u.toString();
  }
  return utm.size ? `${APP_FALLBACK_PATH}?${utm.toString()}` : APP_FALLBACK_PATH;
}

/** Origem da visita, lida da URL e repassada às lojas e aos eventos. */
export interface CampaignSource {
  utmSource: string;
  utmMedium: string | null;
}

const UTM_VALUE_RE = /^[A-Za-z0-9._-]{1,60}$/;

/** utm_source/utm_medium da URL (só valores simples); sem utm_source, usa `defaultSource`. */
export function campaignFromSearch(search: URLSearchParams, defaultSource: string): CampaignSource {
  const pick = (k: string) => {
    const v = search.get(k);
    return v && UTM_VALUE_RE.test(v) ? v : null;
  };
  return { utmSource: pick("utm_source") ?? defaultSource, utmMedium: pick("utm_medium") };
}

/** Google Play com a origem no `referrer` (o Play repassa pro app na instalação). */
export function playStoreLink(c: CampaignSource): string | null {
  if (!PLAY_STORE_URL) return null;
  const ref = new URLSearchParams({ utm_source: c.utmSource });
  if (c.utmMedium) ref.set("utm_medium", c.utmMedium);
  const u = new URL(PLAY_STORE_URL);
  u.searchParams.set("referrer", ref.toString());
  return u.toString();
}

/** App Store com link de campanha (ct = origem). null enquanto o app não está na loja. */
export function appStoreLink(c: CampaignSource, storeUrl: string | null = APP_STORE_URL): string | null {
  if (!storeUrl) return null;
  const u = new URL(storeUrl);
  u.searchParams.set("ct", c.utmSource.slice(0, 40));
  return u.toString();
}
