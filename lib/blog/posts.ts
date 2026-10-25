import { isSafeUrl, renderPostMarkdown } from "@/lib/blog/render-markdown";
// O client "server" (lib/supabase/server.ts) usa cookies() de next/headers, que
// não está disponível em generateStaticParams (roda em build time, sem
// requisição HTTP) — ver erro do Next ao tentar. Blog é leitura pública sem
// sessão nenhuma, então o client "browser" (sem cookies) funciona em
// qualquer contexto, incluindo build time.
import { createClient } from "@/lib/supabase/client";
import { isBlogCategory, type BlogCategory } from "@/data/blog-categories";

export type PostStatus = "revisao" | "publicado";
export type PostRisk = "alto" | "baixo";

export interface PostSource {
  title: string;
  url: string;
}

export interface BlogPost {
  title: string;
  slug: string;
  category: BlogCategory;
  excerpt: string;
  author: string;
  date: string;
  status: PostStatus;
  risk: PostRisk;
  sources: PostSource[];
  contentHtml: string;
  readingTimeMinutes: number;
}

interface BlogPostRow {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  author: string;
  body_markdown: string;
  sources: unknown;
  risk: string;
  status: string;
  created_at: string;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function toPost(row: BlogPostRow): BlogPost | null {
  if (!isBlogCategory(row.category)) return null;

  const sources: PostSource[] = Array.isArray(row.sources)
    ? row.sources
        .map((s) => ({ title: String((s as PostSource)?.title ?? ""), url: String((s as PostSource)?.url ?? "") }))
        .filter((s) => /^https?:/i.test(s.url.trim()) && isSafeUrl(s.url))
    : [];

  return {
    title: row.title,
    slug: row.slug,
    category: row.category,
    excerpt: row.excerpt,
    author: row.author,
    date: row.created_at,
    status: row.status === "publicado" ? "publicado" : "revisao",
    risk: row.risk === "alto" ? "alto" : "baixo",
    sources,
    contentHtml: renderPostMarkdown(row.body_markdown),
    readingTimeMinutes: Math.max(1, Math.ceil(wordCount(row.body_markdown) / 200)),
  };
}

const SELECT_COLUMNS = "title, slug, category, excerpt, author, body_markdown, sources, risk, status, created_at";

/** Só artigos com status "publicado" — é o único portão que as páginas
 * públicas, a listagem e o sitemap enxergam. Isso já é garantido duas vezes:
 * pela policy de RLS da tabela (a anon key não enxerga outro status mesmo
 * que o filtro abaixo seja removido por engano) e pelo filtro explícito. */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(SELECT_COLUMNS)
    .eq("status", "publicado")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => toPost(row as BlogPostRow)).filter((p): p is BlogPost => p !== null);
}

export async function getPublishedPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await getPublishedPosts();
  return posts.find((p) => p.slug === slug);
}

export async function getPublishedPostsByCategory(category: BlogCategory): Promise<BlogPost[]> {
  const posts = await getPublishedPosts();
  return posts.filter((p) => p.category === category);
}

export async function getRelatedPosts(post: BlogPost, limit = 3): Promise<BlogPost[]> {
  const posts = await getPublishedPosts();
  return posts.filter((p) => p.category === post.category && p.slug !== post.slug).slice(0, limit);
}

export async function getPublishedPostsByAuthor(authorSlug: string): Promise<BlogPost[]> {
  const posts = await getPublishedPosts();
  return posts.filter((p) => p.author === authorSlug);
}
