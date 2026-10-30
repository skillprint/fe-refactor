// The realms a stage can be set in. Pure data, read by world.js (sky, mist,
// ground, trees, props, weather), gates.js, beacon.js, moths.js and swarm.js.
// Colours for shaders are linear RGB; '#hex' strings are sRGB.
//
// Stage 1 and the title are always Mossgate. After that a shuffle bag deals
// the realms: every one shows before any repeats, never the same twice running.

export const REALMS = [
  {
    id: 'mossgate',
    name: 'Mossgate',
    places: ['The Mossgate', 'Fern Stair', 'Owl Hollow', 'Bramble Reach', 'Hartsfoot Ride', 'Starfall Clearing'],
    sky: {
      horizon: [0.012, 0.03, 0.045], zenith: [0.003, 0.007, 0.024], band: [0.075, 0.035, 0.09], bandAhead: 0.7,
      stars: 0.9, moon: { dir: [0.42, 0.3, -1], radius: 1.5, bite: [-0.012, 0.007, 0], color: [1, 0.94, 0.8], glow: 1 },
      aurora: { base: 0, a: [0.15, 1, 0.55], b: [0.55, 0.3, 1] },
    },
    fog: { color: [0.012, 0.03, 0.045], density: 0.02 },
    light: { sky: '#3d5d94', ground: '#0a120e', hemi: 0.32, key: '#8ea8ff', keyI: 0.4, keyDir: [-30, 40, -60] },
    ground: {
      floor: [[0.008, 0.02, 0.016], [0.02, 0.04, 0.03]], trail: [[0.05, 0.052, 0.045], [0.085, 0.085, 0.07]], trailGlow: [0.008, 0.018, 0.016],
      speck: { a: [0.2, 0.95, 0.8], b: [0.55, 0.9, 0.3], density: 0.9, glow: 2.2, scale: 2.3, edge: 1 },
    },
    trees: [
      { kind: 'pine', tiers: 4, count: 300, seed: 3, colors: { trunk: [[0.05, 0.035, 0.025], [0.07, 0.05, 0.035]], leaf: [[0.016, 0.05, 0.05], [0.04, 0.115, 0.105]] } },
      { kind: 'pine', tiers: 3, count: 220, seed: 11, colors: { trunk: [[0.05, 0.035, 0.025], [0.07, 0.05, 0.035]], leaf: [[0.016, 0.05, 0.05], [0.04, 0.115, 0.105]] } },
    ],
    tint: [0.7, 1.25],
    props: [
      { kind: 'glowMushroom', count: 260, clump: 4, zone: 'verge', colors: [[0.25, 1.6, 1.9], [1.6, 0.45, 1.5], [0.55, 1.5, 0.5]] },
    ],
    weather: null,
    wild: { color: [0.45, 0.85, 0.3], core: [0.8, 1, 0.6], alpha: 0.55 },
    fireflies: { color: [0.62, 1, 0.1], core: [1, 0.86, 0.32], light: '#ffd27a', numeral: '#ffe28a' },
    gate: { style: 'stone', post: '#3b4652', glow: [0.6, 1.9, 1.7] },
    beacon: { form: 'lantern', stone: '#46515c', moss: '#2e4a37', fire: [4.6, 2.9, 1.1], light: '#ffb35c' },
    moth: { kind: 'moth', wing: '#2a1f33', eyes: [1.8, 0.45, 2.6] },
    bend: 0,
    bloom: [0.85, 0.55, 0.78],
    exposure: 1,
    backing: 0,
  },
  {
    id: 'autumn',
    name: 'Autumn Birches',
    places: ['Amberfall', 'The Birch Aisle', 'Copper Ride', 'Hollow Oak Lane', 'The Turning Wood'],
    sky: {
      horizon: [0.11, 0.045, 0.018], zenith: [0.01, 0.009, 0.024], band: [0.16, 0.055, 0.02], bandAhead: 0.85,
      stars: 0.3, moon: { dir: [-0.38, 0.07, -1], radius: 3.4, bite: [0, 0, 0], color: [1.2, 0.62, 0.26], glow: 2.2 },
      aurora: { base: 0, a: [1, 0.55, 0.15], b: [0.9, 0.25, 0.3] },
    },
    fog: { color: [0.06, 0.028, 0.014], density: 0.023 },
    light: { sky: '#b06a3c', ground: '#160b05', hemi: 0.42, key: '#ffb070', keyI: 1.1, keyDir: [-70, 14, -8] },
    ground: {
      floor: [[0.045, 0.016, 0.006], [0.11, 0.045, 0.012]], trail: [[0.07, 0.045, 0.03], [0.11, 0.075, 0.045]], trailGlow: [0.006, 0.003, 0],
      speck: { a: [0.42, 0.12, 0.015], b: [0.5, 0.3, 0.03], density: 0.55, glow: 0, scale: 3.4, edge: 0 },
    },
    trees: [
      { kind: 'birch', count: 110, seed: 5, colors: { bark: [0.85, 0.82, 0.76], leaf: [[0.55, 0.22, 0.02], [0.85, 0.42, 0.04]] } },
      { kind: 'birch', count: 100, seed: 8, colors: { bark: [0.82, 0.8, 0.75], leaf: [[0.45, 0.06, 0.02], [0.7, 0.14, 0.03]] } },
      { kind: 'birch', count: 90, seed: 13, colors: { bark: [0.86, 0.84, 0.78], leaf: [[0.6, 0.38, 0.02], [0.9, 0.62, 0.05]] } },
      { kind: 'pine', tiers: 3, count: 120, seed: 17, far: true, colors: { trunk: [[0.04, 0.025, 0.015], [0.05, 0.035, 0.02]], leaf: [[0.035, 0.03, 0.012], [0.06, 0.05, 0.02]] } },
    ],
    tint: [0.8, 1.15],
    props: [
      { kind: 'rock', count: 90, clump: 1, zone: 'verge', color: '#5a5048' },
      { kind: 'glowMushroom', count: 80, clump: 4, zone: 'verge', colors: [[1.8, 0.8, 0.2], [1.6, 0.5, 0.2]] },
    ],
    weather: { kind: 'leaves', count: 380, size: 0.42, fall: 0.9, wind: 0.8, sway: 1.1, colors: [[0.6, 0.2, 0.02], [0.75, 0.4, 0.03], [0.5, 0.07, 0.02], [0.8, 0.6, 0.06]] },
    wild: { color: [0.7, 0.9, 0.25], core: [0.9, 1, 0.6], alpha: 0.4 },
    fireflies: { color: [0.4, 1, 0.12], core: [0.85, 1, 0.5], light: '#c8ff80', numeral: '#d4ff9a' },
    gate: { style: 'roots', post: '#3a2a1e', glow: [1.9, 1.0, 0.25] },
    beacon: { form: 'hollowTree', bark: '#4a3828', moss: '#5a3a18', fire: [4.6, 2.6, 0.9], light: '#ffac50' },
    moth: { kind: 'moth', wing: '#4a2e18', eyes: [2.2, 1.2, 0.2] },
    bend: 4.5,
    bloom: [0.75, 0.5, 0.82],
    exposure: 1.05,
    backing: 0.15,
  },
  {
    id: 'bamboo',
    name: 'Lantern Bamboo',
    places: ['Jade Mist Walk', 'The Thousand Stalks', 'Red Gate Rise', 'Lantern Hollow', 'Crane Shrine Path'],
    sky: {
      horizon: [0.03, 0.07, 0.055], zenith: [0.004, 0.013, 0.015], band: [0.03, 0.06, 0.035], bandAhead: 0.5,
      stars: 0.35, moon: { dir: [0.3, 0.38, -1], radius: 2.2, bite: [0, 0, 0], color: [0.95, 1, 0.9], glow: 1.3 },
      aurora: { base: 0, a: [0.4, 1, 0.6], b: [1, 0.5, 0.3] },
    },
    fog: { color: [0.03, 0.068, 0.054], density: 0.029 },
    light: { sky: '#4f8f78', ground: '#08120c', hemi: 0.42, key: '#cfe8ff', keyI: 0.3, keyDir: [30, 40, -60] },
    ground: {
      floor: [[0.01, 0.025, 0.015], [0.025, 0.05, 0.03]], trail: [[0.085, 0.09, 0.08], [0.14, 0.14, 0.12]], trailGlow: [0.004, 0.008, 0.006],
      speck: { a: [0.14, 0.16, 0.05], b: [0.2, 0.2, 0.08], density: 0.72, glow: 0, scale: 4.2, edge: 0 },
    },
    trees: [
      { kind: 'bamboo', count: 210, seed: 21, colors: { stalk: [[0.12, 0.26, 0.08], [0.3, 0.42, 0.12]], leaf: [0.08, 0.2, 0.06] } },
      { kind: 'bamboo', count: 130, seed: 23, colors: { stalk: [[0.2, 0.3, 0.06], [0.42, 0.45, 0.12]], leaf: [0.1, 0.22, 0.05] } },
    ],
    tint: [0.75, 1.2],
    props: [
      { kind: 'paperLantern', count: 40, clump: 1, zone: 'edge', colors: [[2.4, 0.5, 0.18], [2.4, 1.1, 0.3]] },
      { kind: 'rock', count: 60, clump: 1, zone: 'verge', color: '#4a5450' },
    ],
    weather: { kind: 'motes', count: 220, size: 0.13, fall: -0.08, wind: 0.15, sway: 0.6, colors: [[0.2, 0.5, 0.32], [0.4, 0.5, 0.3]] },
    wild: { color: [0.8, 0.9, 0.4], core: [1, 1, 0.8], alpha: 0.4 },
    fireflies: { color: [1, 0.78, 0.22], core: [1, 0.95, 0.75], light: '#ffe0a0', numeral: '#fff0b8' },
    gate: { style: 'torii', post: '#b3261c', beam: '#1a1414', glow: [2.4, 0.8, 0.3] },
    beacon: { form: 'pagoda', wood: '#8a1f16', roof: '#1f2422', fire: [4.4, 2.2, 0.8], light: '#ffa060' },
    moth: { kind: 'bat', wing: '#141016', eyes: [2.4, 0.5, 0.3] },
    bend: 5,
    bloom: [0.8, 0.5, 0.8],
    exposure: 1,
    backing: 0.15,
  },
  {
    id: 'marsh',
    name: 'Willow Marsh',
    places: ['Willow Marsh', 'Stillwater Bend', 'Heron Reach', 'The Lily Mere', 'Frogsong Fen'],
    sky: {
      horizon: [0.02, 0.036, 0.042], zenith: [0.003, 0.006, 0.016], band: [0.03, 0.035, 0.06], bandAhead: 0.6,
      stars: 1, moon: { dir: [0.5, 0.2, -1], radius: 2.0, bite: [0, 0, 0], color: [1, 0.97, 0.88], glow: 1.4 },
      aurora: { base: 0, a: [0.2, 1, 0.7], b: [0.4, 0.5, 1] },
      mirror: true,
    },
    fog: { color: [0.016, 0.03, 0.036], density: 0.021 },
    light: { sky: '#45708a', ground: '#06100c', hemi: 0.32, key: '#9fc0ff', keyI: 0.5, keyDir: [-20, 30, -80] },
    ground: {
      water: { color: [0.006, 0.02, 0.024], near: 0.93, far: 0.55 },
      floor: [[0.01, 0.02, 0.016], [0.02, 0.035, 0.026]], trail: [[0.01, 0.02, 0.016], [0.02, 0.035, 0.026]], trailGlow: [0, 0, 0],
      speck: { a: [0, 0, 0], b: [0, 0, 0], density: 1, glow: 0, scale: 1, edge: 0 },
    },
    trees: [
      { kind: 'willow', count: 120, seed: 31, colors: { trunk: [0.05, 0.04, 0.03], leaf: [[0.05, 0.1, 0.03], [0.14, 0.22, 0.06]] } },
      { kind: 'willow', count: 60, seed: 37, far: true, colors: { trunk: [0.04, 0.035, 0.03], leaf: [[0.03, 0.07, 0.03], [0.08, 0.14, 0.05]] } },
    ],
    tint: [0.75, 1.2],
    props: [
      { kind: 'lilyPad', count: 300, clump: 3, zone: 'water', color: '#1f4a24', flower: [2.0, 0.9, 1.4] },
      { kind: 'reeds', count: 240, clump: 4, zone: 'edge', color: '#2c3a1c' },
      { kind: 'frogGlow', count: 70, clump: 1, zone: 'water', colors: [[0.6, 2.2, 0.5]] },
    ],
    weather: { kind: 'motes', count: 200, size: 0.12, fall: -0.05, wind: 0.2, sway: 0.4, colors: [[0.25, 0.5, 0.45], [0.4, 0.5, 0.3]] },
    wild: { color: [0.8, 0.85, 0.2], core: [1, 1, 0.6], alpha: 0.5 },
    fireflies: { color: [1, 0.7, 0.12], core: [1, 0.92, 0.6], light: '#ffcf70', numeral: '#ffd98a' },
    gate: { style: 'roots', post: '#1f2a22', glow: [0.7, 2.0, 0.9] },
    beacon: { form: 'lighthouse', wood: '#3a3028', roof: '#20302a', fire: [4.8, 3.2, 1.3], light: '#ffc070' },
    moth: { kind: 'bat', wing: '#0f1214', eyes: [2.2, 1.6, 0.3] },
    bend: 4,
    bloom: [0.85, 0.55, 0.78],
    exposure: 1,
    backing: 0,
  },
  {
    id: 'snow',
    name: 'Snowfall Night',
    places: ['Snowfall Night', 'The White Hush', 'Frostbark Ride', 'Icebell Hollow', 'The Long Winter'],
    sky: {
      horizon: [0.03, 0.05, 0.09], zenith: [0.004, 0.008, 0.03], band: [0.02, 0.04, 0.08], bandAhead: 0.4,
      stars: 1.2, moon: { dir: [-0.35, 0.34, -1], radius: 2.1, bite: [0, 0, 0], color: [0.95, 0.98, 1.05], glow: 1.5 },
      aurora: { base: 0.3, a: [0.2, 1, 0.75], b: [0.3, 0.45, 1] },
    },
    fog: { color: [0.035, 0.055, 0.09], density: 0.026 },
    light: { sky: '#6f8fd0', ground: '#1a2438', hemi: 0.5, key: '#b0c8ff', keyI: 0.55, keyDir: [-30, 40, -60] },
    ground: {
      floor: [[0.13, 0.17, 0.26], [0.2, 0.25, 0.34]], trail: [[0.08, 0.1, 0.15], [0.11, 0.135, 0.19]], trailGlow: [0, 0, 0],
      speck: { a: [0.8, 0.9, 1], b: [0.6, 0.85, 1], density: 0.93, glow: 1.1, scale: 6, edge: 0 },
    },
    trees: [
      { kind: 'bare', count: 220, seed: 41, colors: { bark: [[0.02, 0.022, 0.03], [0.05, 0.05, 0.06]], snow: [0.5, 0.6, 0.8] } },
      { kind: 'pine', tiers: 4, count: 150, seed: 43, snow: [0.55, 0.65, 0.85], colors: { trunk: [[0.03, 0.025, 0.02], [0.04, 0.035, 0.03]], leaf: [[0.01, 0.03, 0.035], [0.025, 0.06, 0.06]] } },
    ],
    tint: [0.8, 1.15],
    props: [
      { kind: 'iceShard', count: 90, clump: 3, zone: 'verge', colors: [[0.5, 1.4, 2.0], [0.7, 1.1, 1.9]] },
      { kind: 'rock', count: 60, clump: 1, zone: 'verge', color: '#8090a8' },
    ],
    weather: { kind: 'snow', count: 900, size: 0.13, fall: 1.4, wind: 0.35, sway: 0.5, colors: [[0.85, 0.9, 1]] },
    wild: { color: [0.4, 0.8, 1], core: [0.8, 0.95, 1], alpha: 0.35 },
    fireflies: { color: [0.15, 0.8, 1], core: [0.75, 0.95, 1], light: '#9fe6ff', numeral: '#bff0ff' },
    gate: { style: 'ice', post: '#9fd0f0', glow: [0.5, 1.6, 2.2] },
    beacon: { form: 'obelisk', ice: '#a8d8f8', fire: [1.6, 3.4, 4.8], light: '#8fe0ff' },
    moth: { kind: 'wisp', wing: '#0c1020', eyes: [0.6, 1.8, 2.4] },
    bend: 4,
    bloom: [0.62, 0.45, 0.88],
    exposure: 0.95,
    backing: 0.42,
    shade: 0.85,
  },
  {
    id: 'mushroom',
    name: 'Mushroom Hollow',
    places: ['Mushroom Hollow', 'The Glowcap Deep', 'Sporelight Way', 'The Violet Undergrowth', 'Puffball Dell'],
    sky: {
      horizon: [0.04, 0.014, 0.06], zenith: [0.006, 0.002, 0.016], band: [0.08, 0.02, 0.1], bandAhead: 0.5,
      stars: 0.6, moon: { dir: [0.4, 0.42, -1], radius: 1.0, bite: [-0.01, 0.004, 0], color: [1, 0.75, 0.95], glow: 0.7 },
      aurora: { base: 0.15, a: [0.9, 0.3, 1], b: [0.3, 0.8, 1] },
    },
    fog: { color: [0.034, 0.012, 0.05], density: 0.027 },
    light: { sky: '#6a3f9a', ground: '#0d0614', hemi: 0.38, key: '#c08fff', keyI: 0.28, keyDir: [30, 40, -60] },
    ground: {
      floor: [[0.014, 0.006, 0.024], [0.035, 0.015, 0.05]], trail: [[0.04, 0.025, 0.05], [0.07, 0.045, 0.08]], trailGlow: [0.012, 0.004, 0.02],
      speck: { a: [0.3, 0.9, 1], b: [1, 0.4, 0.9], density: 0.93, glow: 1.6, scale: 2.6, edge: 0 },
    },
    trees: [
      { kind: 'giantMushroom', count: 110, seed: 51, colors: { stalk: [0.3, 0.25, 0.32], cap: [[0.25, 0.06, 0.4], [0.45, 0.1, 0.35]], gill: [0.8, 0.2, 1.1] } },
      { kind: 'giantMushroom', count: 70, seed: 53, colors: { stalk: [0.28, 0.27, 0.3], cap: [[0.05, 0.15, 0.35], [0.1, 0.3, 0.45]], gill: [0.2, 0.8, 1.1] } },
      { kind: 'pine', tiers: 3, count: 140, seed: 57, far: true, colors: { trunk: [[0.02, 0.01, 0.03], [0.03, 0.015, 0.04]], leaf: [[0.025, 0.01, 0.045], [0.05, 0.02, 0.07]] } },
    ],
    tint: [0.8, 1.2],
    props: [
      { kind: 'glowMushroom', count: 320, clump: 5, zone: 'verge', colors: [[1.8, 0.4, 1.6], [0.3, 1.5, 2.0], [1.0, 0.5, 2.2]] },
    ],
    weather: { kind: 'spores', count: 420, size: 0.15, fall: -0.35, wind: 0.1, sway: 0.7, colors: [[0.4, 1.2, 1.6], [1.4, 0.5, 1.4]] },
    wild: { color: [0.5, 0.9, 1], core: [0.9, 1, 1], alpha: 0.4 },
    fireflies: { color: [1, 0.3, 0.6], core: [1, 0.8, 0.92], light: '#ff8fc0', numeral: '#ffb4d4' },
    gate: { style: 'mushroom', post: '#c8b8c8', glow: [2.0, 0.5, 1.8] },
    beacon: { form: 'mushroom', stalk: '#d0c0d0', cap: '#5a1a6a', fire: [3.6, 1.2, 4.2], light: '#e080ff' },
    moth: { kind: 'wisp', wing: '#08040e', eyes: [2.2, 0.5, 2.0] },
    bend: 5,
    bloom: [0.85, 0.55, 0.78],
    exposure: 1,
    backing: 0.1,
  },
];

export const realmById = (id) => REALMS.find((r) => r.id === id) || REALMS[0];

/** Deals realm ids: all of them before any repeats, never the same twice running. */
export class RealmBag {
  constructor(rng, last = 'mossgate') {
    this.rng = rng;
    this.last = last;
    this.bag = [];
  }

  next() {
    if (!this.bag.length) {
      const ids = REALMS.map((r) => r.id);
      for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(this.rng.next() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }
      if (ids[0] === this.last) ids.push(ids.shift());
      this.bag = ids;
    }
    this.last = this.bag.shift();
    return this.last;
  }
}
