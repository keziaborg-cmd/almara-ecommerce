"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart, Leaf, Star, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TOOLS, type ToolIcon, type ToolPalette } from "@/data/almara-mais-content";
import { ToolIconGraphic } from "@/components/almara-mais/tool-icon";

// Paletas do círculo do ícone, iguais às do app. "lip" é a sombra embaixo do círculo (efeito 3D do
// .btn-3d); "tint" é o fundo claro do card, a mesma cor bem suave.
const PALETTES: Record<ToolPalette, { bg: string; icon: string; lip: string; tint: string }> = {
  G: { bg: "#568833", icon: "#fffdf8", lip: "#2f5219", tint: "#e6ede0" },
  D: { bg: "#013f24", icon: "#e2c06a", lip: "#000f08", tint: "#e0e8e5" },
  Y: { bg: "#dcb45c", icon: "#013f24", lip: "#8a6a21", tint: "#f7efdb" },
};

// só 2 das 10 ferramentas têm badge (ver TOOLS em almara-mais-content.ts) — ícone
// escolhido pelo sentido do texto, não genérico: coração pra "favorita",
// estrela pra "mais usada"/em alta.
const BADGE_ICON: Partial<Record<ToolIcon, LucideIcon>> = {
  respiracao: Heart,
  habitos: Star,
};

// tempo pra percorrer a trilha inteira num sentido (a volta é o mesmo
// tempo, o scroll faz "ping-pong" em vez de cortar de volta pro início).
const AUTO_SCROLL_SECONDS = 35;
// arrastos menores que isso contam como "clique", não "arrastei o carrossel"
// — sem isso, qualquer drag por engano navegaria pro href do card.
const DRAG_CLICK_THRESHOLD_PX = 5;
// w-[168px] do card + gap-5 (20px) do track — usado pra virar página com as
// setas/dots e pra calcular o card "ativo" a partir do scrollLeft.
const CARD_STEP = 168 + 20;
// atraso entre a entrada de um card e o próximo no stagger de scroll, em ms.
const STAGGER_STEP_MS = 90;

/**
 * Não existe, dentro deste site, uma página própria por ferramenta — elas
 * vivem dentro do app mobile de verdade. Em vez de inventar uma rota que não
 * leva a lugar nenhum, cada card aponta pro CTA final da página (âncora
 * `#comecar` em app/almara-mais/page.tsx), que é o próximo passo real que
 * um visitante pode tomar aqui.
 */
const TOOL_HREF = "/almara-mais#comecar";

