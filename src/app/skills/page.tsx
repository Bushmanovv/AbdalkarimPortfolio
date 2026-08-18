import type { Metadata } from "next";

import { Reveal } from "@/components/ui/Reveal";
import { SectionCommand } from "@/components/ui/SectionCommand";
import { professionalSkills } from "@/data/profile";
import { skillGroups } from "@/data/skills";
import { accentText, cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "Engineering stack — Python, C/C++, SystemVerilog, PyTorch, TensorFlow, OpenCV, LangChain, RAG, FastAPI, Flask, React, Raspberry Pi, ESP32, Embedded Linux and UVM verification.",
  alternates: { canonical: "/skills" },
};

/** Skills as a filesystem tree — no invented proficiency percentages. */
export default function SkillsPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
      <SectionCommand
        command="ls -la skills/"
        title="SKILLS"
        as="h1"
        description="Grouped the way the work actually splits. No percentage bars — a number on a skill would be invented."
      />

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {skillGroups.map((group, i) => (
          <Reveal key={group.dir} delay={i * 0.04} className="h-full">
            <section className="panel h-full p-5" aria-labelledby={`skill-${group.dir}`}>
              <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
                <h2
                  id={`skill-${group.dir}`}
                  className={cn("font-mono text-sm", accentText[group.accent])}
                >
                  {group.dir}/
                </h2>
                <p className="font-mono text-[10px] tracking-[0.12em] text-fg-muted">
                  {group.label.toUpperCase()}
                </p>
              </div>

              <ul className="mt-3 font-mono text-[13px] leading-[1.9]">
                {group.items.map((item, j) => {
                  const last = j === group.items.length - 1;
                  return (
                    <li key={item} className="flex gap-2 text-fg-secondary">
                      <span aria-hidden="true" className="text-fg-muted">
                        {last ? "└──" : "├──"}
                      </span>
                      <span>{item}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </Reveal>
        ))}
      </div>

      {/* Professional skills — deliberately quieter than the technical tree. */}
      <Reveal className="mt-14 border-t border-line pt-8">
        <h2 className="mb-4 font-mono text-[11px] tracking-[0.16em] text-fg-muted">
          PROFESSIONAL
        </h2>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {professionalSkills.map((skill) => (
            <li key={skill} className="font-mono text-[13px] text-fg-secondary">
              {skill}
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}
