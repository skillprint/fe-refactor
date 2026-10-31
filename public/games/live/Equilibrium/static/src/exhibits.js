// The rooms the mobiles hang in. Each exhibit is pure data: the wall and its
// light, what the beams are made of, how the weights are finished, their
// colours and their shapes. Mobile 1 (and the title) is always Calder; after
// that a shuffle bag shows every exhibit before any repeats, never the same
// one twice running.
//
// Every paint carries the ink its number is painted in, chosen to read on it.
// `tick` is the colour of the distance numbers above the beams, chosen to read
// on the wall.

export const EXHIBITS = [
  {
    id: 'calder',
    name: 'After Calder',
    medium: 'painted steel and wire',
    wall: { color: '#f3eee5', grain: 'plaster', background: '#d9d2c6', css: '#efe9df', vignette: 'rgba(60, 48, 30, 0.16)' },
    hemi: { sky: '#fffaf2', ground: '#d6cab6', intensity: 1.9 },
    key: { color: '#fff4e6', intensity: 2.2, side: -1, elevation: 1 },
    beam: { color: '#191816', roughness: 0.42, metalness: 0.35, bar: 1, wire: '#191816' },
    ends: 'curl',
    tick: '#6d675d',
    accent: '#e8743b',
    plinth: '#fbfaf6',
    finish: 'paint',
    palette: [
      { body: '#c8322a', ink: '#fbf6ec' },
      { body: '#1f4fa3', ink: '#fbf6ec' },
      { body: '#f2b632', ink: '#1d1b18' },
      { body: '#1c1b19', ink: '#fbf6ec' },
    ],
    shapes: ['disc', 'drop', 'half', 'tri'],
  },
  {
    id: 'constellation',
    name: 'Constellation',
    medium: 'enamelled steel, night sky',
    wall: { color: '#222a5e', grain: 'starry', background: '#141838', css: '#191e48', vignette: 'rgba(6, 8, 28, 0.5)' },
    hemi: { sky: '#a6b2f0', ground: '#2a2350', intensity: 1.15 },
    key: { color: '#eef1ff', intensity: 2.5, side: 1, elevation: 1.1 },
    beam: { color: '#f2f0ea', roughness: 0.28, metalness: 0.1, bar: 1, wire: '#e9e7f2' },
    ends: 'ball',
    tick: '#d6dcff',
    accent: '#ffd23f',
    plinth: '#2d3570',
    finish: 'paint',
    palette: [
      { body: '#e8452c', ink: '#fff8ef' },
      { body: '#f5d63d', ink: '#1d2350' },
      { body: '#7ec8f2', ink: '#13204a' },
      { body: '#f4f1ea', ink: '#1d2350' },
    ],
    shapes: ['star', 'moon', 'disc', 'star', 'half'],
  },
  {
    id: 'copper',
    name: 'Copper Leaves',
    medium: 'copper and bronze',
    wall: { color: '#c3cfb6', grain: 'limewash', background: '#8d9a80', css: '#b9c6ab', vignette: 'rgba(40, 50, 30, 0.28)' },
    hemi: { sky: '#eef3e2', ground: '#7b866a', intensity: 1.5 },
    key: { color: '#ffd2a1', intensity: 2.6, side: -1, elevation: 0.55 },
    beam: { color: '#6e4524', roughness: 0.34, metalness: 0.9, bar: 1.05, wire: '#5a3a1f', env: true },
    ends: 'plain',
    tick: '#2b3122',
    accent: '#1f8a7d',
    plinth: '#dde1d2',
    finish: 'metal',
    palette: [
      { body: '#b8582c', ink: '#2a1206' },
      { body: '#5fa391', ink: '#0c2621' },
      { body: '#94703d', ink: '#fff4e2' },
      { body: '#d4ad52', ink: '#2a1d0c' },
      { body: '#3f5e52', ink: '#f0f6f1' },
    ],
    shapes: ['leaf', 'leaf', 'pebble', 'petal', 'leaf'],
  },
  {
    id: 'lanterns',
    name: 'Paper Lanterns',
    medium: 'paper, bamboo and twine',
    wall: { color: '#f4dcd6', grain: 'paper', background: '#d9b9b0', css: '#efd5ce', vignette: 'rgba(90, 40, 40, 0.18)' },
    hemi: { sky: '#fff3ee', ground: '#d2a59a', intensity: 1.6 },
    key: { color: '#fff0e0', intensity: 2.0, side: 1, elevation: 0.9 },
    beam: { color: '#c9a86a', roughness: 0.6, metalness: 0, bar: 1.4, wire: '#6b5434', nodes: true },
    ends: 'plain',
    tick: '#74433c',
    accent: '#1f7a8c',
    plinth: '#f8eeea',
    finish: 'paper',
    palette: [
      { body: '#d63a7a', ink: '#fff6fa' },
      { body: '#f27b5b', ink: '#3a1410' },
      { body: '#e0a43a', ink: '#33200a' },
      { body: '#3b3f8f', ink: '#f5f2ff' },
      { body: '#3f9e7a', ink: '#f2fff9' },
    ],
    shapes: ['lantern', 'petal', 'disc', 'lantern', 'drop'],
  },
  {
    id: 'geometry',
    name: 'Primary Geometry',
    medium: 'painted aluminium and steel',
    wall: { color: '#cdd0d0', grain: 'concrete', background: '#a6a9aa', css: '#c4c6c6', vignette: 'rgba(20, 25, 30, 0.22)' },
    hemi: { sky: '#f4f8ff', ground: '#9a9d9f', intensity: 1.45 },
    key: { color: '#ffffff', intensity: 2.9, side: 1, elevation: 1.3 },
    beam: { color: '#2b2d30', roughness: 0.55, metalness: 0.3, bar: 1.1, wire: '#2b2d30' },
    ends: 'plain',
    tick: '#2b2d30',
    accent: '#e0a100',
    plinth: '#e1e3e2',
    finish: 'matte',
    palette: [
      { body: '#d9a326', ink: '#1f1a0e' },
      { body: '#1f7a7a', ink: '#f2fbfb' },
      { body: '#c4552f', ink: '#fff4ee' },
      { body: '#2e3033', ink: '#f4f2ee' },
      { body: '#efeae0', ink: '#2e3033' },
    ],
    shapes: ['square', 'diamond', 'disc', 'tri', 'square'],
  },
  {
    id: 'seaglass',
    name: 'Sea Glass',
    medium: 'frosted glass and driftwood',
    wall: { color: '#d3e9e6', grain: 'limewash', background: '#a9cdc9', css: '#c9e2df', vignette: 'rgba(20, 60, 60, 0.2)' },
    hemi: { sky: '#f2fffd', ground: '#9ec7c1', intensity: 1.7 },
    key: { color: '#fffaf0', intensity: 2.4, side: -1, elevation: 0.85 },
    beam: { color: '#b3a48c', roughness: 0.95, metalness: 0, bar: 1.45, wire: '#4d463c' },
    ends: 'plain',
    tick: '#2c4b48',
    accent: '#e07a3a',
    plinth: '#eef6f4',
    finish: 'glass',
    palette: [
      { body: '#2f8a57', ink: '#f2fff6' },
      { body: '#4fb9b6', ink: '#06302f' },
      { body: '#d08b2c', ink: '#2a1500' },
      { body: '#2a55b8', ink: '#f2f6ff' },
      { body: '#dfeceb', ink: '#24423f' },
    ],
    shapes: ['pebble', 'fish', 'pebble', 'drop', 'fish'],
  },
];

