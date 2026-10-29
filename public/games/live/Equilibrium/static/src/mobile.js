// The mobile itself: beams, hooks, wires and painted weights laid out from a
// puzzle, swaying under a little physics, plus the row of loose weights on
// the shelf. Everything lives in rig-local space (z = 0 is the mobile's
// plane); the rig only ever moves up and down and turns about its wire.

import * as THREE from 'three';
import { measure, freeHooks, makeRng, clamp } from './puzzle.js';
import { numeral, tick, pill } from './labels.js';

export const U = 0.8; // world units between neighbouring hooks
const BAR = 0.026;
const MAX_TILT = 0.28;
const TILT_K = 22, TILT_C = 3.4; // an underdamped spring: a beam overshoots and settles
const G = 9.8;
const SWING_C = 1.25;
const HOOK_DROP = 0.045;
const LABEL_Y = 0.15;

export const radiusFor = (w) => 0.23 + 0.04 * Math.sqrt(w);
const R_MAX = radiusFor(15);
const HANG_DEPTH = 0.5 + 2.35 * R_MAX; // the lowest a weight on a hook can reach
const KID_GAP = 0.34;

// Calder's colours. Ink is the colour of the number painted on each.
const PAINT = [
  { body: '#c8322a', ink: '#fbf6ec' },
  { body: '#1f4fa3', ink: '#fbf6ec' },
  { body: '#f2b632', ink: '#1d1b18' },
  { body: '#1c1b19', ink: '#fbf6ec' },
];
const SHAPES = ['disc', 'drop', 'half', 'tri'];

const frac = (x) => x - Math.floor(x);
// Each hook's wire length, fixed per beam and distance: odd and even hooks
// hang at two staggered heights, the way a Calder's weights do, with a
// little variation within each.
const wireFor = (beam, d) => (Math.abs(d) % 2 ? 0.17 : 0.4) + 0.1 * frac(Math.sin(beam * 12.9898 + d * 78.233 + 0.5) * 43758.5453);
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

const steel = new THREE.MeshStandardMaterial({ color: '#191816', roughness: 0.42, metalness: 0.35 });
const brass = new THREE.MeshStandardMaterial({ color: '#c79a4a', roughness: 0.32, metalness: 0.85 });
const accent = new THREE.MeshBasicMaterial({ color: '#e8743b', toneMapped: false });
const warning = new THREE.MeshBasicMaterial({ color: '#d2352b', toneMapped: false, transparent: true });
const hidden = new THREE.MeshBasicMaterial({ visible: false });

// ---------------------------------------------------------------------------
// Weights

const shapeCache = new Map();

/** A weight's outline hangs from (0, 0) and extends down; numbers sit at ny. */
function shapeFor(kind, w) {
  const key = `${kind}:${w}`;
  if (shapeCache.has(key)) return shapeCache.get(key);
  const r = radiusFor(w);
  const s = new THREE.Shape();
  let h, ny, nh, width;
  if (kind === 'disc') {
    s.absarc(0, -r, r, 0, Math.PI * 2, false);
    h = 2 * r; ny = -r; nh = 1.2 * r; width = 2 * r;
  } else if (kind === 'drop') {
    s.moveTo(0, 0);
    s.bezierCurveTo(0.22 * r, -0.22 * r, r, -0.68 * r, r, -1.32 * r);
    s.absarc(0, -1.32 * r, r, 0, Math.PI, true);
    s.bezierCurveTo(-r, -0.68 * r, -0.22 * r, -0.22 * r, 0, 0);
    h = 2.32 * r; ny = -1.36 * r; nh = 1.12 * r; width = 2 * r;
  } else if (kind === 'half') {
    const R = r;
    s.moveTo(-R, 0);
    s.lineTo(R, 0);
    s.absarc(0, 0, R, 0, Math.PI, true);
    h = R; ny = -0.44 * r; nh = 0.8 * r; width = 2 * R;
  } else {
    const a = new THREE.Vector2(-1.04 * r, 0), b = new THREE.Vector2(1.04 * r, 0), c = new THREE.Vector2(0, -1.9 * r);
    const k = 0.2 * r;
    const toward = (p, q) => p.clone().add(q.clone().sub(p).setLength(k));
    const start = toward(a, b);
    s.moveTo(start.x, start.y);
    for (const [p, q, n] of [[b, a, c], [c, b, a], [a, c, b]]) {
      const inn = toward(p, q), out = toward(p, n);
      s.lineTo(inn.x, inn.y);
      s.quadraticCurveTo(p.x, p.y, out.x, out.y);
    }
    h = 1.9 * r; ny = -0.6 * r; nh = 0.86 * r; width = 2.08 * r;
  }
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.034, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.009, bevelSegments: 3, curveSegments: 48 });
  geo.translate(0, 0, -0.017);
  const out = { geo, h, ny, nh, width, r };
  shapeCache.set(key, out);
  return out;
}

const numeralGeo = new THREE.PlaneGeometry(2, 1);

