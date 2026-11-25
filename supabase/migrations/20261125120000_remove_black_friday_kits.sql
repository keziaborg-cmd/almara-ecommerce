-- Sem Black Friday em 2026 (decisão da Kezia, 25/11): desfaz a 20261105000000_black_friday_kits.
-- Rodar só DEPOIS de publicar as Edge Functions da loja sem o código dos kits (as antigas leem
-- estas colunas e funções). Nenhum pedido usou kit (a venda só abriria em 27/11): conferido antes.

do $$
begin
  if exists (select 1 from public.shop_order_items where product_slug in ('kit-dia-inteiro', 'kit-foco', 'kit-desacelerar')) then
    raise exception 'Há pedido com kit: não apagar sem revisar';
  end if;
end $$;

drop function if exists public.shop_kits_status();
drop function if exists public.shop_kit_hold(uuid);
drop function if exists public.shop_kit_units_taken(text, uuid);

delete from public.shop_products where slug in ('kit-dia-inteiro', 'kit-foco', 'kit-desacelerar');

alter table public.shop_products drop constraint if exists shop_products_kit_shape;
alter table public.shop_products
  drop column if exists kind,
  drop column if exists compare_at_cents,
  drop column if exists kit_components,
  drop column if exists kit_limit;
alter table public.shop_orders drop column if exists kit_hold_until;
alter table public.shop_order_items drop column if exists kit_contents;
