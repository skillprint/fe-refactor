// The beacon at the end of each stage: an old stone lantern with a number cut
// into it. Bring at least that many fireflies and it wakes.

import * as THREE from 'three';
import { carvedTexture, NumberSprite } from './labels.js';

const STONE = new THREE.MeshStandardMaterial({ color: '#46515c', roughness: 0.93, flatShading: true });
const MOSS = new THREE.MeshStandardMaterial({ color: '#2e4a37', roughness: 1, flatShading: true });

let ringTex = null;
function ringTexture() {
  if (ringTex) return ringTex;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255, 210, 140, 0.9)');
  grad.addColorStop(0.35, 'rgba(255, 170, 90, 0.35)');
  grad.addColorStop(1, 'rgba(255, 150, 80, 0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  ringTex = new THREE.CanvasTexture(c);
  ringTex.colorSpace = THREE.SRGBColorSpace;
  return ringTex;
}

export class Beacon {
  constructor(scene, z, need) {
    this.scene = scene;
    this.need = need;
    const g = (this.group = new THREE.Group());
    g.position.set(0, 0, z);
    const add = (geo, mat, y, ry = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.y = y;
      m.rotation.y = ry;
      g.add(m);
      return m;
    };
    add(new THREE.CylinderGeometry(2.3, 2.7, 0.5, 8), STONE, 0.25);
    add(new THREE.CylinderGeometry(1.7, 2.0, 0.5, 8), MOSS, 0.7, 0.2);
    add(new THREE.CylinderGeometry(0.62, 0.8, 3.1, 8), STONE, 2.5);
    add(new THREE.CylinderGeometry(1.45, 1.05, 0.4, 8), STONE, 4.2, 0.2);
    // The firebox: four corner posts round a core that holds the light.
    for (const [x, zz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const post = add(new THREE.BoxGeometry(0.3, 1.5, 0.3), STONE, 5.15);
      post.position.x = x * 0.78;
      post.position.z = zz * 0.78;
    }
    add(new THREE.BoxGeometry(1.9, 0.22, 1.9), STONE, 4.45);
    add(new THREE.BoxGeometry(1.9, 0.22, 1.9), STONE, 5.95);
    this.coreMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.06, 0.08, 0.1), toneMapped: false });
    this.core = add(new THREE.BoxGeometry(1.2, 1.2, 1.2), this.coreMat, 5.2);
    add(new THREE.ConeGeometry(2.3, 1.5, 4, 1), STONE, 6.8, Math.PI / 4);
    add(new THREE.CylinderGeometry(0.12, 0.2, 0.5, 6), STONE, 7.7);
    add(new THREE.IcosahedronGeometry(0.28, 0), STONE, 8.05);

    // The number, cut into the pillar's face.
    this.plateMat = new THREE.MeshBasicMaterial({ map: carvedTexture(String(need)), transparent: true, depthWrite: false, toneMapped: false, color: new THREE.Color(1.1, 1.25, 1.35) });
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.1), this.plateMat);
    plate.position.set(0, 2.75, 0.83);
    g.add(plate);

    // What has poured in so far, over the roof.
    this.fill = new NumberSprite({ scale: 1.25, glow: '#ffd08a' });
    this.fill.sprite.position.set(0, 9.4, 0);
    this.fill.sprite.visible = false;
    g.add(this.fill.sprite);

    this.light = new THREE.PointLight('#ffb35c', 0, 48, 1.6);
    this.light.position.set(0, 5.2, 1.2);
    g.add(this.light);
    this.ringMat = new THREE.MeshBasicMaterial({ map: ringTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0 });
    this.ring = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.ringMat);
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.position.y = 0.06;
    g.add(this.ring);

    this.state = 'dormant';
    this.k = 0;
    this.t = 0;
    scene.add(g);
  }

  /** Where the fireflies fly to. */
  get mouth() { return new THREE.Vector3(0, 5.2, this.group.position.z); }
  get z() { return this.group.position.z; }

  showFill(n) {
    this.fill.sprite.visible = true;
    this.fill.set(`${n} / ${this.need}`, n >= this.need ? '#ffd08a' : '#9fd8ff');
  }

  wake() { this.state = 'lit'; this.k = 0; }
  /** Left behind: keep glowing, stop counting. */
  retire() { this.fill.sprite.visible = false; }
  fizzle() { this.state = 'cold'; this.k = 0; }

  update(dt) {
    this.t += dt;
    this.k = Math.min(1, this.k + dt / 2.2);
    if (this.state === 'lit') {
      const e = 1 - Math.pow(1 - this.k, 3);
      const flicker = 1 + Math.sin(this.t * 11) * 0.04 + Math.sin(this.t * 23) * 0.03;
      this.coreMat.color.setRGB(4.6 * e * flicker, 2.9 * e * flicker, 1.1 * e);
      this.light.intensity = 70 * e * flicker;
      this.plateMat.color.setRGB(1.1 + 2.4 * e, 1.25 + 1.2 * e, 1.35 - 0.6 * e);
      this.ringMat.opacity = 0.85 * e;
      this.ring.scale.setScalar(6 + 20 * e);
    } else if (this.state === 'cold') {
      // A gutter of light, then nothing.
      const f = Math.max(0, Math.sin(this.k * 9) * (1 - this.k));
      this.coreMat.color.setRGB(1.6 * f + 0.06, 0.9 * f + 0.08, 0.3 * f + 0.1);
      this.light.intensity = 30 * f;
    } else {
      // Dormant, but faintly breathing so it reads from far off.
      const b = 0.5 + 0.5 * Math.sin(this.t * 1.6);
      this.coreMat.color.setRGB(0.08 + 0.1 * b, 0.12 + 0.14 * b, 0.16 + 0.2 * b);
    }
  }

  dispose() {
    this.scene.remove(this.group);
    this.group.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
    });
    this.plateMat.map.dispose();
    this.plateMat.dispose();
    this.coreMat.dispose();
    this.ringMat.dispose();
    this.fill.dispose();
  }
}
