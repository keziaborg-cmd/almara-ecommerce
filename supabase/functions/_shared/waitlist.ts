// Lista de espera do Almara+ (iPhone): validação do pedido, sem Deno (testável no vitest).

export const WAITLIST_JOURNEYS = ["sono", "ansiedade", "produtividade", "pausa"] as const;
export type WaitlistJourney = (typeof WAITLIST_JOURNEYS)[number];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SOURCE_RE = /^[a-z0-9-]{1,60}$/;
const UTM_RE = /^[A-Za-z0-9._-]{1,60}$/;

export interface WaitlistRequest {
  email: string;
  platform: "ios";
  source: string;
  utmSource: string | null;
  utmMedium: string | null;
  journey: WaitlistJourney | null;
  textVersion: string | null;
}

/** Valida e normaliza o corpo vindo do navegador. null = pedido inválido (e-mail ruim). */
export function parseWaitlistRequest(body: unknown): WaitlistRequest | null {
  const b = (body ?? {}) as Record<string, unknown>;
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) return null;
  const pick = (v: unknown, re: RegExp) => (typeof v === "string" && re.test(v) ? v : null);
  const journey = (WAITLIST_JOURNEYS as readonly string[]).includes(b.journey as string) ? (b.journey as WaitlistJourney) : null;
  return {
    email,
    platform: "ios",
    source: pick(b.source, SOURCE_RE) ?? "lista-espera-ios",
    utmSource: pick(b.utmSource, UTM_RE),
    utmMedium: pick(b.utmMedium, UTM_RE),
    journey,
    textVersion: typeof b.textVersion === "string" ? b.textVersion.slice(0, 40) : null,
  };
}
