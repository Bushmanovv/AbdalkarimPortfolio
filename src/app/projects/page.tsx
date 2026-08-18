import type { Metadata } from "next";
import { Suspense } from "react";

import { ProjectExplorer } from "@/components/projects/ProjectExplorer";
import { ProjectGrids } from "@/components/projects/ProjectGrids";
import { SectionCommand } from "@/components/ui/SectionCommand";
import { featuredProjects, labProjects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Engineering projects by Abdalkarim Dwikat — real-time EEG classification driving a prosthetic hand, Arabic RAG assistant, LLM code review tooling, computer vision and digital verification work.",
  alternates: { canonical: "/projects" },
};

/** Static ASCII tree of the project directory, generated from real data. */
function ProjectTree() {
  return (
    <pre className="panel mt-8 overflow-x-auto p-5 font-mono text-[12px] leading-[1.7] text-fg-secondary">
      <code>
        {"projects/\n"}
        {"│\n"}
        {"├── featured/\n"}
        {featuredProjects.map((p, i) => {
          const last = i === featuredProjects.length - 1;
          return `│   ${last ? "└──" : "├──"} ${p.slug}/\n`;
        })}
        {"│\n"}
        {"└── labs/\n"}
        {labProjects.map((p, i) => {
          const last = i === labProjects.length - 1;
          return `    ${last ? "└──" : "├──"} ${p.slug}/\n`;
        })}
      </code>
    </pre>
  );
}

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
      <SectionCommand
        command="tree -L 2"
        cwd="~/projects"
        title="PROJECTS"
        as="h1"
        description="Featured work sits at the top — complete systems with real results. Labs collects the coursework, experiments and smaller builds behind them."
      />

      <ProjectTree />

      {/* The explorer reads the active filter from the URL, which opts it out
          of prerendering up to this boundary. The fallback is the same listing
          without the filter bar, so the complete set of projects is in the
          static HTML — for crawlers, and for anyone whose JS hasn't landed. */}
      <Suspense
        fallback={
          <ProjectGrids featured={featuredProjects} labs={labProjects} />
        }
      >
        <ProjectExplorer featured={featuredProjects} labs={labProjects} />
      </Suspense>
    </div>
  );
}
