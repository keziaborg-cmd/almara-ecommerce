import type { Metadata } from "next";
import { JsonLd } from "@/lib/seo/json-ld";
import { notFound } from "next/navigation";
import { BLOG_AUTHORS, getBlogAuthorBySlug } from "@/data/blog-authors";
import { getPublishedPostsByAuthor } from "@/lib/blog/posts";
import { PostCard } from "@/components/blog/post-card";
import { SITE_URL } from "@/lib/site";

// Posts novos são publicados pelo painel, sem deploy: a página se refaz sozinha a cada 15 min.
export const revalidate = 900;


export function generateStaticParams() {
  return BLOG_AUTHORS.map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const author = getBlogAuthorBySlug(slug);
  if (!author) return {};
  return {
    title: `${author.name} — Blog Almara`,
    description: author.bio,
    alternates: { canonical: `${SITE_URL}/blog/autor/${author.slug}` },
  };
}

export default async function BlogAuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = getBlogAuthorBySlug(slug);
  if (!author) notFound();

  const posts = await getPublishedPostsByAuthor(author.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": author.kind === "organizacao" ? "Organization" : "Person",
    name: author.name,
    description: author.bio,
    url: `${SITE_URL}/blog/autor/${author.slug}`,
  };

  return (
    <main className="animate-pagein px-[6vw] py-14">
      <JsonLd data={jsonLd} />

      <div className="mx-auto max-w-[900px]">
        <div className="text-center">
          <p className="eyebrow text-eyebrow-claro">Autor</p>
          <h1 className="mt-2 font-display text-[clamp(36px,6vw,60px)] text-verde-escuro">{author.name}</h1>
          {author.credential && <p className="mt-1 text-sm font-semibold text-tinta/60">{author.credential}</p>}
          <p className="mx-auto mt-3 max-w-md text-tinta/70">{author.bio}</p>
        </div>

        <h2 className="mb-5 mt-12 font-display text-2xl text-verde-escuro">Artigos</h2>
        {posts.length === 0 ? (
          <p className="text-sm text-tinta/60">Nenhum artigo publicado ainda.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
