// Regras de frete do pedido, sem dependência de Deno (testável no vitest). Espelha
// lib/cart/shipping-rules.ts, que o carrinho usa só pra pré-visualizar: o preço que vale é o que
// shop-create-order recalcula aqui, nunca um valor vindo do cliente.
import type { ShippingOption } from "./shippingPackages.ts";

/** Pedidos com produtos a partir deste valor (já com desconto de cupom) têm frete grátis. */
export const FREE_SHIPPING_MIN_CENTS = 10000;

/** Procura o serviço escolhido entre as opções recém-cotadas; null se ele não existe mais. */
export function findShippingOption(options: ShippingOption[], serviceId: unknown): ShippingOption | null {
  if (typeof serviceId !== "string" || !serviceId) return null;
  return options.find((o) => o.serviceId === serviceId) ?? null;
}

/** Quantas opções de entrega o carrinho mostra. Com todas as transportadoras ligadas no Melhor
 * Envio chegam até ~10 opções; uma lista longa confunde e faz desistir. */
export const MAX_SHIPPING_OPTIONS = 3;

/** As opções que o carrinho mostra: a mais barata, a mais rápida e, no meio, a mais barata entre as
 * que valem a pena — nunca uma que seja ao mesmo tempo mais cara E mais lenta que outra (ex.: no
 * Acre, Jadlog R$ 23,39 em 16 dias perde pra Loggi R$ 21,51 em 11; entra o PAC, R$ 27,59 em 9).
 * Se faltar opção assim, completa com as próximas mais baratas. Volta em ordem de preço. */
export function pickShippingOptions(options: ShippingOption[], max = MAX_SHIPPING_OPTIONS): ShippingOption[] {
  if (options.length <= max) return [...options].sort((a, b) => a.priceCents - b.priceCents);
  const byPrice = [...options].sort((a, b) => a.priceCents - b.priceCents || a.deliveryDays - b.deliveryDays);
  const fastest = [...options].sort((a, b) => a.deliveryDays - b.deliveryDays || a.priceCents - b.priceCents)[0];
  // "vale a pena": nenhuma outra opção é mais barata (ou igual) e mais rápida (ou igual) ao mesmo tempo
  const worthIt = (o: ShippingOption) =>
    !options.some(
      (x) => x !== o && x.priceCents <= o.priceCents && x.deliveryDays <= o.deliveryDays && (x.priceCents < o.priceCents || x.deliveryDays < o.deliveryDays),
    );
  const picked = new Map<string, ShippingOption>();
  picked.set(byPrice[0].serviceId, byPrice[0]);
  picked.set(fastest.serviceId, fastest);
  for (const o of byPrice) {
    if (picked.size >= max) break;
    if (worthIt(o)) picked.set(o.serviceId, o);
  }
  for (const o of byPrice) {
    if (picked.size >= max) break;
    picked.set(o.serviceId, o);
  }
  return [...picked.values()].sort((a, b) => a.priceCents - b.priceCents);
}

/** Frete cobrado do cliente. `subtotalAfterCouponCents` é o valor dos produtos já com cupom. */
export function chargedShippingCents(quoteCents: number, subtotalAfterCouponCents: number): number {
  return subtotalAfterCouponCents >= FREE_SHIPPING_MIN_CENTS ? 0 : quoteCents;
}

export function normalizeCep(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const digits = raw.replace(/\D/g, "");
  return digits.length === 8 ? digits : null;
}

export const MAX_UNITS_PER_QUOTE = 60;

/** Valida e normaliza os itens (slug + qty inteira ≥ 1, até MAX_UNITS_PER_QUOTE unidades). */
export function parseQuoteItems(raw: unknown): { slug: string; qty: number }[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 20) return null;
  const merged = new Map<string, number>();
  let units = 0;
  for (const it of raw) {
    const slug = typeof it?.slug === "string" ? it.slug : "";
    const qty = it?.qty;
    if (!slug || slug.length > 60 || !Number.isInteger(qty) || qty < 1) return null;
    units += qty;
    if (units > MAX_UNITS_PER_QUOTE) return null;
    merged.set(slug, (merged.get(slug) ?? 0) + qty);
  }
  return [...merged].map(([slug, qty]) => ({ slug, qty }));
}

/** O CEP existe nos Correios? Consulta o ViaCEP. true/false quando ele responde; null quando não dá
 * pra saber (fora do ar, resposta estranha) — aí quem chama trata como falha temporária. */
export async function cepExists(cep: string, fetchFn: typeof fetch = fetch): Promise<boolean | null> {
  try {
    const res = await fetchFn(`https://viacep.com.br/ws/${cep}/json/`, { signal: AbortSignal.timeout(4000) });
    if (res.status === 400) return false;
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.erro === true || data?.erro === "true") return false;
    return typeof data?.cep === "string" ? true : null;
  } catch {
    return null;
  }
}

export const CEP_NOT_FOUND_MESSAGE =
  "Não encontramos este CEP nos Correios. Confira o CEP da sua rua (CEPs terminados em 000 costumam ser da cidade toda e não servem para entrega).";
