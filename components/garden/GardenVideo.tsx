/**
 * GardenVideo — o jardim do app Almara+ em loop (vídeo exportado do próprio app: uma planta por dia
 * cuidado, até as 84). Substitui a cena 3D (garden.glb, ~8MB + three.js) por um MP4 de 1,8MB.
 *
 * - `preload="none"`: o vídeo só baixa quando o card chega perto da tela (IntersectionObserver);
 *   até lá fica o pôster (o jardim completo).
 * - Fora da tela, pausa; de volta, continua.
 * - Com "reduzir movimento" ligado no sistema, não toca sozinho: fica o pôster.
 */
"use client";

import { useEffect, useRef } from "react";

const SRC = "/almara-mais/jardim-almara.mp4";
const POSTER = "/almara-mais/jardim-almara-poster.jpg";

export function GardenVideo({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // autoplay bloqueado (modo economia de energia etc.): fica o pôster
          });
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px", threshold: 0.15 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      src={SRC}
      poster={POSTER}
      muted
      loop
      playsInline
      preload="none"
      width={540}
      height={540}
      aria-label="O jardim do Almara+ ganhando uma planta por dia cuidado, até as 84"
      className={className ?? "aspect-square h-auto w-full max-w-[420px] rounded-2xl bg-[#0b3d22] object-cover"}
    />
  );
}
