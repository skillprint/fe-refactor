// Seeded randomness and the small helpers everything else leans on. A stage
// is rebuilt exactly from its seed, which is what the tests rely on.

export const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => t * t * (3 - 2 * t);
export const damp = (from, to, rate, dt) => to + (from - to) * Math.exp(-rate * dt);

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Rng {
  constructor(seed) {
    this.seed = seed >>> 0;
    this.next = mulberry32(this.seed);
  }
  range(a, b) { return a + (b - a) * this.next(); }
  int(a, b) { return a + Math.floor(this.next() * (b - a + 1)); }
  pick(list) { return list[Math.floor(this.next() * list.length)]; }
  chance(p) { return this.next() < p; }
  // Picks a key of { key: weight }.
  weighted(weights) {
    let total = 0;
    for (const k in weights) total += weights[k];
    let r = this.next() * total;
    for (const k in weights) if ((r -= weights[k]) < 0) return k;
    return Object.keys(weights).pop();
  }
}
