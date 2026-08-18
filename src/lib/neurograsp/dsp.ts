/**
 * NEUROGRASP SIGNAL PIPELINE
 * ==========================
 *
 * The preprocessing chain described in the project write-up, implemented for
 * real and run in the browser:
 *
 *   50 Hz notch → 1–45 Hz band-pass → common-average reference
 *   → 2 s windows at 50% overlap → ±500 µV rejection
 *   → per-recording z-score → peak-to-peak activity gate (90th percentile)
 *
 * These are ordinary RBJ biquads and ordinary arithmetic — the filters filter.
 * What is NOT here is the trained model: DTW-kNN over blink waveforms and
 * Riemannian tangent-space classification of jaw activity do not ship to a
 * web page. The last stage therefore reports which branch a gated window is
 * *routed to*, on band-power alone, and says so. It never claims a prediction.
 */

import { CHANNELS, SAMPLE_RATE, type Channel } from "@/lib/neurograsp/signal";

interface Biquad {
  b0: number;
  b1: number;
  b2: number;
  a1: number;
  a2: number;
}

function notch(f0: number, q: number, fs: number): Biquad {
  const w0 = (2 * Math.PI * f0) / fs;
  const alpha = Math.sin(w0) / (2 * q);
  const a0 = 1 + alpha;
  return {
    b0: 1 / a0,
    b1: (-2 * Math.cos(w0)) / a0,
    b2: 1 / a0,
    a1: (-2 * Math.cos(w0)) / a0,
    a2: (1 - alpha) / a0,
  };
}

function highpass(f0: number, q: number, fs: number): Biquad {
  const w0 = (2 * Math.PI * f0) / fs;
  const alpha = Math.sin(w0) / (2 * q);
  const cos = Math.cos(w0);
  const a0 = 1 + alpha;
  return {
    b0: ((1 + cos) / 2) / a0,
    b1: (-(1 + cos)) / a0,
    b2: ((1 + cos) / 2) / a0,
    a1: (-2 * cos) / a0,
    a2: (1 - alpha) / a0,
  };
}

function lowpass(f0: number, q: number, fs: number): Biquad {
  const w0 = (2 * Math.PI * f0) / fs;
  const alpha = Math.sin(w0) / (2 * q);
  const cos = Math.cos(w0);
  const a0 = 1 + alpha;
  return {
    b0: ((1 - cos) / 2) / a0,
    b1: (1 - cos) / a0,
    b2: ((1 - cos) / 2) / a0,
    a1: (-2 * cos) / a0,
    a2: (1 - alpha) / a0,
  };
}

/** Transposed direct form II — one pass, no allocation beyond the output. */
function apply(filter: Biquad, input: Float32Array): Float32Array {
  const out = new Float32Array(input.length);
  let z1 = 0;
  let z2 = 0;
  for (let i = 0; i < input.length; i += 1) {
    const x = input[i];
    const y = filter.b0 * x + z1;
    z1 = filter.b1 * x - filter.a1 * y + z2;
    z2 = filter.b2 * x - filter.a2 * y;
    out[i] = y;
  }
  return out;
}

const Q = Math.SQRT1_2; // Butterworth
const NOTCH_50 = notch(50, 30, SAMPLE_RATE);
const HP_1 = highpass(1, Q, SAMPLE_RATE);
const LP_45 = lowpass(45, Q, SAMPLE_RATE);

/** 50 Hz notch, then the 1–45 Hz band-pass, in that order. */
export function preprocessChannel(raw: Float32Array): Float32Array {
  return apply(LP_45, apply(HP_1, apply(NOTCH_50, raw)));
}

/**
 * Common-average reference: subtract the instantaneous mean across all 19
 * channels, removing whatever every electrode sees at once.
 */
export function commonAverageReference(channels: Float32Array[]): Float32Array[] {
  const n = channels[0].length;
  const referenced = channels.map(() => new Float32Array(n));
  for (let i = 0; i < n; i += 1) {
    let sum = 0;
    for (const ch of channels) sum += ch[i];
    const mean = sum / channels.length;
    for (let c = 0; c < channels.length; c += 1) {
      referenced[c][i] = channels[c][i] - mean;
    }
  }
  return referenced;
}

function peakToPeak(signal: Float32Array, from: number, to: number): number {
  let min = Infinity;
  let max = -Infinity;
  for (let i = from; i < to; i += 1) {
    if (signal[i] < min) min = signal[i];
    if (signal[i] > max) max = signal[i];
  }
  return max - min;
}

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

/** Single-bin power via Goertzel — cheaper than a full transform for a few bands. */
function binPower(signal: Float32Array, freq: number, from: number, to: number) {
  const n = to - from;
  const k = (2 * Math.PI * freq) / SAMPLE_RATE;
  const coeff = 2 * Math.cos(k);
  let s1 = 0;
  let s2 = 0;
  for (let i = from; i < to; i += 1) {
    const s0 = signal[i] + coeff * s1 - s2;
    s2 = s1;
    s1 = s0;
  }
  return (s1 * s1 + s2 * s2 - coeff * s1 * s2) / (n * n);
}

function bandPower(
  signal: Float32Array,
  low: number,
  high: number,
  from: number,
  to: number,
): number {
  let total = 0;
  for (let f = low; f <= high; f += 1) total += binPower(signal, f, from, to);
  return total;
}

export type Branch = "blink" | "jaw" | null;

