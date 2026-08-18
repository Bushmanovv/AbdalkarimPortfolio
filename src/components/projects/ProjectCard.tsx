import { TerminalLink } from "@/components/terminal/TerminalLink";
import { TechTagList } from "@/components/ui/TechTag";
import type { Project } from "@/types";
import { accentText, cn, domainAccent, pad } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  index: number;
  variant?: "featured" | "compact";
}

/**
 * Project card styled as a filesystem entry rather than a SaaS marketing card.
 * The whole card is one link; the hover state reveals the `cd` command.
 */
export function ProjectCard({
  project,
  index,
  variant = "compact",
}: ProjectCardProps) {
  const featured = variant === "featured";
  const accent = domainAccent(project.category[0] ?? "");
  const headlineMetric = project.metrics?.[0];

  return (
    <TerminalLink
      href={`/projects/${project.slug}`}
      command={`cd ${project.slug}`}
      className={cn(
        "group relative flex h-full flex-col border border-line bg-panel transition-colors duration-200",
        "hover:border-line-strong hover:bg-elevated",
        featured ? "p-6 sm:p-7" : "p-5",
      )}
    >
      {/* Index + category */}
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-[11px] text-fg-muted">
          {pad(index)}/
        </span>
        <span
          className={cn(
            "text-right font-mono text-[10px] tracking-[0.12em]",
            accentText[accent],
          )}
        >
          {project.categoryLabel}
        </span>
      </div>

      {/* Directory name — crossfades to `$ cd <slug>` on hover.
          Both layers share one grid cell so the swap stays aligned no matter
          how many lines the title wraps to. */}
      <div className="mt-3 grid">
        <h3
          className={cn(
            "col-start-1 row-start-1 font-mono font-semibold text-fg transition-all duration-200",
            "group-hover:-translate-y-0.5 group-hover:opacity-0",
            featured ? "text-xl sm:text-[22px]" : "text-base",
          )}
        >
          {project.slug}/
        </h3>
        <p
          aria-hidden="true"
          className={cn(
            "col-start-1 row-start-1 translate-y-0.5 font-mono font-semibold text-term-green opacity-0 transition-all duration-200",
            "group-hover:translate-y-0 group-hover:opacity-100",
            featured ? "text-xl sm:text-[22px]" : "text-base",
          )}
        >
          $ cd {project.slug}
        </p>
      </div>

      {/* Human-readable title, so the card is not slug-only. */}
      <p className="mt-1.5 font-mono text-[11px] text-fg-muted">
        {project.shortTitle ?? project.title}
      </p>

      <p
        className={cn(
          "prose-body mt-3 flex-1",
          featured ? "text-[15px]" : "text-[13.5px] leading-relaxed",
        )}
      >
        {project.description}
      </p>

      {headlineMetric ? (
        <p className="mt-4 font-mono text-sm">
          <span className={accentText[accent]}>{headlineMetric.value}</span>{" "}
          <span className="text-fg-muted">
            {headlineMetric.label.toUpperCase()}
          </span>
        </p>
      ) : null}

      <TechTagList
        items={project.technologies}
        limit={featured ? 6 : 4}
        className="mt-4"
      />

      <div className="mt-5 flex items-center justify-between border-t border-line pt-3">
        <span className="font-mono text-[10px] text-fg-muted">
          {project.year ?? ""}
        </span>
        <span className="font-mono text-[11px] text-fg-muted transition-colors group-hover:text-term-green">
          cd <span aria-hidden="true">→</span>
        </span>
      </div>
    </TerminalLink>
  );
}
