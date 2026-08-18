import type { Metadata } from "next";

import { Reveal } from "@/components/ui/Reveal";
import { SectionCommand } from "@/components/ui/SectionCommand";
import { TechTagList } from "@/components/ui/TechTag";
import { experience } from "@/data/experience";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Software Engineering and Digital Verification internships, freelance software development and web development experience — Abdalkarim Dwikat.",
  alternates: { canonical: "/experience" },
};

export default function ExperiencePage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
      <SectionCommand
        command="cat experience.log"
        title="EXPERIENCE"
        as="h1"
        description="Software engineering, digital verification and freelance delivery — across a professional engineering team, a VLSI house and independent client work."
      />

      {/* Vertical timeline. The rail is decorative; the list carries meaning. */}
      <ol className="mt-12">
        {experience.map((item, i) => {
          const previous = experience[i - 1];
          const showYear = !previous || previous.startYear !== item.startYear;

          return (
            <Reveal
              as="li"
              key={`${item.company}-${item.role}`}
              delay={i * 0.05}
              className="relative grid grid-cols-[3.5rem_1fr] gap-x-4 sm:grid-cols-[5rem_1fr] sm:gap-x-6"
            >
              {/* Year rail */}
              <div className="relative">
                {showYear ? (
                  <span className="font-mono text-xs text-fg-muted">
                    {item.startYear}
                  </span>
                ) : null}
              </div>

              {/* Node + connector */}
              <div className="relative pb-12 pl-6 sm:pl-8">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-[7px] h-2 w-2 rounded-full border border-term-green bg-bg"
                />
                {i < experience.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-[3.5px] top-[19px] h-[calc(100%-19px)] w-px bg-line"
                  />
                ) : null}

                <div className="-mt-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h2 className="font-mono text-base font-semibold text-fg sm:text-lg">
                      {item.role}
                    </h2>
                    <p className="font-mono text-[11px] text-fg-muted">
                      {item.period}
                    </p>
                  </div>

                  <p className="mt-1 font-mono text-[13px]">
                    <span className="text-term-cyan">{item.company}</span>
                    <span className="text-fg-muted"> — {item.location}</span>
                    {item.current ? (
                      <span className="ml-2 text-term-green">● PRESENT</span>
                    ) : null}
                  </p>

                  <p className="prose-body mt-3 max-w-2xl text-[14.5px]">
                    {item.summary}
                  </p>

                  <ul className="mt-4 space-y-2">
                    {item.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-[7px] h-1 w-1 shrink-0 bg-fg-muted"
                        />
                        <span className="prose-body text-[14px]">
                          {highlight}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <TechTagList items={item.technologies} className="mt-5" />
                </div>
              </div>
            </Reveal>
          );
        })}
      </ol>
    </div>
  );
}
