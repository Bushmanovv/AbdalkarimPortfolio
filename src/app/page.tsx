import Link from "next/link";

import { BootOverlay } from "@/components/home/BootOverlay";
import { SectionWatcher } from "@/components/terminal/SectionWatcher";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ButtonLink } from "@/components/ui/Button";
import { Prompt } from "@/components/ui/Prompt";
import { Reveal } from "@/components/ui/Reveal";
import { Status } from "@/components/ui/Status";
import { profile } from "@/data/profile";
import { experience } from "@/data/experience";
import { featuredProjects, publishedProjects } from "@/data/projects";

/** Small stat strip under the hero — every figure derives from real data. */
const capabilities = [
  { label: "AI / ML", accent: "text-term-purple" },
  { label: "Backend & Web", accent: "text-term-cyan" },
  { label: "Embedded Linux", accent: "text-term-yellow" },
  { label: "Digital Verification", accent: "text-term-green" },
];

export default function HomePage() {
  return (
    <>
      <BootOverlay />

      {/* ─────────────────────────────────────────────────────────── HERO ── */}
      <section className="relative overflow-hidden border-b border-line">
        <div aria-hidden="true" className="grid-texture absolute inset-0" />

        <div className="relative mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
          <Prompt command="./start" className="mb-8" />

          <p className="font-mono text-[11px] tracking-[0.2em] text-fg-muted">
            {profile.degree.toUpperCase()} — {profile.university.toUpperCase()}
          </p>

          <h1 className="mt-4 font-mono text-4xl font-bold leading-[1.05] tracking-tight text-fg sm:text-6xl lg:text-7xl">
            ABDALKARIM
            <br />
            DWIKAT
          </h1>

          <p className="mt-5 font-mono text-xl text-term-green sm:text-2xl">
            {profile.primaryTitle}
          </p>

          <p className="mt-3 font-mono text-[12px] text-fg-muted sm:text-[13px]">
            {profile.domains.join(" · ")}
          </p>

          <p className="prose-body mt-7 max-w-xl text-[15px] sm:text-base">
            {profile.heroStatement}
          </p>

          {/* Primary calls to action. */}
          <div className="mt-9 flex flex-wrap gap-2.5">
            <ButtonLink href="/projects" variant="primary">
              [ VIEW PROJECTS ]
            </ButtonLink>
            <ButtonLink href={profile.resumeUrl} variant="secondary" external>
              [ RESUME.PDF ]
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              [ CONTACT ]
            </ButtonLink>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs">
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg-secondary transition-colors hover:text-term-cyan"
            >
              GitHub <span aria-hidden="true">↗</span>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg-secondary transition-colors hover:text-term-cyan"
            >
              LinkedIn <span aria-hidden="true">↗</span>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-6">
            <Status label={profile.status.toUpperCase()} pulse />
            <span className="font-mono text-xs text-fg-muted">
              {profile.location}
            </span>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────── CAPABILITIES ── */}
      <section
        aria-label="Engineering domains"
        className="border-b border-line bg-bg-secondary"
      >
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px px-5 sm:px-8 lg:grid-cols-4">
          {capabilities.map((cap) => (
            <div key={cap.label} className="py-5 lg:py-6">
              <p className={`font-mono text-[13px] ${cap.accent}`}>
                {cap.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── FEATURED ── */}
      <SectionWatcher
        id="home:featured"
        command="ls featured-projects"
        note={`${featuredProjects.length} featured.`}
      >
        <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
          <Prompt command="ls featured-projects" className="mb-8" />

          <h2 className="sr-only">Featured projects</h2>

          <div className="grid gap-4 lg:grid-cols-3">
            {featuredProjects.map((project, i) => (
              <Reveal key={project.slug} delay={i * 0.06} className="h-full">
                <ProjectCard
                  project={project}
                  index={i + 1}
                  variant="featured"
                />
              </Reveal>
            ))}
          </div>

          <div className="mt-8">
            <ButtonLink href="/projects" variant="secondary">
              [ ALL {publishedProjects.length} PROJECTS ]
            </ButtonLink>
          </div>
        </section>
      </SectionWatcher>

      {/* ────────────────────────────────────────────────────── EXPERIENCE ── */}
      <SectionWatcher id="home:experience" command="git log --experience">
        <section className="border-t border-line bg-bg-secondary">
          <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
            <Prompt command="tail -n 4 experience.log" className="mb-8" />

            <h2 className="sr-only">Recent experience</h2>

            <ul className="divide-y divide-[color:var(--color-line)] border-y border-line">
              {experience.map((item) => (
                <li
                  key={`${item.company}-${item.role}`}
                  className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm text-fg">{item.role}</p>
                    <p className="font-mono text-xs text-fg-secondary">
                      {item.company}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-[11px] text-fg-muted">
                    {item.period}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <ButtonLink href="/experience" variant="secondary">
                [ FULL EXPERIENCE ]
              </ButtonLink>
            </div>
          </div>
        </section>
      </SectionWatcher>

      {/* ─────────────────────────────────────────────────────────── CTA ── */}
      <SectionWatcher id="home:contact" command="contact --me">
        <section className="border-t border-line">
          <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
            <Prompt command="contact --me" className="mb-6" />
            <h2 className="font-mono text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
              LET&apos;S BUILD SOMETHING.
            </h2>
            <p className="prose-body mt-4 max-w-xl text-[15px]">
              Open to Software and AI Engineering roles. The fastest way to
              reach me is email.
            </p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <ButtonLink href={`mailto:${profile.email}`} variant="primary">
                [ SEND EMAIL ]
              </ButtonLink>
              <Link
                href="/contact"
                className="inline-flex items-center border border-line bg-elevated px-4 py-2.5 font-mono text-xs text-fg transition-colors hover:border-line-strong"
              >
                [ ALL CONTACT DETAILS ]
              </Link>
            </div>
          </div>
        </section>
      </SectionWatcher>
    </>
  );
}
