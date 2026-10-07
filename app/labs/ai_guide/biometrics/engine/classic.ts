// Training-free rPPG methods over a skin-ROI colour trace sampled on a
// uniform grid. Each returns a raw pulse signal; the caller band-passes it.
//
//  GREEN  Verkruysse et al. 2008 — the green channel alone.
//  CHROM  de Haan & Jeanne 2013 — chrominance projection that cancels
//         specular reflection, α-tuned per 1.6 s window.
//  POS    Wang et al. 2017 — projection onto the plane orthogonal to skin
//         tone, per 1.6 s window with overlap-add.

import { HR_BAND_HZ, bandpass, mean, movingMean, std } from "./dsp";

export interface RgbTrace {
  r: Float64Array;
  g: Float64Array;
  b: Float64Array;
}

const WINDOW_SEC = 1.6;

function normalise(x: Float64Array, fs: number): Float64Array {
  const mm = movingMean(x, Math.ceil(WINDOW_SEC * fs));
  return x.map((v, i) => (mm[i] > 0 ? v / mm[i] : 1));
}

function hann(n: number): Float64Array {
  return Float64Array.from({ length: n }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1)));
}

/** Blood volume up → more absorption → green down, so negate to make systoles peaks. */
export function green(c: RgbTrace, fs: number): Float64Array {
  return normalise(c.g, fs).map((v) => 1 - v);
}

export function chrom(c: RgbTrace, fs: number): Float64Array {
  const n = c.r.length;
  const rn = normalise(c.r, fs), gn = normalise(c.g, fs), bn = normalise(c.b, fs);
  const xs = new Float64Array(n), ys = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    xs[i] = 3 * rn[i] - 2 * gn[i];
    ys[i] = 1.5 * rn[i] + gn[i] - 1.5 * bn[i];
  }
  const xf = bandpass(xs, fs, ...HR_BAND_HZ);
  const yf = bandpass(ys, fs, ...HR_BAND_HZ);

  const win = Math.max(4, Math.ceil(WINDOW_SEC * fs) & ~1);
  const step = win / 2;
  const w = hann(win);
  const out = new Float64Array(n);
  for (let start = 0; start + win <= n; start += step) {
    const xw = xf.subarray(start, start + win);
    const yw = yf.subarray(start, start + win);
    const sy = std(yw);
    const alpha = sy > 0 ? std(xw) / sy : 0;
    for (let i = 0; i < win; i++) out[start + i] += (xw[i] - alpha * yw[i]) * w[i];
  }
  return out;
}

export function pos(c: RgbTrace, fs: number): Float64Array {
  const n = c.r.length;
  const l = Math.ceil(WINDOW_SEC * fs);
  const out = new Float64Array(n);
  const s1 = new Float64Array(l), s2 = new Float64Array(l);
  for (let m = 0; m + l <= n; m++) {
    const mr = mean(c.r.subarray(m, m + l));
    const mg = mean(c.g.subarray(m, m + l));
    const mb = mean(c.b.subarray(m, m + l));
    if (!(mr > 0 && mg > 0 && mb > 0)) continue;
    for (let i = 0; i < l; i++) {
      const r = c.r[m + i] / mr, g = c.g[m + i] / mg, b = c.b[m + i] / mb;
      s1[i] = g - b;
      s2[i] = -2 * r + g + b;
    }
    const sd2 = std(s2);
    const alpha = sd2 > 0 ? std(s1) / sd2 : 0;
    let hm = 0;
    for (let i = 0; i < l; i++) hm += s1[i] + alpha * s2[i];
    hm /= l;
    for (let i = 0; i < l; i++) out[m + i] += s1[i] + alpha * s2[i] - hm;
  }
  return out;
}
