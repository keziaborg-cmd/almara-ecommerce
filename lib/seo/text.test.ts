import { describe, expect, it } from "vitest";
import { metaDescription, seoTitle } from "./text";

describe("seoTitle", () => {
  it("usa o sufixo completo quando cabe", () => {
    expect(seoTitle("Pausas curtas recarregam o foco", [" — Blog Almara", " — Almara"])).toBe(
      "Pausas curtas recarregam o foco — Blog Almara",
    );
  });
  it("cai pro sufixo menor e depois pro título puro", () => {
    const t = "Uma respiração simples para os momentos em que a ansiedade";
    expect(seoTitle(t, [" — Blog Almara", " — Almara"])).toBe(t);
    expect(seoTitle("Banho de floresta: uma pausa que começa", [" — Blog Almara", " — Almara"])).toBe(
      "Banho de floresta: uma pausa que começa — Blog Almara",
    );
  });
});

describe("metaDescription", () => {
  it("mantém texto curto", () => {
    expect(metaDescription("Texto curto.")).toBe("Texto curto.");
  });
  it("corta numa palavra inteira, com reticências, sem passar do limite", () => {
    const longo = "palavra ".repeat(40).trim();
    const d = metaDescription(longo);
    expect(d.length).toBeLessThanOrEqual(155);
    expect(d.endsWith("palavra…")).toBe(true);
  });
});
