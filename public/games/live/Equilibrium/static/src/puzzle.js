// Equilibrium's puzzles: a balanced mobile built from the bottom up, then
// partly taken apart. Nothing here touches three.js, so node can test it.
//
// A beam pivots at its middle. Its hooks sit at signed distances ±1…±reach;
// negative is left. A weight hanging at distance d turns its beam by w × d,
// a sub-beam by its whole mass × d. A beam is level when those sum to zero.

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export function makeRng(seed) {
  let a = seed >>> 0 || 1;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
    shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
  };
}

// The ladder: how many beams, how far the top beam's arms reach, and how
// many loose weights the player has to hang.
const RUNGS = [
  { beams: 1, reach: 3, loose: 1 },
  { beams: 1, reach: 4, loose: 2 },
  { beams: 2, reach: 4, loose: 2 },
  { beams: 2, reach: 4, loose: 3 },
  { beams: 3, reach: 5, loose: 3 },
  { beams: 3, reach: 5, loose: 4 },
  { beams: 4, reach: 5, loose: 5 },
  { beams: 4, reach: 5, loose: 6 },
];
export const TOP_RUNG = RUNGS.length;
export const planFor = (rung) => RUNGS[clamp(Math.round(rung), 1, RUNGS.length) - 1];

/**
 * Builds a mobile whose generated arrangement balances, then takes `loose`
 * weights off it. Any arrangement that balances with every weight hung wins.
 * @param {{rung: number, maxWeight: number, seed: number, wide?: boolean}} o
 *   wide hangs sub-mobiles from the outer hooks (a landscape frame); narrow
 *   from the inner ones, so the mobile grows down instead of out.
 */
export function generate({ rung, maxWeight, seed, wide = true }) {
  const plan = planFor(rung);
  const rng = makeRng(seed);
  for (let attempt = 0; attempt < 200; attempt++) {
    const mobile = build(plan, maxWeight, rng, wide);
    if (!mobile) continue;
    const loose = loosen(mobile, plan.loose, rng);
    if (!loose) continue;
    for (const w of mobile.weights) w.loose = loose.has(w.id);
    return { rung: clamp(Math.round(rung), 1, RUNGS.length), maxWeight, seed, ...mobile };
  }
  throw new Error(`no mobile for rung ${rung}, maxWeight ${maxWeight}, seed ${seed}`);
}

// The tree: each beam hangs at most one sub-beam per side, three deep at most.
function shape(n, reach, rng) {
  const beams = [{ id: 0, depth: 0, parent: null, side: 0, hook: null, reach, kids: [] }];
  while (beams.length < n) {
    const open = beams.filter((b) => b.depth < 3 && b.kids.length < 2);
    const host = rng.pick(open);
    const taken = host.kids.map((k) => beams[k].side);
    const side = rng.pick([-1, 1].filter((s) => !taken.includes(s)));
    const depth = host.depth + 1;
    const b = { id: beams.length, depth, parent: host.id, side, hook: null, reach: depth === 1 ? Math.max(3, reach - 1) : 3, kids: [] };
    host.kids.push(b.id);
    beams.push(b);
  }
  return beams;
}

function build(plan, maxWeight, rng, wide) {
  const beams = shape(plan.beams, plan.reach, rng);

  // How many weights each beam carries: enough for one on each side, then
  // more until roughly one per beam stays pinned once the loose ones come off.
  const count = beams.map((b) => (b.kids.length === 0 ? 2 : b.kids.length === 1 ? 1 : 1));
  const want = plan.loose + Math.max(1, Math.ceil(plan.beams * 0.75)) + 1 + (rng.chance(0.3) ? 1 : 0);
  let guard = 0;
  while (count.reduce((a, b) => a + b, 0) < want && guard++ < 50) {
    const i = rng.int(0, beams.length - 1);
    if (count[i] + beams[i].kids.length < Math.min(5, beams[i].reach + 1)) count[i] += 1;
  }

  const weights = [];
  const mass = new Array(beams.length).fill(0);
  // Deepest first, so a sub-beam's mass is known before its parent balances.
  for (const b of [...beams].sort((x, y) => y.depth - x.depth)) {
    const placed = balance(b, beams, mass, count[b.id], maxWeight, rng, wide);
    if (!placed) return null;
    for (const p of placed) weights.push({ id: weights.length, w: p.w, beam: b.id, d: p.d, loose: false });
    mass[b.id] = placed.reduce((s, p) => s + p.w, 0) + b.kids.reduce((s, k) => s + mass[k], 0);
  }
  return { beams: beams.map(({ id, depth, parent, hook, reach, kids }) => ({ id, depth, parent, hook, reach, kids })), weights };
}

