import { describe, expect, it } from "vitest";
import { applyCoupon, looksLikeCouponCode, normalizeCouponCode, ruleFromCheck } from "./coupons";
import * as server from "../../supabase/functions/_shared/coupons";

describe("cupons", () => {
  it("% nos chás arredonda em centavos e não mexe no frete", () => {
    expect(applyCoupon({ code: "MARI15", kind: "percent", percentOff: 15 }, 8990, 2759)).toEqual({ subtotalCents: 7642, shippingFeeCents: 2759 });
  });

  it("frete grátis zera só o frete", () => {
    expect(applyCoupon({ code: "FRETEZERO", kind: "free_shipping", percentOff: null }, 8990, 2759)).toEqual({ subtotalCents: 8990, shippingFeeCents: 0 });
  });

  it("lê o retorno do banco e recusa o que não vale", () => {
    expect(ruleFromCheck({ ok: true, code: "BEM10", kind: "percent", percent_off: 10 })).toEqual({ code: "BEM10", kind: "percent", percentOff: 10 });
    expect(ruleFromCheck({ ok: true, code: "FRETEZERO", kind: "free_shipping", percent_off: null })?.kind).toBe("free_shipping");
    expect(ruleFromCheck({ ok: false, reason: "Este cupom expirou." })).toBeNull();
    expect(ruleFromCheck({ ok: true, code: "X", kind: "percent", percent_off: 95 })).toBeNull();
    expect(ruleFromCheck(null)).toBeNull();
  });

  it("formato do código", () => {
    expect(normalizeCouponCode("  mari15 ")).toBe("MARI15");
    expect(looksLikeCouponCode("MARI15")).toBe(true);
    expect(looksLikeCouponCode("AB")).toBe(false);
    expect(looksLikeCouponCode("MARI-15")).toBe(false);
  });

  it("cópia do carrinho igual à do servidor", () => {
    const rule = { code: "MARI15", kind: "percent" as const, percentOff: 15 };
    expect(applyCoupon(rule, 12345, 999)).toEqual(server.applyCoupon(rule, 12345, 999));
    expect(ruleFromCheck({ ok: true, code: "A1B", kind: "free_shipping" })).toEqual(server.ruleFromCheck({ ok: true, code: "A1B", kind: "free_shipping" }));
  });
});
