import type { Metadata } from "next";
import Link from "next/link";
import { confirmNewsletter } from "./actions";

export const metadata: Metadata = {
  title: "Confirmar inscrição — Almara",
  description: "Confirme sua inscrição na newsletter da Almara.",
  robots: { index: false, follow: false },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function Page({ searchParams }: { searchParams: Promise<{ t?: string; ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const valid = Boolean(sp.t && UUID_RE.test(sp.t));

  return (
    <main className="mx-auto max-w-xl px-5 py-16 sm:py-24">
      <p className="text-sm font-medium uppercase tracking-wide text-tinta/55">Newsletter</p>
      <h1 className="mt-2 font-display text-4xl text-verde-escuro">Confirmar inscrição</h1>

      {sp.ok ? (
        <div role="status" className="mt-6 space-y-3 leading-relaxed text-tinta/80">
          <p>Pronto, inscrição confirmada. Você vai receber nossos conteúdos por e-mail.</p>
          <p>
            Pode sair quando quiser pelo link &quot;Cancelar inscrição&quot; que vai em toda mensagem.
          </p>
          <p>
            <Link href="/produtos" className="underline underline-offset-2">
              Ver os chás
            </Link>
          </p>
        </div>
      ) : sp.erro === "link" || (!valid && !sp.erro) ? (
        <p className="mt-6 leading-relaxed text-tinta/80">
          Este link de confirmação não é válido ou já foi usado. Se quiser se inscrever, é só deixar seu e-mail de novo no site.
        </p>
      ) : (
        <form action={confirmNewsletter} className="mt-6 space-y-4">
          <input type="hidden" name="t" value={sp.t} />
          <p className="leading-relaxed text-tinta/80">
            Confirme pra receber os conteúdos da Almara por e-mail. Você pode sair quando quiser.
          </p>
          {sp.erro === "falha" && (
            <p role="alert" className="text-sm text-red-700">
              Não deu certo agora. Tente de novo em alguns instantes.
            </p>
          )}
          <button type="submit" className="rounded-full bg-verde-escuro px-6 py-3 text-sm font-medium text-white transition hover:opacity-90">
            Confirmar inscrição
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
