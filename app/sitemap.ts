import type { MetadataRoute } from "next";
import { teas } from "@/data/teas";
import { BLOG_AUTHORS } from "@/data/blog-authors";
import { getPublishedPosts } from "@/lib/blog/posts";
import { SITE_URL } from "@/lib/site";

// Posts novos são publicados pelo painel, sem deploy: a página se refaz sozinha a cada 15 min.
export const revalidate = 900;


// Páginas fixas do site + uma entrada por chá (gerado a partir de data/teas.ts,
// então um novo blend adicionado ali já entra no sitemap sem precisar editar
// aqui). Carrinho/checkout/pedido ficam de fora — não fazem sentido indexados
// por buscador (conteúdo transacional/pessoal, não uma página de destino).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/produtos`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/almara-mais`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/quiz`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/sobre`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    // Páginas legais. /excluir-conta e /politica-de-privacidade também são
    // exigidas pelas lojas (Apple e Google) como URL pública, então precisam
    // estar indexáveis — não entram no disallow do robots.txt.
    { url: `${SITE_URL}/termos-de-uso`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/politica-de-trocas-e-devolucoes`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/politica-de-privacidade`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/suporte`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/excluir-conta`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const productRoutes: MetadataRoute.Sitemap = teas.map((tea) => ({
    url: `${SITE_URL}/produtos/${tea.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Só artigos com status "publicado" chegam aqui — getPublishedPosts() já
  // filtra rascunho fora, é o mesmo portão usado pela listagem e pelo artigo.
  const posts = await getPublishedPosts();
  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const blogAuthorRoutes: MetadataRoute.Sitemap = BLOG_AUTHORS.map((author) => ({
    url: `${SITE_URL}/blog/autor/${author.slug}`,
    changeFrequency: "monthly",
    priority: 0.3,
  }));

  return [...staticRoutes, ...productRoutes, ...blogRoutes, ...blogAuthorRoutes];
}
