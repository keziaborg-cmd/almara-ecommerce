// Quantas caixas, de que tamanho e com que peso um pedido de chá vira no frete.
//
// Medidas fornecidas pela Kezia em 2026-10-13 (pesadas na balança):
//   caixa pequena 27x18x9 cm: vazia 85 g; com 3 latas vazias 284 g  → 199 g / 3 ≈ 66,3 g por lata
//   caixa grande  40x20x10 cm: vazia 148 g; com 6 latas vazias 551 g → 403 g / 6 ≈ 67,2 g por lata
// A lata vazia pesa ~67 g (média das duas pesagens). `weightGrams` de cada chá no catálogo é só o
// chá (o mesmo número impresso no rótulo: 65 g, 60 g, ...), então o peso de uma lata despachada é
// chá + lata, e cada caixa soma a própria tara.
//
// Antes, o frete mandava UM produto de 100 g × quantidade numa caixa mínima dos Correios, e ainda
// multiplicava o peso pela quantidade de novo. Agora cada caixa é um volume só (quantity 1) com as
// medidas e o peso reais, e pedidos grandes viram várias caixas.
//
// Função pura, sem imports de Deno nem do catálogo (recebe o catálogo), pra testar no jest.

export const CAN_EMPTY_GRAMS = 67;

export interface ShippingBox {
  name: 'pequena' | 'grande';
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  tareGrams: number;
  /** Quantas latas cabem. */
  capacity: number;
}

export const SMALL_BOX: ShippingBox = { name: 'pequena', lengthCm: 27, widthCm: 18, heightCm: 9, tareGrams: 85, capacity: 3 };
export const LARGE_BOX: ShippingBox = { name: 'grande', lengthCm: 40, widthCm: 20, heightCm: 10, tareGrams: 148, capacity: 6 };

export interface ShippingPackage {
  box: ShippingBox['name'];
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  cans: number;
  weightGrams: number;
}

/** Caixa que comporta `cans` latas (1 a 6): a pequena até 3, a grande até 6. */
function boxFor(cans: number): ShippingBox {
  return cans <= SMALL_BOX.capacity ? SMALL_BOX : LARGE_BOX;
}

export function planPackages(
  items: { teaKey: string; qty: number }[],
  catalog: Record<string, { weightGrams: number }>,
): ShippingPackage[] {
  // Uma lista com o peso de cada lata despachada (chá + lata vazia). Chá desconhecido ou
  // quantidade inválida é ignorado, nunca vira peso zero silencioso numa caixa.
  const cans: number[] = [];
  for (const it of items) {
    const tea = catalog[it.teaKey];
    const qty = Math.floor(Number(it.qty));
    if (!tea || !Number.isFinite(qty) || qty <= 0) continue;
    for (let i = 0; i < qty; i++) cans.push(tea.weightGrams + CAN_EMPTY_GRAMS);
  }

  // Enche as caixas grandes (6) e põe o resto na menor caixa que comporta: 1–3 latas → pequena,
  // 4–6 → grande. Ex.: 7 latas = grande + pequena; 9 = grande + pequena; 12 = 2 grandes.
  const packages: ShippingPackage[] = [];
  for (let i = 0; i < cans.length; ) {
    const left = cans.length - i;
    const box = left >= LARGE_BOX.capacity ? LARGE_BOX : boxFor(left);
    const inBox = cans.slice(i, i + box.capacity);
    i += inBox.length;
    packages.push({
      box: box.name,
      lengthCm: box.lengthCm,
      widthCm: box.widthCm,
      heightCm: box.heightCm,
      cans: inBox.length,
      weightGrams: inBox.reduce((a, g) => a + g, 0) + box.tareGrams,
    });
  }
  return packages;
}

// ---------------------------------------------------------------------------------------------
// Cotação por serviço. Fica aqui (puro, sem Deno) pra ser testado; o cliente HTTP do Melhor Envio
// está em melhorEnvio.ts.

export interface ShippingOption {
  /** id do serviço no Melhor Envio (estável); é o que o checkout manda de volta. */
  serviceId: string;
  name: string;
  company: string;
  /** Preço em centavos (soma de todas as caixas do pedido). */
  priceCents: number;
  /** Prazo em dias úteis: o da caixa mais demorada. */
  deliveryDays: number;
}

/** Pedido em várias caixas = várias encomendas: o preço de cada serviço é a SOMA das caixas, o prazo
 * é o da mais demorada, e só entra o serviço que atende TODAS as caixas. */
export function mergePackageQuotes(quotes: ShippingOption[][]): ShippingOption[] {
  if (quotes.length === 0) return [];
  const byService = new Map<string, ShippingOption>();
  for (const opt of quotes[0]) byService.set(opt.serviceId, { ...opt });
  for (const q of quotes.slice(1)) {
    const current = new Map(q.map((o) => [o.serviceId, o]));
    for (const [id, acc] of [...byService]) {
      const other = current.get(id);
      if (!other) {
        byService.delete(id);
        continue;
      }
      acc.priceCents += other.priceCents;
      acc.deliveryDays = Math.max(acc.deliveryDays, other.deliveryDays);
    }
  }
  return [...byService.values()].sort((a, b) => a.priceCents - b.priceCents);
}
