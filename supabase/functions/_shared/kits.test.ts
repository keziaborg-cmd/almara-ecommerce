import { describe, expect, it } from "vitest";
import {
  applyCouponToCart,
  type CatalogProduct,
  expandKitsForShipping,
  kitsOnSale,
  paymentMethodAllowedForKits,
  priceCart,
} from "./kits";
import { chargedShippingCents } from "./shipping";
import { buildPaymentBody, mpDateBrasilia } from "./mercadopago";
import type { CouponRule } from "./coupons";
import * as site from "../../../lib/cart/kits";

// Catálogo igual ao de produção (shop_products em 05/11/2026) + os 3 kits da migration.
const lata = (slug: string, name: string, p1: number, p2: number, p3: number): CatalogProduct => ({
  slug, name, kind: "lata", price_cents: p1, price_tier2_cents: p2, price_tier3_cents: p3,
});
const kit = (slug: string, name: string, price: number, components: string[]): CatalogProduct => ({
  slug, name, kind: "kit", price_cents: price, price_tier2_cents: price, price_tier3_cents: price, kit_components: components,
});
const catalog = new Map<string, CatalogProduct>(
  [
    lata("camomila", "Camomila", 2390, 2090, 1990),
    lata("cha-preto", "Chá Preto", 3390, 3090, 2990),
    lata("cha-verde", "Chá Verde", 2290, 1990, 1890),
    lata("cidreira", "Cidreira", 2090, 1790, 1690),
    lata("hibisco", "Hibisco", 2490, 2190, 2090),
    lata("jasmin", "Jasmin", 3990, 3690, 3590),
    kit("kit-dia-inteiro", "Kit Dia Inteiro", 11990, ["camomila", "cidreira", "cha-verde", "cha-preto", "hibisco", "jasmin"]),
    kit("kit-foco", "Kit Foco", 4490, ["cha-preto", "cha-verde"]),
    kit("kit-desacelerar", "Kit Desacelerar", 6290, ["camomila", "cidreira", "jasmin"]),
  ].map((p) => [p.slug, p]),
);
const percent10: CouponRule = { code: "BEM10", kind: "percent", percentOff: 10, shipping: "none", shippingCapCents: null };
const freteZero: CouponRule = { code: "FRETEZERO", kind: "free_shipping", percentOff: null, shipping: "free", shippingCapCents: null };
const QUOTE = 1840; // frete cotado de exemplo

function total(items: { slug: string; qty: number }[], coupon: CouponRule | null = null) {
  const priced = priceCart(items, catalog);
  const { subtotalCents, shippingFeeCents } = applyCouponToCart(coupon, priced, QUOTE);
  const shipping = chargedShippingCents(shippingFeeCents, subtotalCents);
  return { priced, subtotalCents, shipping, totalCents: subtotalCents + shipping };
}

describe("kits: preço, cupom e frete", () => {
  it("1 Kit Dia Inteiro: R$ 119,90 e frete grátis (passa de R$ 100)", () => {
    expect(total([{ slug: "kit-dia-inteiro", qty: 1 }])).toMatchObject({ subtotalCents: 11990, shipping: 0, totalCents: 11990 });
  });
  it("1 Kit Foco: R$ 44,90 + frete cotado", () => {
    expect(total([{ slug: "kit-foco", qty: 1 }])).toMatchObject({ subtotalCents: 4490, shipping: QUOTE, totalCents: 4490 + QUOTE });
  });
  it("Kit Foco + Kit Desacelerar: R$ 107,80 e frete grátis", () => {
    expect(total([{ slug: "kit-foco", qty: 1 }, { slug: "kit-desacelerar", qty: 1 }])).toMatchObject({ subtotalCents: 10780, shipping: 0 });
  });
  it("Kit Desacelerar + 2 latas: faixa de 2 unidades só nas latas, kit não conta", () => {
    const r = total([{ slug: "kit-desacelerar", qty: 1 }, { slug: "camomila", qty: 1 }, { slug: "hibisco", qty: 1 }]);
    expect(r.priced.latasUnits).toBe(2);
    expect(r.priced.lines.map((l) => [l.product_slug, l.unit_price_cents])).toEqual([
      ["kit-desacelerar", 6290],
      ["camomila", 2090],
      ["hibisco", 2190],
    ]);
    expect(r.subtotalCents).toBe(6290 + 2090 + 2190);
  });
  it("cupom com carrinho só de kits: nada a descontar (o servidor recusa antes)", () => {
    const priced = priceCart([{ slug: "kit-foco", qty: 1 }], catalog);
    expect(priced.latasSubtotalCents).toBe(0);
  });
  it("Kit + 1 lata + cupom 10%: desconto só na lata", () => {
    const r = total([{ slug: "kit-foco", qty: 1 }, { slug: "jasmin", qty: 1 }], percent10);
    expect(r.subtotalCents).toBe(4490 + Math.round(3990 * 0.9));
  });
  it("FRETEZERO com lata no carrinho vale; com kit junto, o kit continua sem desconto", () => {
    const r = total([{ slug: "kit-foco", qty: 1 }, { slug: "camomila", qty: 1 }], freteZero);
    expect(r).toMatchObject({ subtotalCents: 4490 + 2390, shipping: 0 });
  });
  it("3 latas sem kit: igual a hoje (faixa 3+)", () => {
    const r = total([{ slug: "camomila", qty: 2 }, { slug: "jasmin", qty: 1 }]);
    expect(r.subtotalCents).toBe(1990 * 2 + 3590);
    expect(r.priced.hasKits).toBe(false);
  });
});

