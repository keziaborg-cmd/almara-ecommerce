import { makeResponders } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { chargedShippingCents, findShippingOption, MAX_UNITS_PER_QUOTE, normalizeCep } from "../_shared/shipping.ts";
import { calculateShipping, SHIPPING_ENVIRONMENT } from "../_shared/melhorEnvio.ts";
import { generateOrderNumber } from "../_shared/order-number.ts";
import { createPreference } from "../_shared/mercadopago.ts";
import { tierForCartUnits, unitPriceForTier } from "../_shared/pricing.ts";
import { applyCoupon, looksLikeCouponCode, normalizeCouponCode, ruleFromCheck, type CouponRule } from "../_shared/coupons.ts";
import { crmTrack, sanitizeTracking } from "../_shared/crm.ts";

interface RequestBody {
  customer: { nome: string; email: string; telefone: string };
  shipping: {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    // id do serviço escolhido no checkout (vem de shop-calculate-shipping). Só o id: o preço e o
    // prazo são recotados aqui, nunca lidos do cliente.
    serviceId: string;
  };
  items: { slug: string; qty: number }[];
  couponCode?: string;
  tracking?: unknown;
  // Opt-ins de marketing marcados no checkout (todos desmarcados por padrão). O pedido não
  // depende de nenhum deles.
  consents?: { email?: boolean; whatsapp?: boolean; sms?: boolean; textVersion?: string };
}

const CONSENT_CHANNELS = ["email", "whatsapp", "sms"] as const;

