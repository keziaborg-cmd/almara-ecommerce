-- Confirmação da newsletter (link clicado no e-mail) é dado confirmado: com o crm_track_server
-- novo (almara-metrics/db/028, aplicar antes), só p_verified => true grava o consentimento.
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
    p_idempotency_key => 'newsletter-confirm:' || v_id::text || ':' || (extract(epoch from now()) * 1000)::bigint::text,
    p_verified => true
  );
  return true;
end $$;
revoke all on function public.newsletter_confirm(uuid) from public, anon, authenticated;
grant execute on function public.newsletter_confirm(uuid) to anon, service_role;
