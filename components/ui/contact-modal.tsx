"use client";

import { useUIStore } from "@/lib/ui/ui-store";
import { useEffect } from "react";
import { buildWhatsAppLink } from "@/lib/whatsapp/link";
import { track } from "@/lib/crm/tracker";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";

export function ContactModal() {
  const open = useUIStore((s) => s.contactOpen);
  const setOpen = useUIStore((s) => s.setContactOpen);
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "ola@almara.com.br";

  useEffect(() => {
    if (open) track("contact_viewed", { via: "modal" });
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(20,32,20,.55)] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-[440px] rounded-panel bg-creme p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl text-verde-escuro">Fale com a gente</h2>
          <button
            aria-label="Fechar"
            onClick={() => setOpen(false)}
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-borda-clara text-lg text-verde-escuro"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-3.5 rounded-input border border-borda-clara-2 bg-white px-[18px] py-[15px] hover:border-dourado"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-sucesso-bg text-[19px] text-verde-folha">
              ✉
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-extrabold text-verde-escuro">E-mail</span>
              <span className="block text-sm text-tinta/70">{email}</span>
            </span>
          </a>
          <a
            href={buildWhatsAppLink("Olá! Vim pelo site da Almara e queria falar com vocês.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3.5 rounded-input border border-borda-clara-2 bg-white px-[18px] py-[15px] hover:border-dourado"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#dff5e6] text-[19px] text-[#0f7a37]">
              ✆
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-extrabold text-verde-escuro">WhatsApp</span>
              <span className="block text-sm text-tinta/70">Atendimento em horário comercial</span>
            </span>
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3.5 rounded-input border border-borda-clara-2 bg-white px-[18px] py-[15px] hover:border-dourado"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#f3e0dd] text-[19px] text-vinho">
              ◎
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-extrabold text-verde-escuro">Instagram</span>
              <span className="block text-sm text-tinta/70">@{INSTAGRAM_HANDLE}</span>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
