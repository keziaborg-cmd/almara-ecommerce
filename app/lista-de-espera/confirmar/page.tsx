import type { Metadata } from "next";
import Link from "next/link";
import { confirmWaitlist } from "./actions";

export const metadata: Metadata = {
  title: "Confirmar e-mail — Almara+",
  description: "Confirme para saber quando o Almara+ chegar na App Store.",
  robots: { index: false, follow: false },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function Page({ searchParams }: { searchParams: Promise<{ t?: string; ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const valid = Boolean(sp.t && UUID_RE.test(sp.t));

  return (
    <main className="mx-auto max-w-xl px-5 py-16 sm:py-24">
      <p className="text-sm font-medium uppercase tracking-wide text-tinta/55">Almara+ no iPhone</p>
      <h1 className="mt-2 font-display text-4xl text-verde-escuro">Confirmar e-mail</h1>

      {sp.ok ? (
        <div role="status" className="mt-6 space-y-3 leading-relaxed text-tinta/80">
          <p>Pronto. Assim que o Almara+ chegar na App Store, a gente te avisa por e-mail.</p>
          <p>É um aviso só: você não entra na newsletter nem recebe ofertas.</p>
        </div>
      ) : sp.erro === "link" || (!valid && !sp.erro) ? (
        <p className="mt-6 leading-relaxed text-tinta/80">
          Este link de confirmação não é válido ou já foi usado. Se quiser entrar na lista, é só deixar seu e-mail de novo em{" "}
          <Link href="/lu" className="underline underline-offset-2">
            almara.com.br/lu
          </Link>
          .
        </p>
      ) : (
        <form action={confirmWaitlist} className="mt-6 space-y-4">
          <input type="hidden" name="t" value={sp.t} />
          <p className="leading-relaxed text-tinta/80">Confirme para receber um e-mail quando o Almara+ chegar na App Store.</p>
          {sp.erro === "falha" && (
            <p role="alert" className="text-sm text-red-700">
              Não deu certo agora. Tente de novo em alguns instantes.
            </p>
          )}
          <button type="submit" className="rounded-full bg-verde-escuro px-6 py-3 text-sm font-medium text-white transition hover:opacity-90">
            Confirmar meu e-mail
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
