import Image from "next/image";
import Link from "next/link";
import { PillButton3D } from "@/components/almara-mais/pill-button-3d";
import { GardenVideo } from "@/components/garden/GardenVideo";

function MaraPhoto({ className, src = "/mara.png" }: { className?: string; src?: string }) {
  return (
    <Image
      src={src}
      alt="Mara, mascote do Almara+"
      width={3375}
      height={4219}
      className={className}
    />
  );
}

const MARA_BULLETS = [
  { title: "Guia diária", text: "Uma mensagem por dia, no seu ritmo, lembrando do seu momento de chá." },
  { title: "Lembra do ritual", text: "Um toque gentil quando a correria do dia ameaça engolir sua pausa." },
  { title: "Ajusta a jornada", text: "Acompanha como você está indo e adapta sugestões ao longo dos 21 dias." },
];

const ATIVACAO_STEPS = [
  { title: "Baixe o Almara+", text: "Disponível na App Store e no Google Play, com 14 dias grátis." },
  { title: "Escolha sua jornada", text: "Sono, Ansiedade, Produtividade ou Pausa. Todas disponíveis desde o primeiro dia." },
  { title: "Escolha o chá do seu ritual", text: "Um dos nossos, um que você já tem em casa, ou nenhum. A jornada é sua, o chá acompanha do seu jeito." },
];

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 1 L14.3 9.7 L23 12 L14.3 14.3 L12 23 L9.7 14.3 L1 12 L9.7 9.7 Z" />
    </svg>
  );
}

function MaraGuideVisual() {
  return (
    <div className="relative flex justify-center">
      <div className="pointer-events-none absolute -left-4 top-0 h-32 w-32 rounded-full bg-folha-viva opacity-25 blur-2xl sm:h-40 sm:w-40" />
      <div className="pointer-events-none absolute -right-2 bottom-4 h-24 w-24 rounded-full bg-folha-viva opacity-15 blur-2xl sm:h-28 sm:w-28" />
      <div className="absolute -top-20 right-0 z-10 w-[160px] rounded-2xl border-2 border-tinta-mais/10 bg-white px-3.5 py-2.5 font-body-mais text-sm font-bold text-tinta-mais shadow-md sm:right-4">
        Hora do seu chá da tarde!
        <span className="absolute -bottom-[7px] left-8 h-4 w-4 rotate-45 border-b-2 border-r-2 border-tinta-mais/10 bg-white" />
      </div>
      <MaraPhoto src="/mara-cha.png" className="relative z-0 h-[240px] w-auto md:h-[360px]" />
    </div>
  );
}

function MaraSubscribeVisual() {
  return (
    <div className="relative flex justify-center">
      <div className="pointer-events-none absolute -right-4 top-2 h-32 w-32 rounded-full bg-jornada-pausa opacity-20 blur-2xl sm:h-40 sm:w-40" />
      <div className="pointer-events-none absolute -left-2 bottom-2 h-24 w-24 rounded-full bg-jornada-pausa opacity-15 blur-2xl sm:h-28 sm:w-28" />
      <Sparkle className="pointer-events-none absolute left-2 top-6 h-6 w-6 text-jornada-pausa sm:left-6 sm:h-8 sm:w-8" />
      <Sparkle className="pointer-events-none absolute right-4 top-1/3 h-4 w-4 text-jornada-pausa-escura sm:right-10" />
      <Sparkle className="pointer-events-none absolute bottom-6 left-8 h-5 w-5 text-jornada-pausa opacity-70" />
      <MaraPhoto className="relative z-0 h-[240px] w-auto md:h-[360px]" />
    </div>
  );
}

function TeaStack() {
  return (
    <div className="relative flex h-[220px] w-full max-w-[260px] items-center justify-center md:h-[300px] md:max-w-[340px]">
      <Image
        src="/tea/hibisco.png"
        alt=""
        aria-hidden
        width={200}
        height={200}
        className="absolute left-2 top-6 h-[130px] w-auto -rotate-12 drop-shadow-lg md:h-[180px]"
      />
      <Image
        src="/tea/cha-verde.png"
        alt="Chás Almara"
        width={200}
        height={200}
        className="relative z-10 h-[160px] w-auto drop-shadow-xl md:h-[220px]"
      />
      <Image
        src="/tea/camomila.png"
        alt=""
        aria-hidden
        width={200}
        height={200}
        className="absolute right-0 top-10 h-[130px] w-auto rotate-12 drop-shadow-lg md:h-[180px]"
      />
    </div>
  );
}

