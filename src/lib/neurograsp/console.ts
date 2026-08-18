/**
 * NEUROGRASP DEVICE CONSOLE
 * =========================
 *
 * A second, tiny command registry that takes over the terminal once a visitor
 * runs `ssh neurograsp`. Same rules as the outer shell: exact-match lookup
 * against a fixed table, no evaluation of input, nothing leaving the browser.
 *
 * What makes it worth existing is that `run` is not a scripted animation. It
 * generates a signal, pushes it through the real filter chain in `dsp.ts`, and
 * prints whatever comes out — including the windows that fail the gate.
 */

import type { LineTone, OutputLine } from "@/lib/commands";
import { runPipeline, sparkline } from "@/lib/neurograsp/dsp";
import { CHANNELS, generateEpoch, type Gesture } from "@/lib/neurograsp/signal";

export const NEUROGRASP_HOST = "neurograsp";

const line = (text: string, tone: LineTone = "default"): OutputLine => ({
  text,
  tone,
});
const blank = (): OutputLine => ({ text: "" });

export interface ConsoleResult {
  lines: OutputLine[];
  /** Frames printed one after another, for output that arrives over time. */
  frames?: OutputLine[][];
  exit?: boolean;
}

/** Gesture → hand action, matching the mapping held on the ESP32. */
const ACTIONS: Record<Exclude<Gesture, "rest">, { action: string; frame: number; servos: number[] }> = {
  blink:          { action: "OPEN HAND",     frame: 0x01, servos: [10, 8, 8, 8, 8, 90] },
  "double-blink": { action: "PINCH",         frame: 0x02, servos: [95, 92, 12, 10, 10, 90] },
  clench:         { action: "CLOSE FIST",    frame: 0x03, servos: [120, 130, 132, 128, 126, 90] },
  "grind-left":   { action: "ROTATE WRIST ←", frame: 0x04, servos: [40, 35, 35, 35, 35, 25] },
  "grind-right":  { action: "ROTATE WRIST →", frame: 0x05, servos: [40, 35, 35, 35, 35, 155] },
};

const SERVO_LABELS = ["THUMB", "INDEX", "MIDDLE", "RING", "PINKY", "WRIST"];

/** Six MG996R positions as bars, which reads faster than six numbers. */
function servoBars(angles: number[]): OutputLine[] {
  return angles.map((angle, i) => {
    const filled = Math.round((angle / 180) * 12);
    const bar = "▓".repeat(filled) + "░".repeat(12 - filled);
    return line(
      `  ${SERVO_LABELS[i].padEnd(7)} ${bar} ${String(Math.round(angle)).padStart(3)}°`,
      "yellow",
    );
  });
}

export function motd(): OutputLine[] {
  return [
    line("Linux neurograsp 6.6.51-v8-16k+ aarch64", "muted"),
    blank(),
    line("  ███ NeuroGrasp — brain–computer interface", "green"),
    line("      Raspberry Pi 5 · inference host", "muted"),
    blank(),
    line("  headset ....... 19ch @ 200 Hz          [ LINK UP ]", "muted"),
    line("  pipeline ...... notch · 1-45Hz · CAR   [ LOADED ]", "muted"),
    line("  uart0 ......... 115200 8N1 → ESP32     [ READY ]", "muted"),
    line("  hand .......... InMoov · 6× MG996R     [ HOMED ]", "muted"),
    blank(),
    line("Synthetic signal · real DSP · simulated actuation.", "muted"),
    line("Type 'run' to push a gesture through the pipeline, 'help' for more.", "muted"),
  ];
}

function help(): OutputLine[] {
  return [
    line("NEUROGRASP CONSOLE", "green"),
    blank(),
    line("  run [gesture] ....... acquire, filter, gate, route, actuate", "muted"),
    line("  gestures ............ list the five control gestures", "muted"),
    line("  pipeline ............ the preprocessing chain, in order", "muted"),
    line("  channels ............ the 19-channel montage", "muted"),
    line("  status .............. link, host and actuator state", "muted"),
    line("  exit ................ close the session", "muted"),
    blank(),
    line("  run blink · run double-blink · run clench", "cyan"),
    line("  run grind-left · run grind-right · run rest", "cyan"),
  ];
}

