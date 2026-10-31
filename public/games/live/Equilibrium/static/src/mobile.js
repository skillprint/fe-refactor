// The mobile itself: beams, hooks, wires and finished weights laid out from a
// puzzle, swaying under a little physics, plus the row of loose weights on
// the plinth. Everything lives in rig-local space (z = 0 is the mobile's
// plane); the rig only ever moves up and down and turns about its wire. What
// it's made of comes from the exhibit (exhibits.js); its materials belong to
// it and go when it does.

import * as THREE from 'three';
import { measure, freeHooks, makeRng, clamp } from './puzzle.js';
import { numeral, tick, pill } from './labels.js';
import { legiblePalette } from './exhibits.js';

export const U = 0.8; // world units between neighbouring hooks
const BAR = 0.026;
const MAX_TILT = 0.2;
const TILT_K = 22, TILT_C = 3.4; // an underdamped spring: a beam overshoots and settles
const G = 9.8;
const SWING_C = 1.25;
const HOOK_DROP = 0.045;
const LABEL_Y = 0.15;

export const radiusFor = (w) => 0.23 + 0.04 * Math.sqrt(w);
const R_MAX = radiusFor(15);
// Every outline is scaled to fit within these, in units of its radius.
const MAX_W = 2.25, MAX_H = 2.4;
const HANG_DEPTH = 0.5 + MAX_H * R_MAX; // the lowest a weight on a hook can reach
const KID_GAP = 0.34;
// What the swing of a hanging weight or sub-beam can add to the mobile's reach.
const SWING_ROOM = 0.45;

const frac = (x) => x - Math.floor(x);
// Each hook's wire length, fixed per beam and distance: odd and even hooks
// hang at two staggered heights, the way a Calder's weights do, with a
// little variation within each.
const wireFor = (beam, d) => (Math.abs(d) % 2 ? 0.17 : 0.4) + 0.1 * frac(Math.sin(beam * 12.9898 + d * 78.233 + 0.5) * 43758.5453);
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

const brass = new THREE.MeshStandardMaterial({ color: '#c79a4a', roughness: 0.32, metalness: 0.85 });
const warning = new THREE.MeshBasicMaterial({ color: '#d2352b', toneMapped: false, transparent: true });
const hidden = new THREE.MeshBasicMaterial({ visible: false });

// ---------------------------------------------------------------------------
// Outlines. Each returns points in units of the weight's radius, anywhere in
// the plane; weightShape() scales, hangs and extrudes it. `v` in [0, 1) is the
// weight's own variant, so no two leaves or pebbles need be alike. A few say
// where their number goes (`focus`); the rest put it at the centroid.

const ring = (cx, cy, rx, ry, n = 64, from = 0) => Array.from({ length: n }, (_, i) => {
  const a = from + (i / n) * Math.PI * 2;
  return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
});
const fromShape = (s) => s.getPoints(18).map((p) => [p.x, p.y]);

function roundedPoly(corners, k) {
  const out = [];
  const n = corners.length;
  for (let i = 0; i < n; i++) {
    const p = corners[i], a = corners[(i + n - 1) % n], b = corners[(i + 1) % n];
    const toward = (q) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy); return [p[0] + dx / l * k, p[1] + dy / l * k]; };
    const s = toward(a), e = toward(b);
    for (let j = 0; j <= 6; j++) {
      const t = j / 6, u = 1 - t;
      out.push([u * u * s[0] + 2 * u * t * p[0] + t * t * e[0], u * u * s[1] + 2 * u * t * p[1] + t * t * e[1]]);
    }
  }
  return out;
}

