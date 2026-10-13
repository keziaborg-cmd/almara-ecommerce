import { describe, expect, it } from "vitest";
import {
  CAN_EMPTY_GRAMS,
  mergePackageQuotes,
  planPackages,
  type ShippingOption,
} from "../../supabase/functions/_shared/shippingPackages";
import {
  chargedShippingCents,
  findShippingOption,
  FREE_SHIPPING_MIN_CENTS,
  normalizeCep,
  parseQuoteItems,
} from "../../supabase/functions/_shared/shipping";
import * as clientRules from "./shipping-rules";

// Pesos do chá (g) como estão em shop_products.weight_grams.
const catalog = {
  camomila: { weightGrams: 65 },
  cidreira: { weightGrams: 60 },
  "cha-preto": { weightGrams: 120 },
  "cha-verde": { weightGrams: 120 },
  hibisco: { weightGrams: 95 },
  jasmin: { weightGrams: 50 },
};
const can = (tea: keyof typeof catalog) => catalog[tea].weightGrams + CAN_EMPTY_GRAMS;

function boxes(qty: number) {
  return planPackages([{ teaKey: "camomila", qty }], catalog).map((p) => `${p.box}:${p.cans}`);
}

describe("planPackages — caixas", () => {
  it("1 lata vai na caixa pequena, com tara de 85 g", () => {
    const [p] = planPackages([{ teaKey: "camomila", qty: 1 }], catalog);
    expect(p).toMatchObject({ box: "pequena", lengthCm: 27, widthCm: 18, heightCm: 9, cans: 1 });
    expect(p.weightGrams).toBe(can("camomila") + 85);
  });
  it("3 latas ainda cabem na pequena", () => expect(boxes(3)).toEqual(["pequena:3"]));
  it("4 latas já vão na grande (40x20x10, tara 148 g)", () => {
    expect(boxes(4)).toEqual(["grande:4"]);
    const [p] = planPackages([{ teaKey: "cha-verde", qty: 4 }], catalog);
    expect(p).toMatchObject({ lengthCm: 40, widthCm: 20, heightCm: 10 });
    expect(p.weightGrams).toBe(4 * can("cha-verde") + 148);
  });
  it("6 latas = uma grande cheia", () => expect(boxes(6)).toEqual(["grande:6"]));
  it("7 latas = grande + pequena", () => expect(boxes(7)).toEqual(["grande:6", "pequena:1"]));
  it("12 latas = 2 grandes", () => expect(boxes(12)).toEqual(["grande:6", "grande:6"]));
  it("13 latas = 2 grandes + 1 pequena", () => expect(boxes(13)).toEqual(["grande:6", "grande:6", "pequena:1"]));

  it("soma o peso de cada lata (chá + lata vazia) de sabores misturados", () => {
    const [p] = planPackages(
      [
        { teaKey: "jasmin", qty: 1 },
        { teaKey: "cha-preto", qty: 2 },
      ],
      catalog,
    );
    expect(p.cans).toBe(3);
    expect(p.weightGrams).toBe(can("jasmin") + 2 * can("cha-preto") + 85);
  });

  it("ignora chá desconhecido e quantidade inválida, sem virar peso zero", () => {
    expect(planPackages([{ teaKey: "inexistente", qty: 2 }], catalog)).toEqual([]);
    expect(planPackages([{ teaKey: "camomila", qty: 0 }, { teaKey: "camomila", qty: -1 }], catalog)).toEqual([]);
    expect(boxes(2)).toEqual(["pequena:2"]);
    expect(planPackages([{ teaKey: "inexistente", qty: 1 }, { teaKey: "camomila", qty: 1 }], catalog)).toHaveLength(1);
  });
});

const opt = (serviceId: string, priceCents: number, deliveryDays: number): ShippingOption => ({
  serviceId,
  name: `S${serviceId}`,
  company: "X",
  priceCents,
  deliveryDays,
});

describe("mergePackageQuotes — várias caixas", () => {
  it("soma o preço de cada serviço e usa o prazo da caixa mais demorada", () => {
    const merged = mergePackageQuotes([
      [opt("1", 1798, 5), opt("2", 3000, 2)],
      [opt("1", 1193, 7), opt("2", 2500, 1)],
    ]);
    expect(merged.find((o) => o.serviceId === "1")).toMatchObject({ priceCents: 2991, deliveryDays: 7 });
    expect(merged.find((o) => o.serviceId === "2")).toMatchObject({ priceCents: 5500, deliveryDays: 2 });
  });
  it("descarta o serviço que não atende todas as caixas", () => {
    const merged = mergePackageQuotes([[opt("1", 1000, 5), opt("2", 2000, 2)], [opt("1", 1100, 6)]]);
    expect(merged.map((o) => o.serviceId)).toEqual(["1"]);
  });
  it("uma caixa só devolve as opções dela, da mais barata pra mais cara", () => {
    expect(mergePackageQuotes([[opt("2", 2000, 2), opt("1", 1000, 5)]]).map((o) => o.serviceId)).toEqual(["1", "2"]);
  });
  it("sem cotações, sem opções", () => expect(mergePackageQuotes([])).toEqual([]));
});

describe("regras de frete do pedido", () => {
  it("frete grátis a partir de R$ 100,00 em produtos (já com cupom)", () => {
    expect(chargedShippingCents(1500, 9999)).toBe(1500);
    expect(chargedShippingCents(1500, 10000)).toBe(0);
  });
  it("o carrinho usa a mesma regra do servidor", () => {
    expect(clientRules.FREE_SHIPPING_MIN_CENTS).toBe(FREE_SHIPPING_MIN_CENTS);
    for (const subtotal of [0, 9999, 10000, 25000]) {
      expect(clientRules.chargedShippingCents(1234, subtotal)).toBe(chargedShippingCents(1234, subtotal));
    }
  });
  it("o serviço escolhido tem que estar entre as opções atuais", () => {
    const options = [opt("1", 1000, 5), opt("2", 2000, 2)];
    expect(findShippingOption(options, "2")?.priceCents).toBe(2000);
    expect(findShippingOption(options, "99")).toBeNull();
    expect(findShippingOption(options, undefined)).toBeNull();
    expect(findShippingOption(options, 2)).toBeNull();
  });
  it("valida CEP de 8 dígitos", () => {
    expect(normalizeCep("01310-100")).toBe("01310100");
    expect(normalizeCep("1234567")).toBeNull();
    expect(normalizeCep(12345678)).toBeNull();
  });
  it("valida os itens e limita a quantidade", () => {
    expect(parseQuoteItems([{ slug: "camomila", qty: 2 }, { slug: "camomila", qty: 1 }])).toEqual([{ slug: "camomila", qty: 3 }]);
    expect(parseQuoteItems([])).toBeNull();
    expect(parseQuoteItems([{ slug: "camomila", qty: 0 }])).toBeNull();
    expect(parseQuoteItems([{ slug: "camomila", qty: 1.5 }])).toBeNull();
    expect(parseQuoteItems([{ slug: "camomila", qty: 61 }])).toBeNull();
  });
});
