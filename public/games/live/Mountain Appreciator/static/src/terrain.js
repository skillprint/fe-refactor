// Heightfields: archetype shapes, droplet erosion, and the queries the game
// asks of a mountain (height, slope, ray hits, line of sight).

import { Rng, createNoise2D, fbm, ridged, smoothstep, clamp, lerp } from './noise.js';

export const RES = 256;            // vertices per side
export const SIZE = 320;           // world units per side
export const HALF = SIZE / 2;
export const CELL = SIZE / (RES - 1);
export const SEA = 10;             // top of the cloud sea

export const toWorld = (g) => -HALF + g * CELL;
export const toGrid = (w) => (w + HALF) / CELL;

export class Field {
  constructor(h = new Float32Array(RES * RES)) {
    this.h = h;
    this.top = 0;
    for (let k = 0; k < h.length; k++) if (h[k] > this.top) this.top = h[k];
  }

  clone() { return new Field(this.h.slice()); }

  refreshTop() {
    this.top = 0;
    for (let k = 0; k < this.h.length; k++) if (this.h[k] > this.top) this.top = this.h[k];
  }

  height(x, z) {
    let gx = (x + HALF) / CELL, gz = (z + HALF) / CELL;
    if (gx < 0) gx = 0; else if (gx > RES - 1.0001) gx = RES - 1.0001;
    if (gz < 0) gz = 0; else if (gz > RES - 1.0001) gz = RES - 1.0001;
    const i = gx | 0, j = gz | 0, fx = gx - i, fz = gz - j, k = j * RES + i, h = this.h;
    return (h[k] * (1 - fx) + h[k + 1] * fx) * (1 - fz) + (h[k + RES] * (1 - fx) + h[k + RES + 1] * fx) * fz;
  }

  gradient(x, z) {
    const e = CELL;
    return [
      (this.height(x + e, z) - this.height(x - e, z)) / (2 * e),
      (this.height(x, z + e) - this.height(x, z - e)) / (2 * e),
    ];
  }

  slope(x, z) {
    const [gx, gz] = this.gradient(x, z);
    return Math.hypot(gx, gz);
  }

  normal(x, z) {
    const [gx, gz] = this.gradient(x, z);
    const l = Math.hypot(gx, 1, gz);
    return [-gx / l, 1 / l, -gz / l];
  }

  summit() {
    let best = -1, bk = 0;
    for (let k = 0; k < this.h.length; k++) if (this.h[k] > best) { best = this.h[k]; bk = k; }
    return { x: toWorld(bk % RES), z: toWorld((bk / RES) | 0), h: best };
  }

  // Rewrite every cell within r of (cx, cz): fn(oldHeight, distance, x, z) -> newHeight.
  edit(cx, cz, r, fn) {
    const i0 = Math.max(0, Math.floor(toGrid(cx - r))), i1 = Math.min(RES - 1, Math.ceil(toGrid(cx + r)));
    const j0 = Math.max(0, Math.floor(toGrid(cz - r))), j1 = Math.min(RES - 1, Math.ceil(toGrid(cz + r)));
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const x = toWorld(i), z = toWorld(j);
        const d = Math.hypot(x - cx, z - cz);
        if (d <= r) this.h[j * RES + i] = fn(this.h[j * RES + i], d, x, z);
      }
    }
    this.refreshTop();
  }

  // Distance along a unit ray to the first terrain hit, or -1.
  raycast(ox, oy, oz, dx, dy, dz, maxT = 2500) {
    let t = 0, prev = 0;
    const top = this.top + 1;
    while (t < maxT) {
      const y = oy + dy * t;
      if (y > top) {
        if (dy >= 0) return -1;
        prev = t;
        t += Math.max(0.5, (y - top) / -dy);
        continue;
      }
      const x = ox + dx * t, z = oz + dz * t;
      if (y <= this.height(x, z)) {
        let a = prev, b = t;
        for (let it = 0; it < 14; it++) {
          const m = (a + b) / 2;
          if (oy + dy * m <= this.height(ox + dx * m, oz + dz * m)) b = m; else a = m;
        }
        return b;
      }
      if (y < -2) return -1;
      prev = t;
      t += 0.7;
    }
    return -1;
  }

  // Is the straight line from a point to an eye blocked by terrain?
  occluded(ex, ey, ez, px, py, pz, margin = 0.6) {
    const dx = ex - px, dy = ey - py, dz = ez - pz;
    const L = Math.hypot(dx, dy, dz);
    // Only the stretch of the line below the highest summit can be blocked;
    // that matters for things far out in the sky.
    let t0 = 2.8 / L, t1 = 1;
    if (Math.abs(dy) < 1e-6) {
      if (py > this.top) return false;
    } else {
      const tTop = (this.top - py) / dy;
      if (dy > 0) t1 = Math.min(t1, tTop);
      else t0 = Math.max(t0, tTop);
    }
    const step = 1.4 / L;
    for (let t = t0; t < t1; t += step) {
      if (this.height(px + dx * t, pz + dz * t) > py + dy * t + margin) return true;
    }
    return false;
  }
}