class WeightView {
  constructor(def, paint, kind) {
    this.def = def;
    this.id = def.id;
    this.w = def.w;
    this.pinned = !def.loose;
    const sh = (this.shape = shapeFor(kind, def.w));
    this.group = new THREE.Group();
    this.inner = new THREE.Group();
    this.group.add(this.inner);

    this.paint = new THREE.MeshStandardMaterial({ color: paint.body, roughness: 0.5, metalness: 0.06 });
    const body = new THREE.Mesh(sh.geo, this.paint);
    body.castShadow = body.receiveShadow = true;
    this.inner.add(body);

    const ink = new THREE.MeshStandardMaterial({ map: numeral(String(def.w), paint.ink), transparent: true, roughness: 0.55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    for (const back of [false, true]) {
      const n = new THREE.Mesh(numeralGeo, ink);
      n.scale.set(sh.nh * 2, sh.nh, 1);
      n.position.set(0, sh.ny, back ? -0.0285 : 0.0285);
      if (back) n.rotation.y = Math.PI;
      this.inner.add(n);
    }

    // Pinned weights are riveted in brass; loose ones hang from a steel clip.
    const top = this.pinned
      ? new THREE.Mesh(new THREE.SphereGeometry(0.034, 16, 12), brass)
      : new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.0065, 8, 20), steel);
    top.position.y = this.pinned ? -0.008 : 0.018;
    top.castShadow = true;
    this.inner.add(top);

    const hit = new THREE.Mesh(new THREE.CircleGeometry(Math.max(sh.width * 0.62, 0.28), 20), hidden);
    hit.position.y = -sh.h / 2;
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
  constructor(def) {
    this.def = def;
    this.id = def.id;
    this.half = (def.reach + 0.32) * U;
    const g = (this.group = new THREE.Group());

    const rod = new THREE.Mesh(new THREE.CylinderGeometry(BAR, BAR, this.half * 2, 10), steel);
    rod.rotation.z = Math.PI / 2;
    rod.castShadow = true;
    g.add(rod);

    // Turned-up ends, and the loop the beam hangs by.
    for (const side of [-1, 1]) {
      const curl = new THREE.Mesh(new THREE.TorusGeometry(0.062, BAR * 0.92, 8, 24, Math.PI * 1.15), steel);
      curl.position.set(side * this.half, 0.062, 0);
      curl.rotation.z = -Math.PI / 2;
      curl.scale.x = side;
      curl.castShadow = true;
      g.add(curl);
    }
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 8, 20), steel);
    loop.position.y = 0.05;
    loop.castShadow = true;
    g.add(loop);

    // Hooks under the beam, and their distances above it.
    this.hooks = new Map();
    const hookGeo = new THREE.TorusGeometry(0.022, 0.0055, 6, 16);
    const tickGeo = new THREE.PlaneGeometry(0.25, 0.25);
    for (let d = -def.reach; d <= def.reach; d++) {
      if (!d) continue;
      const hook = new THREE.Mesh(hookGeo, steel);
      hook.position.set(d * U, -HOOK_DROP + 0.02, 0);
      g.add(hook);
      this.hooks.set(d, hook);
      const t = new THREE.Mesh(tickGeo, new THREE.MeshBasicMaterial({ map: tick(String(Math.abs(d))), transparent: true, depthWrite: false }));
      t.position.set(d * U, LABEL_Y, 0.004);
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
      m.position.set(side * (this.half - 0.1), LABEL_Y + 0.36, 0.006);
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
  constructor(parent, material = steel) {
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
   * @param {{held?: boolean, hintLevel?: number, place?: Array}} o
   */
  constructor(puzzle, { held = false, hintLevel = 0, place = null } = {}) {
    this.puzzle = puzzle;
    this.rig = new THREE.Group();
    this.held = held;
    this.hintLevel = hintLevel;
    this.beams = puzzle.beams.map((d) => new BeamView(d));
    for (const b of this.beams) this.rig.add(b.group);
    this.order = [...this.beams].sort((a, b) => a.def.depth - b.def.depth);

    const rng = makeRng(puzzle.seed ^ 0x5bd1e995);
    const kinds = rng.shuffle([...SHAPES]);
    let last = -1;
    this.weights = puzzle.weights.map((def, i) => {
      // Neighbouring weights never share a colour.
      let p = rng.int(0, PAINT.length - 1);
      if (p === last) p = (p + 1 + rng.int(0, PAINT.length - 2)) % PAINT.length;
      last = p;
      const v = new WeightView(def, PAINT[p], kinds[(i + rng.int(0, 1)) % kinds.length]);
      this.rig.add(v.group);
      return v;
    });
    this.wires = {
      root: new Wire(this.rig),
      kids: this.beams.map((b) => (b.def.parent == null ? null : new Wire(this.rig))),
      weights: this.weights.map(() => new Wire(this.rig)),
    };
    this.sums = this.beams.map((b) => {
      if (b.def.parent == null) return null;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false }));
      m.visible = false;
      m.userData.text = '';
      this.rig.add(m);
      return m;
    });

