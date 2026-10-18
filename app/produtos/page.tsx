import type { Metadata } from "next";
import { teas } from "@/data/teas";
import { ProductCard } from "@/components/product/product-card";

export const metadata: Metadata = {
  alternates: { canonical: "/produtos" },
  title: "Nossos chás — Almara",
  description: "Os 6 blends de chá 100% natural da Almara. Escolha o seu ritual.",
};

export default function CatalogoPage() {
  return (
    <main className="animate-pagein px-[6vw] py-14">
      <div className="mx-auto max-w-[1320px] xl:max-w-[1480px] 2xl:max-w-[1680px]">
        <div className="mb-10 text-center">
          <p className="eyebrow text-eyebrow-claro">Nossos chás</p>
          <h1 className="mt-2 font-display text-[clamp(44px,7vw,84px)] text-verde-escuro">Escolha o seu ritual</h1>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teas.map((tea) => (
            <ProductCard key={tea.slug} tea={tea} />
          ))}
        </div>
      </div>
    </main>
  );
}
