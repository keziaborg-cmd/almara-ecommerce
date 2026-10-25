export interface CspReportLine {
  directive: string;
  blocked: string;
  page: string;
}

function origin(raw: unknown): string {
  if (typeof raw !== "string" || raw === "") return "";
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) return raw.slice(0, 40); // "inline", "eval", "data", "blob"
  try {
    return new URL(raw).origin;
  } catch {
    return "?";
  }
}

function path(raw: unknown): string {
  if (typeof raw !== "string") return "";
  try {
    return new URL(raw).pathname.slice(0, 120);
  } catch {
    return "";
  }
}

/** Aceita o formato antigo (report-uri: {"csp-report": {...}}) e o novo (Reporting API: [{type, body}]). */
export function cspReportSummary(text: string): CspReportLine[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return [];
  }
  const bodies: Record<string, unknown>[] = Array.isArray(data)
    ? data.filter((r) => r?.type === "csp-violation").map((r) => r.body ?? {})
    : data && typeof data === "object" && "csp-report" in data
      ? [(data as Record<string, Record<string, unknown>>)["csp-report"]]
      : [];
  return bodies.slice(0, 20).map((b) => ({
    directive: String(b["effectiveDirective"] ?? b["effective-directive"] ?? b["violated-directive"] ?? "").slice(0, 40),
    blocked: origin(b["blockedURL"] ?? b["blocked-uri"]),
    page: path(b["documentURL"] ?? b["document-uri"]),
  }));
}
