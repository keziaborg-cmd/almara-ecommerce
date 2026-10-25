import { describe, expect, it } from "vitest";
import { cachedQuoteUse, quoteCacheKey, tokenAction, QUOTE_FRESH_MS, QUOTE_STALE_MS, TOKEN_REFRESH_WINDOW_MS } from "./shippingResilience";

const pkg = { box: "pequena", lengthCm: 20, widthCm: 15, heightCm: 10, cans: 2, weightGrams: 500 } as never;
const now = Date.parse("2026-10-25T12:00:00Z");
const at = (msAgo: number) => new Date(now - msAgo).toISOString();

describe("quoteCacheKey", () => {
  it("mesmo CEP (com ou sem traço) e mesmas caixas = mesma chave; muda com CEP, caixa ou ambiente", async () => {
    const a = await quoteCacheKey("producao", "01001-000", "04707-020", [pkg]);
    expect(await quoteCacheKey("producao", "01001000", "04707020", [pkg])).toBe(a);
    expect(await quoteCacheKey("producao", "01001000", "69900000", [pkg])).not.toBe(a);
    expect(await quoteCacheKey("producao", "01001000", "04707020", [pkg, pkg])).not.toBe(a);
    expect(await quoteCacheKey("sandbox", "01001000", "04707020", [pkg])).not.toBe(a);
  });
});

describe("cachedQuoteUse", () => {
  const options = [{ serviceId: "1", name: "PAC", company: "Correios", priceCents: 1990, deliveryDays: 5 }];
  it("recente = usa sem chamar o Melhor Envio; antiga = só se a chamada falhar; muito antiga = não serve", () => {
    expect(cachedQuoteUse({ options, created_at: at(60 * 1000) }, now)).toBe("fresh");
    expect(cachedQuoteUse({ options, created_at: at(QUOTE_FRESH_MS + 1000) }, now)).toBe("fallback");
    expect(cachedQuoteUse({ options, created_at: at(QUOTE_STALE_MS + 1000) }, now)).toBeNull();
    expect(cachedQuoteUse(null, now)).toBeNull();
    expect(cachedQuoteUse({ options, created_at: "lixo" }, now)).toBeNull();
    expect(cachedQuoteUse({ options, created_at: at(-60 * 60 * 1000) }, now)).toBeNull();
  });
});

describe("tokenAction", () => {
  it("renova com 3 dias de folga e só exige quando venceu", () => {
    expect(tokenAction(new Date(now + 21 * 24 * 3600 * 1000).toISOString(), now)).toBe("use");
    expect(tokenAction(new Date(now + TOKEN_REFRESH_WINDOW_MS - 1000).toISOString(), now)).toBe("refresh_optional");
    expect(tokenAction(new Date(now + 2 * 3600 * 1000).toISOString(), now)).toBe("refresh_optional");
    expect(tokenAction(new Date(now + 30 * 1000).toISOString(), now)).toBe("refresh_required");
    expect(tokenAction(new Date(now - 1000).toISOString(), now)).toBe("refresh_required");
    expect(tokenAction("lixo", now)).toBe("refresh_required");
  });
});
