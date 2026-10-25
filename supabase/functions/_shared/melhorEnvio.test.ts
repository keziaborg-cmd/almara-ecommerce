import { beforeEach, describe, expect, it, vi } from "vitest";

// Banco falso: só as duas tabelas que a cotação usa.
const state: { token: Record<string, string> | null; cache: Map<string, { options: unknown; created_at: string }>; tokenWrites: number } = {
  token: null,
  cache: new Map(),
  tokenWrites: 0,
};
function table(name: string) {
  const filters: [string, unknown][] = [];
  let op: "select" | "update" | "upsert" | "delete" = "select";
  let payload: Record<string, unknown> | null = null;
  const run = () => {
    if (name === "melhor_envio_tokens") {
      if (op === "update") {
        const ok = state.token && filters.every(([k, v]) => k === "id" || state.token![k] === v);
        if (ok) {
          Object.assign(state.token!, payload);
          state.tokenWrites++;
        }
        return { data: ok ? [{ id: true }] : [], error: null };
      }
      return { data: state.token ? { ...state.token } : null, error: null };
    }
    const key = filters.find(([k]) => k === "cache_key")?.[1] as string | undefined;
    if (op === "upsert") {
      state.cache.set(String(payload!.cache_key), { options: payload!.options, created_at: String(payload!.created_at) });
      return { error: null };
    }
    if (op === "delete") return { error: null };
    return { data: key && state.cache.has(key) ? { ...state.cache.get(key)! } : null, error: null };
  };
  const q = {
    select: () => q,
    eq: (k: string, v: unknown) => (filters.push([k, v]), q),
    lt: () => q,
    update: (p: Record<string, unknown>) => ((op = "update"), (payload = p), q),
    upsert: async (p: Record<string, unknown>) => ((op = "upsert"), (payload = p), run()),
    delete: () => ((op = "delete"), q),
    maybeSingle: async () => run(),
    then: (resolve: (v: unknown) => void) => resolve(run()),
  };
  return q;
}
vi.mock("npm:@supabase/supabase-js@2.58.0", () => ({ createClient: () => ({ from: table }) }));

const env: Record<string, string> = { MELHORENVIO_ORIGIN_CEP: "01001000", MELHORENVIO_SANDBOX: "false", SUPABASE_URL: "http://x", SUPABASE_SERVICE_ROLE_KEY: "k" };
vi.stubGlobal("Deno", { env: { get: (k: string) => env[k] } });

const calls: string[] = [];
let quoteStatus = 200;
let refreshStatus = 200;
vi.stubGlobal("fetch", async (url: string) => {
  calls.push(url.endsWith("/oauth/token") ? "refresh" : "quote");
  if (url.endsWith("/oauth/token")) {
    return new Response(JSON.stringify({ access_token: "novo", refresh_token: "r2", expires_in: 2592000 }), { status: refreshStatus });
  }
  return new Response(
    JSON.stringify([{ id: 1, name: "PAC", company: { name: "Correios" }, custom_price: "19.90", custom_delivery_time: 5 }]),
    { status: quoteStatus },
  );
});

const { calculateShipping } = await import("./melhorEnvio");
const catalog = { cidreira: { weightGrams: 100 } };
const days = (n: number) => new Date(Date.now() + n * 24 * 3600 * 1000).toISOString();

beforeEach(() => {
  state.token = { access_token: "atual", refresh_token: "r1", expires_at: days(20), updated_at: "2026-10-16T00:00:00Z" };
  state.cache.clear();
  state.tokenWrites = 0;
  calls.length = 0;
  quoteStatus = 200;
  refreshStatus = 200;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("calculateShipping", () => {
  it("mesmo CEP e carrinho em seguida não chama o Melhor Envio de novo", async () => {
    const a = await calculateShipping("04707020", [{ slug: "cidreira", qty: 1 }], catalog);
    const b = await calculateShipping("04707-020", [{ slug: "cidreira", qty: 1 }], catalog);
    expect(a).toEqual(b);
    expect(a[0].priceCents).toBe(1990);
    expect(calls).toEqual(["quote"]);
  });

  it("Melhor Envio falhando (ex.: limite por minuto) usa a última cotação guardada", async () => {
    await calculateShipping("04707020", [{ slug: "cidreira", qty: 1 }], catalog);
    const [key] = [...state.cache.keys()];
    state.cache.get(key)!.created_at = new Date(Date.now() - 30 * 60 * 1000).toISOString(); // passou do tempo de "fresca"
    quoteStatus = 429;
    const r = await calculateShipping("04707020", [{ slug: "cidreira", qty: 1 }], catalog);
    expect(r[0].priceCents).toBe(1990);
  });

  it("sem cotação guardada, a falha continua sendo erro", async () => {
    quoteStatus = 429;
    await expect(calculateShipping("04707020", [{ slug: "cidreira", qty: 1 }], catalog)).rejects.toThrow(/shipping_calculation_failed/);
  });

  it("token com folga não renova; perto de vencer renova e salva", async () => {
    await calculateShipping("04707020", [{ slug: "cidreira", qty: 1 }], catalog);
    expect(calls).not.toContain("refresh");
    state.token!.expires_at = days(2);
    await calculateShipping("69900000", [{ slug: "cidreira", qty: 1 }], catalog);
    expect(calls).toContain("refresh");
    expect(state.token).toMatchObject({ access_token: "novo", refresh_token: "r2" });
  });

  it("renovação falhou mas o token atual ainda vale: o frete continua funcionando", async () => {
    state.token!.expires_at = days(2);
    refreshStatus = 400;
    const r = await calculateShipping("04707020", [{ slug: "cidreira", qty: 1 }], catalog);
    expect(r).toHaveLength(1);
    expect(state.token!.access_token).toBe("atual");
  });

  it("outra função renovou entre a leitura e a gravação: não sobrescreve a renovação dela", async () => {
    state.token!.expires_at = days(2);
    const realFetch = globalThis.fetch;
    vi.stubGlobal("fetch", async (url: string, init: unknown) => {
      if (url.endsWith("/oauth/token")) state.token = { ...state.token!, access_token: "do-app", refresh_token: "r-app", updated_at: "2026-11-13T00:00:00Z" };
      return (realFetch as (u: string, i: unknown) => Promise<Response>)(url, init);
    });
    await calculateShipping("04707020", [{ slug: "cidreira", qty: 1 }], catalog);
    vi.stubGlobal("fetch", realFetch);
    expect(state.token).toMatchObject({ access_token: "do-app", refresh_token: "r-app" });
    expect(state.tokenWrites).toBe(0);
  });
});
