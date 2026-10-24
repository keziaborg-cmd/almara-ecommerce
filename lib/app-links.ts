// Para onde mandar quem quer baixar o Almara+. O QR Code e os botões do site apontam SEMPRE pra
// almara.com.br/app (app/app/route.ts), que decide pelo aparelho: assim o QR impresso não muda
// quando o app entrar nas lojas — basta preencher os links abaixo.
//
// Enquanto o app não está publicado, os dois ficam null e todo mundo vai pra página do Almara+.
export const APP_STORE_URL: string | null = null; // ex.: "https://apps.apple.com/br/app/id6741234567"
export const PLAY_STORE_URL: string | null = null; // quando sair do teste interno: "https://play.google.com/store/apps/details?id=com.almaraplus.app"

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
