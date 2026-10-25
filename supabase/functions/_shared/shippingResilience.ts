// Regras (sem rede, sem banco) de duas proteções da cotação no Melhor Envio:
//  - cotação guardada: a conta do Melhor Envio (a mesma do app) aceita 250 requisições por minuto e
//    cada cotação faz uma por caixa; quem cotasse em sequência derrubava o frete de todo mundo.
//    Mesmo CEP + mesmas caixas reaproveita a cotação por alguns minutos, e se o Melhor Envio falhar
//    (limite, fora do ar, token) usa a última guardada em vez de travar o checkout.
//  - renovação do token: o access_token vale 30 dias e o refresh_token 45. Renovar com 3 dias de
//    folga (e não 1 h) dá várias tentativas antes de vencer; se a renovação falhar e o token atual
//    ainda vale, segue com ele e registra o erro.
import type { ShippingOption, ShippingPackage } from "./shippingPackages.ts";

export const QUOTE_FRESH_MS = 10 * 60 * 1000;
export const QUOTE_STALE_MS = 24 * 60 * 60 * 1000;
export const TOKEN_REFRESH_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

export async function quoteCacheKey(env: string, originCep: string, destinationCep: string, packages: ShippingPackage[]): Promise<string> {
  const material = JSON.stringify([
    env,
    originCep.replace(/\D/g, ""),
    destinationCep.replace(/\D/g, ""),
    packages.map((p) => [p.lengthCm, p.widthCm, p.heightCm, p.weightGrams]),
  ]);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(material));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export interface CachedQuote {
  options: ShippingOption[];
  created_at: string;
}

/** "fresh" = usar sem chamar o Melhor Envio; "fallback" = só se a chamada falhar; null = não serve. */
export function cachedQuoteUse(cached: CachedQuote | null, now: number): "fresh" | "fallback" | null {
  if (!cached || !Array.isArray(cached.options)) return null;
  const age = now - Date.parse(cached.created_at);
  if (!Number.isFinite(age) || age < 0) return null;
  if (age < QUOTE_FRESH_MS) return "fresh";
  if (age < QUOTE_STALE_MS) return "fallback";
  return null;
}

export type TokenAction = "use" | "refresh_optional" | "refresh_required";

/** use = token com folga; refresh_optional = tenta renovar, mas o atual ainda vale; refresh_required = vencido. */
export function tokenAction(expiresAt: string, now: number): TokenAction {
  const left = Date.parse(expiresAt) - now;
  if (!Number.isFinite(left) || left <= 60 * 1000) return "refresh_required";
  if (left > TOKEN_REFRESH_WINDOW_MS) return "use";
  return "refresh_optional";
}
