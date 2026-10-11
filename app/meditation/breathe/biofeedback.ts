/**
 * Pure helpers for the biofeedback session (/meditation/breathe): which heart-rate reading to
 * show, and the breath pacer that eases the visual's breathing toward a calmer rate.
 */

/** The visual breathes at least this slowly and at most this quickly (seconds per breath). */
export const MIN_CYCLE_S = 4;
export const MAX_CYCLE_S = 16;
/** 6 breaths a minute: the usual target for slow, "resonance" breathing. */
export const DEFAULT_TARGET_PER_MIN = 6;
/** How much of the gap to the target the pacer closes per breath. */
const EASE_PER_BREATH = 0.12;
/** The pacer never changes the cycle by more than this per breath, so it never feels like a jump. */
const MAX_STEP_S = 0.6;
/** A watch reading older than this is stale; the camera's takes over. */
export const WATCH_FRESH_MS = 15_000;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function cycleForRate(perMin: number): number {
  return clamp(60 / perMin, MIN_CYCLE_S, MAX_CYCLE_S);
}

/**
 * Breath pacer. Starts from the person's measured breathing (or the target when there is no
 * reading yet), then lengthens or shortens the cycle a little each breath until it reaches
 * the target. A fresh breathing reading only re-anchors the pacer before it has started
 * guiding, so the guide doesn't chase the person it is guiding.
 */
export class BreathPacer {
  readonly target: number;
  cycle: number;
  private anchored = false;

  constructor(targetPerMin = DEFAULT_TARGET_PER_MIN) {
    this.target = cycleForRate(targetPerMin);
    this.cycle = this.target;
  }

  /** Feed the latest measured breathing rate (breaths/min), or null when there is none. */
  observe(measuredPerMin: number | null): void {
    if (this.anchored || measuredPerMin === null || !Number.isFinite(measuredPerMin) || measuredPerMin <= 0) return;
    this.cycle = cycleForRate(measuredPerMin);
    this.anchored = true;
  }

  /** Call once per completed breath; returns the cycle length for the next one. */
  nextBreath(): number {
    this.anchored = true;
    const gap = this.target - this.cycle;
    this.cycle += clamp(gap * EASE_PER_BREATH, -MAX_STEP_S, MAX_STEP_S);
    if (Math.abs(this.target - this.cycle) < 0.05) this.cycle = this.target;
    return this.cycle;
  }

  get perMin(): number {
    return 60 / this.cycle;
  }
}

export type HeartSource = 'watch' | 'camera';

export interface HeartReading {
  bpm: number;
  source: HeartSource;
}

/** The heart rate to show: a fresh Apple Watch reading first, then the camera's gated estimate. */
export function pickHeartRate(
  watch: { bpm: number | null; sampledAt: number | null } | null,
  cameraBpm: number | null,
  now: number,
): HeartReading | null {
  if (watch?.bpm && watch.sampledAt && now - watch.sampledAt <= WATCH_FRESH_MS) return { bpm: watch.bpm, source: 'watch' };
  if (cameraBpm) return { bpm: cameraBpm, source: 'camera' };
  return null;
}

/** Change since the first reading of the session, rounded; null until there are two readings. */
export function changeSince(first: number | null, current: number | null): number | null {
  if (first === null || current === null) return null;
  return Math.round(current - first);
}
