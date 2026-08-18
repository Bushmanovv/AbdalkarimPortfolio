import type { Metadata } from "next";
import Image from "next/image";

import { ButtonLink } from "@/components/ui/Button";
import { Prompt } from "@/components/ui/Prompt";
import { Reveal } from "@/components/ui/Reveal";
import { SectionCommand } from "@/components/ui/SectionCommand";
import {
  engineeringLayers,
  engineeringPhilosophy,
  languages,
  professionalSkills,
  profile,
} from "@/data/profile";
import { accentText, cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description:
    "Abdalkarim Dwikat — Software & AI Engineer with a B.Sc. in Computer Engineering from Birzeit University, building systems across AI, backend software, embedded Linux and hardware integration.",
  alternates: { canonical: "/about" },
};

/**
 * ABOUT — one grid, three sections.
 *
 * The page is a single container so that WHOAMI, ENGINEERING ACROSS THE STACK
 * and PROFILE share the same left and right edges. Spacing is one system, not
 * per-block improvisation:
 *
 *   section gap        mt-20 / sm:mt-24   (80 / 96px)
 *   prompt → heading   space-y-4 in SectionCommand (16px)
 *   heading → content  mt-8               (32px)
 *   column gap         gap-10 / lg:gap-12 (40 / 48px)
 *   card padding       p-7 / sm:p-8       (28 / 32px)
 *
 * Sections two and three are paired cards in a two-column grid, which stretches
 * both cards to a common height — the pairing is structural, not hand-tuned.
 */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
      {/* ══════════════════════════════════════════════════════ 01 WHOAMI ══ */}
      <SectionCommand command="whoami" title="WHOAMI" as="h1" />

      {/* `items-start` keeps the portrait pinned to the top of the row, level
          with the bio, instead of stretching or drifting down beside it. The
          column is sized to hold the prompt above the portrait on one line;
          the portrait itself is capped narrower so the column does not tower
          over the bio beside it. */}
      <div
        data-print="stack"
        className="mt-8 grid items-start gap-10 md:grid-cols-[minmax(0,1fr)_304px] md:gap-8 lg:gap-12"
      >
        <div>
          <p className="font-mono text-lg text-fg">{profile.name}</p>
          <p className="mt-1 font-mono text-sm text-term-green">
            {profile.primaryTitle}
          </p>

          <p className="prose-body mt-6 text-[15px]">
            Software &amp; AI Engineer with a {profile.degree} from{" "}
            {profile.university}, building systems across AI, backend software,
            embedded computing and hardware/software integration.
          </p>

          <p className="prose-body mt-4 text-[15px]">
            I&apos;m especially interested in engineering problems that cross
            layers — where software interacts with hardware, AI has to operate
            under real-world constraints, or automation must integrate with
            existing systems.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <ButtonLink href="/projects" variant="primary">
              [ VIEW PROJECTS ]
            </ButtonLink>
            <ButtonLink href={profile.resumeUrl} variant="secondary" external>
              [ RESUME.PDF ]
            </ButtonLink>
          </div>
        </div>

        {/* No frame: the portrait's glow fades to transparency, so it sits
            directly on the page background and blends rather than being boxed.
            The prompt and caption frame it typographically instead. */}
        {/* Phosphor art is built for a dark screen; on paper it prints as a
            washed-out smudge that costs ink and says nothing. */}
        <figure data-print="omit">
          <Prompt command="display karim.png" size="sm" className="mb-4" />
          <div className="relative mx-auto aspect-[2/3] w-full max-w-[240px] md:mx-0">
            <Image
              src="/karim-terminal.png"
              alt="Portrait of Abdalkarim Dwikat rendered as phosphor-green terminal art"
              fill
              sizes="240px"
              className="object-contain"
              // Largest Contentful Paint on this page.
              priority
            />
          </div>
          {/* The name already leads the bio column, so the caption carries only
              what it adds: where he is. */}
          <figcaption className="mt-4 text-center font-mono text-[11px] text-fg-muted md:text-left">
            <span className="text-term-green">●</span> {profile.location}
          </figcaption>
        </figure>
      </div>

      {/* ═════════════════════════════════════════════════ 02 ENGINEERING ══ */}
      <Reveal className="mt-20 sm:mt-24">
        <SectionCommand
          command="cat engineering-profile.txt"
          title="ENGINEERING ACROSS THE STACK"
        />

        <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-8 lg:gap-12">
          <article className="panel flex flex-col p-7 sm:p-8">
            <h3 className="font-mono text-[11px] tracking-[0.16em] text-fg-muted">
              ENGINEERING PHILOSOPHY
            </h3>
            {/* The statement is centred in whatever height the pair settles on,
                so the shorter card reads as a deliberate pull-quote instead of
                a card with its bottom left empty. */}
            <div className="flex flex-1 items-center">
              <blockquote className="mt-5 border-l-2 border-term-green/50 pl-5">
                <p className="prose-body text-base text-fg">
                  {engineeringPhilosophy}
                </p>
              </blockquote>
            </div>
          </article>

          <article className="panel flex flex-col p-7 sm:p-8">
            <h3 className="font-mono text-[11px] tracking-[0.16em] text-fg-muted">
              LAYERS I WORK ACROSS
            </h3>

            <ol className="mt-5">
              {engineeringLayers.map((layer, i) => (
                <li key={layer.label}>
                  <div
                    className={cn(
                      "font-mono text-sm font-medium",
                      accentText[layer.accent],
                      // Hardware closes the stack a shade quieter than the
                      // embedded layer above it, so the two yellows read as a
                      // sequence rather than a repeat.
                      i === engineeringLayers.length - 1 && "opacity-75",
                    )}
                  >
                    {layer.label}
                  </div>
                  {i < engineeringLayers.length - 1 ? (
                    <div
                      aria-hidden="true"
                      className="my-1.5 pl-1 font-mono text-xs text-fg-muted"
                    >
                      ↓
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>

            {/* `mt-auto` parks the closing line at the foot of the card, so the
                pair reads as one designed block however tall the row grows. */}
            <p className="prose-body mt-auto pt-6 text-[13px]">
              Being able to follow a problem through every one of these layers
              is the part of my background I lean on most.
            </p>
          </article>
        </div>
      </Reveal>

      {/* ═════════════════════════════════════════════════════ 03 PROFILE ══ */}
      <Reveal className="mt-20 sm:mt-24">
        <SectionCommand command="cat profile.json" title="PROFILE" />

        <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-8 lg:gap-12">
          <article className="panel p-7 sm:p-8">
            <h3 className="font-mono text-[11px] tracking-[0.16em] text-fg-muted">
              LANGUAGES
            </h3>

            <dl className="mt-5">
              {languages.map((lang) => (
                <div
                  key={lang.language}
                  className="flex items-baseline justify-between gap-4 border-b border-line py-3 first:pt-0 last:border-b-0 last:pb-0"
                >
                  <dt className="font-mono text-sm text-fg">{lang.language}</dt>
                  <dd className="font-mono text-xs text-fg-secondary">
                    {lang.level}
                  </dd>
                </div>
              ))}
            </dl>
          </article>

          <article className="panel p-7 sm:p-8">
            <h3 className="font-mono text-[11px] tracking-[0.16em] text-fg-muted">
              PROFESSIONAL
            </h3>

            {/* Bordered, unaccented tags: deliberate enough to scan as a set,
                quiet enough to stay behind the technical content. */}
            <ul className="mt-5 flex flex-col items-start gap-2">
              {professionalSkills.map((skill) => (
                <li
                  key={skill}
                  className="border border-line bg-elevated px-3 py-1.5 font-mono text-[13px] text-fg-secondary"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </Reveal>
    </div>
  );
}
