import type { Metadata } from "next";
import Link from "next/link";
import { unsubscribe, unsubscribeNewsletter } from "./actions";

export const metadata: Metadata = {
  title: "Descadastro — Almara",
  description: "Pare de receber mensagens de marketing da Almara.",
  robots: { index: false, follow: false },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CHANNEL: Record<string, string> = { email: "e-mail", sms: "SMS", whatsapp: "WhatsApp", rcs: "RCS" };

export default async function Page({ searchParams }: { searchParams: Promise<{ m?: string; n?: string; ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  // m = id de uma mensagem do CRM; n = token do inscrito da newsletter (e-mail do cupom)
  const newsletter = Boolean(sp.n && UUID_RE.test(sp.n));
  const valid = newsletter || Boolean(sp.m && UUID_RE.test(sp.m));

  return (
    <main className="mx-auto max-w-xl px-5 py-16 sm:py-24">
      <p className="text-sm font-medium uppercase tracking-wide text-tinta/55">Preferências de comunicação</p>
      <h1 className="mt-2 font-display text-4xl text-verde-escuro">Descadastro</h1>

      {sp.ok ? (
        <div role="status" className="mt-6 space-y-3 leading-relaxed text-tinta/80">
          <p>
            Pronto. Você não vai mais receber mensagens de marketing da Almara por{" "}
            <strong className="font-medium text-verde-escuro">{CHANNEL[sp.ok] ?? sp.ok}</strong>.
          </p>
          <p>
            Mensagens sobre um pedido que você fizer (confirmação, pagamento, entrega) continuam chegando, porque fazem parte da compra.
          </p>
        </div>
      ) : sp.erro === "link" || (!valid && !sp.erro) ? (
        <p className="mt-6 leading-relaxed text-tinta/80">
          Este link de descadastro não é válido ou já expirou. Se quiser parar de receber mensagens, fale com a gente em{" "}
          <a href="mailto:ola@almara.com.br" className="underline underline-offset-2">ola@almara.com.br</a>.
        </p>
      ) : (
        <form action={newsletter ? unsubscribeNewsletter : unsubscribe} className="mt-6 space-y-4">
          {newsletter ? <input type="hidden" name="n" value={sp.n} /> : <input type="hidden" name="m" value={sp.m} />}
          <p className="leading-relaxed text-tinta/80">
            Confirme pra parar de receber mensagens de marketing da Almara neste canal. Mensagens sobre seus pedidos continuam chegando.
          </p>
          {sp.erro === "falha" && (
            <p role="alert" className="text-sm text-red-700">
              Não deu certo agora. Tente de novo em alguns instantes.
            </p>
          )}
          <button type="submit" className="rounded-full bg-verde-escuro px-6 py-3 text-sm font-medium text-white transition hover:opacity-90">
            Confirmar descadastro
          </button>
        </form>
      )}

      <p className="mt-10 text-sm text-tinta/55">
        <Link href="/politica-de-privacidade" className="underline underline-offset-2">
          Política de Privacidade
        </Link>
      </p>
    </main>
  );
}
