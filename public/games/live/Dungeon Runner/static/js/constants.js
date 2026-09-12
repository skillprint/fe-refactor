export const LANE_X = [-2.2, 0, 2.2];
export const LANE_COUNT = 3;
export const HALF_WIDTH = 3.6;
export const CEILING = 4.2;
export const SEG_LEN = 20;
export const SEG_COUNT = 7;
export const EYE_HEIGHT = 1.6;
export const SLIDE_HEIGHT = 0.8;
export const PLAYER_MAX_HEALTH = 100;

export const OBSTACLE = {
  BARREL: 'barrel',
  BEAM: 'beam',
  PIT: 'pit',
  GATE: 'gate',
  BLADE: 'blade',
};

export const ENEMY = {
  IMP: 'imp',
  ARCHER: 'archer',
};

export const PICKUP = {
  HEALTH: 'health',
  AMMO: 'ammo',
  GOLD: 'gold',
};

export const WEAPONS = [
  { id: 0, key: 'pistol', name: 'Pistol', damage: 1.0, rps: 2.6, pellets: 1, spread: 0, range: 60, ammo: Infinity, projectile: false, splash: 0, color: '#ffd27a' },
  { id: 1, key: 'shotgun', name: 'Shotgun', damage: 0.55, rps: 1.05, pellets: 7, spread: 0.11, range: 20, ammo: 24, projectile: false, splash: 0, color: '#ff9a3d' },
  { id: 2, key: 'plasma', name: 'Plasma', damage: 0.8, rps: 6, pellets: 1, spread: 0.015, range: 60, ammo: 60, projectile: true, splash: 1.6, color: '#6ef3ff' },
];

export const DAMAGE = {
  IMP_LUNGE: 22,
  ARROW: 15,
  BARREL_HIT: 18,
  BARREL_EXPLODE: 26,
  BEAM: 20,
  PIT: 30,
  GATE: 20,
  BLADE: 24,
};

export const SCORE = {
  KILL: 50,
  GOLD: 25,
  PICKUP: 10,
  METRE: 1,
};

export function rand(a, b) { return a + Math.random() * (b - a); }
export function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
export function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
export function lerp(a, b, t) { return a + (b - a) * t; }
export function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
