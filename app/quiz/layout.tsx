import type { Metadata } from "next";

// A página do quiz é componente de cliente (não exporta metadata); título e canônico ficam aqui.
export const metadata: Metadata = {
  title: "Quiz: descubra seu chá ideal — Almara",
  description: "Responda algumas perguntas rápidas e descubra qual dos 6 chás naturais da Almara combina com o seu momento.",
  alternates: { canonical: "/quiz" },
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return children;
}
