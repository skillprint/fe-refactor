// Signal processing shared by every rPPG method: resampling, zero-phase
// band-pass, spectral heart-rate estimation, peak detection and HRV.
// Pure functions over Float64Array so they run in tests without a browser.

export const HR_BAND_HZ: [number, number] = [0.7, 3.0]; // 42–180 bpm
export const RESP_BAND_HZ: [number, number] = [0.1, 0.5]; // 6–30 breaths/min

/** Linear interpolation of irregular samples (t ascending) onto a uniform grid. */
export function resample(
  t: ArrayLike<number>,
  x: ArrayLike<number>,
  fs: number,
  tStart: number,
  tEnd: number,
): Float64Array {
  const n = Math.max(0, Math.floor((tEnd - tStart) * fs) + 1);
  const out = new Float64Array(n);
  if (t.length === 0) return out;
  let j = 0;
  for (let i = 0; i < n; i++) {
    const ti = tStart + i / fs;
    while (j < t.length - 2 && t[j + 1] < ti) j++;
    if (ti <= t[0]) out[i] = x[0];
    else if (ti >= t[t.length - 1]) out[i] = x[t.length - 1];
    else {
      const span = t[j + 1] - t[j];
      const w = span > 0 ? (ti - t[j]) / span : 0;
      out[i] = x[j] * (1 - w) + x[j + 1] * w;
    }
  }
  return out;
}

export function mean(x: ArrayLike<number>): number {
  let s = 0;
  for (let i = 0; i < x.length; i++) s += x[i];
  return x.length ? s / x.length : 0;
}

export function std(x: ArrayLike<number>): number {
  const m = mean(x);
  let s = 0;
  for (let i = 0; i < x.length; i++) s += (x[i] - m) ** 2;
  return x.length ? Math.sqrt(s / x.length) : 0;
}

export function median(x: number[]): number {
  if (!x.length) return NaN;
  const s = [...x].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Centred moving average; the window shrinks at the edges. */
export function movingMean(x: ArrayLike<number>, win: number): Float64Array {
  const n = x.length;
  const out = new Float64Array(n);
  const half = Math.max(1, Math.floor(win / 2));
  const prefix = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + x[i];
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - half);
    const b = Math.min(n, i + half + 1);
    out[i] = (prefix[b] - prefix[a]) / (b - a);
  }
  return out;
}

// ── Filtering ────────────────────────────────────────────────────────────

type Biquad = [b0: number, b1: number, b2: number, a1: number, a2: number];

function biquad(kind: "low" | "high", fc: number, fs: number): Biquad {
  const w0 = (2 * Math.PI * fc) / fs;
  const cos = Math.cos(w0);
  const alpha = Math.sin(w0) / (2 * Math.SQRT1_2);
  const a0 = 1 + alpha;
  const [b0, b1, b2] =
    kind === "low"
      ? [(1 - cos) / 2, 1 - cos, (1 - cos) / 2]
      : [(1 + cos) / 2, -(1 + cos), (1 + cos) / 2];
  return [b0 / a0, b1 / a0, b2 / a0, (-2 * cos) / a0, (1 - alpha) / a0];
}

function runBiquad(x: Float64Array, [b0, b1, b2, a1, a2]: Biquad): void {
  let x1 = x[0], x2 = x[0], y1 = x[0], y2 = x[0];
  // Start in steady state for a constant input so the edge doesn't ring.
  const dcGain = (b0 + b1 + b2) / (1 + a1 + a2);
  y1 = y2 = x[0] * dcGain;
  for (let i = 0; i < x.length; i++) {
    const xi = x[i];
    const yi = b0 * xi + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = xi; y2 = y1; y1 = yi;
    x[i] = yi;
  }
}

/**
 * Zero-phase band-pass (forward-backward, two 2nd-order Butterworth sections
 * per edge, so 8th order effective after filtfilt). Edges are padded by odd
 * reflection to keep the transient out of the analysed window.
 */
export function bandpass(x: ArrayLike<number>, fs: number, lo: number, hi: number): Float64Array {
  const n = x.length;
  if (n < 4) return Float64Array.from(x);
  const pad = Math.min(n - 1, Math.round(fs * 2));
  const m = mean(x);
  const y = new Float64Array(n + 2 * pad);
  for (let i = 0; i < pad; i++) y[i] = 2 * (x[0] - m) - (x[pad - i] - m);
  for (let i = 0; i < n; i++) y[pad + i] = x[i] - m;
  for (let i = 0; i < pad; i++) y[pad + n + i] = 2 * (x[n - 1] - m) - (x[n - 2 - i] - m);

  const sections = [biquad("high", lo, fs), biquad("high", lo, fs), biquad("low", hi, fs), biquad("low", hi, fs)];
  for (const s of sections) runBiquad(y, s);
  y.reverse();
  for (const s of sections) runBiquad(y, s);
  y.reverse();
  return y.slice(pad, pad + n);
}

// ── Spectrum ─────────────────────────────────────────────────────────────

function nextPow2(n: number): number {
  return 1 << Math.ceil(Math.log2(Math.max(2, n)));
}

/** In-place iterative radix-2 FFT. */
export function fft(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ar = re[i + k + len / 2], ai = im[i + k + len / 2];
        const tr = ar * cr - ai * ci, ti = ar * ci + ai * cr;
        re[i + k + len / 2] = re[i + k] - tr;
        im[i + k + len / 2] = im[i + k] - ti;
        re[i + k] += tr;
        im[i + k] += ti;
        [cr, ci] = [cr * wr - ci * wi, cr * wi + ci * wr];
      }
    }
  }
}

