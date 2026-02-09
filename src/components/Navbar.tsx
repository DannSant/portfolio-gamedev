import { useLanguage } from "../i18n/LanguageContext";
import { useTranslation } from "../i18n/useTranslation";

export default function Navbar() {
  const { language, setLanguage } = useLanguage();
  const t = useTranslation();

  return (
    <nav className="fixed top-0 w-full z-50 bg-purple-900/80 backdrop-blur text-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="font-bold text-xl tracking-wide">
          Narciso Santiago
        </div>

        {/* Links */}
        <div className="hidden md:flex gap-8 text-sm uppercase tracking-wide">
          <a href="#about" className="hover:text-yellow-300">
            {t.nav.about}
          </a>
          <a href="#projects" className="hover:text-yellow-300">
            {t.nav.projects}
          </a>
          <a href="#contact" className="hover:text-yellow-300">
            {t.nav.contact}
          </a>
        </div>

        {/* Language toggle */}
        <button
          onClick={() => setLanguage(language === "en" ? "es" : "en")}
          className="border border-white/40 px-3 py-1 rounded text-sm hover:bg-white/10"
        >
          {language.toUpperCase()}
        </button>
      </div>
    </nav>
  );
}
