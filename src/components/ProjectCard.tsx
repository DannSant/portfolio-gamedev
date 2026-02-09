import type { Project } from "../data/projects";
import { useLanguage } from "../i18n/LanguageContext";

export default function ProjectCard({
  title,
  description,
  tech,
  video,
}: Project) {
  const { language } = useLanguage();

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
      <iframe
        className="w-full aspect-video"
        src={video}
        title={title[language]}
        allowFullScreen
      />

      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">
          {title[language]}
        </h3>

        <p className="text-gray-600 mb-4">
          {description[language]}
        </p>

        <div className="flex flex-wrap gap-2">
          {tech.map((t) => (
            <span
              key={t}
              className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
