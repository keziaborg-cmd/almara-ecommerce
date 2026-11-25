import { create } from "zustand";
import { persist } from "zustand/middleware";
import { teas, type TeaSlug } from "@/data/teas";
import { tierForCartUnits, unitPriceForTier, type PriceTier } from "@/lib/pricing/tiers";
import { track } from "@/lib/crm/tracker";
import { STORAGE_KEYS } from "@/lib/storage-keys";

export interface CartLine {
  slug: TeaSlug;
  name: string;
  qty: number;
  unitPriceCents: number;
  subtotalCents: number;
}

interface CartState {
  items: Partial<Record<TeaSlug, number>>;
  add: (slug: TeaSlug, qty?: number) => void;
  setQty: (slug: TeaSlug, qty: number) => void;
  remove: (slug: TeaSlug) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},
      add: (slug, qty = 1) => {
        const wasEmpty = selectCartUnits(get().items) === 0;
        set((state) => ({
          items: {
            ...state.items,
            [slug]: (state.items[slug] ?? 0) + qty,
          },
        }));
        const items = get().items;
        if (wasEmpty) track("cart_created", { product_id: slug, cart: cartSnapshot(items) });
        track("product_added_to_cart", { ...productProps(slug, items), quantity: qty, cart: cartSnapshot(items) });
      },
      setQty: (slug, qty) => {
        const previous = get().items[slug] ?? 0;
        set((state) => {
          if (qty <= 0) {
            const rest = { ...state.items };
            delete rest[slug];
            return { items: rest };
          }
          return { items: { ...state.items, [slug]: qty } };
        });
        const items = get().items;
        if (qty <= 0) {
          track("product_removed_from_cart", { ...productProps(slug, items), quantity: previous, cart: cartSnapshot(items) });
        } else if (qty !== previous) {
          track("cart_updated", { ...productProps(slug, items), quantity: qty, previous_quantity: previous, cart: cartSnapshot(items) });
        }
      },
      remove: (slug) => {
        const previous = get().items[slug] ?? 0;
        set((state) => {
          const rest = { ...state.items };
          delete rest[slug];
          return { items: rest };
        });
        const items = get().items;
        track("product_removed_from_cart", { ...productProps(slug, items), quantity: previous, cart: cartSnapshot(items) });
      },
      clear: () => set({ items: {} }),
    }),
    { name: STORAGE_KEYS.cart, skipHydration: true },
  ),
);

export function selectCartUnits(items: Partial<Record<TeaSlug, number>>): number {
  return Object.values(items).reduce((sum: number, qty) => sum + (qty ?? 0), 0);
}

export function selectCartTier(items: Partial<Record<TeaSlug, number>>): PriceTier {
  return tierForCartUnits(selectCartUnits(items));
}

export function selectCartLines(items: Partial<Record<TeaSlug, number>>): CartLine[] {
  const tier = selectCartTier(items);
  return teas
    .filter((tea) => (items[tea.slug] ?? 0) > 0)
    .map((tea) => {
      const qty = items[tea.slug]!;
      const unitPriceCents = unitPriceForTier(tier, tea);
      return {
        slug: tea.slug,
        name: tea.name,
        qty,
        unitPriceCents,
        subtotalCents: unitPriceCents * qty,
      };
    });
}

export function selectSubtotalCents(items: Partial<Record<TeaSlug, number>>): number {
  return selectCartLines(items).reduce((sum, line) => sum + line.subtotalCents, 0);
}

export function formatCentsBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Contexto que vai junto de todo evento de carrinho do CRM — dá pra reconstruir o carrinho
// inteiro a partir de qualquer evento, sem depender da ordem dos anteriores.
export function cartSnapshot(items: Partial<Record<TeaSlug, number>>) {
  const lines = selectCartLines(items);
  return {
    items: lines.map((l) => ({
      product_id: l.slug,
      product_name: l.name,
      quantity: l.qty,
      price_cents: l.unitPriceCents,
    })),
    units: selectCartUnits(items),
    subtotal_cents: lines.reduce((sum, l) => sum + l.subtotalCents, 0),
  };
}

function productProps(slug: TeaSlug, items: Partial<Record<TeaSlug, number>>) {
  const tea = teas.find((t) => t.slug === slug);
  return {
    product_id: slug,
    product_name: tea?.name ?? slug,
    price_cents: tea ? unitPriceForTier(selectCartTier(items), tea) : null,
  };
}
