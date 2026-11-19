import { projects } from "../data/projects";
import { useTranslation } from "../i18n/useTranslation";
import ProjectCard from "./ProjectCard";
import SectionHeading from "./SectionHeading";
import { useReveal } from "./useReveal";

export default function Projects() {
  const t = useTranslation();
  const { ref, visible } = useReveal<HTMLDivElement>(0.1);

  return (
    <section id="projects" className="relative scroll-mt-16 bg-night-2 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-magenta/60 to-transparent" />
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading kicker={t.projects.kicker} title={t.projects.title} />

        <div ref={ref} className={`reveal grid gap-14 md:grid-cols-2 ${visible ? "is-visible" : ""}`}>
          {projects.map((p, i) => (
            <ProjectCard key={p.youtubeId} {...p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
