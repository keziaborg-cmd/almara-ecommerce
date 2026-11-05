"use client";

import Link from "next/link";
import { useKitsOnSale } from "./use-kits-on-sale";

/** Faixa no topo do site, só de 27/11 a 30/11 (horário de Brasília). */
export function BlackFridayFaixa() {
  const onSale = useKitsOnSale();
  if (!onSale) return null;
  return (
    <Link
      href="/produtos#kits"
      className="block bg-verde-escuro px-[6vw] py-2 text-center text-[13px] font-semibold text-creme hover:underline"
    >
      Black Friday Almara: kits de ritual até 30/11
    </Link>
  );
}
