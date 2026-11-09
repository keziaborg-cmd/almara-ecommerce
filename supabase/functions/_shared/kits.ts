// Kits da Black Friday e a regra de não acumular descontos. Puro (sem Deno), testável no vitest.
// Espelhado em lib/cart/kits.ts (o carrinho usa pra mostrar; o valor que vale é o daqui).
//
// - Kit tem preço fixo: o desconto progressivo (1, 2, 3+ latas) não vale pra kit, e kit não conta
//   na quantidade de latas avulsas.
// - Cupom vale só nas latas avulsas; carrinho só de kits recusa o cupom; o pedido mínimo do cupom
//   olha só as latas.
// - Frete: o de sempre (Melhor Envio, grátis a partir de R$ 100 em produtos — kits contam).
//   Pro frete, cada kit vira as latas que vêm nele.
// - Só se compra kit de 27/11/2026 00:00 a 30/11/2026 23:59 (horário de Brasília).
import { tierForCartUnits, unitPriceForTier } from "./pricing.ts";
import { applyCoupon, type CouponRule } from "./coupons.ts";

/** Início e fim (exclusivo) da Black Friday, em horário de Brasília (UTC−3, sem horário de verão). */
export const KITS_SALE_START_MS = Date.parse("2026-11-27T00:00:00-03:00");
export const KITS_SALE_END_MS = Date.parse("2026-12-01T00:00:00-03:00");

export function kitsOnSale(nowMs: number): boolean {
  return nowMs >= KITS_SALE_START_MS && nowMs < KITS_SALE_END_MS;
}

/** Quanto tempo um pedido pendente segura as unidades de kit (shop_kit_hold). O Pix do pedido vence
 * 1 minuto antes; 30 min é o prazo mínimo do Pix no Mercado Pago. */
export const KIT_HOLD_MINUTES = 35;
export const PIX_BEFORE_HOLD_END_MS = 60_000;

export const COUPON_NOT_FOR_KITS = "Cupom não vale para kits.";

export interface CatalogProduct {
  id?: string;
  slug: string;
  name: string;
  kind: "lata" | "kit";
  price_cents: number;
  price_tier2_cents: number;
  price_tier3_cents: number;
  /** Só kits: slugs dos chás que vêm no kit (1 lata de cada). */
  kit_components?: string[] | null;
}

export interface PricedLine {
  product_id?: string;
  product_slug: string;
  product_name: string;
  kind: "lata" | "kit";
  unit_price_cents: number;
  qty: number;
  subtotal_cents: number;
}

export interface PricedCart {
  lines: PricedLine[];
  /** Latas avulsas: as únicas que definem a faixa de preço e recebem cupom. */
  latasUnits: number;
  latasSubtotalCents: number;
  kitsSubtotalCents: number;
  hasKits: boolean;
}

/** Preço de cada linha: latas pela faixa (contando só latas avulsas), kits pelo preço fixo. */
export function priceCart(items: { slug: string; qty: number }[], catalog: Map<string, CatalogProduct>): PricedCart {
  const latasUnits = items.reduce((sum, i) => sum + (catalog.get(i.slug)?.kind === "kit" ? 0 : i.qty), 0);
  const tier = tierForCartUnits(latasUnits);
  const lines = items.map((item) => {
    const p = catalog.get(item.slug);
    if (!p) throw new Error(`produto desconhecido: ${item.slug}`);
    const unit = p.kind === "kit" ? p.price_cents : unitPriceForTier(tier, p);
    return {
      product_id: p.id,
      product_slug: p.slug,
      product_name: p.name,
      kind: p.kind,
      unit_price_cents: unit,
      qty: item.qty,
      subtotal_cents: unit * item.qty,
    };
  });
  const latasSubtotalCents = lines.filter((l) => l.kind === "lata").reduce((s, l) => s + l.subtotal_cents, 0);
  const kitsSubtotalCents = lines.filter((l) => l.kind === "kit").reduce((s, l) => s + l.subtotal_cents, 0);
  return { lines, latasUnits, latasSubtotalCents, kitsSubtotalCents, hasKits: lines.some((l) => l.kind === "kit") };
}

/** Cupom só nas latas avulsas. Devolve o valor dos produtos (latas com cupom + kits) e o frete. */
export function applyCouponToCart(
  rule: CouponRule | null,
  cart: Pick<PricedCart, "latasSubtotalCents" | "kitsSubtotalCents">,
  shippingFeeCents: number,
): { subtotalCents: number; shippingFeeCents: number } {
  if (!rule) return { subtotalCents: cart.latasSubtotalCents + cart.kitsSubtotalCents, shippingFeeCents };
  const r = applyCoupon(rule, cart.latasSubtotalCents, shippingFeeCents);
  return { subtotalCents: r.subtotalCents + cart.kitsSubtotalCents, shippingFeeCents: r.shippingFeeCents };
}

/** Itens pro frete: cada kit vira 1 lata de cada sabor que vem nele (peso e caixa reais). */
export function expandKitsForShipping(
  items: { slug: string; qty: number }[],
  catalog: Map<string, Pick<CatalogProduct, "kind" | "kit_components">>,
): { slug: string; qty: number }[] {
  const out = new Map<string, number>();
  for (const it of items) {
    const p = catalog.get(it.slug);
    const parts = p?.kind === "kit" ? (p.kit_components ?? []) : [it.slug];
    for (const s of parts) out.set(s, (out.get(s) ?? 0) + it.qty);
  }
  return [...out].map(([slug, qty]) => ({ slug, qty }));
}

/** Slugs que o servidor precisa buscar no catálogo: os do carrinho e os sabores dos kits. */
export function kitComponentSlugs(products: Pick<CatalogProduct, "kind" | "kit_components">[]): string[] {
  return [...new Set(products.flatMap((p) => (p.kind === "kit" ? (p.kit_components ?? []) : [])))];
}

/** Sabores do kit por extenso, pro e-mail do pedido e a nota fiscal. */
export function kitContentsText(components: string[], names: Map<string, string>): string {
  return components.map((s) => names.get(s) ?? s).join(", ");
}

/** Boleto pode ser pago dias depois: não dá pra segurar a unidade do kit até lá. */
export function paymentMethodAllowedForKits(paymentMethodId: unknown, paymentTypeId: unknown): boolean {
  return paymentTypeId !== "ticket" && paymentMethodId !== "bolbradesco" && paymentMethodId !== "pec";
}
