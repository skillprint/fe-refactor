// Palettes: what each kind of mountain is made of, and how the light moves
// from mid-afternoon through alpenglow to blue hour.

import * as THREE from 'three';

export const BIOMES = {
  alpine: {
    grassA: '#5c7a37', grassB: '#7f8e43', grassDry: '#a19456', grassWet: '#3f6330',
    rockA: '#6e6a66', rockB: '#928a7f', rockDark: '#403d3b',
    snow: '#f2f5fa', ice: '#cde5f1', iceDeep: '#78abcb', scar: '#bdb4a5',
    strata: 0.3, strataFreq: 0.32, rockSlope: 0.42, snowSlope: 0.68,
    snowline: [0.5, 0.64], treeline: 0.36,
    tree: 'pine', trees: ['#36602f', '#41693a', '#2f5536', '#4d7140', '#3a5e3a'],
  },
  granite: {
    grassA: '#557a3f', grassB: '#71894a', grassDry: '#958d5d', grassWet: '#3b6136',
    rockA: '#97958e', rockB: '#bcb8ad', rockDark: '#5a5957',
    snow: '#f5f7fb', ice: '#d3e9f3', iceDeep: '#7fb3d0', scar: '#d7d1c3',
    strata: 0.1, strataFreq: 0.2, rockSlope: 0.4, snowSlope: 0.62,
    snowline: [0.56, 0.7], treeline: 0.38,
    tree: 'pine', trees: ['#30582f', '#3a6235', '#2d5039', '#466b40'],
  },
  volcanic: {
    grassA: '#5b6b38', grassB: '#737542', grassDry: '#8e7c56', grassWet: '#465b31',
    rockA: '#4a403f', rockB: '#735446', rockDark: '#2a2423',
    snow: '#f1f3f8', ice: '#d0e4ee', iceDeep: '#7aa6c2', scar: '#c9a24c',
    strata: 0.28, strataFreq: 0.22, rockSlope: 0.4, snowSlope: 0.64,
    snowline: [0.64, 0.74], treeline: 0.4,
    tree: 'pine', trees: ['#33522c', '#3d5a31', '#334c33'],
  },
  desert: {
    grassA: '#a08e5c', grassB: '#b59d66', grassDry: '#c7a874', grassWet: '#7f7b4b',
    rockA: '#b0603a', rockB: '#dc9e66', rockDark: '#6f3622',
    snow: '#f4ede4', ice: '#ffffff', iceDeep: '#ffffff', scar: '#e8c497',
    strata: 0.85, strataFreq: 0.6, rockSlope: 0.3, snowSlope: 0.5,
    snowline: null, treeline: 0.55,
    tree: 'juniper', trees: ['#59693e', '#66733f', '#4f5f3a'],
  },
};

// Keyframes over the time of day t in [0, 1]. A day pair runs from
// mid-afternoon to blue hour; a night pair from moonlight to sunrise, with the
// directional light standing in for the moon until dawn.
const DAY = [
  { t: 0.0, elev: 36, sun: '#fff1dc', sunI: 3.1, sky: '#b4cdea', gnd: '#5d5747', hemiI: 1.25, zen: '#2f62b4', fog: '#a9c5e4', fogSun: '#fff3dc', night: 0, moon: 0, exp: 0.9 },
  { t: 0.38, elev: 22, sun: '#ffe4ba', sunI: 3.1, sky: '#a3bbe0', gnd: '#5f5546', hemiI: 1.2, zen: '#3462ae', fog: '#bccde0', fogSun: '#ffe7bf', night: 0, moon: 0, exp: 0.9 },
  { t: 0.62, elev: 10, sun: '#ffbd7a', sunI: 2.9, sky: '#8ea2d8', gnd: '#5d4d43', hemiI: 1.05, zen: '#4560a6', fog: '#d6c0bb', fogSun: '#ffc58a', night: 0, moon: 0, exp: 0.95 },
  { t: 0.78, elev: 3.5, sun: '#ff8e55', sunI: 2.5, sky: '#7f88c6', gnd: '#4d3d3c', hemiI: 0.95, zen: '#3a4a8e', fog: '#c99a98', fogSun: '#ffa463', night: 0, moon: 0, exp: 1.0 },
  { t: 0.9, elev: 1.0, sun: '#ff7590', sunI: 1.7, sky: '#6f74aa', gnd: '#3a3141', hemiI: 0.85, zen: '#2c3672', fog: '#a98299', fogSun: '#f2928f', night: 0.12, moon: 0, exp: 1.1 },
  { t: 1.0, elev: 0.2, sun: '#8590dc', sunI: 0.5, sky: '#4a5586', gnd: '#272738', hemiI: 0.8, zen: '#141c42', fog: '#3f4b7a', fogSun: '#596495', night: 1, moon: 0, exp: 1.35 },
];

