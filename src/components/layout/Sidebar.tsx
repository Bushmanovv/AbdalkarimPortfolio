"use client";

import { usePathname } from "next/navigation";

import {
  TerminalExternalLink,
  TerminalLink,
} from "@/components/terminal/TerminalLink";
import { externalLinks, navigation, profile } from "@/data/profile";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Nav row. The label is the real link text; the shell command is revealed on
 * hover as a microinteraction and hidden from assistive tech.
 */
function NavRow({
  href,
  label,
  command,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  command: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <TerminalLink
      href={href}
      command={command}
      onNavigate={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-2 py-1.5 pl-5 pr-3 font-mono text-[13px]",
        "transition-colors duration-150",
        active
          ? "text-term-green"
          : "text-fg-secondary hover:bg-elevated hover:text-fg",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-1.5 transition-opacity duration-150",
          active ? "text-term-green opacity-100" : "opacity-0 group-hover:opacity-60",
        )}
      >
        &gt;
      </span>

      {/* Label swaps to the command on hover, at a fixed height so the row
          never reflows. */}
      <span className="relative block h-[18px] flex-1 overflow-hidden">
        <span className="block leading-[18px] transition-transform duration-200 group-hover:-translate-y-[18px]">
          {label}
        </span>
        <span
          aria-hidden="true"
          className="block leading-[18px] text-term-cyan transition-transform duration-200 group-hover:-translate-y-[18px]"
        >
          $ {command}
        </span>
      </span>
    </TerminalLink>
  );
}

function ExternalRow({
  href,
  label,
  command,
}: {
  href: string;
  label: string;
  command: string;
}) {
  return (
    <TerminalExternalLink
      href={href}
      command={command}
      className="group flex items-center justify-between py-1.5 pl-5 pr-3 font-mono text-[13px] text-fg-secondary transition-colors duration-150 hover:bg-elevated hover:text-fg"
    >
      <span>{label}</span>
      <span
        aria-hidden="true"
        className="text-fg-muted transition-colors group-hover:text-term-cyan"
      >
        ↗
      </span>
      <span className="sr-only">(opens in a new tab)</span>
    </TerminalExternalLink>
  );
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-3 pt-5">
        <span className="font-mono text-[11px] tracking-[0.18em] text-fg-muted">
          <span className="text-term-green">&gt;_</span> PORTFOLIO
        </span>
      </div>

      <nav aria-label="Main" className="flex-1 overflow-y-auto pb-4">
        <ul>
          {navigation.map((item) => (
            <li key={item.href}>
              <NavRow
                href={item.href}
                label={item.label}
                command={item.command}
                active={isActive(pathname, item.href)}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>

        <div className="mx-5 my-4 border-t border-line" />

        <ul>
          {externalLinks.map((item) => (
            <li key={item.href}>
              <ExternalRow
                href={item.href}
                label={item.label}
                command={item.command}
              />
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-line px-5 py-3">
        <p className="font-mono text-[10px] leading-relaxed text-fg-muted">
          {profile.location}
        </p>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside
      data-chrome="sidebar"
      className="fixed left-0 top-12 z-30 hidden h-[calc(100vh-3rem)] w-60 border-r border-line bg-bg-secondary lg:block"
    >
      <SidebarContent />
    </aside>
  );
}
