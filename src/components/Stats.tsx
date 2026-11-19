import avatar from "../assets/avatar.jpg";
import { achievements, skills } from "../data/stats";
import { useLanguage } from "../i18n/LanguageContext";
import { useTranslation } from "../i18n/useTranslation";
import PixelIcon from "./PixelIcon";
import SectionHeading from "./SectionHeading";
import { useReveal } from "./useReveal";

const SEGMENTS = 10;

export default function Stats() {
  const t = useTranslation();
  const { language } = useLanguage();
  const { ref, visible } = useReveal<HTMLDivElement>(0.15);

  return (
    <section id="stats" className="grid-bg relative scroll-mt-16 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading kicker={t.stats.kicker} title={t.stats.title} />

        <div ref={ref} className={`reveal grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] ${visible ? "is-visible" : ""}`}>
          {/* Player card */}
          <div className="pixel-panel relative p-6 sm:p-8 lg:sticky lg:top-28 lg:self-start">
            <span className="absolute -top-3 left-6 bg-magenta px-2 py-1 font-pixel text-[0.55rem] text-night">P1</span>

            <div className="relative mx-auto mb-7 w-fit">
              <div className="animate-float">
                <img
                  src={avatar}
                  alt="Narciso D. Santiago Larios"
                  className="h-44 w-44 object-cover shadow-[0_-4px_0_0_#facc15,0_4px_0_0_#facc15,-4px_0_0_0_#facc15,4px_0_0_0_#facc15,0_0_40px_8px_rgba(250,204,21,0.25)] sm:h-52 sm:w-52"
                />
                <div className="scanlines pointer-events-none absolute inset-0 opacity-40" />
              </div>
              <span className="absolute -bottom-3 -right-4 bg-gold px-2 py-1.5 font-pixel text-[0.6rem] text-night shadow-[3px_3px_0_0_#2e1065]">
                {t.stats.level} 10
              </span>
            </div>

            <h3 className="text-center font-display text-2xl font-bold">Narciso Santiago</h3>

            <dl className="mt-6 space-y-4 font-pixel text-[0.55rem] uppercase sm:text-[0.6rem]">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-ink/60">{t.stats.className}</dt>
                <dd className="text-right normal-case text-neon">{t.stats.classValue}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-ink/60">{t.stats.main}</dt>
                <dd className="text-right text-gold">{t.stats.mainValue}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink/60">{t.stats.hp}</dt>
                <dd className="flex gap-1 text-magenta">
                  {Array.from({ length: 5 }, (_, i) => (
                    <PixelIcon key={i} name="heart" size={14} />
                  ))}
                </dd>
              </div>
              <div>
                <div className="mb-2 flex justify-between">
                  <dt className="text-ink/60">{t.stats.xp}</dt>
                  <dd className="text-ink/60">7 450 / 10 000</dd>
                </div>
                <div className="h-3 bg-night p-0.5 shadow-[0_0_0_2px_#3b2a7a]">
                  <div
                    className="h-full bg-gradient-to-r from-neon to-magenta transition-[width] delay-300 duration-[1500ms] ease-out"
                    style={{ width: visible ? "74.5%" : "0%" }}
                  />
                </div>
              </div>
            </dl>
          </div>

          <div className="flex flex-col gap-12">
            {/* Skills */}
            <div className="pixel-panel p-6 sm:p-8">
              <h3 className="mb-6 font-pixel text-xs uppercase text-gold">{t.stats.skills}</h3>
              <ul className="space-y-5">
                {skills.map((s, row) => (
                  <li key={s.name.en} className="grid grid-cols-[8.5rem_1fr_auto] items-center gap-3 sm:grid-cols-[11rem_1fr_auto] sm:gap-4">
                    <span className="truncate text-sm text-ink/85">{s.name[language]}</span>
                    <span className="flex gap-[3px]" aria-hidden="true">
                      {Array.from({ length: SEGMENTS }, (_, i) => {
                        const on = i < s.level;
                        return (
                          <span
                            key={i}
                            className="h-3.5 flex-1 transition-colors"
                            style={{
                              background: on && visible ? `hsl(${190 + i * 13} 85% ${58 + i}%)` : "#22174a",
                              boxShadow: on && visible ? `0 0 8px hsl(${190 + i * 13} 85% 60% / 0.45)` : undefined,
                              transitionDelay: `${row * 120 + i * 45}ms`,
                              transitionDuration: "150ms",
                            }}
                          />
                        );
                      })}
                    </span>
                    <span className="w-8 text-right font-pixel text-[0.55rem] text-ink/60">{s.level * 10}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Achievements */}
            <div>
              <h3 className="mb-6 font-pixel text-xs uppercase text-gold">{t.stats.achievements}</h3>
              <div className="grid gap-8 sm:grid-cols-2">
                {achievements.map((a) => (
                  <div
                    key={a.title.en}
                    className="pixel-panel group flex items-start gap-4 p-4 transition-transform duration-150 hover:-translate-y-1"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center bg-night text-gold shadow-[0_0_0_2px_#3b2a7a] transition-colors group-hover:text-magenta">
                      <PixelIcon name={a.icon} size={22} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-lg font-semibold leading-tight">{a.title[language]}</p>
                      <p className="mt-1 text-sm text-ink/65">{a.description[language]}</p>
                      <p className="mt-2 font-pixel text-[0.45rem] uppercase text-lime">{t.stats.unlocked}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