const OUTLINES = {
  disc: () => ({ pts: ring(0, 0, 1, 1), nh: 1.2 }),
  drop: () => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0.22, -0.22, 1, -0.68, 1, -1.32);
    s.absarc(0, -1.32, 1, 0, Math.PI, true);
    s.bezierCurveTo(-1, -0.68, -0.22, -0.22, 0, 0);
    return { pts: fromShape(s), nh: 1.12 };
  },
  half: () => {
    const s = new THREE.Shape();
    s.moveTo(-1, 0);
    s.lineTo(1, 0);
    s.absarc(0, 0, 1, 0, Math.PI, true);
    return { pts: fromShape(s), nh: 0.8 };
  },
  tri: () => ({ pts: roundedPoly([[-1.04, 0], [0, -1.9], [1.04, 0]], 0.2), nh: 0.86 }),
  // Hangs from its stem; the tip curls to one side or the other.
  leaf: (v) => {
    const tip = v < 0.5 ? -1 : 1, curl = 0.2 + 0.3 * frac(v * 7.3), fat = 0.88 + 0.14 * frac(v * 3.1);
    const right = [], left = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const hw = fat * Math.sin(Math.PI * Math.pow(t, 0.72)) * (1 - 0.12 * t);
      const c = tip * curl * t * t * t;
      right.push([c + hw, -2.5 * t]);
      left.push([c - hw, -2.5 * t]);
    }
    return { pts: [...right, ...left.reverse().slice(1, -1)], nh: 1.0 };
  },
  petal: (v) => {
    const fat = 0.95 + 0.12 * v;
    const right = [], left = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const hw = fat * Math.sqrt(Math.max(0, Math.sin(Math.PI * Math.pow(t, 0.8)))) * (1 - 0.15 * t);
      right.push([hw, -2.2 * t]);
      left.push([-hw, -2.2 * t]);
    }
    return { pts: [...right, ...left.reverse().slice(1, -1)], nh: 1.05 };
  },
  // A river stone: no two the same.
  pebble: (v) => {
    const a = v * 6.283, b = frac(v * 13.7) * 6.283, c = frac(v * 29.3) * 6.283, sx = 1.04 + 0.14 * frac(v * 5.9);
    const pts = Array.from({ length: 64 }, (_, i) => {
      const th = (i / 64) * Math.PI * 2;
      const rho = 1 + 0.09 * Math.sin(2 * th + a) + 0.06 * Math.sin(3 * th + b) + 0.035 * Math.sin(5 * th + c);
      return [sx * rho * Math.cos(th), (1.9 - sx) * rho * Math.sin(th)];
    });
    return { pts, nh: 1.1 };
  },
  star: () => ({
    pts: roundedPoly(Array.from({ length: 10 }, (_, k) => {
      const a = Math.PI / 2 + (k * Math.PI) / 5, R = k % 2 ? 0.74 : 1.32;
      return [R * Math.cos(a), R * Math.sin(a)];
    }), 0.08),
    nh: 0.92,
  }),
  // A moon with a round bite out of one shoulder: the outer circle the long
  // way round, then back along the bite's edge where it lies inside.
  moon: (v) => {
    const side = v < 0.5 ? 1 : -1;
    const R = 1.18, bx = side * 0.72 * R, by = 0.52 * R, br = 0.66 * R;
    const d = Math.hypot(bx, by), tb = Math.atan2(by, bx);
    const delta = Math.acos((R * R + d * d - br * br) / (2 * R * d));
    const pts = [];
    for (let i = 0; i <= 90; i++) {
      const a = tb + delta + (i / 90) * (Math.PI * 2 - 2 * delta);
      pts.push([R * Math.cos(a), R * Math.sin(a)]);
    }
    const at = (p) => Math.atan2(p[1] - by, p[0] - bx);
    const from = at(pts[pts.length - 1]), to = at(pts[0]);
    // Of the two ways round the bite, take the one that passes nearest the middle.
    let span = to - from;
    span -= Math.PI * 2 * Math.round(span / (Math.PI * 2));
    const alt = span > 0 ? span - Math.PI * 2 : span + Math.PI * 2;
    const mid = (sp) => { const a = from + sp / 2; return Math.hypot(bx + br * Math.cos(a), by + br * Math.sin(a)); };
    const sweep = mid(span) < mid(alt) ? span : alt;
    for (let i = 1; i < 40; i++) {
      const a = from + (i / 40) * sweep;
      pts.push([bx + br * Math.cos(a), by + br * Math.sin(a)]);
    }
    // The number sits in the full side, away from the bite.
    return { pts, nh: 0.94, focus: [(-bx / d) * 0.32 * R, (-by / d) * 0.32 * R] };
  },
  square: () => ({ pts: roundedPoly([[-0.9, 0.9], [0.9, 0.9], [0.9, -0.9], [-0.9, -0.9]], 0.2), nh: 1.1 }),
  diamond: () => ({ pts: roundedPoly([[0, 1.25], [1.25, 0], [0, -1.25], [-1.25, 0]], 0.18), nh: 0.98 }),
  // A paper lantern: a rounded barrel.
  lantern: () => ({
    pts: Array.from({ length: 72 }, (_, i) => {
      const a = (i / 72) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      return [0.9 * Math.sign(c) * Math.pow(Math.abs(c), 0.62), 1.15 * Math.sign(s) * Math.pow(Math.abs(s), 0.62)];
    }),
    nh: 1.12,
  }),
  // Swims left or right; its number sits in the body, clear of the tail.
  fish: (v) => {
    const f = v < 0.5 ? 1 : -1;
    const body = [];
    for (let i = 0; i <= 30; i++) {
      const a = (i / 30) * 2.7;
      body.push([0.2 + 0.95 * Math.cos(a), 0.6 * Math.sin(a)]);
    }
    const tail = [[-1.25, 0.55], [-0.98, 0], [-1.25, -0.55]];
    const under = body.map(([x, y]) => [x, -y]).reverse();
    return { pts: [...body, ...tail, ...under].map(([x, y]) => [f * x, y]), nh: 0.9, focus: [0.2 * f, 0] };
  },
};

export const SHAPE_KINDS = Object.keys(OUTLINES);

// How a finish is cut from sheet: paper is thin, glass thick and soft-edged.
const PROFILES = {
  paper: { depth: 0.014, bevelThickness: 0.004, bevelSize: 0.004 },
  glass: { depth: 0.05, bevelThickness: 0.016, bevelSize: 0.014 },
  sheet: { depth: 0.034, bevelThickness: 0.01, bevelSize: 0.009 },
};

/**
 * A weight's outline, scaled to radius r and hung from (0, 0): the point on
 * its top edge straight above its centroid, so it hangs the way it would.
 * Numbers go at `nx, ny` with height `nh`; `width` is twice its furthest reach.
 */
