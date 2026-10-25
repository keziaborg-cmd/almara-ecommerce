import { Marked, type Tokens } from "marked";

// O corpo dos posts vem do pipeline do blog (texto escrito por LLM a partir de RSS de terceiros) e
// vai pro HTML da página com dangerouslySetInnerHTML. Por isso o markdown aqui NÃO aceita HTML cru
// (vira texto) e só deixa link/imagem com http(s), mailto ou caminho relativo — nada de
// javascript:, data: etc. Um post com <script> ou onerror nunca roda no almara.com.br.

const ALLOWED_SCHEMES = new Set(["http:", "https:", "mailto:"]);
const NAMED_ENTITIES: Record<string, string> = { colon: ":", tab: "\t", newline: "\n", sol: "/", num: "#", amp: "&" };

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);?/gi, (match, body: string) => {
    if (body[0] === "#") {
      const code = body[1].toLowerCase() === "x" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code <= 0x10ffff ? String.fromCodePoint(code) : "";
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? match;
  });
}

export function isSafeUrl(raw: string): boolean {
  // o href passa pelo parser de HTML (entidades viram caracteres) e navegadores ignoram espaços e
  // caracteres de controle no meio do esquema ("java\tscript:", "&#106;avascript:")
  const url = decodeEntities(raw).replace(/[\u0000- \u007f]/g, "");
  const scheme = /^([^/?#]*?):/.exec(url)?.[1];
  if (scheme === undefined) return true; // relativo: /produtos, #secao, imagem.png
  return ALLOWED_SCHEMES.has(`${scheme.toLowerCase()}:`);
}

function escapeHtml(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

const markdown = new Marked({
  renderer: {
    html({ text }: Tokens.HTML | Tokens.Tag) {
      return escapeHtml(text);
    },
  },
  walkTokens(token) {
    if ((token.type === "link" || token.type === "image") && !isSafeUrl(token.href)) {
      token.href = "#";
    }
  },
});

export function renderPostMarkdown(body: string): string {
  return markdown.parse(body, { async: false }) as string;
}
