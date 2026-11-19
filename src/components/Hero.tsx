import { useRef, useState, useSyncExternalStore } from "react";
import { useTranslation } from "../i18n/useTranslation";
import type { GameMode } from "../game/engine";
import GameCanvas from "./GameCanvas";
import PixelIcon from "./PixelIcon";

const coarseQuery = "(pointer: coarse)";
const subscribeCoarse = (cb: () => void) => {
  const mq = window.matchMedia(coarseQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const isCoarse = () => window.matchMedia(coarseQuery).matches;

export default function Hero() {
  const t = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<GameMode>("demo");
  const touch = useSyncExternalStore(subscribeCoarse, isCoarse, () => false);

  const hint =
    mode === "keys" ? t.hero.keys : mode === "touch" ? t.hero.touch : touch ? t.hero.demoTouch : t.hero.demo;

  return (
    <section
      id="about"
      ref={sectionRef}
      className="crt relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-night-2"
    >
      <GameCanvas sectionRef={sectionRef} zoneRef={zoneRef} onMode={setMode} />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-[6.5rem] sm:pt-32">
        <p className="mb-4 inline-flex items-center gap-3 font-pixel sm:mb-5 text-[0.6rem] uppercase tracking-wider text-neon sm:text-xs">
          <span className="inline-block h-2 w-2 bg-neon shadow-[0_0_10px_#22d3ee] animate-blink" />
          {t.hero.kicker}
        </p>

        <p className="mb-3 font-display text-xl text-ink/80 sm:text-2xl">{t.hero.title}</p>

        <h1 className="title-gradient max-w-4xl font-display text-[2.6rem] font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-[5rem]">
          Narciso D.
          <br />
          Santiago Larios
        </h1>

        <p className="mt-6 inline-block bg-night/60 px-3 py-2 font-pixel text-[0.6rem] uppercase leading-relaxed text-magenta backdrop-blur-sm sm:text-xs">
          {t.hero.role}
        </p>

        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink/85 [text-shadow:0_1px_8px_rgba(11,7,24,0.9)] sm:text-lg">
          {t.hero.description}
        </p>

        <div className="mt-7 flex flex-wrap gap-5 sm:mt-8 sm:gap-6">
          <a href="#projects" className="pixel-btn pixel-btn-primary max-sm:!px-4 max-sm:!text-[0.6rem]">
            <PixelIcon name="play" size={12} />
            {t.hero.start}
          </a>
          <a href="#contact" className="pixel-btn max-sm:!px-4 max-sm:!text-[0.6rem]">
            <PixelIcon name="mail" size={12} />
            {t.hero.contact}
          </a>
        </div>
      </div>

      {/* The level plays out in this strip */}
      <div ref={zoneRef} className="relative min-h-[230px] flex-1 sm:min-h-[260px]">
        <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-center px-4">
          <span
            aria-live="polite"
            className={`pixel-chip !text-[0.5rem] sm:!text-[0.55rem] ${mode === "demo" ? "text-ink/80" : "text-gold"}`}
          >
            <span className={`h-1.5 w-1.5 ${mode === "demo" ? "bg-magenta animate-blink" : "bg-lime"}`} />
            {hint}
          </span>
        </div>
      </div>
    </section>
  );
}
