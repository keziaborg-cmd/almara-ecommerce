"use client";

import { useEffect, useRef, useState, type InputHTMLAttributes } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCartStore,
  selectCartLines,
  selectCartUnits,
  selectCartTier,
  selectSubtotalCents,
  formatCentsBRL,
  cartSnapshot,
} from "@/lib/cart/cart-store";
import { lookupCep } from "@/lib/cep/lookup";
import {
  chargedShippingCents,
  formatDeliveryDays,
  FREE_SHIPPING_MIN_CENTS,
  type ShippingQuoteOption,
} from "@/lib/cart/shipping-rules";
import { applyCoupon, isValidCoupon, normalizeCouponCode, type CouponCode } from "@/lib/cart/coupons";
import { PaymentBrick, type PixPending } from "@/components/checkout/payment-brick";
import { PixQrCode } from "@/components/checkout/pix-qr-code";
import { StepBadge } from "@/components/checkout/step-badge";
import { trackBeginCheckout } from "@/lib/tracking/events";
import { getTrackingIds, track } from "@/lib/crm/tracker";

function Field({
  label,
  wide,
  ...inputProps
}: { label: string; wide?: boolean } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label className="mb-1.5 block text-xs font-bold tracking-[.02em] text-[#4a5544]">{label}</label>
      <input
        {...inputProps}
        className="w-full rounded-input border border-borda-clara-2 bg-input-bg px-4 py-3 text-sm"
      />
    </div>
  );
}

interface FormState {
  nome: string;
  email: string;
  telefone: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
}

const EMPTY_FORM: FormState = {
  nome: "",
  email: "",
  telefone: "",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
};

// Muda quando o texto dos opt-ins mudar — vai junto de cada consentimento gravado no CRM, pra
// sempre dar pra saber exatamente o que a pessoa aceitou.
const MARKETING_CONSENT_TEXT_VERSION = "checkout-2026-10-07";

const ADDRESS_FIELDS = ["cep", "rua", "numero", "bairro", "cidade", "uf"] as const;

function looksLikeEmail(v: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());
}

interface QuoteResult {
  key: string;
  options: ShippingQuoteOption[];
  message?: string;
}

interface OrderDraft {
  orderNumber: string;
  accessToken: string;
  preferenceId: string;
  amount: number;
}

