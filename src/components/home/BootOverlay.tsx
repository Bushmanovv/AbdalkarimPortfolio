"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

import { promptUser } from "@/data/profile";

const COMMAND = "./start";

const STEPS = [
  "profile",
  "projects",
  "experience",
  "engineering_stack",
] as const;

/** Sequence timings, in ms. */
const PROMPT_HOLD = 850; // blank screen — just the prompt and a caret
const TYPE_SPEED = 75; // per character of `./start`
const AFTER_TYPE = 280; // beat after the command lands, before output
const STEP_MS = 120; // per `[✓] … OK` line
const BEFORE_READY = 200;
const READY_HOLD = 420; // hold on "System ready." before dismissing

const TYPE_END = PROMPT_HOLD + COMMAND.length * TYPE_SPEED;
const OUTPUT_AT = TYPE_END + AFTER_TYPE;
const STEPS_END = OUTPUT_AT + STEPS.length * STEP_MS;
const READY_AT = STEPS_END + BEFORE_READY;
const DISMISS_AT = READY_AT + READY_HOLD;

const SESSION_KEY = "portfolio:booted";

/**
 * Boot sequence, shown once per session over the top of the already-rendered
 * page: a bare prompt, then `./start` typed out, then the init output.
 *
 * The page beneath is fully server-rendered before this mounts, so the overlay
 * never gates content for crawlers or assistive tech — it is `aria-hidden`
 * throughout. Anyone with reduced motion enabled never sees it at all, and any
 * key or click dismisses it instantly so it can't hold up a visitor in a hurry.
 */
export function BootOverlay() {
  const reduceMotion = useReducedMotion();

  const [visible, setVisible] = useState(false);
  const [typed, setTyped] = useState(0);
  const [showOutput, setShowOutput] = useState(false);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);

  const dismiss = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, "1");
    // Drop the pre-paint cover painted by the inline <head> script.
    document.documentElement.classList.remove("booting");
    setVisible(false);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    // The "already booted" flag is written when the sequence ENDS, not when it
    // starts. Strict Mode invokes this effect twice in development — mount,
    // cleanup, remount — and marking it up front would make the second pass
    // bail on a flag the first pass had just written, so the boot would never
    // play at all.
    if (sessionStorage.getItem(SESSION_KEY)) return;

    // Every state change is scheduled, never set in the effect body, so this
    // effect cannot trigger a cascading render.
    const timers: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => setVisible(true), 0),
    ];

    // Type the command one character at a time.
    for (let i = 1; i <= COMMAND.length; i += 1) {
      timers.push(
        setTimeout(() => setTyped(i), PROMPT_HOLD + i * TYPE_SPEED),
      );
    }

    timers.push(setTimeout(() => setShowOutput(true), OUTPUT_AT));

    STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(i + 1), OUTPUT_AT + (i + 1) * STEP_MS));
    });

    timers.push(setTimeout(() => setReady(true), READY_AT));
    timers.push(setTimeout(dismiss, DISMISS_AT));

    // The `booting` cover is deliberately NOT cleared here. Strict Mode runs
    // this effect twice in development — mount, cleanup, remount — and dropping
    // the cover in the cleanup would expose the page for a frame before the
    // second pass shows the overlay, which is the exact flash this is meant to
    // prevent. `dismiss` clears it, and the inline script's timeout is the
    // backstop if the sequence somehow never finishes.
    return () => timers.forEach(clearTimeout);
  }, [reduceMotion, dismiss]);

  // Let any key or click skip the sequence.
  useEffect(() => {
    if (!visible) return;
    window.addEventListener("keydown", dismiss);
    window.addEventListener("pointerdown", dismiss);
    return () => {
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("pointerdown", dismiss);
    };
  }, [visible, dismiss]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          // Decorative: the same information is in the page beneath.
          aria-hidden="true"
          data-chrome="boot"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-bg px-6"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        >
          {/* Fixed block height keeps the sequence from shifting as it grows. */}
          <div className="h-[220px] w-full max-w-md font-mono text-[13px] leading-relaxed">
            {/* Prompt + typed command */}
            <p>
              <span className="text-term-green">{promptUser}</span>
              <span className="text-fg-muted">:~$ </span>
              <span className="text-fg">{COMMAND.slice(0, typed)}</span>
              {!showOutput ? <span className="caret ml-0.5" /> : null}
            </p>

            {/* Init output */}
            <div
              className={
                showOutput
                  ? "opacity-100 transition-opacity duration-150"
                  : "opacity-0"
              }
            >
              <p className="mt-3 text-fg-muted">Initializing portfolio...</p>

              <ul className="mt-2 space-y-0.5">
                {STEPS.map((name, i) => (
                  <li
                    key={name}
                    className={
                      i < step
                        ? "flex justify-between text-fg-secondary"
                        : "flex justify-between text-transparent"
                    }
                  >
                    <span>
                      <span className={i < step ? "text-term-green" : ""}>
                        [✓]
                      </span>{" "}
                      {name}
                    </span>
                    <span className={i < step ? "text-term-green" : ""}>OK</span>
                  </li>
                ))}
              </ul>

              <p
                className={
                  ready
                    ? "mt-3 text-term-green opacity-100 transition-opacity duration-150"
                    : "mt-3 text-term-green opacity-0"
                }
              >
                System ready.
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