const NIGHT = [
  { t: 0.0, elev: 38, sun: '#a8bcff', sunI: 1.7, sky: '#4559a0', gnd: '#2a2d44', hemiI: 1.6, zen: '#050918', fog: '#141d3c', fogSun: '#22305c', night: 1, moon: 1, exp: 1.75 },
  { t: 0.6, elev: 30, sun: '#a2b6fa', sunI: 1.6, sky: '#42569c', gnd: '#2a2d44', hemiI: 1.55, zen: '#070c20', fog: '#18224a', fogSun: '#273766', night: 1, moon: 1, exp: 1.75 },
  { t: 0.78, elev: 16, sun: '#9eaae6', sunI: 1.3, sky: '#475a9c', gnd: '#2a2b40', hemiI: 1.35, zen: '#0d1636', fog: '#24325f', fogSun: '#3d4c84', night: 0.85, moon: 0.9, exp: 1.6 },
  { t: 0.88, elev: 3, sun: '#c8a3cc', sunI: 0.9, sky: '#5b6ba6', gnd: '#2a2635', hemiI: 0.9, zen: '#1d2b60', fog: '#6b78a8', fogSun: '#d99b90', night: 0.35, moon: 0.45, exp: 1.35 },
  { t: 0.95, elev: 1.2, sun: '#ff9b7c', sunI: 1.7, sky: '#7e88c4', gnd: '#3a3141', hemiI: 0.9, zen: '#33478c', fog: '#c89ca2', fogSun: '#ffb07c', night: 0.07, moon: 0.1, exp: 1.15 },
  { t: 1.0, elev: 4.5, sun: '#ffc488', sunI: 2.6, sky: '#9aaad6', gnd: '#4f4740', hemiI: 1.0, zen: '#3f62a8', fog: '#e0c2ae', fogSun: '#ffd29c', night: 0, moon: 0, exp: 1.0 },
];

const COLORS = ['sun', 'sky', 'gnd', 'zen', 'fog', 'fogSun'];
const NUMBERS = ['elev', 'sunI', 'hemiI', 'night', 'moon', 'exp'];
for (const k of [...DAY, ...NIGHT]) for (const c of COLORS) k[c] = new THREE.Color(k[c]);

const out = { sun: new THREE.Color(), sky: new THREE.Color(), gnd: new THREE.Color(), zen: new THREE.Color(), fog: new THREE.Color(), fogSun: new THREE.Color() };

export function sampleSky(t, night = false) {
  const keys = night ? NIGHT : DAY;
  t = Math.min(1, Math.max(0, t));
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const a = keys[i], b = keys[i + 1];
  const f = (t - a.t) / (b.t - a.t);
  const s = f * f * (3 - 2 * f);
  for (const n of NUMBERS) out[n] = a[n] + (b[n] - a[n]) * s;
  for (const c of COLORS) out[c].copy(a[c]).lerp(b[c], s);
  return out;
}
