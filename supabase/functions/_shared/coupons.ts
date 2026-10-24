// Cupons: a regra de cada código vem do banco (public.shop_coupons, via shop_coupon_check). Este
// arquivo só sabe APLICAR uma regra já validada. Espelhado em lib/cart/coupons.ts (o carrinho usa
// pra pré-visualizar; o valor que vale é o que shop-create-order recalcula aqui).

export type CouponKind = "percent" | "free_shipping";

export type ShippingBenefit = "none" | "free" | "capped";

export interface CouponRule {
  code: string;
  kind: CouponKind;
  /** % nos chás quando kind = "percent". */
  percentOff: number | null;
  /** Benefício no frete, junto (ou não) do desconto nos chás. */
  shipping: ShippingBenefit;
  /** Quando shipping = "capped": até quanto do frete o cupom paga. */
  shippingCapCents: number | null;
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
  const c = check as {
    ok?: unknown;
    code?: unknown;
    kind?: unknown;
    percent_off?: unknown;
    shipping?: unknown;
    shipping_cap_cents?: unknown;
  } | null;
  if (!c || c.ok !== true || typeof c.code !== "string") return null;
  // compatível com o retorno antigo (sem "shipping"): free_shipping = frete grátis
  const shipping: ShippingBenefit =
    c.shipping === "free" || c.shipping === "capped" || c.shipping === "none" ? c.shipping : c.kind === "free_shipping" ? "free" : "none";
  const cap = typeof c.shipping_cap_cents === "number" && c.shipping_cap_cents > 0 ? c.shipping_cap_cents : null;
  if (shipping === "capped" && cap == null) return null;
  const shippingCapCents = shipping === "capped" ? cap : null;
  if (c.kind === "free_shipping") {
    return shipping === "none" ? null : { code: c.code, kind: "free_shipping", percentOff: null, shipping, shippingCapCents };
  }
  if (c.kind === "percent" && typeof c.percent_off === "number" && c.percent_off >= 1 && c.percent_off <= 90) {
    return { code: c.code, kind: "percent", percentOff: c.percent_off, shipping, shippingCapCents };
  }
  return null;
}

export function applyCoupon(
  rule: CouponRule,
  subtotalCents: number,
  shippingFeeCents: number,
): { subtotalCents: number; shippingFeeCents: number } {
  const subtotal =
    rule.kind === "percent" && rule.percentOff != null ? Math.round(subtotalCents * (1 - rule.percentOff / 100)) : subtotalCents;
  const shipping =
    rule.shipping === "free"
      ? 0
      : rule.shipping === "capped" && rule.shippingCapCents != null
        ? Math.max(0, shippingFeeCents - rule.shippingCapCents)
        : shippingFeeCents;
  return { subtotalCents: subtotal, shippingFeeCents: shipping };
}
