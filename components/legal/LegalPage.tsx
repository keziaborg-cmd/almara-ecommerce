/**
 * Renderizador comum das páginas legais.
 *
 * Os documentos legais são longos e mudam por texto, não por layout — mantê-los como dado
 * estruturado evita reescrever JSX a cada revisão jurídica e garante que as quatro páginas
 * fiquem visualmente idênticas entre si.
 *
 * Segue o padrão visual que `app/privacidade/page.tsx` já usava.
 */
import Link from "next/link";
import type { ReactNode } from "react";

export type LegalBlock =
  | { t: "p"; text: string }
  | { t: "strong"; text: string }
  | { t: "h3"; text: string }
  | { t: "li"; text: string }
  | { t: "kv"; k: string; v: string }
  | { t: "table"; head: string[]; rows: string[][] };

export type LegalSection = {
  title: string;
  blocks: LegalBlock[];
};

/**
 * Os documentos usam `**negrito**` no meio de frases longas — a ênfase é jurídica
 * (prazos, "não é necessário justificativa"), então precisa sobreviver à conversão.
 */
function Rico({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).map((parte, i) => {
        if (parte.startsWith("**") && parte.endsWith("**")) {
          return (
            <strong key={i} className="font-medium text-verde-escuro">
              {parte.slice(2, -2)}
            </strong>
          );
        }
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(parte);
        if (link) {
          return (
            <Link key={i} href={link[2]} className="text-verde-escuro underline underline-offset-4">
              {link[1]}
            </Link>
          );
        }
        return parte;
      })}
    </>
  );
}

function Bloco({ b }: { b: LegalBlock }) {
  switch (b.t) {
    case "strong":
      return (
        <p className="rounded-xl border border-verde-escuro/15 bg-verde-escuro/[0.04] p-4 font-medium leading-relaxed text-verde-escuro">
          <Rico text={b.text} />
        </p>
      );
    case "h3":
      return <h3 className="mt-2 font-medium text-verde-escuro">{b.text}</h3>;
    case "li":
      return (
        <p className="flex gap-2 leading-relaxed text-tinta/80">
          <span aria-hidden className="text-tinta/40">
            •
          </span>
          <span>
            <Rico text={b.text} />
          </span>
        </p>
      );
    case "kv":
      return (
        <p className="flex flex-col gap-1 leading-relaxed text-tinta/80 sm:flex-row sm:gap-3">
          <span className="shrink-0 font-medium text-verde-escuro sm:w-40">{b.k}</span>
          <span>
          <Rico text={b.v} />
        </span>
        </p>
      );
    case "table":
      return (
        // tabelas legais têm colunas longas; o scroll horizontal próprio evita que a página
        // inteira role de lado no celular
        <div className="-mx-2 overflow-x-auto px-2">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr>
                {b.head.map((h) => (
                  <th key={h} className="border-b border-verde-escuro/20 py-2 pr-4 font-medium text-verde-escuro">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j} className="border-b border-verde-escuro/10 py-2 pr-4 align-top text-tinta/80">
                      <Rico text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return (
        <p className="leading-relaxed text-tinta/80">
          <Rico text={b.text} />
        </p>
      );
  }
}

export function LegalPage({
  eyebrow = "Legal",
  title,
  updated,
  intro,
  sections,
  related,
  topo,
  children,
}: {
  eyebrow?: string;
  title: string;
  updated?: string;
  intro?: string[];
  sections: LegalSection[];
  related?: { href: string; label: string }[];
  /** Linhas logo abaixo do título, antes da introdução (ex.: razão social e CNPJ). */
  topo?: { k: string; v: string }[];
  children?: ReactNode;
}) {
  return (
    <main className="animate-pagein px-[6vw] py-14">
      <div className="mx-auto max-w-[760px]">
        <p className="eyebrow text-eyebrow-claro">{eyebrow}</p>
        <h1 className="mt-3 font-display text-[clamp(38px,6vw,56px)] text-verde-escuro">{title}</h1>
        {updated ? <p className="mt-4 text-sm text-tinta/60">Última atualização: {updated}</p> : null}

        {topo?.length ? (
          <div className="mt-6 flex flex-col gap-2 rounded-xl border border-verde-escuro/15 bg-verde-escuro/[0.04] p-4">
            {topo.map((l) => (
              <Bloco key={l.k} b={{ t: "kv", k: l.k, v: l.v }} />
            ))}
          </div>
        ) : null}

        {intro?.map((p) => (
          <p key={p} className="mt-6 leading-relaxed text-tinta/80">
            <Rico text={p} />
          </p>
        ))}

        {children}

        <div className="mt-10 flex flex-col gap-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-2xl text-verde-escuro">{section.title}</h2>
              <div className="mt-3 flex flex-col gap-3">
                {section.blocks.map((b, i) => (
                  <Bloco key={i} b={b} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {related?.length ? (
          <div className="mt-12 border-t border-verde-escuro/15 pt-6">
            <p className="text-sm text-tinta/60">Documentos relacionados</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
              {related.map((r) => (
                <Link key={r.href} href={r.href} className="text-sm text-verde-escuro underline underline-offset-4">
                  {r.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