// Hangs `n` weights on beam `b` (and its sub-beams on their hooks) so it
// balances: every weight but one at random, then the last one solved for.
function balance(b, beams, mass, n, maxWeight, rng, wide) {
  const R = b.reach;
  const sideHooks = (s) => Array.from({ length: R }, (_, i) => s * (i + 1));
  for (let attempt = 0; attempt < 400; attempt++) {
    const used = new Set();
    let torque = 0;
    for (const k of b.kids) {
      const kid = beams[k];
      const lo = wide ? Math.max(2, R - 1) : 2;
      const hi = wide ? R : Math.max(2, R - 1);
      kid.hook = kid.side * rng.int(lo, hi);
      used.add(kid.hook);
      torque += mass[k] * kid.hook;
    }
    const placed = [];
    // A leaf beam's first weight decides a side; the solved weight takes the other.
    for (let i = 0; i < n - 1; i++) {
      let side = rng.pick([-1, 1]);
      if (b.kids.length === 1 && i === 0) side = -beams[b.kids[0]].side;
      const free = sideHooks(side).filter((d) => !used.has(d));
      if (!free.length) break;
      const d = rng.pick(free);
      const w = rng.int(1, maxWeight);
      used.add(d);
      placed.push({ d, w });
      torque += w * d;
    }
    if (placed.length !== n - 1 || torque === 0) continue;
    const side = -Math.sign(torque);
    const fits = sideHooks(side).filter((d) => !used.has(d) && torque % d === 0 && Math.abs(torque / d) <= maxWeight);
    if (!fits.length) continue;
    // A mirror image (same weight, same distance across) is the dullest answer.
    const fresh = fits.filter((d) => !placed.some((p) => p.d === -d && p.w === Math.abs(torque / d)));
    if (!fresh.length && attempt < 300) continue;
    const d = rng.pick(fresh.length ? fresh : fits);
    placed.push({ d, w: Math.abs(torque / d) });
    return placed;
  }
  return null;
}

// Chooses which weights come off. At least one beam should hang crooked
// once they're gone, or the opening position tells the player nothing.
function loosen(mobile, n, rng) {
  const ids = mobile.weights.map((w) => w.id);
  if (ids.length <= n) return null;
  for (let attempt = 0; attempt < 30; attempt++) {
    const pick = new Set(rng.shuffle([...ids]).slice(0, n));
    const place = mobile.weights.map((w) => (pick.has(w.id) ? null : { beam: w.beam, d: w.d }));
    if (measure(mobile, place).some((m) => m.net !== 0)) return pick;
  }
  return null;
}

/** Where each weight hangs in the generated answer. */
export const solution = (puzzle) => puzzle.weights.map((w) => ({ beam: w.beam, d: w.d }));

/** The opening position: pinned weights home, loose ones in the tray (null). */
export const opening = (puzzle) => puzzle.weights.map((w) => (w.loose ? null : { beam: w.beam, d: w.d }));

/**
 * Per beam: the torque on each arm, the net (positive = right side heavy),
 * the beam's whole mass with everything below it, and how many things hang
 * on each side.
 */
export function measure(puzzle, place) {
  const out = puzzle.beams.map(() => ({ left: 0, right: 0, net: 0, mass: 0, own: 0, nLeft: 0, nRight: 0 }));
  puzzle.weights.forEach((w, i) => {
    const at = place[i];
    if (!at) return;
    const m = out[at.beam];
    m.own += w.w;
    if (at.d < 0) { m.left += w.w * -at.d; m.nLeft++; } else { m.right += w.w * at.d; m.nRight++; }
  });
  const total = (id) => {
    const b = puzzle.beams[id];
    const m = out[id];
    m.mass = m.own;
    for (const k of b.kids) {
      const km = total(k);
      const d = puzzle.beams[k].hook;
      m.mass += km;
      if (d < 0) { m.left += km * -d; m.nLeft++; } else { m.right += km * d; m.nRight++; }
    }
    m.net = m.right - m.left;
    return m.mass;
  };
  total(0);
  return out;
}

export const balanced = (m) => m.net === 0 && m.nLeft > 0 && m.nRight > 0;

/** Every weight hung and every beam level. */
export function solved(puzzle, place) {
  if (place.some((p) => !p)) return false;
  return measure(puzzle, place).every(balanced);
}

/** Hooks with nothing on them, as `${beam}:${d}` keys, ignoring weight `skip`. */
export function freeHooks(puzzle, place, skip = -1) {
  const taken = new Set();
  for (const b of puzzle.beams) if (b.parent != null) taken.add(`${b.parent}:${b.hook}`);
  place.forEach((p, i) => { if (p && i !== skip) taken.add(`${p.beam}:${p.d}`); });
  const free = [];
  for (const b of puzzle.beams) {
    for (let d = -b.reach; d <= b.reach; d++) {
      if (d !== 0 && !taken.has(`${b.id}:${d}`)) free.push({ beam: b.id, d });
    }
  }
  return free;
}
