/**
 * SYNTHETIC EEG SOURCE
 * ====================
 *
 * Generates 19-channel signals with the morphology the NeuroGrasp pipeline was
 * built to detect. Nothing here is recorded data and nothing claims to be: it
 * is a signal generator whose output exists to be pushed through the real
 * filter chain in `dsp.ts`.
 *
 * Everything is deterministic given a seed, so the console prints the same
 * numbers for the same command — a demo that reshuffles itself every run is
 * impossible to reason about.
 */

/** 10–20 placement, matching the 19-channel montage in the project. */
export const CHANNELS = [
  "Fp1", "Fp2", "F7", "F3", "Fz", "F4", "F8",
  "T3", "C3", "Cz", "C4", "T4",
  "T5", "P3", "Pz", "P4", "T6",
  "O1", "O2",
] as const;

export type Channel = (typeof CHANNELS)[number];

export const SAMPLE_RATE = 200;

export type Gesture =
  | "blink"
  | "double-blink"
  | "clench"
  | "grind-left"
  | "grind-right"
  | "rest";

/** Frontal channels carry ocular artifacts; temporal channels carry jaw EMG. */
const FRONTAL: Channel[] = ["Fp1", "Fp2", "F7", "F3", "Fz", "F4", "F8"];
const TEMPORAL_LEFT: Channel[] = ["T3", "T5", "F7"];
const TEMPORAL_RIGHT: Channel[] = ["T4", "T6", "F8"];

/** Small deterministic PRNG — mulberry32. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Resting EEG: an alpha rhythm over 1/f-ish background, plus the 50 Hz mains
 * hum the notch filter exists to remove. Amplitudes are in microvolts.
 */
function background(channel: Channel, n: number, seed: number): Float32Array {
  const random = rng(seed);
  const out = new Float32Array(n);

  // Alpha is strongest occipitally, which is why O1/O2 look different.
  const alphaGain = channel.startsWith("O") ? 18 : channel.startsWith("P") ? 11 : 6;
  const alphaPhase = random() * Math.PI * 2;

  let drift = 0;
  for (let i = 0; i < n; i += 1) {
    const t = i / SAMPLE_RATE;
    drift += (random() - 0.5) * 0.8;
    drift *= 0.995; // bounded random walk, standing in for slow 1/f content

    out[i] =
      alphaGain * Math.sin(2 * Math.PI * 10.2 * t + alphaPhase) +
      4 * Math.sin(2 * Math.PI * 21 * t + alphaPhase * 0.5) +
      6 * Math.sin(2 * Math.PI * 50 * t) + // mains interference
      drift +
      (random() - 0.5) * 5;
  }
  return out;
}

/** Eye blink: a large, slow frontal deflection a few hundred milliseconds wide. */
function blinkShape(t: number): number {
  // Asymmetric: fast rise, slower recovery — the shape DTW keys on.
  if (t < 0) return 0;
  const rise = Math.exp(-Math.pow((t - 0.12) / 0.055, 2));
  const recover = -0.28 * Math.exp(-Math.pow((t - 0.3) / 0.11, 2));
  return rise + recover;
}

/** Jaw EMG: a burst of high-frequency muscle activity, not a slow deflection. */
function emgBurst(t: number, duration: number, random: () => number): number {
  if (t < 0 || t > duration) return 0;
  const envelope = Math.sin((Math.PI * t) / duration) ** 2;
  // Broadband content well above the alpha band.
  return (
    envelope *
    (Math.sin(2 * Math.PI * 34 * t) * 0.5 +
      Math.sin(2 * Math.PI * 27 * t) * 0.3 +
      (random() - 0.5) * 1.4)
  );
}

export interface Epoch {
  /** channel-major samples, microvolts, pre-filtering */
  data: Float32Array[];
  gesture: Gesture;
}

/**
 * Builds one epoch of raw EEG with the requested gesture embedded in it.
 *
 * Artifact amplitudes are the reason the pipeline gates on peak-to-peak: a
 * blink is an order of magnitude larger than the background it sits on.
 */
export function generateEpoch(
  gesture: Gesture,
  seconds: number,
  seed: number,
): Epoch {
  const n = Math.round(seconds * SAMPLE_RATE);
  const data = CHANNELS.map((ch, i) => background(ch, n, seed + i * 977));
  const random = rng(seed ^ 0x9e3779b9);

  const at = (start: number, apply: (ch: Channel, i: number, t: number) => void) => {
    for (let i = 0; i < n; i += 1) {
      const t = i / SAMPLE_RATE - start;
      CHANNELS.forEach((ch) => apply(ch, i, t));
    }
  };

  const addFrontal = (start: number, amplitude: number) =>
    at(start, (ch, i, t) => {
      const gain = FRONTAL.includes(ch)
        ? ch.startsWith("Fp")
          ? 1
          : 0.55
        : 0.12; // volume conduction leaves a trace everywhere
      data[CHANNELS.indexOf(ch)][i] += amplitude * gain * blinkShape(t);
    });

  const addTemporal = (start: number, amplitude: number, side: "l" | "r" | "both") =>
    at(start, (ch, i, t) => {
      const left = TEMPORAL_LEFT.includes(ch);
      const right = TEMPORAL_RIGHT.includes(ch);
      const gain =
        side === "both"
          ? left || right
            ? 1
            : 0.2
          : side === "l"
            ? left
              ? 1
              : right
                ? 0.25
                : 0.2
            : right
              ? 1
              : left
                ? 0.25
                : 0.2;
      data[CHANNELS.indexOf(ch)][i] += amplitude * gain * emgBurst(t, 0.45, random);
    });

  switch (gesture) {
    case "blink":
      addFrontal(1.2, 240);
      break;
    case "double-blink":
      addFrontal(1.0, 230);
      addFrontal(1.6, 215);
      break;
    case "clench":
      addTemporal(1.2, 150, "both");
      break;
    case "grind-left":
      addTemporal(1.2, 140, "l");
      break;
    case "grind-right":
      addTemporal(1.2, 140, "r");
      break;
    case "rest":
      break;
  }

  return { data, gesture };
}
