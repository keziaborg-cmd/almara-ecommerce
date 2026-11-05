"use client";

import Link from "next/link";
import { kits } from "@/data/kits";
import { formatCentsBRL } from "@/lib/cart/cart-store";
import { KitCans, kitTeaNames } from "./kit-cans";
import { KitBuyButton } from "./kit-buy";
import { useKitsOnSale } from "./use-kits-on-sale";

/** Kits da Black Friday na lista de produtos, só de 27/11 a 30/11. */
export function KitsShelf() {
  const onSale = useKitsOnSale();
  if (!onSale) return null;
  return (
    <section id="kits" className="mb-14 scroll-mt-28">
      <div className="mb-6 text-center">
        <p className="eyebrow text-eyebrow-claro">Black Friday · até 30/11</p>
        <h2 className="mt-2 font-display text-[clamp(32px,5vw,56px)] text-verde-escuro">Kits de ritual</h2>
        <p className="mt-2 text-sm text-tinta/70">Enquanto durar o estoque.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {kits.map((kit) => (
          <div key={kit.slug} className="flex flex-col rounded-card-produto border border-borda-clara bg-white p-6 text-center">
            <Link href={`/kits/${kit.slug}`} className="block flex-1">
              <KitCans kit={kit} size={110} />
              <h3 className="mt-4 font-display text-2xl text-verde-escuro">{kit.name}</h3>
              <p className="mt-1 text-sm text-tinta/70">{kitTeaNames(kit).join(" · ")}</p>
              <p className="mt-3">
                <s className="mr-2 text-sm text-tinta/50">{formatCentsBRL(kit.compareAtCents)}</s>
                <span className="font-display text-2xl text-verde-escuro">{formatCentsBRL(kit.priceCents)}</span>
              </p>
            </Link>
            <KitBuyButton
              kit={kit}
              className="mx-auto mt-4 w-fit rounded-pill bg-verde-escuro px-6 py-3 text-sm font-semibold text-creme"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
