import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { teas } from "@/data/teas";
import { BENEFIT_CARDS } from "@/data/benefits";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { ProductCard } from "@/components/product/product-card";
import { BenefitCard } from "@/components/ui/benefit-card";

const CHIPS = ["Antioxidantes", "L-teanina", "Vitamina C", "Zinco"];

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <main className="animate-pagein overflow-x-hidden">
      <h1 className="sr-only">Almara — chás 100% naturais em lata e o app Almara+</h1>
      <div className="px-[6vw] pt-11 pb-[60px]">
        <div className="mx-auto max-w-container">
          <HeroCarousel />
        </div>
      </div>

      {/* SOBRE RESUMIDA — banda sage, cheia até a borda, com divisor orgânico e a lata de Cidreira cruzando a divisa */}
      <div className="relative mt-[22px] bg-sage">
        <svg
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          aria-hidden
          className="pointer-events-none absolute -top-[88px] left-0 block h-[90px] w-full"
        >
          <path d="M0,90 L0,46 C430,-12 1010,104 1440,34 L1440,90 Z" fill="#e1ead4" />
        </svg>
        <Image
          src="/tea/cidreira.png"
          alt=""
          aria-hidden
          width={210}
          height={210}
          className="animate-floaty pointer-events-none absolute -top-[158px] right-0 z-[4] h-[210px] w-auto drop-shadow-[0_26px_32px_rgba(0,0,0,.3)] md:right-[7vw]"
        />

        <section className="mx-auto grid max-w-[1240px] gap-16 px-[6vw] pt-5 pb-[60px] md:grid-cols-[1fr_1.05fr] md:items-center xl:max-w-[1400px] 2xl:max-w-[1600px]">
          <div>
            <p className="eyebrow text-eyebrow-claro">Sobre</p>
            <h2 className="mt-3 font-display text-[clamp(42px,6vw,68px)] text-verde-escuro">Um ritual em cada lata</h2>
            <p className="mt-4 max-w-md text-tinta/80">
              Chás 100% naturais, sem açúcar, feitos para acompanhar cada momento do seu dia — e o
              Almara+, o app que transforma o ritual em rotina, no seu tempo, do seu jeito.
            </p>
            <Link href="/sobre" className="mt-5 inline-block font-semibold text-verde-folha hover:underline">
              Conheça nossa história →
            </Link>
          </div>
          <div>
            <div className="flex flex-wrap gap-2">
              {CHIPS.map((chip) => (
                <span key={chip} className="rounded-pill border border-borda-clara bg-white/60 px-4 py-1.5 text-sm text-tinta">
                  {chip}
                </span>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {BENEFIT_CARDS.map((card) => (
                <BenefitCard key={card.title} card={card} className="p-5" />
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* PRODUTOS EM DESTAQUE — banda creme, cheia até a borda, com divisor orgânico */}
      <div className="relative bg-creme">
        <svg
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          aria-hidden
          className="pointer-events-none absolute -top-[88px] left-0 block h-[90px] w-full"
        >
          <path d="M0,90 L0,40 C500,108 980,-16 1440,52 L1440,90 Z" fill="#fffdf8" />
        </svg>

        <section className="mx-auto max-w-[1320px] px-[6vw] pt-[52px] pb-5 xl:max-w-[1480px] 2xl:max-w-[1680px]">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-eyebrow-claro">Em destaque</p>
              <h2 className="mt-2 font-display text-[clamp(40px,6vw,68px)] text-verde-escuro">Escolha o seu ritual</h2>
            </div>
            <Link href="/produtos" className="font-semibold text-verde-folha hover:underline">
              Ver todos os chás →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teas.slice(0, 3).map((tea) => (
              <ProductCard key={tea.slug} tea={tea} />
            ))}
          </div>
        </section>
      </div>

      <section className="mx-auto mt-14 mb-8 max-w-[1320px] px-[6vw] pb-5 xl:max-w-[1480px] 2xl:max-w-[1680px]">
        <div className="rounded-panel bg-verde-escuro px-8 py-16 text-center">
          <h2 className="font-display text-4xl text-creme">Qual ritual combina com você?</h2>
          <Link
            href="/quiz"
            className="mt-6 inline-block rounded-pill bg-creme px-8 py-3.5 text-sm font-semibold text-verde-escuro"
          >
            Fazer o quiz
          </Link>
        </div>
      </section>
    </main>
  );
}
