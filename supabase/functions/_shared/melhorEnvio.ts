// Cotação de frete no Melhor Envio. Mesma conta e mesmos tokens do app Almara+ (tabela
// melhor_envio_tokens, secrets MELHORENVIO_*, no mesmo projeto Supabase) — o fluxo OAuth é feito
// uma vez pelo melhorenvio-oauth-callback do app; aqui se lê e renova o token com 3 dias de folga
// (regras e cotação guardada em shippingResilience.ts). Docs: https://docs.melhorenvio.com.br/reference/calculo-de-fretes-por-produtos
import { createClient } from "npm:@supabase/supabase-js@2.58.0";
import {
  mergePackageQuotes,
  planPackages,
  type ShippingOption,
  type ShippingPackage,
} from "./shippingPackages.ts";
import { cachedQuoteUse, quoteCacheKey, QUOTE_STALE_MS, tokenAction, type CachedQuote } from "./shippingResilience.ts";

// Mesma regra do app: sandbox é o padrão, a menos que MELHORENVIO_SANDBOX seja exatamente "false".
const useSandbox = Deno.env.get("MELHORENVIO_SANDBOX") !== "false";
const BASE_URL = useSandbox ? "https://sandbox.melhorenvio.com.br" : "https://melhorenvio.com.br";
const USER_AGENT = "Almara (ola@almara.com.br)";

// Valor declarado (seguro) enviado na cotação. 0 = sem seguro, como no app.
const INSURANCE_VALUE = 0;

export const SHIPPING_ENVIRONMENT = useSandbox ? "sandbox" : "producao";

function serviceClient() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

type Db = ReturnType<typeof serviceClient>;
interface TokenRow {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  updated_at: string;
}
const TOKEN_COLUMNS = "access_token, refresh_token, expires_at, updated_at";

async function readToken(db: Db): Promise<TokenRow | null> {
  const { data, error } = await db.from("melhor_envio_tokens").select(TOKEN_COLUMNS).eq("id", true).maybeSingle();
  if (error) throw error;
  return data as TokenRow | null;
}

// A linha melhor_envio_tokens é a mesma do app. A renovação só grava se ninguém (site ou app)
// renovou desde a leitura (compara updated_at), e confere que gravou: um token novo perdido aqui
// derruba o frete quando o atual vencer.
async function refreshToken(db: Db, row: TokenRow): Promise<string> {
  const res = await fetch(`${BASE_URL}/oauth/token`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": USER_AGENT },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: Number(Deno.env.get("MELHORENVIO_CLIENT_ID")),
      client_secret: Deno.env.get("MELHORENVIO_CLIENT_SECRET"),
      refresh_token: row.refresh_token,
    }),
  });
  if (!res.ok) throw new Error(`shipping_token_refresh_failed: HTTP ${res.status}`);
  const tokenData = await res.json();
  if (typeof tokenData?.access_token !== "string" || typeof tokenData?.refresh_token !== "string" || !Number.isFinite(tokenData?.expires_in)) {
    throw new Error("shipping_token_refresh_failed: resposta sem token");
  }

  const update = {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  };
  for (let attempt = 1; attempt <= 2; attempt++) {
    const { data: saved, error } = await db
      .from("melhor_envio_tokens")
      .update(update)
      .eq("id", true)
      .eq("updated_at", row.updated_at)
      .select("id");
    if (!error) {
      if ((saved?.length ?? 0) === 0) console.error("melhor envio: outra função renovou o token ao mesmo tempo; mantida a renovação dela");
      return tokenData.access_token;
    }
    console.error(`CRÍTICO melhor envio: token renovado não foi salvo (tentativa ${attempt})`, error.message);
  }
  return tokenData.access_token;
}

