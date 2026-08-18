"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  MAX_HEIGHT_VH,
  MIN_HEIGHT,
  useTerminal,
} from "@/components/terminal/TerminalProvider";
import { profile } from "@/data/profile";
import {
  columnize,
  completeCommand,
  type LineTone,
  type OutputLine,
} from "@/lib/commands";
import { cn } from "@/lib/utils";

const toneClass: Record<LineTone, string> = {
  default: "text-fg",
  muted: "text-fg-muted",
  green: "text-term-green",
  cyan: "text-term-cyan",
  purple: "text-term-purple",
  yellow: "text-term-yellow",
  error: "text-term-red",
};

/** Decorative VS Code panel tabs. Only TERMINAL is real. */
const DECOR_TABS = ["PROBLEMS", "OUTPUT", "DEBUG CONSOLE"];

/**
 * The prompt carries the host, so an attached device session is visible at a
 * glance and stays visible in the scrollback it produced.
 */
function Prompt({ cwd, host }: { cwd: string; host: string }) {
  const attached = host !== profile.host;
  return (
    <span className="shrink-0 whitespace-pre">
      <span className={attached ? "text-term-purple" : "text-term-green"}>
        {profile.username}@{host}
      </span>
      <span className="text-fg-muted">:</span>
      <span className="text-term-cyan">{cwd}</span>
      <span className="text-fg-muted">$ </span>
    </span>
  );
}

