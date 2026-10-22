import { CABECALHOS_RETORNO, destinoClickUp } from "@/lib/integracoes/retornoClickUp";

// Volta do ClickUp pro app (ver lib/integracoes/retornoClickUp.ts). Route handler: sem layout, sem analytics.
export function GET(req: Request) {
  return new Response(null, { status: 302, headers: { ...CABECALHOS_RETORNO, Location: destinoClickUp(req.url) } });
}
