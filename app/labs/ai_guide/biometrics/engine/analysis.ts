// Rolling analysis: keeps the last couple of minutes of per-frame face
// measurements, ME-rPPG outputs and strap samples, and turns a window of them
// into heart rate, HRV, breathing, blinks and expression per method.

import {
  HR_BAND_HZ, RESP_BAND_HZ, bandpass, estimateRate, findPeaks, hrvFromBeats, hrvFromIbis,
  mean, median, resample, std, type Hrv, type RateEstimate,
} from "./dsp";
import { chrom, green, pos, type RgbTrace } from "./classic";
import type { FaceFrame, RoiName } from "./face";
import type { StrapSample } from "./ble-hr";

export const METHODS = ["me-rppg", "pos", "chrom", "green"] as const;
export type MethodName = (typeof METHODS)[number];

export const FS = 30;
const KEEP_SEC = 150;

export interface AnalysisOptions {
  hrWindowSec: number;
  hrvWindowSec: number;
  respWindowSec: number;
  rois: RoiName[];
}

export interface MethodResult {
  hr: RateEstimate | null;
  hrv: Hrv | null;
  /** Band-passed pulse over the HR window, for plotting. */
  bvp: Float64Array;
}

export interface Analysis {
  t: number;
  methods: Record<MethodName, MethodResult>;
  truth: { bpm: number; hrv: Hrv | null; rrCount: number } | null;
  /** amplitude: std of the band-passed nose trace, in inter-ocular distances. */
  respiration: (RateEstimate & { amplitude: number }) | null;
  blinksPerMin: number | null;
  affect: Record<string, number>;
  quality: {
    fps: number;
    facePresent: number; // share of frames in the window with a face
    motion: number; // median per-frame landmark motion, inter-ocular distances
    luma: number;
    meLatencyMs: number;
  };
}

type Frame = Omit<FaceFrame, "hulls" | "box">;

export class Analyzer {
  frames: Frame[] = [];
  me: { t: number; v: number; ms: number }[] = [];
  strap: StrapSample[] = [];

  pushFrame(f: FaceFrame): void {
    const { hulls: _h, box: _b, ...rest } = f;
    this.frames.push(rest);
    this.prune(f.t);
  }

  pushMe(s: { t: number; v: number; ms: number }): void {
    this.me.push(s);
  }

  pushStrap(s: StrapSample): void {
    this.strap.push(s);
  }

  clear(): void {
    this.frames = [];
    this.me = [];
    this.strap = [];
  }

  private prune(now: number) {
    const cut = now - KEEP_SEC;
    while (this.frames.length && this.frames[0].t < cut) this.frames.shift();
    while (this.me.length && this.me[0].t < cut) this.me.shift();
    while (this.strap.length && this.strap[0].t < cut) this.strap.shift();
  }