export function TerminalPanel() {
  const {
    entries,
    history,
    cwd,
    session,
    typing,
    mode,
    bodyHeight,
    bodyOpen,
    submit,
    print,
    clearScreen,
    openPanel,
    collapsePanel,
    closePanel,
    togglePanel,
    setBodyHeight,
    registerFocus,
  } = useTerminal();

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  /** Live prompt host: the attached device, or the portfolio itself. */
  const host = session ?? profile.host;

  const [value, setValue] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [dragging, setDragging] = useState(false);

  /** The half-typed line set aside while browsing history, as readline does. */
  const draftRef = useRef("");
  /** Caret position to restore after a programmatic line change. */
  const caretRef = useRef<number | null>(null);
  /** Consecutive Tab presses — the second one lists candidates. */
  const tabRef = useRef(0);
  /** Whether the view was scrolled to the bottom before the last output. */
  const stickRef = useRef(true);
  /** Where the pointer went down, to tell a click apart from a drag-select. */
  const pressRef = useRef<{ x: number; y: number } | null>(null);

  // Let the header button focus this input.
  useEffect(() => {
    registerFocus(() => {
      inputRef.current?.focus();
    });
  }, [registerFocus]);

  // Follow new output only when the view is already at the bottom. Scrolling
  // up to read something is a deliberate act; output must not yank it back.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [entries, typing]);

  // Programmatic line edits (history recall, kills, completion) put the caret
  // where readline would leave it, rather than at the end of the value.
  useEffect(() => {
    const caret = caretRef.current;
    if (caret === null) return;
    caretRef.current = null;
    inputRef.current?.setSelectionRange(caret, caret);
  }, [value]);

  /** Replaces the current line, restoring the caret afterwards. */
  const setLine = useCallback(
    (next: string, caret = next.length) => {
      // An unchanged value bails out of re-rendering, so the effect above would
      // never fire — move the caret now instead of stranding it.
      if (next === value) {
        inputRef.current?.setSelectionRange(caret, caret);
        return;
      }
      caretRef.current = caret;
      setValue(next);
    },
    [value],
  );

  const resetLine = useCallback(() => {
    draftRef.current = "";
    setHistoryIndex(-1);
    setValue("");
  }, []);

  // ── Drag to resize ────────────────────────────────────────────────────
  const onHandleDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      const startY = event.clientY;
      const startH =
        scrollRef.current?.getBoundingClientRect().height ?? bodyHeight;
      setDragging(true);
      openPanel();

      const max = window.innerHeight * MAX_HEIGHT_VH;

      const onMove = (e: PointerEvent) => {
        const next = Math.min(
          max,
          Math.max(MIN_HEIGHT, startH + (startY - e.clientY)),
        );
        setBodyHeight(next);
      };
      const onUp = () => {
        setDragging(false);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [bodyHeight, openPanel, setBodyHeight],
  );

  // Keyboard resize, so the handle isn't pointer-only.
  const onHandleKey = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const max = window.innerHeight * MAX_HEIGHT_VH;
      if (event.key === "ArrowUp") {
        event.preventDefault();
        openPanel();
        setBodyHeight(Math.min(max, bodyHeight + 24));
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        openPanel();
        setBodyHeight(Math.max(MIN_HEIGHT, bodyHeight - 24));
      }
    },
    [bodyHeight, openPanel, setBodyHeight],
  );

  // ── History ───────────────────────────────────────────────────────────
  const recallPrev = useCallback(() => {
    if (history.length === 0) return;
    if (historyIndex === -1) draftRef.current = value;
    const next =
      historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
    setHistoryIndex(next);
    setLine(history[next]);
  }, [history, historyIndex, setLine, value]);

  const recallNext = useCallback(() => {
    if (historyIndex === -1) return;
    const next = historyIndex + 1;
    if (next >= history.length) {
      setHistoryIndex(-1);
      setLine(draftRef.current);
    } else {
      setHistoryIndex(next);
      setLine(history[next]);
    }
  }, [history, historyIndex, setLine]);

  // ── Input ─────────────────────────────────────────────────────────────
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const el = event.currentTarget;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? start;

    // Any other key breaks a Tab-Tab sequence.
    if (event.key !== "Tab") tabRef.current = 0;

    // Readline line editing. Ctrl only — Cmd and Alt belong to the browser and
    // to macOS text navigation, and hijacking them would be worse than useless.
    if (event.ctrlKey && !event.metaKey && !event.altKey) {
      switch (event.key) {
        case "c": {
          // With a selection, Ctrl+C copies — the same call VS Code's terminal
          // makes. Only a bare Ctrl+C is an interrupt.
          if (start !== end) return;
          event.preventDefault();
          stickRef.current = true;
          print(`${value}^C`);
          resetLine();
          return;
        }
        case "d": {
          event.preventDefault();
          if (!value) {
            // EOF on an empty line ends the session, as in any shell.
            stickRef.current = true;
            submit("exit");
            resetLine();
            return;
          }
          if (start !== end) setLine(value.slice(0, start) + value.slice(end), start);
          else if (start < value.length)
            setLine(value.slice(0, start) + value.slice(start + 1), start);
          return;
        }
        case "l":
          // Clears the screen and redraws the prompt — the line you were
          // typing survives, and no `clear` is echoed.
          event.preventDefault();
          stickRef.current = true;
          clearScreen();
          return;
        case "u":
          event.preventDefault();
          setLine(value.slice(start), 0);
          return;
        case "k":
          event.preventDefault();
          setLine(value.slice(0, start), start);
          return;
        case "w": {
          event.preventDefault();
          // Skip the whitespace behind the caret, then kill one word.
          const head = value
            .slice(0, start)
            .replace(/\s+$/, "")
            .replace(/\S+$/, "");
          setLine(head + value.slice(start), head.length);
          return;
        }
        case "a":
          event.preventDefault();
          el.setSelectionRange(0, 0);
          return;
        case "e":
          event.preventDefault();
          el.setSelectionRange(value.length, value.length);
          return;
        case "p":
          event.preventDefault();
          recallPrev();
          return;
        case "n":
          event.preventDefault();
          recallNext();
          return;
        default:
          break;
      }
    }

    if (event.key === "Enter") {
      event.preventDefault();
      stickRef.current = true;
      submit(value);
      resetLine();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      recallPrev();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      recallNext();
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const { completed, matches } = completeCommand(value);

      if (completed) {
        setLine(completed);
        tabRef.current = 0;
        return;
      }

      // Nothing left to fill in: a second Tab lists the candidates into the
      // scrollback and redraws the prompt, keeping what was typed.
      if (matches.length > 1) {
        tabRef.current += 1;
        if (tabRef.current >= 2) {
          tabRef.current = 0;
          stickRef.current = true;
          print(
            value,
            columnize(matches).map((text) => ({ text, tone: "muted" as LineTone })),
          );
        }
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      collapsePanel();
    }
  }

  function renderLine(l: OutputLine, key: number) {
    const className = cn(
      "whitespace-pre-wrap break-words",
      toneClass[l.tone ?? "default"],
    );

    if (l.href) {
      return (
        <Link
          key={key}
          href={l.href}
          className={cn(
            className,
            "block w-fit underline-offset-2 hover:underline",
          )}
        >
          {l.text}
        </Link>
      );
    }
    if (l.external) {
      return (
        <a
          key={key}
          href={l.external}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            className,
            "block w-fit underline-offset-2 hover:underline",
          )}
        >
          {l.text}
        </a>
      );
    }
    return (
      <div key={key} className={className}>
        {l.text || " "}
      </div>
    );
  }

  if (mode === "closed") return null;

  return (
    <section
      aria-label="Terminal panel"
      data-chrome="terminal"
      data-dragging={dragging || undefined}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg-secondary lg:left-60"
    >
      {/* Resize handle — available whenever the body is showing, including the
          default `auto` state. Dragging switches the panel to explicit mode. */}
      {bodyOpen ? (
        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label="Resize terminal panel"
          tabIndex={0}
          onPointerDown={onHandleDown}
          onKeyDown={onHandleKey}
          className="absolute inset-x-0 -top-1 h-2 cursor-row-resize hover:bg-term-green/25 focus-visible:bg-term-green/40"
        />
      ) : null}

      {/* Tab strip */}
      <div className="flex h-[34px] items-stretch justify-between border-b border-line px-2">
        <div className="flex items-stretch gap-1 overflow-hidden">
          {/* Decorative tabs, hidden from assistive tech — they are chrome,
              not controls, and announcing dead tabs would be misleading. */}
          <div
            aria-hidden="true"
            className="hidden items-stretch gap-4 pl-1 sm:flex"
          >
            {DECOR_TABS.map((tab) => (
              <span
                key={tab}
                className="flex items-center font-mono text-[10px] tracking-[0.12em] text-fg-muted/70"
              >
                {tab}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              togglePanel();
              requestAnimationFrame(() => inputRef.current?.focus());
            }}
            aria-expanded={bodyOpen}
            className="relative flex items-center gap-1.5 px-3 font-mono text-[10px] tracking-[0.12em] text-fg"
          >
            <span aria-hidden="true" className="text-term-green">
              &gt;_
            </span>
            TERMINAL
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-px bg-term-green"
            />
          </button>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={bodyOpen ? collapsePanel : openPanel}
            className="flex h-6 w-6 items-center justify-center text-fg-muted transition-colors hover:text-fg"
            aria-label={bodyOpen ? "Collapse terminal" : "Expand terminal"}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path
                d={bodyOpen ? "M2 7.5l4-3 4 3" : "M2 4.5l4 3 4-3"}
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={closePanel}
            className="flex h-6 w-6 items-center justify-center text-fg-muted transition-colors hover:text-fg"
            aria-label="Close terminal"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
              <path
                d="M1 1l10 10M11 1L1 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollback + input. Height comes from the CSS var so `auto` mode can
          be collapsed on mobile and open on desktop without JS. */}
      <div
        ref={scrollRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          stickRef.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 24;
        }}
        onPointerDown={(e) => {
          pressRef.current = { x: e.clientX, y: e.clientY };
        }}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) return;

          const press = pressRef.current;
          pressRef.current = null;
          const dragged = press
            ? Math.hypot(e.clientX - press.x, e.clientY - press.y) > 4
            : false;

          // A drag, or a double/triple click, is a selection gesture — and
          // focusing the input collapses the selection, which would leave
          // scrollback impossible to copy. A plain click still focuses.
          if (dragged || e.detail > 1) return;
          inputRef.current?.focus();
        }}
        style={{ height: "var(--term-body)" }}
        className={cn(
          "overflow-y-auto font-mono text-[12.5px] leading-[1.6]",
          !dragging && "transition-[height] duration-200",
        )}
      >
        {/* Padding lives on this inner wrapper, not the scroll container.
            With border-box sizing, padding on a zero-height container floors
            its height at the padding sum — which would leak a strip of
            scrollback below the bar when collapsed. */}
        <div className="px-3 py-2">
          <div aria-live="polite" aria-atomic="false">
            {entries.map((entry) => (
              <div key={entry.id} className="mb-1">
                {entry.command !== null ? (
                  <div className="flex flex-wrap">
                    <Prompt cwd={entry.cwd} host={entry.host} />
                    <span className="break-all text-fg">{entry.command}</span>
                  </div>
                ) : null}
                {entry.lines.map((l, i) => renderLine(l, i))}
              </div>
            ))}
          </div>

          {/* Live line: shows the typing animation, or the real input. */}
          {typing ? (
            <div aria-hidden="true" className="flex flex-wrap">
              <Prompt cwd={cwd} host={host} />
              <span className="break-all text-fg">
                {typing.command.slice(0, typing.shown)}
              </span>
              <span className="caret ml-0.5" />
            </div>
          ) : (
            <div className="flex flex-wrap items-center">
              <label htmlFor={inputId}>
                <span aria-hidden="true">
                  <Prompt cwd={cwd} host={host} />
                </span>
                <span className="sr-only">Terminal command input</span>
              </label>
              <input
                ref={inputRef}
                id={inputId}
                data-terminal-input="true"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                className="min-w-0 flex-1 bg-transparent text-fg caret-term-green outline-none"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                enterKeyHint="go"
                aria-describedby={`${inputId}-hint`}
              />
            </div>
          )}
          <p id={`${inputId}-hint`} className="sr-only">
            Type a command and press Enter. Up and down arrows recall history,
            Tab autocompletes and a second Tab lists the candidates. Control C
            cancels the line, Control L clears the screen, Control U and
            Control W delete to the start of the line and the previous word.
            Escape collapses the panel.
          </p>
        </div>
      </div>
    </section>
  );
}
