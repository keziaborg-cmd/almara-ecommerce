import Image from "next/image";
import Link from "next/link";
import { BLOG_COVER_SIZE, blogCoverPath } from "@/lib/blog/cover-path";
import { CategoryBadge } from "@/components/blog/category-badge";
import type { BlogPost } from "@/lib/blog/posts";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

export function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="flex flex-col gap-3 overflow-hidden rounded-card-conteudo border border-borda-clara bg-white p-6 transition hover:border-verde-folha"
    >
      <Image
        src={blogCoverPath(post.slug)}
        alt=""
        {...BLOG_COVER_SIZE}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="-mx-6 -mt-6 mb-1 h-auto w-[calc(100%+3rem)] max-w-none"
      />
      <CategoryBadge category={post.category} />
      <h3 className="font-display text-xl text-verde-escuro">{post.title}</h3>
      <p className="line-clamp-3 text-sm text-tinta/70">{post.excerpt}</p>
      <p className="mt-auto text-xs text-tinta/50">
        {formatDate(post.date)} · {post.readingTimeMinutes} min de leitura
      </p>
    </Link>
  );
}
