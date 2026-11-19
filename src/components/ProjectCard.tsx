import { useState, type CSSProperties } from "react";
import type { Project } from "../data/projects";
import { useLanguage } from "../i18n/LanguageContext";
import { useTranslation } from "../i18n/useTranslation";
import PixelIcon from "./PixelIcon";

type Props = Project & { index: number };

export default function ProjectCard({ title, description, tech, youtubeId, earlierBuildId, status, accent, index }: Props) {
  const { language } = useLanguage();
  const t = useTranslation();
  const [playing, setPlaying] = useState(false);
  const name = title[language];

  return (
    <article
      className="pixel-panel group flex w-full flex-col transition-transform duration-200 hover:-translate-y-2"
      style={{ "--pc": accent } as CSSProperties}
    >
      {/* header bar */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 font-pixel text-[0.55rem] uppercase" style={{ background: `${accent}22` }}>
        <span style={{ color: accent }}>
          {t.projects.level} {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className={`px-2 py-1 text-night ${status === "wip" ? "animate-pulse" : ""}`}
          style={{ background: status === "wip" ? "#facc15" : "#a3e635" }}
        >
          {status === "wip" ? t.projects.wip : t.projects.demo}
        </span>
      </div>

      {/* screen */}
      <div className="relative aspect-video overflow-hidden bg-black">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title={name}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group/play absolute inset-0 block h-full w-full cursor-pointer"
            aria-label={`${t.projects.watch}: ${name}`}
          >
            <img
              src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              className="h-full w-full scale-105 object-cover transition duration-500 group-hover:scale-110 group-hover:saturate-150"
            />
            <span className="scanlines absolute inset-0 opacity-60" />
            <span className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/10 to-transparent" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="pixel-btn pixel-btn-primary !px-5 !py-4 group-hover/play:scale-110">
                <PixelIcon name="play" size={14} />
                {t.projects.watch}
              </span>
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-3xl font-bold" style={{ color: accent }}>
          {name}
        </h3>
        <p className="mt-3 flex-1 leading-relaxed text-ink/75">{description[language]}</p>

        {earlierBuildId && (
          <a
            href={`https://www.youtube.com/watch?v=${earlierBuildId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-fit items-center gap-2 font-pixel text-[0.5rem] uppercase text-ink/60 transition-colors hover:text-gold"
          >
            <PixelIcon name="play" size={8} />
            {t.projects.earlier}
          </a>
        )}

        <p className="mt-6 mb-3 font-pixel text-[0.5rem] uppercase text-ink/50">{t.projects.items}</p>
        <ul className="flex flex-wrap gap-3">
          {tech.map((item) => (
            <li key={item} className="pixel-chip text-ink/90">
              <span className="h-1.5 w-1.5" style={{ background: accent }} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