function weightShape(kind, w, v, finish) {
  const r = radiusFor(w);
  const o = OUTLINES[kind](v);
  let pts = o.pts;
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const k = Math.min(1, MAX_W / (Math.max(...xs) - Math.min(...xs)), MAX_H / (Math.max(...ys) - Math.min(...ys))) * r;
  pts = pts.map(([x, y]) => [x * k, y * k]);
  // Area centroid, then the top edge above it.
  let A = 0, cx = 0, cy = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
    const c = x0 * y1 - x1 * y0;
    A += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c;
  }
  cx /= 3 * A; cy /= 3 * A;
  let top = -Infinity;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
    if ((x0 - cx) * (x1 - cx) > 0 || x0 === x1) continue;
    top = Math.max(top, y0 + ((cx - x0) / (x1 - x0)) * (y1 - y0));
  }
  pts = pts.map(([x, y]) => new THREE.Vector2(x - cx, y - top));
  const focus = o.focus ? [o.focus[0] * k - cx, o.focus[1] * k - top] : [0, cy - top];
  const prof = PROFILES[finish === 'paper' ? 'paper' : finish === 'glass' ? 'glass' : 'sheet'];
  const geo = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { ...prof, bevelEnabled: true, bevelSegments: 3, curveSegments: 12 });
  geo.translate(0, 0, -prof.depth / 2);
  const reach = Math.max(...pts.map((p) => Math.abs(p.x)));
  return {
    geo, r,
    h: -Math.min(...pts.map((p) => p.y)),
    nx: focus[0], ny: focus[1],
    nh: o.nh * k,
    width: 2 * reach,
    face: prof.depth / 2 + prof.bevelThickness + 0.0015,
  };
}

// A weight's body, finished the exhibit's way. Metal reflects a soft studio;
// paper glows a little from within; glass is frosted and lets light through.
function bodyMaterial(finish, color, env) {
  if (finish === 'metal') return new THREE.MeshStandardMaterial({ color, metalness: 0.62, roughness: 0.42, envMap: env(), envMapIntensity: 0.65 });
  if (finish === 'paper') return new THREE.MeshStandardMaterial({ color, roughness: 0.92, emissive: color, emissiveIntensity: 0.3 });
  // Pale glass lets less through, or it would vanish against a pale wall.
  if (finish === 'glass') return new THREE.MeshPhysicalMaterial({ color, roughness: 0.38, transmission: new THREE.Color(color).getHSL({}).l > 0.75 ? 0.45 : 0.82, thickness: 0.14, ior: 1.5, attenuationColor: color, attenuationDistance: 0.18, specularIntensity: 0.8, sheen: 0.4, sheenRoughness: 0.6, sheenColor: '#ffffff' });
  if (finish === 'matte') return new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0 });
  return new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.06 });
}

const numeralGeo = new THREE.PlaneGeometry(2, 1);

class WeightView {
  constructor(def, paint, kind, variant, look) {
    this.def = def;
    this.id = def.id;
    this.w = def.w;
    this.pinned = !def.loose;
    this.kind = kind;
    const sh = (this.shape = weightShape(kind, def.w, variant, look.finish));
    this.group = new THREE.Group();
    this.inner = new THREE.Group();
    this.group.add(this.inner);

    this.paint = bodyMaterial(look.finish, paint.body, look.env);
    const body = new THREE.Mesh(sh.geo, this.paint);
    body.castShadow = body.receiveShadow = true;
    this.inner.add(body);

    const ink = new THREE.MeshStandardMaterial({ map: numeral(String(def.w), paint.ink), transparent: true, roughness: 0.55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    for (const back of [false, true]) {
      const n = new THREE.Mesh(numeralGeo, ink);
      n.scale.set(sh.nh * 2, sh.nh, 1);
      n.position.set(sh.nx, sh.ny, back ? -sh.face : sh.face);
      if (back) n.rotation.y = Math.PI;
      this.inner.add(n);
    }

    // Pinned weights are riveted in brass; loose ones hang from a wire clip.
    const top = this.pinned
      ? new THREE.Mesh(new THREE.SphereGeometry(0.034, 16, 12), brass)
      : new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.0065, 8, 20), look.wire);
    top.position.y = this.pinned ? -0.008 : 0.018;
    top.castShadow = true;
    this.inner.add(top);

    const hit = new THREE.Mesh(new THREE.CircleGeometry(Math.max(sh.width * 0.55, sh.h * 0.55, 0.28), 20), hidden);
    hit.position.set(sh.nx, -sh.h / 2, 0);
    hit.userData.weight = def.id;
    this.hit = hit;
    this.inner.add(hit);

    this.pos = new THREE.Vector3();
    this.state = 'tray';
    this.flying = false;
    this.swing = { phi: 0, dphi: 0, init: false, hx: 0, vx: 0, ax: 0 };
    this.rot = 0;
    this.wiggle = 0;
    this.lift = 0;
    this.selected = false;
  }
}

// ---------------------------------------------------------------------------
// Beams