// O que é gratuito e o que é do Almara+ — igual ao app.
const FREE_ITEMS = [
  "Pomodoro, Respiração guiada e Wim Hof",
  "Lista de tarefas e Hábitos",
  "Diário (com os modelos e fontes básicos)",
  "1 meta por vez",
  "Quadro dos sonhos com até 3 sonhos",
  "Seu Jardim e o Álbum da Mara, com o que você já conquistou",
];

const PLUS_ITEMS = [
  "Jornadas guiadas de 21 dias: Sono, Ansiedade, Produtividade e Pausa",
  "Converse com a Mara por texto e por voz",
  "Cada dia cuidado vira uma planta no seu jardim",
  "Até 3 metas, com check-in semanal com a Mara",
  "Quadro dos sonhos sem limite, com o modo Contemplar",
  "1% Melhor e os painéis de evolução",
  "Todos os modelos e fontes do Diário",
  "Suas tarefas do Trello e do ClickUp dentro do app",
];

function PlanColumn({ title, badge, items, checkColor, highlight }: { title: string; badge: string; items: string[]; checkColor: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border-2 bg-white px-4 py-4 ${highlight ? "border-[#dcb45c]" : "border-tinta-mais/10"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-display-mais text-lg font-bold text-tinta-mais">{title}</p>
        <span
          className={`rounded-full px-2.5 py-0.5 font-body-mais text-[10px] font-extrabold ${highlight ? "bg-[#dcb45c] text-[#013f24]" : "bg-folha-viva-clara text-folha-viva-escura"}`}
        >
          {badge}
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 font-body-mais text-sm leading-snug text-tinta-mais/80">
            <svg viewBox="0 0 24 24" width="16" height="16" className="mt-0.5 shrink-0" fill="none" stroke={checkColor} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

type FeatureRowProps = {
  reverse?: boolean;
  eyebrow: string;
  title: string;
  bg: string;
  children: React.ReactNode;
  visual: React.ReactNode;
  /** Texto mais largo que o visual (3:2) — pra seção com bastante conteúdo, como a de assinatura. */
  wide?: boolean;
};

function FeatureRow({ reverse, eyebrow, title, bg, children, visual, wide }: FeatureRowProps) {
  // com reverse, o visual (1º filho) vai pra 2ª coluna; a coluna larga é sempre a do texto
  const cols = wide ? (reverse ? "md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]" : "md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]") : "md:grid-cols-2";
  return (
    <div className={`rounded-[32px] ${bg} px-7 py-10 sm:px-10 sm:py-12`}>
      <div className={`mx-auto grid max-w-[1000px] items-center gap-10 ${cols} xl:max-w-[1140px] 2xl:max-w-[1300px] ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}>
        <div className="flex justify-center">{visual}</div>
        <div>
          <span className="inline-block rounded-full bg-white px-4 py-1.5 font-body-mais text-xs font-extrabold uppercase tracking-wide text-folha-viva-escura">
            {eyebrow}
          </span>
          <h3 className="mt-3 font-display-mais text-2xl font-bold text-tinta-mais sm:text-3xl">{title}</h3>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section className="mx-auto mt-20 flex max-w-[1100px] flex-col gap-6 px-[6vw] xl:max-w-[1260px] 2xl:max-w-[1440px]">
      <FeatureRow eyebrow="Quem guia você" title="Mara, sua companhia de bem-estar" bg="bg-folha-viva-clara" visual={<MaraGuideVisual />}>
        <p className="font-body-mais text-tinta-mais/75">
          Mara é a IA de bem-estar do Almara+ — uma presença gentil que acompanha seu ritual, não um
          assistente técnico.
        </p>
        <ul className="mt-4 space-y-3">
          {MARA_BULLETS.map((b) => (
            <li key={b.title} className="rounded-2xl border-2 border-tinta-mais/10 bg-white px-4 py-3">
              <p className="font-display-mais text-sm font-bold text-tinta-mais">{b.title}</p>
              <p className="mt-0.5 font-body-mais text-sm text-tinta-mais/70">{b.text}</p>
            </li>
          ))}
        </ul>
      </FeatureRow>

      <FeatureRow
        reverse
        eyebrow="Seu progresso"
        title="Cada dia de ritual faz seu jardim crescer"
        bg="bg-jornada-produtividade-clara"
        visual={<GardenVideo />}
      >
        <p className="font-body-mais text-tinta-mais/75">
          No Almara+, seu progresso na jornada vira um jardim: cada dia de ritual cumprido planta
          uma flor nova, até as 84 — um jeito visual e gentil de acompanhar sua constância.
        </p>
      </FeatureRow>

      <FeatureRow eyebrow="Chá & loja" title="O ritual começa na lata" bg="bg-jornada-sono-clara" visual={<TeaStack />}>
        <p className="font-body-mais text-tinta-mais/75">
          Todo chá Almara pode ser parte do seu ritual diário no Almara+ — você escolhe qual, e a
          jornada guiada é sua desde o primeiro dia, com ou sem chá.
        </p>
        <ul className="mt-4 space-y-2.5">
          {ATIVACAO_STEPS.map((s, i) => (
            <li key={s.title} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-jornada-sono text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <span className="font-body-mais text-sm text-tinta-mais/80">
                <strong className="font-bold text-tinta-mais">{s.title}.</strong> {s.text}
              </span>
            </li>
          ))}
        </ul>
        <Link href="/produtos" className="mt-4 inline-block font-body-mais text-sm font-extrabold text-jornada-sono-escura hover:underline">
          Ver todos os chás →
        </Link>
      </FeatureRow>

      <FeatureRow reverse wide eyebrow="Assinatura" title="Comece grátis. Vá além com o Almara+" bg="bg-jornada-pausa-clara" visual={<MaraSubscribeVisual />}>
        <p className="font-body-mais text-tinta-mais/75">
          As ferramentas do dia a dia são suas, de graça, pra sempre. O Almara+ abre as jornadas
          guiadas, a Mara e tudo que faz o seu jardim crescer. Os primeiros 7 dias são por nossa conta,
          com tudo liberado.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
          <PlanColumn title="Gratuito" badge="pra sempre" items={FREE_ITEMS} checkColor="#568833" />
          <PlanColumn title="Almara+" badge="tudo do gratuito, e mais" items={PLUS_ITEMS} checkColor="#dcb45c" highlight />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border-2 border-tinta-mais/10 bg-white px-4 py-4 text-center">
            <p className="font-body-mais text-xs font-extrabold uppercase tracking-wide text-tinta-mais/60">Teste grátis</p>
            <p className="mt-1 font-display-mais text-xl font-bold text-tinta-mais">7 dias</p>
            <p className="font-body-mais text-xs text-tinta-mais/60">com tudo liberado</p>
          </div>
          <div className="rounded-2xl border-2 border-tinta-mais/10 bg-white px-4 py-4 text-center">
            <p className="font-body-mais text-xs font-extrabold uppercase tracking-wide text-tinta-mais/60">Mensal</p>
            <p className="mt-1 font-display-mais text-xl font-bold text-tinta-mais">R$ 29,90</p>
            <p className="font-body-mais text-xs text-tinta-mais/60">por mês</p>
          </div>
          <div className="relative rounded-2xl border-2 border-jornada-pausa bg-white px-4 py-4 text-center">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-jornada-pausa px-2.5 py-0.5 font-body-mais text-[10px] font-extrabold text-white">
              economize 39%
            </span>
            <p className="font-body-mais text-xs font-extrabold uppercase tracking-wide text-tinta-mais/60">Anual</p>
            <p className="mt-1 font-display-mais text-xl font-bold text-tinta-mais">R$ 219,90</p>
            <p className="font-body-mais text-xs text-tinta-mais/60">
              por ano
              <span className="block whitespace-nowrap">equivale a R$ 18,33/mês</span>
            </p>
          </div>
        </div>
        <p className="mt-3 font-body-mais text-[11px] leading-snug text-tinta-mais/60">
          O teste começa quando você cria a conta e termina sem cobrança. Se assinar, a cobrança começa
          na hora, pela App Store ou Google Play, e você cancela quando quiser na loja.
        </p>
        <div className="mt-5">
          <PillButton3D href="/quiz" variant="primary">
            Começar meu teste grátis
          </PillButton3D>
        </div>
      </FeatureRow>
    </section>
  );
}
