import { NextResponse, type NextRequest } from "next/server";
import { cspReportSummary } from "@/lib/csp-report";

// Recebe os avisos da Content-Security-Policy-Report-Only (next.config.mjs) e grava um resumo no
// log da Vercel (src=csp). Só origem do que foi bloqueado e caminho da página — nunca a URL inteira,
// que pode ter o ?token= de um pedido. Serve pra fechar a lista de domínios antes de ligar a CSP.
export async function POST(request: NextRequest) {
  const text = (await request.text()).slice(0, 16384);
  for (const line of cspReportSummary(text)) console.log(JSON.stringify({ src: "csp", ...line }));
  return new NextResponse(null, { status: 204 });
}
