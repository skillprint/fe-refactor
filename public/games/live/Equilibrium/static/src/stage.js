// The gallery: a wall a little way behind the mobile, one spotlight whose
// soft shadows fall on it close to what casts them, a
// freestanding plinth for the loose weights with the museum label on its
// face, and a camera that frames whatever is hanging. Each exhibit repaints
// the room; the colours and the wall's depth ease to the new values while
// the next mobile comes down.

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { grain, starlight } from './labels.js';

const AMBER = new THREE.Color('#ffcf98');
const PLINTH_DEPTH = 0.7;
const PLINTH_HEIGHT = 9;

export class Stage {
  constructor(canvas) {
    const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }));
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.NeutralToneMapping;
    r.toneMappingExposure = 1.0;
    r.shadowMap.enabled = true;
    // Variance shadows blur: a soft-edged shade reads as shadow, a crisp one as another object.
    r.shadowMap.type = THREE.VSMShadowMap;

    const scene = (this.scene = new THREE.Scene());
    scene.background = new THREE.Color('#d9d2c6');
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 400);
    this.camera.position.set(0, -1, 14);

    this.wall = new THREE.Mesh(
      new THREE.PlaneGeometry(600, 360),
      new THREE.MeshStandardMaterial({ color: '#f3eee5', roughness: 0.96 }),
    );
    this.wall.receiveShadow = true;
    scene.add(this.wall);
    this.depth = this.depthGoal = 2.2;
    this.wall.position.z = -this.depth;

    this.hemi = new THREE.HemisphereLight('#fffaf2', '#d6cab6', 1.9);
    scene.add(this.hemi);

    // The key light: soft-edged, and the maker of the wall's shadows.
    const key = (this.key = new THREE.SpotLight('#fff4e6', 2.2, 0, 0.5, 1, 0));
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.radius = 6;
    key.shadow.blurSamples = 16;
    key.shadow.bias = -0.0006;
    // Shadows are a quiet second reading of the mobile, never a rival to it.
    key.shadow.intensity = 0.6;
    scene.add(key, key.target);
    this.warmth = 0;
    this.dim = 0;

    // A freestanding plinth for the loose weights; its front runs down out of frame.
    this.plinth = new THREE.Mesh(
      new THREE.BoxGeometry(1, PLINTH_HEIGHT, PLINTH_DEPTH),
      new THREE.MeshStandardMaterial({ color: '#fbfaf6', roughness: 0.7 }),
    );
    this.plinth.castShadow = this.plinth.receiveShadow = true;
    this.plinth.visible = false;
    scene.add(this.plinth);

    this.placard = new THREE.Mesh(
      new THREE.PlaneGeometry(1.35, 0.61),
      new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -2 }),
    );
    this.placard.position.z = PLINTH_DEPTH / 2 + 0.004;
    this.placard.receiveShadow = true;
    this.placard.visible = false;
    scene.add(this.placard);

    // What the current exhibit asks of the room; update() eases toward it.
    this.look = { wall: new THREE.Color('#f3eee5'), background: new THREE.Color('#d9d2c6'), sky: new THREE.Color('#fffaf2'), ground: new THREE.Color('#d6cab6'), key: new THREE.Color('#fff4e6'), plinth: new THREE.Color('#fbfaf6'), hemi: 1.9, keyIntensity: 2.2 };
    this.lit = { ...this.look, wall: this.look.wall.clone(), background: this.look.background.clone(), sky: this.look.sky.clone(), ground: this.look.ground.clone(), key: this.look.key.clone(), plinth: this.look.plinth.clone() };
    this.side = -1;
    this.elevation = 1;
    this.env = null;

    this.goal = { x: 0, y: -1, z: 14 };
    this.lookAt = new THREE.Vector3(0, -1, 0);
    this.parallax = new THREE.Vector2();
    this.parallaxGoal = new THREE.Vector2();
    this.box = null;
    this.pad = { top: 80, bottom: 80, left: 24, right: 24 };
    this.ray = new THREE.Raycaster();
    this.resize();
  }

  get portrait() { return innerHeight > innerWidth * 1.05; }

  resize() {
    const w = innerWidth, h = innerHeight;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.box) this.frame(this.box, this.pad, true);
  }

  /** A soft studio reflection for metal finishes, made once on first use. */
  envMap() {
    if (!this.env) {
      const pm = new THREE.PMREMGenerator(this.renderer);
      this.env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
      pm.dispose();
    }
    return this.env;
  }

  /** Repaints the room for an exhibit; `immediate` skips the easing (the first mobile). */
  setExhibit(ex, immediate = false) {
    const L = this.look;
    L.wall.set(ex.wall.color);
    L.background.set(ex.wall.background);
    L.sky.set(ex.hemi.sky);
    L.ground.set(ex.hemi.ground);
    L.key.set(ex.key.color);
    L.plinth.set(ex.plinth);
    L.hemi = ex.hemi.intensity;
    L.keyIntensity = ex.key.intensity;
    this.side = ex.key.side;
    this.elevation = ex.key.elevation;
    const m = this.wall.material;
    m.map = grain(ex.wall.grain);
    // A night sky glows faintly with its own stars.
    const night = ex.wall.grain === 'starry';
    m.emissiveMap = night ? starlight() : null;
    m.emissive.set(night ? '#ffffff' : '#000000');
    m.emissiveIntensity = night ? 0.85 : 0;
    m.needsUpdate = true;
    const root = document.documentElement.style;
    root.setProperty('--wall', ex.wall.css);
    root.setProperty('--vig', ex.wall.vignette);
    if (immediate) {
      for (const k of ['wall', 'background', 'sky', 'ground', 'key', 'plinth']) this.lit[k].copy(L[k]);
      this.lit.hemi = L.hemi;
      this.lit.keyIntensity = L.keyIntensity;
    }
    if (this.box) this.aimLight();
  }

  /** How far behind the mobile's plane the wall stands. */
  setDepth(d, immediate = false) {
    this.depthGoal = d;
    if (immediate) this.depth = d;
    if (this.box) this.aimLight();
  }

  setPlinth(y, half) {
    const p = this.plinth;
    p.visible = true;
    p.scale.x = half * 2;
    p.position.set(0, y - PLINTH_HEIGHT / 2, 0);
  }

  hidePlinth() {
    this.plinth.visible = false;
    this.placard.visible = false;
  }

  setPlacard(map, x, y) {
    const m = this.placard.material;
    m.map?.dispose();
    m.map = map;
    m.needsUpdate = true;
    this.placard.position.x = x;
    this.placard.position.y = y;
    this.placard.visible = true;
  }

  /**
   * Points the camera so `box` (world units, in the plane z = 0) fills the
   * screen inside `pad` (pixels kept clear for the HUD).
   */
  frame(box, pad, immediate = false) {
    this.box = box;
    this.pad = pad;
    const w = innerWidth, h = innerHeight;
    const cam = this.camera;
    const tan = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const usableH = Math.max(0.2, 1 - (pad.top + pad.bottom) / h);
    const usableW = Math.max(0.2, 1 - (pad.left + pad.right) / w);
    // A small mobile still hangs in a room: never frame less than this much wall.
    const bw = Math.max(7.2, box.maxX - box.minX), bh = Math.max(5.4, box.maxY - box.minY);
    const dist = Math.max(bh / (2 * tan * usableH), bw / (2 * tan * cam.aspect * usableW), 3.5);
    const vh = 2 * dist * tan, vw = vh * cam.aspect;
    const cx = (box.minX + box.maxX) / 2, cy = (box.minY + box.maxY) / 2;
    this.goal = {
      x: cx - ((pad.left - pad.right) / 2 / w) * vw,
      y: cy + ((pad.top - pad.bottom) / 2 / h) * vh,
      z: dist,
    };
    this.aimLight();
    if (immediate) {
      cam.position.set(this.goal.x, this.goal.y, this.goal.z);
      this.lookAt.set(this.goal.x, this.goal.y, 0);
    }
  }

  // The light sits in front of the mobile, to the exhibit's side, at a slant
  // chosen so the shadows land a moderate distance from what casts them,
  // however far back the wall is: about 0.22 + 0.12·D across and 0.3 + 0.15·D
  // down for a wall D behind. The cone covers the mobile and its shadow.
  aimLight() {
    const box = this.box;
    const key = this.key;
    const D = this.depthGoal;
    const cx = (box.minX + box.maxX) / 2, cy = (box.minY + box.maxY) / 2;
    const size = Math.max(box.maxX - box.minX, box.maxY - box.minY);
    const across = (0.22 + 0.12 * D) / D;
    const down = ((0.3 + 0.15 * D) / D) * this.elevation;
    const dir = new THREE.Vector3(this.side * across, down, 1).normalize();
    const s = (size + D) * 1.3 + 6;
    const center = new THREE.Vector3(cx, cy, 0);
    key.position.copy(center).addScaledVector(dir, s);
    key.target.position.copy(center);
    key.target.updateMatrixWorld();

    const axis = center.clone().sub(key.position).normalize();
    let widest = 0;
    const p = new THREE.Vector3(), ray = new THREE.Vector3();
    for (const x of [box.minX, box.maxX]) {
      for (const y of [box.minY, box.maxY]) {
        p.set(x, y, 0);
        ray.subVectors(p, key.position).normalize();
        widest = Math.max(widest, axis.angleTo(ray));
        // …and where that corner's shadow lands on the wall.
        const t = (-D - key.position.z) / ray.z;
        p.copy(key.position).addScaledVector(ray, t);
        widest = Math.max(widest, axis.angleTo(ray.subVectors(p, key.position).normalize()));
      }
    }
    key.angle = Math.min(1.45, widest + 0.14);
    key.shadow.camera.near = Math.max(0.5, s * 0.35);
    key.shadow.camera.far = s + D + size;
    key.shadow.camera.updateProjectionMatrix();
  }

  /** Pointer position in [-1, 1]² for a little parallax; null to settle. */
  lean(nx, ny) {
    this.parallaxGoal.set(nx ?? 0, ny ?? 0);
  }

  update(dt) {
    const cam = this.camera;
    const k = 1 - Math.exp(-dt * 3.2);
    this.parallax.lerp(this.parallaxGoal, 1 - Math.exp(-dt * 2));
    const g = this.goal;
    const lean = Math.min(0.35, g.z * 0.02);
    const tx = g.x + this.parallax.x * lean, ty = g.y - this.parallax.y * lean * 0.6;
    cam.position.x += (tx - cam.position.x) * k;
    cam.position.y += (ty - cam.position.y) * k;
    cam.position.z += (g.z - cam.position.z) * k;
    this.lookAt.x += (g.x - this.lookAt.x) * k;
    this.lookAt.y += (g.y - this.lookAt.y) * k;
    cam.lookAt(this.lookAt);

    // The room eases into the next exhibit over a second or so.
    const e = 1 - Math.exp(-dt * 2.4);
    this.depth += (this.depthGoal - this.depth) * e;
    this.wall.position.z = -this.depth;
    const L = this.look, lit = this.lit;
    for (const c of ['wall', 'background', 'sky', 'ground', 'key', 'plinth']) lit[c].lerp(L[c], e);
    lit.hemi += (L.hemi - lit.hemi) * e;
    lit.keyIntensity += (L.keyIntensity - lit.keyIntensity) * e;
    this.wall.material.color.copy(lit.wall);
    this.scene.background.copy(lit.background);
    this.hemi.color.copy(lit.sky);
    this.hemi.groundColor.copy(lit.ground);
    this.plinth.material.color.copy(lit.plinth);

    // Late in the candle the light warms and sinks a little; a lost mobile dims.
    this.key.color.copy(lit.key).lerp(AMBER, this.warmth * 0.8);
    this.key.intensity = lit.keyIntensity * (1 - 0.18 * this.warmth) * (1 - 0.45 * this.dim);
    this.hemi.intensity = lit.hemi * (1 - 0.35 * this.dim);
  }

  render() { this.renderer.render(this.scene, this.camera); }

  /** Screen pixels of a world point. */
  toScreen(v) {
    const p = v.clone().project(this.camera);
    return { x: (p.x + 1) / 2 * innerWidth, y: (1 - p.y) / 2 * innerHeight, behind: p.z > 1 };
  }

  /** Where a screen point lands on the plane z = `z`. */
  onPlane(x, y, z = 0) {
    this.ray.setFromCamera(new THREE.Vector2(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1), this.camera);
    const r = this.ray.ray;
    const t = (z - r.origin.z) / r.direction.z;
    return r.origin.clone().addScaledVector(r.direction, t);
  }

  /** Pixels per world unit at the plane z = 0, for sizing touch targets. */
  pxPerUnit() {
    const tan = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    return innerHeight / (2 * this.camera.position.z * tan);
  }

  raycaster(x, y) {
    this.ray.setFromCamera(new THREE.Vector2(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1), this.camera);
    return this.ray;
  }
}
