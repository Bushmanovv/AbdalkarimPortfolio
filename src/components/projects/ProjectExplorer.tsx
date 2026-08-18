"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { ProjectGrids } from "@/components/projects/ProjectGrids";
import { promptUser } from "@/data/profile";
import { projectFilters } from "@/data/projects";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";

type FilterId = (typeof projectFilters)[number]["id"];

const FILTER_IDS = projectFilters.map((f) => f.id) as readonly string[];

function isFilterId(value: string | null): value is FilterId {
  return value !== null && FILTER_IDS.includes(value);
}

interface ProjectExplorerProps {
  featured: Project[];
  labs: Project[];
}

/**
 * Filterable project listing. Filters are presented as command arguments —
 * selecting one visibly rewrites the prompt to `projects --filter <id>`.
 *
 * The active filter lives in the URL, not in component state, so there is one
 * source of truth for it: a chip click, a shared link and the terminal command
 * `projects --filter embedded` all arrive the same way. Anything unrecognised
 * in `?filter=` falls back to `all` rather than showing an empty page.
 */
export function ProjectExplorer({ featured, labs }: ProjectExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const param = searchParams.get("filter");
  const filter: FilterId = isFilterId(param) ? param : "all";

  function selectFilter(next: FilterId) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("filter");
    else params.set("filter", next);

    const query = params.toString();
    // `replace` keeps the back button meaning "the page before this one"
    // rather than replaying every filter the visitor tried.
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const { visibleFeatured, visibleLabs } = useMemo(() => {
    if (filter === "all") {
      return { visibleFeatured: featured, visibleLabs: labs };
    }
    const match = (p: Project) =>
      p.category.includes(filter as Project["category"][number]);
    return {
      visibleFeatured: featured.filter(match),
      visibleLabs: labs.filter(match),
    };
  }, [filter, featured, labs]);

  const total = visibleFeatured.length + visibleLabs.length;

  return (
    <>
      {/* Filter bar rendered as command arguments. Omitted from print: they
          are controls, and a control is dead weight on paper. */}
      <div data-print="omit" className="mt-10">
        <p className="mb-3 font-mono text-[11px] tracking-[0.16em] text-fg-muted">
          FILTER
        </p>

        <div
          role="group"
          aria-label="Filter projects by domain"
          className="flex flex-wrap gap-1.5"
        >
          {projectFilters.map((f) => {
            const active = f.id === filter;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => selectFilter(f.id)}
                aria-pressed={active}
                className={cn(
                  "border px-2.5 py-1.5 font-mono text-[11px] tracking-wide transition-colors duration-150",
                  active
                    ? "border-term-green/50 bg-term-green/10 text-term-green"
                    : "border-line bg-elevated text-fg-secondary hover:border-line-strong hover:text-fg",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Live echo of the equivalent command. */}
        <p className="mt-4 font-mono text-xs" aria-live="polite">
          <span aria-hidden="true" className="text-term-green">
            {promptUser}
          </span>
          <span aria-hidden="true" className="text-fg-muted">
            :~/projects${" "}
          </span>
          <span className="text-fg">
            projects{filter === "all" ? "" : ` --filter ${filter}`}
          </span>
          <span className="text-fg-muted">
            {"  "}— {total} {total === 1 ? "result" : "results"}
          </span>
        </p>
      </div>

      {total === 0 ? (
        <p className="mt-12 font-mono text-sm text-fg-muted">
          No projects match this filter.
        </p>
      ) : null}

      <ProjectGrids featured={visibleFeatured} labs={visibleLabs} />
    </>
  );
}
