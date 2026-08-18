import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { ProjectArchitecture } from "@/components/projects/ProjectArchitecture";
import { ProjectGallery } from "@/components/projects/ProjectGallery";
import { ProjectMetrics } from "@/components/projects/ProjectMetrics";
import { Prompt } from "@/components/ui/Prompt";
import { Reveal } from "@/components/ui/Reveal";
import { TechTagList } from "@/components/ui/TechTag";
import { profile } from "@/data/profile";
import { getProject, publishedProjects } from "@/data/projects";
import { domainAccent, pad } from "@/lib/utils";
import { asset } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return publishedProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return { title: "Project not found" };
  }

  return {
    title: project.shortTitle ?? project.title,
    description: project.description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: `${project.title} — ${profile.name}`,
      description: project.description,
      type: "article",
      url: `/projects/${project.slug}`,
    },
  };
}

interface CaseEntry {
  title: string;
  content: ReactNode;
}

/** Numbered case-study section wrapper. */
function CaseSection({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: ReactNode;
}) {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <Reveal as="section" className="scroll-mt-20 border-t border-line pt-10">
      <h2
        id={id}
        className="mb-5 flex items-baseline gap-3 font-mono text-sm tracking-[0.14em] text-fg"
      >
        <span className="text-fg-muted">{pad(index)} /</span>
        <span className="text-term-green">{title}</span>
      </h2>
      {children}
    </Reveal>
  );
}

function Paragraphs({ items }: { items: string[] }) {
  return (
    <div className="max-w-3xl space-y-4">
      {items.map((text, i) => (
        <p key={i} className="prose-body text-[15px]">
          {text}
        </p>
      ))}
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="max-w-3xl space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span
            aria-hidden="true"
            className="mt-[7px] h-1 w-1 shrink-0 bg-term-green"
          />
          <span className="prose-body text-[14.5px]">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) notFound();

  const accent = domainAccent(project.category[0] ?? "");

  const links = [
    project.github ? { label: "VIEW SOURCE", href: project.github } : null,
    project.demo ? { label: "LIVE DEMO", href: project.demo } : null,
    project.report ? { label: "FULL REPORT", href: project.report } : null,
  ].filter((l): l is { label: string; href: string } => l !== null);

  /**
   * Case-study sections, assembled in render order so numbering stays
   * contiguous when a project omits one.
   */
  const caseSections: CaseEntry[] = [
    ...(project.overview?.length
      ? [{ title: "OVERVIEW", content: <Paragraphs items={project.overview} /> }]
      : []),
    ...(project.problem?.length
      ? [{ title: "PROBLEM", content: <Paragraphs items={project.problem} /> }]
      : []),
    ...(project.solution?.length
      ? [{ title: "SOLUTION", content: <Paragraphs items={project.solution} /> }]
      : []),
    ...(project.architecture
      ? [
          {
            title: "ARCHITECTURE",
            content: (
              <ProjectArchitecture
                nodes={project.architecture.nodes}
                caption={project.architecture.caption}
              />
            ),
          },
        ]
      : []),
    ...(project.sections ?? []).map((section) => ({
      title: section.title,
      content: (
        <div className="space-y-5">
          {section.body?.length ? <Paragraphs items={section.body} /> : null}
          {section.points?.length ? <Bullets items={section.points} /> : null}
        </div>
      ),
    })),
    ...(project.features?.length
      ? [{ title: "FEATURES", content: <Bullets items={project.features} /> }]
      : []),
    ...(project.challenges?.length
      ? [
          {
            title: "ENGINEERING CHALLENGES",
            content: <Bullets items={project.challenges} />,
          },
        ]
      : []),
    ...(project.results?.length
      ? [{ title: "RESULTS", content: <Bullets items={project.results} /> }]
      : []),
    {
      title: "TECHNOLOGIES",
      content: <TechTagList items={project.technologies} />,
    },
    ...(project.gallery?.length
      ? [{ title: "GALLERY", content: <ProjectGallery items={project.gallery} /> }]
      : []),
    ...(links.length > 0
      ? [
          {
            title: "LINKS",
            content: (
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[13px] text-term-cyan underline-offset-4 hover:underline"
                    >
                      {link.href} <span aria-hidden="true">↗</span>
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            ),
          },
        ]
      : []),
  ];

  /** JSON-LD for the individual project. Only real fields are emitted. */
  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    author: { "@type": "Person", name: profile.name },
    keywords: project.technologies.join(", "),
    ...(project.github ? { codeRepository: project.github } : {}),
  };

  return (
    <article className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectSchema) }}
      />

      {/* ───────────────────────────────────────────────────────── HERO ── */}
      <Prompt cwd="~/projects" command={`cd ${project.slug}`} className="mb-8" />

      <p className="font-mono text-[11px] tracking-[0.14em] text-fg-muted">
        {project.categoryLabel}
      </p>

      <h1 className="mt-3 max-w-3xl font-mono text-3xl font-bold leading-tight tracking-tight text-fg sm:text-4xl lg:text-[42px]">
        {project.title}
      </h1>

      <p className="prose-body mt-5 max-w-2xl text-base sm:text-lg">
        {project.description}
      </p>

      {project.heroImage ? (
        <div className="panel relative mt-9 aspect-[16/9] overflow-hidden">
          <Image
            src={asset(project.heroImage)}
            alt={`${project.title} — project hero`}
            fill
            sizes="(min-width: 1024px) 900px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      {/* Metadata strip */}
      <dl className="mt-9 grid grid-cols-2 gap-px border border-line bg-[color:var(--color-line)] sm:grid-cols-4">
        {[
          project.role ? { label: "ROLE", value: project.role } : null,
          project.year ? { label: "DATE", value: project.year } : null,
          { label: "CATEGORY", value: project.categoryLabel },
          { label: "STACK", value: `${project.technologies.length} technologies` },
        ]
          .filter((x): x is { label: string; value: string } => x !== null)
          .map((item) => (
            <div key={item.label} className="bg-panel px-4 py-4">
              <dt className="font-mono text-[10px] tracking-[0.14em] text-fg-muted">
                {item.label}
              </dt>
              <dd className="mt-1.5 font-mono text-[12px] leading-snug text-fg-secondary">
                {item.value}
              </dd>
            </div>
          ))}
      </dl>

      {project.metrics?.length ? (
        <ProjectMetrics metrics={project.metrics} accent={accent} className="mt-4" />
      ) : null}

      {links.length > 0 ? (
        <div className="mt-7 flex flex-wrap gap-2.5">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-line bg-elevated px-4 py-2.5 font-mono text-xs text-fg transition-colors hover:border-term-cyan/50 hover:text-term-cyan"
            >
              [ {link.label} <span aria-hidden="true">↗</span> ]
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          ))}
        </div>
      ) : null}

      {/* ───────────────────────────────────────────────── CASE STUDY ── */}
      <div className="mt-16 space-y-12">
        {caseSections.map((section, i) => (
          <CaseSection key={section.title} index={i + 1} title={section.title}>
            {section.content}
          </CaseSection>
        ))}
      </div>

      {/* ───────────────────────────────────────────────────────── FOOT ── */}
      <nav
        aria-label="Project navigation"
        className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6"
      >
        <Link
          href="/projects"
          className="font-mono text-xs text-fg-secondary transition-colors hover:text-term-green"
        >
          <span aria-hidden="true">←</span> cd ..
        </Link>
        <Link
          href="/contact"
          className="font-mono text-xs text-fg-secondary transition-colors hover:text-term-green"
        >
          contact --me <span aria-hidden="true">→</span>
        </Link>
      </nav>
    </article>
  );
}
