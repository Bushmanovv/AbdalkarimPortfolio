import type { Metadata } from "next";

import { MailtoComposer } from "@/components/contact/MailtoComposer";
import { ButtonLink } from "@/components/ui/Button";
import { SectionCommand } from "@/components/ui/SectionCommand";
import { Status } from "@/components/ui/Status";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${profile.name} — Software & AI Engineer based in ${profile.location}. ${profile.status}.`,
  alternates: { canonical: "/contact" },
};

const details = [
  {
    label: "EMAIL",
    value: profile.email,
    href: `mailto:${profile.email}`,
    external: false,
  },
  {
    label: "GITHUB",
    value: profile.githubHandle,
    href: profile.github,
    external: true,
  },
  {
    label: "LINKEDIN",
    value: profile.linkedinHandle,
    href: profile.linkedin,
    external: true,
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
      <SectionCommand
        command="contact --me"
        title="LET'S BUILD SOMETHING."
        as="h1"
        description="Open to Software and AI Engineering roles. Email gets the fastest reply."
      />

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* ────────────────────────────────────────────────── DETAILS ── */}
        <div>
          <dl className="border-t border-line">
            {details.map((item) => (
              <div key={item.label} className="border-b border-line py-4">
                <dt className="font-mono text-[10px] tracking-[0.16em] text-fg-muted">
                  {item.label}
                </dt>
                <dd className="mt-1.5">
                  <a
                    href={item.href}
                    {...(item.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="break-all font-mono text-[15px] text-term-cyan underline-offset-4 transition-colors hover:underline"
                  >
                    {item.value}
                    {item.external ? (
                      <>
                        {" "}
                        <span aria-hidden="true">↗</span>
                        <span className="sr-only">(opens in a new tab)</span>
                      </>
                    ) : null}
                  </a>
                </dd>
              </div>
            ))}

            <div className="border-b border-line py-4">
              <dt className="font-mono text-[10px] tracking-[0.16em] text-fg-muted">
                LOCATION
              </dt>
              <dd className="mt-1.5 font-mono text-[15px] text-fg">
                {profile.location}
              </dd>
            </div>

            <div className="border-b border-line py-4">
              <dt className="font-mono text-[10px] tracking-[0.16em] text-fg-muted">
                STATUS
              </dt>
              <dd className="mt-2">
                <Status label={profile.status} pulse />
              </dd>
            </div>
          </dl>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <ButtonLink href={`mailto:${profile.email}`} variant="primary">
              [ SEND EMAIL ]
            </ButtonLink>
            <ButtonLink href={profile.linkedin} variant="secondary" external>
              [ LINKEDIN ]
            </ButtonLink>
            <ButtonLink href={profile.github} variant="secondary" external>
              [ GITHUB ]
            </ButtonLink>
            <ButtonLink href={profile.resumeUrl} variant="secondary" external>
              [ VIEW RESUME ]
            </ButtonLink>
          </div>
        </div>

        {/* ───────────────────────────────────────────────── COMPOSER ── */}
        <MailtoComposer />
      </div>
    </div>
  );
}