// ---------------------------------------------------------------------------
// Archetypes. Each shape returns base(u, v) over [-1, 1]^2 and an optional
// pointwise post(u, v, h) applied after erosion (so towers and terraces stay
// crisp). Heights are normalised; the peak is scaled to world units later.

const smin = (a, b, k) => {
  const h = clamp(0.5 + (0.5 * (b - a)) / k, 0, 1);
  return lerp(b, a, h) - k * h * (1 - h);
};
const smax = (a, b, k) => -smin(-a, -b, k);
const edgeMask = (u, v) => 1 - smoothstep(0.7, 0.95, Math.hypot(u, v));

function warp(noise, s, a) {
  return (u, v) => [
    u + a * fbm(noise, u * s + 3.1, v * s - 1.7, 4),
    v + a * fbm(noise, u * s - 5.3, v * s + 2.9, 4),
  ];
}
const foothills = (noise, u, v) => 0.075 * (0.5 + 0.5 * fbm(noise, u * 3.3 + 11, v * 3.3 - 4, 4));

export const ARCH = {
  horn: {
    label: 'horn',
    height: [108, 128],
    biomes: ['alpine', 'alpine', 'granite'],
    drops: 52000,
    shape(rng, noise) {
      const k = rng.chance(0.6) ? 4 : 3;
      const rot = rng.range(0, Math.PI * 2);
      const faces = [];
      for (let f = 0; f < k; f++) {
        const a = rot + (f * 2 * Math.PI) / k + rng.range(-0.22, 0.22);
        faces.push([Math.cos(a), Math.sin(a)]);
      }
      const px = rng.range(-0.05, 0.05), py = rng.range(-0.05, 0.05);
      const R = rng.range(0.52, 0.6);
      const shA = rng.range(0, Math.PI * 2), shD = rng.range(0.2, 0.3);
      const sx = px + Math.cos(shA) * shD, sy = py + Math.sin(shA) * shD;
      const sh = rng.range(0.32, 0.46), sw = rng.range(0.36, 0.5);
      const w = warp(noise, 1.6, 0.1);
      const cosK = Math.cos(Math.PI / k);
      return {
        base(u, v) {
          const [wu, wv] = w(u, v);
          const x = wu - px, y = wv - py;
          let d = -1e9;
          for (const [c, s] of faces) d = Math.max(d, x * c + y * s);
          const dd = lerp(d / cosK, Math.hypot(x, y), 0.35);
          let h = Math.pow(Math.max(0, 1 - dd / R), 1.55);
          const s = sh * Math.pow(Math.max(0, 1 - Math.hypot(wu - sx, wv - sy) / sw), 1.6);
          h = smax(h, s, 0.06);
          h += 0.09 * (ridged(noise, wu * 3.4 + 7, wv * 3.4 - 2, 5) - 0.45) * Math.sqrt(Math.max(h, 0));
          return Math.max(0, h + foothills(noise, u, v)) * edgeMask(u, v);
        },
      };
    },
  },

  volcano: {
    label: 'stratovolcano',
    height: [96, 116],
    biomes: ['volcanic'],
    drops: 60000,
    shape(rng, noise) {
      const R = rng.range(0.64, 0.74), top = rng.range(0.8, 0.88);
      const cr = rng.range(0.05, 0.07), cd = rng.range(0.06, 0.09);
      const px = rng.range(-0.04, 0.04), py = rng.range(-0.04, 0.04);
      const lx = rng.range(-0.25, 0.25), ly = rng.range(-0.25, 0.25);
      const w = warp(noise, 2.0, 0.05);
      return {
        base(u, v) {
          const [wu, wv] = w(u, v);
          const x = wu - px, y = wv - py;
          const r = Math.hypot(x, y) * (1 + x * lx + y * ly);
          let h = Math.pow(Math.max(0, 1 - r / R), 2.15);
          h = smin(h, top, 0.05);
          h -= cd * (1 - smoothstep(cr * 0.2, cr * 1.25, r));
          h += 0.022 * fbm(noise, wu * 9, wv * 9, 3) * (1.2 - h);
          return (Math.max(0, h + foothills(noise, u, v) * 0.8) * edgeMask(u, v)) / top;
        },
      };
    },
  },

  massif: {
    label: 'massif',
    height: [100, 118],
    biomes: ['alpine', 'granite', 'alpine'],
    drops: 55000,
    shape(rng, noise) {
      const a = rng.range(0, Math.PI);
      const ca = Math.cos(a), sa = Math.sin(a);
      const n = rng.int(3, 4);
      const peaks = [];
      for (let i = 0; i < n; i++) {
        peaks.push({ s: lerp(-0.4, 0.4, i / (n - 1)) + rng.range(-0.05, 0.05), h: rng.range(0.62, 0.88), w: rng.range(0.13, 0.2) });
      }
      peaks[rng.int(1, n - 2)].h = 1;
      const w = warp(noise, 1.5, 0.12);
      return {
        axis: a,
        base(u, v) {
          const [wu, wv] = w(u, v);
          const s = wu * ca + wv * sa, c = -wu * sa + wv * ca;
          let ridge = 0.4 * Math.exp(-(s * s) / 0.22);
          for (const p of peaks) {
            const q = (s - p.s) / p.w;
            ridge = smax(ridge, p.h * Math.exp(-q * q), 0.08);
          }
          const W = 0.14 + 0.3 * ridge;
          let h = ridge * Math.pow(Math.max(0, 1 - Math.abs(c) / W), 1.25);
          h += 0.11 * (ridged(noise, wu * 3.6 - 4, wv * 3.6 + 8, 5) - 0.45) * Math.sqrt(Math.max(h, 0));
          return Math.max(0, h + foothills(noise, u, v)) * edgeMask(u, v);
        },
      };
    },
  },

  spires: {
    label: 'group of spires',
    height: [104, 122],
    biomes: ['granite'],
    drops: 42000,
    shape(rng, noise) {
      const w = warp(noise, 1.7, 0.1);
      const a0 = rng.range(0, Math.PI * 2);
      const m = rng.int(3, 5);
      const towers = [];
      const cx = rng.range(-0.04, 0.04), cy = rng.range(-0.04, 0.04);
      const main = Math.floor(m / 2);
      for (let t = 0; t < m; t++) {
        const off = (t - (m - 1) / 2) * 0.085;
        const jit = rng.range(-0.03, 0.03);
        towers.push({
          x: cx + Math.cos(a0) * off - Math.sin(a0) * jit,
          y: cy + Math.sin(a0) * off + Math.cos(a0) * jit,
          h: t === main ? 1 : rng.range(0.72, 0.9),
          r: rng.range(0.038, 0.055),
          seed: rng.range(0, 100),
        });
      }
      return {
        base(u, v) {
          const [wu, wv] = w(u, v);
          const r = Math.hypot(wu - cx, wv - cy);
          let h = 0.58 * Math.pow(Math.max(0, 1 - r / 0.6), 1.35);
          h += 0.08 * (ridged(noise, wu * 3.2, wv * 3.2, 5) - 0.45) * Math.sqrt(Math.max(h, 0));
          return Math.max(0, h + foothills(noise, u, v)) * edgeMask(u, v);
        },
        post(u, v, h) {
          for (const t of towers) {
            const dx = u - t.x, dy = v - t.y;
            const d = Math.hypot(dx, dy);
            if (d > t.r * 1.4) continue;
            const rr = t.r * (1 + 0.16 * noise(dx * 40 + t.seed, dy * 40));
            const wall = 1 - smoothstep(rr * 0.55, rr, d);
            const top = t.h * (1 - 0.2 * Math.pow(d / rr, 1.3)) + 0.012 * noise(u * 60, v * 60);
            h = Math.max(h, lerp(h, top, wall));
          }
          return h;
        },
      };
    },
  },

  mesa: {
    label: 'butte',
    height: [62, 80],
    biomes: ['desert'],
    drops: 30000,
    shape(rng, noise) {
      const w = warp(noise, 1.4, 0.15);
      const R = rng.range(0.3, 0.37);
      const px = rng.range(-0.06, 0.06), py = rng.range(-0.06, 0.06);
      const sa = rng.range(0, Math.PI * 2), sd = rng.range(0.4, 0.48);
      const sec = { x: px + Math.cos(sa) * sd, y: py + Math.sin(sa) * sd, R: R * rng.range(0.35, 0.5), h: rng.range(0.5, 0.68) };
      const steps = rng.int(6, 8);
      return {
        base(u, v) {
          const [wu, wv] = w(u, v);
          const d = Math.hypot(wu - px, wv - py);
          const plateau = 1 - smoothstep(R - 0.035, R, d);
          const talus = Math.pow(clamp(1 - (d - R * 0.9) / 0.36, 0, 1), 1.8) * 0.46;
          let h = Math.max(plateau, talus);
          const d2 = Math.hypot(wu - sec.x, wv - sec.y);
          h = Math.max(h, sec.h * (1 - smoothstep(sec.R - 0.03, sec.R, d2)));
          h = Math.max(h, Math.pow(clamp(1 - (d2 - sec.R) / 0.2, 0, 1), 1.8) * sec.h * 0.5);
          h += 0.012 * fbm(noise, wu * 7, wv * 7, 3);
          return Math.max(0, h + foothills(noise, u, v) * 0.7) * edgeMask(u, v);
        },
        post(u, v, h) {
          const f = h * steps, fl = Math.floor(f);
          return lerp(h, (fl + smoothstep(0.25, 0.75, f - fl)) / steps, 0.55);
        },
      };
    },
  },
};

