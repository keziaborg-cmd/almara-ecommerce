import { describe, expect, it } from "vitest";
import { destinoClickUp } from "./retornoClickUp";
import { GET } from "@/app/integracoes/clickup/retorno/route";

const base = "https://almara.com.br/integracoes/clickup/retorno";

describe("volta do ClickUp pro app", () => {
  it("repassa code e state válidos ao app", () => {
    expect(destinoClickUp(`${base}?code=ABC123def456&state=abcdef0123456789abcd`)).toBe("almara://integracoes/clickup?code=ABC123def456&state=abcdef0123456789abcd");
  });

  it("formato estranho vira erro, nunca repassa", () => {
    expect(destinoClickUp(`${base}?code=<script>&state=abcdef0123456789abcd`)).toBe("almara://integracoes/clickup?error=sem_codigo");
    expect(destinoClickUp(`${base}?code=ABC123def456&state=curto`)).toBe("almara://integracoes/clickup?error=sem_codigo");
    expect(destinoClickUp(`${base}?error=access_denied`)).toBe("almara://integracoes/clickup?error=access_denied");
  });

  it("302 sem referrer, sem cache, fora dos buscadores", () => {
    const r = GET(new Request(`${base}?code=ABC123def456&state=abcdef0123456789abcd`));
    expect(r.status).toBe(302);
    expect(r.headers.get("Location")).toMatch(/^almara:\/\/integracoes\/clickup\?code=/);
    expect(r.headers.get("Referrer-Policy")).toBe("no-referrer");
    expect(r.headers.get("Cache-Control")).toBe("no-store");
  });
});