class BeamView {
  constructor(def, look) {
    this.def = def;
    this.id = def.id;
    this.half = (def.reach + 0.32) * U;
    const g = (this.group = new THREE.Group());
    const bar = BAR * look.bar;

    const rod = new THREE.Mesh(new THREE.CylinderGeometry(bar, bar, this.half * 2, 12), look.beam);
    rod.rotation.z = Math.PI / 2;
    rod.castShadow = true;
    g.add(rod);

    // The ends: turned up in a curl, a ball, or simply rounded off.
    for (const side of [-1, 1]) {
      let end;
      if (look.ends === 'curl') {
        end = new THREE.Mesh(new THREE.TorusGeometry(0.062, bar * 0.92, 8, 24, Math.PI * 1.15), look.beam);
        end.position.set(side * this.half, 0.062, 0);
        end.rotation.z = -Math.PI / 2;
        end.scale.x = side;
      } else {
        end = new THREE.Mesh(new THREE.SphereGeometry(look.ends === 'ball' ? bar * 2.4 : bar * 1.02, 16, 12), look.beam);
        end.position.x = side * this.half;
      }
      end.castShadow = true;
      g.add(end);
    }
    // Bamboo has nodes between its hooks.
    if (look.nodes) {
      const node = new THREE.CylinderGeometry(bar * 1.22, bar * 1.22, 0.035, 12);
      for (let d = -def.reach; d < def.reach; d++) {
        const n = new THREE.Mesh(node, look.beam);
        n.rotation.z = Math.PI / 2;
        n.position.x = (d + 0.5) * U;
        n.castShadow = true;
        g.add(n);
      }
    }
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 8, 20), look.wire);
    loop.position.y = 0.05 + bar - BAR;
    loop.castShadow = true;
    g.add(loop);

    // Hooks under the beam, and their distances above it.
    this.hooks = new Map();
    const hookGeo = new THREE.TorusGeometry(0.022, 0.0055, 6, 16);
    const tickGeo = new THREE.PlaneGeometry(0.25 * look.labels, 0.25 * look.labels);
    const tickY = LABEL_Y + (bar - BAR) + 0.12 * (look.labels - 1);
    for (let d = -def.reach; d <= def.reach; d++) {
      if (!d) continue;
      const hook = new THREE.Mesh(hookGeo, look.wire);
      hook.position.set(d * U, -HOOK_DROP + 0.02 - (bar - BAR), 0);
      g.add(hook);
      this.hooks.set(d, hook);
      const t = new THREE.Mesh(tickGeo, new THREE.MeshBasicMaterial({ map: tick(String(Math.abs(d)), look.tick), transparent: true, depthWrite: false }));
      t.position.set(d * U, tickY, 0.004);
      g.add(t);
    }

    // Held: a brass collar locks the pivot.
    this.collar = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.12, 16), brass);
    this.collar.rotation.z = Math.PI / 2;
    this.collar.castShadow = true;
    g.add(this.collar);

    // Each arm's weight × distance, when the hints go that far.
    this.arms = [-1, 1].map((side) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false }));
      m.position.set(side * (this.half - 0.1), tickY + 0.21 + 0.15 * look.labels, 0.006);
      m.visible = false;
      m.userData.text = '';
      g.add(m);
      return m;
    });

    // A red ring at the heavy end after a failed release.
    this.flag = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.012, 8, 32), warning);
    this.flag.visible = false;
    g.add(this.flag);
    this.flagT = 0;

    this.theta = 0;
    this.omega = 0;
    this.pivot = new THREE.Vector3();
    this.swing = { phi: 0, dphi: 0, init: false, hx: 0, vx: 0, ax: 0 };
    this.wireLen = 0; // for sub-beams: from the parent's hook to this pivot
  }

  hookPoint(d, out) {
    const x = d * U, y = -HOOK_DROP;
    const c = Math.cos(this.theta), s = Math.sin(this.theta);
    return out.set(this.pivot.x + x * c - y * s, this.pivot.y + x * s + y * c, 0);
  }
}

// A wire is a thin cylinder (so it casts a shadow) stretched between two points.
const wireGeo = new THREE.CylinderGeometry(0.0042, 0.0042, 1, 5, 1, true).translate(0, 0.5, 0);
const UP = new THREE.Vector3(0, 1, 0);
class Wire {
  constructor(parent, material) {
    this.mesh = new THREE.Mesh(wireGeo, material);
    this.mesh.castShadow = true;
    parent.add(this.mesh);
    this.dir = new THREE.Vector3();
  }
  set(a, b) {
    this.dir.subVectors(b, a);
    const len = this.dir.length();
    this.mesh.position.copy(a);
    this.mesh.scale.set(1, Math.max(1e-4, len), 1);
    if (len > 1e-6) this.mesh.quaternion.setFromUnitVectors(UP, this.dir.multiplyScalar(1 / len));
  }
}

// ---------------------------------------------------------------------------

function pendulum(node, H, L, dt, breeze) {
  if (!node.init) { node.init = true; node.hx = H.x; node.vx = 0; node.ax = 0; }
  if (dt < 1e-4) return;
  const vx = (H.x - node.hx) / dt;
  const ax = clamp((vx - node.vx) / dt, -30, 30);
  node.hx = H.x;
  node.vx = vx;
  node.ax += (ax - node.ax) * 0.5;
  const n = 3, h = dt / n;
  for (let i = 0; i < n; i++) {
    const acc = -(G / L) * Math.sin(node.phi) - (node.ax / L) * Math.cos(node.phi) - SWING_C * node.dphi + breeze;
    node.dphi += acc * h;
    node.phi += node.dphi * h;
  }
  node.phi = clamp(node.phi, -0.9, 0.9);
}