export interface Spectrum {
  freqs: Float64Array; // Hz, within the requested band
  power: Float64Array;
}

export function powerSpectrum(x: ArrayLike<number>, fs: number, lo: number, hi: number): Spectrum {
  const n = x.length;
  const size = Math.min(16384, nextPow2(Math.max(8 * n, 2048)));
  const re = new Float64Array(size);
  const im = new Float64Array(size);
  const m = mean(x);
  for (let i = 0; i < n; i++) {
    const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1)); // Hann
    re[i] = (x[i] - m) * w;
  }
  fft(re, im);
  const df = fs / size;
  const a = Math.max(1, Math.ceil(lo / df));
  const b = Math.min(size / 2, Math.floor(hi / df));
  const freqs = new Float64Array(b - a + 1);
  const power = new Float64Array(b - a + 1);
  for (let k = a; k <= b; k++) {
    freqs[k - a] = k * df;
    power[k - a] = re[k] * re[k] + im[k] * im[k];
  }
  return { freqs, power };
}

export interface RateEstimate {
  hz: number;
  perMin: number;
  /** de Haan SNR: power near f0 and 2·f0 against the rest of the band, in dB. */
  snrDb: number;
  spectrum: Spectrum;
}

/** Dominant frequency in [lo, hi] with parabolic peak interpolation. */
export function estimateRate(x: ArrayLike<number>, fs: number, lo: number, hi: number): RateEstimate | null {
  if (x.length < fs * 4) return null;
  // Look a little wider than the band so the SNR has a noise floor to compare against.
  const spec = powerSpectrum(x, fs, Math.max(0.05, lo * 0.7), Math.min(fs / 2, hi * 2 + 0.2));
  const { freqs, power } = spec;
  let best = -1;
  for (let i = 0; i < freqs.length; i++) {
    if (freqs[i] < lo || freqs[i] > hi) continue;
    if (best < 0 || power[i] > power[best]) best = i;
  }
  if (best < 0) return null;
  let hz = freqs[best];
  if (best > 0 && best < power.length - 1) {
    const [p0, p1, p2] = [power[best - 1], power[best], power[best + 1]];
    const denom = p0 - 2 * p1 + p2;
    if (denom !== 0) hz += (0.5 * (p0 - p2)) / denom * (freqs[1] - freqs[0]);
  }
  const tol = Math.max(0.1, (hi - lo) * 0.05);
  let sig = 0, noise = 0;
  for (let i = 0; i < freqs.length; i++) {
    const f = freqs[i];
    if (Math.abs(f - hz) <= tol || Math.abs(f - 2 * hz) <= 2 * tol) sig += power[i];
    else noise += power[i];
  }
  const snrDb = 10 * Math.log10((sig + 1e-12) / (noise + 1e-12));
  return { hz, perMin: hz * 60, snrDb, spectrum: spec };
}

// ── Beats and HRV ────────────────────────────────────────────────────────

/** Times (s, relative to sample 0) of local maxima at least minGap apart. */
export function findPeaks(x: ArrayLike<number>, fs: number, minGapSec: number): number[] {
  const cands: number[] = [];
  for (let i = 1; i < x.length - 1; i++) {
    if (x[i] > 0 && x[i] > x[i - 1] && x[i] >= x[i + 1]) cands.push(i);
  }
  cands.sort((a, b) => x[b] - x[a]);
  const minGap = minGapSec * fs;
  const kept: number[] = [];
  for (const i of cands) {
    if (kept.every((k) => Math.abs(k - i) >= minGap)) kept.push(i);
  }
  kept.sort((a, b) => a - b);
  return kept.map((i) => {
    let d = 0;
    const denom = x[i - 1] - 2 * x[i] + x[i + 1];
    if (denom !== 0) d = (0.5 * (x[i - 1] - x[i + 1])) / denom;
    return (i + d) / fs;
  });
}

export interface Hrv {
  rmssdMs: number;
  sdnnMs: number;
  meanIbiMs: number;
  beats: number;
}

/**
 * Time-domain HRV from beat times (s) or from inter-beat intervals (s).
 * Intervals outside 0.33–1.5 s or more than 25 % from the median are treated
 * as artefacts; successive differences are only taken between two kept
 * intervals that were adjacent in the original sequence.
 */
export function hrvFromIbis(ibis: number[]): Hrv | null {
  const plausible = ibis.map((v) => (v >= 0.33 && v <= 1.5 ? v : NaN));
  const med = median(plausible.filter((v) => !Number.isNaN(v)));
  const kept = plausible.map((v) => (Math.abs(v - med) <= 0.25 * med ? v : NaN));
  const valid = kept.filter((v) => !Number.isNaN(v));
  if (valid.length < 10) return null;
  const diffs: number[] = [];
  for (let i = 1; i < kept.length; i++) {
    if (!Number.isNaN(kept[i]) && !Number.isNaN(kept[i - 1])) diffs.push(kept[i] - kept[i - 1]);
  }
  if (diffs.length < 8) return null;
  const rmssd = Math.sqrt(diffs.reduce((s, d) => s + d * d, 0) / diffs.length);
  return {
    rmssdMs: rmssd * 1000,
    sdnnMs: std(valid) * 1000,
    meanIbiMs: mean(valid) * 1000,
    beats: valid.length + 1,
  };
}

export function hrvFromBeats(beatTimes: number[]): Hrv | null {
  const ibis: number[] = [];
  for (let i = 1; i < beatTimes.length; i++) ibis.push(beatTimes[i] - beatTimes[i - 1]);
  return hrvFromIbis(ibis);
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}
