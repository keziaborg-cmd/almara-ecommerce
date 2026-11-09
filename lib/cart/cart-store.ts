import { create } from "zustand";
import { persist } from "zustand/middleware";
import { teas, type TeaSlug } from "@/data/teas";
import { kits, type KitSlug } from "@/data/kits";
import { tierForCartUnits, unitPriceForTier, type PriceTier } from "@/lib/pricing/tiers";
import { track } from "@/lib/crm/tracker";
import { STORAGE_KEYS } from "@/lib/storage-keys";

/** Lata avulsa ou kit da Black Friday. */
export type CartSlug = TeaSlug | KitSlug;
type CartItems = Partial<Record<CartSlug, number>>;

export interface CartLine {
  slug: CartSlug;
  kind: "lata" | "kit";
  name: string;
  qty: number;
  unitPriceCents: number;
  subtotalCents: number;
}

interface CartState {
  items: CartItems;
  add: (slug: CartSlug, qty?: number) => void;
  setQty: (slug: CartSlug, qty: number) => void;
  remove: (slug: CartSlug) => void;
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

/** Itens no carrinho (latas + kits): o número do ícone do carrinho. */
export function selectCartUnits(items: CartItems): number {
  return Object.values(items).reduce((sum: number, qty) => sum + (qty ?? 0), 0);
}

/** Latas avulsas: só elas definem a faixa de preço (kit tem preço fixo e não conta). */
export function selectLatasUnits(items: CartItems): number {
  return teas.reduce((sum, tea) => sum + (items[tea.slug] ?? 0), 0);
}

export function selectCartTier(items: CartItems): PriceTier {
  return tierForCartUnits(selectLatasUnits(items));
}

export function selectCartLines(items: CartItems): CartLine[] {
  const tier = selectCartTier(items);
  const latas: CartLine[] = teas
    .filter((tea) => (items[tea.slug] ?? 0) > 0)
    .map((tea) => {
      const qty = items[tea.slug]!;
      const unitPriceCents = unitPriceForTier(tier, tea);
      return { slug: tea.slug, kind: "lata", name: tea.name, qty, unitPriceCents, subtotalCents: unitPriceCents * qty };
    });
  const kitLines: CartLine[] = kits
    .filter((kit) => (items[kit.slug] ?? 0) > 0)
    .map((kit) => {
      const qty = items[kit.slug]!;
      return { slug: kit.slug, kind: "kit", name: kit.name, qty, unitPriceCents: kit.priceCents, subtotalCents: kit.priceCents * qty };
    });
  return [...latas, ...kitLines];
}

export function selectSubtotalCents(items: CartItems): number {
  return selectCartLines(items).reduce((sum, line) => sum + line.subtotalCents, 0);
}

/** Subtotal das latas avulsas e dos kits, separados (o cupom vale só nas latas). */
export function selectSubtotalsByKind(items: CartItems): { latasSubtotalCents: number; kitsSubtotalCents: number } {
  const lines = selectCartLines(items);
  const sum = (kind: CartLine["kind"]) => lines.filter((l) => l.kind === kind).reduce((s, l) => s + l.subtotalCents, 0);
  return { latasSubtotalCents: sum("lata"), kitsSubtotalCents: sum("kit") };
}

export function formatCentsBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Contexto que vai junto de todo evento de carrinho do CRM — dá pra reconstruir o carrinho
// inteiro a partir de qualquer evento, sem depender da ordem dos anteriores.
export function cartSnapshot(items: CartItems) {
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

function productProps(slug: CartSlug, items: CartItems) {
  const tea = teas.find((t) => t.slug === slug);
  const kit = kits.find((k) => k.slug === slug);
  return {
    product_id: slug,
    product_name: tea?.name ?? kit?.name ?? slug,
    price_cents: tea ? unitPriceForTier(selectCartTier(items), tea) : (kit?.priceCents ?? null),
  };
}
