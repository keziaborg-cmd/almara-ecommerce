"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  APP_STORE_LIVE,
  appStoreLink,
  campaignFromSearch,
  platformFromUserAgent,
  playStoreLink,
  type AppPlatform,
} from "@/lib/app-links";
import {
  LU_DEFAULT_SOURCE,
  LU_IMAGE,
  LU_JOURNEY_INCLUDES,
  LU_OPENING_TITLE,
  LU_PAIN_QUESTION,
  LU_PRICE_NOTE,
  LU_QR_GOOGLE_PLAY,
  luJourneys,
  type LuJourney,
} from "@/data/lu";
import { trackLu } from "@/lib/lu/track";
import { LuWaitlist } from "./lu-waitlist";

const STEPS = 4;

export function LuFlow() {
  const search = useSearchParams();
  // origem lida uma vez e guardada durante o fluxo (repassada às lojas e aos eventos)
  const [campaign] = useState(() => campaignFromSearch(new URLSearchParams(search.toString()), LU_DEFAULT_SOURCE));
  const [step, setStep] = useState(0);
  const [journey, setJourney] = useState<LuJourney | null>(null);
  const [platform, setPlatform] = useState<AppPlatform | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- aparelho só existe no navegador
    setPlatform(platformFromUserAgent(navigator.userAgent));
    trackLu("lu_page_viewed", campaign);
  }, [campaign]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [step]);

  function chooseJourney(j: LuJourney) {
    setJourney(j);
    trackLu("lu_journey_selected", campaign, { journey: j.slug });
    setStep(2);
  }

  function answer(index: number) {
    if (!journey) return;
    trackLu("lu_question_answered", campaign, { journey: journey.slug, answer: index });
    setStep(3);
  }

  return (
    <div className="mx-auto flex min-h-[calc(100svh-90px)] w-full max-w-md flex-col px-5 pb-10 pt-4 md:max-w-3xl">
      <Progress step={step} onBack={step > 0 ? () => setStep(step === 3 ? 2 : step - 1) : null} />

      {step === 0 && (
        <section className="flex flex-1 flex-col items-center text-center">
          <LuImage className="mt-4 w-full max-w-[min(360px,calc(50svh*0.8))]" aspect="aspect-[4/5]" />
          <h1 className="mt-6 font-display-mais text-[clamp(28px,7vw,40px)] font-semibold leading-tight text-tinta-mais">{LU_OPENING_TITLE}</h1>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="btn-3d mt-7 w-full max-w-[360px] rounded-full bg-folha-viva px-8 py-4 font-display-mais text-lg font-semibold text-white"
          >
            Descobrir minha jornada
          </button>
        </section>
      )}

      {step === 1 && (
        <section className="flex flex-1 flex-col">
          <h2 className="mt-6 font-display-mais text-[clamp(26px,6.5vw,36px)] font-semibold leading-tight text-tinta-mais">{LU_PAIN_QUESTION}</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {luJourneys.map((j) => (
              <button
                key={j.slug}
                type="button"
                onClick={() => chooseJourney(j)}
                className="rounded-2xl border-2 bg-white px-5 py-4 text-left font-body-mais text-base font-bold text-tinta-mais transition hover:-translate-y-0.5"
                style={{ borderColor: j.colorLight, boxShadow: `0 4px 0 0 ${j.colorLight}` }}
              >
                <span className="block text-xs font-extrabold uppercase tracking-wide" style={{ color: j.colorDark }}>
                  {j.name}
                </span>
                {j.pain}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 2 && journey && (
        <section className="flex flex-1 flex-col">
          <span className="mt-6 w-fit rounded-full px-3 py-1 font-body-mais text-xs font-extrabold uppercase tracking-wide text-white" style={{ background: journey.color }}>
            Jornada {journey.name}
          </span>
          <h2 className="mt-3 font-display-mais text-[clamp(26px,6.5vw,36px)] font-semibold leading-tight text-tinta-mais">{journey.question}</h2>
          <div className="mt-6 grid gap-3">
            {journey.options.map((opt, i) => (
              <button
                key={opt}
                type="button"
                onClick={() => answer(i)}
                className="rounded-2xl border-2 border-tinta-mais/10 bg-white px-5 py-4 text-left font-body-mais text-base font-semibold text-tinta-mais transition hover:-translate-y-0.5"
                style={{ boxShadow: `0 4px 0 0 ${journey.colorLight}` }}
              >
                {opt}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 3 && journey && (
        <section className="mt-4 grid flex-1 gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-start">
          <div>
            <LuImage className="w-full" aspect="aspect-[16/9] md:aspect-[4/5]" />
          </div>
          <div>
            <span className="w-fit rounded-full px-3 py-1 font-body-mais text-xs font-extrabold uppercase tracking-wide text-white" style={{ background: journey.color }}>
              Sua jornada
            </span>
            <h2 className="mt-3 font-display-mais text-[clamp(32px,8vw,44px)] font-semibold leading-none" style={{ color: journey.colorDark }}>
              {journey.name}
            </h2>
            <p className="mt-2 font-display-mais text-xl font-medium leading-snug text-tinta-mais">{journey.promise}</p>

            <ul className="mt-5 grid grid-cols-2 gap-2">
              {LU_JOURNEY_INCLUDES.map((item) => (
                <li key={item.title} className="rounded-2xl px-3.5 py-3" style={{ background: journey.colorLight }}>
                  <span className="block font-body-mais text-sm font-extrabold leading-tight text-tinta-mais">{item.title}</span>
                  <span className="mt-0.5 block font-body-mais text-xs leading-snug text-tinta-mais/75">{item.text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <StoreActions platform={platform} campaign={campaign} journey={journey} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Progress({ step, onBack }: { step: number; onBack: (() => void) | null }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onBack ?? undefined}
        aria-label="Voltar"
        className={`h-9 w-9 shrink-0 rounded-full font-display-mais text-lg text-tinta-mais/70 ${onBack ? "visible hover:bg-tinta-mais/5" : "invisible"}`}
      >
        ←
      </button>
      <div
        className="h-2.5 flex-1 overflow-hidden rounded-full bg-tinta-mais/10"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={STEPS}
        aria-valuenow={step + 1}
        aria-label={`Etapa ${step + 1} de ${STEPS}`}
      >
        <div className="h-full rounded-full bg-folha-viva transition-[width] duration-300" style={{ width: `${((step + 1) / STEPS) * 100}%` }} />
      </div>
      <span className="w-9 shrink-0 text-right font-body-mais text-xs font-bold text-tinta-mais/50">
        {step + 1}/{STEPS}
      </span>
    </div>
  );
}

function LuImage({ className, aspect }: { className: string; aspect: string }) {
  if (LU_IMAGE) {
    return (
      <div className={`relative overflow-hidden rounded-3xl ${aspect} ${className}`}>
        <Image src={LU_IMAGE} alt="A Lu no diorama da série Salve a Lu" fill sizes="(min-width: 768px) 360px, 100vw" className="object-cover object-top" priority />
      </div>
    );
  }
  return (
    <div
      className={`flex items-center justify-center rounded-3xl border-2 border-dashed border-folha-viva/40 bg-folha-viva-clara ${aspect} ${className}`}
      aria-label="Espaço da imagem da Lu"
    >
      <span className="px-6 text-center font-body-mais text-sm font-bold text-folha-viva-escura/70">
        Imagem da Lu no diorama
        <span className="block font-normal">1080 × 1350</span>
      </span>
    </div>
  );
}

function StoreActions({ platform, campaign, journey }: { platform: AppPlatform | null; campaign: ReturnType<typeof campaignFromSearch>; journey: LuJourney }) {
  const play = useMemo(() => playStoreLink(campaign), [campaign]);
  const appStore = useMemo(() => (APP_STORE_LIVE ? appStoreLink(campaign) : null), [campaign]);
  if (!platform) return <div className="h-14" />;

  const priceNote = <p className="mt-2 text-center font-body-mais text-xs text-tinta-mais/60">{LU_PRICE_NOTE}</p>;
  const cta = (href: string, store: "google_play" | "app_store") => (
    <a
      href={href}
      onClick={() => trackLu("lu_store_clicked", campaign, { journey: journey.slug, store })}
      className="btn-3d block w-full rounded-full bg-folha-viva px-6 py-4 text-center font-display-mais text-lg font-semibold text-white"
    >
      Começar meus 7 dias grátis
    </a>
  );

  if (platform === "android" && play) {
    return (
      <>
        {cta(play, "google_play")}
        {priceNote}
      </>
    );
  }
  if (platform === "ios") {
    return appStore ? (
      <>
        {cta(appStore, "app_store")}
        {priceNote}
      </>
    ) : (
      <LuWaitlist campaign={campaign} journey={journey.slug} />
    );
  }

  // computador: as duas lojas e o QR Code (aponta pra loja no celular)
  return (
    <div className="grid gap-4">
      <p className="font-display-mais text-lg font-semibold text-tinta-mais">Comece seus 7 dias grátis no celular</p>
      <div className="grid gap-4 rounded-3xl border-2 border-tinta-mais/10 bg-white p-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="mx-auto h-[132px] w-[132px] shrink-0">
          {LU_QR_GOOGLE_PLAY ? (
            // eslint-disable-next-line @next/next/no-img-element -- SVG estático pequeno
            <img src={LU_QR_GOOGLE_PLAY} alt="QR Code para baixar o Almara+ no Google Play" width={132} height={132} className="h-full w-full" />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-xl border-2 border-dashed border-tinta-mais/20 font-body-mais text-xs text-tinta-mais/50">
              QR Code
            </div>
          )}
        </div>
        <div>
          <p className="font-body-mais text-sm text-tinta-mais/80">Aponte a câmera do celular Android para o código, ou abra no Google Play:</p>
          {play && (
            <a
              href={play}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackLu("lu_store_clicked", campaign, { journey: journey.slug, store: "google_play" })}
              className="btn-3d mt-3 inline-block whitespace-nowrap rounded-full bg-folha-viva px-6 py-3 font-display-mais text-base font-semibold text-white"
            >
              Abrir no Google Play
            </a>
          )}
        </div>
      </div>
      {appStore ? (
        <a
          href={appStore}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackLu("lu_store_clicked", campaign, { journey: journey.slug, store: "app_store" })}
          className="btn-3d rounded-full bg-folha-viva px-6 py-3 text-center font-display-mais text-base font-semibold text-white"
        >
          Abrir na App Store
        </a>
      ) : (
        <LuWaitlist campaign={campaign} journey={journey.slug} />
      )}
      {priceNote}
    </div>
  );
}
