import { describe, expect, it } from "vitest";
import { selectCartLines, selectCartUnits, selectLatasUnits, selectSubtotalsByKind } from "./cart-store";

describe("carrinho com kits (tela)", () => {
  it("kit tem preço fixo e não conta na faixa das latas", () => {
    const items = { "kit-desacelerar": 1, camomila: 1, hibisco: 1 } as const;
    expect(selectLatasUnits(items)).toBe(2);
    expect(selectCartUnits(items)).toBe(3);
    expect(selectCartLines(items).map((l) => [l.slug, l.kind, l.unitPriceCents])).toEqual([
      ["camomila", "lata", 2090],
      ["hibisco", "lata", 2190],
      ["kit-desacelerar", "kit", 6290],
    ]);
    expect(selectSubtotalsByKind(items)).toEqual({ latasSubtotalCents: 2090 + 2190, kitsSubtotalCents: 6290 });
  });

  it("3 latas sem kit: faixa 3+ como hoje", () => {
    expect(selectCartLines({ camomila: 2, jasmin: 1 }).map((l) => l.unitPriceCents)).toEqual([1990, 3590]);
  });
});
