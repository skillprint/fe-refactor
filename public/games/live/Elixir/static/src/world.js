// The stage: renderer and bloom, one light rig every workshop re-aims, the
// room of the moment (rooms.js), a fade between rooms, the shelf of served
// potions, and a camera that keeps the vessel, its tap and the recipe in frame
// at any size.

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { buildRoom, WALL_Z } from './rooms.js';
import { shapeOf, glassGeometry, liquidGeometry, corkGeometry, corkY, FOOT } from './vessels.js';
import { contactShadow } from './textures.js';

export { WALL_Z };

const TROPHY_H = 0.42;   // a served potion's height on the shelf
const TROPHY_STEP = 0.32;
const FADE_OUT = 0.28, FADE_IN = 0.45;

export class World {
  constructor(canvas) {
    this.canvas = canvas;
    const renderer = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }));
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#06070c');
    this.scene.fog = new THREE.Fog('#07070c', 9, 22);
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
    this.target = new THREE.Vector3(0.4, 1.4, 0);
    this.portrait = false;
    this.t = 0;
    this.exposure = 1.05;
    this.fade = null;
    this.room = null;
    this.frameSpec = { y1: 2.62, spoutY: 2.2, half: 0.4 };

    // One rig for every room: the same light count keeps every shader compiled.
    this.hemi = new THREE.HemisphereLight('#2a3358', '#24160c', 0.55);
    this.key = new THREE.DirectionalLight('#a9c1ff', 0.9);
    this.points = [0, 1, 2].map(() => new THREE.PointLight('#ffa45a', 2, 7, 1.6));
    this.scene.add(this.hemi, this.key, this.key.target, ...this.points);

    this.trophies = new THREE.Group();
    this.scene.add(this.trophies);
    this.trophyCache = new Map();
    this.shadowTex = contactShadow();

    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.5, 0.78);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    this.resize();
  }

  /**
   * Builds this workshop's room and turns the rig, palette and environment to
   * it. `rng` varies what's on the shelves and where things grow.
   */
  setWorkshop(ws, rng) {
    if (this.room) {
      this.scene.remove(this.room.group);
      this.room.dispose();
    }
    this.ws = ws;
    const L = ws.light;
    this.scene.background.set(L.background);
    this.scene.fog.color.set(L.fog[0]);
    this.scene.fog.near = L.fog[1];
    this.scene.fog.far = L.fog[2];
    this.exposure = L.exposure;
    if (!this.fade) this.renderer.toneMappingExposure = L.exposure;
    [this.bloom.strength, this.bloom.radius, this.bloom.threshold] = L.bloom;
    this.hemi.color.set(L.hemi[0]);
    this.hemi.groundColor.set(L.hemi[1]);
    this.hemi.intensity = L.hemi[2];
    this.key.color.set(L.key[0]);
    this.key.intensity = L.key[1];
    this.key.position.set(...L.key[2]);
    this.key.target.position.set(...L.key[3]);
    this.points.forEach((p, i) => {
      const [color, intensity, at] = L.points[i];
      p.color.set(color);
      p.position.set(...at);
      p.userData.base = intensity;
      p.intensity = intensity;
    });
    this.environment(ws.env);
    this.room = buildRoom(ws, rng);
    this.scene.add(this.room.group);
    this.scaleMotes();
    this.layoutTrophies();
  }

  // A small dark room with the workshop's warm and cool lights baked into an
  // environment map, so glass and metal catch the right highlights.
  environment(env) {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const s = new THREE.Scene();
    const disposables = [];
    const add = (geo, color, pos, look) => {
      const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
      const m = new THREE.Mesh(geo, mat);
      if (pos) m.position.set(...pos);
      if (look) m.lookAt(0, 1.2, 0);
      s.add(m);
      disposables.push(geo, mat);
    };
    const hot = (hex, k) => new THREE.Color(hex).multiplyScalar(k);
    add(new THREE.SphereGeometry(10, 32, 16), new THREE.Color(env.room));
    for (const [hex, k, pos, size] of env.blobs) add(new THREE.SphereGeometry(size, 16, 8), hot(hex, k), pos);
    const [wh, wk, wp, wr] = env.window;
    add(new THREE.CircleGeometry(wr, 32), hot(wh, wk), wp, true);
    for (const [hex, k, pos] of env.strips) add(new THREE.PlaneGeometry(0.7, 6), hot(hex, k), pos, true);
    const old = this.scene.environment;
    this.scene.environment = pmrem.fromScene(s, 0.035).texture;
    old?.dispose();
    pmrem.dispose();
    for (const d of disposables) d.dispose();
  }

  /** Fades to dark, runs `swap` there, and fades back up. */
  transition(swap) {
    this.fade = { t: 0, swap, swapped: false };
  }

  get fading() { return Boolean(this.fade); }

  /**
   * What the camera must keep in view for this vessel and tap: `y1` the top on
   * wide screens, `spoutY` (tall screens crop just above the spout), and the
   * vessel's half-width.
   */
  setFrame(spec) {
    this.frameSpec = spec;
    this.fit(undefined, true);
  }

  // ---------------------------------------------------------------------------
  // Served potions on the room's shelf.

  /**
   * Sets a served potion on the shelf, newest on the right, in its own vessel's shape.
   * @param {{vessel?: string, bands: Array<{color: string, from: number, to: number}>}} t from/to are fractions of its full line
   */
  addTrophy(t, glowing = false) {
    const s = shapeOf(t.vessel || 'flask');
    const k = TROPHY_H / s.rimY;
    let geo = this.trophyCache.get(s.id);
    if (!geo) {
      geo = { glass: glassGeometry(s), liquid: liquidGeometry(s), cork: corkGeometry(s) };
      this.trophyCache.set(s.id, geo);
    }
    const g = new THREE.Group();
    const shell = new THREE.Mesh(geo.glass, new THREE.MeshStandardMaterial({ color: '#dfe8ff', transparent: true, opacity: 0.22, roughness: 0.05, envMapIntensity: 2.5, depthWrite: false }));
    shell.renderOrder = 2;
    g.add(shell);
    for (const b of t.bands) {
      const h = Math.max(0.002, (b.to - b.from) * s.h);
      const c = new THREE.Color(b.color);
      const m = new THREE.Mesh(geo.liquid, new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: glowing ? 0.9 : 0.55, roughness: 0.35 }));
      m.position.y = s.yOf(b.from);
      m.scale.set(0.985, h, 0.985);
      g.add(m);
    }
    const cork = new THREE.Mesh(geo.cork, new THREE.MeshStandardMaterial({ color: '#8a6440', roughness: 0.9 }));
    cork.position.y = corkY(s);
    g.add(cork);
    g.scale.setScalar(k);
    g.userData.k = k;
    this.trophies.add(g);
    while (this.trophies.children.length > 15) {
      const old = this.trophies.children[0];
      this.trophies.remove(old);
      old.traverse((o) => { if (o.material) o.material.dispose(); });
    }
    this.layoutTrophies();
    return g;
  }

  // Only as many as the shelf holds show, newest last.
  layoutTrophies() {
    const sh = this.room?.trophyShelf;
    if (!sh) return;
    const cap = Math.max(1, Math.floor((sh.x1 - sh.x0) / TROPHY_STEP));
    const kids = this.trophies.children;
    const first = Math.max(0, kids.length - cap);
    kids.forEach((g, i) => {
      g.visible = i >= first;
      const slot = i - first;
      g.position.set(sh.x0 + TROPHY_STEP / 2 + slot * TROPHY_STEP, sh.y - FOOT * g.userData.k, sh.z);
    });
  }

  /** Where the next served potion will stand, in world space. */
  nextTrophySpot() {
    const sh = this.room.trophyShelf;
    const cap = Math.max(1, Math.floor((sh.x1 - sh.x0) / TROPHY_STEP));
    const i = Math.min(this.trophies.children.length, cap - 1);
    return new THREE.Vector3(sh.x0 + TROPHY_STEP / 2 + i * TROPHY_STEP, sh.y, sh.z);
  }

  /** A dark pool on the bench under something standing at (x, z), kept across rooms. */
  shadow(x, z, rx, rz = rx, opacity = 0.8) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(rx * 2, rz * 2), new THREE.MeshBasicMaterial({ map: this.shadowTex, transparent: true, depthWrite: false, opacity }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.004, z);
    this.scene.add(m);
    return m;
  }

  // ---------------------------------------------------------------------------

  scaleMotes() {
    const m = this.room?.motes;
    if (!m) return;
    // As three's PointsMaterial does: size in world units at the drawing buffer's scale.
    m.material.uniforms.uScale.value = this.renderer.getDrawingBufferSize(new THREE.Vector2()).y / 2;
  }

  resize() {
    const w = this.canvas.clientWidth || innerWidth, h = this.canvas.clientHeight || innerHeight;
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    this.bloom.resolution.set(w / 2, h / 2);
    this.camera.aspect = w / h;
    this.portrait = w / h < 0.95;
    this.width = w;
    this.height = h;
    this.scaleMotes();
    this.fit(undefined, true);
  }

  /**
   * Aims the camera so the framed box fills the space the HUD leaves.
   * Margins are in CSS pixels; the camera glides there unless `snap`.
   * Tall screens frame only the vessel and the spout's tip, for the most
   * pixels per percent of the flask.
   */
  fit(margins = this.margins || { top: 70, bottom: 130, left: 18, right: 18 }, snap = false) {
    this.margins = margins;
    const f = this.frameSpec;
    const box = this.portrait
      ? { x0: -f.half - 0.3, x1: f.half + 0.3, y0: -0.06, y1: f.spoutY + 0.12 }
      : { x0: margins.noCard ? -f.half - 0.3 : -2.5, x1: 2.4, y0: -0.06, y1: Math.max(f.y1, 2.1) };
    const cam = this.camera;
    const w = this.width, h = this.height;
    const { top, bottom, left = 18, right = 18 } = margins;
    const usableH = Math.max(140, h - top - bottom) / h;
    const usableW = Math.max(140, w - left - right) / w;
    const tanV = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const bw = box.x1 - box.x0, bh = box.y1 - box.y0;
    const dist = Math.max(bh / 2 / (tanV * usableH), bw / 2 / (tanV * cam.aspect * usableW));
    const halfH = dist * tanV, halfW = halfH * cam.aspect;
    // Shift the aim so the box sits centred between the bars, not the screen.
    const aimX = (box.x0 + box.x1) / 2 - ((left - right) / 2 / w) * 2 * halfW;
    const aimY = (box.y0 + box.y1) / 2 + ((top - bottom) / 2 / h) * 2 * halfH;
    this.goal = { target: new THREE.Vector3(aimX, aimY, 0), home: new THREE.Vector3(aimX, aimY + dist * 0.12, dist) };
    this.pxPerUnit = (h * usableH) / bh;
    if (snap || !this.home) {
      this.target.copy(this.goal.target);
      this.home = this.goal.home.clone();
    }
    cam.updateProjectionMatrix();
  }

  update(dt) {
    this.t += dt;
    const t = this.t;
    const flick = this.ws?.light.flicker ?? 0.1;
    this.points.forEach((p, i) => {
      const n = Math.sin(t * 9.1 + i * 7) * 0.5 + Math.sin(t * 23.7 + i * 3.1) * 0.3 + Math.sin(t * 3.3 + i) * 0.2;
      p.intensity = (p.userData.base ?? 1) * (1 - flick + flick * n);
    });
    this.room?.update(t, this.camera);
    if (this.fade) {
      const f = this.fade;
      f.t += dt;
      if (!f.swapped) {
        const k = Math.min(1, f.t / FADE_OUT);
        this.renderer.toneMappingExposure = this.exposure * (1 - k);
        if (k >= 1) { f.swapped = true; f.t = 0; f.swap?.(); }
      } else {
        const k = Math.min(1, f.t / FADE_IN);
        this.renderer.toneMappingExposure = this.exposure * k * k * (3 - 2 * k);
        if (k >= 1) this.fade = null;
      }
    }
    if (this.goal) {
      const k = this.fade ? 1 : 1 - Math.exp(-dt * 3.5);
      this.target.lerp(this.goal.target, k);
      this.home.lerp(this.goal.home, k);
    }
    // A slow breath of parallax so the glass highlights move a little.
    if (this.home) {
      this.camera.position.set(this.home.x + Math.sin(t * 0.13) * 0.06, this.home.y + Math.sin(t * 0.17) * 0.03, this.home.z);
      this.camera.lookAt(this.target);
    }
  }

  render() {
    this.composer.render();
  }
}
