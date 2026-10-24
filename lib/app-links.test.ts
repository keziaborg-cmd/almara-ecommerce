import { describe, expect, it } from "vitest";
import { appDestination, platformFromUserAgent } from "./app-links";

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
