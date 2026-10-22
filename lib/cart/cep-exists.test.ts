import { describe, expect, it } from "vitest";
import { cepExists } from "../../supabase/functions/_shared/shipping";

const reply = (status: number, body: unknown) =>
  (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

describe("cepExists (ViaCEP)", () => {
  it("CEP genérico que não existe (69900-000) → false", async () => {
    expect(await cepExists("69900000", reply(200, { erro: "true" }))).toBe(false);
    expect(await cepExists("69900000", reply(200, { erro: true }))).toBe(false);
  });

  it("CEP de rua → true", async () => {
    expect(await cepExists("69900100", reply(200, { cep: "69900-100", localidade: "Rio Branco", uf: "AC" }))).toBe(true);
  });

  it("ViaCEP fora do ar ou resposta estranha → null (não culpa o CEP)", async () => {
    expect(await cepExists("69900100", reply(503, {}))).toBeNull();
    expect(await cepExists("69900100", reply(200, { qualquer: 1 }))).toBeNull();
    const boom = (async () => {
      throw new Error("rede");
    }) as unknown as typeof fetch;
    expect(await cepExists("69900100", boom)).toBeNull();
  });
});
