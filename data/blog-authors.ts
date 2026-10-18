// Autores do blog — hoje só a Almara como autora institucional, mas a
// estrutura já aceita profissionais parceiros assinando artigos no futuro
// (bio, credencial, foto por autor, não só um nome solto no frontmatter).
export interface BlogAuthor {
  slug: string;
  name: string;
  /** Credencial/cargo, ex.: "Nutricionista, CRN 12345" — opcional pra autoria institucional. */
  credential?: string;
  bio: string;
  photo?: string;
  /** Slugs antigos que ainda podem estar gravados nos posts (o endereço antigo redireciona com 301). */
  legacySlugs?: string[];
  /** Autoria institucional (a própria marca) ou de uma pessoa — muda o tipo no JSON-LD. */
  kind: "organizacao" | "pessoa";
}

export const BLOG_AUTHORS: BlogAuthor[] = [
  {
    slug: "equipe-almara",
    legacySlugs: ["equipe-smartea"],
    name: "Equipe Almara",
    kind: "organizacao",
    bio: "Conteúdo escrito pela equipe editorial da Almara, com apoio de fontes públicas confiáveis — sempre citadas ao final de cada artigo.",
  },
];

export function getBlogAuthorBySlug(slug: string): BlogAuthor | undefined {
  return BLOG_AUTHORS.find((a) => a.slug === slug || a.legacySlugs?.includes(slug));
}
