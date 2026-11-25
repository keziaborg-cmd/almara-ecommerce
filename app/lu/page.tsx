import type { Metadata } from "next";
import { Suspense } from "react";
import { Fredoka, Nunito } from "next/font/google";
import { LuFlow } from "@/components/lu/lu-flow";

// Destino da série "Salve a Lu" no Instagram: leva a pessoa a baixar o Almara+ (7 dias grátis).
// Fora do menu e do sitemap, e sem indexação (página de campanha).
const fredoka = Fredoka({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-fredoka", display: "swap" });
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-nunito", display: "swap" });

export const metadata: Metadata = {
  title: "Salve a Lu — qual é a sua jornada? | Almara+",
  description: "A Lu achou a jornada dela. Descubra a sua e comece 7 dias grátis no Almara+.",
  alternates: { canonical: "/lu" },
  robots: { index: false, follow: false },
};

export default function LuPage() {
  return (
    <main className={`${fredoka.variable} ${nunito.variable} font-body-mais bg-bg-mais`}>
      <Suspense fallback={<div className="min-h-[calc(100svh-90px)]" />}>
        <LuFlow />
      </Suspense>
    </main>
  );
}
