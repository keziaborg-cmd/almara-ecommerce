"use client";

import type { Kit } from "@/data/kits";
import { useCartStore } from "@/lib/cart/cart-store";
import { useUIStore } from "@/lib/ui/ui-store";
import { trackAddToCart } from "@/lib/tracking/events";
import { useKitsOnSale, useKitStock } from "./use-kits-on-sale";

/** Botão de comprar o kit: some fora do período e vira "Esgotado" quando acaba. */
export function KitBuyButton({ kit, className }: { kit: Kit; className?: string }) {
  const add = useCartStore((s) => s.add);
  const showToast = useUIStore((s) => s.showToast);
  const onSale = useKitsOnSale();
  const stock = useKitStock(onSale);
  const remaining = stock?.get(kit.slug);
  const soldOut = remaining === 0;
  const base = className ?? "rounded-pill bg-creme px-8 py-3.5 text-sm font-semibold text-verde-escuro";

  if (!onSale) return null;
  if (soldOut) {
    return (
      <span className={`${base} cursor-not-allowed opacity-60`} aria-disabled="true">
        Esgotado
      </span>
    );
  }
  return (
    <button
      onClick={() => {
        add(kit.slug, 1);
        showToast(`${kit.name} adicionado ao carrinho`);
        trackAddToCart({ slug: kit.slug, name: kit.name, priceCents: kit.priceCents, qty: 1 });
      }}
      className={base}
    >
      Adicionar ao carrinho
    </button>
  );
}
