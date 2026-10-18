import { getPublishedPostBySlug } from "@/lib/blog/posts";
import { renderBlogCover } from "@/lib/blog/cover";

// Capa automática do post (ver lib/blog/cover.tsx). Só existe pra post publicado: rascunho em
// revisão não ganha URL pública de imagem.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return new Response("Not found", { status: 404 });

  const image = await renderBlogCover({ title: post.title, category: post.category });
  image.headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800");
  return image;
}
