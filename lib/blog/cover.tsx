import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { BLOG_CATEGORY_LABEL, type BlogCategory } from "@/data/blog-categories";
import { BLOG_COVER_SIZE } from "@/lib/blog/cover-path";

// Capa automática dos posts do blog (1200x630, o tamanho do Open Graph): título do post, cor da
// categoria e a Mara com a xícara. Serve de imagem no topo do post, no card da lista, no
// compartilhamento (WhatsApp, redes) e no JSON-LD do artigo. Sem foto e sem direito autoral.

// Mesmos tons dos tokens --color-jornada-* de app/globals.css (o ImageResponse não lê CSS).
const CATEGORY_COLORS: Record<BlogCategory, { solid: string; clara: string; escura: string }> = {
  sono: { solid: "#b8703a", clara: "#f0e1cc", escura: "#8a5228" },
  ansiedade: { solid: "#5c8a72", clara: "#dce8df", escura: "#3e5f4c" },
  produtividade: { solid: "#8a9a3e", clara: "#e9ecd0", escura: "#636f26" },
  pausa: { solid: "#b0685f", clara: "#f0ddd8", escura: "#7c4740" },
};

/** Título longo encolhe pra caber em até 4 linhas ao lado da Mara. */
function titleSize(title: string): number {
  if (title.length <= 45) return 64;
  if (title.length <= 70) return 54;
  if (title.length <= 95) return 46;
  return 40;
}

export async function renderBlogCover({ title, category }: { title: string; category: BlogCategory }) {
  const [mara, logo, carena] = await Promise.all([
    readFile(join(process.cwd(), "public/blog/mara-capa.png")),
    readFile(join(process.cwd(), "public/logo.png")),
    readFile(join(process.cwd(), "public/fonts/Carena-Regular.otf")),
  ]);
  const colors = CATEGORY_COLORS[category];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: colors.clara,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* círculo da cor da categoria atrás da Mara */}
        <div
          style={{
            position: "absolute",
            right: -90,
            bottom: -150,
            width: 620,
            height: 620,
            borderRadius: 9999,
            background: colors.solid,
            opacity: 0.85,
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${mara.toString("base64")}`}
          width={400}
          height={500}
          alt=""
          style={{ position: "absolute", right: 60, bottom: 0 }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 0 56px 72px",
            width: 700,
            height: "100%",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: colors.escura,
              fontWeight: 700,
            }}
          >
            {`Blog Almara · ${BLOG_CATEGORY_LABEL[category]}`}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Carena",
              fontSize: titleSize(title),
              lineHeight: 1.12,
              color: "#013f24",
            }}
          >
            {title}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`data:image/png;base64,${logo.toString("base64")}`} width={84} height={68} alt="" />
        </div>
      </div>
    ),
    {
      ...BLOG_COVER_SIZE,
      fonts: [{ name: "Carena", data: carena, style: "normal", weight: 400 }],
    },
  );
}
