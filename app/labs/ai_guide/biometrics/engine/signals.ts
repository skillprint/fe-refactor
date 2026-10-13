// What the lab would hand the Skillprint pipeline per chunk:
//  1. `biometric_signals` — the existing per-slice JSON field on
//     GameChunkAnalysis (scoring/models.py), which nothing reads yet.
//  2. A fragment of the indicator contract v2 (scoring/indicators_v2.py)
//     filling the two body leaves the text-only scorer reports as neutral.

import { clamp } from "./dsp";
import { METHODS, type Analysis, type MethodName } from "./analysis";

// Heuristic gates — tune them against the strap in the lab. On the synthetic
// clips a real pulse scored +5…+13 dB and a pulse-free face −2.5…+2.9 dB, and
// ME-rPPG still produced a plausible 69 bpm from no pulse at all — so the SNR
// gate is not optional, and a second method has to agree.
export const GATES = {
  minSnrDb: 3,
  agreeBpm: 6,
  minAgreeing: 1, // other methods within agreeBpm of the primary
  minFacePresent: 0.8,
  maxMotion: 0.015, // inter-ocular distances per frame
  // Below this the nose trace is landmark/codec jitter, not breathing. Jitter can be
  // narrowband (a periodic artefact scores a high SNR), so gate on amplitude.
  minRespAmplitude: 0.001, // inter-ocular distances
};

export type Primary = MethodName | "best-snr";

export const respirationUsable = (a: Analysis) => !!a.respiration && a.respiration.amplitude >= GATES.minRespAmplitude;

export interface Baseline {
  hr: number;
  rmssd: number | null;
  at: number;
}

export function pickMethod(a: Analysis, primary: Primary): MethodName | null {
  if (primary !== "best-snr") return a.methods[primary].hr ? primary : null;
  let best: MethodName | null = null;
  for (const m of METHODS) {
    const hr = a.methods[m].hr;
    if (hr && (!best || hr.snrDb > a.methods[best].hr!.snrDb)) best = m;
  }
  return best;
}

const round = (v: number | null | undefined, d = 1) =>
  v === null || v === undefined || Number.isNaN(v) ? null : Math.round(v * 10 ** d) / 10 ** d;

export function biometricSignals(a: Analysis, primary: Primary) {
  const method = pickMethod(a, primary);
  const r = method ? a.methods[method] : null;
  const estimates = METHODS.map((m) => a.methods[m].hr?.perMin).filter((v): v is number => v !== undefined);
  const spread = estimates.length > 1 ? Math.max(...estimates) - Math.min(...estimates) : null;
  const agreeing = r?.hr
    ? METHODS.filter((m) => m !== method && a.methods[m].hr && Math.abs(a.methods[m].hr!.perMin - r.hr!.perMin) <= GATES.agreeBpm).length
    : 0;
  const usable =
    !!r?.hr &&
    r.hr.snrDb >= GATES.minSnrDb &&
    agreeing >= GATES.minAgreeing &&
    a.quality.facePresent >= GATES.minFacePresent &&
    !(a.quality.motion > GATES.maxMotion);
  const af = a.affect;
  return {
    heart_rate_bpm: usable ? round(r!.hr!.perMin) : null,
    hrv_ms: usable ? round(r!.hrv?.rmssdMs ?? null, 0) : null,
    respiration_rpm: respirationUsable(a) ? round(a.respiration!.perMin) : null,
    blink_rate_per_min: round(a.blinksPerMin),
    camera_affect: {
      smile: round((af.mouthSmileLeft + af.mouthSmileRight) / 2, 3),
      brow_down: round((af.browDownLeft + af.browDownRight) / 2, 3),
      brow_inner_up: round(af.browInnerUp, 3),
      jaw_open: round(af.jawOpen, 3),
      squint: round((af.eyeSquintLeft + af.eyeSquintRight) / 2, 3),
    },
    source: method ? `camera_rppg/${method}` : "camera_rppg",
    quality: {
      usable,
      snr_db: round(r?.hr?.snrDb ?? null),
      face_present: round(a.quality.facePresent, 2),
      motion: round(a.quality.motion, 4),
      method_spread_bpm: round(spread),
      agreeing_methods: agreeing,
    },
  };
}

/**
 * Illustrative mapping onto the v2 flow leaves, relative to the player's own
 * resting baseline: +25 % heart rate saturates arousal; tension rises as
 * RMSSD falls below baseline. Not validated — it shows the plumbing.
 */
export function indicatorFragment(a: Analysis, primary: Primary, base: Baseline | null) {
  const s = biometricSignals(a, primary);
  if (!base || s.heart_rate_bpm === null) return null;
  const flow: Record<string, number> = {};
  const sources: Record<string, string> = {};
  const confidence: Record<string, number> = {};
  const conf = clamp(((s.quality.snr_db ?? -10) + 3) / 9, 0.1, 0.9);
  flow.arousal_level = round(clamp(0.5 + (s.heart_rate_bpm - base.hr) / (0.5 * base.hr), 0, 1), 3)!;
  sources.arousal_level = "measured";
  confidence.arousal_level = round(conf, 2)!;
  if (s.hrv_ms !== null && base.rmssd) {
    flow.physical_tension = round(clamp(0.3 + (0.7 * (base.rmssd - s.hrv_ms)) / base.rmssd, 0, 1), 3)!;
    sources.physical_tension = "measured";
    confidence.physical_tension = round(conf * 0.6, 2)!; // camera HRV is the weaker signal
  }
  return { version: 2, flow, sources, confidence };
}

/** Name of the per-second event the AI Guide records on the session timeline. */
export const BIOMETRIC_EVENT = "BIOMETRIC";
export const BIOMETRIC_BASELINE_EVENT = "BIOMETRIC_BASELINE";

/**
 * One reading as a session event's data. The backend lists each chunk's
 * events in the vision prompts with their data cut at 120 characters of JSON
 * (scoring/schema_builder.py build_chunk_events_context), so the fields the
 * observer should read come first, under short keys, and the detail follows:
 *
 *   hr     heart rate (bpm), null unless the reading passes the quality gate
 *   ok     whether it passed
 *   hrv    RMSSD (ms) — unproven from a camera, see the lab README
 *   br     breaths per minute, null unless the head moved enough to read it
 *   blink  blinks per minute
 *   aro    arousal 0–1 against the player's baseline, when one is set
 *   src    the method behind hr
 *
 * Session.telemetry keeps the whole object, so `bio` carries the complete
 * `biometric_signals` shape for anything that wants it later.
 */
export function biometricEvent(a: Analysis, primary: Primary, base: Baseline | null): Record<string, unknown> {
  const s = biometricSignals(a, primary);
  const frag = indicatorFragment(a, primary, base);
  return {
    hr: s.heart_rate_bpm,
    ok: s.quality.usable,
    hrv: s.hrv_ms,
    br: s.respiration_rpm,
    blink: s.blink_rate_per_min,
    ...(frag?.flow.arousal_level !== undefined ? { aro: frag.flow.arousal_level } : {}),
    src: s.source.replace("camera_rppg/", ""),
    snr: s.quality.snr_db,
    bio: s,
    ...(frag ? { indicators: frag } : {}),
  };
}
