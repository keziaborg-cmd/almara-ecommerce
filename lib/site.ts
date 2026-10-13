/**
 * Endereço público do site, num lugar só: metadataBase, canonical, sitemap, robots, JSON-LD e a
 * imagem de compartilhamento leem daqui. Vem de NEXT_PUBLIC_SITE_URL (Vercel → Environment
 * Variables); o padrão é o domínio definitivo. Sem barra no fim.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://almara.com.br").replace(/\/+$/, "");

/** Só o domínio (ex.: almara.com.br), pra exibir. */
export const SITE_HOST = new URL(SITE_URL).host;

/** Perfil do Instagram (sem @). NEXT_PUBLIC_INSTAGRAM_HANDLE sobrescreve; o padrão é o perfil oficial. */
export const INSTAGRAM_HANDLE = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE?.trim().replace(/^@/, "") || "almaramais";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;
