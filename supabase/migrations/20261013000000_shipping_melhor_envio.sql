-- Frete real (Melhor Envio): shipping_method deixa de ser só 'padrao'/'retirada' e passa a guardar o
-- id do serviço escolhido; o resto do que foi cotado fica registrado pra conferência de custo.
-- Pedidos antigos ('padrao') continuam válidos. Seguro re-rodar.

do $$
declare c text;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.shop_orders'::regclass and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%shipping_method%'
  loop
    execute format('alter table public.shop_orders drop constraint %I', c);
  end loop;
end $$;

alter table public.shop_orders add column if not exists shipping_service_name text;
-- Preço cotado no Melhor Envio (antes de cupom e de frete grátis); shipping_fee_cents é o cobrado.
alter table public.shop_orders add column if not exists shipping_quote_cents integer;
alter table public.shop_orders add column if not exists shipping_delivery_days integer;
