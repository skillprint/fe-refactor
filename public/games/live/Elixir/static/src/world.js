// The alcove: renderer and bloom, a round window on a moonlit sky, candles,
// shelves of old bottles, the bench, and a camera that keeps the flask and
// the recipe in frame at any size.

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { stone, wood, dot, contactShadow } from './textures.js';
import { LIQUIDS } from './look.js';

export const WALL_Z = -2.2;
const WINDOW = new THREE.Vector3(1.85, 2.66, WALL_Z);
const WINDOW_R = 0.7;

// What the camera must keep in view, at z = 0: the flask and its tap, the
// sill of served potions to the right and, on wide screens, the recipe card
// standing to the left (unless a panel is covering it).
const FRAME_WIDE = { x0: -2.5, x1: 2.4, y0: -0.06, y1: 2.62 };
const FRAME_NO_CARD = { x0: -0.75, x1: 2.4, y0: -0.06, y1: 2.62 };
const FRAME_TALL = { x0: -0.62, x1: 0.82, y0: -0.06, y1: 2.62 };

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
    this.updaters = [];

    this.environment();
    this.room();
    this.window();
    this.candles();
    this.shelves();
    this.dust();

    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.5, 0.78);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    this.resize();
  }

  // A small dark room with warm candle blobs and a cool window, baked into an
  // environment map, so glass and brass catch the right lights.
  environment() {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const env = new THREE.Scene();
    const room = new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.MeshBasicMaterial({ color: '#120d0a', side: THREE.BackSide }));
    env.add(room);
    const blob = (color, pos, size) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(size, 16, 8), new THREE.MeshBasicMaterial({ color }));
      m.position.copy(pos);
      env.add(m);
    };
    blob(new THREE.Color(7, 4, 1.7), new THREE.Vector3(-3, 0.6, 3.5), 0.35);
    blob(new THREE.Color(6, 3.4, 1.4), new THREE.Vector3(3.6, 0.8, -1.5), 0.3);
    blob(new THREE.Color(5, 3, 1.2), new THREE.Vector3(-3.2, 1.6, -2.5), 0.3);
    // The window, cool and broad.
    const win = new THREE.Mesh(new THREE.CircleGeometry(1.4, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.2, 1.6, 2.6) }));
    win.position.set(2.5, 3.2, -5);
    win.lookAt(0, 1, 0);
    env.add(win);
    // A tall soft strip in front, for the long highlight down a glass cylinder.
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.3, 1.1, 0.9), side: THREE.DoubleSide }));
    strip.position.set(-3.5, 1.5, 5);
    strip.lookAt(0, 1.5, 0);
    env.add(strip);
    const strip2 = strip.clone();
    strip2.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.9, 0.7, 0.5), side: THREE.DoubleSide });
    strip2.position.set(4, 1.5, 4);
    strip2.lookAt(0, 1.5, 0);
    env.add(strip2);
    this.scene.environment = pmrem.fromScene(env, 0.035).texture;
    pmrem.dispose();
  }

  room() {
    const s = stone();
    const wallMat = new THREE.MeshStandardMaterial({ map: s.map, bumpMap: s.bump, bumpScale: 2.2, roughness: 0.95, color: '#c8b8a8', envMapIntensity: 0.15 });
    const shape = new THREE.Shape();
    shape.moveTo(-7, -1); shape.lineTo(7, -1); shape.lineTo(7, 7); shape.lineTo(-7, 7); shape.closePath();
    const hole = new THREE.Path();
    hole.absarc(WINDOW.x, WINDOW.y, WINDOW_R, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const wallGeo = new THREE.ShapeGeometry(shape, 64);
    // ShapeGeometry's UVs are in shape units; scale them onto the texture.
    const uv = wallGeo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) + 7) / 14 * 3, (uv.getY(i) + 1) / 8 * 1.7);
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.z = WALL_Z;
    this.scene.add(wall);

    // The window's deep stone reveal.
    const reveal = new THREE.Mesh(new THREE.CylinderGeometry(WINDOW_R, WINDOW_R, 0.18, 64, 1, true), new THREE.MeshStandardMaterial({ map: s.map, color: '#8a7e74', roughness: 1, side: THREE.BackSide, envMapIntensity: 0.1, emissive: '#3a4a70', emissiveIntensity: 0.55 }));
    reveal.rotation.x = Math.PI / 2;
    reveal.position.set(WINDOW.x, WINDOW.y, WALL_Z - 0.09);
    this.scene.add(reveal);
    const iron = new THREE.MeshStandardMaterial({ color: '#1a1714', metalness: 0.7, roughness: 0.5 });
    const frame = new THREE.Mesh(new THREE.TorusGeometry(WINDOW_R - 0.02, 0.045, 12, 96), iron);
    frame.position.set(WINDOW.x, WINDOW.y, WALL_Z - 0.16);
    this.scene.add(frame);
    for (const rot of [0, Math.PI / 2]) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(WINDOW_R * 2, 0.035, 0.035), iron);
      bar.position.set(WINDOW.x, WINDOW.y, WALL_Z - 0.16);
      bar.rotation.z = rot;
      this.scene.add(bar);
    }

    // The bench.
    const w = wood([96, 62, 38]);
    const bench = new THREE.Mesh(new THREE.BoxGeometry(10, 0.2, 3.2), new THREE.MeshStandardMaterial({ map: w.map, bumpMap: w.bump, bumpScale: 1.5, roughness: 0.72, envMapIntensity: 0.35 }));
    bench.position.set(0.4, -0.1, -0.6);
    // Its front, falling away into the dark below.
    const apron = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.4), new THREE.MeshStandardMaterial({ color: '#2a1a10', roughness: 0.9, envMapIntensity: 0.1 }));
    apron.position.set(0.4, -1.4, 0.99);
    this.scene.add(apron);
    this.scene.add(bench);

    this.shadowTex = contactShadow();

    const hemi = new THREE.HemisphereLight('#2a3358', '#24160c', 0.55);
    this.scene.add(hemi);
    const moon = new THREE.DirectionalLight('#a9c1ff', 0.9);
    moon.position.copy(WINDOW).add(new THREE.Vector3(-0.6, 1.2, -2));
    moon.target.position.set(0.4, 0, 0.5);
    this.scene.add(moon, moon.target);
  }

  /** A dark pool on the bench under something standing at (x, z). */
  shadow(x, z, rx, rz = rx, opacity = 0.8) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(rx * 2, rz * 2), new THREE.MeshBasicMaterial({ map: this.shadowTex, transparent: true, depthWrite: false, opacity }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.004, z);
    this.scene.add(m);
    return m;
  }

  // The sky through the round window: stars, drifting cloud and a big moon.
  window() {
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */`
        varying vec2 vUv;
        uniform float uTime;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
        }
        float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
        void main() {
          vec2 uv = vUv;
          vec3 top = vec3(0.004, 0.008, 0.03), low = vec3(0.03, 0.045, 0.11);
          vec3 col = mix(low, top, smoothstep(0.0, 1.0, uv.y));
          // Stars.
          vec2 g = uv * 90.0;
          float h = hash(floor(g));
          float star = step(0.985, h) * smoothstep(0.3, 0.0, length(fract(g) - 0.5)) * (0.6 + 0.4 * sin(uTime * (1.0 + h * 3.0) + h * 50.0));
          col += vec3(0.8, 0.85, 1.0) * star * 1.4;
          // The moon, a little above centre, with a halo.
          vec2 mc = vec2(0.6, 0.45);
          float d = length(uv - mc);
          float r = 0.062;
          float disc = smoothstep(r, r - 0.006, d);
          float mare = fbm((uv - mc) * 14.0 + 3.0);
          vec3 moon = vec3(0.92, 0.9, 0.82) * (0.7 + 0.34 * smoothstep(0.35, 0.75, mare));
          col += vec3(0.12, 0.17, 0.36) * exp(-d * 9.0) * 0.7 + vec3(0.3, 0.34, 0.5) * exp(-d * 34.0) * 0.4;
          col = mix(col, moon, disc);
          // Cloud wisps drifting across, silvered near the moon.
          float c = fbm(vec2(uv.x * 2.4 + uTime * 0.012, uv.y * 6.0));
          float band = smoothstep(0.55, 0.85, c) * smoothstep(0.15, 0.4, uv.y) * smoothstep(0.95, 0.6, uv.y);
          vec3 cloud = mix(vec3(0.05, 0.06, 0.1), vec3(0.55, 0.6, 0.8), exp(-d * 5.0));
          col = mix(col, cloud, band * 0.75);
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    this.sky = mat;
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), mat);
    sky.position.set(WINDOW.x - 0.3, WINDOW.y + 0.2, WALL_Z - 0.9);
    this.scene.add(sky);

    // A faint shaft of moonlight from the window down onto the bench.
    const from = WINDOW.clone().add(new THREE.Vector3(0, 0, -0.2));
    const to = new THREE.Vector3(-0.05, -0.1, 0.5);
    const len = from.distanceTo(to);
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(WINDOW_R * 0.95, 1.25, len, 48, 1, true),
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        vertexShader: /* glsl */`
          varying vec3 vN; varying vec3 vV; varying float vY;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vY = uv.y;
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */`
          varying vec3 vN; varying vec3 vV; varying float vY;
          void main() {
            float facing = pow(abs(dot(vN, vV)), 2.2);
            float fade = smoothstep(0.0, 0.5, vY) * smoothstep(1.0, 0.85, vY);
            gl_FragColor = vec4(vec3(0.45, 0.58, 0.95) * facing * fade * 0.055, 1.0);
          }`,
      }),
    );
    beam.position.copy(from).add(to).multiplyScalar(0.5);
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), from.clone().sub(to).normalize());
    this.scene.add(beam);
    this.beam = { from, to };
  }

  candles() {
    const wax = new THREE.MeshStandardMaterial({ color: '#efe0c2', roughness: 0.55, emissive: '#3a2410', emissiveIntensity: 0.6, envMapIntensity: 0.4 });
    const flameMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */`
        varying vec2 vUv; uniform float uTime; uniform float uPhase;
        void main() {
          vec2 p = vUv - vec2(0.5, 0.18);
          float sway = sin(uTime * 7.0 + uPhase) * 0.05 + sin(uTime * 13.0 + uPhase * 2.0) * 0.025;
          p.x -= sway * pow(max(p.y, 0.0), 1.4) * 3.0;
          p.x *= 2.6 + p.y * 2.0;
          float r = length(vec2(p.x, max(p.y, 0.0) * 0.55 + min(p.y, 0.0) * 1.8));
          float body = smoothstep(0.32, 0.0, r);
          float core = smoothstep(0.12, 0.0, length(vec2(p.x * 1.4, (p.y - 0.06) * 0.9)));
          vec3 col = vec3(3.2, 1.25, 0.32) * body + vec3(5.0, 3.6, 2.2) * core;
          float blue = smoothstep(0.08, 0.0, length(vec2(p.x, p.y + 0.06))) * 0.6;
          col += vec3(0.2, 0.35, 1.2) * blue;
          gl_FragColor = vec4(col * body, 1.0);
        }`,
    });
    this.flames = [];
    const make = (x, z, h, r, light) => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.96, r, h, 28), wax);
      body.position.y = h / 2;
      g.add(body);
      const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.05, 6), new THREE.MeshBasicMaterial({ color: '#120c08' }));
      wick.position.y = h + 0.02;
      g.add(wick);
      const mat = flameMat.clone();
      mat.uniforms = { uTime: { value: 0 }, uPhase: { value: Math.random() * 20 } };
      const flame = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.3), mat);
      flame.position.y = h + 0.1;
      g.add(flame);
      g.position.set(x, 0, z);
      this.scene.add(g);
      this.shadow(x, z, r * 3.2, r * 3.2, 0.6);
      let pl = null;
      if (light) {
        pl = new THREE.PointLight('#ffa45a', light, 7, 1.6);
        pl.position.set(x, h + 0.16, z);
        this.scene.add(pl);
      }
      this.flames.push({ flame, light: pl, base: light, phase: Math.random() * 100 });
    };
    make(1.3, 0.55, 0.44, 0.075, 2.4);
    make(2.45, -0.6, 0.8, 0.085, 2.0);
    make(2.75, -0.3, 0.36, 0.07, 0);
    make(-2.85, -1.0, 0.95, 0.09, 2.0);
    make(-0.85, -1.15, 0.62, 0.07, 0);
  }

  shelves() {
    const w = wood([70, 46, 30]);
    const plankMat = new THREE.MeshStandardMaterial({ map: w.map, roughness: 0.8, envMapIntensity: 0.25 });
    const plank = (x, y, width) => {
      const p = new THREE.Mesh(new THREE.BoxGeometry(width, 0.08, 0.44), plankMat);
      p.position.set(x, y, WALL_Z + 0.22);
      this.scene.add(p);
      for (const bx of [x - width / 2 + 0.25, x + width / 2 - 0.25]) {
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.26, 0.3), plankMat);
        b.position.set(bx, y - 0.17, WALL_Z + 0.15);
        this.scene.add(b);
      }
    };
    // Served potions stand on a long sill under the window, in the moonlight;
    // the old stock fills the shelves on the left.
    this.trophyShelf = { x0: 0.62, x1: 3.3, y: WINDOW.y - WINDOW_R - 0.12 };
    plank(1.98, this.trophyShelf.y - 0.04, 2.9);
    plank(-2.1, 2.3, 3.4);
    const glass = (color, opacity = 0.45) => new THREE.MeshStandardMaterial({ color, transparent: true, opacity, roughness: 0.08, metalness: 0.1, envMapIntensity: 2.2, depthWrite: false });
    const corkMat = new THREE.MeshStandardMaterial({ color: '#8a6440', roughness: 0.9 });
    const shapes = {
      round: [[0, 0], [0.11, 0], [0.16, 0.06], [0.17, 0.13], [0.14, 0.22], [0.05, 0.27], [0.045, 0.38], [0.055, 0.4], [0, 0.4]],
      tall: [[0, 0], [0.07, 0], [0.075, 0.02], [0.075, 0.32], [0.04, 0.38], [0.03, 0.46], [0.036, 0.48], [0, 0.48]],
      squat: [[0, 0], [0.12, 0], [0.13, 0.03], [0.13, 0.15], [0.09, 0.18], [0.09, 0.21], [0, 0.21]],
      tear: [[0, 0], [0.06, 0], [0.1, 0.06], [0.11, 0.14], [0.07, 0.24], [0.03, 0.3], [0.03, 0.36], [0, 0.36]],
    };
    const tints = ['#2f5a3a', '#5a3a1e', '#24345e', '#4a2448', '#5d5220', '#3a3a3a'];
    const bottle = (x, y, z, kind, tint, fill, glow) => {
      const pts = shapes[kind].map(([a, b]) => new THREE.Vector2(a, b));
      const g = new THREE.Group();
      const shell = new THREE.Mesh(new THREE.LatheGeometry(pts, 28), glass(tint));
      shell.renderOrder = 2;
      g.add(shell);
      if (fill > 0) {
        const inner = pts.map((p) => new THREE.Vector2(Math.max(0, p.x - 0.012), p.y)).filter((p) => p.y <= pts[pts.length - 1].y * fill);
        inner.push(new THREE.Vector2(0, inner[inner.length - 1].y));
        const liquid = new THREE.Mesh(new THREE.LatheGeometry(inner, 24), new THREE.MeshStandardMaterial({ color: glow, emissive: glow, emissiveIntensity: 0.25, roughness: 0.3 }));
        g.add(liquid);
      }
      const top = pts[pts.length - 2];
      const cork = new THREE.Mesh(new THREE.CylinderGeometry(top.x * 0.95, top.x * 0.8, 0.06, 12), corkMat);
      cork.position.y = top.y + 0.02;
      g.add(cork);
      g.position.set(x, y, z);
      g.rotation.y = Math.random() * 6;
      this.scene.add(g);
    };
    const kinds = Object.keys(shapes);
    const old = Object.values(LIQUIDS).map((l) => new THREE.Color(l.glow).multiplyScalar(0.35));
    let i = 0;
    for (let x = -3.6; x < -0.6; x += 0.3 + Math.random() * 0.14) {
      bottle(x, 2.34, WALL_Z + 0.24 + (Math.random() - 0.5) * 0.12, kinds[i % 4], tints[i % tints.length], 0.3 + Math.random() * 0.5, old[i % old.length]);
      i++;
    }
    this.trophies = new THREE.Group();
    this.scene.add(this.trophies);
  }

  /**
   * Sets a served potion on the lower shelf, newest on the right.
   * @param {Array<{color: string, from: number, to: number}>} bands fractions of the flask
   */
  addTrophy(bands, glowing = false) {
    const slot = this.trophies.children.length;
    const step = 0.27;
    const cap = Math.floor((this.trophyShelf.x1 - this.trophyShelf.x0) / step);
    if (slot >= cap) this.trophies.remove(this.trophies.children[0]);
    const g = new THREE.Group();
    const H = 0.34, R = 0.065;
    const shell = new THREE.Mesh(
      new THREE.LatheGeometry([[0, 0], [R + 0.01, 0], [R + 0.012, 0.015], [R + 0.012, H], [R * 0.55, H + 0.05], [R * 0.5, H + 0.09], [0, H + 0.09]].map(([a, b]) => new THREE.Vector2(a, b)), 24),
      new THREE.MeshStandardMaterial({ color: '#dfe8ff', transparent: true, opacity: 0.22, roughness: 0.05, envMapIntensity: 2.5, depthWrite: false }),
    );
    shell.renderOrder = 2;
    g.add(shell);
    for (const b of bands) {
      const h = Math.max(0.002, (b.to - b.from) * H);
      const c = new THREE.Color(b.color);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(R, R, h, 20), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: glowing ? 0.9 : 0.55, roughness: 0.35 }));
      m.position.y = 0.012 + b.from * H + h / 2;
      g.add(m);
    }
    const cork = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.55, R * 0.45, 0.06, 12), new THREE.MeshStandardMaterial({ color: '#8a6440', roughness: 0.9 }));
    cork.position.y = H + 0.1;
    g.add(cork);
    this.trophies.add(g);
    this.layoutTrophies();
    return g;
  }

  layoutTrophies() {
    this.trophies.children.forEach((g, i) => g.position.set(this.trophyShelf.x0 + 0.14 + i * 0.27, this.trophyShelf.y, WALL_Z + 0.25));
  }

  /** Where the next served potion will stand, in world space. */
  nextTrophySpot() {
    const n = this.trophies.children.length;
    const step = 0.27;
    const cap = Math.floor((this.trophyShelf.x1 - this.trophyShelf.x0) / step);
    const i = Math.min(n, cap - 1);
    return new THREE.Vector3(this.trophyShelf.x0 + 0.14 + i * step, this.trophyShelf.y, WALL_Z + 0.25);
  }

  // Motes turning slowly in the moonbeam.
  dust() {
    const N = 260;
    const pos = new Float32Array(N * 3);
    const seeds = [];
    const { from, to } = this.beam;
    for (let i = 0; i < N; i++) {
      const k = Math.random();
      const p = from.clone().lerp(to, k);
      const r = (0.7 + 0.5 * k) * Math.sqrt(Math.random());
      const a = Math.random() * Math.PI * 2;
      seeds.push({ base: p.add(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r * 0.7, Math.sin(a) * r * 0.5)), ph: Math.random() * 100, sp: 0.2 + Math.random() * 0.5 });
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ size: 0.028, map: dot(), color: '#bcd0ff', transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    this.scene.add(pts);
    this.updaters.push((t) => {
      for (let i = 0; i < N; i++) {
        const s = seeds[i];
        pos[i * 3] = s.base.x + Math.sin(t * 0.13 * s.sp + s.ph) * 0.18;
        pos[i * 3 + 1] = s.base.y + Math.sin(t * 0.09 * s.sp + s.ph * 2) * 0.22;
        pos[i * 3 + 2] = s.base.z + Math.cos(t * 0.11 * s.sp + s.ph) * 0.15;
      }
      geo.attributes.position.needsUpdate = true;
    });
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
    this.fit(undefined, true);
  }

  /**
   * Aims the camera so the framed box fills the space the HUD leaves.
   * Margins are in CSS pixels; the camera glides there unless `snap`.
   */
  fit(margins = this.margins || { top: 70, bottom: 130, left: 18, right: 18 }, snap = false) {
    this.margins = margins;
    const box = this.portrait ? FRAME_TALL : margins.noCard ? FRAME_NO_CARD : FRAME_WIDE;
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
    if (snap || !this.home) {
      this.target.copy(this.goal.target);
      this.home = this.goal.home.clone();
    }
    cam.updateProjectionMatrix();
  }

  update(dt) {
    this.t += dt;
    const t = this.t;
    this.sky.uniforms.uTime.value = t;
    for (const f of this.flames) {
      f.flame.material.uniforms.uTime.value = t;
      f.flame.quaternion.copy(this.camera.quaternion);
      if (f.light) {
        const n = Math.sin(t * 9.1 + f.phase) * 0.5 + Math.sin(t * 23.7 + f.phase * 1.7) * 0.3 + Math.sin(t * 3.3 + f.phase) * 0.2;
        f.light.intensity = f.base * (0.88 + 0.12 * n);
      }
    }
    for (const u of this.updaters) u(t, dt);
    if (this.goal) {
      const k = 1 - Math.exp(-dt * 3.5);
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
