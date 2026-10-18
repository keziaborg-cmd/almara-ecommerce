import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/blog/posts";
import { BlogListClient } from "@/components/blog/blog-list-client";

// Posts novos são publicados pelo painel, sem deploy: a página se refaz sozinha a cada 15 min.
export const revalidate = 900;

export const metadata: Metadata = {
  alternates: { canonical: "/blog" },
  title: "Blog — Almara",
  description: "Conteúdo sobre sono, ansiedade, produtividade e pausa — da equipe Almara, com fontes sempre citadas.",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <main className="animate-pagein px-[6vw] py-14">
      <div className="mx-auto max-w-[1320px] xl:max-w-[1480px] 2xl:max-w-[1680px]">
        <div className="mb-10 text-center">
          <p className="eyebrow text-eyebrow-claro">Blog</p>
          <h1 className="mt-2 font-display text-[clamp(44px,7vw,84px)] text-verde-escuro">
            Conteúdo pra cuidar de você
          </h1>
          <p className="mx-auto mt-3 max-w-md text-tinta/70">
            Sono, ansiedade, produtividade e pausa — sempre com fontes citadas, sem promessa de cura.
          </p>
        </div>
        <BlogListClient posts={posts} />
      </div>
    </main>
  );
}
