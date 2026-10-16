-- Preços v2 dos chás (planilha de precificação com os pesos novos): 3x o custo, arredondado pro
-- próximo ,90 acima. Faixas por total de latas no pedido: 1 = price, 2 = tier2, 3+ = tier3.
update public.shop_products set price_cents = 2090, price_tier2_cents = 1790, price_tier3_cents = 1690, updated_at = now() where slug = 'cidreira';
update public.shop_products set price_cents = 2290, price_tier2_cents = 1990, price_tier3_cents = 1890, updated_at = now() where slug = 'cha-verde';
update public.shop_products set price_cents = 2390, price_tier2_cents = 2090, price_tier3_cents = 1990, updated_at = now() where slug = 'camomila';
update public.shop_products set price_cents = 2490, price_tier2_cents = 2190, price_tier3_cents = 2090, updated_at = now() where slug = 'hibisco';
update public.shop_products set price_cents = 3390, price_tier2_cents = 3090, price_tier3_cents = 2990, updated_at = now() where slug = 'cha-preto';
update public.shop_products set price_cents = 3990, price_tier2_cents = 3690, price_tier3_cents = 3590, updated_at = now() where slug = 'jasmin';
