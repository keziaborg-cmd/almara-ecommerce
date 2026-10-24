import { describe, expect, it } from "vitest";
import { pickShippingOptions } from "../../supabase/functions/_shared/shipping";

const o = (serviceId: string, priceCents: number, deliveryDays: number) => ({ serviceId, name: serviceId, company: "x", priceCents, deliveryDays });

describe("frete: no máximo 3 opções no carrinho", () => {
  it("Belo Horizonte (10 opções reais): mais barata, mais rápida e a próxima mais barata", () => {
    const all = [
      o("jet", 1089, 4), o("loggi", 1101, 3), o("jadlog", 1689, 6), o("latam", 1710, 5), o("pac", 1840, 7),
      o("total", 1844, 3), o("azul", 2024, 4), o("buslog", 2480, 5), o("sedex", 2885, 1), o("azulx", 3160, 2),
    ];
    expect(pickShippingOptions(all).map((x) => x.serviceId)).toEqual(["jet", "loggi", "sedex"]);
  });

  it("a mais barata já é a mais rápida: completa com as próximas mais baratas", () => {
    const all = [o("a", 890, 1), o("b", 946, 3), o("c", 967, 1), o("d", 994, 1), o("e", 1154, 6)];
    expect(pickShippingOptions(all).map((x) => x.serviceId)).toEqual(["a", "b", "c"]);
  });

  it("empate de prazo: a mais rápida é a mais barata entre as rápidas", () => {
    const all = [o("barata", 500, 8), o("r1", 2000, 2), o("r2", 1500, 2), o("m", 900, 5), o("n", 950, 6)];
    expect(pickShippingOptions(all).map((x) => x.serviceId)).toEqual(["barata", "m", "r2"]);
  });

  it("3 ou menos: mostra todas, em ordem de preço", () => {
    expect(pickShippingOptions([o("sedex", 6059, 5), o("pac", 2759, 9)]).map((x) => x.serviceId)).toEqual(["pac", "sedex"]);
  });
});