export interface WindowReport {
  index: number;
  /** Window start, in seconds from the beginning of the epoch. */
  start: number;
  /** Largest peak-to-peak across channels, in µV, after referencing. */
  peakToPeak: number;
  /** The recording's 90th-percentile p2p — the gate threshold. */
  threshold: number;
  gateOpen: boolean;
  /** True when p2p exceeded the ±500 µV rejection limit. */
  rejected: boolean;
  /** Which classifier branch this window is routed to. */
  branch: Branch;
  /** Channel carrying the largest excursion. */
  dominantChannel: Channel;
  lowBand: number;
  highBand: number;
  /**
   * A one-second slice of the dominant channel, centred on its largest
   * excursion. The full two-second window decimated to a text row aliases the
   * ~10 Hz alpha rhythm into visual static; a shorter slice reads as a wave
   * and still always contains the event that opened the gate.
   */
  trace: Float32Array;
}

const WINDOW_SECONDS = 2;
const OVERLAP = 0.5;
const REJECT_UV = 500;

/** Extracts `length` samples centred on the biggest excursion in a window. */
function sliceAroundPeak(
  signal: Float32Array,
  from: number,
  to: number,
  length: number,
): Float32Array {
  let peakIndex = from;
  let peak = -Infinity;
  let sum = 0;
  for (let i = from; i < to; i += 1) sum += signal[i];
  const mean = sum / (to - from);

  for (let i = from; i < to; i += 1) {
    const excursion = Math.abs(signal[i] - mean);
    if (excursion > peak) {
      peak = excursion;
      peakIndex = i;
    }
  }

  const start = Math.min(
    Math.max(from, peakIndex - Math.floor(length / 2)),
    to - length,
  );
  return signal.slice(start, start + length);
}

export interface PipelineResult {
  windows: WindowReport[];
  /** Filtered + referenced channels, kept for waveform rendering. */
  channels: Float32Array[];
  threshold: number;
}

/**
 * Runs the full chain over one epoch and reports per-window telemetry.
 *
 * The gate threshold is computed across the whole epoch, mirroring the
 * per-recording 90th-percentile rule rather than a fixed constant — the
 * detail that made the gate portable between sessions.
 */
export function runPipeline(raw: Float32Array[]): PipelineResult {
  const filtered = raw.map(preprocessChannel);
  const referenced = commonAverageReference(filtered);

  const size = WINDOW_SECONDS * SAMPLE_RATE;
  const hop = Math.round(size * (1 - OVERLAP));
  const total = referenced[0].length;

  const bounds: Array<{ from: number; to: number }> = [];
  for (let from = 0; from + size <= total; from += hop) {
    bounds.push({ from, to: from + size });
  }

  // Pass one: peak-to-peak per window, which the gate threshold derives from.
  const perWindow = bounds.map(({ from, to }) => {
    let best = 0;
    let dominant: Channel = CHANNELS[0];
    referenced.forEach((ch, i) => {
      const p2p = peakToPeak(ch, from, to);
      if (p2p > best) {
        best = p2p;
        dominant = CHANNELS[i];
      }
    });
    return { from, to, p2p: best, dominant };
  });

  const threshold = percentile(perWindow.map((w) => w.p2p), 0.9);

  // Pass two: gate, then route whatever survives.
  const windows = perWindow.map((w, index) => {
    const rejected = w.p2p > REJECT_UV;
    const gateOpen = !rejected && w.p2p >= threshold;

    const dominantSignal = referenced[CHANNELS.indexOf(w.dominant)];
    const trace = sliceAroundPeak(dominantSignal, w.from, w.to, SAMPLE_RATE);

    let branch: Branch = null;
    let lowBand = 0;
    let highBand = 0;

    if (gateOpen) {
      const signal = referenced[CHANNELS.indexOf(w.dominant)];
      // Ocular artifacts are slow; jaw EMG is broadband and fast. That
      // difference is the whole reason the classifier splits in two.
      lowBand = bandPower(signal, 1, 6, w.from, w.to);
      highBand = bandPower(signal, 20, 45, w.from, w.to);
      branch = lowBand >= highBand ? "blink" : "jaw";
    }

    return {
      index,
      start: w.from / SAMPLE_RATE,
      peakToPeak: w.p2p,
      threshold,
      gateOpen,
      rejected,
      branch,
      dominantChannel: w.dominant,
      lowBand,
      highBand,
      trace,
    };
  });

  return { windows, channels: referenced, threshold };
}

/** Renders a signal as a single row of block characters. */
export function sparkline(signal: Float32Array, columns = 56): string {
  const blocks = "▁▂▃▄▅▆▇█";
  const step = signal.length / columns;
  let min = Infinity;
  let max = -Infinity;
  for (const v of signal) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const span = max - min || 1;

  let out = "";
  for (let c = 0; c < columns; c += 1) {
    const from = Math.floor(c * step);
    const to = Math.max(from + 1, Math.floor((c + 1) * step));
    let peak = 0;
    let value = 0;
    for (let i = from; i < to && i < signal.length; i += 1) {
      // Keep the sample furthest from the mean so spikes survive decimation.
      const excursion = Math.abs(signal[i] - (min + span / 2));
      if (excursion >= peak) {
        peak = excursion;
        value = signal[i];
      }
    }
    const level = Math.min(
      blocks.length - 1,
      Math.max(0, Math.round(((value - min) / span) * (blocks.length - 1))),
    );
    out += blocks[level];
  }
  return out;
}
