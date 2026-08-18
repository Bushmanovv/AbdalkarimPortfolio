"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

import { useTerminal } from "@/components/terminal/TerminalProvider";
import { Status } from "@/components/ui/Status";
import { navigation, promptUser } from "@/data/profile";
import { cn } from "@/lib/utils";

/** The platform never changes mid-session, so there is nothing to subscribe to. */
const subscribeToNothing = () => () => {};

/** Maps the current route to the shell path shown in the title bar. */
function routeToCwd(pathname: string) {
  if (pathname === "/") return "~";
  const segments = pathname.split("/").filter(Boolean);
  return `~/${segments.join("/")}`;
}

interface HeaderProps {
  onOpenMenu: () => void;
  onOpenPalette: () => void;
}

export function Header({ onOpenMenu, onOpenPalette }: HeaderProps) {
  const pathname = usePathname();
  const { bodyOpen, openPanel, focusInput } = useTerminal();

  // Platform is a client-only value. `useSyncExternalStore` reads it without
  // an effect and without a hydration mismatch: the server snapshot is the
  // non-Mac label, and React swaps it on the client if needed.
  const isMac = useSyncExternalStore(
    subscribeToNothing,
    () => navigator.platform.toLowerCase().includes("mac"),
    () => false,
  );
  const shortcut = isMac ? "⌘ K" : "Ctrl K";

  const current = navigation.find((n) =>
    n.href === "/" ? pathname === "/" : pathname.startsWith(n.href),
  );

  // For an unmatched route the path is deliberately not derived from
  // `pathname`. Next serves one static 404 shell for every unknown URL, so the
  // server sees `/_not-found` while the client sees the URL actually typed —
  // rendering that difference would be a hydration mismatch. `~` is correct on
  // both sides.
  const cwd = current ? routeToCwd(pathname) : "~";

  return (
    <header
      data-chrome="header"
      className="fixed inset-x-0 top-0 z-40 flex h-12 items-center gap-3 border-b border-line bg-bg-secondary/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-bg-secondary/80 sm:px-4"
    >
      {/* Window dots — restrained, decorative only. */}
      <div aria-hidden="true" className="hidden shrink-0 items-center gap-1.5 sm:flex">
        <span className="h-2.5 w-2.5 rounded-full bg-[#3d444d]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#3d444d]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#3d444d]" />
      </div>

      {/* Mobile menu trigger. */}
      <button
        type="button"
        onClick={onOpenMenu}
        className="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center border border-line text-fg-secondary transition-colors hover:text-fg lg:hidden"
        aria-label="Open navigation menu"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1 3h12M1 7h12M1 11h12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <p className="min-w-0 flex-1 truncate font-mono text-xs sm:text-center">
        <span className="text-fg-secondary">{promptUser}</span>
        <span className="text-fg-muted"> — </span>
        <span className="text-fg-muted">{cwd}</span>
      </p>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onOpenPalette}
          className="hidden items-center gap-2 border border-line bg-elevated px-2.5 py-1 font-mono text-[11px] text-fg-muted transition-colors hover:border-line-strong hover:text-fg-secondary sm:flex"
          aria-label="Open command palette"
        >
          <span aria-hidden="true">⌕</span>
          <span>Search</span>
          <kbd className="border border-line px-1 text-[10px] text-fg-muted">
            {shortcut}
          </kbd>
        </button>

        {/* Always reopens and focuses — never a toggle, so it can't hide the
            panel a visitor just asked to see. */}
        <button
          type="button"
          onClick={() => {
            openPanel();
            requestAnimationFrame(focusInput);
          }}
          className={cn(
            "flex items-center gap-1.5 border px-2 py-1 font-mono text-[11px] transition-colors",
            bodyOpen
              ? "border-term-green/50 bg-term-green/10 text-term-green"
              : "border-line bg-elevated text-fg-muted hover:text-fg-secondary",
          )}
          aria-label="Focus terminal"
        >
          <span aria-hidden="true">&gt;_</span>
          <span className="hidden sm:inline">Terminal</span>
        </button>

        {/* Wrapped rather than passing a display class to Status — its base
            `inline-flex` would conflict with `hidden` and win unpredictably. */}
        <span className="hidden md:block">
          <Status label="ONLINE" pulse />
        </span>
      </div>
    </header>
  );
}
