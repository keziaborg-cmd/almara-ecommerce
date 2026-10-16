import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { teas } from "./teas";

// Os preços de data/teas.ts são reserva de exibição; quem vale no checkout é shop_products. Este
// teste lê a migration de preços mais recente e garante que os dois não divergem.
const MIGRATIONS = join(__dirname, "..", "supabase", "migrations");
const latest = readdirSync(MIGRATIONS)
  .filter((f) => /tea_prices/.test(f))
  .sort()
  .at(-1)!;
const sql = readFileSync(join(MIGRATIONS, latest), "utf8");

describe(`preços de data/teas.ts batem com ${latest}`, () => {
  for (const tea of teas) {
    it(tea.slug, () => {
      const m = sql.match(
        new RegExp(`price_cents = (\\d+), price_tier2_cents = (\\d+), price_tier3_cents = (\\d+).*where slug = '${tea.slug}'`),
      );
      expect(m, `${tea.slug} não está na migration`).not.toBeNull();
      const [, p1, p2, p3] = m!.map(Number);
      expect([tea.priceCents, tea.priceTier2Cents, tea.priceTier3Cents]).toEqual([p1, p2, p3]);
      expect(tea.price).toBe(`R$ ${Math.floor(p1 / 100)},${String(p1 % 100).padStart(2, "0")}`);
      expect(p1).toBeGreaterThan(p2);
      expect(p2).toBeGreaterThan(p3);
    });
  }
});
