// Where each potion is brewed. Pure data: rooms.js builds the room, vessels.js
// the glass, taps.js the spout and card.js the recipe card from these entries.
//
// Every vessel is a right prism (or cylinder) with a flat bottom and straight
// walls between the base line and well above the full line, so the level a
// player sees is linear in volume whatever its shape. `r` is the inner
// circumradius, `h` the height from the base line to the full line; `sides`
// 0 means round. Polygon vertices sit at angles rot + 2πk/sides in the x-z
// plane (x = cos, z = sin; the camera looks from +z).

export const VESSELS = {
  flask: { name: 'tall flask', sides: 0, rot: 0, r: 0.3, h: 1.6, wall: 0.016, base: 0.085, lip: 'flare' },
  tube: { name: 'test tube', sides: 0, rot: 0, r: 0.2, h: 1.74, wall: 0.014, base: 0.06, lip: 'roll', foot: 0.36 },
  beaker: { name: 'wide beaker', sides: 0, rot: 0, r: 0.5, h: 1.22, wall: 0.018, base: 0.07, lip: 'beak' },
  hex: { name: 'hexagonal column', sides: 6, rot: 1.22, r: 0.36, h: 1.55, wall: 0.022, base: 0.09, lip: 'flat' },
  square: { name: 'apothecary bottle', sides: 4, rot: 1.08, r: 0.42, h: 1.45, wall: 0.022, base: 0.09, lip: 'neck', neck: { r: 0.13, h: 0.18 } },
  prism: { name: 'triangular prism', sides: 3, rot: 1.69, r: 0.5, h: 1.5, wall: 0.022, base: 0.09, lip: 'flat' },
};

// Six glowing ingredients per workshop; the recipe generator draws three.
// Names avoid "and", "to", commas and apostrophes, which recipes use as grammar.
const ING = (id, name, color, glow) => ({ id, name, color, glow, css: color });

