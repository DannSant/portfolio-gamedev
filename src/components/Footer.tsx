import { useScore } from "../game/scoreStore";
import { useTranslation } from "../i18n/useTranslation";
import PixelIcon from "./PixelIcon";

export default function Footer() {
  const t = useTranslation();
  const { score, coins, bugs } = useScore();

  return (
    <footer className="border-t-4 border-panel-2 bg-night py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 text-center">
        <p className="flex items-center gap-3 font-pixel text-[0.6rem] uppercase text-gold sm:text-xs">
          <PixelIcon name="star" size={12} /> {t.footer.thanks} <PixelIcon name="star" size={12} />
        </p>
        <p className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-pixel text-[0.5rem] uppercase text-ink/55">
          <span>{t.nav.score} {String(score).padStart(6, "0")}</span>
          <span className="flex items-center gap-1.5">
            <PixelIcon name="coin" size={10} /> ×{coins}
          </span>
          <span className="text-lime">{t.footer.bugs} ×{bugs}</span>
        </p>
        <p className="text-xs text-ink/40">
          © {new Date().getFullYear()} Narciso D. Santiago Larios · {t.footer.hint}
        </p>
      </div>
    </footer>
  );
}
