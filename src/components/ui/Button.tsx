import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 border px-4 py-2.5 font-mono text-xs tracking-wide transition-colors duration-150";

const variants: Record<Variant, string> = {
  primary:
    "border-term-green/50 bg-term-green/10 text-term-green hover:bg-term-green/20 hover:border-term-green",
  secondary:
    "border-line bg-elevated text-fg hover:border-line-strong hover:bg-panel",
  ghost:
    "border-transparent bg-transparent text-fg-secondary hover:text-fg hover:border-line",
};

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  /** Opens in a new tab with the correct rel and an accessible label suffix. */
  external?: boolean;
  download?: boolean;
  ariaLabel?: string;
}

export function ButtonLink({
  href,
  children,
  variant = "secondary",
  className,
  external = false,
  ariaLabel,
}: ButtonLinkProps) {
  const classes = cn(base, variants[variant], className);

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        aria-label={ariaLabel}
      >
        {children}
        <span aria-hidden="true">↗</span>
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }

  return (
    <Link href={href} className={classes} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
