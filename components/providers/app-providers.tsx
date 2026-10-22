"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart/cart-store";
import { Toast } from "@/components/ui/toast";
import { ContactModal } from "@/components/ui/contact-modal";
import { CookieBanner } from "@/components/consent/cookie-banner";
import { WhatsAppWidget } from "@/components/whatsapp/whatsapp-widget";
import { CrmTracker } from "@/components/crm/crm-tracker";
import { NewsletterPopup } from "@/components/newsletter/newsletter-popup";
import { migrateLegacyStorage } from "@/lib/storage-keys";

// Cart persistence uses skipHydration (see lib/cart/cart-store.ts) so the
// server-rendered markup never disagrees with what's actually in
// localStorage — rehydrate explicitly once we're on the client.
export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    migrateLegacyStorage(); // carrinho salvo com o nome antigo, antes do rebrand
    useCartStore.persist.rehydrate();
  }, []);

  return (
    <>
      {children}
      <Toast />
      <ContactModal />
      <WhatsAppWidget />
      <CookieBanner />
      <NewsletterPopup />
      <CrmTracker />
    </>
  );
}
