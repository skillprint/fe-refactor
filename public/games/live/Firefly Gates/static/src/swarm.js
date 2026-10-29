// Your fireflies: a cloud of points orbiting the swarm's centre, the number
// floating over them, the light they throw on the path, and the embers of
// the ones you lose.

import * as THREE from 'three';
import { fireflyMaterial, POINT_SCALE } from './world.js';
import { NumberSprite } from './labels.js';
import { Rng, clamp, damp } from './rng.js';

const CAP = 900;
const UP = '#9dffb0', DOWN = '#ff7a5c', WARM = '#ffe28a';

/** How many to draw for a swarm of n: every one while small, then fewer per extra. */
export function shown(n) { return n <= 120 ? n : Math.min(CAP, Math.round(120 + 26 * Math.sqrt(n - 120))); }

/** The swarm's radius for a count, before it squeezes through a gate. */
export function radiusFor(n) { return clamp(0.42 + 0.075 * Math.sqrt(shown(n)), 0.5, 2.6); }

export class Swarm {
  constructor(scene) {
    const rng = new Rng(9);
    this.pos = new Float32Array(CAP * 3);
    const seed = new Float32Array(CAP), birth = new Float32Array(CAP).fill(-99);
    this.ang = new Float32Array(CAP);
    this.elev = new Float32Array(CAP);
    this.u = new Float32Array(CAP);
    this.spd = new Float32Array(CAP);
    this.rate = new Float32Array(CAP);
    this.dir = new Float32Array(CAP * 3);
    for (let i = 0; i < CAP; i++) {
      seed[i] = rng.next();
      this.ang[i] = rng.range(0, Math.PI * 2);
      this.elev[i] = rng.range(0, Math.PI * 2);
      this.u[i] = Math.sqrt(rng.range(0.04, 1));
      this.spd[i] = rng.range(0.5, 1.7) * (rng.chance(0.5) ? 1 : -1);
      this.rate[i] = rng.range(3, 9);
      const a = rng.range(0, Math.PI * 2), b = rng.range(-0.2, 1);
      this.dir.set([Math.cos(a), b, Math.sin(a)], i * 3);
    }
    const geo = (this.geo = new THREE.BufferGeometry());
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    geo.setAttribute('aBirth', new THREE.BufferAttribute(birth, 1).setUsage(THREE.DynamicDrawUsage));
    geo.setDrawRange(0, 0);
    this.points = new THREE.Points(geo, fireflyMaterial({ size: 0.36 }));
    this.points.frustumCulled = false;
    scene.add(this.points);

    this.light = new THREE.PointLight('#ffd27a', 0, 24, 1.4);
    scene.add(this.light);

    this.label = new NumberSprite({ scale: 1.05, glow: WARM });
    scene.add(this.label.sprite);
    this.labelPop = 0;
    this.labelHue = WARM;
    this.floaters = Array.from({ length: 4 }, () => {
      const f = new NumberSprite({ scale: 0.7, size: 140 });
      f.sprite.visible = false;
      scene.add(f.sprite);
      return { f, t: 1, dx: 0 };
    });
    this.nextFloater = 0;

    this.embers = new Embers(scene);
    this.center = new THREE.Vector3(0, 1.6, 0);
    this.radius = radiusFor(1);
    this.squeeze = 1;
    this.count = 0;
    this.n = 0;
    this.t = 0;
    this.mode = 'swarm';
    this.anchor = new THREE.Vector3();
    this.modeT = 0;
    this.absorbed = 0;
    this.showLabel = true;
  }

  /** Start a fresh swarm of n, all of it at the centre. */
  reset(n) {
    this.count = n;
    this.n = shown(n);
    for (let i = 0; i < this.n; i++) this.pos.set([this.center.x, this.center.y, this.center.z], i * 3);
    this.geo.setDrawRange(0, this.n);
    this.geo.attributes.position.needsUpdate = true;
    this.radius = radiusFor(n);
    this.mode = 'swarm';
    this.points.material.uniforms.uAlpha.value = 1;
    this.labelHue = WARM;
    this.label.set(String(n), WARM);
  }

  /**
   * The count changes: new fireflies spark into being at `from`; lost ones
   * burn out as embers where they were.
   */
  setCount(n, { from = null, emberColor = [1.6, 0.5, 0.2], quiet = false } = {}) {
    const before = this.count;
    this.count = n;
    const next = shown(n);
    const birth = this.geo.attributes.aBirth.array;
    if (next > this.n) {
      for (let i = this.n; i < next; i++) {
        const p = from || this.center;
        this.pos.set([p.x + (Math.random() - 0.5) * 2.4, p.y + (Math.random() - 0.5) * 1.6, p.z + (Math.random() - 0.5) * 0.6], i * 3);
        birth[i] = this.t + Math.random() * 0.25;
      }
      this.geo.attributes.aBirth.needsUpdate = true;
    } else if (!quiet) {
      for (let i = next; i < this.n; i++) {
        this.embers.emit(this.pos[i * 3], this.pos[i * 3 + 1], this.pos[i * 3 + 2], emberColor, 1.6);
      }
    }
    this.n = next;
    this.geo.setDrawRange(0, this.n);
    if (n !== before) {
      this.labelPop = 1;
      this.labelHue = n > before ? UP : DOWN;
    }
  }

