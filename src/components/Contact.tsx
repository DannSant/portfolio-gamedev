import { useEffect, useState } from "react";
import { useTranslation } from "../i18n/useTranslation";
import PixelIcon from "./PixelIcon";
import { useReveal } from "./useReveal";

export default function Contact() {
  const t = useTranslation();
  const { ref, visible } = useReveal<HTMLDivElement>(0.3);
  const [count, setCount] = useState(9);

  useEffect(() => {
    if (!visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setCount((c) => (c === 0 ? 9 : c - 1)), 1000);
    return () => window.clearInterval(id);
  }, [visible]);

  return (
    <section id="contact" className="grid-bg relative scroll-mt-16 overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-magenta/10 blur-3xl" />

      <div ref={ref} className={`reveal relative mx-auto max-w-3xl px-6 text-center ${visible ? "is-visible" : ""}`}>
        <h2 className="text-glow font-display text-5xl font-bold uppercase sm:text-7xl">{t.contact.title}</h2>

        <div
          key={count}
          className="title-gradient mx-auto mt-4 font-pixel text-7xl leading-none sm:text-8xl [animation:countdown-pop_1s_steps(4)]"
          aria-hidden="true"
        >
          {count}
        </div>

        <p className="mt-10 font-pixel text-[0.6rem] uppercase text-neon animate-blink sm:text-xs">{t.contact.player2}</p>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink/80">{t.contact.description}</p>

        <div className="mt-12 flex flex-col items-center justify-center gap-8 sm:flex-row">
          <a href="mailto:dann.santlar@gmail.com" className="pixel-btn pixel-btn-primary w-60 sm:w-auto">
            <PixelIcon name="mail" size={14} />
            Email
          </a>
          <a
            href="https://www.linkedin.com/in/narciso-santiago/"
            target="_blank"
            rel="noopener noreferrer"
            className="pixel-btn pixel-btn-neon w-60 sm:w-auto"
          >
            <PixelIcon name="link" size={14} />
            LinkedIn
          </a>
          <a
            href="https://github.com/DannSant"
            target="_blank"
            rel="noopener noreferrer"
            className="pixel-btn pixel-btn-pink w-60 sm:w-auto"
          >
            <PixelIcon name="code" size={14} />
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
