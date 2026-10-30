// One orbiting viewpoint shared by both panels, so the twins always line up.
// Drag to circle, wheel or pinch to lean in toward whatever is under the cursor.

import * as THREE from 'three';
import { SEA } from './terrain.js';

const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));

export class View {
  constructor(world, dom) {
    this.world = world;
    this.dom = dom;
    this.cur = { az: 0, pol: 1.2, dist: 300, target: new THREE.Vector3(0, 40, 0) };
    this.goal = { az: 0, pol: 1.2, dist: 300, target: new THREE.Vector3(0, 40, 0) };
    this.home = null;
    this.spin = 0;
    this.locked = false;
    this.onClick = null;
    this.onInteract = null;
    this.pointers = new Map();
    this.keys = new Set();
    this.bind();
  }

  // Frame a pair: target its centroid, back off far enough to see all of it.
  setHome(round, immediate = false) {
    const { ext, H, camAz } = round;
    this.round = round;
    const target = new THREE.Vector3(ext.cx, SEA + (H - SEA) * 0.46, ext.cz);
    this.home = { az: camAz, pol: round.frame.pol, dist: this.fit(round), target };
    this.reset(immediate);
  }

  fit(round = this.round) {
    if (!round) return 300;
    const w = this.world;
    // Always frame for the split view, so the title shot and the game agree.
    let aw = w.cssW, ah = w.cssH;
    if (w.portrait) ah /= 2; else aw /= 2;
    const aspect = aw / ah;
    const vf = (w.camera.fov * Math.PI) / 360;
    const hf = Math.atan(Math.tan(vf) * aspect);
    const R = round.ext.reach * 0.8;
    const dW = R / Math.tan(hf) + R * 0.35;
    const dH = ((round.H - SEA) * 0.62) / Math.tan(vf) + R * 0.35;
    return Math.min(Math.max(dW, dH) * 1.12, 820);
  }

  refit() {
    if (!this.home) return;
    const d = this.fit();
    const ratio = this.goal.dist / this.home.dist;
    this.home.dist = d;
    this.goal.dist = d * ratio;
  }

  reset(immediate = false) {
    const h = this.home;
    if (!h) return;
    // Keep the current heading near the goal so a reset never spins the long way round.
    const turns = Math.round((this.goal.az - h.az) / (Math.PI * 2));
    this.goal.az = h.az + turns * Math.PI * 2;
    this.goal.pol = h.pol;
    this.goal.dist = h.dist;
    this.goal.target.copy(h.target);
    if (immediate) {
      this.cur.az = this.goal.az; this.cur.pol = h.pol; this.cur.dist = h.dist; this.cur.target.copy(h.target);
    }
  }

  bind() {
    const el = this.dom;
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    el.addEventListener('pointerdown', (e) => {
      el.setPointerCapture(e.pointerId);
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now(), moved: 0 });
      if (this.pointers.size === 2) this.pinch = this.pinchState();
    });
    el.addEventListener('pointermove', (e) => {
      const p = this.pointers.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY;
      p.moved = Math.max(p.moved, Math.hypot(e.clientX - p.sx, e.clientY - p.sy));
      if (this.locked) return;
      if (this.pointers.size === 1 && p.moved > 4) {
        this.goal.az -= dx * 0.0058;
        this.goal.pol = clampPol(this.goal.pol - dy * 0.0045);
        this.onInteract?.();
      } else if (this.pointers.size === 2 && this.pinch) {
        const now = this.pinchState();
        const f = this.pinch.d / Math.max(20, now.d);
        this.zoom(f, now.x, now.y);
        this.goal.az -= (now.x - this.pinch.x) * 0.004;
        this.pinch = now;
        this.onInteract?.();
      }
    });
    const up = (e) => {
      const p = this.pointers.get(e.pointerId);
      if (!p) return;
      this.pointers.delete(e.pointerId);
      if (this.pointers.size < 2) this.pinch = null;
      const quick = performance.now() - p.t < 650;
      if (p.moved < 7 && quick && this.pointers.size === 0 && e.type === 'pointerup') this.onClick?.(e.clientX, e.clientY);
      for (const q of this.pointers.values()) { q.sx = q.x; q.sy = q.y; q.moved = 99; }
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (this.locked) return;
      const k = e.deltaMode === 1 ? 0.04 : e.deltaMode === 2 ? 0.5 : 0.0012;
      this.zoom(Math.exp(e.deltaY * k), e.clientX, e.clientY);
      this.onInteract?.();
    }, { passive: false });
    window.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLInputElement) return;
      this.keys.add(e.key);
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key));
    window.addEventListener('blur', () => this.keys.clear());
  }

  pinchState() {
    const [a, b] = [...this.pointers.values()];
    return { d: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  // Lean toward the terrain under the cursor when zooming in, drift home when zooming out.
  zoom(f, cx, cy) {
    if (!this.home) return;
    const h = this.home;
    const before = this.goal.dist;
    this.goal.dist = Math.min(h.dist * 1.35, Math.max(h.dist * 0.18, before * f));
    const ratio = this.goal.dist / before;
    if (ratio < 1 && cx != null) {
      const pick = this.world.pick(cx, cy);
      if (pick?.hit) this.goal.target.lerp(pick.hit, Math.min(0.6, 1 - ratio));
    } else if (ratio > 1) {
      this.goal.target.lerp(h.target, Math.min(1, (ratio - 1) * 2.2));
    }
    const off = this.goal.target.clone().sub(h.target);
    off.y = 0;
    if (off.length() > 110) this.goal.target.copy(h.target).add(off.setLength(110).setY(this.goal.target.y - h.target.y));
    this.goal.target.y = Math.max(SEA + 4, Math.min(this.round.H * 0.95, this.goal.target.y));
  }

  update(dt) {
    if (!this.locked) {
      const k = this.keys;
      if (k.has('ArrowLeft') || k.has('a')) this.goal.az += dt * 1.1;
      if (k.has('ArrowRight') || k.has('d')) this.goal.az -= dt * 1.1;
      if (k.has('ArrowUp') || k.has('w')) this.goal.pol = clampPol(this.goal.pol - dt * 0.8);
      if (k.has('ArrowDown') || k.has('s')) this.goal.pol = clampPol(this.goal.pol + dt * 0.8);
      if (k.has('=') || k.has('+')) this.zoom(Math.exp(-dt * 1.5));
      if (k.has('-') || k.has('_')) this.zoom(Math.exp(dt * 1.5));
    }
    this.goal.az += this.spin * dt;
    const c = this.cur, g = this.goal;
    c.az = damp(c.az, g.az, 9, dt);
    c.pol = damp(c.pol, g.pol, 9, dt);
    c.dist = damp(c.dist, g.dist, 7, dt);
    c.target.x = damp(c.target.x, g.target.x, 6, dt);
    c.target.y = damp(c.target.y, g.target.y, 6, dt);
    c.target.z = damp(c.target.z, g.target.z, 6, dt);

    const cam = this.world.camera;
    const s = Math.sin(c.pol);
    cam.position.set(c.target.x + c.dist * s * Math.sin(c.az), c.target.y + c.dist * Math.cos(c.pol), c.target.z + c.dist * s * Math.cos(c.az));
    let floor = SEA + 10;
    for (const f of this.world.fields) if (f) floor = Math.max(floor, f.height(cam.position.x, cam.position.z) + 7);
    if (cam.position.y < floor) cam.position.y = floor;
    cam.lookAt(c.target);
    cam.updateMatrixWorld();
  }
}

function clampPol(p) { return Math.min(1.5, Math.max(0.3, p)); }
