import type { ReactNode } from "react";

import { Prompt } from "@/components/ui/Prompt";
import { cn } from "@/lib/utils";

interface SectionCommandProps {
  command: string;
  cwd?: string;
  /** Section heading rendered below the prompt. */
  title?: ReactNode;
  /** Heading level — keeps the document outline correct per page. */
  as?: "h1" | "h2";
  description?: ReactNode;
  className?: string;
  id?: string;
}

/**
 * Standard section header: a shell prompt framing a real heading.
 *
 * The prompt is the branding layer; the heading underneath is what carries
 * the document outline and what a screen reader announces.
 */
export function SectionCommand({
  command,
  cwd = "~",
  title,
  as: Heading = "h2",
  description,
  className,
  id,
}: SectionCommandProps) {
  return (
    <header className={cn("space-y-4", className)} id={id}>
      <Prompt cwd={cwd} command={command} />
      {title ? (
        <Heading
          className={cn(
            "font-mono font-semibold tracking-tight text-fg",
            Heading === "h1"
              ? "text-3xl sm:text-4xl lg:text-5xl"
              : "text-2xl sm:text-3xl",
          )}
        >
          {title}
        </Heading>
      ) : null}
      {description ? (
        <p className="prose-body max-w-2xl text-[15px]">{description}</p>
      ) : null}
    </header>
  );
}
