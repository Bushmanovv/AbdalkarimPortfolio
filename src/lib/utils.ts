import type { Accent } from "@/types";

/** Minimal class-name joiner — avoids pulling in clsx for a one-liner. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Text colour for a semantic accent. */
export const accentText: Record<Accent, string> = {
  green: "text-term-green",
  cyan: "text-term-cyan",
  purple: "text-term-purple",
  yellow: "text-term-yellow",
  neutral: "text-fg-secondary",
};

/** Border colour for a semantic accent, at low opacity. */
export const accentBorder: Record<Accent, string> = {
  green: "border-term-green/35",
  cyan: "border-term-cyan/35",
  purple: "border-term-purple/35",
  yellow: "border-term-yellow/35",
  neutral: "border-line",
};

/** Tinted background for a semantic accent. */
export const accentBg: Record<Accent, string> = {
  green: "bg-term-green/10",
  cyan: "bg-term-cyan/10",
  purple: "bg-term-purple/10",
  yellow: "bg-term-yellow/10",
  neutral: "bg-elevated",
};

/** Zero-padded index used for the `01/` `02/` project labels. */
export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Maps a project's primary domain to its accent colour so that category
 * colour stays consistent between cards, filters and detail pages.
 */
export function domainAccent(domain: string): Accent {
  switch (domain) {
    case "ai":
      return "purple";
    case "computer-vision":
      return "purple";
    case "software":
      return "cyan";
    case "embedded":
      return "yellow";
    case "verification":
      return "green";
    default:
      return "neutral";
  }
}
