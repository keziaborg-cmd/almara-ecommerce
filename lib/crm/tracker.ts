"use client";

import { hasAnalyticsConsent, useConsentStore } from "@/lib/consent/consent";
import { migrateLegacyStorage, STORAGE_KEYS } from "@/lib/storage-keys";

// Tracking first-party do CRM. Os eventos vão em lote pra public.crm_track_web (definida em
// almara-metrics/db/006_crm_core.sql), que valida contra o catálogo e faz identity resolution.
//
// Consentimento: sem "cookies de análise" aceitos, não existe anonymous_id nem sessão (nada é
// guardado no navegador) e só os eventos do funil de compra abaixo são enviados — e-mail e
// telefone digitados no checkout identificam a pessoa mesmo antes de finalizar (decisão da
// Kezia, 2026-10-07), pra permitir recuperar checkout abandonado.
const ESSENTIAL_EVENTS = new Set([
  "email_submitted",
  "phone_submitted",
  "address_started",
  "address_completed",
  "checkout_started",
  "coupon_applied",
]);

const ANON_KEY = STORAGE_KEYS.anonymousId;
const SESSION_KEY = STORAGE_KEYS.session;
const ATTRIBUTION_KEY = STORAGE_KEYS.attribution;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const FLUSH_DELAY_MS = 1500;
const MAX_BATCH = 50;

// Parâmetros de URL que podem ir pro CRM. Todo o resto é descartado — /pedido/[n]?token=... por
// exemplo carrega o token de acesso ao pedido, que não pode vazar pro log de eventos.
const ALLOWED_QUERY_PARAMS = /^(utm_[a-z]+|gclid|fbclid|ref)$/;

export type TrackProps = Record<string, unknown>;

export interface TrackIdentity {
  email?: string;
  phone?: string;
  personName?: string;
}

interface QueuedEvent {
  name: string;
  occurred_at: string;
  anonymous_id?: string;
  session_id?: string;
  email?: string;
  phone?: string;
  person_name?: string;
  properties: TrackProps;
  context: TrackProps;
  idempotency_key: string;
}

interface Attribution {
  sessionId: string;
  utm: Record<string, string>;
  referrer: string | null;
  landingPath: string;
  landingTracked?: boolean;
}

const queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let initialized = false;

function newId(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

function readStorage(key: string): string | null {
  migrateLegacyStorage();
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // storage indisponível: segue sem persistir
  }
}