export function ToolsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const directionRef = useRef<1 | -1>(1);
  const pausedRef = useRef(false);
  const lastTsRef = useRef<number | null>(null);

  const draggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const dragMovedRef = useRef(0);
  const suppressClickRef = useRef(false);
  const manualScrollFrameRef = useRef<number | null>(null);

  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [isDragging, setIsDragging] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  // stagger de entrada (fade+slide-up dos cards, pop dos ícones) — disparado
  // uma vez só quando a seção entra na viewport, nunca reseta depois.
  const [hasEnteredView, setHasEnteredView] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    // com reduced-motion, a entrada já é tratada como "já aconteceu" direto
    // no render (ver `showEntered` abaixo) — sem precisar de observer nem de
    // setState aqui.
    if (reducedMotion) return;
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEnteredView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  // efetivo: ou já disparou o observer, ou reduced-motion pula a animação
  // inteira mostrando tudo já "entrado" desde o primeiro render.
  const showEntered = hasEnteredView || reducedMotion;

  useEffect(() => {
    if (reducedMotion) return;
    const track = trackRef.current;
    if (!track) return;

    const step = (ts: number) => {
      rafRef.current = requestAnimationFrame(step);
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      if (pausedRef.current || draggingRef.current) return;

      const max = track.scrollWidth - track.clientWidth;
      if (max <= 0) return;

      const speed = max / AUTO_SCROLL_SECONDS; // px/s, sutil o bastante pra não parecer banner
      let next = track.scrollLeft + speed * dt * directionRef.current;

      if (next >= max) {
        next = max;
        directionRef.current = -1;
      } else if (next <= 0) {
        next = 0;
        directionRef.current = 1;
      }
      track.scrollLeft = next;
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [reducedMotion]);

  const pause = () => {
    pausedRef.current = true;
  };
  const resume = () => {
    pausedRef.current = false;
  };

  // Drag só pro mouse — em touch o scroll horizontal nativo do navegador já
  // arrasta/desliza sozinho (e é mais suave que reimplementar via JS).
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const track = trackRef.current;
    if (!track) return;
    draggingRef.current = true;
    dragMovedRef.current = 0;
    dragStartXRef.current = e.clientX;
    dragStartScrollRef.current = track.scrollLeft;
    track.setPointerCapture(e.pointerId);
    setIsDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const track = trackRef.current;
    if (!track) return;
    const delta = e.clientX - dragStartXRef.current;
    dragMovedRef.current = Math.max(dragMovedRef.current, Math.abs(delta));
    track.scrollLeft = dragStartScrollRef.current - delta;
  };

  const endDrag = () => {
    if (draggingRef.current && dragMovedRef.current > DRAG_CLICK_THRESHOLD_PX) {
      suppressClickRef.current = true;
    }
    draggingRef.current = false;
    setIsDragging(false);
  };

  const onCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (suppressClickRef.current) {
      e.preventDefault();
      suppressClickRef.current = false;
    }
  };

  const onTrackScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const idx = Math.round(track.scrollLeft / CARD_STEP);
    setActiveIndex(Math.max(0, Math.min(TOOLS.length - 1, idx)));
  };

  // "empurra" o carrossel pro lado ao clicar na seta — em vez de `scrollBy`
  // nativo (que brigava com `snap-x snap-mandatory` + o loop de auto-scroll:
  // o navegador tentava animar suavemente, mas o mandatory snap corrigia de
  // volta quase na hora, então o clique parecia não fazer nada), escreve
  // `scrollLeft` diretamente quadro a quadro, igual o auto-scroll já faz —
  // mesma técnica, garantidamente funciona. `pause()` evita que o auto-scroll
  // ambiente escreva por cima no meio do movimento.
  const MANUAL_SCROLL_SPEED = 900; // px/s — bem mais rápido que o auto-scroll, pra sentir como um empurrão
  const MANUAL_SCROLL_DURATION = 550; // ms

  const scrollByStep = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    pause();
    if (manualScrollFrameRef.current !== null) cancelAnimationFrame(manualScrollFrameRef.current);

    const startTime = performance.now();
    const startScrollLeft = track.scrollLeft;
    const max = track.scrollWidth - track.clientWidth;
    const distance = MANUAL_SCROLL_SPEED * (MANUAL_SCROLL_DURATION / 1000);

    const tick = (now: number) => {
      const t = Math.min((now - startTime) / MANUAL_SCROLL_DURATION, 1);
      const eased = 1 - (1 - t) ** 2; // ease-out — desacelera no final, não corta seco
      track.scrollLeft = Math.max(0, Math.min(max, startScrollLeft + dir * distance * eased));
      manualScrollFrameRef.current = t < 1 ? requestAnimationFrame(tick) : null;
    };
    manualScrollFrameRef.current = requestAnimationFrame(tick);
  };

  const goToIndex = (i: number) => {
    trackRef.current?.scrollTo({ left: i * CARD_STEP, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="relative mx-auto mt-20 max-w-[1160px] px-[6vw] xl:max-w-[1320px] 2xl:max-w-[1500px]">
      {/* textura de fundo orgânica — manchas grandes bem apagadas + folhinhas
          soltas, mesmo espírito das outras seções da página (journeys-section/
          features-section), só que aqui atrás de um carrossel em vez de cards
          fixos. Ficam atrás de tudo por ordem de DOM (sem precisar de
          z-index), então não competem com o conteúdo. */}
      <div className="pointer-events-none absolute -left-16 -top-6 h-72 w-72 rounded-full bg-folha-viva opacity-[0.07] blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-10 top-1/3 h-64 w-64 rounded-full bg-jornada-pausa opacity-[0.06] blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-8 left-1/3 h-56 w-56 rounded-full bg-jornada-produtividade opacity-[0.05] blur-3xl" aria-hidden />
      <Leaf className="pointer-events-none absolute left-8 top-20 hidden h-6 w-6 rotate-12 text-folha-viva opacity-20 sm:block" aria-hidden />
      <Leaf className="pointer-events-none absolute bottom-6 right-12 hidden h-5 w-5 -rotate-12 text-folha-viva opacity-15 sm:block" aria-hidden />

      <div className="text-center">
        <span className="inline-block rounded-full bg-folha-viva-clara px-4 py-1.5 font-body-mais text-xs font-extrabold uppercase tracking-wide text-folha-viva-escura">
          Ecossistema
        </span>
        <h2 className="mt-3 font-display-mais text-3xl font-bold text-tinta-mais sm:text-4xl">
          Seu ecossistema de bem-estar, em 10 peças
        </h2>
        <p className="mx-auto mt-3 max-w-md font-body-mais text-tinta-mais/70">
          Fora da jornada guiada, o app também é um ecossistema de bem-estar sempre à mão.
        </p>
      </div>

      {/*
        Carrossel horizontal: scroll nativo (scroll-snap) cobre touch,
        drag manual por pointer events cobre mouse (arrastar com trackpad/
        scroll horizontal de mouse não é natural pra todo mundo). Auto-scroll
        via rAF em vez de CSS puro porque precisa pausar/reverter em reação a
        eventos (hover, drag, foco) e ler scrollWidth real — CSS não alcança
        isso sozinho.

        `group/carousel` (grupo NOMEADO) só existe pras setas — cada card já
        usa `group`/`group-hover:` sem nome pra revelar sua própria mini-cena;
        se esse wrapper também usasse `group` sem nome, passar o mouse na
        SEÇÃO (sem estar em cima de nenhum card) acabaria acionando o reveal
        de TODOS os cards ao mesmo tempo (mesmo seletor CSS `.group:hover`
        casando com qualquer ancestral). Nomear evita a colisão.
      */}
      <div
        className="group/carousel relative mt-10"
        onMouseEnter={pause}
        onMouseLeave={() => {
          endDrag();
          resume();
        }}
        onFocus={pause}
        onBlur={resume}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-bg-mais to-transparent md:w-14" aria-hidden />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-bg-mais to-transparent md:w-14" aria-hidden />

        {/*
          top-[78px] (fixo) em vez de top-1/2: a altura deste wrapper varia
          conforme QUALQUER card revela sua mini-cena no hover (o card cresce
          ~40-60px), o que fazia `top-1/2` recalcular e a seta "deslizar"
          verticalmente — bem em cima do primeiro/último card, isso criava
          um loop de hover (seta se move → passa a cobrir/descobrir o cursor
          → alterna o hover do card → card cresce/encolhe → seta se move de
          novo), lido como um tremor. 78px = pt-6 do track (24) + pt-5 do
          card (20) + metade do ícone de 68px (34) — o centro vertical do
          ÍCONE, que não muda de posição em nenhum estado.
        */}
        <button
          type="button"
          onClick={() => scrollByStep(-1)}
          aria-label="Ver ferramenta anterior"
          className="absolute left-1 top-[78px] z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-2 border-tinta-mais/10 bg-white text-tinta-mais opacity-0 shadow-md transition-opacity duration-200 group-hover/carousel:opacity-100 md:flex"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => scrollByStep(1)}
          aria-label="Ver próxima ferramenta"
          className="absolute right-1 top-[78px] z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-2 border-tinta-mais/10 bg-white text-tinta-mais opacity-0 shadow-md transition-opacity duration-200 group-hover/carousel:opacity-100 md:flex"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>

        <div
          ref={trackRef}
          onScroll={onTrackScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onTouchStart={pause}
          onTouchEnd={resume}
          className={`tool-card-track flex items-start gap-5 overflow-x-auto scroll-smooth px-2 pt-6 pb-6 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
            isDragging ? "cursor-grabbing select-none" : "cursor-grab"
          }`}
        >
          {TOOLS.map((tool, i) => {
            const BadgeIcon = tool.badge ? BADGE_ICON[tool.icon] : undefined;
            const palette = PALETTES[tool.palette];
            return (
              <div
                key={tool.icon}
                className={`shrink-0 snap-start transition-[opacity,transform] duration-500 ease-out ${
                  showEntered ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
                }`}
                style={{ transitionDelay: showEntered ? `${i * STAGGER_STEP_MS}ms` : "0ms" }}
              >
                <Link
                  href={TOOL_HREF}
                  onClick={onCardClick}
                  style={{ "--tool-shadow-color": palette.lip, "--tool-tint": palette.tint } as React.CSSProperties}
                  className={`group relative flex w-[168px] flex-col items-center gap-2.5 rounded-3xl border-2 border-white/70 px-3 pb-4 pt-5 text-center shadow-sm transition-all duration-[350ms] ease-out hover:-translate-y-1 hover:scale-[1.04] hover:border-tinta-mais/10 hover:bg-white hover:shadow-[0_20px_38px_-14px_color-mix(in_srgb,var(--tool-shadow-color)_45%,transparent)] focus-visible:-translate-y-1 focus-visible:scale-[1.04] focus-visible:border-tinta-mais/10 focus-visible:bg-white focus-visible:shadow-[0_20px_38px_-14px_color-mix(in_srgb,var(--tool-shadow-color)_45%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-folha-viva-escura focus-visible:ring-offset-2 bg-[var(--tool-tint)]`}
                >
                  {tool.badge && BadgeIcon && (
                    <span
                      className="pointer-events-none absolute -top-3 left-1/2 z-20 flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 font-body-mais text-[9px] font-extrabold uppercase tracking-wide shadow-sm ring-2 ring-white"
                      style={{ transform: "translateX(-50%) rotate(-3deg)", background: palette.bg, color: palette.icon }}
                    >
                      <BadgeIcon className="h-2.5 w-2.5" fill="currentColor" aria-hidden />
                      {tool.badge}
                    </span>
                  )}

                  <div
                    className={`btn-3d flex h-[68px] w-[68px] items-center justify-center rounded-full ${
                      showEntered ? "animate-tool-pop" : ""
                    }`}
                    style={
                      {
                        background: palette.bg,
                        "--btn-shadow": palette.lip,
                        animationDelay: `${i * STAGGER_STEP_MS + 120}ms`,
                      } as React.CSSProperties
                    }
                  >
                    <ToolIconGraphic icon={tool.icon} color={palette.icon} />
                  </div>

                  <div>
                    <p className="font-body-mais text-xs font-bold leading-tight text-tinta-mais/85">{tool.label}</p>
                    <p className="mt-1 font-body-mais text-[11px] leading-snug text-tinta-mais/60">{tool.description}</p>
                  </div>

                  {/*
                    Mini-cena "gatilho → solução" + CTA fantasma: escondidos por
                    padrão só a partir do md (onde hover existe de verdade) via o
                    truque de grid-template-rows 0fr→1fr, que anima uma altura
                    "auto" sem precisar medir o conteúdo em JS. No mobile (sem
                    hover) já vem revelado, senão o toque único navegaria direto
                    sem o usuário nunca ver a mini-cena.
                  */}
                  <div className="grid grid-rows-[1fr] mt-2 opacity-100 transition-[grid-template-rows,opacity,margin-top] duration-300 ease-out md:mt-0 md:grid-rows-[0fr] md:opacity-0 md:group-hover:mt-2 md:group-hover:grid-rows-[1fr] md:group-hover:opacity-100 md:group-focus-visible:mt-2 md:group-focus-visible:grid-rows-[1fr] md:group-focus-visible:opacity-100">
                    <div className="overflow-hidden">
                      <p className="font-body-mais text-[10.5px] font-semibold leading-snug text-folha-viva-escura">{tool.scene}</p>
                      <span className="mt-1.5 inline-block font-body-mais text-[11px] font-extrabold text-folha-viva-escura">
                        Experimentar →
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-1.5">
        {TOOLS.map((tool, i) => (
          <button
            key={tool.icon}
            type="button"
            onClick={() => goToIndex(i)}
            aria-label={`Ir pra ${tool.label}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex ? "w-5 bg-folha-viva-escura" : "w-1.5 bg-tinta-mais/20"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
