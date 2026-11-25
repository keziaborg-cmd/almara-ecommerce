// Página /lu (série "Salve a Lu" no Instagram). As perguntas e opções são as mesmas do onboarding
// do app Almara+: não mudar o texto aqui sem mudar lá.
export type LuJourneySlug = "sono" | "ansiedade" | "produtividade" | "pausa";

export interface LuJourney {
  slug: LuJourneySlug;
  name: string;
  /** Opção da etapa "O que mais pesa no seu dia hoje?" */
  pain: string;
  question: string;
  options: string[];
  promise: string;
  /** Cores da jornada (tokens do Almara+ em globals.css). */
  color: string;
  colorDark: string;
  colorLight: string;
}

export const LU_OPENING_TITLE = "A Lu achou a jornada dela. Qual é a sua?";
export const LU_PAIN_QUESTION = "O que mais pesa no seu dia hoje?";

export const luJourneys: LuJourney[] = [
  {
    slug: "sono",
    name: "Sono",
    pain: "Durmo mal e acordo cansada",
    question: "Como você descreveria suas noites hoje?",
    options: ["Demoro muito pra desligar a cabeça", "Acordo várias vezes de madrugada", "Durmo, mas acordo sem descanso", "Varia muito de um dia pro outro"],
    promise: "21 dias para a sua noite voltar a descansar você.",
    color: "var(--color-jornada-sono)",
    colorDark: "var(--color-jornada-sono-escura)",
    colorLight: "var(--color-jornada-sono-clara)",
  },
  {
    slug: "ansiedade",
    name: "Ansiedade",
    pain: "Minha cabeça não desliga",
    question: "Onde a ansiedade costuma te pegar?",
    options: ["Numa aceleração no peito e na respiração", "Em pensamentos que não param de girar", "Numa tensão no corpo que não solta", "Vem sem eu saber bem de onde"],
    promise: "21 dias para aprender a desacelerar quando o dia aperta.",
    color: "var(--color-jornada-ansiedade)",
    colorDark: "var(--color-jornada-ansiedade-escura)",
    colorLight: "var(--color-jornada-ansiedade-clara)",
  },
  {
    slug: "produtividade",
    name: "Produtividade",
    pain: "Procrastino e perco o foco",
    question: "O que mais atrapalha seu foco?",
    options: ["Começo muitas coisas e não termino", "Me distraio no celular o tempo todo", "Trabalho o dia todo e rendo pouco", "Não sei por onde começar"],
    promise: "21 dias para terminar o que você começa.",
    color: "var(--color-jornada-produtividade)",
    colorDark: "var(--color-jornada-produtividade-escura)",
    colorLight: "var(--color-jornada-produtividade-clara)",
  },
  {
    slug: "pausa",
    name: "Pausa",
    pain: "Emendo uma coisa na outra e nunca paro",
    question: "O seu dia tem algum momento em que você para de verdade?",
    options: ["Emendo uma coisa na outra o dia inteiro", "Só paro quando já não dou conta", "Quando paro, aproveito pra adiantar algo", "Tenho um intervalo, mas ele some nos dias corridos"],
    promise: "21 dias para caber uma pausa de verdade no seu dia.",
    color: "var(--color-jornada-pausa)",
    colorDark: "var(--color-jornada-pausa-escura)",
    colorLight: "var(--color-jornada-pausa-clara)",
  },
];

/** O que toda jornada traz (sem promessa de saúde: o app ajuda a criar rotina). */
export const LU_JOURNEY_INCLUDES = [
  { title: "Uma lição por dia", text: "Curta, pra caber na rotina, durante os 21 dias." },
  { title: "A Mara como guia", text: "Pra conversar sobre o seu dia e te acompanhar na jornada." },
  { title: "Um jardim que cresce", text: "Cada dia de prática faz o seu jardim florescer." },
  { title: "Ferramentas do dia a dia", text: "Pomodoro, tarefas, hábitos e diário, no mesmo app." },
];

export const LU_PRICE_NOTE = "Depois R$ 29,90/mês ou R$ 219,90/ano. Cancele quando quiser.";

/** Origem padrão quando a URL não traz utm_source (a série no Instagram). */
export const LU_DEFAULT_SOURCE = "ig-lu";
export const LU_WAITLIST_SOURCE = "lista-espera-ios-lu";
export const LU_WAITLIST_TEXT_VERSION = "lista-ios-lu-v1";

/** QR Code do Google Play com a origem da /lu (computador). null = espaço reservado até gerar. */
export const LU_QR_GOOGLE_PLAY: string | null = null;

/** Imagem da Lu no diorama (1080×1350). null = placeholder até a imagem da série chegar. */
export const LU_IMAGE: string | null = "/lu/pagina-lu.png";
