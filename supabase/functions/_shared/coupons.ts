// Cupons: a regra de cada código vem do banco (public.shop_coupons, via shop_coupon_check). Este
// arquivo só sabe APLICAR uma regra já validada. Espelhado em lib/cart/coupons.ts (o carrinho usa
// pra pré-visualizar; o valor que vale é o que shop-create-order recalcula aqui).

export type CouponKind = "percent" | "free_shipping";

export interface CouponRule {
  code: string;
  kind: CouponKind;
  /** % nos chás quando kind = "percent". */
  percentOff: number | null;
}

export function normalizeCouponCode(raw: string): string {
  return raw.trim().toUpperCase();
}

/** Formato aceito pela tabela (3 a 24 letras/números). Evita ir ao banco com lixo. */
export function looksLikeCouponCode(code: string): boolean {
  return /^[A-Z0-9]{3,24}$/.test(code);
}

/** Converte o retorno de shop_coupon_check numa regra, ou null se não vale. */
export function ruleFromCheck(check: unknown): CouponRule | null {
  const c = check as { ok?: unknown; code?: unknown; kind?: unknown; percent_off?: unknown } | null;
  if (!c || c.ok !== true || typeof c.code !== "string") return null;
  if (c.kind === "free_shipping") return { code: c.code, kind: "free_shipping", percentOff: null };
  if (c.kind === "percent" && typeof c.percent_off === "number" && c.percent_off >= 1 && c.percent_off <= 90) {
    return { code: c.code, kind: "percent", percentOff: c.percent_off };
  }
  return null;
}

export function applyCoupon(
  rule: CouponRule,
  subtotalCents: number,
  shippingFeeCents: number,
): { subtotalCents: number; shippingFeeCents: number } {
  if (rule.kind === "percent" && rule.percentOff != null) {
    return { subtotalCents: Math.round(subtotalCents * (1 - rule.percentOff / 100)), shippingFeeCents };
  }
  if (rule.kind === "free_shipping") return { subtotalCents, shippingFeeCents: 0 };
  return { subtotalCents, shippingFeeCents };
}
