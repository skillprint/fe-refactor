// Elixir's recipes: what each potion asks for, in the words a player has to
// work out, and the exact measures those words mean. Nothing here touches
// three.js, so node can check every rung (see the README).
//
// A measure is a fraction of the flask, kept exact as [numerator, denominator].
// Each layer says how its measure is meant:
//   to     pour until the flask holds `target` in all ("up to ¾ of the flask")
//   add    pour `amount` more on top of whatever is there ("another ¼")
//   ratio  pour `factor` times what went in for layer `ref` ("3 parts to Moonwater's 2")
// so a layer is judged against what the flask really held when it began, not
// against a perfect earlier pour. `target` is where it ends if every pour is exact.

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
export function F(n, d = 1) {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d);
  return [n / g, d / g];
}
export const add = (a, b) => F(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
export const sub = (a, b) => F(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
export const mul = (a, b) => F(a[0] * b[0], a[1] * b[1]);
export const val = (a) => a[0] / a[1];
export const same = (a, b) => a[0] === b[0] && a[1] === b[1];
const fstr = (a) => `${a[0]}/${a[1]}`;

export const INGREDIENTS = [
  { id: 'moonwater', name: 'Moonwater' },
  { id: 'emberwine', name: 'Emberwine' },
  { id: 'nightshade', name: 'Nightshade' },
  { id: 'verdigris', name: 'Verdigris' },
  { id: 'sunmilk', name: 'Sunmilk' },
  { id: 'rosedew', name: 'Rose Dew' },
];

const FORMS = ['Draught', 'Tincture', 'Philter', 'Tonic', 'Cordial', 'Essence', 'Elixir', 'Brew'];
const OF = [
  'Quiet Hours', 'Second Wind', 'Lost Keys', 'Far Lighthouses', 'Remembered Names', 'Small Courage',
  'Sudden Spring', 'Good Sleep', 'Clear Sums', 'Patient Rivers', 'Borrowed Luck', 'Long Letters',
  'Kind Weather', 'Steady Hands', 'Midnight Errands', 'Open Windows', 'Found Things', 'Gentle Thunder',
  'Unhurried Mornings', 'the Last Train', 'Honest Scales', 'Lighter Pockets',
];

// ---------------------------------------------------------------------------
// Seeded randomness, so a potion can be rebuilt from its seed.

export class Rng {
  constructor(seed) {
    let a = seed >>> 0;
    this.next = () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  int(a, b) { return a + Math.floor(this.next() * (b - a + 1)); }
  pick(list) { return list[Math.floor(this.next() * list.length)]; }
  chance(p) { return this.next() < p; }
  shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }
}

// ---------------------------------------------------------------------------
// How a measure is written. `parts` is what the card draws (strings, and
// {n, d} for a stacked fraction); `text` is the same thing in plain type for
// events and the frame stamp.

const WORDS = { '1/2': 'half', '1/3': 'a third', '2/3': 'two thirds', '1/4': 'a quarter', '3/4': 'three quarters' };

const canWrite = {
  words: (f) => Boolean(WORDS[fstr(f)]),
  frac: (f) => f[1] > 1,
  dec: (f) => (100 % f[1]) === 0,
  pct: (f) => (100 % f[1]) === 0,
};

function decimal(f) {
  return (val(f)).toFixed(2).replace(/0$/, '');
}

// "¾ of the flask", "0.35 of the flask", "35%".
function amount(f, style) {
  if (style === 'pct') {
    const t = `${Math.round(val(f) * 100)}%`;
    return { parts: [t], text: t };
  }
  const tail = ' of the flask';
  if (style === 'words') { const w = WORDS[fstr(f)]; return { parts: [w + tail], text: w + tail }; }
  if (style === 'dec') { const d = decimal(f); return { parts: [d + tail], text: d + tail }; }
  return { parts: [{ n: f[0], d: f[1] }, tail], text: fstr(f) + tail };
}

const join = (...pieces) => ({
  parts: pieces.flatMap((p) => (typeof p === 'string' ? [p] : p.parts)),
  text: pieces.map((p) => (typeof p === 'string' ? p : p.text)).join(''),
});

function units(n, unit) {
  if (unit === 'L') { const t = `${n / 1000} L`; return { parts: [t], text: t }; }
  const t = `${n} ${unit}`;
  return { parts: [t], text: t };
}

const partsWord = (k) => (k === 1 ? '1 part' : `${k} parts`);

// ---------------------------------------------------------------------------
// Pools of measures by how hard they are to picture.

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const fracsOver = (dens) => dens.flatMap((d) => range(1, d - 1).map((n) => F(n, d)).filter((f) => f[1] === d));
const EASY = [F(1, 2), F(1, 3), F(2, 3), F(1, 4), F(3, 4)];
const FIFTHS_EIGHTHS = fracsOver([5, 6, 8, 10]);
const COMMON = fracsOver([3, 4, 5, 6, 8]);
const WIDE = fracsOver([3, 4, 5, 6, 8, 10, 12]);
const TWENTIETHS = range(1, 19).map((k) => F(k, 20));
const RATIOS = [[1, 2], [1, 3], [2, 3], [3, 4], [2, 5], [3, 5], [1, 4], [2, 1], [3, 2], [3, 1], [4, 3], [5, 3]];
const RATIOS3 = [[1, 2, 3], [1, 1, 2], [2, 3, 5], [1, 2, 2], [3, 2, 1], [1, 3, 4], [2, 1, 3], [1, 2, 5]];

function styleFor(f, rng, allowed) {
  const ok = allowed.filter((s) => canWrite[s](f));
  return ok.length ? rng.pick(ok) : null;
}

// ---------------------------------------------------------------------------
// The rungs. Each builder returns { intro: [lines], layers } or null to retry.

const MIN_GAP = F(2, 25); // keep layers a comfortable 8 % apart when generating

function layerTo(f, style, first) {
  const m = amount(f, style);
  return { mode: 'to', target: f, measure: join(first ? 'fill to ' : 'up to ', m) };
}
function layerAdd(g, style) {
  return { mode: 'add', amount: g, measure: join('another ', amount(g, style)) };
}

const BUILD = {
  // One layer, halves, thirds and quarters.
  1(rng) {
    const f = rng.pick(EASY);
    return { intro: [], layers: [layerTo(f, rng.chance(0.55) ? 'words' : 'frac', true)] };
  },

  // One layer, fifths to tenths, a decimal or a percent.
  2(rng) {
    const style = rng.pick(['frac', 'dec', 'pct']);
    const f = style === 'frac' ? rng.pick(FIFTHS_EIGHTHS) : rng.pick(TWENTIETHS.filter((x) => x[1] !== 2));
    return { intro: [], layers: [layerTo(f, style, true)] };
  },

  // Two layers: up to a second mark, or another so much on top.
  3(rng) {
    const f1 = rng.pick(COMMON);
    const s1 = styleFor(f1, rng, ['words', 'frac']);
    if (rng.chance(0.5)) {
      const f2 = rng.pick(WIDE);
      return { intro: [], layers: [layerTo(f1, s1, true), layerTo(f2, 'frac')] };
    }
    const g = rng.pick([F(1, 2), F(1, 3), F(1, 4), F(1, 5), F(1, 6), F(1, 8), F(2, 5), F(3, 8), F(3, 10), F(1, 10), F(2, 3), F(3, 4)]);
    return { intro: [], layers: [layerTo(f1, s1, true), layerAdd(g, styleFor(g, rng, ['words', 'frac']))] };
  },

  // A flask that holds so many drops; measures in drops.
  4(rng) {
    const C = rng.pick([120, 160, 200, 240, 300, 360, 400, 480]);
    const steps = [4, 5, 6, 8, 10, 12, 20, 24].filter((k) => C % k === 0);
    const k = rng.pick(steps);
    const a = rng.int(1, k - 2), b = rng.int(1, k - 1 - a);
    const n1 = (C / k) * a, n2 = (C / k) * b;
    const intro = [{ parts: [`This flask holds ${C} drops.`], text: `This flask holds ${C} drops.` }];
    const l1 = { mode: 'add', amount: F(n1, C), measure: units(n1, 'drops') };
    const l2 = rng.chance(0.5)
      ? { mode: 'add', amount: F(n2, C), measure: units(n2, 'drops') }
      : { mode: 'to', target: F(n1 + n2, C), measure: join('up to ', units(n1 + n2, 'drops')) };
    return { intro, layers: [l1, l2], capacity: { amount: C, unit: 'drops' } };
  },

  // Two ingredients in a ratio: a stated total, or matched to the first pour.
  5(rng, names) {
    const [p, q] = rng.pick(RATIOS);
    if (rng.chance(0.5)) {
      const T = rng.pick([F(1, 2), F(3, 5), F(2, 3), F(3, 4), F(4, 5), F(5, 6), F(9, 10), F(7, 10), F(2, 5)]);
      return ratioTotal(rng, [p, q], T, styleFor(T, rng, ['words', 'frac', 'pct']), names);
    }
    const f1 = rng.pick(COMMON.concat(TWENTIETHS));
    const s1 = styleFor(f1, rng, ['words', 'frac', 'pct', 'dec']);
    return {
      intro: [{ parts: [`${names[0]} to ${names[1]}, ${p} : ${q}.`], text: `${names[0]} to ${names[1]}, ${p} : ${q}.` }],
      layers: [layerTo(f1, s1, true), { mode: 'ratio', ref: 0, factor: F(q, p), measure: join(`${partsWord(q)} to ${names[0]}’s ${p}`) }],
    };
  },

  // Three layers, each written a different way.
  6(rng) {
    const [s1, s2, s3] = rng.shuffle(['dec', 'pct', 'frac']);
    const pool = (s) => (s === 'frac' ? WIDE : TWENTIETHS);
    const f1 = rng.pick(pool(s1).filter((f) => val(f) <= 0.5));
    const g = rng.pick(pool(s2).filter((f) => val(f) <= 0.4));
    const f3 = rng.pick(pool(s3));
    return { intro: [], layers: [layerTo(f1, s1, true), layerAdd(g, s2), layerTo(f3, s3)] };
  },

  // Ratios over part of the flask, and flasks measured in drops, millilitres or litres.
  7(rng, names) {
    const kind = rng.pick(['ratio3', 'ml', 'dropsRatio', 'ratio2']);
    if (kind === 'ratio3') {
      const r = rng.pick(RATIOS3);
      const T = rng.pick([F(3, 4), F(2, 3), F(4, 5), F(5, 6), F(9, 10), F(3, 5), F(7, 8)]);
      return ratioTotal(rng, r, T, styleFor(T, rng, ['words', 'frac', 'pct']), names);
    }
    if (kind === 'ratio2') {
      const r = rng.pick(RATIOS);
      const T = rng.pick([F(5, 6), F(7, 10), F(5, 8), F(7, 12), F(3, 8), F(9, 10), F(11, 12)]);
      return ratioTotal(rng, r, T, styleFor(T, rng, ['frac', 'pct', 'dec']), names);
    }
    if (kind === 'dropsRatio') {
      const C = rng.pick([240, 300, 360, 400, 480, 600]);
      const r = rng.pick(RATIOS);
      const total = rng.int(4, 19) * (C / 20);
      const sum = r[0] + r[1];
      if (!Number.isInteger(total) || total % 10 || total % sum) return null;
      const intro = [{ parts: [`This flask holds ${C} drops.`], text: `This flask holds ${C} drops.` }];
      return ratioTotal(rng, r, F(total, C), null, names, { amount: C, unit: 'drops', total }, intro);
    }
    // ml: an amount, then up to a mark, then a percent more.
    const C = rng.pick([500, 600, 750, 800, 1000]);
    const step = 50;
    const a = rng.int(1, Math.floor((C * 0.4) / step)) * step;
    const b = rng.int(Math.ceil((a + C * 0.1) / step), Math.floor((C * 0.75) / step)) * step;
    const pct = rng.pick([10, 15, 20, 25]);
    const capText = C === 1000 ? '1 L' : `${C} ml`;
    const intro = [{ parts: [`This flask holds ${capText}.`], text: `This flask holds ${capText}.` }];
    return {
      intro,
      capacity: { amount: C, unit: 'ml' },
      layers: [
        { mode: 'add', amount: F(a, C), measure: units(a, 'ml') },
        { mode: 'to', target: F(b, C), measure: join('up to ', units(b, 'ml')) },
        layerAdd(F(pct, 100), 'pct'),
      ],
    };
  },

  // Litres and millilitres together, or a ratio matched to a middle pour.
  8(rng, names) {
    if (rng.chance(0.5)) {
      const C = rng.pick([1500, 2000]);
      const a = rng.int(2, 8) * 50;
      const bL = rng.int(Math.ceil((a + C * 0.12) / 100), Math.floor((C * 0.7) / 100)) * 100;
      const pct = rng.pick([10, 15, 20, 25]);
      const intro = [{ parts: [`This flask holds ${C / 1000} L.`], text: `This flask holds ${C / 1000} L.` }];
      return {
        intro,
        capacity: { amount: C, unit: 'ml' },
        layers: [
          { mode: 'add', amount: F(a, C), measure: units(a, 'ml') },
          { mode: 'to', target: F(bL, C), measure: join('up to ', units(bL, 'L')) },
          layerAdd(F(pct, 100), 'pct'),
        ],
      };
    }
    const f1 = rng.pick(COMMON.filter((f) => val(f) <= 0.4));
    const g = rng.pick(TWENTIETHS.filter((f) => val(f) <= 0.3));
    const [p, q] = rng.pick(RATIOS.filter(([x, y]) => y / x <= 2));
    return {
      intro: [],
      layers: [
        layerTo(f1, styleFor(f1, rng, ['frac', 'words']), true),
        layerAdd(g, rng.pick(['dec', 'pct'])),
        { mode: 'ratio', ref: 1, factor: F(q, p), measure: join(`${partsWord(q)} to ${names[1]}’s ${p}`) },
      ],
    };
  },
};
BUILD[9] = (rng, names) => (rng.chance(0.5) ? BUILD[7](rng, names) : BUILD[8](rng, names));

// "Moonwater and Emberwine, 2 : 3, ¾ of the flask in all": each part in turn,
// and the last one up to the total.
function ratioTotal(rng, ratio, T, style, names, cap = null, intro = []) {
  const sum = ratio.reduce((a, b) => a + b, 0);
  const totalM = cap ? units(cap.total, cap.unit) : amount(T, style);
  const who = ratio.length === 2 ? `${names[0]} and ${names[1]}` : `${names[0]}, ${names[1]} and ${names[2]}`;
  const head = join(`${who}, ${ratio.join(' : ')}, `, totalM, ' in all.');
  const layers = ratio.map((k, i) => {
    if (i === ratio.length - 1) return { mode: 'to', target: T, measure: join(`${partsWord(k)}, to `, totalM, ' in all') };
    return { mode: 'add', amount: mul(T, F(k, sum)), measure: join(partsWord(k)) };
  });
  return { intro: [...intro, head], layers, capacity: cap ? { amount: cap.amount, unit: cap.unit } : null };
}

// ---------------------------------------------------------------------------

/** Where layer i should end, given the levels the flask really reached (fractions of the flask). */
export function effectiveTarget(layers, i, startLevels, endLevels) {
  const L = layers[i];
  if (L.mode === 'to') return val(L.target);
  if (L.mode === 'add') return startLevels[i] + val(L.amount);
  const poured = endLevels[L.ref] - startLevels[L.ref];
  return startLevels[i] + val(L.factor) * poured;
}

/** The ideal end of every layer, exactly, if every pour is perfect. */
export function idealTargets(layers) {
  const out = [];
  let level = F(0);
  layers.forEach((L, i) => {
    if (L.mode === 'to') level = L.target;
    else if (L.mode === 'add') level = add(level, L.amount);
    else level = add(level, mul(L.factor, sub(out[L.ref], L.ref ? out[L.ref - 1] : F(0))));
    out[i] = level;
  });
  return out;
}

function fits(targets) {
  let prev = F(0);
  for (const t of targets) {
    if (val(sub(t, prev)) < val(MIN_GAP) - 1e-12) return false;
    prev = t;
  }
  return val(targets[0]) >= 0.05 && val(prev) <= 0.95;
}

/**
 * A potion for this rung. Every target is between 5 % and 95 % of the flask,
 * and each layer at least 8 % above the last when poured exactly.
 */
export function makeRecipe(rung, seed) {
  const r = Math.max(1, Math.min(9, Math.round(rung)));
  const rng = new Rng(seed);
  for (let attempt = 0; attempt < 400; attempt++) {
    const ings = rng.shuffle(INGREDIENTS.slice());
    const names = ings.map((g) => g.name);
    const built = BUILD[r](rng, names);
    if (!built || built.layers.some((L) => !L.measure)) continue;
    const targets = idealTargets(built.layers);
    if (!fits(targets)) continue;
    const layers = built.layers.map((L, i) => ({
      ...L,
      ingredient: ings[i].id,
      name: ings[i].name,
      target: targets[i],
      text: `${ings[i].name} — ${L.measure.text}`,
    }));
    return {
      rung: r,
      seed,
      title: `${rng.pick(FORMS)} of ${rng.pick(OF)}`,
      intro: built.intro,
      capacity: built.capacity || null,
      layers,
      text: [...built.intro.map((l) => l.text), ...layers.map((l) => l.text)],
    };
  }
  throw new Error(`no recipe for rung ${r} from seed ${seed}`);
}

// ---------------------------------------------------------------------------
// Judging a pour. Errors are in percent of the flask.

export const GRADES = [
  { id: 'Perfect', within: 1, base: 100 },
  { id: 'Fine', within: 3, base: 60 },
  { id: 'Fair', within: 6, base: 25 },
];

export function grade(errorPct, tolerance) {
  const e = Math.abs(errorPct);
  for (const g of GRADES) if (e <= g.within * tolerance + 1e-9) return g.id;
  return 'Spoiled';
}

/** Points for one layer: the grade's base, plus a little for every tenth closer. */
export function layerPoints(errorPct, tolerance) {
  const g = grade(errorPct, tolerance);
  if (g === 'Spoiled') return 0;
  const base = GRADES.find((x) => x.id === g).base;
  const close = Math.max(0, 1 - Math.abs(errorPct) / (6 * tolerance));
  return Math.round(base + 40 * close);
}
