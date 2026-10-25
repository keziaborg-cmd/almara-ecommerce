import { describe, expect, it } from "vitest";
import { parseRequestedConsents, requestedConsentsFrom } from "./crm";

describe("requestedConsentsFrom", () => {
  it("guarda só os canais marcados como true e corta a versão do texto", () => {
    expect(requestedConsentsFrom({ email: true, whatsapp: false, sms: "true", textVersion: "x".repeat(60) })).toEqual({
      channels: ["email"],
      textVersion: "x".repeat(40),
    });
  });
  it("nada marcado = null", () => {
    expect(requestedConsentsFrom(undefined)).toBeNull();
    expect(requestedConsentsFrom({ email: false })).toBeNull();
  });
});

describe("parseRequestedConsents", () => {
  it("ignora canais desconhecidos", () => {
    expect(parseRequestedConsents({ channels: ["email", "telegrama"], textVersion: "v1" })).toEqual({ channels: ["email"], textVersion: "v1" });
    expect(parseRequestedConsents({ channels: ["telegrama"] })).toBeNull();
    expect(parseRequestedConsents(null)).toBeNull();
  });
});
