import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

// Entrada de eventos do CRM pelo servidor (public.crm_track_server, definida em
// almara-metrics/db/006_crm_core.sql). Nunca lança: o CRM fora do ar não pode
// derrubar um pedido ou pagamento.
export interface CrmServerEvent {
  name: string;
  email?: string | null;
  phone?: string | null;
  personName?: string | null;
  shopCustomerId?: string | null;
  anonymousId?: string | null;
  sessionId?: string | null;
  properties?: Record<string, unknown>;
  idempotencyKey?: string | null;
}

export async function crmTrack(supabase: SupabaseClient, e: CrmServerEvent): Promise<void> {
  try {
    const { error } = await supabase.rpc("crm_track_server", {
      p_name: e.name,
      p_email: e.email ?? null,
      p_phone: e.phone ?? null,
      p_person_name: e.personName ?? null,
      p_shop_customer_id: e.shopCustomerId ?? null,
      p_anonymous_id: e.anonymousId ?? null,
      p_session_id: e.sessionId ?? null,
      p_properties: e.properties ?? {},
      p_idempotency_key: e.idempotencyKey ?? null,
    });
    if (error) console.error("crm_track_server failed", e.name, error.message);
  } catch (err) {
    console.error("crm_track_server threw", e.name, err);
  }
}

export interface CrmTracking {
  anonymousId?: string;
  sessionId?: string;
}

// Só aceita ids no formato que o tracker do site gera — o corpo da requisição vem do navegador.
export function sanitizeTracking(raw: unknown): CrmTracking {
  const t = (raw ?? {}) as Record<string, unknown>;
  const ok = (v: unknown) => (typeof v === "string" && /^[A-Za-z0-9_-]{8,64}$/.test(v) ? v : undefined);
  return { anonymousId: ok(t.anonymousId), sessionId: ok(t.sessionId) };
}

const CONSENT_CHANNELS = ["email", "whatsapp", "sms"] as const;
export type ConsentChannel = (typeof CONSENT_CHANNELS)[number];
export interface RequestedConsents {
  channels: ConsentChannel[];
  textVersion: string | null;
}

// Consentimentos marcados no checkout (corpo vindo do navegador): guardados no pedido e só
// enviados ao CRM quando o pagamento é aprovado. null = nenhum canal marcado.
export function requestedConsentsFrom(raw: unknown): RequestedConsents | null {
  const c = (raw ?? {}) as Record<string, unknown>;
  const channels = CONSENT_CHANNELS.filter((ch) => c[ch] === true);
  if (channels.length === 0) return null;
  return { channels, textVersion: typeof c.textVersion === "string" ? c.textVersion.slice(0, 40) : null };
}

// Lê o que foi guardado no pedido (jsonb), aceitando só canais conhecidos.
export function parseRequestedConsents(raw: unknown): RequestedConsents | null {
  const r = (raw ?? {}) as { channels?: unknown; textVersion?: unknown };
  const channels = Array.isArray(r.channels)
    ? CONSENT_CHANNELS.filter((ch) => (r.channels as unknown[]).includes(ch))
    : [];
  if (channels.length === 0) return null;
  return { channels, textVersion: typeof r.textVersion === "string" ? r.textVersion.slice(0, 40) : null };
}