  analyze(now: number, opt: AnalysisOptions): Analysis {
    const hrFrom = now - opt.hrWindowSec;
    const hrvFrom = now - opt.hrvWindowSec;
    const inHr = this.frames.filter((f) => f.t >= hrFrom);

    // Combined skin colour per frame from the selected ROIs, weighted by pixel count.
    const skin = (from: number) => {
      const t: number[] = [], r: number[] = [], g: number[] = [], b: number[] = [];
      for (const f of this.frames) {
        if (f.t < from || !f.face) continue;
        let sr = 0, sg = 0, sb = 0, n = 0;
        for (const name of opt.rois) {
          const s = f.rois[name];
          if (!s) continue;
          sr += s.r * s.px; sg += s.g * s.px; sb += s.b * s.px; n += s.px;
        }
        if (!n) continue;
        t.push(f.t); r.push(sr / n); g.push(sg / n); b.push(sb / n);
      }
      return { t, r, g, b };
    };

    const traceOver = (from: number): { trace: RgbTrace; ok: boolean } => {
      const s = skin(from);
      const span = s.t.length ? s.t[s.t.length - 1] - s.t[0] : 0;
      const ok = s.t.length > FS * 4 && span >= (now - from) * 0.8;
      const start = s.t[0] ?? from;
      return {
        ok,
        trace: {
          r: resample(s.t, s.r, FS, start, now),
          g: resample(s.t, s.g, FS, start, now),
          b: resample(s.t, s.b, FS, start, now),
        },
      };
    };

    const meOver = (from: number) => {
      const xs = this.me.filter((m) => m.t >= from);
      const span = xs.length ? xs[xs.length - 1].t - xs[0].t : 0;
      const ok = xs.length > FS * 2 && span >= (now - from) * 0.8;
      return { ok, y: resample(xs.map((m) => m.t), xs.map((m) => m.v), FS, xs[0]?.t ?? from, now) };
    };

    const hrvOf = (bvp: Float64Array, hr: RateEstimate | null) => {
      if (!hr) return null;
      const gap = Math.max(0.33, (0.6 * 60) / hr.perMin);
      return hrvFromBeats(findPeaks(bvp, FS, gap));
    };

    const empty: MethodResult = { hr: null, hrv: null, bvp: new Float64Array() };
    const methods = Object.fromEntries(METHODS.map((m) => [m, empty])) as Record<MethodName, MethodResult>;

    const shortT = traceOver(hrFrom);
    const longT = opt.hrvWindowSec > opt.hrWindowSec ? traceOver(hrvFrom) : shortT;
    for (const [name, fn] of [["pos", pos], ["chrom", chrom], ["green", green]] as const) {
      if (!shortT.ok) continue;
      const bvp = bandpass(fn(shortT.trace, FS), FS, ...HR_BAND_HZ);
      const hr = estimateRate(bvp, FS, ...HR_BAND_HZ);
      const longBvp = longT.ok ? bandpass(fn(longT.trace, FS), FS, ...HR_BAND_HZ) : null;
      methods[name] = { hr, bvp, hrv: longBvp ? hrvOf(longBvp, hr) : null };
    }

    const meShort = meOver(hrFrom);
    if (meShort.ok) {
      const bvp = bandpass(meShort.y, FS, ...HR_BAND_HZ);
      const hr = estimateRate(bvp, FS, ...HR_BAND_HZ);
      const meLong = meOver(hrvFrom);
      methods["me-rppg"] = { hr, bvp, hrv: meLong.ok ? hrvOf(bandpass(meLong.y, FS, ...HR_BAND_HZ), hr) : null };
    }

    // Ground truth over the same windows.
    const strapHr = this.strap.filter((s) => s.t >= hrFrom);
    const rr = this.strap.filter((s) => s.t >= hrvFrom).flatMap((s) => s.rrSec);
    const truth = strapHr.length
      ? { bpm: mean(strapHr.map((s) => s.bpm)), hrv: hrvFromIbis(rr), rrCount: rr.length }
      : null;

    // Breathing from the nose's vertical position relative to the eyes.
    const respFrames = this.frames.filter((f) => f.t >= now - opt.respWindowSec && f.face && !Number.isNaN(f.noseY));
    let respiration: Analysis["respiration"] = null;
    if (respFrames.length > FS * 15) {
      const y = resample(respFrames.map((f) => f.t), respFrames.map((f) => f.noseY), FS, respFrames[0].t, now);
      const filtered = bandpass(y, FS, ...RESP_BAND_HZ);
      const est = estimateRate(filtered, FS, ...RESP_BAND_HZ);
      respiration = est && { ...est, amplitude: std(filtered) };
    }

    // Blinks: rising edges through 0.5 over the HRV window.
    const blinkFrames = this.frames.filter((f) => f.t >= hrvFrom && f.face && !Number.isNaN(f.blink));
    let blinks = 0;
    for (let i = 1; i < blinkFrames.length; i++) if (blinkFrames[i - 1].blink < 0.5 && blinkFrames[i].blink >= 0.5) blinks++;
    const blinkSpan = blinkFrames.length > 1 ? blinkFrames[blinkFrames.length - 1].t - blinkFrames[0].t : 0;

    const affect: Record<string, number> = {};
    const faceFrames = inHr.filter((f) => f.face);
    for (const k of Object.keys(faceFrames[0]?.affect ?? {})) {
      affect[k] = mean(faceFrames.map((f) => f.affect[k]).filter((v) => !Number.isNaN(v)));
    }

    const motions = faceFrames.map((f) => f.motion).filter((v) => !Number.isNaN(v));
    const recentMe = this.me.filter((m) => m.t >= hrFrom);
    return {
      t: now,
      methods,
      truth,
      respiration,
      blinksPerMin: blinkSpan >= 20 ? (blinks / blinkSpan) * 60 : null,
      affect,
      quality: {
        fps: inHr.length / opt.hrWindowSec,
        facePresent: inHr.length ? faceFrames.length / inHr.length : 0,
        motion: motions.length ? median(motions) : NaN,
        luma: mean(faceFrames.map((f) => f.luma).filter((v) => !Number.isNaN(v))),
        meLatencyMs: recentMe.length ? mean(recentMe.map((m) => m.ms)) : NaN,
      },
    };
  }
}