export class Mobile {
  /**
   * @param {object} puzzle from puzzle.generate
   * @param {{held?: boolean, hintLevel?: number, place?: Array, exhibit: object, env: () => THREE.Texture}} o
   *   exhibit from exhibits.js; env makes the reflection map metal finishes need
   */
  constructor(puzzle, { held = false, hintLevel = 0, place = null, exhibit, env, labels = 1 }) {
    this.puzzle = puzzle;
    this.exhibit = exhibit;
    this.rig = new THREE.Group();
    this.held = held;
    this.hintLevel = hintLevel;

    const ex = exhibit;
    const look = (this.look = {
      beam: new THREE.MeshStandardMaterial({ color: ex.beam.color, roughness: ex.beam.roughness, metalness: ex.beam.metalness, ...(ex.beam.env ? { envMap: env(), envMapIntensity: 0.9 } : {}) }),
      wire: new THREE.MeshStandardMaterial({ color: ex.beam.wire, roughness: 0.5, metalness: ex.beam.metalness * 0.5 }),
      accent: new THREE.MeshBasicMaterial({ color: ex.accent, toneMapped: false }),
      bar: ex.beam.bar,
      ends: ex.ends,
      nodes: Boolean(ex.beam.nodes),
      tick: ex.tick,
      labels, // distance marks and hint pills grow on a small screen
      finish: ex.finish,
      env,
    });

    this.beams = puzzle.beams.map((d) => new BeamView(d, look));
    for (const b of this.beams) this.rig.add(b.group);
    this.order = [...this.beams].sort((a, b) => a.def.depth - b.def.depth);

    const rng = makeRng(puzzle.seed ^ 0x5bd1e995);
    const palette = legiblePalette(ex);
    let last = -1;
    this.weights = puzzle.weights.map((def) => {
      // Neighbouring weights never share a colour. A scripted weight (the
      // tutorial's) can fix its own paint and outline.
      const n = palette.length;
      let p = rng.int(0, n - 1);
      if (p === last) p = (p + 1 + rng.int(0, n - 2)) % n;
      const kind = rng.pick(ex.shapes), variant = rng.next();
      if (def.look) p = def.look.paint % n;
      last = p;
      const v = new WeightView(def, palette[p], def.look?.kind ?? kind, def.look?.variant ?? variant, look);
      this.rig.add(v.group);
      return v;
    });
    this.wires = {
      root: new Wire(this.rig, look.wire),
      kids: this.beams.map((b) => (b.def.parent == null ? null : new Wire(this.rig, look.wire))),
      weights: this.weights.map(() => new Wire(this.rig, look.wire)),
    };
    this.sums = this.beams.map((b) => {
      if (b.def.parent == null) return null;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false }));
      m.visible = false;
      m.userData.text = '';
      this.rig.add(m);
      return m;
    });

    this.target = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 28), look.accent);
    this.target.visible = false;
    this.rig.add(this.target);
    this.preview = new Wire(this.rig, look.accent);
    this.preview.mesh.visible = false;
    this.preview.mesh.castShadow = false;

    this.layout();
    this.place = place ?? puzzle.weights.map((w) => (w.loose ? null : { beam: w.beam, d: w.d }));
    this.dragging = -1;
    this.yaw = 0;
    this.drift = 0; // how far the mobile turns in the air, side to side, on the title screen
    this.spinT = -1;
    this.drop = null;
    this.t = 0;
    this.measures = measure(puzzle, this.place);
    for (const v of this.weights) v.state = this.place[v.id] ? 'hook' : 'tray';
    this.settle();
    this.setHints(hintLevel);
  }

  // Lays the mobile out: how long each sub-beam's wire is so nothing
  // collides, and the box it all fits in. Weights could go on any hook, so
  // every hook gets room for the biggest one; and any beam can tilt, which
  // drops one end, and everything hanging from it, a little lower.
  layout() {
    const lean = Math.sin(MAX_TILT);
    // A beam reaches as far as its end, or a wide weight on its last hook.
    const ext = (b) => {
      const reach = Math.max(b.half, b.def.reach * U + (MAX_W / 2) * R_MAX) + 0.08;
      let minX = -reach, maxX = reach, depth = HANG_DEPTH + 0.75 * lean * b.def.reach * U;
      const laid = [];
      for (const k of b.def.kids) {
        const kid = this.beams[k];
        const e = ext(kid);
        const x = kid.def.hook * U;
        // Room below the parent's weights, and for parent and child tilting
        // toward each other at the child's far end.
        let L = HANG_DEPTH + KID_GAP + 0.3 + lean * (1.1 * kid.half + 0.5 * Math.abs(x));
        for (const o of laid) {
          // Sub-mobiles that would hang side by side, or nearly, hang one below the other.
          // (o.depth already allows for its own hook dropping; this one's may rise.)
          if (x + e.minX < o.maxX + 0.6 && x + e.maxX > o.minX - 0.6) L = Math.max(L, o.L + o.depth + KID_GAP + 0.3 + lean * (kid.half + Math.abs(x)));
        }
        kid.wireLen = L;
        laid.push({ minX: x + e.minX, maxX: x + e.maxX, L, depth: e.depth + lean * Math.abs(x) });
        minX = Math.min(minX, x + e.minX);
        maxX = Math.max(maxX, x + e.maxX);
        depth = Math.max(depth, L + e.depth + lean * Math.abs(x));
      }
      return { minX, maxX, depth };
    };
    const e = (this.extent = ext(this.beams[0]));
    // Turning on its wire, the mobile sweeps a cylinder this wide: the wall
    // has to stand behind it. Long wires swing further.
    const longest = Math.max(0, ...this.beams.map((b) => b.wireLen));
    this.reachLeft = -e.minX + SWING_ROOM + 0.12 * longest;
    this.reachRight = e.maxX + SWING_ROOM + 0.12 * longest;
    this.spinRadius = Math.max(this.reachLeft, this.reachRight);
    const tilt = lean * this.beams[0].half;
    const loose = this.weights.filter((v) => !v.pinned);
    const trayWidth = loose.reduce((s, v) => s + v.shape.width + 0.2, -0.2);
    // The plinth's top sits below the lowest anything can swing, with room
    // for the tallest loose weight standing on it.
    const tallest = Math.max(0, ...loose.map((v) => v.shape.h));
    this.shelfY = -e.depth - 0.22 - tallest;
    this.trayHalf = Math.max(1.2, trayWidth / 2 + 0.35);
    const minX = Math.min(e.minX, -this.trayHalf), maxX = Math.max(e.maxX, this.trayHalf);
    // The label goes on the plinth's face, to the right, just under its top.
    this.placardAt = { x: this.trayHalf - 0.76, y: this.shelfY - 0.42 };
    this.box = { minX, maxX, minY: this.shelfY - 0.72, maxY: 0.62 + tilt };
    this.mobileBox = { minX: e.minX, maxX: e.maxX, minY: -e.depth + 0.75 * lean * this.beams[0].def.reach * U, maxY: 0.62 };
  }

  setPlace(place) {
    this.place = place;
    this.measures = measure(this.puzzle, place);
    for (const v of this.weights) {
      const next = place[v.id] ? 'hook' : v.id === this.dragging ? 'drag' : 'tray';
      if (next === 'hook' && v.state !== 'hook') {
        v.flying = true;
        v.swing.init = false;
        v.swing.phi = (Math.random() - 0.5) * 0.25;
        v.swing.dphi = 0;
      }
      v.state = next;
    }
    this.updateHints();
  }

  setHeld(on) { this.held = on; }

  setHints(level) {
    this.hintLevel = level;
    this.updateHints();
  }

  updateHints() {
    const show = (mesh, text, opts, height) => {
      if (!text) { mesh.visible = false; return; }
      mesh.visible = true;
      const key = `${text}|${opts.fg ?? ''}`;
      if (mesh.userData.text === key) return;
      mesh.userData.text = key;
      const p = pill(text, opts);
      mesh.material.map = p.map;
      mesh.material.needsUpdate = true;
      mesh.scale.set(height * p.aspect, height, 1);
    };
    this.beams.forEach((b, i) => {
      const m = this.measures[i];
      if (this.sums[i]) show(this.sums[i], this.hintLevel >= 1 ? `Σ ${m.mass}` : '', {}, 0.34 * this.look.labels);
      const even = m.left === m.right;
      [m.left, m.right].forEach((v, s) => {
        const heavy = !even && (s === 0 ? m.left > m.right : m.right > m.left);
        show(b.arms[s], this.hintLevel >= 2 ? String(v) : '', { fg: even ? '#2f6b45' : heavy ? '#b3271f' : '#4a463f' }, 0.32 * this.look.labels);
      });
    });
  }

  /** Red rings at the heavy end of each listed beam, for a moment. */
  flagHeavy(ids) {
    for (const id of ids) {
      const b = this.beams[id];
      const net = this.measures[id].net;
      b.flag.position.set(Math.sign(net) * b.half, 0.04, 0.01);
      b.flagT = 2.6;
    }
  }

  /** The beam ids that aren't level, heavy side first. */
  crooked() { return this.measures.map((m, i) => (m.net !== 0 ? i : -1)).filter((i) => i >= 0); }

  /**
   * How far the mobile may turn on its wire with the wall `room` behind it.
   * Turning one way swings the right side back, the other way the left, so
   * a turn goes the way the shorter side swings back. A whole turn only when
   * nothing reaches the wall at all.
   */
  turnLimit(room) {
    if (this.spinRadius < room) return { full: true, dir: 1, max: Math.PI * 2 };
    const right = this.reachRight <= this.reachLeft;
    const reach = right ? this.reachRight : this.reachLeft;
    return { full: false, dir: right ? 1 : -1, max: Math.asin(Math.min(1, room / reach)) };
  }

  /** The balanced mobile turns on its wire: as far as `room` allows, and back. */
  spin(room) {
    this.spinPlan = this.turnLimit(room);
    this.spinT = 0;
  }

  // A new mobile drops in from above; a finished one rises away.
  enter() {
    this.drop = { from: 6 + this.extent.depth, to: 0, t: 0, dur: 1.3, ease: (x) => 1 - Math.pow(1 - x, 3) * Math.cos(x * 2.2) };
    this.rig.position.y = this.drop.from;
    // The loose weights slide along the plinth from the right as it comes down.
    this.weights.filter((v) => v.state === 'tray').forEach((v, i) => { v.pos.x += 3.5 + i * 0.5; v.pos.y -= this.drop.from; });
  }
  leave() {
    // A mobile on its way out stops turning and eases square to the room.
    this.spinT = -1;
    this.drift = 0;
    this.drop = { from: this.rig.position.y, to: 9 + this.extent.depth, t: 0, dur: 1.1, ease: (x) => x * x * x };
  }
  get moving() { return Boolean(this.drop); }

  /** Weight under a ray, or -1. */
  pick(ray) {
    const hits = ray.intersectObjects(this.weights.filter((v) => v.group.visible).map((v) => v.hit), false);
    return hits.length ? hits[0].object.userData.weight : -1;
  }

  /** Free hooks, with the hook and the hang point in world space. */
  openHooks(skip = -1) {
    const out = [];
    const v = new THREE.Vector3();
    for (const h of freeHooks(this.puzzle, this.place, skip)) {
      const b = this.beams[h.beam];
      b.hookPoint(h.d, v);
      const hook = this.rig.localToWorld(v.clone());
      const hang = this.rig.localToWorld(v.clone().add(new THREE.Vector3(0, -(wireFor(h.beam, h.d) + 0.25), 0)));
      out.push({ ...h, hook, hang });
    }
    return out;
  }

  /** Moves the weight being dragged so its grab point sits at a world point. */
  dragTo(id, world) {
    const v = this.weights[id];
    const local = this.rig.worldToLocal(world.clone());
    v.dragVel = (local.x - v.pos.x);
    v.pos.copy(local);
    v.pos.z = 0.12;
  }

  startDrag(id) {
    this.dragging = id;
    const v = this.weights[id];
    v.state = 'drag';
    v.flying = false;
  }

  endDrag() { this.dragging = -1; }

  showTarget(h) {
    if (!h) { this.target.visible = false; this.preview.mesh.visible = false; return; }
    this.target.visible = true;
    this.target.position.copy(this.rig.worldToLocal(h.hook.clone()));
    this.targetHook = h;
  }

  /** Lights up the free hooks while a weight is in hand. */
  showHooks(on, skip = -1) {
    for (const b of this.beams) for (const hook of b.hooks.values()) { hook.material = this.look.wire; hook.scale.setScalar(1); }
    if (!on) return;
    for (const h of freeHooks(this.puzzle, this.place, skip)) {
      const hook = this.beams[h.beam].hooks.get(h.d);
      hook.material = this.look.accent;
      hook.scale.setScalar(2.4);
    }
  }

  wiggle(id) { this.weights[id].wiggle = 0.5; }

  select(id) { for (const v of this.weights) v.selected = v.id === id; }

  // The loose weights waiting on the plinth, smallest first.
  traySlots() {
    const waiting = this.weights.filter((v) => v.state === 'tray').sort((a, b) => a.w - b.w || a.id - b.id);
    const width = waiting.reduce((s, v) => s + v.shape.width + 0.2, -0.2);
    let x = -width / 2;
    const slots = new Map();
    for (const v of waiting) {
      slots.set(v.id, new THREE.Vector3(x + v.shape.width / 2, this.shelfY + v.shape.h + 0.012, 0));
      x += v.shape.width + 0.2;
    }
    return slots;
  }

  // Puts everything where it belongs at once, for a mobile seen for the first time.
  settle() {
    this.update(0, true);
    for (const v of this.weights) v.flying = false;
    this.update(0, true);
  }

  update(dt, snap = false) {
    this.t += dt;
    const t = this.t;
    if (this.drop) {
      const d = this.drop;
      d.t = Math.min(1, d.t + dt / d.dur);
      this.rig.position.y = d.from + (d.to - d.from) * d.ease(d.t);
      if (d.t >= 1) { this.rig.position.y = d.to; this.drop = null; }
    }
    if (this.spinT >= 0) {
      const plan = this.spinPlan;
      this.spinT += dt;
      const k = Math.min(1, this.spinT / (plan.full ? 7.5 : 6));
      this.yaw = plan.full ? Math.PI * 2 * easeInOut(k) : plan.dir * plan.max * Math.sin(Math.PI * easeInOut(k));
      if (k >= 1) { this.spinT = -1; if (plan.full) this.yaw -= Math.PI * 2; }
    } else {
      // Drifting side to side on the title, barely turning otherwise; eased,
      // so a mobile that stops drifting doesn't snap round.
      const goal = this.drift ? this.drift * Math.sin(t * 0.17) : 0.03 * Math.sin(t * 0.23);
      this.yaw += (goal - this.yaw) * (snap ? 1 : 1 - Math.exp(-dt * 2.5));
    }
    this.rig.rotation.y = this.yaw;

    // Beams turn toward the angle their imbalance asks for.
    const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
    const h = dt / steps;
    for (const b of this.beams) {
      const goal = this.held ? 0 : -MAX_TILT * Math.tanh(this.measures[b.id].net / 4);
      if (snap) { b.theta = goal; b.omega = 0; continue; }
      for (let i = 0; i < steps; i++) {
        b.omega += (TILT_K * (goal - b.theta) - TILT_C * b.omega) * h;
        b.theta += b.omega * h;
      }
    }

    // Then everything hangs from the top down.
    const H = new THREE.Vector3();
    const tmp = new THREE.Vector3();
    const root = this.beams[0];
    root.pivot.set(0.012 * Math.sin(t * 0.41), 0, 0);
    for (const b of this.order) {
      b.group.position.copy(b.pivot);
      b.group.rotation.z = b.theta;
      for (const k of b.def.kids) {
        const kid = this.beams[k];
        b.hookPoint(kid.def.hook, H);
        pendulum(kid.swing, H, kid.wireLen, dt, 0.12 * Math.sin(t * 0.7 + k * 1.9));
        kid.pivot.set(H.x + kid.wireLen * Math.sin(kid.swing.phi), H.y - kid.wireLen * Math.cos(kid.swing.phi), 0);
        this.wires.kids[k].set(H, tmp.copy(kid.pivot).setY(kid.pivot.y + 0.062));
      }
      if (b.flagT > 0) {
        b.flagT -= dt;
        b.flag.visible = b.flagT > 0;
        b.flag.scale.setScalar(1 + 0.18 * Math.sin(b.flagT * 9));
        warning.opacity = Math.min(1, b.flagT * 1.5);
      }
      b.collar.visible = this.held;
    }
    this.wires.root.set(tmp.copy(root.pivot).setY(0.065), H.set(root.pivot.x * 0.2, 40, 0));

    const slots = this.traySlots();
    const k = snap ? 1 : 1 - Math.exp(-dt * 13);
    for (const v of this.weights) {
      const wire = this.wires.weights[v.id];
      v.group.visible = true;
      if (v.wiggle > 0) v.wiggle = Math.max(0, v.wiggle - dt);
      const wig = v.wiggle > 0 ? Math.sin(v.wiggle * 40) * 0.12 * v.wiggle * 2 : 0;
      if (v.state === 'hook') {
        const at = this.place[v.id];
        const b = this.beams[at.beam];
        b.hookPoint(at.d, H);
        const L = wireFor(at.beam, at.d);
        pendulum(v.swing, H, L, dt, 0.18 * Math.sin(t * 0.9 + v.id * 2.3) * Math.sin(t * 0.37 + v.id));
        tmp.set(H.x + L * Math.sin(v.swing.phi), H.y - L * Math.cos(v.swing.phi), 0);
        if (v.flying) {
          v.pos.lerp(tmp, k);
          v.rot += (v.swing.phi - v.rot) * k;
          if (v.pos.distanceTo(tmp) < 0.004) v.flying = false;
        } else {
          v.pos.copy(tmp);
          v.rot = v.swing.phi;
        }
        wire.mesh.visible = true;
        wire.set(H, tmp.copy(v.pos).setY(v.pos.y + 0.01));
        v.lift = 0;
      } else {
        wire.mesh.visible = false;
        if (v.state === 'tray') {
          const slot = slots.get(v.id);
          // The plinth doesn't travel with the mobile.
          slot.y -= this.rig.position.y;
          v.lift += ((v.selected ? 0.2 + 0.03 * Math.sin(t * 5) : 0) - v.lift) * k;
          slot.y += v.lift;
          v.pos.lerp(slot, k);
          v.rot += ((v.selected ? 0.05 * Math.sin(t * 3) : 0) - v.rot) * k;
        } else {
          v.rot += (clamp(-(v.dragVel || 0) * 3, -0.5, 0.5) - v.rot) * (1 - Math.exp(-dt * 8));
          v.dragVel = (v.dragVel || 0) * Math.exp(-dt * 10);
        }
      }
      v.group.position.copy(v.pos);
      v.group.rotation.z = v.rot + wig;
    }

    this.sums.forEach((m, i) => {
      if (!m || !m.visible) return;
      const b = this.beams[i];
      this.beams[b.def.parent].hookPoint(b.def.hook, H);
      m.position.set((H.x + b.pivot.x) / 2 + 0.08 + m.scale.x / 2, (H.y + b.pivot.y) / 2, 0.02);
    });

    if (this.target.visible) {
      this.target.scale.setScalar(1 + 0.15 * Math.sin(t * 8));
      const h = this.targetHook;
      if (h && this.dragging >= 0) {
        const b = this.beams[h.beam];
        b.hookPoint(h.d, H);
        this.target.position.copy(H);
        this.preview.mesh.visible = true;
        this.preview.set(H, tmp.copy(this.weights[this.dragging].pos).setY(this.weights[this.dragging].pos.y + 0.01));
      } else {
        this.preview.mesh.visible = false;
      }
    } else {
      this.preview.mesh.visible = false;
    }
  }

  dispose() {
    this.rig.removeFromParent();
    const shared = new Set([wireGeo, numeralGeo]);
    const kept = new Set([brass, warning, hidden]);
    this.rig.traverse((o) => {
      if (o.geometry && !shared.has(o.geometry)) o.geometry.dispose();
      if (o.material && !kept.has(o.material)) o.material.dispose();
    });
    for (const m of [this.look.beam, this.look.wire, this.look.accent]) m.dispose();
  }
}

export { HANG_DEPTH };
