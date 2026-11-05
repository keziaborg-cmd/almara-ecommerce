"use client";

import { useEffect, useState } from "react";
import { kitsOnSale } from "@/lib/cart/kits";

/** true só no período da Black Friday (relógio do aparelho; o servidor confere de novo na compra).
 * Começa false pra o HTML do servidor e a primeira renderização baterem. */
export function useKitsOnSale(): boolean {
  const [onSale, setOnSale] = useState(false);
  useEffect(() => {
    const check = () => setOnSale(kitsOnSale(Date.now()));
    check();
    const timer = setInterval(check, 60_000);
    return () => clearInterval(timer);
  }, []);
  return onSale;
}

export interface KitStock {
  slug: string;
  remaining: number;
}

/** Quanto resta de cada kit (public.shop_kits_status). null enquanto carrega ou se falhar. */
export function useKitStock(enabled: boolean): Map<string, number> | null {
  const [stock, setStock] = useState<Map<string, number> | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/shop_kits_status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""}`,
          },
          body: "{}",
        });
        if (!res.ok) return;
        const rows = (await res.json()) as KitStock[];
        if (!cancelled) setStock(new Map(rows.map((r) => [r.slug, r.remaining])));
      } catch {
        // sem a contagem, o botão continua; o servidor recusa se tiver esgotado
      }
    };
    load();
    const timer = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [enabled]);
  return stock;
}
