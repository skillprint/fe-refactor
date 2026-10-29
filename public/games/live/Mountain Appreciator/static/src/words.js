// Names, ranks and remarks.

const ROOTS = [
  'Kestrel', 'Varn', 'Ashgill', 'Morrow', 'Tollen', 'Harrow', 'Corrie', 'Brannoch', 'Skarra', 'Ullin',
  'Orrin', 'Grise', 'Pellam', 'Isken', 'Fenwick', 'Dunmere', 'Wyndle', 'Carrick', 'Haldor', 'Merrow',
  'Aldis', 'Quarne', 'Torvik', 'Ysolde', 'Calder', 'Hollin', 'Lisk', 'Maren', 'Noss', 'Oriel',
  'Penhallow', 'Rook', 'Sable', 'Umber', 'Vesper', 'Wren', 'Ettrick', 'Gallow', 'Brisk', 'Thorne',
];

const FORMS = {
  horn: [(r) => `${r}horn`, (r) => `${r} Tind`, (r) => `${r} Pike`, (r) => `${r}spitz`],
  volcano: [(r) => `Mount ${r}`, (r) => `${r} Cone`],
  massif: [(r) => `${r} Fell`, (r) => `${r}berg`, (r) => `${r} Ridge`],
  spires: [(r) => `${r} Towers`, (r) => `${r} Needles`, (r) => `${r} Spires`],
  mesa: [(r) => `${r} Butte`, (r) => `${r} Mesa`, (r) => `${r} Table`],
};

const PAIRS = [['Greater', 'Lesser'], ['Old', 'Young'], ['North', 'South'], ['Elder', 'Younger'], ['High', 'Low'], ['Upper', 'Nether']];

export function namePair(rng, archId) {
  const base = rng.pick(FORMS[archId])(rng.pick(ROOTS));
  const [a, b] = rng.pick(PAIRS);
  return { base, twins: [`${a} ${base}`, `${b} ${base}`], pair: `The ${base} twins` };
}

export const INTROS = {
  horn: 'A horn: carved from several sides at once by glaciers that never met.',
  volcano: 'A stratovolcano, built in layers, one eruption at a time.',
  massif: 'A massif: one mountain with several opinions about where its summit is.',
  spires: 'Granite spires: what remains when the softer rock gives up.',
  mesa: 'A butte, holding its ground while the land wears away around it.',
};

export const MISSES = [
  'Both have that.',
  'Lovely. Also on the other one.',
  'The twins agree on this point.',
  'Identical, as far as anyone can tell.',
  'A fine bit of mountain. On both.',
  'Same on both. Keep looking.',
  'That’s just mountain.',
  'Mm. No.',
];

export const CLOUDS = ['That’s cloud.', 'Clouds don’t count.', 'Just weather.'];

export const RANKS = [
  [0, 'Passer-by'],
  [4, 'Glancer'],
  [12, 'Admirer'],
  [25, 'Noticer'],
  [45, 'Enthusiast'],
  [70, 'Connoisseur'],
  [100, 'Mountain Appreciator'],
];

export function rankFor(n) {
  let r = RANKS[0], next = null;
  for (let i = 0; i < RANKS.length; i++) {
    if (n >= RANKS[i][0]) { r = RANKS[i]; next = RANKS[i + 1] || null; }
  }
  return { title: r[1], next: next ? { at: next[0], title: next[1] } : null };
}

export const PERFECT = ['Fully appreciated.', 'Nothing escaped you.', 'Every difference, noticed.', 'A thorough look.'];