export default function CarrinhoPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);

  const [hydrated, setHydrated] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- see components/nav/nav.tsx
  useEffect(() => setHydrated(true), []);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [quoteNonce, setQuoteNonce] = useState(0);
  const [cepLoading, setCepLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderDraft, setOrderDraft] = useState<OrderDraft | null>(null);
  const [pixPending, setPixPending] = useState<PixPending | null>(null);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponCode | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [marketingConsent, setMarketingConsent] = useState({ email: false, whatsapp: false, sms: false });
  const sentIdentity = useRef({ email: "", phone: "" });
  const addressTracked = useRef({ started: false, completed: false });
  const cartViewTracked = useRef(false);

  const lines = hydrated ? selectCartLines(items) : [];
  const cartUnits = selectCartUnits(items);
  const cartTier = selectCartTier(items);
  const rawSubtotalCents = selectSubtotalCents(items);

  // Frete: cotado no Melhor Envio (função shop-calculate-shipping) pelo CEP e pelos itens. O
  // resultado guarda a chave da consulta; "carregando" é a chave atual ainda não ter resposta.
  const cepDigits = form.cep.replace(/\D/g, "");
  const quoteKey =
    hydrated && cepDigits.length === 8 && lines.length > 0
      ? `${cepDigits}|${lines.map((l) => `${l.slug}:${l.qty}`).join(",")}|${quoteNonce}`
      : null;
  const shippingLoading = quoteKey !== null && quote?.key !== quoteKey;
  const currentQuote = quoteKey !== null && quote?.key === quoteKey ? quote : null;
  const shippingOptions = currentQuote?.options ?? [];
  const selectedShipping =
    shippingOptions.find((o) => o.serviceId === selectedServiceId) ?? shippingOptions[0] ?? null;
  const rawShippingFeeCents = selectedShipping?.priceCents ?? 0;
  // O desconto exibido aqui é só preview — o backend recalcula e valida o
  // código de novo em shop-create-order, nunca confia no total do cliente.
  const { subtotalCents, shippingFeeCents: couponShippingFeeCents } = appliedCoupon
    ? applyCoupon(appliedCoupon, rawSubtotalCents, rawShippingFeeCents)
    : { subtotalCents: rawSubtotalCents, shippingFeeCents: rawShippingFeeCents };
  const shippingFeeCents = chargedShippingCents(couponShippingFeeCents, subtotalCents);
  const totalCents = subtotalCents + shippingFeeCents;
  const freeShippingMissingCents = FREE_SHIPPING_MIN_CENTS - subtotalCents;

  useEffect(() => {
    if (quoteKey === null) return;
    let cancelled = false;
    // Espera um instante pra não consultar a cada clique no +/− do carrinho.
    const timer = setTimeout(async () => {
      let result: QuoteResult;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/shop-calculate-shipping`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "" },
          body: JSON.stringify({ cep: cepDigits, items: lines.map((l) => ({ slug: l.slug, qty: l.qty })) }),
        });
        const data = await res.json().catch(() => null);
        if (res.ok && Array.isArray(data?.options)) {
          result = { key: quoteKey, options: data.options };
        } else if (data?.code === "no_options") {
          result = { key: quoteKey, options: [], message: "Não encontramos opções de entrega para este CEP." };
        } else {
          result = { key: quoteKey, options: [], message: data?.message ?? "Não foi possível calcular o frete agora. Tente novamente." };
        }
      } catch {
        result = { key: quoteKey, options: [], message: "Falha de conexão ao calcular o frete. Tente novamente." };
      }
      if (!cancelled) setQuote(result);
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // lines/cepDigits entram na chave; refazer só quando a chave muda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteKey]);

  useEffect(() => {
    if (!hydrated || cartViewTracked.current || lines.length === 0) return;
    cartViewTracked.current = true;
    track("cart_viewed", { cart: cartSnapshot(items) });
  }, [hydrated, lines.length, items]);

  function knownIdentity() {
    return {
      email: looksLikeEmail(form.email) ? form.email : undefined,
      phone: form.telefone || undefined,
      personName: form.nome || undefined,
    };
  }

  function handleEmailBlur() {
    const email = form.email.trim();
    if (!looksLikeEmail(email) || sentIdentity.current.email === email.toLowerCase()) return;
    sentIdentity.current.email = email.toLowerCase();
    track("email_submitted", { step: "checkout", cart: cartSnapshot(items) }, { email, personName: form.nome });
  }

  function handlePhoneBlur() {
    const digits = form.telefone.replace(/\D/g, "");
    if (digits.length < 10 || sentIdentity.current.phone === digits) return;
    sentIdentity.current.phone = digits;
    track("phone_submitted", { step: "checkout" }, { ...knownIdentity(), phone: form.telefone });
  }

  function handleAddressFocus() {
    if (addressTracked.current.started) return;
    addressTracked.current.started = true;
    track("address_started", { step: "checkout" }, knownIdentity());
  }

  function handleAddressBlur() {
    if (addressTracked.current.completed) return;
    if (!ADDRESS_FIELDS.every((k) => form[k].trim())) return;
    addressTracked.current.completed = true;
    track("address_completed", { city: form.cidade, uf: form.uf }, knownIdentity());
  }

  function handleApplyCoupon() {
    const normalized = normalizeCouponCode(couponInput);
    if (!normalized) {
      setCouponError("Digite um código.");
      return;
    }
    if (!isValidCoupon(normalized)) {
      setCouponError("Código inválido.");
      return;
    }
    setAppliedCoupon(normalized);
    setCouponError(null);
    const discounted = applyCoupon(normalized, rawSubtotalCents, rawShippingFeeCents);
    track(
      "coupon_applied",
      {
        coupon: normalized,
        discount_cents: rawSubtotalCents - discounted.subtotalCents + (rawShippingFeeCents - discounted.shippingFeeCents),
      },
      knownIdentity(),
    );
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  }

  const tierHint =
    cartTier === 1
      ? "Adicione mais 1 chá (qualquer sabor) e o preço de todas as unidades cai."
      : cartTier === 2
        ? "Adicione mais 1 chá (qualquer sabor) e desbloqueia o maior desconto."
        : "Você está no maior desconto — preço por unidade já é o menor da faixa.";

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleCepBlur() {
    const digits = form.cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    const result = await lookupCep(form.cep);
    setCepLoading(false);
    if (!result) return;
    setForm((f) => ({
      ...f,
      rua: result.logradouro || f.rua,
      bairro: result.bairro || f.bairro,
      cidade: result.localidade || f.cidade,
      uf: result.uf || f.uf,
    }));
  }

  async function handleFinalizarCompra() {
    setError(null);
    if (!form.nome || !form.email || !form.telefone || !form.cep || !form.rua || !form.numero || !form.bairro || !form.cidade || !form.uf) {
      setError("Preencha todos os campos obrigatórios de entrega.");
      return;
    }
    if (!selectedShipping) {
      setError("Escolha uma opção de entrega para finalizar a compra.");
      return;
    }
    if (!acceptedPrivacy) {
      setError("Você precisa aceitar a Política de Privacidade para finalizar a compra.");
      return;
    }

    setSubmitting(true);
    trackBeginCheckout({
      valueCents: totalCents,
      items: lines.map((l) => ({ slug: l.slug, qty: l.qty })),
    });
    track(
      "checkout_started",
      {
        cart: cartSnapshot(items),
        subtotal_cents: subtotalCents,
        discount_cents: rawSubtotalCents - subtotalCents + (rawShippingFeeCents - shippingFeeCents),
        shipping_cents: shippingFeeCents,
        total_cents: totalCents,
        coupon: appliedCoupon,
      },
      knownIdentity(),
    );

    try {
      const functionsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/shop-create-order`;
      const res = await fetch(functionsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
        },
        body: JSON.stringify({
          customer: { nome: form.nome, email: form.email, telefone: form.telefone },
          shipping: {
            cep: form.cep,
            rua: form.rua,
            numero: form.numero,
            complemento: form.complemento,
            bairro: form.bairro,
            cidade: form.cidade,
            uf: form.uf,
            serviceId: selectedShipping.serviceId,
          },
          items: lines.map((l) => ({ slug: l.slug, qty: l.qty })),
          couponCode: appliedCoupon ?? undefined,
          tracking: getTrackingIds(),
          consents: { ...marketingConsent, textVersion: MARKETING_CONSENT_TEXT_VERSION },
        }),
      });
      if (!res.ok) {
        let message = `Não foi possível criar o pedido (erro ${res.status}). Tente novamente.`;
        try {
          const data = await res.json();
          if (data?.message) message = data.message;
          // A opção escolhida deixou de existir (ou o frete mudou): recota e deixa escolher de novo.
          if (data?.code === "shipping_service_unavailable") {
            setSelectedServiceId(null);
            setQuoteNonce((n) => n + 1);
          }
        } catch {
          // resposta de erro não veio em JSON (ex: página de erro do servidor) —
          // mantém a mensagem com o status HTTP em vez de mascarar como falha de rede.
        }
        setError(message);
        setSubmitting(false);
        return;
      }
      const data = await res.json();
      setOrderDraft(data);
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (hydrated && lines.length === 0 && !orderDraft) {
    return (
      <main className="animate-pagein px-[6vw] py-20 text-center">
        <p className="font-display text-2xl text-verde-escuro">Seu carrinho está vazio.</p>
        <Link href="/produtos" className="mt-4 inline-block font-semibold text-verde-folha hover:underline">
          Escolha um chá
        </Link>
      </main>
    );
  }

  return (
    <main className="animate-pagein px-[6vw] py-10">
      <div className="mx-auto max-w-[1200px] xl:max-w-[1360px] 2xl:max-w-[1560px]">
        <p className="eyebrow text-eyebrow-claro">Finalizar pedido</p>
        <h1 className="mt-2 font-display text-[clamp(38px,6vw,64px)] text-verde-escuro">Seu carrinho</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_.9fr]">
          <div className="flex flex-col gap-6">
            <section className="rounded-card-conteudo border border-borda-clara bg-white p-7">
              <div className="mb-5 flex items-center gap-3">
                <StepBadge n={1} />
                <h2 className="font-display text-xl text-verde-escuro">Dados de entrega</h2>
              </div>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <Field wide label="Nome completo" placeholder="Seu nome" value={form.nome} onChange={(e) => updateField("nome", e.target.value)} />
                <Field wide label="E-mail" type="email" placeholder="voce@email.com" value={form.email} onChange={(e) => updateField("email", e.target.value)} onBlur={handleEmailBlur} />
                <Field label="Telefone" placeholder="(00) 00000-0000" value={form.telefone} onChange={(e) => updateField("telefone", e.target.value)} onBlur={handlePhoneBlur} />
                <div>
                  <Field
                    label="CEP"
                    placeholder="00000-000"
                    value={form.cep}
                    onChange={(e) => updateField("cep", e.target.value)}
                    onFocus={handleAddressFocus}
                    onBlur={() => {
                      handleCepBlur();
                      handleAddressBlur();
                    }}
                  />
                  {cepLoading && <span className="mt-1.5 block text-xs text-eyebrow-claro">Buscando CEP…</span>}
                </div>
                <Field wide label="Endereço" placeholder="Rua / Avenida" value={form.rua} onChange={(e) => updateField("rua", e.target.value)} onFocus={handleAddressFocus} onBlur={handleAddressBlur} />
                <Field label="Número" placeholder="Nº" value={form.numero} onChange={(e) => updateField("numero", e.target.value)} onFocus={handleAddressFocus} onBlur={handleAddressBlur} />
                <Field label="Complemento" placeholder="Apto, bloco (opcional)" value={form.complemento} onChange={(e) => updateField("complemento", e.target.value)} onFocus={handleAddressFocus} onBlur={handleAddressBlur} />
                <Field wide label="Bairro" placeholder="Bairro" value={form.bairro} onChange={(e) => updateField("bairro", e.target.value)} onFocus={handleAddressFocus} onBlur={handleAddressBlur} />
                <Field label="Cidade" placeholder="Cidade" value={form.cidade} onChange={(e) => updateField("cidade", e.target.value)} onFocus={handleAddressFocus} onBlur={handleAddressBlur} />
                <Field label="UF" placeholder="UF" maxLength={2} value={form.uf} onChange={(e) => updateField("uf", e.target.value)} onFocus={handleAddressFocus} onBlur={handleAddressBlur} />
              </div>
            </section>

            <section className="rounded-card-conteudo border border-borda-clara bg-white p-7">
              <div className="mb-4 flex items-center gap-3">
                <StepBadge n={2} />
                <h2 className="font-display text-xl text-verde-escuro">Método de envio</h2>
              </div>
              {quoteKey === null ? (
                <p className="rounded-input border border-dashed border-borda-clara-2 bg-input-bg px-4 py-4 text-sm text-tinta/60">
                  Informe o CEP para calcular o frete.
                </p>
              ) : shippingLoading ? (
                <p role="status" className="rounded-input border border-borda-clara-2 bg-input-bg px-4 py-4 text-sm text-tinta/60">
                  Calculando o frete…
                </p>
              ) : shippingOptions.length === 0 ? (
                <div className="rounded-input border border-borda-clara-2 bg-input-bg px-4 py-4 text-sm text-tinta/70">
                  <p role="alert">{currentQuote?.message ?? "Não foi possível calcular o frete."}</p>
                  <button
                    type="button"
                    onClick={() => setQuoteNonce((n) => n + 1)}
                    className="mt-2 font-semibold text-verde-folha hover:underline"
                  >
                    Tentar de novo
                  </button>
                </div>
              ) : (
                <div role="radiogroup" aria-label="Opções de entrega" className="flex flex-col gap-2.5">
                  {shippingOptions.map((opt) => {
                    const active = opt.serviceId === selectedShipping?.serviceId;
                    const optFee = chargedShippingCents(
                      appliedCoupon ? applyCoupon(appliedCoupon, rawSubtotalCents, opt.priceCents).shippingFeeCents : opt.priceCents,
                      subtotalCents,
                    );
                    return (
                      <button
                        key={opt.serviceId}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        disabled={!!orderDraft}
                        onClick={() => setSelectedServiceId(opt.serviceId)}
                        className={`flex items-center gap-3.5 rounded-input border-2 bg-input-bg px-[18px] py-[15px] text-left ${active ? "border-verde-folha" : "border-borda-clara-2"}`}
                      >
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${active ? "border-verde-folha" : "border-borda-clara-2"}`}>
                          {active && <span className="h-2.5 w-2.5 rounded-full bg-verde-folha" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px] font-extrabold text-verde-escuro">
                            {opt.company ? `${opt.company} ${opt.name}` : opt.name}
                          </span>
                          <span className="block text-xs text-eyebrow-claro">Chega em até {formatDeliveryDays(opt.deliveryDays)}</span>
                        </span>
                        <span className="text-[15px] font-extrabold text-verde-folha">
                          {optFee === 0 ? "Grátis" : formatCentsBRL(optFee)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="mt-3 text-xs text-eyebrow-claro">
                {freeShippingMissingCents > 0
                  ? `Frete grátis em compras a partir de ${formatCentsBRL(FREE_SHIPPING_MIN_CENTS)} (faltam ${formatCentsBRL(freeShippingMissingCents)}).`
                  : "Você ganhou frete grátis nesta compra."}
              </p>
            </section>

            <section className="rounded-card-conteudo border border-borda-clara bg-white p-7">
              <div className="mb-4 flex items-center gap-3">
                <StepBadge n={3} />
                <h2 className="font-display text-xl text-verde-escuro">Pagamento</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Pix", "Cartão de crédito/débito", "Boleto"].map((chip) => (
                  <span key={chip} className="rounded-pill bg-sucesso-bg px-3.5 py-1.5 text-[13px] font-bold text-verde-folha">
                    {chip}
                  </span>
                ))}
              </div>
              <div className="mt-4">
                {orderDraft && pixPending ? (
                  <PixQrCode
                    qrCode={pixPending.qrCode}
                    qrCodeBase64={pixPending.qrCodeBase64}
                    expiresAt={pixPending.expiresAt}
                    orderNumber={orderDraft.orderNumber}
                    accessToken={orderDraft.accessToken}
                    onConfirmed={() => {
                      useCartStore.getState().clear();
                      router.push(`/pedido/${orderDraft.orderNumber}?token=${orderDraft.accessToken}`);
                    }}
                    onRetry={() => setPixPending(null)}
                  />
                ) : orderDraft ? (
                  <PaymentBrick
                    orderNumber={orderDraft.orderNumber}
                    accessToken={orderDraft.accessToken}
                    amount={orderDraft.amount}
                    preferenceId={orderDraft.preferenceId}
                    payerEmail={form.email}
                    onApproved={() => {
                      useCartStore.getState().clear();
                      router.push(`/pedido/${orderDraft.orderNumber}?token=${orderDraft.accessToken}`);
                    }}
                    onPixPending={(pix) => setPixPending(pix)}
                    onError={(message) => setError(message)}
                  />
                ) : (
                  <div className="flex min-h-[230px] flex-col items-center justify-center rounded-input border border-dashed border-borda-clara-2 bg-input-bg p-6 text-center text-sm text-tinta/60">
                    Preencha os dados de entrega e clique em &ldquo;Finalizar compra&rdquo; para carregar o
                    pagamento (Payment Brick do Mercado Pago).
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-panel bg-verde-escuro p-7 lg:sticky lg:top-24">
            <div className="flex flex-col gap-4">
              {hydrated && cartUnits > 0 && (
                <div className="rounded-input bg-dourado/15 px-4 py-3">
                  <span className="text-xs font-bold uppercase tracking-[.08em] text-dourado">
                    {cartTier === 1 ? "Preço avulso" : cartTier === 2 ? "Desconto de 2 unidades" : "Maior desconto ativo"}
                  </span>
                  <p className="mt-1 text-xs text-texto-sobre-escuro-2">{tierHint}</p>
                </div>
              )}
              {lines.map((line) => (
                <div key={line.slug} className="flex items-center justify-between gap-2 text-sm text-creme">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{line.name}</p>
                    <p className="text-texto-sobre-escuro-2">{formatCentsBRL(line.unitPriceCents)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button onClick={() => setQty(line.slug, line.qty - 1)} className="h-6 w-6 shrink-0 rounded-full bg-creme/15">
                      −
                    </button>
                    <span className="w-4 shrink-0 text-center">{line.qty}</span>
                    <button onClick={() => setQty(line.slug, line.qty + 1)} className="h-6 w-6 shrink-0 rounded-full bg-creme/15">
                      +
                    </button>
                  </div>
                  <span className="w-14 shrink-0 text-right">{formatCentsBRL(line.subtotalCents)}</span>
                  <button onClick={() => remove(line.slug)} aria-label={`Remover ${line.name}`} className="shrink-0 text-creme/50 hover:text-creme">
                    ✕
                  </button>
                </div>
              ))}

              {!orderDraft && (
                <div className="mt-2 border-t border-creme/15 pt-4">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between rounded-input bg-creme/10 px-3.5 py-2.5 text-sm text-creme">
                      <span>
                        Código <strong>{appliedCoupon}</strong> aplicado
                      </span>
                      <button
                        onClick={handleRemoveCoupon}
                        aria-label="Remover código de desconto"
                        className="shrink-0 text-creme/50 hover:text-creme"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          setCouponError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        placeholder="Código de desconto"
                        className="w-full min-w-0 rounded-input border border-creme/20 bg-creme/10 px-3.5 py-2.5 text-sm text-creme placeholder:text-creme/40"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="shrink-0 rounded-input bg-creme/15 px-4 py-2.5 text-sm font-semibold text-creme hover:bg-creme/25"
                      >
                        Aplicar
                      </button>
                    </div>
                  )}
                  {couponError && <p className="mt-1.5 text-xs text-red-300">{couponError}</p>}
                </div>
              )}

              <div className="mt-2 flex flex-col gap-2 border-t border-creme/15 pt-4 text-sm text-texto-sobre-escuro">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCentsBRL(subtotalCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span>
                    {selectedShipping
                      ? shippingFeeCents === 0
                        ? "Grátis"
                        : formatCentsBRL(shippingFeeCents)
                      : shippingLoading
                        ? "Calculando…"
                        : "Informe o CEP"}
                  </span>
                </div>
                <div className="flex justify-between font-display text-xl text-creme">
                  <span>Total</span>
                  <span>{formatCentsBRL(totalCents)}</span>
                </div>
              </div>

              {!orderDraft && (
                <label className="mt-2 flex items-start gap-2.5 text-xs text-texto-sobre-escuro-2">
                  <input
                    type="checkbox"
                    checked={acceptedPrivacy}
                    onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-dourado"
                  />
                  <span>
                    Li e aceito a{" "}
                    <Link href="/politica-de-privacidade" target="_blank" className="font-semibold text-dourado hover:underline">
                      Política de Privacidade
                    </Link>{" "}
                    e autorizo o uso dos meus dados para processar este pedido.
                  </span>
                </label>
              )}

              {!orderDraft && (
                <fieldset className="text-xs text-texto-sobre-escuro-2">
                  <legend className="mb-1.5">Quero receber novidades e ofertas da Almara por (opcional):</legend>
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                    {(
                      [
                        ["email", "E-mail"],
                        ["whatsapp", "WhatsApp"],
                        ["sms", "SMS"],
                      ] as const
                    ).map(([channel, label]) => (
                      <label key={channel} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={marketingConsent[channel]}
                          onChange={(e) => setMarketingConsent((c) => ({ ...c, [channel]: e.target.checked }))}
                          className="h-4 w-4 shrink-0 accent-dourado"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  <p className="mt-1.5 opacity-80">Não é necessário para concluir a compra. Você pode cancelar quando quiser.</p>
                </fieldset>
              )}

              {error && <p className="text-sm text-red-300">{error}</p>}

              {!orderDraft && (
                <button
                  onClick={handleFinalizarCompra}
                  disabled={submitting || lines.length === 0 || shippingLoading || !selectedShipping}
                  className="mt-2 rounded-pill bg-dourado px-6 py-3.5 text-sm font-bold text-verde-escuro disabled:opacity-60"
                >
                  {submitting ? "Processando…" : `Finalizar compra · ${formatCentsBRL(totalCents)}`}
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
