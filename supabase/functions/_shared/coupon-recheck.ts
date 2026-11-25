import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { ruleFromCheck } from "./coupons.ts";

// O cupom é validado quando o pedido é criado, mas o limite (usos, por cliente, só 1ª compra)
// conta pedidos PAGOS — vários checkouts abertos com o mesmo cupom passariam todos. Por isso
// shop-process-payment confere de novo logo antes de cobrar: se outro pedido com o cupom já foi
// pago (ou o cupom foi desativado/expirou), este não é cobrado.
// Devolve null se pode cobrar, ou a mensagem pra mostrar ao comprador.
export async function couponBlockReason(
  supabase: SupabaseClient,
  order: { coupon_code: string | null; email: string },
  rawSubtotalCents: number,
): Promise<string | null> {
  if (!order.coupon_code) return null;
  const { data: check, error } = await supabase.rpc("shop_coupon_check", {
    p_code: order.coupon_code,
    p_email: order.email,
    p_subtotal_cents: rawSubtotalCents,
  });
  if (error) throw error;
  if (ruleFromCheck(check)) return null;
  const reason = (check as { reason?: unknown } | null)?.reason;
  return `${typeof reason === "string" ? reason : "Este cupom não está mais disponível."} Volte ao carrinho e refaça o pedido.`;
}
