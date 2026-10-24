import { describe, expect, it } from "vitest";
import { applyCoupon, looksLikeCouponCode, normalizeCouponCode, ruleFromCheck } from "./coupons";
import * as server from "../../supabase/functions/_shared/coupons";

describe("cupons", () => {
  it("% nos chás arredonda em centavos e não mexe no frete", () => {
    expect(applyCoupon({ code: "MARI15", kind: "percent", percentOff: 15, shipping: "none", shippingCapCents: null }, 8990, 2759)).toEqual({ subtotalCents: 7642, shippingFeeCents: 2759 });
  });

  it("frete grátis zera só o frete", () => {
    expect(applyCoupon({ code: "FRETEZERO", kind: "free_shipping", percentOff: null, shipping: "free", shippingCapCents: null }, 8990, 2759)).toEqual({ subtotalCents: 8990, shippingFeeCents: 0 });
  });

  it("lê o retorno do banco e recusa o que não vale", () => {
    expect(ruleFromCheck({ ok: true, code: "BEM10", kind: "percent", percent_off: 10 })).toEqual({ code: "BEM10", kind: "percent", percentOff: 10, shipping: "none", shippingCapCents: null });
    expect(ruleFromCheck({ ok: true, code: "FRETEZERO", kind: "free_shipping", percent_off: null })?.kind).toBe("free_shipping");
    expect(ruleFromCheck({ ok: false, reason: "Este cupom expirou." })).toBeNull();
    expect(ruleFromCheck({ ok: true, code: "X", kind: "percent", percent_off: 95 })).toBeNull();
    expect(ruleFromCheck(null)).toBeNull();
  });

  it("creator: % nos chás e frete grátis até R$ 20 (o cliente paga a diferença)", () => {
    const rule = ruleFromCheck({ ok: true, code: "MARI15", kind: "percent", percent_off: 15, shipping: "capped", shipping_cap_cents: 2000 })!;
    expect(rule).toEqual({ code: "MARI15", kind: "percent", percentOff: 15, shipping: "capped", shippingCapCents: 2000 });
    expect(applyCoupon(rule, 8990, 2759)).toEqual({ subtotalCents: 7642, shippingFeeCents: 759 });
    expect(applyCoupon(rule, 8990, 1500)).toEqual({ subtotalCents: 7642, shippingFeeCents: 0 });
  });

  it("afiliado: só frete grátis até R$ 20; e % com frete grátis total", () => {
    const afiliado = ruleFromCheck({ ok: true, code: "JOAO", kind: "free_shipping", percent_off: null, shipping: "capped", shipping_cap_cents: 2000 })!;
    expect(applyCoupon(afiliado, 8990, 2759)).toEqual({ subtotalCents: 8990, shippingFeeCents: 759 });
    const total = ruleFromCheck({ ok: true, code: "LUA", kind: "percent", percent_off: 10, shipping: "free", shipping_cap_cents: null })!;
    expect(applyCoupon(total, 10000, 2759)).toEqual({ subtotalCents: 9000, shippingFeeCents: 0 });
    // retorno antigo do banco (sem "shipping") continua valendo
    expect(ruleFromCheck({ ok: true, code: "FRETEZERO", kind: "free_shipping", percent_off: null })?.shipping).toBe("free");
    expect(ruleFromCheck({ ok: true, code: "X1", kind: "free_shipping", shipping: "capped" })).toBeNull();
  });

  it("formato do código", () => {
    expect(normalizeCouponCode("  mari15 ")).toBe("MARI15");
    expect(looksLikeCouponCode("MARI15")).toBe(true);
    expect(looksLikeCouponCode("AB")).toBe(false);
    expect(looksLikeCouponCode("MARI-15")).toBe(false);
  });

  it("cópia do carrinho igual à do servidor", () => {
    const rule = { code: "MARI15", kind: "percent" as const, percentOff: 15, shipping: "capped" as const, shippingCapCents: 2000 };
    expect(applyCoupon(rule, 12345, 999)).toEqual(server.applyCoupon(rule, 12345, 999));
    expect(ruleFromCheck({ ok: true, code: "A1B", kind: "free_shipping" })).toEqual(server.ruleFromCheck({ ok: true, code: "A1B", kind: "free_shipping" }));
  });
});
