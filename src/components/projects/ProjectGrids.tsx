import { ProjectCard } from "@/components/projects/ProjectCard";
import type { Project } from "@/types";

interface ProjectGridsProps {
  featured: Project[];
  labs: Project[];
}

/**
 * The two project listings, with numbering continuing across both.
 *
 * Shared by the interactive explorer and by the Suspense fallback that stands
 * in for it during prerender — so the complete project list is in the served
 * HTML whether or not the filter bar has hydrated.
 */
export function ProjectGrids({ featured, labs }: ProjectGridsProps) {
  return (
    <>
      {featured.length > 0 ? (
        <section className="mt-12" aria-labelledby="featured-heading">
          <h2
            id="featured-heading"
            className="mb-5 font-mono text-sm tracking-[0.14em] text-term-green"
          >
            FEATURED/
          </h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {featured.map((project, i) => (
              <ProjectCard
                key={project.slug}
                project={project}
                index={i + 1}
                variant="featured"
              />
            ))}
          </div>
        </section>
      ) : null}

      {labs.length > 0 ? (
        <section className="mt-14" aria-labelledby="labs-heading">
          <h2
            id="labs-heading"
            className="mb-2 font-mono text-sm tracking-[0.14em] text-term-green"
          >
            LABS/
          </h2>
          <p className="prose-body mb-5 max-w-lg text-[13px]">
            Coursework, experiments and smaller builds — where techniques get
            tried before they end up in something larger.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {labs.map((project, i) => (
              <ProjectCard
                key={project.slug}
                project={project}
                index={featured.length + i + 1}
              />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
