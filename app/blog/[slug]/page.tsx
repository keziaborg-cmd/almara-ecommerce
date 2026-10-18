import type { Metadata } from "next";
import { JsonLd } from "@/lib/seo/json-ld";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPosts, getPublishedPostBySlug, getRelatedPosts } from "@/lib/blog/posts";
import { getBlogAuthorBySlug } from "@/data/blog-authors";
import { CategoryBadge } from "@/components/blog/category-badge";
import { SourcesList } from "@/components/blog/sources-list";
import { RelatedPosts } from "@/components/blog/related-posts";
import { JourneyCta } from "@/components/blog/journey-cta";
import { EmailCapture } from "@/components/blog/email-capture";
import { ProfessionalSupportNotice } from "@/components/blog/professional-support-notice";
import { SITE_URL } from "@/lib/site";


export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} — Blog Almara`,
    description: post.excerpt,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
    },
  };
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const author = getBlogAuthorBySlug(post.author);
  const related = await getRelatedPosts(post);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      author: author ? { "@type": "Person", name: author.name } : undefined,
      publisher: { "@id": `${SITE_URL}/#organizacao` },
      mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    },
    author && {
      "@context": "https://schema.org",
      "@type": "Person",
      name: author.name,
      description: author.bio,
      url: `${SITE_URL}/blog/autor/${author.slug}`,
    },
  ].filter(Boolean);

  return (
    <main className="animate-pagein px-[6vw] py-14">
      <JsonLd data={jsonLd as object[]} />

      <div className="mx-auto max-w-[760px]">
        <Link href="/blog" className="text-sm font-semibold text-verde-folha hover:underline">
          ← Voltar pro blog
        </Link>

        <div className="mt-5">
          <CategoryBadge category={post.category} />
        </div>
        <h1 className="mt-4 font-display text-[clamp(34px,5vw,54px)] leading-tight text-verde-escuro">{post.title}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-tinta/60">
          {author && (
            <Link href={`/blog/autor/${author.slug}`} className="font-semibold text-tinta/80 hover:underline">
              {author.name}
            </Link>
          )}
          <span>·</span>
          <span>{formatDate(post.date)}</span>
          <span>·</span>
          <span>{post.readingTimeMinutes} min de leitura</span>
        </div>

        <article
          className="prose prose-headings:font-display prose-headings:text-verde-escuro prose-p:text-tinta/85 mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {post.risk === "alto" && <ProfessionalSupportNotice />}

        <SourcesList sources={post.sources} />

        <div className="mt-10">
          <JourneyCta category={post.category} />
        </div>

        <div className="mt-8">
          <EmailCapture sourceSlug={post.slug} />
        </div>

        <RelatedPosts posts={related} />
      </div>
    </main>
  );
}
