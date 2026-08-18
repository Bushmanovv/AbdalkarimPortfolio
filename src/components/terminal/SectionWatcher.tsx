"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { useTerminal } from "@/components/terminal/TerminalProvider";

interface SectionWatcherProps {
  /** Dedupe key — the command fires at most once per key per route visit. */
  id: string;
  command: string;
  /** Optional single-line output. Keep it short. */
  note?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Echoes a command in the terminal when a section scrolls into view.
 *
 * This is purely observational: it renders its children immediately and never
 * gates, delays or animates them. The command appears at the same moment the
 * section does. Each key fires once per route visit.
 */
export function SectionWatcher({
  id,
  command,
  note,
  children,
  className,
}: SectionWatcherProps) {
  const { echoSection } = useTerminal();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No IntersectionObserver (or reduced-capability browsers): skip the
    // flourish entirely rather than degrading the page.
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          if (record.isIntersecting) {
            echoSection(id, command, note);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: "-20% 0px -45% 0px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [echoSection, id, command, note]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