const GESTURE_ALIASES: Record<string, Gesture> = {
  blink: "blink",
  "single-blink": "blink",
  "double-blink": "double-blink",
  double: "double-blink",
  clench: "clench",
  jaw: "clench",
  fist: "clench",
  "grind-left": "grind-left",
  left: "grind-left",
  "grind-right": "grind-right",
  right: "grind-right",
  rest: "rest",
  idle: "rest",
};

/**
 * The centrepiece: one acquisition, streamed frame by frame.
 *
 * Every number printed here comes back from `runPipeline` — the peak-to-peak
 * figures, the gate threshold, the band powers and the routing decision are
 * computed from the generated signal, not written into the script.
 */
function run(gesture: Gesture, seed: number): ConsoleResult {
  // Six seconds gives five overlapping windows, so the 90th-percentile gate
  // has a distribution to sit in rather than a single sample.
  const epoch = generateEpoch(gesture, 6, seed);
  const result = runPipeline(epoch.data);

  const frames: OutputLine[][] = [];

  frames.push([
    line(`acquiring 6.0 s · ${CHANNELS.length} channels · 200 Hz ...`, "muted"),
  ]);

  frames.push([
    line("  50 Hz notch ......... applied", "muted"),
    line("  1-45 Hz band-pass ... applied", "muted"),
    line("  common-avg ref ...... applied", "muted"),
    line(
      `  gate threshold ...... ${result.threshold.toFixed(1)} µV  (90th pct)`,
      "muted",
    ),
  ]);

  // One frame per analysis window — the gate visibly opening and closing.
  for (const w of result.windows) {
    const bar = sparkline(w.trace, 46);
    const state = w.rejected
      ? "REJECT"
      : w.gateOpen
        ? "OPEN  "
        : "closed";
    const tone: LineTone = w.rejected
      ? "error"
      : w.gateOpen
        ? "green"
        : "muted";

    frames.push([
      line(
        `t+${w.start.toFixed(1)}s ${w.dominantChannel.padEnd(3)} │${bar}│`,
        w.gateOpen ? "cyan" : "muted",
      ),
      line(
        `        p2p ${w.peakToPeak.toFixed(0).padStart(4)} µV   gate ${state}` +
          (w.gateOpen
            ? `   → ${w.branch === "blink" ? "DTW-kNN (blink)" : "Riemannian (jaw)"}`
            : ""),
        tone,
      ),
    ]);
  }

  const gated = result.windows.filter((w) => w.gateOpen);

  if (gated.length === 0 || gesture === "rest") {
    frames.push([
      blank(),
      line("no window cleared the activity gate — holding position.", "muted"),
      line("uart0: idle", "muted"),
    ]);
    return { lines: [], frames };
  }

  const blinkVotes = gated.filter((w) => w.branch === "blink").length;
  const branch = blinkVotes > gated.length - blinkVotes ? "blink" : "jaw";
  const mapping = ACTIONS[gesture as Exclude<Gesture, "rest">];

  frames.push([
    blank(),
    line(
      `${gated.length} of ${result.windows.length} windows gated → ${branch === "blink" ? "blink" : "jaw"} branch`,
      "green",
    ),
    line(
      `low band ${gated[0].lowBand.toFixed(2)} · high band ${gated[0].highBand.toFixed(2)} µV²`,
      "muted",
    ),
  ]);

  frames.push([
    blank(),
    line(
      `uart0 ← 0x${mapping.frame.toString(16).padStart(2, "0")}   115200 8N1`,
      "cyan",
    ),
    line(`esp32: ${mapping.action}`, "green"),
    blank(),
    ...servoBars(mapping.servos),
  ]);

  frames.push([
    blank(),
    line(
      "Routing is band-power only. The trained DTW-kNN and Riemannian models",
      "muted",
    ),
    line("run on the Pi, not in a browser tab.", "muted"),
  ]);

  return { lines: [], frames };
}

