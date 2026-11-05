-- Black Friday 2026: kits de preço fixo, limite de unidades por kit e reserva com trava.
-- As regras de preço (kit fora do desconto progressivo e do cupom) e o período (27/11 a 30/11,
-- horário de Brasília) ficam nas Edge Functions (supabase/functions/_shared/kits.ts); aqui ficam
-- o catálogo e a contagem de unidades, que precisam de trava no banco.

alter table public.shop_products
  add column if not exists kind text not null default 'lata' check (kind in ('lata', 'kit')),
  add column if not exists compare_at_cents integer check (compare_at_cents is null or compare_at_cents > 0),
  add column if not exists kit_components text[],
  add column if not exists kit_limit integer check (kit_limit is null or kit_limit >= 0);

alter table public.shop_products drop constraint if exists shop_products_kit_shape;
alter table public.shop_products add constraint shop_products_kit_shape check (
  (kind = 'lata' and kit_components is null and kit_limit is null)
  or (kind = 'kit' and cardinality(kit_components) > 0 and kit_limit is not null)
);

-- Até quando um pedido pendente segura as unidades de kit (renovado logo antes de cobrar).
alter table public.shop_orders add column if not exists kit_hold_until timestamptz;
-- Sabores do kit por extenso, gravados no pedido (e-mail do pedido e nota fiscal).
alter table public.shop_order_items add column if not exists kit_contents text;

-- Preço "de" = soma das latas avulsas (preço de 1 unidade). Faixas 2/3 iguais ao preço: kit não
-- tem desconto progressivo. Peso = soma do chá de cada lata (o frete usa as latas, não este número).
insert into public.shop_products (slug, name, kind, price_cents, price_tier2_cents, price_tier3_cents, compare_at_cents, weight_grams, kit_components, kit_limit, active)
values
  ('kit-dia-inteiro', 'Kit Dia Inteiro', 'kit', 11990, 11990, 11990, 16640, 510,
   array['camomila', 'cidreira', 'cha-verde', 'cha-preto', 'hibisco', 'jasmin'], 60, true),
  ('kit-foco', 'Kit Foco', 'kit', 4490, 4490, 4490, 5680, 240,
   array['cha-preto', 'cha-verde'], 15, true),
  ('kit-desacelerar', 'Kit Desacelerar', 'kit', 6290, 6290, 6290, 8470, 175,
   array['camomila', 'cidreira', 'jasmin'], 15, true)
on conflict (slug) do update set
  name = excluded.name, kind = excluded.kind, price_cents = excluded.price_cents,
  price_tier2_cents = excluded.price_tier2_cents, price_tier3_cents = excluded.price_tier3_cents,
  compare_at_cents = excluded.compare_at_cents, weight_grams = excluded.weight_grams,
  kit_components = excluded.kit_components, kit_limit = excluded.kit_limit, active = excluded.active;

-- Unidades de cada kit já tomadas: pagas, ou ainda dentro da reserva (pendente, ou com o cartão
-- recusado e a pessoa tentando de novo).
create or replace function public.shop_kit_units_taken(p_slug text, p_exclude_order uuid default null)
returns integer language sql stable security definer set search_path = '' as $$
  select coalesce(sum(i.qty), 0)::int
  from public.shop_order_items i
  join public.shop_orders o on o.id = i.order_id
  where i.product_slug = p_slug
    and o.id is distinct from p_exclude_order
    and (o.status = 'approved' or (o.status in ('pending', 'rejected') and o.kit_hold_until > now()));
$$;
revoke all on function public.shop_kit_units_taken(text, uuid) from public, anon, authenticated;
grant execute on function public.shop_kit_units_taken(text, uuid) to service_role;

-- Reserva (ou renova a reserva) das unidades de kit de um pedido. Trava cada kit do pedido, conta
-- o que os OUTROS pedidos já tomaram e, se couber, segura as unidades deste por 35 minutos (o
-- Pix do pedido vence 1 minuto antes; 30 min é o prazo mínimo do Pix no Mercado Pago).
-- Chamada pelo servidor ao criar o pedido e de novo logo antes de cobrar: duas pessoas pagando ao
-- mesmo tempo pela última unidade passam uma de cada vez por aqui, e a segunda vê a reserva da
-- primeira.
create or replace function public.shop_kit_hold(p_order_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  r record;
  v_taken integer;
begin
  for r in
    select i.product_slug as slug, sum(i.qty)::int as qty, p.kit_limit
    from public.shop_order_items i
    join public.shop_products p on p.slug = i.product_slug and p.kind = 'kit'
    where i.order_id = p_order_id
    group by i.product_slug, p.kit_limit
    order by i.product_slug
  loop
    perform pg_advisory_xact_lock(hashtext('shop_kit:' || r.slug));
  end loop;

  for r in
    select i.product_slug as slug, p.name, sum(i.qty)::int as qty, p.kit_limit
    from public.shop_order_items i
    join public.shop_products p on p.slug = i.product_slug and p.kind = 'kit'
    where i.order_id = p_order_id
    group by i.product_slug, p.name, p.kit_limit
    order by i.product_slug
  loop
    v_taken := public.shop_kit_units_taken(r.slug, p_order_id);
    if v_taken + r.qty > r.kit_limit then
      return jsonb_build_object('ok', false, 'slug', r.slug, 'name', r.name, 'remaining', greatest(r.kit_limit - v_taken, 0));
    end if;
  end loop;

  update public.shop_orders set kit_hold_until = now() + interval '35 minutes' where id = p_order_id;
  return jsonb_build_object('ok', true, 'hold_until', (select kit_hold_until from public.shop_orders where id = p_order_id));
end $$;
revoke all on function public.shop_kit_hold(uuid) from public, anon, authenticated;
grant execute on function public.shop_kit_hold(uuid) to service_role;

-- Quanto resta de cada kit (pra mostrar "esgotado"). Pública: só números agregados.
create or replace function public.shop_kits_status()
returns table (slug text, kit_limit integer, remaining integer)
language sql stable security definer set search_path = '' as $$
  select p.slug, p.kit_limit, greatest(p.kit_limit - public.shop_kit_units_taken(p.slug, null), 0)
  from public.shop_products p
  where p.kind = 'kit' and p.active
  order by p.slug;
$$;
revoke all on function public.shop_kits_status() from public;
grant execute on function public.shop_kits_status() to anon, authenticated, service_role;
