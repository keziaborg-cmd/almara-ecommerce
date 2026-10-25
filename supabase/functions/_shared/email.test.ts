import { describe, expect, it, vi } from "vitest";

vi.stubGlobal("Deno", { env: { get: () => undefined } });
const { buildOrderConfirmationHtml, escapeHtml } = await import("./email");

const base = {
  orderNumber: "ALM-000001",
  customerName: "Compradora Teste",
  customerEmail: "compradora@example.test",
  totalCents: 209,
  subtotalCents: 209,
  shippingFeeCents: 0,
  couponCode: "TESTEMP90",
  items: [{ name: "Cidreira", qty: 1, unitPriceCents: 2090 }],
  shipping: { rua: "Rua A", numero: "10", complemento: null, bairro: "Centro", cidade: "São Paulo", uf: "SP", cep: "01001000" },
};

describe("e-mail de pedido confirmado", () => {
  it("escapa o que veio do checkout (nome, endereço, CEP)", () => {
    const html = buildOrderConfirmationHtml({
      ...base,
      customerName: '<h1>Golpe</h1><a href="https://phish.example">Clique</a>',
      shipping: { ...base.shipping, rua: "<img src=x onerror=alert(1)>", complemento: '"><b>x</b>', cep: "01001-000<b>" },
    });
    expect(html).not.toMatch(/<h1>|<a href="https:\/\/phish|<img|<b>/);
    expect(html).toContain("&lt;h1&gt;Golpe&lt;/h1&gt;");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
  });

  it("mostra desconto do cupom e frete, pra conta bater com o total", () => {
    const html = buildOrderConfirmationHtml(base);
    expect(html).toContain("Desconto (TESTEMP90)");
    expect(html).toMatch(/−\s*R\$\s*18,81/);
    expect(html).toContain("grátis");
  });

  it("sem desconto não mostra a linha; frete pago aparece com valor", () => {
    const html = buildOrderConfirmationHtml({ ...base, totalCents: 3090, subtotalCents: 2090, shippingFeeCents: 1000, couponCode: null });
    expect(html).not.toContain("Desconto");
    expect(html).toMatch(/Frete<\/td><td[^>]*>R\$\s*10,00/);
  });

  it("escapeHtml cobre os cinco caracteres", () => {
    expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  });
});