  /** A number rising off the swarm: "×3", "−12", "+46". */
  float(text, color) {
    const fl = this.floaters[this.nextFloater++ % this.floaters.length];
    fl.f.set(text, color);
    fl.t = 0;
    fl.dx = (this.nextFloater % 2 ? 1 : -1) * (0.5 + this.radius * 0.5);
    fl.f.sprite.visible = true;
  }

  /** Fly into the beacon at p, a few at a time. */
  pour(p) { this.mode = 'pour'; this.anchor.copy(p); this.modeT = 0; this.absorbed = 0; }
  /** Rise round a lit beacon in a slow spiral. */
  column() { this.mode = 'column'; this.modeT = 0; this.points.material.uniforms.uAlpha.value = 1; }
  /** Drift off into the dark from a beacon that stayed cold. */
  scatter() { this.mode = 'scatter'; this.modeT = 0; }

  /** Fraction of the swarm that has reached the beacon. */
  get poured() { return this.n ? this.absorbed / this.n : 1; }

  update(dt) {
    this.t += dt;
    this.modeT += dt;
    const { pos, n, center } = this;
    const R = this.radius * 1, sx = this.squeeze, t = this.t;
    let absorbed = 0;
    for (let i = 0; i < n; i++) {
      const k = i * 3;
      let tx, ty, tz, rate = this.rate[i];
      const th = this.ang[i] + this.spd[i] * t;
      const u = this.u[i];
      if (this.mode === 'swarm') {
        tx = center.x + Math.cos(th) * u * R * sx;
        ty = center.y + Math.sin(this.elev[i] + 1.3 * this.spd[i] * t) * u * R * 0.6;
        tz = center.z + Math.sin(th) * u * R * 0.75;
      } else if (this.mode === 'pour') {
        // Each one leaves the swarm at its own moment and dives into the light.
        const go = this.modeT - (i / n) * 1.6;
        if (go > 0) {
          tx = this.anchor.x + Math.cos(th * 3) * 0.25;
          ty = this.anchor.y + Math.sin(th * 2) * 0.2;
          tz = this.anchor.z + Math.sin(th * 3) * 0.25;
          rate = 4 + go * 6;
          const dx = pos[k] - this.anchor.x, dy = pos[k + 1] - this.anchor.y, dz = pos[k + 2] - this.anchor.z;
          if (dx * dx + dy * dy + dz * dz < 0.5) absorbed++;
        } else {
          tx = center.x + Math.cos(th) * u * R;
          ty = center.y + Math.sin(this.elev[i] + 1.3 * this.spd[i] * t) * u * R * 0.6;
          tz = center.z + Math.sin(th) * u * R * 0.75;
        }
      } else if (this.mode === 'column') {
        // A slow helix up round the lantern.
        const h = (u * 1.7 + this.modeT * 0.12 * (0.6 + Math.abs(this.spd[i]) * 0.4)) % 1;
        const r = 1.6 + h * 2.2 + Math.sin(th) * 0.25;
        const a = this.ang[i] + this.modeT * (0.5 + 0.4 * u) + h * 4;
        tx = this.anchor.x + Math.cos(a) * r;
        ty = this.anchor.y - 3.6 + h * 11;
        tz = this.anchor.z + Math.sin(a) * r;
        rate = 2.2;
      } else {
        const d = 3 + this.modeT * 2.5;
        tx = center.x + this.dir[k] * d;
        ty = center.y + this.dir[k + 1] * d * 0.6;
        tz = center.z + this.dir[k + 2] * d;
        rate = 1.5;
      }
      pos[k] = damp(pos[k], tx, rate, dt);
      pos[k + 1] = damp(pos[k + 1], ty, rate, dt);
      pos[k + 2] = damp(pos[k + 2], tz, rate * 2.5, dt);
    }
    this.absorbed = Math.max(this.absorbed, absorbed);
    this.geo.attributes.position.needsUpdate = true;
    if (this.mode === 'scatter') this.points.material.uniforms.uAlpha.value = Math.max(0, 1 - this.modeT / 2.5);

    // The light they throw grows with the swarm, slowly past a few hundred.
    const glow = this.mode === 'scatter' ? Math.max(0, 1 - this.modeT / 2) : this.mode === 'pour' ? 1 - this.poured : 1;
    this.light.intensity = (1.5 + Math.log2(1 + this.count) * 1.5) * glow;
    this.light.position.set(center.x, center.y + 0.6, center.z);

    // The count: pops and flushes green or red when it changes, then settles warm.
    this.labelPop = Math.max(0, this.labelPop - dt * 2.2);
    const s = 1.05 * (1 + 0.32 * Math.sin(Math.min(1, this.labelPop) * Math.PI) * this.labelPop);
    this.label.sprite.scale.set(s * this.label.aspect, s, 1);
    if (this.labelPop === 0 && this.labelHue !== WARM) this.labelHue = WARM;
    this.label.set(String(this.count), this.labelHue);
    // Under the swarm, nearer the camera: above it, the number would sit on the gates ahead.
    this.label.sprite.position.set(center.x, Math.max(0.45, center.y - this.radius * 0.62 - 0.5), center.z + 0.9);
    this.label.sprite.visible = this.showLabel && this.mode === 'swarm';

    for (const fl of this.floaters) {
      if (fl.t >= 1) { fl.f.sprite.visible = false; continue; }
      fl.t = Math.min(1, fl.t + dt / 1.3);
      fl.f.sprite.position.set(this.center.x + fl.dx, this.center.y + this.radius * 0.4 + fl.t * 1.1, this.center.z + 0.6);
      fl.f.material.opacity = fl.t < 0.15 ? fl.t / 0.15 : 1 - Math.pow((fl.t - 0.15) / 0.85, 2);
    }
    this.embers.update(dt);
  }
}

