import type { TeaSlug } from "@/data/teas";

// Kits da Black Friday 2026. Preço e limite aqui são só pra mostrar: o que vale é shop_products
// (kind = 'kit') e a regra das Edge Functions (supabase/functions/_shared/kits.ts).
export type KitSlug = "kit-dia-inteiro" | "kit-foco" | "kit-desacelerar";

export interface Kit {
  slug: KitSlug;
  name: string;
  tagline: string;
  about: string;
  priceCents: number;
  /** Preço "de": soma das latas avulsas. */
  compareAtCents: number;
  /** 1 lata de cada. */
  components: TeaSlug[];
}

export const kits: Kit[] = [
  {
    slug: "kit-dia-inteiro",
    name: "Kit Dia Inteiro",
    tagline: "Um chá para cada momento do dia.",
    about: "Os seis chás Almara, do primeiro gole da manhã ao último da noite.",
    priceCents: 11990,
    compareAtCents: 16640,
    components: ["camomila", "cidreira", "cha-verde", "cha-preto", "hibisco", "jasmin"],
  },
  {
    slug: "kit-foco",
    name: "Kit Foco",
    tagline: "Para as horas que pedem atenção.",
    about: "Chá Preto e Chá Verde, para acompanhar o trabalho e os estudos.",
    priceCents: 4490,
    compareAtCents: 5680,
    components: ["cha-preto", "cha-verde"],
  },
  {
    slug: "kit-desacelerar",
    name: "Kit Desacelerar",
    tagline: "Para o fim do dia.",
    about: "Camomila, Cidreira e Jasmin, para desacelerar e descansar.",
    priceCents: 6290,
    compareAtCents: 8470,
    components: ["camomila", "cidreira", "jasmin"],
  },
];

export const KIT_SLUGS = kits.map((k) => k.slug);

export function isKitSlug(slug: string): slug is KitSlug {
  return (KIT_SLUGS as string[]).includes(slug);
}

export function getKitBySlug(slug: string): Kit | undefined {
  return kits.find((k) => k.slug === slug);
}
