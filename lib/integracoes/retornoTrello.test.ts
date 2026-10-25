import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { CABECALHOS_RETORNO, CSP, DESTINO_APP, HTML_RETORNO, SCRIPT_RETORNO } from "./retornoTrello";
import { GET } from "@/app/integracoes/trello/retorno/route";

describe("volta do Trello pro app", () => {
  it("sem analytics nem script de terceiros: só o nosso script, liberado pelo hash na CSP", () => {
    expect(HTML_RETORNO.match(/<script/g)).toHaveLength(1);
    expect(HTML_RETORNO).not.toMatch(/src=|gtag|googletagmanager|facebook|pixel|analytics/i);
    const h = `'sha256-${createHash("sha256").update(SCRIPT_RETORNO).digest("base64")}'`;
    expect(CSP).toContain(`script-src ${h}`);
    expect(CSP).toContain("default-src 'none'");
  });

  it("cabeçalhos: no-referrer, sem cache, fora dos buscadores", async () => {
    const r = GET();
    expect(r.headers.get("Referrer-Policy")).toBe("no-referrer");
    expect(r.headers.get("Cache-Control")).toBe("no-store");
    expect(r.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    expect(r.headers.get("Content-Security-Policy")).toBe(CSP);
    expect(await r.text()).toBe(HTML_RETORNO);
    expect(CABECALHOS_RETORNO["Content-Type"]).toMatch(/text\/html/);
  });

  it("o script limpa a URL, abre o app e só repassa token com formato válido", () => {
    const rodar = (hash: string, search = "") => {
      const chamadas: string[] = [];
      const a = { href: "", hidden: true };
      const loc = { hash, search, pathname: "/integracoes/trello/retorno", replace: (u: string) => chamadas.push(`replace:${u}`) };
      const hist = { replaceState: (_s: unknown, _t: string, u: string) => chamadas.push(`limpa:${u}`) };
      new Function("location", "history", "document", "URLSearchParams", SCRIPT_RETORNO)(loc, hist, { getElementById: () => a }, URLSearchParams);
      return { chamadas, a };
    };
    const tok = "b".repeat(64);
    const ok = rodar(`#token=${tok}`);
    expect(ok.chamadas).toEqual(["limpa:/integracoes/trello/retorno", `replace:${DESTINO_APP}#token=${tok}`]);
    expect(ok.a.hidden).toBe(false);
    expect(rodar("#token=<img onerror=x>").chamadas[1]).toBe(`replace:${DESTINO_APP}#error=sem_token`);
    expect(rodar("#token=&error=Token request rejected").chamadas[1]).toBe(`replace:${DESTINO_APP}#error=Token%20request%20rejected`);
  });

  it("repassa o state do app junto do token, e recusa state fora do formato", () => {
    const rodar = (hash: string, search: string) => {
      const chamadas: string[] = [];
      const loc = { hash, search, pathname: "/integracoes/trello/retorno", replace: (u: string) => chamadas.push(u) };
      const hist = { replaceState: (_s: unknown, _t: string, u: string) => chamadas.push(`limpa:${u}`) };
      new Function("location", "history", "document", "URLSearchParams", SCRIPT_RETORNO)(loc, hist, { getElementById: () => ({ href: "", hidden: true }) }, URLSearchParams);
      return chamadas;
    };
    const tok = "b".repeat(64);
    const state = "Ab3_-".repeat(9).slice(0, 43);
    expect(rodar(`#token=${tok}`, `?state=${state}`)).toEqual(["limpa:/integracoes/trello/retorno", `${DESTINO_APP}#token=${tok}&state=${state}`]);
    expect(rodar(`#token=${tok}`, "?state=curto")[1]).toBe(`${DESTINO_APP}#error=state_invalido`);
    expect(rodar(`#token=${tok}`, `?state=${"a".repeat(40)}%26token%3Dx`)[1]).toBe(`${DESTINO_APP}#error=state_invalido`);
    expect(rodar("#token=<x>", `?state=${state}`)[1]).toBe(`${DESTINO_APP}#error=sem_token`);
  });
});
