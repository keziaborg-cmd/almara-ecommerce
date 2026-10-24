import { NextResponse, type NextRequest } from "next/server";
import { appDestination, platformFromUserAgent } from "@/lib/app-links";

// almara.com.br/app — o link do QR Code e dos botões "baixar o app": manda cada aparelho pra sua
// loja (ou pra página do Almara+ enquanto o app não está publicado). Redirecionamento temporário
// (307), pra o destino poder mudar sem ficar preso no cache de ninguém.
export async function GET(request: NextRequest) {
  const platform = platformFromUserAgent(request.headers.get("user-agent"));
  const target = appDestination(platform, request.nextUrl.searchParams);
  return NextResponse.redirect(new URL(target, request.url), 307);
}
