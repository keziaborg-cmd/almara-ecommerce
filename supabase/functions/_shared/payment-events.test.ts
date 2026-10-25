import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MpPayment } from "./mercadopago";

// As edge functions rodam em Deno; aqui só precisamos de Deno.env e de um fetch que nunca sai pra rede.
vi.stubGlobal("Deno", { env: { get: () => undefined } });
vi.stubGlobal("fetch", async () => {
  throw new Error("rede bloqueada no teste");
});

const { applyPaymentUpdate, paymentMatchesOrder } = await import("./payment-events");
const { buildPaymentBody, paymentIdempotencyKey } = await import("./mercadopago");

type Row = Record<string, unknown>;

// Supabase falso com o mínimo que applyPaymentUpdate usa. Os filtros do UPDATE são avaliados
// contra o estado atual da linha (como no Postgres); `staleRead` simula uma leitura antiga.
function fakeDb(initial: Row, staleRead?: Row) {
  const order: Row = { ...initial };
  const events: string[] = [];
  const client = {
    rpc: async (_fn: string, args: { p_name: string }) => {
      events.push(args.p_name);
      return { error: null };
    },
    from(table: string) {
      const filters: ((r: Row) => boolean)[] = [];
      let patch: Row | null = null;
      const q = {
        select: () => q,
        eq: (k: string, v: unknown) => (filters.push((r) => r[k] === v), q),
        is: (k: string, v: unknown) => (filters.push((r) => r[k] === v), q),
        or: (expr: string) => {
          const parts = expr.split(",").map((p) => {
            const [col, op, ...rest] = p.split(".");
            const val = rest.join(".");
            return (r: Row) => (op === "eq" ? String(r[col]) === val : String(r[col]) !== val);
          });
          filters.push((r) => parts.some((f) => f(r)));
          return q;
        },
        maybeSingle: async () => ({
          data: table === "shop_orders" && filters.every((f) => f(order)) ? { ...(staleRead ?? order) } : null,
          error: null,
        }),
        upsert: async () => ({ error: null }),
        update: (p: Row) => ((patch = p), q),
        then(resolve: (v: unknown) => void) {
          if (patch && table === "shop_orders" && filters.every((f) => f(order))) {
            Object.assign(order, patch);
            return resolve({ data: [{ id: order.id }], error: null });
          }
          return resolve({ data: [], error: null });
        },
      };
      return q;
    },
  };
  return { client: client as never, order, events };
}

const baseOrder: Row = {
  id: "ord-1",
  order_number: "ALM-000001",
  status: "pending",
  mp_payment_id: null,
  confirmed_at: null,
  customer_id: null,
  nome: "Compradora Teste",
  email: "compradora@example.test",
  telefone: "11900000000",
  total_cents: 15000,
  coupon_code: null,
  rua: "Rua A",
  numero: "1",
  complemento: null,
  bairro: "Centro",
  cidade: "São Paulo",
  uf: "SP",
  cep: "01001000",
  shop_order_items: [{ product_slug: "cha", product_name: "Chá", qty: 5, unit_price_cents: 3000 }],
};

function payment(over: Partial<MpPayment>): MpPayment {
  return {
    id: 1001,
    status: "approved",
    status_detail: "accredited",
    external_reference: "ALM-000001",
    transaction_amount: 150,
    currency_id: "BRL",
    ...over,
  };
}

beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));

describe("buildPaymentBody", () => {
  it("usa o total do pedido mesmo que o navegador mande outro valor", () => {
    const body = buildPaymentBody(
      { token: "tok", payment_method_id: "visa", installments: 1, transaction_amount: 1, external_reference: "OUTRO" },
      { amountCents: 15000, externalReference: "ALM-000001", notificationUrl: "https://x/webhook" },
    );
    expect(body).toMatchObject({
      token: "tok",
      installments: 1,
      transaction_amount: 150,
      external_reference: "ALM-000001",
      notification_url: "https://x/webhook",
    });
  });
});

describe("paymentIdempotencyKey", () => {
  it("é igual pro mesmo envio e muda com outro token ou outra tentativa", async () => {
    const a = await paymentIdempotencyKey("ord-1", 1, { token: "t1", payment_method_id: "visa" });
    expect(await paymentIdempotencyKey("ord-1", 1, { token: "t1", payment_method_id: "visa" })).toBe(a);
    expect(await paymentIdempotencyKey("ord-1", 1, { token: "t2", payment_method_id: "visa" })).not.toBe(a);
    expect(await paymentIdempotencyKey("ord-1", 2, { token: "t1", payment_method_id: "visa" })).not.toBe(a);
    expect(a).not.toContain("t1");
  });
});

describe("paymentMatchesOrder", () => {
  it("exige valor exato em BRL", () => {
    expect(paymentMatchesOrder(payment({}), 15000)).toBe(true);
    expect(paymentMatchesOrder(payment({ transaction_amount: 1 }), 15000)).toBe(false);
    expect(paymentMatchesOrder(payment({ currency_id: "ARS" }), 15000)).toBe(false);
    expect(paymentMatchesOrder(payment({ transaction_amount: undefined }), 15000)).toBe(false);
  });
});

describe("applyPaymentUpdate", () => {
  it("aprova e confirma quando o valor bate", async () => {
    const db = fakeDb(baseOrder);
    expect(await applyPaymentUpdate(db.client, payment({}))).toBe("approved");
    expect(db.order.status).toBe("approved");
    expect(db.order.confirmed_at).not.toBeNull();
    expect(db.events).toContain("order_confirmed");
  });

  it.each([
    ["valor menor", { transaction_amount: 1 }],
    ["outra moeda", { currency_id: "ARS" }],
    ["sem valor", { transaction_amount: undefined }],
  ])("não aprova pagamento aprovado com %s", async (_name, over) => {
    const db = fakeDb(baseOrder);
    expect(await applyPaymentUpdate(db.client, payment(over))).toBe("pending");
    expect(db.order.status).toBe("pending");
    expect(db.order.mp_status_detail).toBe("amount_mismatch");
    expect(db.order.confirmed_at).toBeNull();
    expect(db.events).not.toContain("order_confirmed");
  });

  it("pagamento recusado antigo não rebaixa pedido já pago, mesmo com leitura desatualizada", async () => {
    const db = fakeDb(baseOrder, { ...baseOrder });
    await applyPaymentUpdate(db.client, payment({ id: 2002 }));
    expect(db.order.status).toBe("approved");

    const stale = await applyPaymentUpdate(db.client, payment({ id: 1000, status: "rejected", status_detail: "cc_rejected_other_reason" }));
    expect(stale).toBe("approved");
    expect(db.order.status).toBe("approved");
    expect(db.order.mp_payment_id).toBe("2002");
  });

  it("estorno do próprio pagamento aprovado cancela o pedido", async () => {
    const db = fakeDb(baseOrder);
    await applyPaymentUpdate(db.client, payment({ id: 2002 }));
    expect(await applyPaymentUpdate(db.client, payment({ id: 2002, status: "refunded" }))).toBe("cancelled");
    expect(db.order.status).toBe("cancelled");
  });
});
