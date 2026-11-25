import { describe, expect, it } from "vitest";
import { parseWaitlistRequest } from "./waitlist";

describe("lista de espera do iPhone: validação", () => {
  it("normaliza e-mail e aceita origem, utm e jornada válidos", () => {
    expect(
      parseWaitlistRequest({ email: "  Ana@Exemplo.com ", source: "lista-espera-ios-lu", utmSource: "ig-lu", utmMedium: "dm", journey: "sono", textVersion: "lista-ios-lu-v1" }),
    ).toEqual({ email: "ana@exemplo.com", platform: "ios", source: "lista-espera-ios-lu", utmSource: "ig-lu", utmMedium: "dm", journey: "sono", textVersion: "lista-ios-lu-v1" });
  });
  it("recusa e-mail inválido", () => {
    expect(parseWaitlistRequest({ email: "ana" })).toBeNull();
    expect(parseWaitlistRequest({})).toBeNull();
  });
  it("descarta origem, utm e jornada estranhos sem recusar o e-mail", () => {
    expect(parseWaitlistRequest({ email: "a@b.com", source: "<x>", utmSource: "a b", journey: "compulsividade" })).toMatchObject({
      source: "lista-espera-ios",
      utmSource: null,
      journey: null,
    });
  });
});