export const ARCH_IDS = Object.keys(ARCH);

// ---------------------------------------------------------------------------
// Droplet erosion (after Hans Beyer / Sebastian Lague), on normalised heights
// with the grid as the unit of distance. Returns how much water passed over
// each cell, which the shader uses for damp gullies.

function erode(h, N, rng, drops) {
  const life = 30, inertia = 0.05, capF = 4, minCap = 0.01;
  const erodeS = 0.3, depS = 0.3, evap = 0.013, grav = 4, radius = 3;
  const flow = new Float32Array(N * N);
  const bx = [], by = [], bw = [];
  let ws = 0;
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      const d = Math.hypot(x, y);
      if (d < radius) { bx.push(x); by.push(y); bw.push(1 - d / radius); ws += 1 - d / radius; }
    }
  }
  for (let b = 0; b < bw.length; b++) bw[b] /= ws;
  const B = bw.length;

  let sh = 0, sgx = 0, sgy = 0;
  const sample = (px, py) => {
    const x = px | 0, y = py | 0, u = px - x, v = py - y, k = y * N + x;
    const a = h[k], b = h[k + 1], c = h[k + N], d = h[k + N + 1];
    sgx = (b - a) * (1 - v) + (d - c) * v;
    sgy = (c - a) * (1 - u) + (d - b) * u;
    sh = a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
  };

  let spawned = 0, guard = 0;
  while (spawned < drops && guard < drops * 4) {
    guard++;
    let px = 1 + rng.next() * (N - 3), py = 1 + rng.next() * (N - 3);
    const k0 = (py | 0) * N + (px | 0);
    if (h[k0] < 0.06 && rng.next() > 0.15) continue;
    spawned++;
    let dx = 0, dy = 0, speed = 1, water = 1, sed = 0;
    for (let l = 0; l < life; l++) {
      const x = px | 0, y = py | 0, k = y * N + x, u = px - x, v = py - y;
      sample(px, py);
      const hOld = sh;
      dx = dx * inertia - sgx * (1 - inertia);
      dy = dy * inertia - sgy * (1 - inertia);
      const len = Math.hypot(dx, dy);
      if (len < 1e-10) break;
      dx /= len; dy /= len;
      px += dx; py += dy;
      if (px < 1 || px >= N - 2 || py < 1 || py >= N - 2) break;
      sample(px, py);
      const dh = sh - hOld;
      flow[k] += water;
      const cap = Math.max(-dh * speed * water * capF, minCap);
      if (sed > cap || dh > 0) {
        const amt = dh > 0 ? Math.min(dh, sed) : (sed - cap) * depS;
        sed -= amt;
        h[k] += amt * (1 - u) * (1 - v);
        h[k + 1] += amt * u * (1 - v);
        h[k + N] += amt * (1 - u) * v;
        h[k + N + 1] += amt * u * v;
      } else {
        const amt = Math.min((cap - sed) * erodeS, -dh);
        for (let b = 0; b < B; b++) {
          const xi = x + bx[b], yi = y + by[b];
          if (xi < 0 || yi < 0 || xi >= N || yi >= N) continue;
          const kk = yi * N + xi;
          const want = amt * bw[b];
          const got = h[kk] < want ? h[kk] : want;
          h[kk] -= got;
          sed += got;
        }
      }
      speed = Math.sqrt(Math.max(0, speed * speed - dh * grav));
      water *= 1 - evap;
    }
  }
  return flow;
}

