-- Consentimentos de comunicação marcados no checkout ficam no pedido e só vão pro CRM quando o
-- pagamento é aprovado (applyPaymentUpdate). Antes iam na criação do pedido, com um e-mail que
-- ninguém confirmou — qualquer um dava consentimento em nome de outra pessoa.
-- Formato: {"channels": ["email", "whatsapp"], "textVersion": "..."}; null = nada marcado.
alter table public.shop_orders add column if not exists requested_consents jsonb;