export function safeUrl(href: string): string {
  try {
    const url = new URL(href);
    for (const key of Array.from(url.searchParams.keys())) {
      if (!ALLOWED_QUERY_PARAMS.test(key)) url.searchParams.delete(key);
    }
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

export function parseUtm(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const utm: Record<string, string> = {};
  for (const [key, value] of params) {
    if (ALLOWED_QUERY_PARAMS.test(key) && value) utm[key] = value.slice(0, 120);
  }
  return utm;
}

export function deviceType(userAgent: string): "mobile" | "tablet" | "desktop" {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(userAgent)) return "tablet";
  if (/Mobi|iPhone|iPod|Android/i.test(userAgent)) return "mobile";
  return "desktop";
}

export function browserName(userAgent: string): string {
  if (/Edg\//.test(userAgent)) return "edge";
  if (/OPR\/|Opera/.test(userAgent)) return "opera";
  if (/SamsungBrowser/.test(userAgent)) return "samsung";
  if (/Chrome\//.test(userAgent) && !/Chromium/.test(userAgent)) return "chrome";
  if (/Firefox\//.test(userAgent)) return "firefox";
  if (/Safari\//.test(userAgent)) return "safari";
  return "other";
}

function externalReferrer(): string | null {
  if (!document.referrer) return null;
  try {
    const ref = new URL(document.referrer);
    if (ref.host === location.host) return null;
    return `${ref.origin}${ref.pathname}`;
  } catch {
    return null;
  }
}

function anonymousId(): string | undefined {
  if (!hasAnalyticsConsent()) return undefined;
  let id = readStorage(ANON_KEY);
  if (!id) {
    id = newId();
    writeStorage(ANON_KEY, id);
  }
  return id;
}

// Sessão = 30 min sem atividade. Devolve isNew pra disparar session_started na primeira vez.
function touchSession(): { id: string; isNew: boolean } | undefined {
  if (!hasAnalyticsConsent()) return undefined;
  const now = Date.now();
  try {
    const stored = JSON.parse(readStorage(SESSION_KEY) ?? "null") as { id: string; last: number } | null;
    if (stored && now - stored.last < SESSION_TIMEOUT_MS) {
      writeStorage(SESSION_KEY, JSON.stringify({ id: stored.id, last: now }));
      return { id: stored.id, isNew: false };
    }
  } catch {
    // sessão corrompida: começa outra
  }
  const id = newId();
  writeStorage(SESSION_KEY, JSON.stringify({ id, last: now }));
  return { id, isNew: true };
}

function attributionFor(sessionId: string, isNew: boolean): Attribution {
  if (!isNew) {
    try {
      const stored = JSON.parse(readStorage(ATTRIBUTION_KEY) ?? "null") as Attribution | null;
      if (stored?.sessionId === sessionId) return stored;
    } catch {
      // cai pra uma atribuição nova
    }
  }
  const attribution: Attribution = {
    sessionId,
    utm: parseUtm(location.search),
    referrer: externalReferrer(),
    landingPath: location.pathname,
  };
  writeStorage(ATTRIBUTION_KEY, JSON.stringify(attribution));
  return attribution;
}

function buildContext(attribution: Attribution | null): TrackProps {
  const ua = navigator.userAgent;
  return {
    url: safeUrl(location.href),
    path: location.pathname,
    title: document.title.slice(0, 160),
    referrer: attribution?.referrer ?? null,
    utm: attribution?.utm ?? {},
    landing_path: attribution?.landingPath ?? null,
    device: deviceType(ua),
    browser: browserName(ua),
    screen: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
  };
}

function endpoint(): { url: string; key: string } | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !key) return null;
  return { url: `${base}/rest/v1/rpc/crm_track_web`, key };
}

export function flush() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  const target = endpoint();
  while (queue.length > 0) {
    const batch = queue.splice(0, MAX_BATCH);
    if (!target) continue;
    // keepalive: o lote sai mesmo se a pessoa estiver fechando a aba
    fetch(target.url, {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        apikey: target.key,
        Authorization: `Bearer ${target.key}`,
      },
      body: JSON.stringify({ p_events: batch }),
    }).catch(() => {
      // tracking nunca pode quebrar a navegação
    });
  }
}

function ensureInitialized() {
  if (initialized) return;
  initialized = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("pagehide", flush);
}

// Sem consentimento de análise (recusou, retirou, ou a escolha antiga expirou com a troca de
// versão do texto) não pode sobrar identificador guardado no navegador.
if (typeof window !== "undefined") {
  useConsentStore.subscribe((state) => {
    if (state.loaded && !state.choice?.analytics) {
      writeStorage(ANON_KEY, null);
      writeStorage(SESSION_KEY, null);
      writeStorage(ATTRIBUTION_KEY, null);
    }
  });
}

function enqueue(event: Omit<QueuedEvent, "occurred_at" | "idempotency_key">) {
  queue.push({ ...event, occurred_at: new Date().toISOString(), idempotency_key: newId() });
  if (queue.length >= 20) flush();
  else if (!timer) timer = setTimeout(flush, FLUSH_DELAY_MS);
}

export function track(name: string, properties: TrackProps = {}, identity: TrackIdentity = {}) {
  if (typeof window === "undefined") return;
  const consented = hasAnalyticsConsent();
  if (!consented && !ESSENTIAL_EVENTS.has(name)) return;
  ensureInitialized();

  // Chegou por um link de campanha diferente do que abriu a sessão atual: sessão nova (mesma
  // regra do GA4), senão a campanha some da atribuição.
  if (consented) {
    const incoming = parseUtm(location.search);
    if (Object.keys(incoming).length > 0) {
      try {
        const current = JSON.parse(readStorage(ATTRIBUTION_KEY) ?? "null") as Attribution | null;
        if (JSON.stringify(current?.utm ?? {}) !== JSON.stringify(incoming)) writeStorage(SESSION_KEY, null);
      } catch {
        writeStorage(SESSION_KEY, null);
      }
    }
  }
  const session = touchSession();
  const anonymous_id = anonymousId();
  const attribution = session ? attributionFor(session.id, session.isNew) : null;
  const context = consented ? buildContext(attribution) : { path: location.pathname };
  const base = { anonymous_id, session_id: session?.id, context };

  if (session?.isNew && attribution) {
    enqueue({ ...base, name: "session_started", properties: { landing_path: attribution.landingPath } });
    if (Object.keys(attribution.utm).length > 0) {
      enqueue({ ...base, name: "campaign_clicked", properties: { ...attribution.utm } });
    }
  }
  // Primeira página vista da sessão (mesmo que o primeiro evento tenha sido outro, ex.: o aceite
  // do banner de cookies).
  if (name === "page_view" && attribution && !attribution.landingTracked) {
    attribution.landingTracked = true;
    writeStorage(ATTRIBUTION_KEY, JSON.stringify(attribution));
    enqueue({ ...base, name: "landing_page_viewed", properties: { path: location.pathname } });
  }

  enqueue({
    ...base,
    name,
    properties,
    email: identity.email?.trim() || undefined,
    phone: identity.phone?.trim() || undefined,
    person_name: identity.personName?.trim() || undefined,
  });
}

// Pra repassar às Edge Functions do checkout: liga pedido e pagamento à navegação anterior.
export function getTrackingIds(): { anonymousId?: string; sessionId?: string } {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return {};
  return { anonymousId: anonymousId(), sessionId: touchSession()?.id };
}
