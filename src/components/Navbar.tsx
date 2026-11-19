import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { useTranslation } from "../i18n/useTranslation";
import { useScore } from "../game/scoreStore";
import PixelIcon from "./PixelIcon";

const pad = (n: number, len = 6) => String(n).padStart(len, "0");

/** Re-triggers a short "bump" class whenever `value` changes. */
function useBump(value: number) {
  const ref = useRef<HTMLSpanElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = ref.current;
    if (!el) return;
    el.animate(
      [{ transform: "translateY(0)" }, { transform: "translateY(-3px) scale(1.12)" }, { transform: "translateY(0)" }],
      { duration: 220, easing: "steps(3)" },
    );
  }, [value]);
  return ref;
}

export default function Navbar() {
  const { language, setLanguage } = useLanguage();
  const t = useTranslation();
  const { score, coins, hi } = useScore();
  const scoreRef = useBump(score);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#about", label: t.nav.about },
    { href: "#stats", label: t.nav.stats },
    { href: "#projects", label: t.nav.projects },
    { href: "#contact", label: t.nav.contact },
  ];

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-colors duration-300 ${
        scrolled ? "bg-night/85 shadow-[0_4px_0_0_#2a1d5c] backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <a href="#about" className="group flex items-center gap-3" aria-label="Narciso Santiago">
          <span className="grid h-9 w-9 place-items-center bg-magenta font-pixel text-[0.6rem] text-night shadow-[0_-3px_0_0_#fbcfe8,0_3px_0_0_#9d174d,-3px_0_0_0_#fbcfe8,3px_0_0_0_#9d174d] transition-transform group-hover:-translate-y-0.5">
            NS
          </span>
          <span className="hidden font-pixel text-[0.6rem] uppercase tracking-wider text-ink lg:block">
            Narciso Santiago
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group px-3 py-2 font-pixel text-[0.6rem] uppercase text-ink/75 transition-colors hover:text-gold"
            >
              <PixelIcon
                name="play"
                size={8}
                className="mr-1 inline-block text-gold opacity-0 transition-opacity group-hover:opacity-100"
              />
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-4 font-pixel text-[0.55rem] uppercase sm:text-[0.6rem]" aria-label="Score">
            <div className="hidden flex-col gap-1 sm:flex">
              <span className="text-magenta">{t.nav.score}</span>
              <span ref={scoreRef} className="inline-block text-ink tabular-nums">
                {pad(score)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-gold">
              <PixelIcon name="coin" size={14} />
              <span className="tabular-nums">×{pad(coins, 2)}</span>
            </div>
            <div className="hidden flex-col gap-1 lg:flex">
              <span className="text-neon">{t.nav.hi}</span>
              <span className="tabular-nums text-ink/70">{pad(hi)}</span>
            </div>
          </div>

          <button
            onClick={() => setLanguage(language === "en" ? "es" : "en")}
            className="flex font-pixel text-[0.55rem] uppercase shadow-[0_-2px_0_0_#3b2a7a,0_2px_0_0_#3b2a7a,-2px_0_0_0_#3b2a7a,2px_0_0_0_#3b2a7a]"
            aria-label={language === "en" ? "Cambiar a español" : "Switch to English"}
          >
            {(["en", "es"] as const).map((l) => (
              <span
                key={l}
                className={`px-2 py-1.5 transition-colors ${language === l ? "bg-gold text-night" : "bg-panel text-ink/60"}`}
              >
                {l}
              </span>
            ))}
          </button>
        </div>
      </div>

      {/* compact links on small screens */}
      <div
        className={`flex justify-center gap-1 pb-2 md:hidden ${scrolled ? "" : "bg-gradient-to-b from-night/60 to-transparent"}`}
      >
        {links.map((l) => (
          <a key={l.href} href={l.href} className="px-2 py-1 font-pixel text-[0.5rem] uppercase text-ink/75">
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
