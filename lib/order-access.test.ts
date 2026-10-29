import { describe, expect, it } from "vitest";
import { ORDER_TOKEN_CLEANUP_SCRIPT, ORDER_TOKENS_KEY, orderPagePath, readOrderToken, saveOrderToken } from "./order-access";

function memoryStore() {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  };
}
const brokenStore = {
  getItem: () => null,
  setItem: () => {
    throw new Error("QuotaExceededError");
  },
};

describe("código do pedido fora da URL", () => {
  it("guarda e lê por número do pedido", () => {
    const s = memoryStore();
    expect(saveOrderToken("ALM-1", "abc", s)).toBe(true);
    expect(readOrderToken("ALM-1", s)).toBe("abc");
    expect(readOrderToken("ALM-2", s)).toBeNull();
  });

  it("o carrinho abre a página sem o código quando ele ficou guardado", () => {
    expect(orderPagePath("ALM-1", "abc", memoryStore())).toBe("/pedido/ALM-1");
  });

  it("sem armazenamento no navegador, o código continua na URL (a página precisa dele)", () => {
    expect(orderPagePath("ALM-1", "abc", brokenStore)).toBe("/pedido/ALM-1?token=abc");
    expect(orderPagePath("ALM-1", "abc", undefined)).toBe("/pedido/ALM-1?token=abc");
  });

  it("guarda só os últimos 10 pedidos", () => {
    const s = memoryStore();
    for (let i = 1; i <= 12; i++) saveOrderToken(`ALM-${i}`, `t${i}`, s);
    expect(readOrderToken("ALM-1", s)).toBeNull();
    expect(readOrderToken("ALM-2", s)).toBeNull();
    expect(readOrderToken("ALM-12", s)).toBe("t12");
    expect(Object.keys(JSON.parse(s.data.get(ORDER_TOKENS_KEY)!))).toHaveLength(10);
  });

  it("valor estragado no armazenamento não quebra a leitura", () => {
    const s = memoryStore();
    s.data.set(ORDER_TOKENS_KEY, "{nao é json");
    expect(readOrderToken("ALM-1", s)).toBeNull();
    expect(saveOrderToken("ALM-1", "abc", s)).toBe(true);
  });
});

describe("limpeza da URL antes do GA4 (script do layout)", () => {
  function run(href: string, store = memoryStore()) {
    const url = new URL(href);
    const calls: string[] = [];
    const location = { pathname: url.pathname, search: url.search, hash: url.hash };
    const history = { state: { next: true }, replaceState: (_s: unknown, _t: string, u: string) => void calls.push(u) };
    new Function("location", "history", "localStorage", ORDER_TOKEN_CLEANUP_SCRIPT)(location, history, store);
    return { calls, store };
  }

  it("guarda o código e tira o ?token= da barra de endereço, mantendo o resto", () => {
    const { calls, store } = run("https://almara.com.br/pedido/ALM-7?token=segredo&utm_source=email#topo");
    expect(calls).toEqual(["/pedido/ALM-7?utm_source=email#topo"]);
    expect(readOrderToken("ALM-7", store)).toBe("segredo");
  });

  it("não mexe em outras páginas nem em /pedido sem código", () => {
    expect(run("https://almara.com.br/produtos?token=x").calls).toEqual([]);
    expect(run("https://almara.com.br/pedido/ALM-7").calls).toEqual([]);
  });

  it("se não conseguir guardar, deixa a URL como está", () => {
    const { calls } = run("https://almara.com.br/pedido/ALM-7?token=segredo", brokenStore as never);
    expect(calls).toEqual([]);
  });
});
