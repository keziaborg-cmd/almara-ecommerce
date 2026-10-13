// Cotação de frete no Melhor Envio. Mesma conta e mesmos tokens do app Almara+ (tabela
// melhor_envio_tokens, secrets MELHORENVIO_*, no mesmo projeto Supabase) — o fluxo OAuth é feito
// uma vez pelo melhorenvio-oauth-callback do app; aqui só se lê e renova o token quando falta
// menos de 1 h. Docs: https://docs.melhorenvio.com.br/reference/calculo-de-fretes-por-produtos
import { createClient } from "npm:@supabase/supabase-js@2.58.0";
import {
  mergePackageQuotes,
  planPackages,
  type ShippingOption,
  type ShippingPackage,
} from "./shippingPackages.ts";

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

async function getValidAccessToken(): Promise<string> {
  const db = serviceClient();
  const { data: row } = await db.from("melhor_envio_tokens").select("*").eq("id", true).maybeSingle();
  if (!row) throw new Error("shipping_not_authorized");

  const expiresInMs = new Date(row.expires_at).getTime() - Date.now();
  if (expiresInMs > 60 * 60 * 1000) return row.access_token;

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
  if (!res.ok) throw new Error("shipping_token_refresh_failed");
  const tokenData = await res.json();

  await db
    .from("melhor_envio_tokens")
    .update({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  return tokenData.access_token;
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

  const token = await getValidAccessToken();
  const quotes = await Promise.all(packages.map((pkg) => quotePackage(token, originCep, destinationCep, pkg)));
  return mergePackageQuotes(quotes);
}
