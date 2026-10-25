import { describe, expect, it } from "vitest";
import { isSafeUrl, renderPostMarkdown } from "./render-markdown";

describe("renderPostMarkdown", () => {
  it("continua renderizando o markdown normal dos posts", () => {
    const html = renderPostMarkdown("## Título\n\nTexto com **negrito**, [link](https://almara.com.br/produtos) e [interno](/blog).\n\n- item");
    expect(html).toContain("<h2>Título</h2>");
    expect(html).toContain("<strong>negrito</strong>");
    expect(html).toContain('<a href="https://almara.com.br/produtos">link</a>');
    expect(html).toContain('<a href="/blog">interno</a>');
    expect(html).toContain("<li>item</li>");
  });

  it("HTML cru vira texto (bloco e no meio do parágrafo)", () => {
    const html = renderPostMarkdown('<script>alert(1)</script>\n\nOi <img src=x onerror="alert(2)"> tchau\n\n<div onclick="x()">bloco</div>');
    expect(html).not.toMatch(/<script|<img|<div|onerror="|onclick="/);
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(2)&quot;&gt;");
  });

  it("link e imagem com esquema perigoso viram #", () => {
    for (const href of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "java\tscript:alert(1)", "data:text/html,<b>x</b>", "vbscript:x"]) {
      const html = renderPostMarkdown(`[clique](${href.includes(" ") || href.includes("<") ? `<${href}>` : href}) ![img](${href})`);
      expect(html).not.toMatch(/javascript:|data:|vbscript:/i);
    }
  });
});

describe("isSafeUrl", () => {
  it("aceita http(s), mailto e relativo; recusa o resto", () => {
    expect(isSafeUrl("https://pubmed.ncbi.nlm.nih.gov/1")).toBe(true);
    expect(isSafeUrl("mailto:ola@almara.com.br")).toBe(true);
    expect(isSafeUrl("/produtos")).toBe(true);
    expect(isSafeUrl("#fontes")).toBe(true);
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeUrl(" java\nscript:alert(1)")).toBe(false);
    expect(isSafeUrl("&#106;avascript:alert(1)")).toBe(false);
  });
});
