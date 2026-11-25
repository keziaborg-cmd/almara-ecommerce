"use client";

import { track } from "@/lib/crm/tracker";
import type { CampaignSource } from "@/lib/app-links";
import type { LuJourneySlug } from "@/data/lu";

// Eventos da página /lu, em três lugares:
// 1. GA4 (só com "análise" aceito no banner de cookies);
// 2. rastreador do CRM (mesma regra de consentimento; nomes no catálogo do painel, db/035);
// 3. contagem anônima por dia (public.lu_count): só o número, sem cookie nem identificador —
//    pra saber quantas pessoas a série trouxe mesmo entre quem recusa os cookies.
export type LuEvent = "lu_page_viewed" | "lu_journey_selected" | "lu_question_answered" | "lu_store_clicked" | "lu_waitlist_submitted";

export interface LuEventProps {
  journey?: LuJourneySlug | null;
  store?: "google_play" | "app_store" | null;
  /** Índice da opção escolhida na pergunta (0 a 3). */
  answer?: number | null;
}

export function trackLu(event: LuEvent, campaign: CampaignSource, props: LuEventProps = {}): void {
  if (typeof window === "undefined") return;
  const params = {
    journey: props.journey ?? undefined,
    store: props.store ?? undefined,
    answer: props.answer ?? undefined,
    utm_source: campaign.utmSource,
    utm_medium: campaign.utmMedium ?? undefined,
  };
  window.gtag?.("event", event, params);
  track(event, params);
  countAnonymously(event, campaign, props);
}

function countAnonymously(event: LuEvent, campaign: CampaignSource, props: LuEventProps): void {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !key) return;
  fetch(`${base}/rest/v1/rpc/lu_count`, {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      p_event: event,
      p_journey: props.journey ?? null,
      p_store: props.store ?? null,
      p_utm_source: campaign.utmSource,
      p_utm_medium: campaign.utmMedium,
    }),
  }).catch(() => {
    // contagem nunca pode atrapalhar a página
  });
}
