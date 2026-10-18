import type { Metadata } from "next";
import Link from "next/link";
import { Fredoka, Nunito } from "next/font/google";
import { HeroSection } from "@/components/almara-mais/hero-section";
import { TrailSection } from "@/components/almara-mais/trail-section";
import { JourneysSection } from "@/components/almara-mais/journeys-section";
import { ToolsSection } from "@/components/almara-mais/tools-section";
import { FeaturesSection } from "@/components/almara-mais/features-section";
import { PillButton3D } from "@/components/almara-mais/pill-button-3d";

// Fontes só desta página (redesign gamificado inspirado no Duolingo,
// 2026-08-16) — carregadas aqui via next/font e escopadas por um wrapper
// com a className da fonte, sem tocar na tipografia do resto do site
// (Carena/Montserrat continuam em app/layout.tsx).
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  alternates: { canonical: "/almara-mais" },
  title: "Almara+ — o app que continua sua jornada",
  description:
    "Conheça o Almara+: a Mara, as jornadas guiadas de 21 dias e como o Almara+ transforma o ritual do chá em hábito.",
};

export default function AlmaraMaisPage() {
  return (
    <main
      className={`${fredoka.variable} ${nunito.variable} font-body-mais animate-pagein bg-bg-mais px-[6vw] py-10 sm:px-[4vw]`}
    >
      <div className="mx-auto max-w-[1160px] xl:max-w-[1320px] 2xl:max-w-[1500px]">
        <HeroSection />
      </div>

      <TrailSection />
      <JourneysSection />
      <ToolsSection />
      <FeaturesSection />

      <section id="comecar" className="mx-auto mt-20 max-w-[1000px] px-[6vw] xl:max-w-[1140px] 2xl:max-w-[1300px]">
        <div className="rounded-panel bg-folha-viva px-8 py-16 text-center">
          <h2 className="font-display-mais text-3xl font-bold text-white sm:text-4xl">
            Pronto pra começar sua jornada?
          </h2>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PillButton3D href="/quiz" variant="white">
              Ainda não sei qual chá é o meu
            </PillButton3D>
            <PillButton3D href="/produtos" variant="outline-white">
              Ver todos os chás
            </PillButton3D>
          </div>
          <Link href="/" className="mt-6 inline-block font-body-mais text-sm font-bold text-white/80 hover:text-white hover:underline">
            Voltar pra loja
          </Link>
        </div>
      </section>
    </main>
  );
}