describe("kits: período e pagamento", () => {
  it("só de 27/11 00:00 a 30/11 23:59 em Brasília", () => {
    expect(kitsOnSale(Date.parse("2026-11-26T23:59:59-03:00"))).toBe(false);
    expect(kitsOnSale(Date.parse("2026-11-27T00:00:00-03:00"))).toBe(true);
    expect(kitsOnSale(Date.parse("2026-11-30T23:59:59-03:00"))).toBe(true);
    expect(kitsOnSale(Date.parse("2026-12-01T00:00:00-03:00"))).toBe(false);
    // 30/11 23:30 em Brasília já é 01/12 em UTC e ainda vale
    expect(kitsOnSale(Date.parse("2026-12-01T02:30:00Z"))).toBe(true);
  });
  it("boleto não vale pra pedido com kit; Pix e cartão sim", () => {
    expect(paymentMethodAllowedForKits("bolbradesco", "ticket")).toBe(false);
    expect(paymentMethodAllowedForKits("pix", "bank_transfer")).toBe(true);
    expect(paymentMethodAllowedForKits("master", "credit_card")).toBe(true);
  });
  it("Pix de pedido com kit vence no prazo da reserva, e o navegador não consegue mudar isso", () => {
    const at = Date.parse("2026-11-27T10:34:00-03:00");
    const body = buildPaymentBody({ payment_method_id: "pix", date_of_expiration: "2027-01-01T00:00:00.000-03:00" }, {
      amountCents: 4490, externalReference: "ALM-1", notificationUrl: "https://x", pixExpiresAtMs: at,
    });
    expect(body.date_of_expiration).toBe("2026-11-27T10:34:00.000-03:00");
    expect(mpDateBrasilia(at)).toBe("2026-11-27T10:34:00.000-03:00");
    expect(body.transaction_amount).toBe(44.9);
  });
});

describe("kits: frete pelas latas de dentro", () => {
  it("cada kit vira 1 lata de cada sabor, somando com as latas avulsas", () => {
    expect(expandKitsForShipping([{ slug: "kit-foco", qty: 2 }, { slug: "cha-verde", qty: 1 }], catalog)).toEqual([
      { slug: "cha-preto", qty: 2 },
      { slug: "cha-verde", qty: 3 },
    ]);
  });
});

describe("site e servidor calculam igual", () => {
  it("período e cupom", () => {
    for (const t of ["2026-11-26T23:59:59-03:00", "2026-11-27T00:00:00-03:00", "2026-12-01T00:00:00-03:00"]) {
      expect(site.kitsOnSale(Date.parse(t))).toBe(kitsOnSale(Date.parse(t)));
    }
    const split = { latasSubtotalCents: 3990, kitsSubtotalCents: 4490 };
    for (const c of [null, percent10, freteZero]) {
      expect(site.applyCouponToCart(c, split, QUOTE)).toEqual(applyCouponToCart(c, split, QUOTE));
    }
    expect(site.COUPON_NOT_FOR_KITS).toBe("Cupom não vale para kits.");
  });
});
