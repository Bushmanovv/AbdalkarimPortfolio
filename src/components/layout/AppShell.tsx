"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { CommandPalette } from "@/components/terminal/CommandPalette";
import { TerminalPanel } from "@/components/terminal/TerminalPanel";
import {
  TerminalProvider,
  useTerminal,
} from "@/components/terminal/TerminalProvider";
import { cn } from "@/lib/utils";

/**
 * Chrome + layout. The terminal provider wraps everything so the panel keeps
 * its scrollback, history and size across route changes.
 */
function ShellInner({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { mode, bodyHeight } = useTerminal();

  // In `auto` mode CSS owns the height (see globals.css); an explicit `open`
  // supplies it inline so the drag handle can change it live.
  const shellStyle =
    mode === "open"
      ? ({ "--term-body": `${bodyHeight}px` } as CSSProperties)
      : undefined;

  return (
    <div className={cn("terminal-shell")} data-term={mode} style={shellStyle}>
      <a
        href="#main"
        data-chrome="skip-link"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:border focus:border-term-green focus:bg-panel focus:px-3 focus:py-2 focus:font-mono focus:text-xs focus:text-term-green"
      >
        Skip to content
      </a>

      <Header
        onOpenMenu={() => setMenuOpen(true)}
        onOpenPalette={() => setPaletteOpen(true)}
      />

      <Sidebar />

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* `data-shell` lets the print stylesheet drop the offsets that exist
          only to clear the fixed header and sidebar. */}
      <div data-shell="content" className="pt-12 lg:pl-60">
        <main
          id="main"
          tabIndex={-1}
          className="min-h-[calc(100vh-3rem)] outline-none"
          // Reserve exactly the space the fixed panel occupies.
          style={{ paddingBottom: "calc(var(--term-bar) + var(--term-body))" }}
        >
          {children}
        </main>
      </div>

      <TerminalPanel />

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <TerminalProvider>
      <ShellInner>{children}</ShellInner>
    </TerminalProvider>
  );
}
