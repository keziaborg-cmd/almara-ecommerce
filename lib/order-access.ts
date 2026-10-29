/**
 * Código de acesso da página do pedido (/pedido/[n]). Ele autoriza ver o pedido, então não fica na
 * URL: ferramentas de análise (GA4) e o histórico do navegador guardariam o endereço completo.
 * O carrinho guarda o código aqui e abre /pedido/[n] sem ele; quem chega por um link antigo com
 * ?token= tem o código guardado e o endereço limpo antes de qualquer script de análise
 * (ORDER_TOKEN_CLEANUP_SCRIPT, no layout).
 *
 * Fica no localStorage deste navegador (necessário para mostrar o pedido, não é rastreamento),
 * com os últimos pedidos só.
 */
export const ORDER_TOKENS_KEY = "almara-pedidos";
const MAX_ORDERS = 10;

type Store = Pick<Storage, "getItem" | "setItem">;
const browserStore = (): Store | undefined => (typeof localStorage === "undefined" ? undefined : localStorage);

function readAll(store: Store): Record<string, string> {
  try {
    const parsed: unknown = JSON.parse(store.getItem(ORDER_TOKENS_KEY) ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

/** Guarda o código do pedido. Devolve false se o navegador não deixa guardar (aí o código segue na URL). */
export function saveOrderToken(orderNumber: string, token: string, store: Store | undefined = browserStore()): boolean {
  if (!store) return false;
  try {
    const all = readAll(store);
    delete all[orderNumber];
    const entries = [...Object.entries(all), [orderNumber, token] as [string, string]].slice(-MAX_ORDERS);
    store.setItem(ORDER_TOKENS_KEY, JSON.stringify(Object.fromEntries(entries)));
    return readAll(store)[orderNumber] === token;
  } catch {
    return false;
  }
}

export function readOrderToken(orderNumber: string, store: Store | undefined = browserStore()): string | null {
  if (!store) return null;
  const t = readAll(store)[orderNumber];
  return typeof t === "string" && t ? t : null;
}

/** Endereço da página do pedido: sem o código quando ele ficou guardado no navegador. */
export function orderPagePath(orderNumber: string, token: string, store: Store | undefined = browserStore()): string {
  const path = `/pedido/${encodeURIComponent(orderNumber)}`;
  return saveOrderToken(orderNumber, token, store) ? path : `${path}?token=${encodeURIComponent(token)}`;
}

/**
 * Roda antes da hidratação e dos scripts de análise: em /pedido/[n]?token=..., guarda o código e
 * tira o ?token= da barra de endereço. Se não conseguir guardar, deixa a URL como está (a página
 * precisa do código pra funcionar).
 */
export const ORDER_TOKEN_CLEANUP_SCRIPT = `(function(){try{
var m=location.pathname.match(/^\\/pedido\\/([^/]+)\\/?$/);if(!m)return;
var p=new URLSearchParams(location.search);var t=p.get('token');if(!t)return;
var n=decodeURIComponent(m[1]);var k='${ORDER_TOKENS_KEY}';var a={};
try{a=JSON.parse(localStorage.getItem(k)||'{}')||{};}catch(e){a={};}
delete a[n];a[n]=t;var e=Object.entries(a).slice(-${MAX_ORDERS});localStorage.setItem(k,JSON.stringify(Object.fromEntries(e)));
if((JSON.parse(localStorage.getItem(k)||'{}')||{})[n]!==t)return;
p.delete('token');var q=p.toString();history.replaceState(history.state,'',location.pathname+(q?'?'+q:'')+location.hash);
}catch(e){}})();`;
