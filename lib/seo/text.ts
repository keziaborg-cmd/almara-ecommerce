// O Google corta título por volta de 60 caracteres e descrição por volta de 155–160.

/** Título com o sufixo da marca só se couber; senão, o primeiro sufixo que couber, ou o título puro. */
export function seoTitle(title: string, suffixes: string[], max = 60): string {
  for (const suffix of suffixes) {
    const full = `${title}${suffix}`;
    if (full.length <= max) return full;
  }
  return title;
}

/** Descrição cortada numa palavra inteira, com reticências quando passa do limite. */
export function metaDescription(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.—-]+$/, "")}…`;
}