function blur(h, N, amount) {
  const out = h.slice();
  for (let j = 1; j < N - 1; j++) {
    for (let i = 1; i < N - 1; i++) {
      const k = j * N + i;
      const avg = (h[k - 1] + h[k + 1] + h[k - N] + h[k + N]) * 0.25;
      out[k] = lerp(h[k], avg, amount);
    }
  }
  h.set(out);
}

// ---------------------------------------------------------------------------

export function shapeFor(seed, archId) {
  const rng = new Rng(seed);
  const noise = createNoise2D(rng.fork(1));
  const shape = ARCH[archId].shape(rng.fork(2), noise);
  return { rng, noise, shape };
}

export function generate(seed, archId) {
  const arch = ARCH[archId];
  const { rng, noise, shape } = shapeFor(seed, archId);
  const n = new Float32Array(RES * RES);
  let max = 0;
  for (let j = 0; j < RES; j++) {
    const v = (j / (RES - 1)) * 2 - 1;
    for (let i = 0; i < RES; i++) {
      const u = (i / (RES - 1)) * 2 - 1;
      const val = shape.base(u, v);
      n[j * RES + i] = val;
      if (val > max) max = val;
    }
  }
  for (let k = 0; k < n.length; k++) n[k] /= max;

  const flowRaw = erode(n, RES, rng.fork(3), arch.drops);
  blur(n, RES, 0.35);

  if (shape.post) {
    for (let j = 0; j < RES; j++) {
      const v = (j / (RES - 1)) * 2 - 1;
      for (let i = 0; i < RES; i++) {
        const u = (i / (RES - 1)) * 2 - 1;
        n[j * RES + i] = shape.post(u, v, n[j * RES + i]);
      }
    }
  }

  const H = rng.range(arch.height[0], arch.height[1]);
  max = 0;
  for (let k = 0; k < n.length; k++) if (n[k] > max) max = n[k];
  for (let j = 0; j < RES; j++) {
    const v = (j / (RES - 1)) * 2 - 1;
    for (let i = 0; i < RES; i++) {
      const u = (i / (RES - 1)) * 2 - 1;
      const k = j * RES + i;
      const y = (Math.max(0, n[k]) / max) * H * edgeMask(u, v);
      // Let the low foothills sink under the cloud sea.
      n[k] = Math.max(0, y - 7 * (1 - smoothstep(4, 34, y)));
    }
  }

  const flow = new Float32Array(RES * RES);
  for (let k = 0; k < flow.length; k++) flow[k] = clamp(Math.log(1 + flowRaw[k]) / Math.log(1 + 40), 0, 1);

  return { field: new Field(n), H, flow, noise, rng: rng.fork(9), axis: shape.axis ?? null, archId, arch };
}

