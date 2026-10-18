// Endereço e tamanho da capa automática dos posts — separados de lib/blog/cover.tsx (que usa
// node:fs e next/og) pra poderem ser importados também por componentes de cliente.
export const BLOG_COVER_SIZE = { width: 1200, height: 630 };

export function blogCoverPath(slug: string): string {
  return `/blog/${slug}/capa`;
}
