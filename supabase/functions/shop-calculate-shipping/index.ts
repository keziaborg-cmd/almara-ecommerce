// Cotação de frete pro carrinho. Pública (o visitante ainda não tem login): deployar com
// --no-verify-jwt; a validação é a daqui (CEP, itens, limite de unidades). Nunca devolve token nem
// detalhe de erro do Melhor Envio.
import { makeResponders } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { calculateShipping, SHIPPING_ENVIRONMENT } from "../_shared/melhorEnvio.ts";
import { CEP_NOT_FOUND_MESSAGE, cepExists, normalizeCep, parseQuoteItems } from "../_shared/shipping.ts";

Deno.serve(async (req) => {
  const { json, preflight } = makeResponders(req);
  const preflightResponse = preflight();
  if (preflightResponse) return preflightResponse;
  if (req.method !== "POST") return json({ code: "method_not_allowed", message: "Método não permitido." }, 405);

  try {
    let body: { cep?: unknown; items?: unknown };
    try {
      body = await req.json();
    } catch {
      return json({ code: "invalid_request", message: "Requisição inválida." }, 400);
    }

    const cep = normalizeCep(body?.cep);
    if (!cep) return json({ code: "invalid_cep", message: "CEP inválido. Confira os 8 números." }, 400);
    const items = parseQuoteItems(body?.items);
    if (!items) return json({ code: "invalid_items", message: "Carrinho inválido ou grande demais para calcular o frete aqui." }, 400);

    const supabase = createAdminClient();
    const { data: products, error } = await supabase
      .from("shop_products")
      .select("slug, weight_grams")
      .in("slug", items.map((i) => i.slug))
      .eq("active", true);
    if (error) throw error;

    const catalog: Record<string, { weightGrams: number }> = {};
    for (const p of products ?? []) catalog[p.slug] = { weightGrams: p.weight_grams };
    if (items.some((i) => !catalog[i.slug])) {
      return json({ code: "invalid_items", message: "Há um produto indisponível no carrinho." }, 400);
    }

    console.log("shop-calculate-shipping", { ambiente: SHIPPING_ENVIRONMENT });
    let options;
    try {
      options = await calculateShipping(cep, items, catalog);
    } catch (e) {
      console.error("shop-calculate-shipping: falha no Melhor Envio", (e as Error).message);
      // O Melhor Envio recusa CEP que não existe (ex.: 69900-000, genérico da cidade) do mesmo jeito
      // que uma falha dele. Se os Correios não conhecem o CEP, pede pra conferir em vez de "tente de novo".
      if ((await cepExists(cep)) === false) {
        return json({ code: "cep_not_found", message: CEP_NOT_FOUND_MESSAGE }, 400);
      }
      return json({ code: "shipping_unavailable", message: "Não foi possível calcular o frete agora. Tente novamente em instantes." }, 502);
    }

    if (options.length === 0) {
      return json({ code: "no_options", message: "Não encontramos opções de entrega para este CEP." }, 404);
    }
    return json({
      options: options.map((o) => ({
        serviceId: o.serviceId,
        name: o.name,
        company: o.company,
        priceCents: o.priceCents,
        deliveryDays: o.deliveryDays,
      })),
    });
  } catch (e) {
    console.error("shop-calculate-shipping error", e);
    return json({ code: "internal_error", message: "Erro ao calcular o frete." }, 500);
  }
});
