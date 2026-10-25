-- Newsletter com confirmação por e-mail (double opt-in) e sem escrita direta do navegador.
--
-- Antes: o navegador inseria direto em blog_subscribers (com qualquer coluna, inclusive o
-- unsubscribe_token), o erro de e-mail duplicado revelava quem já era inscrito, e o pop-up dava
-- consentimento no CRM pra qualquer e-mail digitado — inclusive reativando quem tinha saído.
--
-- Agora:
--   * só a função newsletter-subscribe (service role) escreve na tabela; o e-mail é guardado em
--     minúsculas e o token de descadastro é sempre gerado pelo banco;
--   * a inscrição nasce pendente (confirmed_at null) e a pessoa recebe um link de confirmação;
--   * newsletter_confirm (chamada pela página /newsletter/confirmar, em POST) marca a confirmação,
--     volta a pessoa pra lista e só então grava o consentimento de e-mail no CRM.
-- Inscritos que já existiam ficam como confirmados (não mudam de situação).

alter table public.blog_subscribers add column if not exists confirmed_at timestamptz;
alter table public.blog_subscribers add column if not exists confirm_token uuid not null default gen_random_uuid();
alter table public.blog_subscribers add column if not exists confirm_sent_at timestamptz;
-- versão do texto de consentimento que a pessoa viu ao se inscrever (vai pro CRM na confirmação)
alter table public.blog_subscribers add column if not exists consent_text_version text;
create unique index if not exists blog_subscribers_confirm_token_idx on public.blog_subscribers (confirm_token);

update public.blog_subscribers set confirmed_at = created_at where confirmed_at is null;

drop policy if exists "anyone can subscribe" on public.blog_subscribers;
revoke all on table public.blog_subscribers from anon, authenticated;

create or replace function public.newsletter_confirm(p_token uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
  v_email text;
  v_text_version text;
begin
  -- o token é de uso único: troca na confirmação, então o mesmo link não reconfirma depois de um descadastro
  update public.blog_subscribers
     set confirmed_at = now(), unsubscribed_at = null, confirm_token = gen_random_uuid()
   where confirm_token = p_token
  returning id, email, consent_text_version into v_id, v_email, v_text_version;
  if v_id is null then
    return false;
  end if;
  perform public.crm_track_server(
    p_name => 'newsletter_subscribed',
    p_email => v_email,
    p_properties => jsonb_build_object('source', 'newsletter_confirm', 'text_version', v_text_version),
    p_idempotency_key => 'newsletter-confirm:' || v_id::text || ':' || (extract(epoch from now()) * 1000)::bigint::text
  );
  return true;
end $$;
revoke all on function public.newsletter_confirm(uuid) from public, anon, authenticated;
grant execute on function public.newsletter_confirm(uuid) to anon, service_role;
