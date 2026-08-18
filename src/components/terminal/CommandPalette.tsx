"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { profile } from "@/data/profile";
import { publishedProjects } from "@/data/projects";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { cn } from "@/lib/utils";

interface Action {
  id: string;
  label: string;
  hint: string;
  group: "Navigate" | "Projects" | "Links";
  /** Internal route. */
  href?: string;
  /** External URL, opened in a new tab. */
  url?: string;
  keywords?: string;
}

const navActions: Action[] = [
  { id: "home", label: "Go Home", hint: "cd ~", group: "Navigate", href: "/" },
  { id: "about", label: "About", hint: "whoami", group: "Navigate", href: "/about" },
  {
    id: "projects",
    label: "View Projects",
    hint: "ls projects",
    group: "Navigate",
    href: "/projects",
  },
  {
    id: "experience",
    label: "View Experience",
    hint: "cat experience.log",
    group: "Navigate",
    href: "/experience",
  },
  {
    id: "skills",
    label: "View Skills",
    hint: "ls -la skills/",
    group: "Navigate",
    href: "/skills",
  },
  {
    id: "education",
    label: "View Education",
    hint: "cat education.txt",
    group: "Navigate",
    href: "/education",
  },
  {
    id: "contact",
    label: "Contact Abdalkarim",
    hint: "contact --me",
    group: "Navigate",
    href: "/contact",
  },
];

const linkActions: Action[] = [
  {
    id: "resume",
    label: "Open Résumé",
    hint: "resume.pdf",
    group: "Links",
    url: profile.resumeUrl,
    keywords: "cv download",
  },
  {
    id: "github",
    label: "Open GitHub",
    hint: profile.githubHandle,
    group: "Links",
    url: profile.github,
  },
  {
    id: "linkedin",
    label: "Open LinkedIn",
    hint: profile.linkedinHandle,
    group: "Links",
    url: profile.linkedin,
  },
  {
    id: "email",
    label: "Send Email",
    hint: profile.email,
    group: "Links",
    url: `mailto:${profile.email}`,
  },
];

const projectActions: Action[] = publishedProjects.map((p) => ({
  id: `project-${p.slug}`,
  label: p.shortTitle ?? p.title,
  hint: `cd ${p.slug}`,
  group: "Projects" as const,
  href: `/projects/${p.slug}`,
  keywords: `${p.technologies.join(" ")} ${p.categoryLabel}`,
}));

const allActions: Action[] = [...navActions, ...projectActions, ...linkActions];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  // Makes `aria-modal` true in practice, and hands focus back to the control
  // that opened the palette when it closes.
  useFocusTrap(dialogRef, open);

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allActions;
    return allActions.filter((a) =>
      `${a.label} ${a.hint} ${a.keywords ?? ""}`.toLowerCase().includes(q),
    );
  }, [query]);

  // Global ⌘K / Ctrl+K. Uses a modifier so it never interferes with typing.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        // Ctrl+K inside the terminal is readline's kill-to-end-of-line, and
        // the terminal wins its own keystrokes — the same precedence VS Code
        // gives its panel. ⌘K still opens the palette from anywhere.
        const inTerminal =
          event.ctrlKey &&
          !event.metaKey &&
          (event.target as HTMLElement | null)?.closest?.(
            '[data-terminal-input="true"]',
          );
        if (inTerminal) return;

        event.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  // Reset the query when the dialog opens or closes. This is the documented
  // "adjust state when a prop changes" pattern — done during render rather
  // than in an effect, so it costs no extra commit.
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    setQuery("");
    setActiveIndex(0);
  }

  // Lock background scroll and move focus into the input — both are external
  // systems, which is what effects are for.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(id);
    };
  }, [open]);

  // Keep the highlighted row scrolled into view.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const select = useCallback(
    (action: Action | undefined) => {
      if (!action) return;
      onOpenChange(false);
      if (action.url) {
        window.open(action.url, "_blank", "noopener,noreferrer");
      } else if (action.href) {
        router.push(action.href);
      }
    },
    [onOpenChange, router],
  );

  // Flat index across groups, so keyboard navigation matches visual order.
  let renderedIndex = -1;

  return (
    <AnimatePresence>
      {open ? (
        <div
          data-chrome="palette"
          className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]"
        >
          <motion.div
            className="absolute inset-0 bg-black/75"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => onOpenChange(false)}
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="relative w-full max-w-xl border border-line-strong bg-panel shadow-2xl shadow-black/60"
            initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.985 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                onOpenChange(false);
              } else if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((i) => (i + 1) % Math.max(1, results.length));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex(
                  (i) => (i - 1 + results.length) % Math.max(1, results.length),
                );
              } else if (event.key === "Enter") {
                event.preventDefault();
                select(results[activeIndex]);
              }
            }}
          >
            <div className="flex items-center gap-2 border-b border-line px-3.5 py-3">
              <span aria-hidden="true" className="font-mono text-sm text-term-green">
                &gt;
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                placeholder="Type a command or search..."
                className="min-w-0 flex-1 bg-transparent font-mono text-sm text-fg caret-term-green outline-none placeholder:text-fg-muted"
                role="combobox"
                aria-expanded="true"
                aria-controls={listboxId}
                aria-activedescendant={
                  results[activeIndex] ? `${listboxId}-${activeIndex}` : undefined
                }
                aria-autocomplete="list"
                aria-label="Search commands"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="hidden border border-line px-1.5 py-0.5 font-mono text-[10px] text-fg-muted sm:block">
                ESC
              </kbd>
            </div>

            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-label="Commands"
              className="max-h-[52vh] overflow-y-auto py-1.5"
            >
              {results.length === 0 ? (
                <li className="px-3.5 py-6 text-center font-mono text-xs text-fg-muted">
                  No matching commands.
                </li>
              ) : (
                (["Navigate", "Projects", "Links"] as const).map((group) => {
                  const groupItems = results.filter((a) => a.group === group);
                  if (groupItems.length === 0) return null;

                  return (
                    <li key={group} role="presentation">
                      <p
                        className="px-3.5 pb-1 pt-2 font-mono text-[10px] tracking-[0.16em] text-fg-muted"
                        role="presentation"
                      >
                        {group.toUpperCase()}
                      </p>
                      <ul role="presentation">
                        {groupItems.map((action) => {
                          renderedIndex += 1;
                          const index = renderedIndex;
                          const active = index === activeIndex;

                          return (
                            <li
                              key={action.id}
                              id={`${listboxId}-${index}`}
                              data-index={index}
                              role="option"
                              aria-selected={active}
                              onMouseEnter={() => setActiveIndex(index)}
                              onClick={() => select(action)}
                              className={cn(
                                "flex cursor-pointer items-center justify-between gap-3 px-3.5 py-2 font-mono text-[13px]",
                                active
                                  ? "bg-elevated text-fg"
                                  : "text-fg-secondary",
                              )}
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                <span
                                  aria-hidden="true"
                                  className={cn(
                                    "shrink-0",
                                    active ? "text-term-green" : "text-transparent",
                                  )}
                                >
                                  ▸
                                </span>
                                <span className="truncate">{action.label}</span>
                              </span>
                              <span className="shrink-0 truncate text-[11px] text-fg-muted">
                                {action.hint}
                                {action.url ? " ↗" : ""}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })
              )}
            </ul>

            <div className="flex items-center gap-4 border-t border-line px-3.5 py-2 font-mono text-[10px] text-fg-muted">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span>esc close</span>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
