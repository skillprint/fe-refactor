// Moths: dark, soft-winged, violet-eyed, hovering across the path between
// rows. A moth that touches the swarm eats some of it, then flutters off.
// Their place is a pure function of time, so the simulation and the picture
// always agree.

import * as THREE from 'three';
import { PATH_HALF } from './world.js';

function wingGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.25, 0.35, 0.75, 0.5, 0.95, 0.32);
  s.bezierCurveTo(1.05, 0.1, 0.8, -0.12, 0.55, -0.18);
  s.bezierCurveTo(0.6, -0.4, 0.35, -0.55, 0.12, -0.36);
  s.lineTo(0, 0);
  const g = new THREE.ShapeGeometry(s, 10);
  g.rotateX(-Math.PI / 2);
  return g;
}

export class Moths {
  constructor(scene) {
    this.scene = scene;
    this.list = [];
    this.wingGeo = wingGeometry();
    this.bodyGeo = new THREE.CapsuleGeometry(0.07, 0.34, 3, 6).rotateX(Math.PI / 2);
    this.eyeGeo = new THREE.SphereGeometry(0.035, 6, 4);
    this.wingMat = new THREE.MeshStandardMaterial({ color: '#2a1f33', emissive: '#1a0f2a', roughness: 0.8, side: THREE.DoubleSide, transparent: true, opacity: 0.94 });
    this.bodyMat = new THREE.MeshStandardMaterial({ color: '#1a1420', roughness: 0.7 });
    this.eyeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 0.45, 2.6), toneMapped: false });
  }

  spawn({ x, z, amp, freq, phase }) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(this.bodyGeo, this.bodyMat);
    const left = new THREE.Mesh(this.wingGeo, this.wingMat);
    const right = new THREE.Mesh(this.wingGeo, this.wingMat);
    right.scale.x = -1;
    const eyes = [-1, 1].map((s) => {
      const e = new THREE.Mesh(this.eyeGeo, this.eyeMat);
      e.position.set(0.05 * s, 0.03, 0.22);
      return e;
    });
    g.add(body, left, right, ...eyes);
    g.scale.setScalar(1.35);
    this.scene.add(g);
    const m = { g, left, right, x0: clamp(x, -PATH_HALF + 0.6, PATH_HALF - 0.6), z, amp, freq, phase, hit: false, gone: 0 };
    this.list.push(m);
    return m;
  }

  /** Where moth m is at time t. */
  where(m, t) {
    const x = m.x0 + Math.sin(t * m.freq + m.phase) * m.amp;
    return { x: clamp(x, -PATH_HALF - 0.4, PATH_HALF + 0.4), y: 1.7 + Math.sin(t * m.freq * 1.7 + m.phase) * 0.45, z: m.z };
  }

  /** Moths the swarm has just flown into. */
  hits(t, c, r) {
    const out = [];
    for (const m of this.list) {
      if (m.hit) continue;
      const p = this.where(m, t);
      if (Math.abs(p.z - c.z) > 0.8) continue;
      if (Math.hypot(p.x - c.x, (p.y - c.y) * 0.7) < r * 0.8 + 0.45) {
        m.hit = true;
        out.push(m);
      }
    }
    return out;
  }

  update(t, dt, focusZ) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const m = this.list[i];
      const p = this.where(m, t);
      if (m.hit) {
        // Off it goes, sated, up and away.
        m.gone += dt;
        p.y += m.gone * m.gone * 6;
        p.x += m.gone * 3 * Math.sign(p.x || 1);
      }
      m.g.position.set(p.x, p.y, p.z);
      const flap = Math.abs(Math.sin(t * (m.hit ? 30 : 17) + m.phase));
      m.left.rotation.z = 0.25 + flap * 0.95;
      m.right.rotation.z = -(0.25 + flap * 0.95);
      m.g.rotation.y = Math.cos(t * m.freq + m.phase) * 0.5;
      m.g.rotation.z = Math.sin(t * 2.3 + m.phase) * 0.15;
      // Gone once passed: the camera rides behind the swarm and would meet them.
      if (m.z > focusZ + (m.hit ? 6 : 1.5) || m.gone > 2) this.remove(i);
    }
  }

  remove(i) {
    this.scene.remove(this.list[i].g);
    this.list.splice(i, 1);
  }

  clear() { while (this.list.length) this.remove(this.list.length - 1); }
}

function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
