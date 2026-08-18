"use client";

import { useReducedMotion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { profile } from "@/data/profile";
import { runCommand, type OutputLine } from "@/lib/commands";
import { cwdForPath } from "@/lib/paths";

/**
 * TERMINAL STATE
 * ==============
 *
 * One provider owns the panel for the whole app. It is mounted inside the
 * layout, above the route slot, so scrollback, history, panel size and open
 * state survive every navigation.
 *
 * Every trigger — sidebar click, project card, scroll into a section, typed
 * input, command palette — ends up in the same `commit` function. There is no
 * second navigation path.
 */

export interface TerminalEntry {
  id: number;
  /** Echoed command, or null for a bare output block. */
  command: string | null;
  /** cwd at the moment the command ran, so scrollback reads correctly. */
  cwd: string;
  /** Host it ran on — scrollback from a device session keeps its own prompt. */
  host: string;
  lines: OutputLine[];
}

/**
 * `auto`      — CSS decides: collapsed on mobile, open on desktop. Avoids a
 *               hydration mismatch, since the server cannot know the viewport.
 * `open`      — explicit, uses `bodyHeight`.
 * `collapsed` — tab bar only.
 * `closed`    — hidden entirely; the header button brings it back.
 */
export type PanelMode = "auto" | "open" | "collapsed" | "closed";

/** Kept deliberately short: the panel is persistent, so it must not eat the
 *  viewport while reading. Drag the handle for more. Mirrors `--term-body`. */
const DEFAULT_HEIGHT = 100;
export const MIN_HEIGHT = 88;
export const MAX_HEIGHT_VH = 0.6;

/** Typing budget: the whole animation must fit inside this. */
const MAX_TYPE_MS = 300;
const MIN_CHAR_MS = 10;
const MAX_CHAR_MS = 25;
const POST_COMMAND_MS = 70;
/** Gap between streamed output frames — fast enough to read, slow enough to
 *  watch the activity gate open and close. */
const FRAME_MS = 260;

interface TerminalContextValue {
  entries: TerminalEntry[];
  history: string[];
  cwd: string;
  /** Host the shell is attached to — `null` unless a device session is open. */
  session: string | null;
  /** Command mid-animation, with how many characters are currently shown. */
  typing: { command: string; shown: number } | null;
  mode: PanelMode;
  bodyHeight: number;
  /** Whether the scrollback is actually on screen right now. */
  bodyOpen: boolean;

  /** Activated by a nav control: types the command, then runs it. */
  runNav: (command: string, href?: string) => void;
  /** Typed by the user: runs immediately, no re-typing. */
  submit: (input: string) => void;
  /** Scroll reaction: echoes a command without navigating or delaying. */
  echoSection: (key: string, command: string, note?: string) => void;
  /**
   * Writes to the scrollback without running anything — used for the things a
   * shell prints outside command execution: a `^C`d line, a bare prompt, a
   * completion listing.
   */
  print: (command: string | null, lines?: OutputLine[]) => void;
  /** Ctrl+L: wipes the screen without echoing a command or touching history. */
  clearScreen: () => void;

  openPanel: () => void;
  collapsePanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  setBodyHeight: (h: number) => void;
  /** Set by the panel so the header button can focus the input. */
  registerFocus: (fn: () => void) => void;
  focusInput: () => void;
}

/**
 * Tracks the breakpoint that `auto` mode keys off, so the panel controls can
 * describe what CSS is actually showing. Server snapshot is `false`, matching
 * the mobile-first default — no hydration mismatch, and only the collapse
 * button's icon and label depend on it, never layout.
 */
const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribeDesktop(onChange: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

const TerminalContext = createContext<TerminalContextValue | null>(null);

export function useTerminal(): TerminalContextValue {
  const ctx = useContext(TerminalContext);
  if (!ctx) throw new Error("useTerminal must be used inside <TerminalProvider>");
  return ctx;
}

const INTRO: TerminalEntry = {
  id: -1,
  command: null,
  cwd: "~",
  host: profile.host,
  lines: [
    { text: "Simulated shell — a UI layer, not a real terminal.", tone: "muted" },
    { text: "Type 'help' for available commands.", tone: "muted" },
  ],
};

export function TerminalProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const [entries, setEntries] = useState<TerminalEntry[]>([INTRO]);
  const [history, setHistory] = useState<string[]>([]);
  const [typing, setTyping] = useState<{ command: string; shown: number } | null>(
    null,
  );
  const [mode, setMode] = useState<PanelMode>("auto");
  const [bodyHeight, setBodyHeightState] = useState(DEFAULT_HEIGHT);
  const [session, setSession] = useState<string | null>(null);

  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );

  /** In `auto` mode CSS decides, so mirror the breakpoint here. */
  const bodyOpen = mode === "open" || (mode === "auto" && isDesktop);

  const counterRef = useRef(0);
  /** Bumped to invalidate any in-flight typing animation. */
  const genRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const focusRef = useRef<(() => void) | null>(null);
  /** Scroll commands already fired on this route. */
  const firedRef = useRef<Set<string>>(new Set());

  // cwd is derived, never stored — so it stays correct through back/forward
  // and any navigation that bypasses the terminal. It only changes on a route
  // change, which keeps the callbacks below stable within a page.
  const routeCwd = cwdForPath(pathname);

  // Attached to a device, the prompt describes that device: its host, and its
  // home directory rather than whichever page happens to be open behind it.
  const host = session ?? profile.host;
  const cwd = session ? "~" : routeCwd;

  // Scroll reactions are per-route; reset the dedupe set when the route changes.
  useEffect(() => {
    firedRef.current = new Set();
  }, [pathname]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const append = useCallback((entry: Omit<TerminalEntry, "id">) => {
    counterRef.current += 1;
    const id = counterRef.current;
    setEntries((prev) => [...prev, { ...entry, id }]);
  }, []);

  /**
   * The single execution path. Runs the command through the whitelist, records
   * the echo and output, and performs whatever action the result asks for.
   */
  const commit = useCallback(
    (
      command: string,
      hrefFallback?: string,
      /** Overrides the session for this one command — see `runNav`. */
      sessionOverride?: string | null,
    ) => {
      const activeSession =
        sessionOverride === undefined ? session : sessionOverride;
      const host = activeSession ?? profile.host;
      const cwd = activeSession ? "~" : routeCwd;

      const result = runCommand(command, { history, cwd, session: activeSession });

      setHistory((prev) => [...prev, command]);

      if (result.clear) {
        setEntries([]);
      } else {
        append({ command, cwd, host, lines: result.lines });
      }

      // A session change takes effect before the next prompt is drawn, so the
      // host in the prompt always matches where the next command will run.
      if (result.enterSession) setSession(result.enterSession);
      if (result.exitSession) setSession(null);

      // Streamed output: each frame lands after the one before it. The
      // generation counter already used by the typing animation cancels the
      // whole stream the moment anything else is entered.
      if (result.frames?.length) {
        genRef.current += 1;
        const gen = genRef.current;
        result.frames.forEach((frame, i) => {
          timersRef.current.push(
            setTimeout(
              () => {
                if (genRef.current !== gen) return;
                append({ command: null, cwd, host, lines: frame });
              },
              (i + 1) * FRAME_MS,
            ),
          );
        });
      }

      if (result.openUrl) {
        window.open(result.openUrl, "_blank", "noopener,noreferrer");
      }

      const target = result.navigateTo ?? hrefFallback;
      if (target) router.push(target);
    },
    [append, router, routeCwd, history, session],
  );

  /**
   * Leaves a device session. Navigation controls call this first: a sidebar
   * click means "open that page", and running `cd ~` against the prosthetic
   * hand would only ever answer "command not found".
   */
  const detach = useCallback(() => {
    if (!session) return;
    append({
      command: "exit",
      cwd: "~",
      host: session,
      lines: [{ text: `Connection to ${session} closed.`, tone: "muted" }],
    });
    setSession(null);
  }, [append, session]);

  const runNav = useCallback(
    (command: string, href?: string) => {
      // A newer request always wins — cancel whatever was typing.
      clearTimers();
      genRef.current += 1;
      const gen = genRef.current;
      setTyping(null);

      // Nav controls always address the portfolio, never an attached device.
      detach();

      // Skip the animation when nobody can see it, or when the visitor has
      // asked for reduced motion. Navigation must never wait on decoration.
      if (reduceMotion || !bodyOpen) {
        commit(command, href, null);
        return;
      }

      const charMs = Math.min(
        MAX_CHAR_MS,
        Math.max(MIN_CHAR_MS, Math.floor(MAX_TYPE_MS / Math.max(1, command.length))),
      );

      setTyping({ command, shown: 0 });

      for (let i = 1; i <= command.length; i += 1) {
        timersRef.current.push(
          setTimeout(() => {
            if (genRef.current !== gen) return;
            setTyping({ command, shown: i });
          }, i * charMs),
        );
      }

      timersRef.current.push(
        setTimeout(
          () => {
            if (genRef.current !== gen) return;
            setTyping(null);
            commit(command, href, null);
          },
          command.length * charMs + POST_COMMAND_MS,
        ),
      );
    },
    [bodyOpen, clearTimers, commit, detach, reduceMotion],
  );

  const print = useCallback(
    (command: string | null, lines: OutputLine[] = []) => {
      append({ command, cwd, host, lines });
    },
    [append, cwd, host],
  );

  const clearScreen = useCallback(() => setEntries([]), []);

  const submit = useCallback(
    (input: string) => {
      const command = input.trim();
      // Enter on an empty line just draws a fresh prompt, as in any shell —
      // it is not a no-op, and it is not history.
      if (!command) {
        print("");
        return;
      }
      clearTimers();
      genRef.current += 1;
      setTyping(null);
      commit(command);
    },
    [clearTimers, commit, print],
  );

  /**
   * Scroll reaction. Appends the command line only — no navigation, no timers,
   * nothing that could hold up the section reveal.
   */
  // Depends only on `cwd`, which changes once per route — so the observers in
  // SectionWatcher are not torn down and rebuilt on every command.
  const echoSection = useCallback(
    (key: string, command: string, note?: string) => {
      if (firedRef.current.has(key)) return;
      firedRef.current.add(key);
      append({
        command,
        cwd,
        host,
        lines: note ? [{ text: note, tone: "muted" }] : [],
      });
    },
    [append, cwd, host],
  );

  const openPanel = useCallback(() => setMode("open"), []);
  const collapsePanel = useCallback(() => setMode("collapsed"), []);
  const closePanel = useCallback(() => setMode("closed"), []);

  const togglePanel = useCallback(() => {
    setMode(bodyOpen ? "collapsed" : "open");
  }, [bodyOpen]);

  const setBodyHeight = useCallback((h: number) => {
    setBodyHeightState(h);
  }, []);

  const registerFocus = useCallback((fn: () => void) => {
    focusRef.current = fn;
  }, []);

  const focusInput = useCallback(() => {
    focusRef.current?.();
  }, []);

  const value = useMemo<TerminalContextValue>(
    () => ({
      entries,
      history,
      cwd,
      session,
      typing,
      mode,
      bodyHeight,
      bodyOpen,
      runNav,
      submit,
      echoSection,
      print,
      clearScreen,
      openPanel,
      collapsePanel,
      closePanel,
      togglePanel,
      setBodyHeight,
      registerFocus,
      focusInput,
    }),
    [
      entries,
      history,
      cwd,
      session,
      typing,
      mode,
      bodyHeight,
      bodyOpen,
      runNav,
      submit,
      echoSection,
      print,
      clearScreen,
      openPanel,
      collapsePanel,
      closePanel,
      togglePanel,
      setBodyHeight,
      registerFocus,
      focusInput,
    ],
  );

  return (
    <TerminalContext.Provider value={value}>{children}</TerminalContext.Provider>
  );
}
