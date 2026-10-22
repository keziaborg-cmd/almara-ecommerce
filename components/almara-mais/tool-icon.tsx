import type { ToolIcon } from "@/data/almara-mais-content";

// Ícones das ferramentas, iguais aos do app: um único path num viewBox 24×24, só traço.
const PATHS: Record<ToolIcon, string> = {
  pomodoro: "M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l2.5 2M9 2h6",
  respiracao: "M3 13c2.5 0 2.5-5 5-5s2.5 8 5 8 2.5-6 5-6 1.5 3 3 3",
  wimhof: "M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9",
  tarefas: "M4 7l2 2 3-4M4 16l2 2 3-4M13 7h7M13 16h7",
  habitos: "M5 6h14v14H5zM5 10h14M9 3v4M15 3v4M9 15l2 2 4-4",
  metas: "M5 21V4h11l-2 4 2 4H5",
  sonhos: "M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z",
  diario: "M4 20l1-5L16 4l4 4L9 19zM14 6l4 4",
  melhoria: "M5 19L19 5M7.5 9.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM16.5 18.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  album: "M12 21v-8M12 13c0-4 3-7 8-7 0 5-3 8-8 7zM12 15c0-3-2.5-5-7-5 0 4 3 6 7 5z",
};

export function ToolIconGraphic({ icon, color }: { icon: ToolIcon; color: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="none"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={PATHS[icon]} />
    </svg>
  );
}
