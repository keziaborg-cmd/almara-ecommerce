import { describe, expect, it } from "vitest";
import { appDestination, appStoreLink, campaignFromSearch, platformFromUserAgent, playStoreLink } from "./app-links";

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148";
const IPAD = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";
const ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36";

describe("/app: pra onde vai cada aparelho", () => {
  it("reconhece iPhone, iPad, Android e computador", () => {
    expect(platformFromUserAgent(IPHONE)).toBe("ios");
    expect(platformFromUserAgent(IPAD)).toBe("ios");
    expect(platformFromUserAgent(ANDROID)).toBe("android");
    expect(platformFromUserAgent(MAC)).toBe("other");
    expect(platformFromUserAgent(null)).toBe("other");
  });

  it("app fora das lojas: todo mundo vai pra página do Almara+, levando a campanha", () => {
    const q = new URLSearchParams("utm_source=site&utm_medium=qr&utm_campaign=pedido_confirmado&x=1");
    const none = { ios: null, android: null };
    expect(appDestination("ios", q, none)).toBe("/almara-mais?utm_source=site&utm_medium=qr&utm_campaign=pedido_confirmado");
    expect(appDestination("other", new URLSearchParams(), none)).toBe("/almara-mais");
  });

  it("com o app nas lojas: iPhone na App Store, Android no Play com referrer, computador no site", () => {
    const stores = { ios: "https://apps.apple.com/br/app/id123", android: "https://play.google.com/store/apps/details?id=com.almaraplus.app" };
    const q = new URLSearchParams("utm_source=site&utm_medium=qr");
    expect(appDestination("ios", q, stores)).toBe("https://apps.apple.com/br/app/id123");
    expect(appDestination("android", q, stores)).toBe(
      "https://play.google.com/store/apps/details?id=com.almaraplus.app&referrer=utm_source%3Dsite%26utm_medium%3Dqr",
    );
    expect(appDestination("other", q, stores)).toBe("/almara-mais?utm_source=site&utm_medium=qr");
  });
});

describe("/lu: links das lojas com a origem", () => {
  it("lê utm_source/utm_medium da URL; sem origem, usa a padrão; ignora valor estranho", () => {
    expect(campaignFromSearch(new URLSearchParams("utm_source=ig-lu&utm_medium=dm"), "ig-lu")).toEqual({ utmSource: "ig-lu", utmMedium: "dm" });
    expect(campaignFromSearch(new URLSearchParams(""), "ig-lu")).toEqual({ utmSource: "ig-lu", utmMedium: null });
    expect(campaignFromSearch(new URLSearchParams("utm_source=<script>"), "ig-lu")).toEqual({ utmSource: "ig-lu", utmMedium: null });
  });
  it("Google Play leva a origem no referrer", () => {
    expect(playStoreLink({ utmSource: "ig-lu", utmMedium: "dm" })).toBe(
      "https://play.google.com/store/apps/details?id=com.almaraplus.app&referrer=utm_source%3Dig-lu%26utm_medium%3Ddm",
    );
  });
  it("App Store: só com o app na loja, com ct = origem", () => {
    expect(appStoreLink({ utmSource: "ig-lu", utmMedium: "dm" }, null)).toBeNull();
    expect(appStoreLink({ utmSource: "ig-lu", utmMedium: "dm" }, "https://apps.apple.com/br/app/id123")).toBe("https://apps.apple.com/br/app/id123?ct=ig-lu");
  });
});
