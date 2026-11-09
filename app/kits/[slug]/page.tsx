import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getKitBySlug } from "@/data/kits";
import { teas } from "@/data/teas";
import { formatCentsBRL } from "@/lib/cart/cart-store";
import { kitsOnSaleNow } from "@/lib/cart/kits";
import { KitCans } from "@/components/blackfriday/kit-cans";
import { KitBuyButton } from "@/components/blackfriday/kit-buy";

// Kit só existe de 27/11 a 30/11 (horário de Brasília): a página é refeita a cada minuto e fica
// "não encontrada" fora do período. O servidor também recusa a compra fora dele.
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const kit = getKitBySlug(slug);
  if (!kit) return {};
  return {
    title: `${kit.name} — Black Friday Almara`,
    description: kit.about,
    alternates: { canonical: `/kits/${kit.slug}` },
    robots: { index: false, follow: true },
  };
}

export default async function KitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kit = getKitBySlug(slug);
  if (!kit || !kitsOnSaleNow()) notFound();

  const components = kit.components.map((s) => teas.find((t) => t.slug === s)).filter((t) => t !== undefined);

  return (
    <main className="animate-pagein px-[6vw] py-10">
      <div className="mx-auto max-w-[1240px] xl:max-w-[1400px] 2xl:max-w-[1600px]">
        <Link href="/produtos#kits" className="text-sm font-semibold text-verde-folha hover:underline">
          ← Voltar para produtos
        </Link>

        <div className="mt-6 grid gap-10 rounded-panel bg-verde-escuro px-8 py-14 md:grid-cols-2 md:px-16">
          <div className="flex items-center justify-center">
            <KitCans kit={kit} size={kit.components.length > 3 ? 150 : 190} />
          </div>
          <div className="flex flex-col justify-center text-creme">
            <span className="eyebrow w-fit rounded-pill border border-white/25 px-3 py-1 text-dourado">Black Friday · até 30/11</span>
            <h1 className="mt-4 font-display" style={{ fontSize: "clamp(46px,6vw,72px)" }}>
              {kit.name}
            </h1>
            <p className="mt-2 font-display text-[22px] italic">{kit.tagline}</p>
            <p className="mt-4 max-w-md text-base leading-[1.6] text-texto-sobre-escuro-2">{kit.about}</p>
            <div className="mt-6 flex items-baseline gap-3">
              <s className="text-lg text-texto-sobre-escuro-2">{formatCentsBRL(kit.compareAtCents)}</s>
              <span className="font-display text-[34px]">{formatCentsBRL(kit.priceCents)}</span>
            </div>
            <p className="mt-1 text-xs text-texto-sobre-escuro-2">
              Preço fixo do kit: não soma com o desconto por quantidade nem com cupom.
            </p>
            <KitBuyButton kit={kit} className="mt-5 w-fit rounded-pill bg-creme px-8 py-3.5 text-sm font-semibold text-verde-escuro" />
            <p className="mt-3 text-sm font-semibold text-dourado">Enquanto durar o estoque.</p>
          </div>
        </div>

        <section className="mt-10 rounded-card-conteudo border border-borda-clara bg-white p-7">
          <h2 className="font-display text-2xl text-verde-escuro">Vem no kit</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {components.map((tea) => (
              <li key={tea.slug}>
                <Link href={`/produtos/${tea.slug}`} className="font-medium text-verde-folha hover:underline">
                  1 lata de {tea.name}
                </Link>
                <span className="block text-sm text-tinta/70">{tea.tag}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
