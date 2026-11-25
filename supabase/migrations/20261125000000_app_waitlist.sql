-- Lista de espera do Almara+ (iPhone, enquanto o app está em análise na Apple). Tabela própria,
-- separada da newsletter (blog_subscribers): o consentimento aqui é só para receber o aviso de
-- quando o app chegar na App Store, não para marketing. Entrada pela Edge Function
-- app-waitlist-subscribe (service_role); confirmação pelo link do e-mail (app_waitlist_confirm).

create table if not exists public.app_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(email) and length(email) between 3 and 254),
  platform text not null check (platform in ('ios')),
  source text not null check (source ~ '^[a-z0-9-]{1,60}$'),
  utm_source text check (utm_source is null or length(utm_source) <= 60),
  utm_medium text check (utm_medium is null or length(utm_medium) <= 60),
  journey text check (journey is null or journey in ('sono', 'ansiedade', 'produtividade', 'pausa')),
  consent_text_version text check (consent_text_version is null or length(consent_text_version) <= 40),
  confirm_token uuid not null default gen_random_uuid(),
  confirm_sent_at timestamptz,
  confirmed_at timestamptz,
  -- para o e-mail do aviso ter "não quero mais receber"
  unsubscribe_token uuid not null default gen_random_uuid(),
  unsubscribed_at timestamptz,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (email, platform)
);
create unique index if not exists app_waitlist_confirm_token_idx on public.app_waitlist (confirm_token);
create unique index if not exists app_waitlist_unsubscribe_token_idx on public.app_waitlist (unsubscribe_token);

alter table public.app_waitlist enable row level security;
revoke all on table public.app_waitlist from public, anon, authenticated;
grant all on table public.app_waitlist to service_role;

-- Confirmação pelo link do e-mail. O token é de uso único (troca na confirmação).
create or replace function public.app_waitlist_confirm(p_token uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
begin
  update public.app_waitlist
     set confirmed_at = coalesce(confirmed_at, now()), unsubscribed_at = null, confirm_token = gen_random_uuid()
   where confirm_token = p_token
  returning id into v_id;
  return v_id is not null;
end $$;
revoke all on function public.app_waitlist_confirm(uuid) from public, anon, authenticated;
grant execute on function public.app_waitlist_confirm(uuid) to anon, service_role;
