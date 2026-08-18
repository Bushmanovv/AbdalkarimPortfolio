import type { Metadata } from "next";

import { Prompt } from "@/components/ui/Prompt";
import { Reveal } from "@/components/ui/Reveal";
import { SectionCommand } from "@/components/ui/SectionCommand";
import { certifications, education } from "@/data/education";

export const metadata: Metadata = {
  title: "Education",
  description:
    "B.Sc. in Computer Engineering from Birzeit University (2026), with certifications from Udacity and Gaza Sky Geeks.",
  alternates: { canonical: "/education" },
};

export default function EducationPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
      <SectionCommand command="cat education.txt" title="EDUCATION" as="h1" />

      {/* ─────────────────────────────────────────────────────── DEGREE ── */}
      <Reveal className="panel mt-10 p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 className="font-mono text-xl font-semibold text-fg sm:text-2xl">
            {education.institution.toUpperCase()}
          </h2>
          <p className="font-mono text-sm text-term-green">{education.year}</p>
        </div>

        <p className="mt-2 font-mono text-[15px] text-fg-secondary">
          {education.degree}
        </p>
        <p className="mt-1 font-mono text-xs text-fg-muted">
          {education.location}
        </p>

        <div className="mt-7 border-t border-line pt-5">
          <h3 className="mb-3 font-mono text-[11px] tracking-[0.16em] text-fg-muted">
            RELEVANT COURSEWORK
          </h3>
          <ul className="grid gap-x-8 gap-y-1.5 font-mono text-[13px] text-fg-secondary sm:grid-cols-2">
            {education.coursework.map((course) => (
              <li key={course} className="flex gap-2">
                <span aria-hidden="true" className="text-fg-muted">
                  ·
                </span>
                {course}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      {/* ──────────────────────────────────────────────── CERTIFICATIONS ── */}
      <Reveal className="mt-14">
        <Prompt command="ls certifications/" className="mb-5" />
        <h2 className="mb-5 font-mono text-lg font-semibold text-fg">
          CERTIFICATIONS
        </h2>

        <ul className="grid gap-4 sm:grid-cols-3">
          {certifications.map((cert) => (
            <li key={`${cert.issuer}-${cert.title}`} className="panel p-5">
              <p className="font-mono text-[11px] tracking-[0.12em] text-term-cyan">
                {cert.issuer.toUpperCase()}
              </p>
              <p className="mt-2.5 font-mono text-[14px] leading-snug text-fg">
                {cert.title}
              </p>
              {cert.credentialUrl ? (
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block font-mono text-[11px] text-fg-muted underline-offset-4 transition-colors hover:text-term-cyan hover:underline"
                >
                  Verify credential <span aria-hidden="true">↗</span>
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}
