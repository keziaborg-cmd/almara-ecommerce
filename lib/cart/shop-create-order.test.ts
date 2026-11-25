import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// shop-create-order roda em Deno e fala com o Supabase e o Melhor Envio, então o teste confere o
// código-fonte: o frete só pode vir da cotação do servidor, nunca de campo enviado pelo cliente.
const src = readFileSync("supabase/functions/shop-create-order/index.ts", "utf8");

describe("shop-create-order — frete", () => {
  it("o corpo da requisição só traz o id do serviço, sem preço de frete", () => {
    const shippingType = src.slice(src.indexOf("shipping: {"), src.indexOf("items: {"));
    expect(shippingType).toContain("serviceId: string");
    expect(shippingType).not.toMatch(/price|fee|cents|amount|total/i);
    expect(src).not.toMatch(/body\.(shippingFee|total|amount|price)/);
    expect(src).not.toMatch(/\bshipping\.(price|fee|cents|amount)/i);
  });
  it("recota o frete no servidor e usa o preço da opção cotada", () => {
    expect(src).toContain("calculateShipping(destinationCep, items, catalog)");
    expect(src).toContain("findShippingOption(shippingOptions, shipping.serviceId)");
    expect(src).toContain("const rawShippingFee = chosenShipping.priceCents;");
  });
  it("recusa serviço que não existe mais, com erro tratável", () => {
    expect(src).toContain('code: "shipping_service_unavailable"');
    expect(src).toContain("409");
  });
  it("não sobrou o frete fixo antigo", () => {
    expect(src).not.toMatch(/padrao|1290|isShippingMethod/);
  });
});
