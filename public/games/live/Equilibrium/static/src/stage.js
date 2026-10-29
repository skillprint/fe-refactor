// The gallery: a warm white wall close behind the mobile, one spotlight from
// the front left so every shadow falls down and to the right, a floating
// shelf for the loose weights, a museum label, and a camera that frames
// whatever is hanging.

import * as THREE from 'three';
import { plaster } from './labels.js';

export const WALL_Z = -0.85;
const COOL = new THREE.Color('#fff4e6');
const AMBER = new THREE.Color('#ffcf98');
const SHELF_DEPTH = 0.62;

export class Stage {
  constructor(canvas) {
    const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }));
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.NeutralToneMapping;
    r.toneMappingExposure = 1.0;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = (this.scene = new THREE.Scene());
    scene.background = new THREE.Color('#d9d2c6');
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 400);
    this.camera.position.set(0, -1, 14);

    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 240),
      new THREE.MeshStandardMaterial({ color: '#f3eee5', roughness: 0.96, map: plaster() }),
    );
    wall.position.z = WALL_Z;
    wall.receiveShadow = true;
    scene.add(wall);

    this.hemi = new THREE.HemisphereLight('#fffaf2', '#d6cab6', 1.9);
    scene.add(this.hemi);

    // The key light: warm, soft-edged, and the maker of the wall's shadows.
    const key = (this.key = new THREE.SpotLight('#fff4e6', 2.2, 0, 0.5, 1, 0));
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.0003;
    key.shadow.normalBias = 0.012;
    key.shadow.camera.near = 1;
    scene.add(key, key.target);
    this.warmth = 0;
    this.dim = 0;

    // The shelf the loose weights stand on, sized per mobile.
    this.shelf = new THREE.Mesh(
      new THREE.BoxGeometry(1, 0.05, SHELF_DEPTH),
      new THREE.MeshStandardMaterial({ color: '#fbfaf6', roughness: 0.7 }),
    );
    this.shelf.receiveShadow = true;
    this.shelf.visible = false;
    scene.add(this.shelf);
    // A floating shelf's own shadow is a soft band on the wall just below it.
    this.shelfShade = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shade(), transparent: true, depthWrite: false }));
    this.shelfShade.visible = false;
    scene.add(this.shelfShade);

    this.placard = new THREE.Mesh(
      new THREE.PlaneGeometry(1.06, 0.48),
      new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.8 }),
    );
    this.placard.position.z = WALL_Z + 0.012;
    this.placard.castShadow = true;
    this.placard.receiveShadow = true;
    this.placard.visible = false;
    scene.add(this.placard);

    this.goal = { x: 0, y: -1, z: 14 };
    this.look = new THREE.Vector3(0, -1, 0);
    this.parallax = new THREE.Vector2();
    this.parallaxGoal = new THREE.Vector2();
    this.box = null;
    this.pad = { top: 80, bottom: 80, left: 24, right: 24 };
    this.lightBox = null;
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

  setShelf(y, minX, maxX) {
    const s = this.shelf;
    s.visible = true;
    s.scale.x = maxX - minX;
    s.position.set((minX + maxX) / 2, y - 0.025, WALL_Z + SHELF_DEPTH / 2);
    const sh = this.shelfShade;
    sh.visible = true;
    sh.scale.set(maxX - minX + 0.5, 0.7, 1);
    sh.position.set((minX + maxX) / 2 + 0.12, y - 0.36, WALL_Z + 0.004);
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
    this.aimLight(box);
    if (immediate) {
      cam.position.set(this.goal.x, this.goal.y, this.goal.z);
      this.look.set(this.goal.x, this.goal.y, 0);
    }
  }

  // The pool of light follows the mobile: above it, to the front left.
  aimLight(box) {
    const key = this.key;
    const cx = (box.minX + box.maxX) / 2, cy = (box.minY + box.maxY) / 2;
    const size = Math.max(box.maxX - box.minX, box.maxY - box.minY);
    const s = size * 1.25 + 4;
    key.position.set(cx - 0.42 * s, cy + 0.62 * s, 1.05 * s);
    key.target.position.set(cx + size * 0.04, cy - size * 0.06, 0);
    const dist = key.position.distanceTo(key.target.position);
    key.angle = Math.min(1.2, Math.atan((size * 1.1) / dist) + 0.22);
    key.shadow.camera.far = dist * 2.2;
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
    this.look.x += (g.x - this.look.x) * k;
    this.look.y += (g.y - this.look.y) * k;
    cam.lookAt(this.look);

    // Late in the candle the light warms and sinks a little; a lost mobile dims.
    this.key.color.copy(COOL).lerp(AMBER, this.warmth);
    this.key.intensity = 2.2 * (1 - 0.18 * this.warmth) * (1 - 0.45 * this.dim);
    this.hemi.intensity = 1.9 * (1 - 0.35 * this.dim);
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

// A blurred band of shadow, darkest at the top, for under the shelf.
function shade() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 128;
  const g = c.getContext('2d');
  const v = g.createLinearGradient(0, 0, 0, 128);
  v.addColorStop(0, 'rgba(70, 55, 35, 0.26)');
  v.addColorStop(0.35, 'rgba(70, 55, 35, 0.1)');
  v.addColorStop(1, 'rgba(70, 55, 35, 0)');
  g.fillStyle = v;
  g.fillRect(0, 0, 64, 128);
  const h = g.createLinearGradient(0, 0, 64, 0);
  h.addColorStop(0, 'rgba(0,0,0,1)');
  h.addColorStop(0.18, 'rgba(0,0,0,0)');
  h.addColorStop(0.82, 'rgba(0,0,0,0)');
  h.addColorStop(1, 'rgba(0,0,0,1)');
  g.globalCompositeOperation = 'destination-out';
  g.fillStyle = h;
  g.fillRect(0, 0, 64, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
