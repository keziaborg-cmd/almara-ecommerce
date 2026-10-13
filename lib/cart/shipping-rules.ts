// Espelha supabase/functions/_shared/shipping.ts (as edge functions em Deno não importam deste
// app, então cada runtime tem a sua cópia — mesmo padrão de coupons.ts). Aqui é só pré-visualização
// no carrinho: o frete cobrado é o que shop-create-order recota no servidor.

/** Pedidos com produtos a partir deste valor (já com desconto de cupom) têm frete grátis. */
export const FREE_SHIPPING_MIN_CENTS = 10000;

export function chargedShippingCents(quoteCents: number, subtotalAfterCouponCents: number): number {
  return subtotalAfterCouponCents >= FREE_SHIPPING_MIN_CENTS ? 0 : quoteCents;
}

export interface ShippingQuoteOption {
  serviceId: string;
  name: string;
  company: string;
  priceCents: number;
  deliveryDays: number;
}

export function formatDeliveryDays(days: number): string {
  return days === 1 ? "1 dia útil" : `${days} dias úteis`;
}
