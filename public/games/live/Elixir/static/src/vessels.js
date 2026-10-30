// Vessel geometry from workshops.js's VESSELS: glass, liquid prisms, the
// moving surface, etched rings and front-face ticks, all on one convention
// (polygon vertex k at angle rot + 2πk/n in the x-z plane, x = cos, z = sin).
//
// Levels are fractions of the vessel: 0 at its base line, 1 at its full line,
// straight walls in between and up to MAX_LEVEL, so height is volume.

import * as THREE from 'three';
import { VESSELS } from './workshops.js';

export const MAX_LEVEL = 1.12;
export const FOOT = 0.075; // every vessel stands on a stand this tall
const ROUND = 72;
// The face that faces the camera a little from the left, where ticks are etched.
const TICK_DIR = Math.atan2(0.92, -0.4);

/** The numbers a vessel's builders and the game share. */
export function shapeOf(id) {
  const v = VESSELS[id] || VESSELS.flask;
  const n = v.sides || ROUND;
  const cosHalf = Math.cos(Math.PI / n);
  const y0 = FOOT + v.base + (v.foot ? 0.05 : 0);
  const y1 = y0 + v.h;
  const straightTop = y0 + v.h * (MAX_LEVEL + 0.04);
  const outer = v.r + v.wall / cosHalf;
  const s = { ...v, id, n, round: !v.sides, cosHalf, y0, y1, straightTop, outer, apothem: v.r * cosHalf, outerApothem: outer * cosHalf };
  s.rimY = v.neck ? straightTop + 0.16 + v.neck.h : straightTop + (v.lip === 'flare' ? 0.12 : v.lip === 'beak' ? 0.03 : 0.015);
  s.spoutY = s.rimY + (v.neck ? 0.14 : 0.2);
  // How far the glass reaches left and right of its axis, for labels.
  const xs = s.round ? [1, -1] : Array.from({ length: n }, (_, k) => Math.cos(v.rot + (2 * Math.PI * k) / n));
  s.right = outer * Math.max(...xs) + (v.lip === 'flare' ? 0.045 : 0);
  s.left = outer * Math.max(...xs.map((x) => -x)) + (v.lip === 'flare' ? 0.045 : 0);
  // The ticks go on the face turned towards the camera.
  if (s.round) s.tickAngle = TICK_DIR;
  else {
    let best = -2;
    for (let k = 0; k < n; k++) {
      const a = v.rot + ((2 * k + 1) * Math.PI) / n;
      const c = Math.cos(a - TICK_DIR);
      if (c > best) { best = c; s.tickAngle = a; }
    }
  }
  s.yOf = (level) => y0 + level * v.h;
  return s;
}

// The lathe-style profile of the glass: up the outside, over the lip, down the inside.
function profile(s) {
  const { r, wall, y0, straightTop, outer: o, lip } = s;
  const f = FOOT;
  const pts = [];
  if (s.foot) {
    const fr = s.foot;
    pts.push([0, f], [fr, f], [fr + 0.008, f + 0.012], [fr - 0.01, f + 0.03], [o + 0.03, f + 0.05], [o, f + 0.08]);
  } else {
    pts.push([0, f], [o - 0.035, f], [o - 0.008, f + 0.01], [o, f + 0.035]);
  }
  if (lip === 'flare') {
    pts.push([o, straightTop - 0.02], [o + 0.012, straightTop + 0.03], [o + 0.04, straightTop + 0.08], [o + 0.045, straightTop + 0.092], [o + 0.03, straightTop + 0.1], [r + 0.012, straightTop + 0.07], [r, straightTop + 0.02]);
  } else if (lip === 'roll') {
    pts.push([o, straightTop], [o + 0.012, straightTop + 0.008], [o + 0.008, straightTop + 0.02], [r + 0.004, straightTop + 0.016], [r, straightTop + 0.002]);
  } else if (lip === 'beak') {
    pts.push([o, straightTop - 0.01], [o + 0.03, straightTop + 0.02], [o + 0.032, straightTop + 0.032], [r + 0.02, straightTop + 0.028], [r, straightTop + 0.005]);
  } else if (lip === 'neck') {
    const nr = s.neck.r, no = nr + wall, top = s.rimY;
    const sh = straightTop;
    pts.push([o, sh], [o * 0.94, sh + 0.06], [no + 0.12, sh + 0.12], [no + 0.02, sh + 0.15], [no, sh + 0.16], [no, top - 0.04],
      [no + 0.03, top - 0.03], [no + 0.03, top], [nr, top], [nr, sh + 0.16], [nr + 0.02, sh + 0.15], [nr + 0.12 - wall, sh + 0.12], [r * 0.94 - 0.004, sh + 0.06], [r, sh]);
  } else {
    pts.push([o, straightTop + 0.012], [r, straightTop + 0.012]);
  }
  pts.push([r, y0 + 0.02], [r - 0.02, y0], [0, y0]);
  return pts.map(([x, y]) => new THREE.Vector2(x, y));
}

/** The vessel's glass, flat-faced when it has sides. */
export function glassGeometry(s) {
  let g = new THREE.LatheGeometry(profile(s), s.n, Math.PI / 2 - s.rot);
  if (!s.round) {
    g = g.toNonIndexed();
    g.computeVertexNormals();
  }
  return g;
}

/** A unit-tall prism of liquid (base at y = 0), to be scaled to each band. */
export function liquidGeometry(s) {
  const ri = s.r - 0.004;
  const g = new THREE.CylinderGeometry(ri, ri, 1, s.n, 1, false, Math.PI / 2 - s.rot);
  g.translate(0, 0.5, 0);
  return g;
}

/** The liquid's top, with rings of vertices so it can ripple. */
export function surfaceGeometry(s) {
  const g = new THREE.RingGeometry(0.0005, s.r - 0.004, s.n, 14, -s.rot);
  g.rotateX(-Math.PI / 2);
  return g;
}

/** A ring hugging the outside of the glass at height 0 (place it with .position.y). */
export function ringGeometry(s, tube, gap = 0.003) {
  const g = new THREE.TorusGeometry(s.outer + gap / s.cosHalf, tube, 6, s.round ? 120 : s.n);
  g.rotateX(Math.PI / 2);
  g.rotateY(-s.rot);
  return g;
}

/** A short etched tick on the face towards the camera. */
export function tickGeometry(s) {
  const len = s.round ? 0.13 : Math.min(0.2, 0.42 * s.r * Math.sin(Math.PI / s.n));
  const g = new THREE.BoxGeometry(len, 0.0065, 0.005);
  g.rotateY(-(s.tickAngle + Math.PI / 2));
  const d = s.outerApothem + 0.004;
  g.translate(Math.cos(s.tickAngle) * d, 0, Math.sin(s.tickAngle) * d);
  return g;
}

/** The stopper that seals it when it's bottled. */
export function corkGeometry(s) {
  if (s.neck) return new THREE.CylinderGeometry(s.neck.r + 0.02, s.neck.r - 0.01, 0.12, 20);
  return new THREE.CylinderGeometry(s.r + 0.03, s.r - 0.01, 0.14, s.n, 1, false, Math.PI / 2 - s.rot);
}

/** Where the cork sits when pressed home. */
export const corkY = (s) => s.rimY - 0.02;

/** A plinth matching the vessel's footprint. */
export function standGeometry(s) {
  const r = (s.foot || s.outer) + 0.1;
  const g = new THREE.CylinderGeometry(r, r + 0.05, FOOT, s.round ? 64 : s.n, 1, false, Math.PI / 2 - s.rot);
  g.translate(0, FOOT / 2, 0);
  return g;
}
