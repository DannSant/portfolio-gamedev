import avatar from "../assets/avatar.jpg";
import { useTranslation } from "../i18n/useTranslation";

export default function Hero() {
    const t = useTranslation();

    return (
        <section
            id="about"
            className="min-h-screen flex items-center bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 text-white pt-24"
        >
            <div className="max-w-6xl mx-auto px-6 grid gap-12 md:grid-cols-2 items-center">
                {/* Avatar */}
                <div className="flex justify-center md:justify-end">
                    <img
                        src={avatar}
                        alt="Your Name"
                        className=" w-48 h-48 sm:w-60 sm:h-60
                                rounded-full
                                border-4 border-white/20
                                shadow-[0_0_40px_rgba(255,255,255,0.15)]
                                object-cover"
                    />
                </div>

                {/* Text */}
                <div className="text-center md:text-left">
                    <h1 className="text-4xl sm:text-6xl font-bold mb-4">
                        {t.hero.title}{" "}
                        <span className="text-yellow-300">Narciso D. Santiago Larios</span>
                    </h1>

                    <p className="text-lg sm:text-xl opacity-90 mb-6">
                        {t.hero.role}
                    </p>

                    <p className="text-base sm:text-lg opacity-80 max-w-xl">
                        {t.hero.description}
                    </p>
                </div>
            </div>
        </section>
    );
}
