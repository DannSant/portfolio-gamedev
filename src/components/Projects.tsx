import { projects } from "../data/projects";
import { useTranslation } from "../i18n/useTranslation";
import ProjectCard from "./ProjectCard";

export default function Projects() {
    const t = useTranslation();
  return (
    <section id="projects" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-10 text-center">
          {t.projects.title}
        </h2>

        <div className="grid gap-8 sm:grid-cols-2 justify-items-center">
          {projects.map((p) => (
            <ProjectCard key={p.video} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}
