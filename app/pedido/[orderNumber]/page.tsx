"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatCentsBRL } from "@/lib/cart/cart-store";
import { trackPurchase } from "@/lib/tracking/events";
import { ORDER_QR_PATH } from "@/lib/app-links";
import { readOrderToken, saveOrderToken } from "@/lib/order-access";

interface OrderStatus {
  orderNumber: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  totalCents: number;
  items: { name: string; qty: number; unitPriceCents: number }[];
  createdAt: string;
}

const STATUS_LABEL: Record<OrderStatus["status"], string> = {
  pending: "Processando pagamento",
  approved: "Aprovado",
  rejected: "Recusado",
  cancelled: "Cancelado",
};

export default function PedidoConfirmacaoPage() {
  const params = useParams<{ orderNumber: string }>();
  const searchParams = useSearchParams();
  const urlToken = searchParams.get("token");
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // o código do pedido fica guardado no navegador, não na URL (lib/order-access.ts)
    const token = urlToken ?? readOrderToken(params.orderNumber);
    if (urlToken && saveOrderToken(params.orderNumber, urlToken)) {
      const rest = new URLSearchParams(window.location.search);
      rest.delete("token");
      const q = rest.toString();
      window.history.replaceState(window.history.state, "", `${window.location.pathname}${q ? `?${q}` : ""}${window.location.hash}`);
    }
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time guard, not a render loop
      setError("Link de confirmação inválido.");
      return;
    }

    let cancelled = false;
    async function fetchOrder() {
      const functionsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/shop-get-order`;
      const res = await fetch(functionsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
        },
        body: JSON.stringify({ orderNumber: params.orderNumber, accessToken: token }),
      });
      if (!res.ok) {
        if (!cancelled) setError("Pedido não encontrado.");
        return;
      }
      const data: OrderStatus = await res.json();
      if (cancelled) return;
      setOrder(data);
      if (data.status === "approved") {
        trackPurchase({
          orderNumber: data.orderNumber,
          valueCents: data.totalCents,
          items: data.items.map((i) => ({ slug: i.name, qty: i.qty })),
        });
      }
    }

    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [params.orderNumber, urlToken]);

  if (error) {
    return (
      <main className="animate-pagein px-[6vw] py-20 text-center">
        <p className="text-tinta/70">{error}</p>
        <Link href="/" className="mt-4 inline-block font-semibold text-verde-folha hover:underline">
          Voltar ao início
        </Link>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="animate-pagein px-[6vw] py-20 text-center text-tinta/60">Carregando pedido…</main>
    );
  }

  return (
    <main className="animate-pagein px-[6vw] py-16">
      <div className="mx-auto max-w-xl rounded-panel bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sucesso-bg text-2xl text-sucesso-fg">
          ✓
        </div>
        <h1 className="mt-5 font-display text-3xl text-verde-escuro">Pedido confirmado!</h1>
        <p className="mt-2 text-tinta/70">Pedido {order.orderNumber}</p>

        <span
          className={`mt-4 inline-block rounded-pill px-4 py-1.5 text-sm font-semibold ${
            order.status === "approved"
              ? "bg-sucesso-bg text-sucesso-fg"
              : order.status === "rejected"
                ? "bg-red-100 text-red-700"
                : "bg-confirm-bg text-tinta"
          }`}
        >
          {STATUS_LABEL[order.status]}
        </span>

        <div className="mt-6 flex flex-col gap-2 text-left text-sm text-tinta/80">
          {order.items.map((item) => (
            <div key={item.name} className="flex justify-between">
              <span>
                {item.qty}× {item.name}
              </span>
              <span>{formatCentsBRL(item.unitPriceCents * item.qty)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-borda-clara pt-2 font-semibold text-tinta">
            <span>Total</span>
            <span>{formatCentsBRL(order.totalCents)}</span>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-6 rounded-card-conteudo bg-verde-escuro p-6 text-left text-creme">
          <div className="flex-1">
            <p className="eyebrow text-dourado">
              <span className="mr-2 rounded border border-dourado/40 px-1.5 py-0.5">APP</span>
              Próximo passo
            </p>
            <p className="mt-2 text-sm text-texto-sobre-escuro">
              Enquanto o chá não chega, já dá pra baixar o Almara+ e começar sua jornada de 21 dias — a
              Mara te espera lá, e o chá acompanha quando quiser.
            </p>
            {/* no celular não dá pra escanear a própria tela: lá vai um botão; no computador, o QR */}
            <a
              href={ORDER_QR_PATH}
              className="mt-4 inline-block rounded-pill bg-dourado px-6 py-3 text-sm font-semibold text-verde-escuro md:hidden"
            >
              Baixar o Almara+
            </a>
            <p className="mt-3 hidden text-xs text-texto-sobre-escuro/80 md:block">Aponte a câmera do celular para o código.</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático pequeno, sem otimização a fazer */}
          <img
            src="/almara-mais/qr-app.svg"
            alt="QR Code para baixar o app Almara+"
            width={132}
            height={132}
            className="hidden shrink-0 rounded-lg md:block"
          />
        </div>

        <Link
          href="/"
          className="mt-8 inline-block rounded-pill bg-verde-escuro px-8 py-3 text-sm font-semibold text-creme"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
