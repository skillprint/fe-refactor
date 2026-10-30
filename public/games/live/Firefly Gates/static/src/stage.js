// A stage of Firefly Gates: the swarm it starts with, its rows of gates, and
// the number carved on its beacon. It is built up front along the best path,
// so the beacon can ask for a share of the best the player could manage.
//
// Every operation is monotone (more fireflies in, never fewer out), so taking
// the gate that leaves the most at each row is always the best plan. The
// arithmetic is the game: rows pair operations whose results are close, and
// often make the gate with the bigger-looking number the worse one.
//
// No three.js in here; the tests run it in node.

import { Rng, clamp, lerp } from './rng.js';

const STEP = {
  '+': (n, v) => n + v,
  '−': (n, v) => Math.max(0, n - v),
  '×': (n, v) => n * v,
  '÷': (n, v) => Math.floor(n / v),
};
const FAMILY = { grow: ['+', '×'], shrink: ['−', '÷'] };

export const apply = (gate, n) => gate.steps.reduce((m, s) => STEP[s.k](m, s.v), n);
export const label = (gate) => gate.steps.map((s) => `${s.k}${s.v}`).join(' ');
/** The number a hurried eye compares: the biggest operand on the gate. */
export const looks = (gate) => Math.max(...gate.steps.map((s) => s.v));

/** The best a swarm of n can do at this row, and which gate gets it. */
export function bestOf(row, n) {
  let best = -1, at = 0;
  row.gates.forEach((g, i) => {
    const r = apply(g, n);
    if (r > best) { best = r; at = i; }
  });
  return { result: best, index: at };
}

/** What a rung asks for. Rung 1 already has all four operations, gently:
 * with only + and × the swarm can only grow, and doubles at every × gate. */
export function planFor(rung) {
  const r = Math.max(1, Math.round(rung));
  return {
    rung: r,
    rows: Math.min(12, 5 + r),
    gates: r >= 5 ? 3 : 2,
    mulMax: r >= 4 ? 5 : r >= 3 ? 4 : 3,
    divMax: r >= 4 ? 5 : r >= 3 ? 4 : r >= 2 ? 3 : 2,
    hi: [80, 150, 300, 600][Math.min(r, 4) - 1],
    twoStep: r >= 6 ? Math.min(0.6, 0.3 + 0.1 * (r - 6)) : 0,
  };
}

/**
 * @param {object} o
 * @param {number} o.rung
 * @param {number} o.seed
 * @param {number} o.numberScale 0.5-3: the starting swarm and the band it lives in
 * @param {number} o.gateTrickiness 0-1: how close the gates' results are, and how often the bigger number lies
 * @param {number} o.beaconStrictness 0.6-1: the beacon's share of the best final swarm
 */
export function buildStage({ rung, seed, numberScale = 1, gateTrickiness = 0.5, beaconStrictness = 0.9 }) {
  const plan = planFor(rung);
  const rng = new Rng(seed);
  const t = clamp(gateTrickiness, 0, 1);
  const lo = Math.max(3, Math.round(5 * numberScale));
  const hi = Math.max(lo * 6, Math.round(plan.hi * numberScale));
  const band = { lo, hi, cap: Math.round(hi * 1.2) };
  const start = clamp(Math.round(rng.range(10, 20) * numberScale), lo + 2, Math.round(hi / 3));

  const rows = [];
  let n = start;
  for (let i = 0; i < plan.rows; i++) {
    const row = makeRow(n, plan, band, t, rng);
    rows.push(row);
    n = row.results[row.best];
  }
  return {
    rung: plan.rung,
    seed,
    start,
    rows,
    gatesPerRow: plan.gates,
    best: n,
    beacon: Math.max(1, Math.ceil(clamp(beaconStrictness, 0.3, 1) * n)),
    band,
  };
}

function makeRow(n, plan, band, t, rng) {
  // Where n sits in its band steers the row up or down, so the swarm stays
  // in numbers worth doing sums with.
  const pos = clamp(Math.log(n / band.lo) / Math.log(band.hi / band.lo), 0, 1);
  const trap = rng.chance(0.3 + 0.5 * t);
  let dir = pos > 0.72 && rng.chance(0.8) ? 'down' : pos < 0.35 ? 'up' : 'any';
  if (n < 8) dir = 'up';

  for (let attempt = 0; attempt < 1200; attempt++) {
    // Loosen the asks one at a time if a row won't come.
    const tier = attempt < 300 ? 0 : attempt < 600 ? 1 : attempt < 900 ? 2 : 3;
    const gapLo = lerp(0.3, 0.03, t) * (tier >= 1 ? 0.5 : 1);
    const gapHi = Math.min(0.9, lerp(0.75, 0.14, t) * (tier >= 1 ? 1.6 : 1));
    const wantTrap = tier >= 2 ? null : trap;
    const d = tier >= 3 ? 'any' : dir;
    const family = d === 'up' ? 'grow' : d === 'down' ? 'shrink' : rng.chance(0.55) ? 'grow' : 'shrink';

    const a = randomGate(n, family, plan, band, rng);
    if (!a) continue;
    const ra = apply(a, n);
    const gap = rng.range(gapLo, gapHi);
    const target = Math.round(ra * (rng.chance(0.5) ? 1 + gap : 1 - gap));
    const b = gateToward(n, target, family, a, plan, band, rng);
    if (!b) continue;
    const gates = [a, b];
    if (plan.gates === 3) {
      // A third gate is a distractor, never the answer: a lone + among − gates would give the row away.
      const c = randomGate(n, rng.chance(0.5) ? 'grow' : 'shrink', plan, band, rng);
      if (!c || apply(c, n) >= Math.max(ra, apply(b, n))) continue;
      gates.push(c);
    }
    const row = check(n, gates, { band, gapLo, gapHi, wantTrap, dir: d });
    if (!row) continue;
    // Lanes in a random order; the best gate is anywhere.
    const order = gates.map((g, i) => ({ g, k: rng.next(), i })).sort((x, y) => x.k - y.k);
    row.gates = order.map((o) => o.g);
    row.results = row.gates.map((g) => apply(g, n));
    row.best = row.results.indexOf(Math.max(...row.results));
    row.relaxed = tier;
    return row;
  }
  throw new Error(`no row for n=${n} at rung ${plan.rung}`);
}