export const exhibitById = (id) => EXHIBITS.find((e) => e.id === id) ?? EXHIBITS[0];

/**
 * Deals exhibits: Calder first, then shuffled rounds of all of them, never
 * the same one twice in a row. `rng` returns [0, 1).
 */
export class ExhibitBag {
  constructor(rng = Math.random) {
    this.rng = rng;
    this.queue = ['calder', ...this.shuffle(EXHIBITS.map((e) => e.id).filter((id) => id !== 'calder'))];
    this.last = null;
  }

  shuffle(ids) {
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids;
  }

  next() {
    if (!this.queue.length) {
      this.queue = this.shuffle(EXHIBITS.map((e) => e.id));
      if (this.queue[0] === this.last) this.queue.push(this.queue.shift());
    }
    this.last = this.queue.shift();
    return exhibitById(this.last);
  }
}

// ---------------------------------------------------------------------------
// Contrast. A weight has to stand out from its wall, and its number from the
// weight. "Stands out" is a luminance ratio of at least 1.5, or colours far
// apart (CIE76 ΔE ≥ 40: a saturated yellow on cream passes). Frosted glass lets
// the wall through, so it has to clear 1.8 or ΔE 45. Paints that don't make it
// leave the palette; if that would leave fewer than three, they're darkened (on
// a light wall) or lightened (on a dark one) until they do.

const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const linear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
export const luminance = (hex) => {
  const [r, g, b] = channels(hex).map(linear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
function lab(hex) {
  const [r, g, b] = channels(hex).map(linear);
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const x = f((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047);
  const y = f(0.2126 * r + 0.7152 * g + 0.0722 * b);
  const z = f((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}
export const deltaE = (a, b) => Math.hypot(...lab(a).map((v, i) => v - lab(b)[i]));

const hex = (rgb) => `#${rgb.map((c) => Math.round(Math.max(0, Math.min(1, c)) * 255).toString(16).padStart(2, '0')).join('')}`;
const INKS = ['#1d1b18', '#fbf6ec'];

/** The exhibit's paints that read against its wall, each with an ink that reads on it. */
export function legiblePalette(ex) {
  const wall = ex.wall.color;
  const glass = ex.finish === 'glass';
  const stands = (body) => contrast(body, wall) >= (glass ? 1.8 : 1.5) || deltaE(body, wall) >= (glass ? 45 : 40);
  let paints = ex.palette.filter((p) => stands(p.body));
  if (paints.length < 3) {
    const darker = luminance(wall) > 0.35;
    paints = ex.palette.map((p) => {
      let rgb = channels(p.body);
      for (let i = 0; i < 20 && !stands(hex(rgb)); i++) rgb = rgb.map((c) => (darker ? c * 0.9 : c + (1 - c) * 0.12));
      return { ...p, body: hex(rgb) };
    });
  }
  return paints.map((p) => ({
    ...p,
    ink: contrast(p.ink, p.body) >= 3 ? p.ink : INKS.reduce((a, b) => (contrast(a, p.body) >= contrast(b, p.body) ? a : b)),
  }));
}

