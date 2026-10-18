import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { breadcrumbJsonLd, JsonLd, productJsonLd } from "@/lib/seo/json-ld";
import { notFound } from "next/navigation";
import { teas, getTeaBySlug, getOtherTeas, TEA_SLUGS } from "@/data/teas";
import { pdpData } from "@/data/pdp-data";
import { journeyLabel } from "@/data/journeys";
import { ProductCard } from "@/components/product/product-card";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { FaqAccordion } from "@/components/product/faq-accordion";
import { ViewItemTracker } from "@/components/product/view-item-tracker";
import { SectionViewTracker } from "@/components/crm/section-view-tracker";
import { AppBadge } from "@/components/ui/app-badge";
import { formatCentsBRL } from "@/lib/cart/cart-store";

export function generateStaticParams() {
  return TEA_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tea = getTeaBySlug(slug);
  if (!tea) return {};
  return {
    title: `${tea.name} — Almara`,
    description: tea.about,
    alternates: { canonical: `/produtos/${tea.slug}` },
  };
}

export default async function ProdutoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tea = getTeaBySlug(slug);
  if (!tea) notFound();

  const pdp = pdpData[tea.slug];
  const others = getOtherTeas(tea.slug);

  const currentIndex = teas.findIndex((t) => t.slug === tea.slug);
  const prevTea = teas[(currentIndex - 1 + teas.length) % teas.length];
  const nextTea = teas[(currentIndex + 1) % teas.length];

  return (
    <main className="animate-pagein px-[6vw] py-10">
      <JsonLd
        data={[
          productJsonLd(tea),
          breadcrumbJsonLd([
            { name: "Início", path: "/" },
            { name: "Nossos chás", path: "/produtos" },
            { name: tea.name, path: `/produtos/${tea.slug}` },
          ]),
        ]}
      />
      <ViewItemTracker slug={tea.slug} name={tea.name} priceCents={tea.priceCents} />
      <div className="mx-auto max-w-[1240px] xl:max-w-[1400px] 2xl:max-w-[1600px]">
        <Link href="/produtos" className="text-sm font-semibold text-verde-folha hover:underline">
          ← Voltar para produtos
        </Link>

        <div
          className="mt-6 grid gap-10 rounded-panel px-8 py-14 md:grid-cols-2 md:px-16"
          style={{ background: tea.heroBg }}
        >
          <div className="relative flex items-center justify-center">
            <div className="relative w-fit">
              <div
                className="pointer-events-none absolute -inset-[70px] rounded-full blur-[6px]"
                style={{ background: `radial-gradient(circle, ${tea.glow} 0%, rgba(120,190,90,0) 65%)` }}
              />
              <Image src={tea.img} alt={tea.name} width={300} height={300} className="animate-floaty relative h-[300px] w-auto drop-shadow-lata" priority />
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <span className="eyebrow w-fit rounded-pill border border-white/25 px-3 py-1" style={{ color: tea.heroSub }}>
              {tea.chip}
            </span>
            <h1 className="mt-4 font-display" style={{ color: tea.heroWord, fontSize: "clamp(46px,6vw,72px)" }}>
              {tea.name}
            </h1>
            <p className="mt-2 font-display text-[22px] italic" style={{ color: tea.heroWord }}>
              {tea.tag}
            </p>
            <p className="mt-4 max-w-md text-base leading-[1.6]" style={{ color: tea.heroSub }}>
              {tea.about}
            </p>
            <div className="mt-6 flex items-center gap-4">
              <span className="font-display text-[34px] text-creme">{tea.price}</span>
              <span className="rounded-pill border border-white/30 px-3 py-1 text-sm text-creme">{tea.weight}</span>
            </div>

            <div className="mt-4 flex gap-6 rounded-input border border-white/15 bg-black/10 px-4 py-3">
              {[
                { label: "1 unidade", cents: tea.priceCents },
                { label: "2 unidades", cents: tea.priceTier2Cents },
                { label: "3+ unidades", cents: tea.priceTier3Cents },
              ].map((row) => (
                <div key={row.label}>
                  <span className="block font-display text-lg text-creme">{formatCentsBRL(row.cents)}</span>
                  <span className="text-xs" style={{ color: tea.heroSub }}>
                    {row.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs" style={{ color: tea.heroSub }}>
              Desconto vale pra combinação de qualquer chá Almara no carrinho — não precisa ser só este.
            </p>

            <AddToCartButton tea={tea} className="mt-5 w-fit rounded-pill bg-creme px-8 py-3.5 text-sm font-semibold text-verde-escuro" />
            <p className="mt-5 text-xs" style={{ color: tea.heroSub }}>
              <span className="mr-2 rounded border border-white/30 px-1.5 py-0.5 font-bold">APP</span>
              Combina com a jornada de {pdp.jornadas.map(journeyLabel).join(" e ")} no Almara+
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-card-conteudo border border-borda-clara bg-white p-7">
            <h2 className="font-display text-[26px] text-verde-escuro">Modo de preparo</h2>
            <p className="mt-3 text-sm leading-relaxed text-tinta/80">{tea.prep}</p>
          </div>
          <div className="rounded-card-conteudo border border-borda-clara bg-white p-7">
            <h2 className="font-display text-[26px] text-verde-escuro">Benefícios</h2>
            <SectionViewTracker event="benefits_viewed" properties={{ product_id: tea.slug }} />
            <ul className="mt-3 flex flex-col gap-2">
              {tea.benefits.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-tinta/80">
                  <span className="text-verde-folha">✓</span> {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* O momento / O ritual */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-card-conteudo border border-borda-clara bg-white p-7">
            <p className="eyebrow text-eyebrow-claro">O momento</p>
            {/* whitespace-pre-line: `problema`/`solucao`/`como` podem vir com
                quebras de parágrafo (\n\n) na copy — ver data/pdp-data.ts.
                Textos de uma linha só seguem renderizando igual. */}
            <p className="mt-3 whitespace-pre-line font-display text-[23px] leading-snug text-tinta">{pdp.problema}</p>
          </div>
          <div className="rounded-card-conteudo p-7" style={{ background: tea.cardBg }}>
            <p className="eyebrow" style={{ color: tea.priceColor }}>
              O ritual
            </p>
            <p className="mt-3 whitespace-pre-line font-display text-[23px] leading-snug text-tinta">{pdp.solucao}</p>
          </div>
        </div>

        {/* O que ele traz */}
        <div className="mt-6 rounded-card-conteudo border border-borda-clara bg-white p-7">
          <p className="eyebrow text-eyebrow-claro">O que ele traz</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {pdp.beneficios.map((b) => (
              <span key={b} className="flex items-center gap-2 rounded-pill border border-borda-clara px-4 py-1.5 text-sm font-bold text-tinta">
                <span className="h-2 w-2 rounded-full" style={{ background: tea.priceColor }} />
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Como funciona */}
        <div className="mt-6 rounded-card-conteudo border border-borda-clara bg-white p-7">
          <p className="eyebrow text-eyebrow-claro">Como funciona</p>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-tinta/80">{pdp.como}</p>
        </div>

        {/* Diferencial */}
        <div className="mt-6 flex flex-col items-start gap-5 rounded-panel bg-verde-escuro p-8 sm:flex-row sm:items-center sm:gap-[26px]">
          <AppBadge size={76} />
          <div className="min-w-0">
            <p className="eyebrow text-dourado">
              No Almara+ · jornada{pdp.jornadas.length > 1 ? "s" : ""} {pdp.jornadas.map(journeyLabel).join(" · ")}
            </p>
            <p className="mt-2 font-display text-2xl leading-snug text-creme">{pdp.diferencial}</p>
          </div>
        </div>

        {/* Gatilhos honestos */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pdp.gatilhos.map((g) => (
            <div key={g.k} className="rounded-card-conteudo border border-[#e6dfc9] bg-gatilho-bg p-6">
              <p className="eyebrow text-eyebrow-claro">{g.k}</p>
              <p className="mt-2 text-sm text-tinta/80">{g.t}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-6">
          <h2 className="mb-4 font-display text-3xl text-verde-escuro">Perguntas frequentes</h2>
          <SectionViewTracker event="faq_viewed" properties={{ product_id: tea.slug }} />
          <FaqAccordion items={pdp.faq} accentColor={tea.priceColor} />
        </div>

        {/* Outros rituais */}
        <div className="mt-14">
          <h2 className="mb-6 font-display text-3xl text-verde-escuro">Outros rituais</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((t) => (
              <ProductCard key={t.slug} tea={t} />
            ))}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between gap-4 border-t border-borda-clara pt-6">
          <Link href={`/produtos/${prevTea.slug}`} className="group flex flex-col items-start">
            <span className="eyebrow text-xs text-verde-folha">← Anterior</span>
            <span className="mt-1 font-display text-xl text-verde-escuro group-hover:underline">{prevTea.name}</span>
          </Link>
          <Link href={`/produtos/${nextTea.slug}`} className="group flex flex-col items-end text-right">
            <span className="eyebrow text-xs text-verde-folha">Próximo →</span>
            <span className="mt-1 font-display text-xl text-verde-escuro group-hover:underline">{nextTea.name}</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
