// `price`/`priceCents`/`priceTier2Cents`/`priceTier3Cents` here are display
// fallbacks only; shop_products' price_cents/price_tier2_cents/price_tier3_cents
// in Supabase are authoritative at checkout (see shop-create-order).
//
// Volume pricing: the tier applies per the CART's total unit count across all
// products (any mix of flavors) — 1 unit = price, 2 units = priceTier2, 3+ =
// priceTier3 — not per how many of this one product are in the cart. See
// lib/pricing/tiers.ts.

export const TEA_SLUGS = [
  "cha-verde",
  "camomila",
  "jasmin",
  "cha-preto",
  "cidreira",
  "hibisco",
] as const;

export type TeaSlug = (typeof TEA_SLUGS)[number];

export interface Tea {
  name: string;
  slug: TeaSlug;
  tag: string;
  weight: string;
  price: string;
  priceCents: number;
  priceTier2Cents: number;
  priceTier3Cents: number;
  img: string;
  chip: string;
  heroBg: string;
  heroWord: string;
  heroSub: string;
  glow: string;
  cardBg: string;
  nameColor: string;
  subColor: string;
  priceColor: string;
  btnBg: string;
  btnFg: string;
  about: string;
  prep: string;
  benefits: string[];
}

export const teas: Tea[] = [
  {
    name: "Chá Verde",
    slug: "cha-verde",
    tag: "um sopro de renovação.",
    weight: "120g",
    price: "R$ 22,90",
    priceCents: 2290,
    priceTier2Cents: 1990,
    priceTier3Cents: 1890,
    img: "/tea/cha-verde.png",
    chip: "Colheita natural",
    heroBg:
      "radial-gradient(120% 120% at 50% 0%,#265033 0%,#013f24 45%,#14301b 100%)",
    heroWord: "#3c7b33",
    heroSub: "#dce6d3",
    glow: "rgba(120,190,90,.45)",
    cardBg: "linear-gradient(180deg,#e6efdd,#dbe8cf)",
    nameColor: "#013f24",
    subColor: "#4a5544",
    priceColor: "#568833",
    btnBg: "#013f24",
    btnFg: "#fffdf8",
    about:
      "Folhas de chá verde colhidas jovens e secas com cuidado para preservar o frescor. Sabor herbáceo e limpo, com um toque adstringente que desperta o paladar.",
    prep: "1 colher de chá para 200ml de água a 75–80°C. Deixe em infusão por 2 a 3 minutos. Evite água fervente para não amargar.",
    benefits: [
      "Rico em antioxidantes (catequinas)",
      "Foco e disposição sem picos",
      "Aliado do metabolismo",
    ],
  },
  {
    name: "Camomila",
    slug: "camomila",
    tag: "calma que floresce.",
    weight: "65g",
    price: "R$ 23,90",
    priceCents: 2390,
    priceTier2Cents: 2090,
    priceTier3Cents: 1990,
    img: "/tea/camomila.png",
    chip: "Flores selecionadas",
    heroBg:
      "radial-gradient(120% 120% at 50% 0%,#3a6b3f 0%,#25502f 50%,#173521 100%)",
    heroWord: "#c9e0b3",
    heroSub: "#e4efd9",
    glow: "rgba(1,63,36,.4)",
    cardBg: "linear-gradient(180deg,#e9e4d3,#e0dac6)",
    nameColor: "#013f24",
    subColor: "#4a5544",
    priceColor: "#568833",
    btnBg: "#568833",
    btnFg: "#fff",
    about:
      "Flores de camomila inteiras, de aroma doce e delicado. Uma infusão dourada e macia, feita para os momentos de desacelerar.",
    prep: "1 colher de sopa de flores para 200ml de água a 90°C. Infusão de 4 a 5 minutos, tampado, para reter o aroma.",
    benefits: [
      "Ajuda a relaxar",
      "Favorece um sono tranquilo",
      "Conforto digestivo",
    ],
  },
  {
    name: "Jasmin",
    slug: "jasmin",
    tag: "um instante de leveza.",
    weight: "50g",
    price: "R$ 39,90",
    priceCents: 3990,
    priceTier2Cents: 3690,
    priceTier3Cents: 3590,
    img: "/tea/jasmin.png",
    chip: "Aroma floral",
    heroBg:
      "radial-gradient(120% 120% at 50% 0%,#2f5a33 0%,#1c3d22 55%,#0f2415 100%)",
    heroWord: "#568833",
    heroSub: "#dce6d3",
    glow: "rgba(90,150,70,.45)",
    cardBg: "linear-gradient(180deg,#dfe7d6,#cfddc2)",
    nameColor: "#013f24",
    subColor: "#4a5544",
    priceColor: "#568833",
    btnBg: "#013f24",
    btnFg: "#fffdf8",
    about:
      "Chá perfumado naturalmente com flores de jasmim. Leve, floral e levemente adocicado — um respiro de leveza no meio do dia.",
    prep: "1 colher de chá para 200ml de água a 80°C. Infusão de 2 a 3 minutos. Coe e aproveite o aroma.",
    benefits: [
      "Aroma que acalma a mente",
      "Antioxidantes naturais",
      "Leveza e bem-estar",
    ],
  },
  {
    name: "Chá Preto",
    slug: "cha-preto",
    tag: "seu foco é seu poder.",
    weight: "120g",
    price: "R$ 33,90",
    priceCents: 3390,
    priceTier2Cents: 3090,
    priceTier3Cents: 2990,
    img: "/tea/cha-preto.png",
    chip: "Corpo intenso",
    heroBg:
      "radial-gradient(120% 120% at 50% 0%,#22381f 0%,#141d14 55%,#0a0f0a 100%)",
    heroWord: "#3f7d33",
    heroSub: "#cdd6c8",
    glow: "rgba(80,110,70,.4)",
    cardBg: "linear-gradient(180deg,#e0e3da,#d2d8cb)",
    nameColor: "#013f24",
    subColor: "#4a5544",
    priceColor: "#568833",
    btnBg: "#013f24",
    btnFg: "#fffdf8",
    about:
      "Folhas totalmente oxidadas, de corpo intenso e sabor marcante. O empurrão firme para as manhãs e as tarefas que pedem foco.",
    prep: "1 colher de chá para 200ml de água a 95°C. Infusão de 3 a 5 minutos, conforme a intensidade desejada.",
    benefits: [
      "Cafeína natural para energia",
      "Foco e concentração",
      "Sabor encorpado",
    ],
  },
  {
    name: "Cidreira",
    slug: "cidreira",
    tag: "um respiro para a alma.",
    weight: "60g",
    price: "R$ 20,90",
    priceCents: 2090,
    priceTier2Cents: 1790,
    priceTier3Cents: 1690,
    img: "/tea/cidreira.png",
    chip: "Ervas calmantes",
    heroBg:
      "radial-gradient(120% 120% at 50% 0%,#2f5e37 0%,#013f24 55%,#112817 100%)",
    heroWord: "#7fbf5f",
    heroSub: "#dce6d3",
    glow: "rgba(90,150,70,.45)",
    cardBg: "linear-gradient(180deg,#dfe8d4,#cddcc0)",
    nameColor: "#013f24",
    subColor: "#4a5544",
    priceColor: "#568833",
    btnBg: "#013f24",
    btnFg: "#fffdf8",
    about:
      "Erva-cidreira de folhas aromáticas, cítricas e suaves. Uma infusão sem cafeína, feita para acalmar o corpo e a mente.",
    prep: "1 colher de sopa de folhas para 200ml de água a 90°C. Infusão de 5 minutos, tampado.",
    benefits: ["Sem cafeína", "Ajuda a aliviar a tensão", "Conforto e calma"],
  },
  {
    name: "Hibisco",
    slug: "hibisco",
    tag: "sabor que transforma.",
    weight: "95g",
    price: "R$ 24,90",
    priceCents: 2490,
    priceTier2Cents: 2190,
    priceTier3Cents: 2090,
    img: "/tea/hibisco.png",
    chip: "Flor vibrante",
    heroBg:
      "radial-gradient(120% 120% at 20% 0%,#8a3232 0%,#6f2323 45%,#4d1a1c 100%)",
    heroWord: "#e6968e",
    heroSub: "#f0d4cd",
    glow: "rgba(230,120,110,.45)",
    cardBg: "linear-gradient(180deg,#ecdcd6,#e3cbc4)",
    nameColor: "#6f1d11",
    subColor: "#6a4a46",
    priceColor: "#6f1d11",
    btnBg: "#6f1d11",
    btnFg: "#fff",
    about:
      "Cálices de hibisco de cor vibrante e sabor frutado e cítrico. Uma infusão rubi, refrescante quente ou gelada.",
    prep: "1 colher de sopa para 200ml de água a 95°C. Infusão de 5 a 7 minutos. Ótimo gelado com limão.",
    benefits: [
      "Ritual de pausa consciente",
      "Cor viva e sabor marcante",
      "Sem cafeína, serve a qualquer hora",
      "Bom quente e bom gelado",
    ],
  },
];

export function getTeaBySlug(slug: string): Tea | undefined {
  return teas.find((t) => t.slug === slug);
}

export function getOtherTeas(slug: string, count = 3): Tea[] {
  return teas.filter((t) => t.slug !== slug).slice(0, count);
}
