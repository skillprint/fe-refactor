// What hunts fireflies between the rows: soft-winged moths, bats, or shadow
// wisps, depending on the realm. One that touches the swarm eats some of it,
// then makes off. Their place is a pure function of time (in the path's own
// frame), so the simulation and the picture always agree.

import * as THREE from 'three';
import { PATH_HALF, path } from './space.js';

function shapeWing(points) {
  const s = new THREE.Shape();
  s.moveTo(...points[0]);
  for (const p of points.slice(1)) s.lineTo(...p);
  return new THREE.ShapeGeometry(s).rotateX(-Math.PI / 2);
}

function mothWing() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.25, 0.35, 0.75, 0.5, 0.95, 0.32);
  s.bezierCurveTo(1.05, 0.1, 0.8, -0.12, 0.55, -0.18);
  s.bezierCurveTo(0.6, -0.4, 0.35, -0.55, 0.12, -0.36);
  s.lineTo(0, 0);
  return new THREE.ShapeGeometry(s, 10).rotateX(-Math.PI / 2);
}

// A bat's wing: long fingers and a scalloped trailing edge.
const batWing = () => shapeWing([[0, 0.06], [0.28, 0.2], [0.62, 0.26], [1.05, 0.14], [0.86, -0.02], [0.72, -0.1], [0.58, 0.0], [0.42, -0.12], [0.28, -0.02], [0.12, -0.12], [0, -0.06]]);

export class Moths {
  constructor(scene) {
    this.scene = scene;
    this.list = [];
    this.eyeGeo = new THREE.SphereGeometry(0.035, 6, 4);
    this.geos = {
      moth: { wing: mothWing(), body: new THREE.CapsuleGeometry(0.07, 0.34, 3, 6).rotateX(Math.PI / 2) },
      bat: { wing: batWing(), body: new THREE.CapsuleGeometry(0.09, 0.22, 3, 6).rotateX(Math.PI / 2), ear: new THREE.ConeGeometry(0.04, 0.1, 4) },
      wisp: { body: new THREE.IcosahedronGeometry(0.3, 2), tail: new THREE.ConeGeometry(0.22, 0.9, 8, 1, true).rotateX(-Math.PI / 2).translate(0, 0, 0.5), haze: new THREE.IcosahedronGeometry(0.48, 1) },
    };
    this.wingMat = new THREE.MeshStandardMaterial({ roughness: 0.8, side: THREE.DoubleSide, transparent: true, opacity: 0.94 });
    this.bodyMat = new THREE.MeshStandardMaterial({ color: '#1a1420', roughness: 0.7 });
    this.hazeMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.35, depthWrite: false });
    this.eyeMat = new THREE.MeshBasicMaterial({ toneMapped: false });
    this.dress({ kind: 'moth', wing: '#2a1f33', eyes: [1.8, 0.45, 2.6] });
  }

  /** The realm's hunter. Takes effect for those spawned from now on. */
  dress(spec) {
    this.kind = this.geos[spec.kind] ? spec.kind : 'moth';
    const wing = new THREE.Color(spec.wing);
    this.wingMat.color.copy(wing);
    this.wingMat.emissive.copy(wing).multiplyScalar(0.6);
    this.bodyMat.color.copy(wing).multiplyScalar(0.7);
    this.hazeMat.color.copy(wing);
    this.eyeMat.color.setRGB(...spec.eyes);
  }

  spawn({ x, z, amp, freq, phase }) {
    const kind = this.kind, G = this.geos[kind];
    const g = new THREE.Group();
    let left = null, right = null, tail = null;
    if (kind === 'wisp') {
      // A knot of shadow trailing smoke, with two bright eyes.
      tail = new THREE.Mesh(G.tail, this.hazeMat);
      g.add(new THREE.Mesh(G.body, this.bodyMat), new THREE.Mesh(G.haze, this.hazeMat), tail);
    } else {
      left = new THREE.Mesh(G.wing, this.wingMat);
      right = new THREE.Mesh(G.wing, this.wingMat);
      right.scale.x = -1;
      g.add(new THREE.Mesh(G.body, this.bodyMat), left, right);
      if (G.ear) for (const s of [-1, 1]) {
        const ear = new THREE.Mesh(G.ear, this.bodyMat);
        ear.position.set(0.05 * s, 0.1, 0.12);
        g.add(ear);
      }
    }
    for (const s of [-1, 1]) {
      const e = new THREE.Mesh(this.eyeGeo, this.eyeMat);
      e.position.set((kind === 'wisp' ? 0.1 : 0.05) * s, kind === 'wisp' ? 0.06 : 0.03, kind === 'wisp' ? 0.27 : 0.22);
      g.add(e);
    }
    g.scale.setScalar(kind === 'bat' ? 1.55 : 1.35);
    this.scene.add(g);
    const m = { g, kind, left, right, tail, x0: clamp(x, -PATH_HALF + 0.6, PATH_HALF - 0.6), z, amp, freq, phase, hit: false, gone: 0 };
    this.list.push(m);
    return m;
  }

  /** Where moth m is at time t, across the path (x) and along it (z). */
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
      m.g.position.set(p.x + path.x(p.z), p.y, p.z);
      if (m.kind === 'wisp') {
        const pulse = 1 + Math.sin(t * 5 + m.phase) * 0.08;
        m.g.children[1].scale.setScalar(pulse);
        m.tail.rotation.y = Math.sin(t * 2.2 + m.phase) * 0.5;
        m.tail.scale.set(1, 1, 1 + Math.sin(t * 3 + m.phase) * 0.2);
      } else {
        const bat = m.kind === 'bat';
        const flap = Math.abs(Math.sin(t * (m.hit ? 30 : bat ? 11 : 17) + m.phase));
        // A shallow stroke: flapped near upright, a wing is edge-on to the camera behind and reads as a line.
        const lift = bat ? -0.35 + flap * 1.1 : 0.15 + flap * 0.6;
        m.left.rotation.z = lift;
        m.right.rotation.z = -lift;
      }
      m.g.rotation.y = Math.cos(t * m.freq + m.phase) * 0.5 + path.yaw(p.z);
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
