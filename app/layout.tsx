import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav/nav";
import { Footer } from "@/components/footer/footer";
import { AppProviders } from "@/components/providers/app-providers";
import { TrackingScripts } from "@/components/providers/tracking-scripts";
import { SITE_URL } from "@/lib/site";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { ORDER_TOKEN_CLEANUP_SCRIPT } from "@/lib/order-access";

const carena = localFont({
  src: "../public/fonts/Carena-Regular.otf",
  variable: "--font-carena",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const SITE_TITLE = "Almara — Chá 100% natural, um ritual em cada lata";
const SITE_DESCRIPTION =
  "Chás naturais Almara: 6 blends para cada momento do seu dia. Conheça também o Almara+, o app com jornadas guiadas de 21 dias, hábitos e um jardim que cresce com você.";

export const metadata: Metadata = {
  // metadataBase resolve toda URL relativa (og:image, canonical, etc.) pro
  // domínio de produção — sem isso, o Next usa http://localhost:3000 como
  // base em dev/preview e isso vaza pro <head> gerado.
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  // og:image/twitter:image são gerados automaticamente por
  // app/opengraph-image.tsx e app/twitter-image.tsx (convenção de arquivo do
  // Next) — não precisam ser listados aqui.
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Almara",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${carena.variable} ${montserrat.variable} flex min-h-screen flex-col overflow-x-hidden font-body bg-creme text-tinta antialiased`}
      >
        <AppProviders>
          <Nav />
          <div className="flex-1">{children}</div>
          <Footer />
        </AppProviders>
        {/* tira o código de acesso da URL de /pedido antes do GA4 carregar (lib/order-access.ts) */}
        <Script id="order-token-cleanup" strategy="beforeInteractive">
          {ORDER_TOKEN_CLEANUP_SCRIPT}
        </Script>
        <TrackingScripts />
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      </body>
    </html>
  );
}