let seedCounter = 1;

/** Resolves one line of input inside the device session. */
export function runNeurograspCommand(input: string): ConsoleResult {
  const normalized = input.trim().toLowerCase().replace(/\s+/g, " ");

  if (!normalized) return { lines: [] };

  if (normalized === "exit" || normalized === "logout" || normalized === "quit") {
    return {
      lines: [line("Connection to neurograsp closed.", "muted")],
      exit: true,
    };
  }

  if (normalized === "help" || normalized === "?") return { lines: help() };

  if (normalized === "motd" || normalized === "banner") return { lines: motd() };

  if (normalized === "gestures") {
    return {
      lines: [
        line("CONTROL GESTURES", "green"),
        blank(),
        ...(Object.keys(ACTIONS) as Array<Exclude<Gesture, "rest">>).map((g) =>
          line(`  ${g.padEnd(14)} → ${ACTIONS[g].action}`, "muted"),
        ),
        blank(),
        line(
          "Deliberate facial artifacts, not motor imagery — voluntary, repeatable,",
          "muted",
        ),
        line("and reachable for users with limb difference.", "muted"),
      ],
    };
  }

  if (normalized === "pipeline") {
    return {
      lines: [
        line("PREPROCESSING CHAIN", "green"),
        blank(),
        line("  1  drop first 40 s          settling artifacts", "muted"),
        line("  2  50 Hz notch              mains interference", "muted"),
        line("  3  1-45 Hz band-pass        keep the usable band", "muted"),
        line("  4  common-average reference across all 19 channels", "muted"),
        line("  5  2 s windows @ 50%        400 samples, 200 hop", "muted"),
        line("  6  reject > 500 µV          saturated windows out", "muted"),
        line("  7  per-recording z-score    shape, not electrode gain", "muted"),
        line("  8  activity gate            p2p vs 90th percentile", "muted"),
        blank(),
        line("Steps 2-8 are the ones running in this tab.", "muted"),
      ],
    };
  }

  if (normalized === "channels" || normalized === "montage") {
    const rows: OutputLine[] = [];
    for (let i = 0; i < CHANNELS.length; i += 7) {
      rows.push(line(`  ${CHANNELS.slice(i, i + 7).join("  ")}`, "cyan"));
    }
    return {
      lines: [
        line("10-20 MONTAGE — 19 channels", "green"),
        blank(),
        ...rows,
        blank(),
        line("Frontal carries ocular artifacts; temporal carries jaw EMG.", "muted"),
      ],
    };
  }

  if (normalized === "status" || normalized === "systemctl status") {
    return {
      lines: [
        line("  headset ....... 19ch @ 200 Hz          [ LINK UP ]", "green"),
        line("  inference ..... Raspberry Pi 5         [ ACTIVE ]", "green"),
        line("  uart0 ......... 115200 8N1 → ESP32     [ READY ]", "green"),
        line("  hand .......... InMoov · 6× MG996R     [ HOMED ]", "green"),
        line("  wifi ap ....... gesture map editable   [ UP ]", "green"),
        blank(),
        line("Simulated device. No hardware is attached to this page.", "muted"),
      ],
    };
  }

  const runMatch = normalized.match(/^(?:run|stream|\.\/run_inference\.py)(?: (.+))?$/);
  if (runMatch) {
    const requested = runMatch[1]?.trim();
    if (!requested) {
      seedCounter += 1;
      return run("blink", seedCounter);
    }
    const gesture = GESTURE_ALIASES[requested];
    if (!gesture) {
      return {
        lines: [
          line(`run: unknown gesture '${requested}'`, "error"),
          line(
            `Try: ${Object.keys(ACTIONS).join(", ")}, rest`,
            "muted",
          ),
        ],
      };
    }
    seedCounter += 1;
    return run(gesture, seedCounter);
  }

  return {
    lines: [
      line(`neurograsp: ${normalized.split(" ")[0]}: command not found`, "error"),
      line("Try 'help', or 'exit' to leave the session.", "muted"),
    ],
  };
}
