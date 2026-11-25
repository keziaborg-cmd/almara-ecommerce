"use client";

import Link from "next/link";
import { useState } from "react";
import type { CampaignSource } from "@/lib/app-links";
import { LU_WAITLIST_SOURCE, LU_WAITLIST_TEXT_VERSION, type LuJourneySlug } from "@/data/lu";
import { trackLu } from "@/lib/lu/track";

/** "Em breve na App Store" + e-mail pra avisar (enquanto o app está em análise na Apple). */
export function LuWaitlist({ campaign, journey }: { campaign: CampaignSource; journey: LuJourneySlug | null }) {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      setMessage("Marque a caixa para a gente poder te avisar.");
      return;
    }
    setState("sending");
    setMessage(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/app-waitlist-subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "" },
        body: JSON.stringify({
          email,
          platform: "ios",
          source: LU_WAITLIST_SOURCE,
          utmSource: campaign.utmSource,
          utmMedium: campaign.utmMedium,
          journey,
          textVersion: LU_WAITLIST_TEXT_VERSION,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setState("error");
        setMessage(data?.message ?? "Não deu certo agora. Tente de novo em instantes.");
        return;
      }
      setState("done");
      trackLu("lu_waitlist_submitted", campaign, { journey, store: "app_store" });
    } catch {
      setState("error");
      setMessage("Falha de conexão. Tente de novo.");
    }
  }

  return (
    <div className="rounded-3xl border-2 border-tinta-mais/10 bg-white p-5 text-left">
      <p className="font-display-mais text-lg font-semibold text-tinta-mais">Em breve na App Store</p>
      {state === "done" ? (
        <p role="status" className="mt-2 font-body-mais text-sm leading-relaxed text-tinta-mais/80">
          Pronto! Mandamos um e-mail pra você confirmar. Quando o Almara+ chegar no iPhone, a gente avisa.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-3 space-y-3">
          <label className="block font-body-mais text-sm text-tinta-mais/80">
            Deixe seu e-mail e a gente avisa quando chegar no iPhone.
            <input
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="mt-2 w-full rounded-xl border-2 border-tinta-mais/15 bg-bg-mais px-4 py-3 font-body-mais text-base text-tinta-mais outline-none focus:border-folha-viva"
            />
          </label>
          <label className="flex items-start gap-2.5 font-body-mais text-xs leading-snug text-tinta-mais/75">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#477023]" />
            <span>
              Quero receber um e-mail da Almara avisando quando o Almara+ chegar na App Store. É um aviso só, sem newsletter. Li a{" "}
              <Link href="/politica-de-privacidade" target="_blank" className="underline underline-offset-2">
                Política de Privacidade
              </Link>
              .
            </span>
          </label>
          {message && (
            <p role="alert" className="font-body-mais text-sm text-jornada-pausa-escura">
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={state === "sending"}
            className="btn-3d w-full rounded-full bg-folha-viva px-6 py-3 font-display-mais text-base font-semibold text-white disabled:opacity-60"
          >
            {state === "sending" ? "Enviando…" : "Me avise"}
          </button>
        </form>
      )}
    </div>
  );
}
