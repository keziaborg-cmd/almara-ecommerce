-- Cupons da loja numa tabela (antes eram fixos no código: BEM10 e FRETEZERO). A equipe cria e
-- edita pelo Almara Metrics (cupons de creator/afiliado, com comissão); o checkout do site valida
-- por aqui. A loja do app ainda usa a lista fixa dela até o próximo build.
--
--   kind = 'percent'        → percent_off % nos chás (sobre o subtotal dos produtos)
--   kind = 'free_shipping'  → frete grátis
-- Limites opcionais: validade (starts_at/ends_at), usos no total (max_uses), usos por cliente
-- (max_uses_per_customer, pelo e-mail) e pedido mínimo (min_subtotal_cents). Só pedido pago
-- (status 'approved') conta como uso.

create table if not exists public.shop_coupons (
  code text primary key check (code ~ '^[A-Z0-9]{3,24}$'),
  kind text not null check (kind in ('percent', 'free_shipping')),
  percent_off integer check (percent_off between 1 and 90),
  creator_name text check (char_length(creator_name) <= 80),
  creator_handle text check (char_length(creator_handle) <= 80),
  commission_percent numeric(5,2) not null default 0 check (commission_percent between 0 and 100),
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  max_uses integer check (max_uses > 0),
  max_uses_per_customer integer check (max_uses_per_customer > 0),
  min_subtotal_cents integer check (min_subtotal_cents > 0),
  notes text check (char_length(notes) <= 500),
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shop_coupons_percent_kind check ((kind = 'percent') = (percent_off is not null)),
  constraint shop_coupons_period check (ends_at is null or starts_at is null or ends_at > starts_at)
);

-- Ninguém de fora lê a tabela: o checkout passa pela função abaixo (service role).
alter table public.shop_coupons enable row level security;
revoke all on public.shop_coupons from anon, authenticated;

insert into public.shop_coupons (code, kind, percent_off, notes, created_by)
values
  ('BEM10', 'percent', 10, 'Cupom da marca (antes fixo no código).', 'migration'),
  ('FRETEZERO', 'free_shipping', null, 'Cupom da marca (antes fixo no código).', 'migration')
on conflict (code) do nothing;

create index if not exists shop_orders_coupon_idx on public.shop_orders (coupon_code) where coupon_code is not null;

-- Confere se o cupom vale agora pra este pedido. p_email pode ser null (pré-visualização do
-- carrinho, antes do e-mail): aí o limite por cliente só é checado ao criar o pedido.
create or replace function public.shop_coupon_check(p_code text, p_email text, p_subtotal_cents integer)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  c public.shop_coupons;
  v_used integer;
begin
  select * into c from public.shop_coupons where code = upper(trim(p_code));
  if not found or not c.active then
    return jsonb_build_object('ok', false, 'reason', 'Código de desconto inválido.');
  end if;
  if c.starts_at is not null and now() < c.starts_at then
    return jsonb_build_object('ok', false, 'reason', 'Este cupom ainda não está valendo.');
  end if;
  if c.ends_at is not null and now() >= c.ends_at then
    return jsonb_build_object('ok', false, 'reason', 'Este cupom expirou.');
  end if;
  if c.min_subtotal_cents is not null and coalesce(p_subtotal_cents, 0) < c.min_subtotal_cents then
    return jsonb_build_object('ok', false, 'reason',
      'Este cupom vale para pedidos a partir de R$ ' || replace(to_char(c.min_subtotal_cents / 100.0, 'FM999990.00'), '.', ',') || ' em chás.');
  end if;
  if c.max_uses is not null then
    select count(*) into v_used from public.shop_orders where coupon_code = c.code and status = 'approved';
    if v_used >= c.max_uses then
      return jsonb_build_object('ok', false, 'reason', 'Este cupom já atingiu o limite de usos.');
    end if;
  end if;
  if c.max_uses_per_customer is not null and nullif(trim(p_email), '') is not null then
    select count(*) into v_used from public.shop_orders
      where coupon_code = c.code and status = 'approved' and lower(email) = lower(trim(p_email));
    if v_used >= c.max_uses_per_customer then
      return jsonb_build_object('ok', false, 'reason', 'Você já usou este cupom o número máximo de vezes.');
    end if;
  end if;
  return jsonb_build_object('ok', true, 'code', c.code, 'kind', c.kind, 'percent_off', c.percent_off);
end;
$$;

revoke all on function public.shop_coupon_check(text, text, integer) from public, anon, authenticated;
grant execute on function public.shop_coupon_check(text, text, integer) to service_role;