async function getValidAccessToken(db: Db): Promise<string> {
  const row = await readToken(db);
  if (!row) throw new Error("shipping_not_authorized");
  const action = tokenAction(row.expires_at, Date.now());
  if (action === "use") return row.access_token;
  try {
    return await refreshToken(db, row);
  } catch (e) {
    console.error("melhor envio: renovação do token falhou", (e as Error).message);
    // site e app usam a mesma linha: se o outro renovou agora há pouco, usa o token dele
    const again = await readToken(db);
    if (again && again.updated_at !== row.updated_at && tokenAction(again.expires_at, Date.now()) !== "refresh_required") {
      return again.access_token;
    }
    if (action === "refresh_optional") return row.access_token;
    throw new Error("shipping_token_refresh_failed");
  }
}

/** Cota UMA caixa: um único volume (quantity 1) com o peso total e as medidas reais da caixa. */
async function quotePackage(token: string, originCep: string, destinationCep: string, pkg: ShippingPackage): Promise<ShippingOption[]> {
  const res = await fetch(`${BASE_URL}/api/v2/me/shipment/calculate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": USER_AGENT,
    },
    body: JSON.stringify({
      from: { postal_code: originCep.replace(/\D/g, "") },
      to: { postal_code: destinationCep.replace(/\D/g, "") },
      products: [
        {
          id: `cha-caixa-${pkg.box}`,
          width: pkg.widthCm,
          height: pkg.heightCm,
          length: pkg.lengthCm,
          weight: pkg.weightGrams / 1000,
          insurance_value: INSURANCE_VALUE,
          quantity: 1,
        },
      ],
    }),
  });

  if (!res.ok) throw new Error("shipping_calculation_failed");
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("shipping_calculation_failed");

  return data
    .filter((opt) => opt && !opt.error && opt.id != null && opt.custom_price)
    .map((opt) => ({
      serviceId: String(opt.id),
      name: String(opt.name),
      company: String(opt.company?.name ?? ""),
      priceCents: Math.round(Number(opt.custom_price) * 100),
      deliveryDays: Number(opt.custom_delivery_time ?? opt.delivery_time),
    }))
    .filter((o) => Number.isFinite(o.priceCents) && o.priceCents > 0 && Number.isFinite(o.deliveryDays));
}

/** Opções de frete pro CEP e itens. `catalog` = peso do chá (g) por slug, vindo de shop_products. */
export async function calculateShipping(
  destinationCep: string,
  items: { slug: string; qty: number }[],
  catalog: Record<string, { weightGrams: number }>,
): Promise<ShippingOption[]> {
  const originCep = Deno.env.get("MELHORENVIO_ORIGIN_CEP");
  if (!originCep) throw new Error("shipping_not_configured");

  const packages = planPackages(items.map((i) => ({ teaKey: i.slug, qty: i.qty })), catalog);
  if (packages.length === 0) throw new Error("shipping_calculation_failed");

  const db = serviceClient();
  const key = await quoteCacheKey(SHIPPING_ENVIRONMENT, originCep, destinationCep, packages);
  const { data: cached } = await db.from("shop_shipping_quote_cache").select("options, created_at").eq("cache_key", key).maybeSingle();
  const use = cachedQuoteUse(cached as CachedQuote | null, Date.now());
  if (use === "fresh") return (cached as CachedQuote).options;

  try {
    const token = await getValidAccessToken(db);
    const quotes = await Promise.all(packages.map((pkg) => quotePackage(token, originCep, destinationCep, pkg)));
    const options = mergePackageQuotes(quotes);
    const { error: saveError } = await db
      .from("shop_shipping_quote_cache")
      .upsert({ cache_key: key, options, created_at: new Date().toISOString() });
    if (saveError) console.error("cotação de frete não foi guardada", saveError.message);
    if (Math.random() < 0.05) {
      await db.from("shop_shipping_quote_cache").delete().lt("created_at", new Date(Date.now() - 2 * QUOTE_STALE_MS).toISOString());
    }
    return options;
  } catch (e) {
    if (use === "fallback") {
      console.error("melhor envio falhou; usando a última cotação guardada", (e as Error).message);
      return (cached as CachedQuote).options;
    }
    throw e;
  }
}
