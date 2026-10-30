// The beacon at the end of each stage, in the realm's own form: a stone
// lantern, a hollow tree, a pagoda shrine, a lighthouse on stilts, an ice
// obelisk, a giant mushroom. Each has a number cut into it and a heart that
// holds the light. Bring at least that many fireflies and it wakes.

import * as THREE from 'three';
import { carvedTexture, NumberSprite } from './labels.js';
import { path } from './space.js';

let ringTex = null;
function ringTexture() {
  if (ringTex) return ringTex;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.35)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  ringTex = new THREE.CanvasTexture(c);
  ringTex.colorSpace = THREE.SRGBColorSpace;
  return ringTex;
}

const stone = (hex, rough = 0.93) => new THREE.MeshStandardMaterial({ color: hex, roughness: rough, flatShading: true });

// Each form adds its meshes through `add` ('core' is the heart that lights)
// and says how high the heart is, where the number is cut (height, depth),
// and how high the fill count floats.
const FORMS = {
  lantern(add, s) {
    const S = stone(s.stone), M = stone(s.moss, 1);
    add(new THREE.CylinderGeometry(2.3, 2.7, 0.5, 8), S, 0.25);
    add(new THREE.CylinderGeometry(1.7, 2.0, 0.5, 8), M, 0.7, 0.2);
    add(new THREE.CylinderGeometry(0.62, 0.8, 3.1, 8), S, 2.5);
    add(new THREE.CylinderGeometry(1.45, 1.05, 0.4, 8), S, 4.2, 0.2);
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(new THREE.BoxGeometry(0.3, 1.5, 0.3), S, 5.15, 0, x * 0.78, z * 0.78);
    add(new THREE.BoxGeometry(1.9, 0.22, 1.9), S, 4.45);
    add(new THREE.BoxGeometry(1.9, 0.22, 1.9), S, 5.95);
    add(new THREE.BoxGeometry(1.2, 1.2, 1.2), 'core', 5.2);
    add(new THREE.ConeGeometry(2.3, 1.5, 4, 1), S, 6.8, Math.PI / 4);
    add(new THREE.CylinderGeometry(0.12, 0.2, 0.5, 6), S, 7.7);
    add(new THREE.IcosahedronGeometry(0.28, 0), S, 8.05);
    return { mouth: 5.2, plate: [2.75, 0.83], fill: 9.4 };
  },

  hollowTree(add, s) {
    const B = stone(s.bark, 1), M = stone(s.moss, 1);
    const trunk = new THREE.CylinderGeometry(1.0, 1.5, 6.4, 9, 6);
    const p = trunk.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i), a = Math.atan2(p.getZ(i), p.getX(i));
      const k = 1 + Math.sin(a * 3 + y * 0.9) * 0.08;
      p.setXYZ(i, p.getX(i) * k + Math.sin(y * 0.6) * 0.15, y, p.getZ(i) * k);
    }
    trunk.computeVertexNormals();
    add(trunk, B, 3.2);
    for (let r = 0; r < 5; r++) {
      const a = (r / 5) * Math.PI * 2 + 0.4;
      add(new THREE.ConeGeometry(0.45, 2.2, 5).rotateZ(Math.PI / 2 - 0.35).rotateY(-a), B, 0.35, 0, Math.cos(a) * 1.6, Math.sin(a) * 1.6);
    }
    for (const [a, l] of [[0.6, 2.6], [2.4, 2.2], [4.2, 2.4]]) {
      add(new THREE.CylinderGeometry(0.08, 0.22, l, 5).translate(0, l / 2, 0).rotateZ(0.7).rotateY(a), B, 6.2);
    }
    add(new THREE.CylinderGeometry(1.15, 1.1, 0.5, 9), M, 6.45);
    // The hollow: a glowing hole in the trunk's face.
    add(new THREE.CircleGeometry(0.62, 12).scale(1, 1.45, 1), 'core', 4.4, 0, 0, 1.28);
    return { mouth: 4.4, plate: [2.1, 1.42], fill: 9.2 };
  },

  pagoda(add, s) {
    const W = stone(s.wood, 0.6), R = stone(s.roof, 0.8), S = stone('#5a605c');
    add(new THREE.BoxGeometry(3.2, 1.4, 3.2), S, 0.7);
    add(new THREE.BoxGeometry(2.6, 0.2, 2.6), W, 1.5);
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(new THREE.BoxGeometry(0.24, 1.9, 0.24), W, 2.55, 0, x * 0.95, z * 0.95);
    add(new THREE.BoxGeometry(1.7, 1.6, 1.7), 'core', 2.55);
    [[3.7, 2.6], [5.3, 2.0], [6.7, 1.5]].forEach(([y, r], i) => {
      add(new THREE.ConeGeometry(r, 0.75, 4, 1), R, y, Math.PI / 4);
      if (i < 2) add(new THREE.BoxGeometry(r * 0.75, 0.9, r * 0.75), W, y + 0.75);
    });
    add(new THREE.CylinderGeometry(0.05, 0.08, 1.4, 6), R, 7.6);
    for (let k = 0; k < 4; k++) add(new THREE.TorusGeometry(0.16 - k * 0.02, 0.03, 4, 10).rotateX(Math.PI / 2), R, 7.2 + k * 0.22);
    return { mouth: 2.55, plate: [0.75, 1.62], fill: 9.0 };
  },

  lighthouse(add, s) {
    const W = stone(s.wood, 0.9), R = stone(s.roof, 0.8);
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(new THREE.CylinderGeometry(0.1, 0.13, 3.2, 6), W, 1.6, 0, x * 1.0, z * 1.0);
    add(new THREE.BoxGeometry(2.8, 0.22, 2.8), W, 3.2);
    add(new THREE.CylinderGeometry(0.55, 0.75, 3.0, 8), W, 4.8);
    add(new THREE.CylinderGeometry(0.85, 0.85, 0.16, 10), W, 6.35);
    add(new THREE.CylinderGeometry(0.5, 0.5, 1.0, 10), 'core', 6.95);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      add(new THREE.BoxGeometry(0.06, 1.0, 0.06), R, 6.95, 0, Math.cos(a) * 0.55, Math.sin(a) * 0.55);
    }
    add(new THREE.ConeGeometry(0.95, 0.9, 10), R, 7.9);
    add(new THREE.SphereGeometry(0.12, 6, 4), R, 8.45);
    // The number on a board hung between the stilts.
    add(new THREE.BoxGeometry(2.3, 1.2, 0.08), W, 2.15, 0, 0, 1.05);
    return { mouth: 6.95, plate: [2.15, 1.12], fill: 10.0 };
  },

  obelisk(add, s) {
    const I = new THREE.MeshStandardMaterial({ color: s.ice, roughness: 0.18, metalness: 0, flatShading: true, emissive: '#10283c' });
    const B = stone('#6a7890');
    add(new THREE.CylinderGeometry(2.0, 2.3, 0.6, 6), B, 0.3);
    add(new THREE.CylinderGeometry(1.4, 1.7, 0.6, 6), B, 0.9, 0.3);
    add(new THREE.CylinderGeometry(0.75, 1.0, 6.2, 6), I, 4.3);
    add(new THREE.ConeGeometry(0.75, 1.6, 6), I, 8.2);
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + 0.4, h = 1.6 + (k % 2) * 0.8;
      add(new THREE.CylinderGeometry(0.2, 0.28, h, 6).translate(0, h / 2, 0).rotateZ(0.35).rotateY(-a), I, 1.1, 0, Math.cos(a) * 1.0, Math.sin(a) * 1.0);
    }
    add(new THREE.OctahedronGeometry(0.75, 0).scale(1, 1.4, 0.6), 'core', 5.2, 0, 0, 0.62);
    return { mouth: 5.2, plate: [2.7, 1.02], fill: 10.2 };
  },

  mushroom(add, s) {
    const St = stone(s.stalk, 0.85), C = stone(s.cap, 0.7), D = stone('#e8d8f0', 0.9);
    const stalk = new THREE.CylinderGeometry(0.85, 1.25, 5.4, 12, 5);
    const p = stalk.attributes.position;
    for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) + Math.sin((p.getY(i) + 2.7) * 0.5) * 0.25);
    stalk.computeVertexNormals();
    add(stalk, St, 2.7);
    add(new THREE.SphereGeometry(4.2, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.5, 1), C, 5.5);
    for (let k = 0; k < 9; k++) {
      const a = k * 2.4, r = 1.2 + (k % 3) * 1.0;
      add(new THREE.SphereGeometry(0.28 + (k % 2) * 0.12, 6, 4), D, 5.5 + Math.sqrt(Math.max(0, 1 - (r / 4.2) ** 2)) * 2.0, 0, Math.cos(a) * r, Math.sin(a) * r);
    }
    // The gills under the cap, and a glowing ring round the stalk.
    add(new THREE.CircleGeometry(4.0, 24).rotateX(Math.PI / 2), 'core', 5.48);
    add(new THREE.TorusGeometry(1.15, 0.12, 5, 20).rotateX(Math.PI / 2), 'core', 4.1);
    return { mouth: 4.8, plate: [2.4, 1.32], fill: 9.6 };
  },
};

