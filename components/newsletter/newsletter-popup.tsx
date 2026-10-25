"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useConsentStore } from "@/lib/consent/consent";
import { track } from "@/lib/crm/tracker";

// Pop-up da newsletter com o cupom de primeira compra (função newsletter-subscribe).
//   - aparece depois de 20 s no site, ou antes se o mouse for sair da página (só em computador);
//   - espera a escolha de cookies (nunca por cima do banner);
//   - nunca no carrinho, no pedido, no quiz nem nas páginas legais;
//   - fechou: volta só depois de 14 dias; assinou: não volta mais (neste navegador).

const STORAGE_KEY = "almara-newsletter";
const DELAY_MS = 20_000;
const SNOOZE_DAYS = 14;
const CONSENT_TEXT_VERSION = "popup-newsletter-2026-10-23";
const HIDDEN_ON = ["/carrinho", "/pedido", "/quiz", "/termos-de-uso", "/politica-", "/suporte", "/excluir-conta", "/descadastro"];

type Stored = { s: "dismissed" | "subscribed"; at: string };

function readStored(): Stored | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}

function writeStored(s: Stored["s"]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ s, at: new Date().toISOString() }));
  } catch {
    // navegação privada / armazenamento bloqueado: o pop-up só volta a aparecer, sem problema
  }
}

function shouldOffer(): boolean {
  const st = readStored();
  if (!st) return true;
  if (st.s === "subscribed") return false;
  const age = Date.now() - new Date(st.at).getTime();
  return !(age >= 0 && age < SNOOZE_DAYS * 86_400_000);
}

export function NewsletterPopup() {
  const pathname = usePathname();
  const consentDecided = useConsentStore((s) => s.loaded && s.choice !== null && !s.panelOpen);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [coupon, setCoupon] = useState<{ code: string; percentOff: number } | null>(null);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const shownRef = useRef(false);

  const hiddenHere = HIDDEN_ON.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (!consentDecided || hiddenHere || shownRef.current || !shouldOffer()) return;
    const show = (trigger: "timer" | "exit") => {
      if (shownRef.current) return;
      shownRef.current = true;
      setOpen(true);
      track("newsletter_popup_shown", { trigger });
    };
    const timer = window.setTimeout(() => show("timer"), DELAY_MS);
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const onMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY <= 0) show("exit");
    };
    if (finePointer) document.addEventListener("mouseout", onMouseOut);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, [consentDecided, hiddenHere]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // close só lê estado estável; registrar de novo a cada render não muda nada
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setOpen(false);
    if (!done) {
      writeStored("dismissed");
      track("newsletter_popup_dismissed", {});
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/newsletter-subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "" },
        body: JSON.stringify({ email: value, textVersion: CONSENT_TEXT_VERSION, source: "popup" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.subscribed) {
        setError(data?.message ?? "Não deu certo agora. Tente de novo em alguns minutos.");
        setStatus("error");
        return;
      }
      setCoupon(data.coupon ?? null);
      setDone(true);
      setStatus("idle");
      writeStored("subscribed");
    } catch {
      setError("Falha de conexão. Tente de novo.");
      setStatus("error");
    }
  }

  async function copyCode() {
    if (!coupon) return;
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // sem permissão de área de transferência: o código continua visível pra copiar à mão
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="newsletter-popup-title"
        onClick={(e) => e.stopPropagation()}
        className="relative grid w-full max-w-[640px] overflow-hidden rounded-panel bg-creme shadow-2xl sm:grid-cols-[200px_minmax(0,1fr)]"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Fechar"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-xl leading-none text-verde-escuro/70 hover:bg-verde-escuro/10 hover:text-verde-escuro"
        >
          ×
        </button>

        <div className="hidden items-center justify-center bg-[#e6ede0] px-4 sm:flex">
          <Image src="/mara-cha.png" alt="" width={3375} height={4219} sizes="180px" className="h-auto w-[170px]" />
        </div>

        <div className="p-6 sm:p-7">
          {!done ? (
            <>
              <span className="inline-block rounded-pill bg-dourado px-3 py-1 text-xs font-bold uppercase tracking-wide text-verde-escuro">
                10% na primeira compra
              </span>
              <p id="newsletter-popup-title" className="mt-3 pr-8 font-display text-3xl leading-tight text-verde-escuro">
                Seu primeiro chá com desconto
              </p>
              <p className="mt-2 text-sm leading-relaxed text-tinta/75">
                Entre na lista da Almara e ganhe 10% nos chás da sua primeira compra. De vez em quando, mandamos novidades,
                receitas e conteúdos sobre rituais de chá.
              </p>
              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2.5">
                <label htmlFor="newsletter-popup-email" className="sr-only">
                  Seu e-mail
                </label>
                <input
                  ref={inputRef}
                  id="newsletter-popup-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="voce@email.com"
                  className="w-full rounded-input border border-borda-clara-2 bg-white px-4 py-3 text-sm"
                />
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="rounded-pill bg-verde-escuro px-6 py-3 text-sm font-bold text-creme disabled:opacity-60"
                >
                  {status === "sending" ? "Enviando…" : "Quero meu cupom"}
                </button>
              </form>
              {error && (
                <p role="alert" className="mt-2 text-xs text-red-700">
                  {error}
                </p>
              )}
              <p className="mt-3 text-[11px] leading-snug text-tinta/55">
                Ao se inscrever, você aceita receber e-mails da Almara e pode sair quando quiser. Saiba mais na{" "}
                <Link href="/politica-de-privacidade" className="underline underline-offset-2">
                  Política de Privacidade
                </Link>
                .
              </p>
            </>
          ) : (
            <div role="status">
              <p id="newsletter-popup-title" className="pr-8 font-display text-3xl leading-tight text-verde-escuro">
                Quase lá!
              </p>
              {coupon ? (
                <>
                  <p className="mt-2 text-sm leading-relaxed text-tinta/75">
                    Use este código no carrinho e ganhe {coupon.percentOff}% nos chás da sua primeira compra:
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="flex-1 rounded-input border-2 border-dashed border-verde-escuro/40 px-4 py-3 text-center font-display text-2xl tracking-widest text-verde-escuro">
                      {coupon.code}
                    </span>
                    <button
                      type="button"
                      onClick={copyCode}
                      className="shrink-0 rounded-pill bg-verde-escuro px-5 py-3 text-sm font-bold text-creme"
                    >
                      {copied ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-tinta/60">
                    Mandamos um link pro seu e-mail: confirme pra entrar na lista. O cupom já vale, na primeira compra feita com este e-mail.
                  </p>
                  <Link
                    href="/produtos"
                    onClick={() => setOpen(false)}
                    className="mt-4 inline-block rounded-pill bg-dourado px-6 py-3 text-sm font-bold text-verde-escuro"
                  >
                    Ver os chás
                  </Link>
                </>
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-tinta/75">Mandamos um link pro seu e-mail: confirme pra entrar na lista.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