// Sparks and embers: short-lived points with their own colour and fall.
class Embers {
  constructor(scene, cap = 1400) {
    this.cap = cap;
    this.pos = new Float32Array(cap * 3);
    this.vel = new Float32Array(cap * 3);
    this.col = new Float32Array(cap * 3);
    this.life = new Float32Array(cap);
    this.span = new Float32Array(cap).fill(1);
    this.head = 0;
    const geo = (this.geo = new THREE.BufferGeometry());
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aColor', new THREE.BufferAttribute(this.col, 3));
    geo.setAttribute('aLife', new THREE.BufferAttribute(this.life, 1).setUsage(THREE.DynamicDrawUsage));
    this.points = new THREE.Points(geo, new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uPixel: POINT_SCALE },
      vertexShader: /* glsl */`
        attribute vec3 aColor;
        attribute float aLife;
        uniform float uPixel;
        varying vec3 vCol;
        varying float vLife;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          vCol = aColor;
          vLife = aLife;
          gl_PointSize = aLife > 0.0 ? 0.22 * uPixel * (0.4 + aLife) / max(0.5, -mv.z) : 0.0;
        }`,
      fragmentShader: /* glsl */`
        varying vec3 vCol;
        varying float vLife;
        void main() {
          float r = length(gl_PointCoord - 0.5) * 2.0;
          if (r > 1.0 || vLife <= 0.0) discard;
          float a = exp(-r * r * 4.0) * vLife;
          gl_FragColor = vec4(vCol * a * 2.0, 1.0);
        }`,
    }));
    this.points.frustumCulled = false;
    scene.add(this.points);
    this.alive = 0;
  }

  emit(x, y, z, color, speed = 1.5, life = 1.1) {
    const i = this.head;
    this.head = (this.head + 1) % this.cap;
    const k = i * 3;
    this.pos[k] = x; this.pos[k + 1] = y; this.pos[k + 2] = z;
    const a = Math.random() * Math.PI * 2, e = Math.random() * 1.2 - 0.3;
    const v = speed * (0.4 + Math.random() * 0.8);
    this.vel[k] = Math.cos(a) * Math.cos(e) * v;
    this.vel[k + 1] = Math.sin(e) * v + 0.4;
    this.vel[k + 2] = Math.sin(a) * Math.cos(e) * v;
    this.col[k] = color[0]; this.col[k + 1] = color[1]; this.col[k + 2] = color[2];
    this.life[i] = 1;
    this.span[i] = life * (0.6 + Math.random() * 0.8);
    this.geo.attributes.aColor.needsUpdate = true;
    this.alive = 1.5;
  }

  /** A burst of n sparks from (x, y, z). */
  burst(x, y, z, n, color, speed = 3, life = 0.9) {
    for (let i = 0; i < n; i++) this.emit(x + (Math.random() - 0.5) * 1.5, y + (Math.random() - 0.5) * 1.2, z, color, speed, life);
  }

  update(dt) {
    if (this.alive <= 0) return;
    this.alive -= dt / 2.5;
    const { pos, vel, life, span } = this;
    for (let i = 0; i < this.cap; i++) {
      if (life[i] <= 0) continue;
      const k = i * 3;
      life[i] = Math.max(0, life[i] - dt / span[i]);
      vel[k + 1] -= 2.2 * dt;
      const drag = Math.exp(-1.8 * dt);
      vel[k] *= drag; vel[k + 1] *= drag; vel[k + 2] *= drag;
      pos[k] += vel[k] * dt; pos[k + 1] += vel[k + 1] * dt; pos[k + 2] += vel[k + 2] * dt;
      if (life[i] > 0) this.alive = Math.max(this.alive, life[i]);
    }
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.aLife.needsUpdate = true;
  }
}
