"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

import { useTerminal } from "@/components/terminal/TerminalProvider";

interface TerminalLinkProps {
  href: string;
  /** Command the terminal types before navigating. */
  command: string;
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
  "aria-current"?: "page" | undefined;
  "aria-label"?: string;
}

/**
 * A normal `next/link` that routes through the terminal.
 *
 * The href stays on the anchor, so middle-click, ⌘/Ctrl-click, "open in new
 * tab" and crawlers all behave exactly as they would with a plain link — the
 * terminal only intercepts an ordinary left click.
 */
export function TerminalLink({
  href,
  command,
  children,
  className,
  onNavigate,
  ...rest
}: TerminalLinkProps) {
  const { runNav } = useTerminal();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    // Leave modified clicks to the browser.
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    onNavigate?.();
    runNav(command, href);
  }

  return (
    <Link href={href} onClick={handleClick} className={className} {...rest}>
      {children}
    </Link>
  );
}

interface TerminalExternalLinkProps {
  href: string;
  command: string;
  children: ReactNode;
  className?: string;
}

/**
 * External link that echoes a command in the terminal and lets the browser
 * open the tab itself — the command result is display-only here, so a popup
 * blocker can never swallow the navigation.
 */
export function TerminalExternalLink({
  href,
  command,
  children,
  className,
}: TerminalExternalLinkProps) {
  const { echoSection } = useTerminal();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => {
        // Unique key per click so repeat clicks still echo.
        echoSection(`ext:${command}:${Date.now()}`, command);
      }}
    >
      {children}
    </a>
  );
}
