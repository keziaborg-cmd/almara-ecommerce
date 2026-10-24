import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Descadastro de UM clique (RFC 8058): o botão "Cancelar inscrição" do Gmail/Apple Mail faz
// POST /api/descadastro?n=<token> com o corpo "List-Unsubscribe=One-Click". Só POST: o GET abriria
// por scanner de link. Responde 200 sem detalhes (não revela se o token existia).
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const n = request.nextUrl.searchParams.get("n") ?? "";
  if (!UUID_RE.test(n)) return new NextResponse("ok", { status: 200 });
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("newsletter_unsubscribe", { p_token: n });
    if (error) throw error;
  } catch (e) {
    console.error(JSON.stringify({ src: "site-unsubscribe", evt: "one_click_failed", message: e instanceof Error ? e.message.slice(0, 120) : "erro" }));
    return new NextResponse("erro", { status: 500 });
  }
  return new NextResponse("ok", { status: 200 });
}