    this.target = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 28), accent);
    this.target.visible = false;
    this.rig.add(this.target);
    this.preview = new Wire(this.rig, accent);
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

  // Lays the mobile out level: how long each sub-beam's wire is so nothing
  // collides, and the box it all fits in. Weights could go on any hook, so
  // every hook gets room for the biggest one.
  layout() {
    const ext = (b) => {
      let minX = -b.half - 0.08, maxX = b.half + 0.08, depth = HANG_DEPTH;
      const laid = [];
      for (const k of b.def.kids) {
        const kid = this.beams[k];
        const e = ext(kid);
        const x = kid.def.hook * U;
        let L = HANG_DEPTH + KID_GAP + 0.3;
        for (const o of laid) {
          if (x + e.minX < o.maxX + 0.15 && x + e.maxX > o.minX - 0.15) L = Math.max(L, o.L + o.depth + KID_GAP + 0.3);
        }
        kid.wireLen = L;
        laid.push({ minX: x + e.minX, maxX: x + e.maxX, L, depth: e.depth });
        minX = Math.min(minX, x + e.minX);
        maxX = Math.max(maxX, x + e.maxX);
        depth = Math.max(depth, L + e.depth);
      }
      return { minX, maxX, depth };
    };
    const e = (this.extent = ext(this.beams[0]));
    // A tilted top beam lifts one end and lowers everything on the other.
    const tilt = Math.sin(MAX_TILT) * this.beams[0].half;
    const loose = this.weights.filter((v) => !v.pinned);
    const trayWidth = loose.reduce((s, v) => s + v.shape.width + 0.2, -0.2);
    // The shelf sits below the lowest anything can swing, with room for the
    // tallest loose weight standing on it.
    const tallest = Math.max(0, ...loose.map((v) => v.shape.h));
    this.shelfY = -e.depth - tilt * 0.8 - 0.22 - tallest;
    this.trayHalf = Math.max(1.2, trayWidth / 2 + 0.35);
    const minX = Math.min(e.minX, -this.trayHalf), maxX = Math.max(e.maxX, this.trayHalf);
    this.placardAt = { x: Math.max(maxX - 0.55, this.trayHalf - 0.55), y: this.shelfY - 0.42 };
    this.box = { minX, maxX, minY: this.shelfY - 0.72, maxY: 0.62 + tilt };
    this.mobileBox = { minX: e.minX, maxX: e.maxX, minY: -e.depth, maxY: 0.62 };
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
      if (this.sums[i]) show(this.sums[i], this.hintLevel >= 1 ? `Σ ${m.mass}` : '', {}, 0.34);
      const even = m.left === m.right;
      [m.left, m.right].forEach((v, s) => {
        const heavy = !even && (s === 0 ? m.left > m.right : m.right > m.left);
        show(b.arms[s], this.hintLevel >= 2 ? String(v) : '', { fg: even ? '#2f6b45' : heavy ? '#b3271f' : '#4a463f' }, 0.32);
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

  spin() { this.spinT = 0; }

  // A new mobile drops in from above; a finished one rises away.
  enter() {
    this.drop = { from: 6 + this.extent.depth, to: 0, t: 0, dur: 1.3, ease: (x) => 1 - Math.pow(1 - x, 3) * Math.cos(x * 2.2) };
    this.rig.position.y = this.drop.from;
    // The loose weights slide along the shelf from the right as it comes down.
    this.weights.filter((v) => v.state === 'tray').forEach((v, i) => { v.pos.x += 3.5 + i * 0.5; v.pos.y -= this.drop.from; });
  }
  leave() { this.drop = { from: this.rig.position.y, to: 9 + this.extent.depth, t: 0, dur: 1.1, ease: (x) => x * x * x }; }
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
    for (const b of this.beams) for (const hook of b.hooks.values()) { hook.material = steel; hook.scale.setScalar(1); }
    if (!on) return;
    for (const h of freeHooks(this.puzzle, this.place, skip)) {
      const hook = this.beams[h.beam].hooks.get(h.d);
      hook.material = accent;
      hook.scale.setScalar(2.4);
    }
  }

  wiggle(id) { this.weights[id].wiggle = 0.5; }

  select(id) { for (const v of this.weights) v.selected = v.id === id; }

  // Trays: the loose weights waiting on the shelf, smallest first.
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
      this.spinT += dt;
      const k = Math.min(1, this.spinT / 7.5);
      this.yaw = Math.PI * 2 * easeInOut(k);
      if (k >= 1) this.spinT = -1;
    } else if (this.drift) {
      this.yaw = this.drift * Math.sin(t * 0.17);
    } else {
      this.yaw = 0.03 * Math.sin(t * 0.23);
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
          // The shelf doesn't travel with the mobile.
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
    const shared = new Set([wireGeo, numeralGeo, ...[...shapeCache.values()].map((s) => s.geo)]);
    const kept = new Set([steel, brass, accent, warning, hidden]);
    this.rig.traverse((o) => {
      if (o.geometry && !shared.has(o.geometry)) o.geometry.dispose();
      if (o.material && !kept.has(o.material)) o.material.dispose();
    });
  }
}

export { HANG_DEPTH };
