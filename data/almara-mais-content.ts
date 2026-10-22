// Conteúdo específico da página /almara-mais (redesign gamificado,
// 2026-08-16). Separado de journeys.ts porque não é metadado de jornada —
// é o conteúdo fixo das seções "como funciona o dia a dia" e "ferramentas".

export const TRAIL_STEPS = [
  { title: "Conceito", text: "Um conceito novo de bem-estar, direto ao ponto, pra abrir o dia." },
  { title: "Autoidentificação", text: "Você se reconhece na situação — é aqui que o dia começa a fazer sentido." },
  { title: "Aprofundamento", text: "Vai um pouco mais fundo no porquê, sem enrolação." },
  { title: "Seu ecossistema", text: "As ferramentas do seu ecossistema de bem-estar, prontas pra aplicar agora." },
  { title: "Ritual do chá", text: "A pausa física: seu chá do dia, o momento pra respirar de verdade." },
  { title: "Conversa com a Mara", text: "Um bate-papo curto pra fechar o que ficou de aprendizado." },
  { title: "Fechamento", text: "Um resumo do dia e um gentil convite pra amanhã." },
] as const;

export type ToolIcon =
  | "pomodoro"
  | "respiracao"
  | "wimhof"
  | "tarefas"
  | "habitos"
  | "metas"
  | "sonhos"
  | "diario"
  | "melhoria"
  | "album";

/** Paleta do círculo do ícone, igual à do app: G (verde), D (verde-escuro), Y (dourado). */
export type ToolPalette = "G" | "D" | "Y";

// Mesma ordem, textos e paletas das ferramentas do app.
export const TOOLS: {
  icon: ToolIcon;
  label: string;
  description: string;
  /** Copy curta "gatilho → solução", revelada no hover/toque do card. */
  scene: string;
  palette: ToolPalette;
  /** Selo discreto pra 1-2 ferramentas mais usadas — omitido nas demais. */
  badge?: string;
}[] = [
  {
    icon: "pomodoro",
    label: "Pomodoro",
    description: "Blocos de foco com pausas curtas no meio.",
    scene: "Muita coisa pra fazer? Um bloco de cada vez.",
    palette: "G",
  },
  {
    icon: "respiracao",
    label: "Respiração guiada",
    description: "Exercícios de respiração pra acalmar na hora.",
    scene: "Coração acelerado? Alguns minutos já mudam o ritmo.",
    palette: "D",
    badge: "Favorita da galera",
  },
  {
    icon: "wimhof",
    label: "Wim Hof",
    description: "Respiração e frio pra dar um gás de energia.",
    scene: "Sem energia? Uma rodada em posição sentada ou deitada, nunca em pé.",
    palette: "D",
  },
  {
    icon: "tarefas",
    label: "Lista de tarefas",
    description: "Anote o que precisa fazer e vá riscando. Com Almara+, traz também as tarefas do Trello e do ClickUp.",
    scene: "Cabeça cheia de coisa pra lembrar? Anota e esquece.",
    palette: "Y",
  },
  {
    icon: "habitos",
    label: "Hábitos",
    description: "Marque os hábitos que quer manter todo dia.",
    scene: "Quer criar constância? Um toque por dia.",
    palette: "Y",
    badge: "Mais usada",
  },
  {
    icon: "metas",
    label: "Metas",
    description: "Junte hábitos, tarefas e pomodoros numa meta que cresce sozinha.",
    scene: "Tem um objetivo grande? Ele cresce com o que você já faz.",
    palette: "G",
  },
  {
    icon: "sonhos",
    label: "Quadro dos sonhos",
    description: "Um mural com o que você quer ver florescer.",
    scene: "Quer lembrar pra onde está indo? Olhe pro seu quadro todo dia.",
    palette: "Y",
  },
  {
    icon: "diario",
    label: "Diário",
    description: "Um espaço pra escrever como você está.",
    scene: "Muita coisa na cabeça? Escreve e solta.",
    palette: "G",
  },
  {
    icon: "melhoria",
    label: "1% Melhor",
    description: "Um passo pequeno por dia, em cada área que importa.",
    scene: "Mudar tudo de uma vez cansa. 1% por dia, não.",
    palette: "D",
  },
  {
    icon: "album",
    label: "Álbum da Mara",
    description: "As poses da Mara que você desbloqueia ao se cuidar.",
    scene: "Cada cuidado revela uma figurinha nova.",
    palette: "G",
  },
];

export const ACHIEVEMENTS = [
  { value: "4", label: "jornadas guiadas" },
  { value: "21", label: "dias por jornada" },
  { value: "10", label: "ferramentas no app" },
  { value: "84", label: "plantas no jardim" },
];