function check(n, gates, { band, gapLo, gapHi, wantTrap, dir }) {
  const results = gates.map((g) => apply(g, n));
  if (results.some((r) => r < 1 || r > band.cap)) return null;
  // Every gate different, and every result: a tie for second would blur which pair is the sum.
  if (new Set(gates.map(label)).size !== gates.length || new Set(results).size !== results.length) return null;
  const sorted = [...results].sort((x, y) => y - x);
  const [best, second] = sorted;
  if (best < band.lo || best > band.hi) return null;
  if (best - second < 1) return null;
  const gap = (best - second) / best;
  if (gap < gapLo || gap > gapHi) return null;
  if (dir === 'down' && best > n) return null;
  if (dir === 'up' && best < n + 2) return null;
  // The two worth weighing must differ in kind but share a direction:
  // +5 against +9 is no sum at all, and + always beats −.
  const bi = results.indexOf(best), si = results.indexOf(second);
  if (gates[bi].steps.length === 1 && gates[si].steps.length === 1) {
    const [kb, ks] = [gates[bi].steps[0].k, gates[si].steps[0].k];
    if (kb === ks || FAMILY.grow.includes(kb) !== FAMILY.grow.includes(ks)) return null;
  } else {
    // "×4" against "×4 +15" only asks whether 15 is more than nothing.
    const [b0, s0] = [gates[bi].steps[0], gates[si].steps[0]];
    if (b0.k === s0.k && b0.v === s0.v) return null;
  }
  const lk = gates.map(looks);
  const top = Math.max(...lk);
  if (lk.filter((v) => v === top).length > 1) return null;
  const trap = lk.indexOf(top) !== bi;
  if (wantTrap != null && trap !== wantTrap) return null;
  return { n, gates, results, best: bi, trap, gap: +gap.toFixed(3) };
}

function randomGate(n, family, plan, band, rng) {
  if (plan.twoStep && rng.chance(plan.twoStep)) return twoStep(n, null, plan, band, rng);
  const k = rng.pick(FAMILY[family]);
  const v = randomOperand(k, n, plan, band, rng);
  return v == null ? null : { steps: [{ k, v }] };
}

function randomOperand(k, n, plan, band, rng) {
  switch (k) {
    case '+': {
      const top = Math.min(Math.max(5, Math.round(n * 1.5)), band.cap - n);
      return top >= 2 ? rng.int(2, top) : null;
    }
    case '−': {
      const top = Math.floor(n * 0.75);
      return top >= 2 ? rng.int(2, top) : null;
    }
    case '×': {
      const top = Math.min(plan.mulMax, Math.floor(band.cap / n));
      return top >= 2 ? rng.int(2, top) : null;
    }
    case '÷': {
      const top = Math.min(plan.divMax, n);
      return top >= 2 ? rng.int(2, top) : null;
    }
  }
  return null;
}

// A second gate aimed at a result near the first's: + and − land exactly,
// × and ÷ as near as their few operands allow.
function gateToward(n, target, family, other, plan, band, rng) {
  if (target < 1) return null;
  const single = other.steps.length === 1;
  if (single && plan.twoStep && rng.chance(plan.twoStep)) return twoStep(n, target, plan, band, rng);
  const kinds = FAMILY[family].filter((k) => !single || k !== other.steps[0].k);
  const k = rng.pick(kinds);
  if (k === '+') return target - n >= 2 ? { steps: [{ k, v: target - n }] } : null;
  if (k === '−') return n - target >= 2 ? { steps: [{ k, v: n - target }] } : null;
  const max = k === '×' ? plan.mulMax : plan.divMax;
  let best = null, err = Infinity;
  for (let v = 2; v <= max; v++) {
    const e = Math.abs(STEP[k](n, v) - target);
    if (e < err) { err = e; best = v; }
  }
  return best == null ? null : { steps: [{ k, v: best }] };
}

// "×2 −5": multiply or divide, then add or take away. From rung 6.
function twoStep(n, target, plan, band, rng) {
  const k1 = rng.chance(0.6) ? '×' : '÷';
  const v1 = rng.int(2, k1 === '×' ? Math.min(plan.mulMax, 4) : Math.min(plan.divMax, 4));
  const m = STEP[k1](n, v1);
  if (m < 2 || m > band.cap) return null;
  let k2, v2;
  if (target == null) {
    k2 = rng.chance(0.5) ? '+' : '−';
    v2 = rng.int(2, Math.max(3, Math.round(m * 0.4)));
  } else {
    k2 = target >= m ? '+' : '−';
    v2 = Math.abs(target - m);
  }
  // The second step trims; "÷3 +299" would be a different sum wearing a hat.
  if (v2 < 2 || v2 > Math.max(6, Math.round(m * 0.6)) || (k2 === '−' && v2 >= m)) return null;
  return { steps: [{ k: k1, v: v1 }, { k: k2, v: v2 }] };
}
