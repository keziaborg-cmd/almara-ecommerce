import Image from "next/image";
import { teas } from "@/data/teas";
import type { Kit } from "@/data/kits";

/** As latas que vêm no kit, em grade de até 3 por linha (cabe em qualquer largura). */
export function KitCans({ kit, size = 150 }: { kit: Kit; size?: number }) {
  const cans = kit.components.map((slug) => teas.find((t) => t.slug === slug)).filter((t) => t !== undefined);
  const cols = Math.min(cans.length, 3);
  return (
    <div
      className="mx-auto grid w-full"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: cols * size }}
    >
      {cans.map((tea) => (
        <Image key={tea.slug} src={tea.img} alt={tea.name} width={size} height={size} className="h-auto w-full drop-shadow-card-produto" />
      ))}
    </div>
  );
}

/** Nomes dos chás do kit, por extenso. */
export function kitTeaNames(kit: Kit): string[] {
  return kit.components.map((slug) => teas.find((t) => t.slug === slug)?.name ?? slug);
}
