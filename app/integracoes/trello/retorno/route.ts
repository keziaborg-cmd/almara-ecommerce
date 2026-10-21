import { CABECALHOS_RETORNO, HTML_RETORNO } from "@/lib/integracoes/retornoTrello";

// Volta do Trello pro app (ver lib/integracoes/retornoTrello.ts). Route handler de propósito: fica
// fora do layout do site, então sem analytics nem scripts de terceiros nesta rota.
export function GET() {
  return new Response(HTML_RETORNO, { status: 200, headers: CABECALHOS_RETORNO });
}
