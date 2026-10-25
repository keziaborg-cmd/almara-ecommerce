import { describe, expect, it } from "vitest";
import { couponBlockReason } from "./coupon-recheck";

function fakeRpc(result: unknown) {
  const calls: unknown[] = [];
  const client = {
    rpc: async (fn: string, args: unknown) => {
      calls.push({ fn, args });
      return { data: result, error: null };
    },
  };
  return { client: client as never, calls };
}

const order = { coupon_code: "TESTEMP90", email: "compradora@example.test" };

describe("couponBlockReason", () => {
  it("pedido sem cupom não consulta o banco", async () => {
    const db = fakeRpc(null);
    expect(await couponBlockReason(db.client, { coupon_code: null, email: "x@example.test" }, 1000)).toBeNull();
    expect(db.calls).toHaveLength(0);
  });

  it("cupom ainda válido libera a cobrança e confere com o e-mail e o subtotal do pedido", async () => {
    const db = fakeRpc({ ok: true, code: "TESTEMP90", kind: "percent", percent_off: 90, shipping: "none" });
    expect(await couponBlockReason(db.client, order, 2090)).toBeNull();
    expect(db.calls).toEqual([
      { fn: "shop_coupon_check", args: { p_code: "TESTEMP90", p_email: "compradora@example.test", p_subtotal_cents: 2090 } },
    ]);
  });

  it("limite atingido depois de criar o pedido bloqueia com a mensagem do banco", async () => {
    const db = fakeRpc({ ok: false, reason: "Este cupom já atingiu o limite de usos." });
    expect(await couponBlockReason(db.client, order, 2090)).toBe(
      "Este cupom já atingiu o limite de usos. Volte ao carrinho e refaça o pedido.",
    );
  });

  it("resposta inesperada também bloqueia", async () => {
    const db = fakeRpc(null);
    expect(await couponBlockReason(db.client, order, 2090)).toMatch(/não está mais disponível/);
  });
});