export const WORKSHOPS = [
  {
    id: 'alcove',
    name: 'Candlelit alcove',
    room: 'alcove',
    vessel: 'flask',
    tap: 'brass',
    card: { style: 'parchment' },
    particles: 'dust',
    stand: { color: '#c79a4a', metalness: 1, roughness: 0.3 },
    ingredients: [
      ING('moonwater', 'Moonwater', '#76bfff', '#2a74ff'),
      ING('emberwine', 'Emberwine', '#ff7436', '#ff3d12'),
      ING('nightshade', 'Nightshade', '#a77bff', '#7a3dff'),
      ING('verdigris', 'Verdigris', '#4fe3a6', '#12b877'),
      ING('sunmilk', 'Sunmilk', '#ffd46b', '#ffa514'),
      ING('rosedew', 'Rose Dew', '#ff8cc0', '#ff3f8e'),
    ],
    light: {
      flicker: 0.12,
      background: '#06070c', fog: ['#07070c', 9, 22], exposure: 1.05, bloom: [0.5, 0.5, 0.78],
      hemi: ['#2a3358', '#24160c', 0.55],
      key: ['#a9c1ff', 0.9, [1.25, 3.86, -4.4], [0.4, 0, 0.5]],
      points: [['#ffa45a', 2.4, [1.3, 0.6, 0.55]], ['#ffa45a', 2.0, [2.45, 0.96, -0.6]], ['#ffa45a', 2.0, [-2.85, 1.11, -1.0]]],
    },
    env: {
      room: '#120d0a',
      blobs: [['#ffb060', 7, [-3, 0.6, 3.5], 0.35], ['#ffa850', 6, [3.6, 0.8, -1.5], 0.3], ['#ff9c40', 5, [-3.2, 1.6, -2.5], 0.3]],
      window: ['#b0c8ff', 2.4, [2.5, 3.2, -5], 1.4],
      strips: [['#ffe0c0', 1.3, [-3.5, 1.5, 5]], ['#ffd0a0', 0.9, [4, 1.5, 4]]],
    },
  },
  {
    id: 'observatory',
    name: 'Tower observatory',
    room: 'observatory',
    vessel: 'tube',
    tap: 'pipette',
    card: { style: 'slate' },
    particles: 'stars',
    stand: { color: '#2a2e3a', metalness: 0.6, roughness: 0.35 },
    ingredients: [
      ING('starlight', 'Starlight', '#d6e4ff', '#8fb0ff'),
      ING('nebulaink', 'Nebula Ink', '#d07bff', '#a43dff'),
      ING('comettail', 'Comet Tail', '#6fe7ff', '#16b8ff'),
      ING('solarwind', 'Solar Wind', '#ffcf5a', '#ff9a12'),
      ING('meteorred', 'Meteor Red', '#ff6b5e', '#ff2a1f'),
      ING('aurora', 'Aurora', '#5dffb4', '#12d87a'),
    ],
    light: {
      flicker: 0.03,
      background: '#04050d', fog: ['#05061a', 10, 24], exposure: 1.08, bloom: [0.55, 0.5, 0.74],
      hemi: ['#30387a', '#120f1c', 0.65],
      key: ['#b8c8ff', 1.1, [1.6, 4.5, -4.5], [0, 0, 0.6]],
      points: [['#9db8ff', 1.6, [-0.95, 0.42, 0.62]], ['#c9a0ff', 1.3, [2.45, 0.85, -0.5]], ['#ffd59a', 1.0, [-2.6, 2.2, -1.2]]],
    },
    env: {
      room: '#0a0b18',
      blobs: [['#a0b8ff', 5, [-3, 1.2, 3.5], 0.35], ['#c8a0ff', 4, [3.6, 0.9, -1.5], 0.3], ['#ffd8a0', 3, [-2, 0.4, 2.5], 0.25]],
      window: ['#8090ff', 2.2, [1.2, 3.4, -5], 1.8],
      strips: [['#c8d4ff', 1.2, [-3.5, 1.5, 5]], ['#a8b4ff', 0.7, [4, 1.5, 4]]],
    },
  },
  {
    id: 'greenhouse',
    name: 'Greenhouse at dawn',
    room: 'greenhouse',
    vessel: 'beaker',
    tap: 'spigot',
    card: { style: 'botanical', motif: 'fern' },
    particles: 'pollen',
    marks: { ink: '#3a2418', glow: 'rgba(255,240,220,0.9)', line: '#4a3020' },
    stand: { color: '#8a5a32', metalness: 0, roughness: 0.6 },
    ingredients: [
      ING('ferndew', 'Fern Dew', '#8fe36b', '#4cbf1f'),
      ING('marigold', 'Marigold', '#ffb340', '#ff7d00'),
      ING('lavender', 'Lavender', '#b99bff', '#7d4dff'),
      ING('rosehip', 'Rosehip', '#ff6f80', '#ff2848'),
      ING('bluebell', 'Bluebell', '#78b4ff', '#2f74ff'),
      ING('elderflower', 'Elderflower', '#fff07a', '#ffd000'),
    ],
    light: {
      flicker: 0.0,
      background: '#2a1f2a', fog: ['#e8a888', 10, 26], exposure: 0.95, bloom: [0.45, 0.6, 0.85],
      hemi: ['#ffc8a0', '#3a5a2a', 0.9],
      key: ['#ffb070', 2.4, [5, 2.2, -4], [0, 0.6, 0.4]],
      points: [['#ffcf9a', 1.2, [-2.4, 1.5, 0.8]], ['#ffd8b0', 0.9, [2.4, 1.2, 0.6]], ['#a8e8a0', 0.6, [-0.6, 2.4, -1.4]]],
    },
    env: {
      room: '#2a2228',
      blobs: [['#ffb070', 6, [4.5, 1.6, -3.5], 0.6], ['#ffd0a0', 3, [-3, 2, 3], 0.4], ['#a0e090', 1.5, [0, 4, 0], 0.6]],
      window: ['#ffc898', 2.6, [1, 2.6, -5], 2.4],
      strips: [['#fff0d8', 1.4, [-3.5, 1.5, 5]], ['#ffd8b0', 1.0, [4, 1.5, 4]]],
    },
  },
  {
    id: 'cavern',
    name: 'Crystal cavern',
    room: 'cavern',
    vessel: 'hex',
    tap: 'crystal',
    card: { style: 'slate', tint: 'stone' },
    particles: 'sparkles',
    stand: { color: '#3a3d4a', metalness: 0.1, roughness: 0.75 },
    ingredients: [
      ING('quartzmilk', 'Quartz Milk', '#e2efff', '#a8ccff'),
      ING('amethyst', 'Amethyst', '#b56bff', '#8a2bff'),
      ING('malachite', 'Malachite', '#3fe3a0', '#00b870'),
      ING('garnet', 'Garnet', '#ff4f6e', '#e0002e'),
      ING('sapphire', 'Sapphire', '#5f9bff', '#1a4cff'),
      ING('ambersap', 'Amber Sap', '#ffb84d', '#ff8a00'),
    ],
    light: {
      flicker: 0.06,
      background: '#03040a', fog: ['#05060f', 7, 18], exposure: 1.2, bloom: [0.65, 0.55, 0.72],
      hemi: ['#3a5288', '#1a0e22', 1.0],
      key: ['#6ad8ff', 0.5, [0, 5, 2], [0, 0, 0]],
      points: [['#4fe0ff', 2.6, [-2.2, 0.7, -0.6]], ['#d070ff', 2.4, [2.3, 0.9, -0.7]], ['#7fffd0', 1.4, [0.9, 2.6, -1.4]]],
    },
    env: {
      room: '#06070e',
      blobs: [['#40d8ff', 6, [-3, 0.8, 2.5], 0.4], ['#d060ff', 6, [3.4, 1, -1.5], 0.4], ['#60ffc8', 3, [1, 3.5, -2], 0.3]],
      window: ['#203050', 0.6, [0, 3, -5], 1],
      strips: [['#b0e8ff', 1.1, [-3.5, 1.5, 5]], ['#e0b0ff', 0.8, [4, 1.5, 4]]],
    },
  },
  {
    id: 'cottage',
    name: 'Winter cottage',
    room: 'cottage',
    vessel: 'square',
    tap: 'still',
    card: { style: 'botanical', motif: 'holly' },
    particles: 'embers',
    stand: { color: '#5a3a24', metalness: 0, roughness: 0.7 },
    ingredients: [
      ING('frostmint', 'Frostmint', '#8ff3e8', '#22d6c4'),
      ING('mulledwine', 'Mulled Wine', '#ff5a4a', '#d01e10'),
      ING('hearthhoney', 'Hearth Honey', '#ffc24d', '#ff9000'),
      ING('snowberry', 'Snowberry', '#e8eeff', '#a8b8ff'),
      ING('pineresin', 'Pine Resin', '#9bd36a', '#4fa81c'),
      ING('sugarplum', 'Sugarplum', '#c07bff', '#8c3dff'),
    ],
    light: {
      flicker: 0.2,
      background: '#08070a', fog: ['#0c0907', 9, 22], exposure: 1.05, bloom: [0.5, 0.5, 0.78],
      hemi: ['#3a4060', '#2a160c', 0.55],
      key: ['#9ab4ff', 0.7, [1.6, 4, -4.4], [0.3, 0, 0.5]],
      points: [['#ff8a3a', 3.4, [-2.9, 0.7, 0.2]], ['#ffb060', 1.6, [2.3, 0.42, -0.3]], ['#ff9a4a', 1.4, [-1.1, 0.55, -1.0]]],
    },
    env: {
      room: '#140c08',
      blobs: [['#ff8030', 8, [-3.5, 0.6, 1.5], 0.6], ['#ffb060', 4, [3, 1, -1.5], 0.3], ['#ff9a4a', 3, [-1, 0.5, 3], 0.25]],
      window: ['#90a8e8', 1.8, [1.8, 3, -5], 1.3],
      strips: [['#ffd8b8', 1.2, [-3.5, 1.5, 5]], ['#ffc8a0', 0.9, [4, 1.5, 4]]],
    },
  },
  {
    id: 'desert',
    name: 'Caravan tent',
    room: 'desert',
    vessel: 'prism',
    tap: 'ewer',
    card: { style: 'scroll' },
    particles: 'sand',
    stand: { color: '#b8862e', metalness: 1, roughness: 0.35 },
    ingredients: [
      ING('saffron', 'Saffron', '#ffae3a', '#ff7a00'),
      ING('pomegranate', 'Pomegranate', '#ff4a5e', '#e0102a'),
      ING('desertmint', 'Desert Mint', '#7cf0a8', '#20c868'),
      ING('indigo', 'Indigo', '#7a86ff', '#3a2fff'),
      ING('damaskrose', 'Damask Rose', '#ff8cc6', '#ff3f96'),
      ING('oasisblue', 'Oasis Blue', '#5fe0ff', '#00b4e8'),
    ],
    light: {
      flicker: 0.1,
      background: '#0c0606', fog: ['#120806', 9, 22], exposure: 1.05, bloom: [0.55, 0.55, 0.76],
      hemi: ['#5a3a50', '#3a1a0c', 0.6],
      key: ['#ff9a70', 0.8, [3.5, 3.5, -4.5], [0, 0, 0.5]],
      points: [['#ffa040', 2.6, [-1.0, 2.45, -0.9]], ['#ffb050', 2.2, [1.85, 2.45, -0.6]], ['#ff8a30', 1.4, [2.45, 0.25, 0.45]]],
    },
    env: {
      room: '#1a0c08',
      blobs: [['#ffa040', 7, [-3, 2.4, 2.5], 0.4], ['#ffb050', 6, [3, 2.4, 1], 0.4], ['#ff7040', 3, [2.5, 0.5, 3], 0.3]],
      window: ['#e0a0c0', 1.6, [2, 2.6, -5], 1.4],
      strips: [['#ffe0b0', 1.2, [-3.5, 1.5, 5]], ['#ffc890', 0.9, [4, 1.5, 4]]],
    },
  },
];

/** Every ingredient any workshop uses, by id. */
export const INGREDIENT_LOOK = Object.fromEntries(WORKSHOPS.flatMap((w) => w.ingredients.map((i) => [i.id, i])));

export const workshopById = (id) => WORKSHOPS.find((w) => w.id === id) || WORKSHOPS[0];
