// Espelho de supabase/functions/_shared/kits.ts (as edge functions em Deno não importam deste app).
// Aqui é só pra mostrar no site; o valor que vale é o que shop-create-order recalcula.
import { applyCoupon, type CouponRule } from "@/lib/cart/coupons";

export const KITS_SALE_START_MS = Date.parse("2026-11-27T00:00:00-03:00");
export const KITS_SALE_END_MS = Date.parse("2026-12-01T00:00:00-03:00");

export function kitsOnSale(nowMs: number): boolean {
  return nowMs >= KITS_SALE_START_MS && nowMs < KITS_SALE_END_MS;
}

/** Agora, no servidor (página do kit refeita a cada minuto). */
export function kitsOnSaleNow(): boolean {
  return kitsOnSale(Date.now());
}

export const COUPON_NOT_FOR_KITS = "Cupom não vale para kits.";

/** Cupom só nas latas avulsas. Devolve o valor dos produtos (latas com cupom + kits) e o frete. */
export function applyCouponToCart(
  rule: CouponRule | null,
  cart: { latasSubtotalCents: number; kitsSubtotalCents: number },
  shippingFeeCents: number,
): { subtotalCents: number; shippingFeeCents: number } {
  if (!rule) return { subtotalCents: cart.latasSubtotalCents + cart.kitsSubtotalCents, shippingFeeCents };
  const r = applyCoupon(rule, cart.latasSubtotalCents, shippingFeeCents);
  return { subtotalCents: r.subtotalCents + cart.kitsSubtotalCents, shippingFeeCents: r.shippingFeeCents };
}
