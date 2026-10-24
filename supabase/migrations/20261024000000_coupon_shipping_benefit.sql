-- Cupom com desconto nos chás E benefício no frete, num código só (ex.: creator com 15% + frete
-- grátis até R$ 20; afiliado só com frete grátis até R$ 20).
--   shipping_benefit = 'none'   → sem benefício no frete
--                    = 'free'   → frete grátis
--                    = 'capped' → desconta até shipping_cap_cents do frete; o cliente paga a diferença
-- kind continua: 'percent' (tem % nos chás, com ou sem frete) ou 'free_shipping' (só frete). Os
-- cupons 'free_shipping' que já existem (FRETEZERO) viram shipping_benefit = 'free'.

alter table public.shop_coupons add column if not exists shipping_benefit text not null default 'none';
alter table public.shop_coupons add column if not exists shipping_cap_cents integer;
update public.shop_coupons set shipping_benefit = 'free' where kind = 'free_shipping' and shipping_benefit = 'none';

alter table public.shop_coupons drop constraint if exists shop_coupons_shipping_benefit_check;
alter table public.shop_coupons add constraint shop_coupons_shipping_benefit_check check (shipping_benefit in ('none', 'free', 'capped'));
alter table public.shop_coupons drop constraint if exists shop_coupons_shipping_cap;
alter table public.shop_coupons add constraint shop_coupons_shipping_cap
  check ((shipping_benefit = 'capped') = (shipping_cap_cents is not null) and (shipping_cap_cents is null or shipping_cap_cents between 1 and 100000));
-- cupom só de frete precisa de algum benefício no frete
alter table public.shop_coupons drop constraint if exists shop_coupons_has_benefit;
alter table public.shop_coupons add constraint shop_coupons_has_benefit check (kind = 'percent' or shipping_benefit <> 'none');

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
  -- Só na primeira compra: o e-mail do pedido nunca teve pedido pago. Sem e-mail (pré-visualização
  -- do carrinho) passa; o pedido confere de novo com o e-mail.
  if c.first_purchase_only and nullif(trim(p_email), '') is not null then
    if exists (select 1 from public.shop_orders where status = 'approved' and lower(email) = lower(trim(p_email))) then
      return jsonb_build_object('ok', false, 'reason', 'Este cupom vale só na primeira compra.');
    end if;
  end if;
  return jsonb_build_object('ok', true, 'code', c.code, 'kind', c.kind, 'percent_off', c.percent_off,
    'shipping', c.shipping_benefit, 'shipping_cap_cents', c.shipping_cap_cents);
end;
$$;

revoke all on function public.shop_coupon_check(text, text, integer) from public, anon, authenticated;
grant execute on function public.shop_coupon_check(text, text, integer) to service_role;
