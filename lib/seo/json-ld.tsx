import type { Tea } from "@/data/teas";
import { INSTAGRAM_URL, SITE_URL } from "@/lib/site";

// Dados estruturados (schema.org) que o Google lê pra entender que "Almara" é uma marca, que o
// site é dela e que os chás são produtos com preço. Renderizados como <script> no layout/página,
// como recomenda o guia de JSON-LD do Next.

const ORG_ID = `${SITE_URL}/#organizacao`;
const SITE_ID = `${SITE_URL}/#site`;

/** O JSON.stringify não escapa `<`: sem isso, um texto com "</script>" fecharia a tag (XSS). */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: "Almara",
    legalName: "ALMARA PRODUTOS NATURAIS LTDA",
    alternateName: ["Almara Chás", "Almara+"],
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: "Chás 100% naturais em lata e o Almara+, app de bem-estar com jornadas guiadas de 21 dias.",
    sameAs: [INSTAGRAM_URL],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    name: "Almara",
    alternateName: "Almara Chás",
    url: SITE_URL,
    inLanguage: "pt-BR",
    publisher: { "@id": ORG_ID },
  };
}

function reais(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function productJsonLd(tea: Tea) {
  const url = `${SITE_URL}/produtos/${tea.slug}`;
  const grams = Number.parseInt(tea.weight, 10);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#produto`,
    name: `${tea.name} Almara`,
    description: tea.about,
    image: `${SITE_URL}${tea.img}`,
    sku: tea.slug,
    url,
    brand: { "@type": "Brand", name: "Almara" },
    category: "Chá",
    ...(Number.isFinite(grams) ? { weight: { "@type": "QuantitativeValue", value: grams, unitCode: "GRM" } } : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "BRL",
      price: reais(tea.priceCents),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": ORG_ID },
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
