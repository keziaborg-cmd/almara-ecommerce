import { describe, expect, it } from "vitest";
import { cspReportSummary } from "./csp-report";

describe("cspReportSummary", () => {
  it("formato antigo: só origem e caminho, sem query (token do pedido)", () => {
    const r = cspReportSummary(JSON.stringify({ "csp-report": { "document-uri": "https://almara.com.br/pedido/ALM-1?token=segredo", "violated-directive": "frame-src", "blocked-uri": "https://acs.banco.example/challenge?x=1" } }));
    expect(r).toEqual([{ directive: "frame-src", blocked: "https://acs.banco.example", page: "/pedido/ALM-1" }]);
    expect(JSON.stringify(r)).not.toContain("segredo");
  });
  it("Reporting API e valores especiais (inline/eval)", () => {
    const r = cspReportSummary(JSON.stringify([{ type: "csp-violation", body: { documentURL: "https://almara.com.br/carrinho", effectiveDirective: "script-src-elem", blockedURL: "inline" } }, { type: "deprecation", body: {} }]));
    expect(r).toEqual([{ directive: "script-src-elem", blocked: "inline", page: "/carrinho" }]);
  });
  it("lixo não quebra", () => {
    expect(cspReportSummary("não é json")).toEqual([]);
    expect(cspReportSummary("{}")).toEqual([]);
  });
});