// Per-cell slope (rise over run) and cavity (+ in hollows, - on crests), in world units.
const RING = [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7071, 0.7071], [-0.7071, 0.7071], [0.7071, -0.7071], [-0.7071, -0.7071]];

export function cavity(field, out = new Float32Array(RES * RES)) {
  const h = field.h, R = 3;
  for (let j = 0; j < RES; j++) {
    for (let i = 0; i < RES; i++) {
      let s = 0;
      for (const [a, b] of RING) {
        const ii = clamp(Math.round(i + a * R), 0, RES - 1), jj = clamp(Math.round(j + b * R), 0, RES - 1);
        s += h[jj * RES + ii];
      }
      out[j * RES + i] = s / 8 - h[j * RES + i];
    }
  }
  return out;
}

export function analyze(field) {
  const h = field.h;
  const slope = new Float32Array(RES * RES);
  for (let j = 0; j < RES; j++) {
    for (let i = 0; i < RES; i++) {
      const il = Math.max(0, i - 1), ir = Math.min(RES - 1, i + 1);
      const jd = Math.max(0, j - 1), ju = Math.min(RES - 1, j + 1);
      const gx = (h[j * RES + ir] - h[j * RES + il]) / ((ir - il) * CELL);
      const gz = (h[ju * RES + i] - h[jd * RES + i]) / ((ju - jd) * CELL);
      slope[j * RES + i] = Math.hypot(gx, gz);
    }
  }
  return { slope, cav: cavity(field) };
}

// Where the visible mountain sits: centroid and reach of everything above the clouds.
export function extents(field) {
  let sx = 0, sz = 0, sw = 0;
  const h = field.h;
  for (let j = 0; j < RES; j += 2) {
    for (let i = 0; i < RES; i += 2) {
      const y = h[j * RES + i] - SEA;
      if (y <= 2) continue;
      sx += toWorld(i) * y; sz += toWorld(j) * y; sw += y;
    }
  }
  const cx = sw ? sx / sw : 0, cz = sw ? sz / sw : 0;
  let reach = 30;
  for (let j = 0; j < RES; j += 2) {
    for (let i = 0; i < RES; i += 2) {
      if (h[j * RES + i] - SEA <= 4) continue;
      reach = Math.max(reach, Math.hypot(toWorld(i) - cx, toWorld(j) - cz));
    }
  }
  return { cx, cz, reach };
}
