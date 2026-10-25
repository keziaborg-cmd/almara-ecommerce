-- Cotações de frete guardadas (supabase/functions/_shared/shippingResilience.ts). A conta do Melhor
-- Envio (a mesma do app) aceita 250 requisições/minuto e cada cotação faz uma por caixa: mesmo CEP +
-- mesmas caixas reaproveitam a cotação por 10 min, e se o Melhor Envio falhar usa a última (até 24 h)
-- em vez de travar o checkout. Só as funções do site (service role) leem e escrevem.
create table if not exists public.shop_shipping_quote_cache (
  cache_key text primary key,
  options jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists shop_shipping_quote_cache_created_idx on public.shop_shipping_quote_cache (created_at);
alter table public.shop_shipping_quote_cache enable row level security;
revoke all on table public.shop_shipping_quote_cache from anon, authenticated;