export class Beacon {
  constructor(scene, z, need, spec, mirror = null) {
    this.scene = scene;
    this.need = need;
    const g = (this.group = new THREE.Group());
    g.position.set(path.x(z), 0, z);
    this.coreMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.06, 0.08, 0.1), toneMapped: false });
    this.mats = new Set([this.coreMat]);
    const add = (geo, mat, y, ry = 0, x = 0, zz = 0) => {
      const m = new THREE.Mesh(geo, mat === 'core' ? this.coreMat : mat);
      this.mats.add(m.material);
      m.position.set(x, y, zz);
      m.rotation.y = ry;
      g.add(m);
      return m;
    };
    const form = (FORMS[spec.form] || FORMS.lantern)(add, spec);
    this.mouthY = form.mouth;

    // The number, cut into the beacon's face.
    this.plateMat = new THREE.MeshBasicMaterial({ map: carvedTexture(String(need)), transparent: true, depthWrite: false, toneMapped: false, color: new THREE.Color(1.1, 1.25, 1.35) });
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.1), this.plateMat);
    plate.position.set(0, form.plate[0], form.plate[1]);
    g.add(plate);
    this.plate = plate;

    // What has poured in so far, overhead.
    this.fill = new NumberSprite({ scale: 1.25, glow: '#ffd08a' });
    this.fill.sprite.position.set(0, form.fill, 0);
    this.fill.sprite.visible = false;
    g.add(this.fill.sprite);

    this.fire = new THREE.Color().setRGB(...spec.fire);
    this.light = new THREE.PointLight(spec.light, 0, 48, 1.6);
    this.light.position.set(0, form.mouth, 1.2);
    g.add(this.light);
    this.ringMat = new THREE.MeshBasicMaterial({ map: ringTexture(), color: new THREE.Color(spec.light), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0 });
    this.ring = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.ringMat);
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.position.y = 0.06;
    g.add(this.ring);

    // Upside down in still water: the same meshes, without lights or labels.
    this.twin = null;
    this.mirror = mirror;
    if (mirror) {
      const twin = (this.twin = new THREE.Group());
      twin.position.copy(g.position);
      for (const child of g.children) {
        // Not the number: upside down, figures misread.
        if (!child.isMesh || child === this.ring || child === plate) continue;
        const m = new THREE.Mesh(child.geometry, child.material);
        m.position.copy(child.position);
        m.rotation.copy(child.rotation);
        twin.add(m);
      }
      mirror.add(twin);
    }

    this.state = 'dormant';
    this.k = 0;
    this.t = 0;
    scene.add(g);
  }

  /** Cut a different number (the tutorial sets its beacon once it knows the swarm). */
  setNeed(n) {
    this.need = n;
    this.plateMat.map.dispose();
    this.plateMat.map = carvedTexture(String(n));
  }

  /** Where the number is, in the world: what a pointer aims at. */
  platePosition(out) { return out.copy(this.plate.position).add(this.group.position); }

  /** Where the fireflies fly to. */
  get mouth() { return new THREE.Vector3(this.group.position.x, this.mouthY, this.group.position.z); }
  get z() { return this.group.position.z; }

  showFill(n) {
    this.fill.sprite.visible = true;
    this.fill.set(`${n} / ${this.need}`, n >= this.need ? '#ffd08a' : '#9fd8ff');
  }

  wake() { this.state = 'lit'; this.k = 0; }
  fizzle() { this.state = 'cold'; this.k = 0; }
  /** Left behind: keep glowing, stop counting. */
  retire() { this.fill.sprite.visible = false; }

  update(dt) {
    this.t += dt;
    this.k = Math.min(1, this.k + dt / 2.2);
    const f = this.fire;
    if (this.state === 'lit') {
      const e = 1 - Math.pow(1 - this.k, 3);
      const flicker = 1 + Math.sin(this.t * 11) * 0.04 + Math.sin(this.t * 23) * 0.03;
      this.coreMat.color.setRGB(f.r * e * flicker, f.g * e * flicker, f.b * e);
      this.light.intensity = 70 * e * flicker;
      this.plateMat.color.setRGB(1.1 + 2.4 * e, 1.25 + 1.2 * e, 1.35 - 0.6 * e);
      this.ringMat.opacity = 0.85 * e;
      this.ring.scale.setScalar(6 + 20 * e);
    } else if (this.state === 'cold') {
      // A gutter of light, then nothing.
      const k = Math.max(0, Math.sin(this.k * 9) * (1 - this.k));
      this.coreMat.color.setRGB(f.r * 0.35 * k + 0.06, f.g * 0.3 * k + 0.08, f.b * 0.3 * k + 0.1);
      this.light.intensity = 30 * k;
    } else {
      // Dormant, but faintly breathing so it reads from far off.
      const b = 0.5 + 0.5 * Math.sin(this.t * 1.6);
      this.coreMat.color.setRGB(0.08 + 0.1 * b, 0.12 + 0.14 * b, 0.16 + 0.2 * b);
    }
  }

  dispose() {
    this.scene.remove(this.group);
    if (this.twin) this.mirror.remove(this.twin);
    this.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
    this.plateMat.map.dispose();
    for (const m of this.mats) m.dispose();
    this.plateMat.dispose();
    this.ringMat.dispose();
    this.fill.dispose();
  }
}