Deno.serve(async (req) => {
  const { json, preflight } = makeResponders(req);
  const preflightResponse = preflight();
  if (preflightResponse) return preflightResponse;

  try {
    const body: RequestBody = await req.json();
    const { customer, shipping, items, couponCode, consents } = body;
    const tracking = sanitizeTracking(body.tracking);

    if (!customer?.nome || !customer?.email || !customer?.telefone) {
      return json({ message: "Dados de contato incompletos." }, 400);
    }
    if (
      !shipping?.cep || !shipping?.rua || !shipping?.numero ||
      !shipping?.bairro || !shipping?.cidade || !shipping?.uf
    ) {
      return json({ message: "Endereço de entrega incompleto." }, 400);
    }
    if (!Array.isArray(items) || items.length === 0) {
      return json({ message: "Carrinho vazio." }, 400);
    }
    const destinationCep = normalizeCep(shipping.cep);
    if (!destinationCep) return json({ message: "CEP inválido." }, 400);
    if (typeof shipping.serviceId !== "string" || !shipping.serviceId) {
      return json({ code: "missing_shipping_service", message: "Escolha uma opção de entrega." }, 400);
    }

    const rawCoupon = couponCode?.trim() ?? "";
    const normalizedCoupon = rawCoupon ? normalizeCouponCode(rawCoupon) : "";
    if (rawCoupon && !looksLikeCouponCode(normalizedCoupon)) {
      return json({ code: "invalid_coupon", message: "Código de desconto inválido." }, 400);
    }

    const supabase = createAdminClient();

    const slugs = items.map((i) => i.slug);
    const { data: products, error: productsError } = await supabase
      .from("shop_products")
      .select("id, slug, name, weight_grams, price_cents, price_tier2_cents, price_tier3_cents")
      .in("slug", slugs)
      .eq("active", true);

    if (productsError) throw productsError;

    const productBySlug = new Map(products.map((p) => [p.slug, p]));
    for (const item of items) {
      if (!productBySlug.has(item.slug) || !Number.isInteger(item.qty) || item.qty < 1) {
        return json({ message: `Item inválido: ${item.slug}.` }, 400);
      }
    }

    // Volume-discount tier is decided by total units across the whole cart
    // (any mix of flavors) — never trust a tier/price sent by the client.
    const totalUnits = items.reduce((sum, item) => sum + item.qty, 0);
    if (totalUnits > MAX_UNITS_PER_QUOTE) {
      return json({ message: "Quantidade acima do limite por pedido. Fale com a gente pelo WhatsApp." }, 400);
    }
    const tier = tierForCartUnits(totalUnits);

    const orderItems = items.map((item) => {
      const product = productBySlug.get(item.slug)!;
      const unitPriceCents = unitPriceForTier(tier, product);
      const subtotalCents = unitPriceCents * item.qty;
      return {
        product_id: product.id,
        product_slug: product.slug,
        product_name: product.name,
        unit_price_cents: unitPriceCents,
        qty: item.qty,
        subtotal_cents: subtotalCents,
      };
    });

    const rawSubtotalCents = orderItems.reduce((sum, i) => sum + i.subtotal_cents, 0);

    // Cupom: a regra e os limites (validade, usos, por cliente, pedido mínimo) vêm do banco.
    let coupon: CouponRule | null = null;
    if (normalizedCoupon) {
      const { data: check, error: couponError } = await supabase.rpc("shop_coupon_check", {
        p_code: normalizedCoupon,
        p_email: customer.email,
        p_subtotal_cents: rawSubtotalCents,
      });
      if (couponError) throw couponError;
      coupon = ruleFromCheck(check);
      if (!coupon) {
        const reason = (check as { reason?: unknown } | null)?.reason;
        return json({ code: "invalid_coupon", message: typeof reason === "string" ? reason : "Código de desconto inválido." }, 400);
      }
    }

    // Frete: recotado no Melhor Envio com o CEP e os itens que o servidor conhece, e o serviço
    // escolhido tem que estar entre as opções de agora. Nada de preço vindo do cliente.
    const catalog: Record<string, { weightGrams: number }> = {};
    for (const p of products) catalog[p.slug] = { weightGrams: p.weight_grams };
    let shippingOptions;
    try {
      console.log("shop-create-order: cotando frete", { ambiente: SHIPPING_ENVIRONMENT });
      shippingOptions = await calculateShipping(destinationCep, items, catalog);
    } catch (e) {
      console.error("shop-create-order: falha no Melhor Envio", (e as Error).message);
      return json({ code: "shipping_unavailable", message: "Não foi possível calcular o frete agora. Tente novamente em instantes." }, 502);
    }
    const chosenShipping = findShippingOption(shippingOptions, shipping.serviceId);
    if (!chosenShipping) {
      return json({
        code: "shipping_service_unavailable",
        message: "Essa opção de entrega não está mais disponível. Escolha outra no carrinho.",
      }, 409);
    }

    const rawShippingFee = chosenShipping.priceCents;
    const { subtotalCents, shippingFeeCents: couponShippingFee } = coupon
      ? applyCoupon(coupon, rawSubtotalCents, rawShippingFee)
      : { subtotalCents: rawSubtotalCents, shippingFeeCents: rawShippingFee };
    // Frete grátis acima do valor mínimo (sobre os produtos já com cupom).
    const shippingFee = chargedShippingCents(couponShippingFee, subtotalCents);
    const totalCents = subtotalCents + shippingFee;

    const { data: existingCustomer } = await supabase
      .from("shop_customers")
      .select("id")
      .eq("email", customer.email)
      .maybeSingle();

    let customerId: string;
    if (existingCustomer) {
      customerId = existingCustomer.id;
      await supabase
        .from("shop_customers")
        .update({ nome: customer.nome, telefone: customer.telefone, updated_at: new Date().toISOString() })
        .eq("id", customerId);
    } else {
      const { data: inserted, error: insertCustomerError } = await supabase
        .from("shop_customers")
        .insert({ nome: customer.nome, email: customer.email, telefone: customer.telefone })
        .select("id")
        .single();
      if (insertCustomerError) throw insertCustomerError;
      customerId = inserted.id;
    }

    let orderNumber = generateOrderNumber();
    let order;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data, error } = await supabase
        .from("shop_orders")
        .insert({
          order_number: orderNumber,
          customer_id: customerId,
          nome: customer.nome,
          email: customer.email,
          telefone: customer.telefone,
          cep: shipping.cep,
          rua: shipping.rua,
          numero: shipping.numero,
          complemento: shipping.complemento ?? null,
          bairro: shipping.bairro,
          cidade: shipping.cidade,
          uf: shipping.uf,
          shipping_method: chosenShipping.serviceId,
          shipping_service_name: `${chosenShipping.company} ${chosenShipping.name}`.trim(),
          shipping_quote_cents: chosenShipping.priceCents,
          shipping_delivery_days: chosenShipping.deliveryDays,
          shipping_fee_cents: shippingFee,
          subtotal_cents: subtotalCents,
          total_cents: totalCents,
          coupon_code: coupon?.code ?? null,
          status: "pending",
        })
        .select("id, order_number, access_token")
        .single();

      if (!error) {
        order = data;
        break;
      }
      if (error.code === "23505") {
        orderNumber = generateOrderNumber();
        continue;
      }
      throw error;
    }
    if (!order) throw new Error("Não foi possível gerar um número de pedido único.");

    const itemsToInsert = orderItems.map((i) => ({ ...i, order_id: order.id }));
    const { error: itemsError } = await supabase.from("shop_order_items").insert(itemsToInsert);
    if (itemsError) throw itemsError;

    const who = {
      email: customer.email,
      phone: customer.telefone,
      personName: customer.nome,
      shopCustomerId: customerId,
      anonymousId: tracking.anonymousId,
      sessionId: tracking.sessionId,
    };
    await crmTrack(supabase, {
      ...who,
      name: "order_created",
      properties: {
        order_id: order.id,
        order_number: order.order_number,
        items: orderItems.map((i) => ({
          product_id: i.product_slug,
          product_name: i.product_name,
          quantity: i.qty,
          price_cents: i.unit_price_cents,
        })),
        subtotal_cents: subtotalCents,
        discount_cents: rawSubtotalCents - subtotalCents + (rawShippingFee - shippingFee),
        shipping_cents: shippingFee,
        total_cents: totalCents,
        coupon: coupon?.code ?? null,
        shipping_city: shipping.cidade,
        shipping_uf: shipping.uf,
      },
      idempotencyKey: `order:${order.order_number}:created`,
    });
    for (const channel of CONSENT_CHANNELS) {
      if (consents?.[channel] !== true) continue;
      await crmTrack(supabase, {
        ...who,
        name: "consent_granted",
        properties: {
          channel,
          source: "checkout",
          text_version: typeof consents.textVersion === "string" ? consents.textVersion.slice(0, 40) : null,
          order_number: order.order_number,
        },
        idempotencyKey: `order:${order.order_number}:consent:${channel}`,
      });
    }

    const functionsBaseUrl = Deno.env.get("SUPABASE_URL")!.replace(".supabase.co", ".functions.supabase.co");
    const preference = await createPreference({
      items: orderItems.map((i) => ({
        id: i.product_slug,
        title: i.product_name,
        quantity: i.qty,
        unit_price: i.unit_price_cents / 100,
        currency_id: "BRL",
      })),
      externalReference: order.order_number,
      notificationUrl: `${functionsBaseUrl}/shop-mercadopago-webhook`,
      payerEmail: customer.email,
    });

    await supabase
      .from("shop_orders")
      .update({ mp_preference_id: preference.id })
      .eq("id", order.id);

    return json({
      orderNumber: order.order_number,
      accessToken: order.access_token,
      preferenceId: preference.id,
      amount: totalCents / 100,
    });
  } catch (err) {
    console.error("shop-create-order error", err);
    return json({ message: "Erro ao criar o pedido." }, 500);
  }
});
