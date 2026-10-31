// The six workshops' rooms. Each builder fills a Room with walls, a window or
// an opening on its sky, the props that carry its lights, shelves whose
// contents vary with the potion's seed, its particles, and the shelf where
// served potions stand. Lights themselves belong to the World (one fixed rig,
// so changing rooms never recompiles a shader); a room only places props
// where the workshop's data puts them.

import * as THREE from 'three';
import { stone, wood, rock, planks, fabric, rug, starChart, piercedBrass, leaf, contactShadow } from './textures.js';
import { flameMaterial, motes } from './materials.js';

export const WALL_Z = -2.2;
const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);

class Room {
  constructor(ws, rng) {
    this.ws = ws;
    this.rng = rng;
    this.group = new THREE.Group();
    this.timed = [];     // materials with a uTime uniform
    this.flames = [];    // billboards that face the camera
    this.spin = [];      // [object, axis, speed]
    this.trophyShelf = null;
    this.textures = [];
  }

  add(...o) { this.group.add(...o); return o[0]; }
  at(i) { return V(...this.ws.light.points[i][2]); }
  r(a, b) { return a + (b - a) * this.rng(); }
  pick(list) { return list[Math.floor(this.rng() * list.length)]; }

  mesh(geo, mat, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    return this.add(m);
  }

  shadow(x, z, rx, rz = rx, opacity = 0.8) {
    if (!Room.shadowTex) Room.shadowTex = contactShadow();
    const m = this.mesh(new THREE.PlaneGeometry(rx * 2, rz * 2), new THREE.MeshBasicMaterial({ map: Room.shadowTex, transparent: true, depthWrite: false, opacity }), x, 0.004, z);
    m.rotation.x = -Math.PI / 2;
    return m;
  }

  bench(mat, apron = '#2a1a10') {
    this.mesh(new THREE.BoxGeometry(10, 0.2, 3.2), mat, 0.4, -0.1, -0.6);
    this.mesh(new THREE.PlaneGeometry(10, 2.4), new THREE.MeshStandardMaterial({ color: apron, roughness: 0.9, envMapIntensity: 0.1 }), 0.4, -1.4, 0.99);
  }

  /** A wall at WALL_Z, with optional holes (THREE.Path) for windows. */
  wall(mat, holes = [], uvScale = [3, 1.7]) {
    const shape = new THREE.Shape();
    shape.moveTo(-7, -1); shape.lineTo(7, -1); shape.lineTo(7, 7); shape.lineTo(-7, 7); shape.closePath();
    shape.holes.push(...holes);
    const geo = new THREE.ShapeGeometry(shape, 64);
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, ((uv.getX(i) + 7) / 14) * uvScale[0], ((uv.getY(i) + 1) / 8) * uvScale[1]);
    return this.mesh(geo, mat, 0, 0, WALL_Z);
  }

  plank(mat, x, y, width, z = WALL_Z + 0.22, depth = 0.44, brackets = true) {
    this.mesh(new THREE.BoxGeometry(width, 0.08, depth), mat, x, y, z);
    if (brackets) for (const bx of [x - width / 2 + 0.25, x + width / 2 - 0.25]) this.mesh(new THREE.BoxGeometry(0.06, 0.26, 0.3), mat, bx, y - 0.17, z - 0.07);
  }

  sky(fragmentShader, x, y, z, w, h) {
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: SKY_HEAD + fragmentShader,
    });
    this.timed.push(mat);
    return this.mesh(new THREE.PlaneGeometry(w, h), mat, x, y, z);
  }

  /** A soft shaft of light from `from` to `to`. */
  beam(from, to, r0, r1, color, strength) {
    const len = from.distanceTo(to);
    const m = this.mesh(new THREE.CylinderGeometry(r0, r1, len, 40, 1, true), new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(color) }, uK: { value: strength } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: `varying vec3 vN; varying vec3 vV; varying float vY;
        void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vY = uv.y; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying vec3 vN; varying vec3 vV; varying float vY; uniform vec3 uColor; uniform float uK;
        void main() { float facing = pow(abs(dot(vN, vV)), 2.2); float fade = smoothstep(0.0, 0.5, vY) * smoothstep(1.0, 0.85, vY); gl_FragColor = vec4(uColor * facing * fade * uK, 1.0); }`,
    }));
    m.position.copy(from).add(to).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), from.clone().sub(to).normalize());
    return m;
  }

  candle(x, z, h, r, wax = '#efe0c2') {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.96, r, h, 24), new THREE.MeshStandardMaterial({ color: wax, roughness: 0.55, emissive: '#3a2410', emissiveIntensity: 0.6, envMapIntensity: 0.4 }));
    body.position.y = h / 2;
    g.add(body);
    const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.05, 6), new THREE.MeshBasicMaterial({ color: '#120c08' }));
    wick.position.y = h + 0.02;
    g.add(wick);
    g.position.set(x, 0, z);
    this.add(g);
    this.flame(V(x, h + 0.1, z), 0.13, 0.3);
    this.shadow(x, z, r * 3.2, r * 3.2, 0.6);
  }

  flame(p, w, h, core, body) {
    const mat = flameMaterial(core, body);
    this.timed.push(mat);
    const f = this.mesh(new THREE.PlaneGeometry(w, h), mat, p.x, p.y, p.z);
    this.flames.push(f);
    return f;
  }

  /** Old stock: bottles of every shape, tinted, half full of something dim. */
  bottles(xs, y, z, palette) {
    const shapes = {
      round: [[0, 0], [0.11, 0], [0.16, 0.06], [0.17, 0.13], [0.14, 0.22], [0.05, 0.27], [0.045, 0.38], [0.055, 0.4], [0, 0.4]],
      tall: [[0, 0], [0.07, 0], [0.075, 0.02], [0.075, 0.32], [0.04, 0.38], [0.03, 0.46], [0.036, 0.48], [0, 0.48]],
      squat: [[0, 0], [0.12, 0], [0.13, 0.03], [0.13, 0.15], [0.09, 0.18], [0.09, 0.21], [0, 0.21]],
      tear: [[0, 0], [0.06, 0], [0.1, 0.06], [0.11, 0.14], [0.07, 0.24], [0.03, 0.3], [0.03, 0.36], [0, 0.36]],
    };
    const tints = ['#2f5a3a', '#5a3a1e', '#24345e', '#4a2448', '#5d5220', '#3a3a3a'];
    const cork = new THREE.MeshStandardMaterial({ color: '#8a6440', roughness: 0.9 });
    for (const x of xs) {
      const kind = this.pick(Object.keys(shapes));
      const s = 0.8 + this.rng() * 0.45;
      const pts = shapes[kind].map(([a, b]) => new THREE.Vector2(a * s, b * s));
      const g = new THREE.Group();
      const shell = new THREE.Mesh(new THREE.LatheGeometry(pts, 24), new THREE.MeshStandardMaterial({ color: this.pick(tints), transparent: true, opacity: 0.45, roughness: 0.08, metalness: 0.1, envMapIntensity: 2.2, depthWrite: false }));
      shell.renderOrder = 2;
      g.add(shell);
      const fill = 0.3 + this.rng() * 0.5;
      const inner = pts.map((p) => new THREE.Vector2(Math.max(0, p.x - 0.012), p.y)).filter((p) => p.y <= pts[pts.length - 1].y * fill);
      if (inner.length > 1) {
        inner.push(new THREE.Vector2(0, inner[inner.length - 1].y));
        const c = new THREE.Color(this.pick(palette)).multiplyScalar(0.35);
        g.add(new THREE.Mesh(new THREE.LatheGeometry(inner, 20), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.3, roughness: 0.3 })));
      }
      const top = pts[pts.length - 2];
      const ck = new THREE.Mesh(new THREE.CylinderGeometry(top.x * 0.95, top.x * 0.8, 0.06, 10), cork);
      ck.position.y = top.y + 0.02;
      g.add(ck);
      g.position.set(x, y, z + (this.rng() - 0.5) * 0.12);
      g.rotation.y = this.rng() * 6;
      this.add(g);
    }
  }

  /** Evenly spread x positions with a little jitter. */
  spread(x0, x1, step) {
    const xs = [];
    for (let x = x0 + this.r(0, step * 0.4); x < x1; x += step * (0.85 + this.rng() * 0.35)) xs.push(x);
    return xs;
  }

  particles(opts) {
    const p = motes(opts);
    this.timed.push(p.material);
    this.motes = p;
    return this.add(p);
  }

  update(t, camera) {
    for (const m of this.timed) m.uniforms.uTime.value = t;
    for (const f of this.flames) f.quaternion.copy(camera.quaternion);
    for (const [o, axis, sp] of this.spin) o.rotation[axis] = t * sp;
  }

  dispose() {
    this.group.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) for (const m of [].concat(o.material)) {
        for (const k of ['map', 'bumpMap', 'emissiveMap', 'alphaMap']) if (m[k] && m[k] !== Room.shadowTex) m[k].dispose();
        m.dispose();
      }
    });
  }
}

// ---------------------------------------------------------------------------
// Skies seen through windows.

const SKY_HEAD = /* glsl */`
  varying vec2 vUv;
  uniform float uTime;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
  float stars(vec2 uv, float density, float cut) {
    vec2 g = uv * density;
    float h = hash(floor(g));
    return step(cut, h) * smoothstep(0.3, 0.0, length(fract(g) - 0.5)) * (0.6 + 0.4 * sin(uTime * (1.0 + h * 3.0) + h * 50.0));
  }
`;

const NIGHT_SKY = /* glsl */`
  void main() {
    vec2 uv = vUv;
    vec3 col = mix(vec3(0.03, 0.045, 0.11), vec3(0.004, 0.008, 0.03), smoothstep(0.0, 1.0, uv.y));
    col += vec3(0.8, 0.85, 1.0) * stars(uv, 90.0, 0.985) * 1.4;
    vec2 mc = vec2(0.6, 0.45);
    float d = length(uv - mc);
    float disc = smoothstep(0.062, 0.056, d);
    float mare = fbm((uv - mc) * 14.0 + 3.0);
    vec3 moon = vec3(0.92, 0.9, 0.82) * (0.7 + 0.34 * smoothstep(0.35, 0.75, mare));
    col += vec3(0.12, 0.17, 0.36) * exp(-d * 9.0) * 0.7 + vec3(0.3, 0.34, 0.5) * exp(-d * 34.0) * 0.4;
    col = mix(col, moon, disc);
    float c = fbm(vec2(uv.x * 2.4 + uTime * 0.012, uv.y * 6.0));
    float band = smoothstep(0.55, 0.85, c) * smoothstep(0.15, 0.4, uv.y) * smoothstep(0.95, 0.6, uv.y);
    col = mix(col, mix(vec3(0.05, 0.06, 0.1), vec3(0.55, 0.6, 0.8), exp(-d * 5.0)), band * 0.75);
    gl_FragColor = vec4(col, 1.0);
  }`;

const SPACE_SKY = /* glsl */`
  void main() {
    vec2 uv = vUv;
    vec3 col = vec3(0.006, 0.008, 0.03);
    // The Milky Way: a diagonal river of dust and stars.
    float along = dot(uv - 0.5, normalize(vec2(1.0, 0.55)));
    float across = dot(uv - 0.5, normalize(vec2(-0.55, 1.0)));
    float river = exp(-across * across * 28.0);
    float dust = fbm(uv * 7.0 + vec2(uTime * 0.004, 0.0));
    col += vec3(0.16, 0.14, 0.3) * river * (0.5 + dust);
    col -= vec3(0.06) * river * smoothstep(0.55, 0.75, fbm(uv * 13.0 + 5.0));
    // Nebulae, violet and teal.
    float n1 = fbm(uv * 3.0 + vec2(1.3, 0.2));
    col += vec3(0.32, 0.08, 0.38) * smoothstep(0.55, 0.85, n1) * exp(-length(uv - vec2(0.3, 0.65)) * 3.0) * 1.6;
    col += vec3(0.04, 0.26, 0.3) * smoothstep(0.5, 0.85, fbm(uv * 3.4 + 7.0)) * exp(-length(uv - vec2(0.72, 0.4)) * 3.0) * 1.6;
    col += vec3(0.85, 0.9, 1.0) * (stars(uv, 140.0, 0.982) * 1.2 + stars(uv, 60.0, 0.99) * 2.0 + stars(uv + 0.37, 260.0, 0.97) * river * 0.9);
    // A ringed planet.
    vec2 pc = vec2(0.66, 0.6);
    vec2 q = uv - pc;
    float pd = length(q);
    float planet = smoothstep(0.045, 0.042, pd);
    vec3 pcol = mix(vec3(0.85, 0.66, 0.42), vec3(0.6, 0.42, 0.3), 0.5 + 0.5 * sin(q.y * 160.0)) * (0.55 + 0.6 * smoothstep(0.04, -0.03, q.x + q.y * 0.4));
    vec2 rq = mat2(0.94, -0.34, 0.34, 0.94) * q;
    float ring = smoothstep(0.004, 0.0, abs(length(rq * vec2(1.0, 3.6)) - 0.07)) + 0.6 * smoothstep(0.003, 0.0, abs(length(rq * vec2(1.0, 3.6)) - 0.082));
    float front = step(0.0, -rq.y) + step(0.045, pd);
    col = mix(col, pcol, planet);
    col += vec3(0.8, 0.7, 0.55) * ring * min(1.0, front) * 0.9;
    gl_FragColor = vec4(col, 1.0);
  }`;

const DAWN_SKY = /* glsl */`
  void main() {
    vec2 uv = vUv;
    vec3 col = mix(vec3(1.0, 0.62, 0.36), vec3(0.98, 0.52, 0.56), smoothstep(0.25, 0.5, uv.y));
    col = mix(col, vec3(0.42, 0.42, 0.72), smoothstep(0.5, 0.95, uv.y));
    // The sun, low on the right.
    vec2 sc = vec2(0.78, 0.33);
    float d = length((uv - sc) * vec2(1.0, 1.1));
    col += vec3(1.6, 1.0, 0.45) * exp(-d * 7.0) * 0.8;
    col = mix(col, vec3(2.4, 1.9, 1.2), smoothstep(0.05, 0.044, d));
    // Pink-lit cloud streaks.
    float c = fbm(vec2(uv.x * 3.0 + uTime * 0.006, uv.y * 9.0));
    col = mix(col, vec3(1.0, 0.7, 0.66) * 1.1, smoothstep(0.58, 0.82, c) * smoothstep(0.35, 0.6, uv.y) * 0.6);
    // Hills, hazy with distance.
    float h1 = 0.24 + 0.05 * fbm(vec2(uv.x * 3.0, 1.0));
    float h2 = 0.17 + 0.06 * fbm(vec2(uv.x * 5.0 + 4.0, 2.0));
    col = mix(col, vec3(0.72, 0.5, 0.52), step(uv.y, h1) * 0.8);
    col = mix(col, vec3(0.32, 0.36, 0.3), step(uv.y, h2));
    gl_FragColor = vec4(col, 1.0);
  }`;

const SNOW_SKY = /* glsl */`
  void main() {
    vec2 uv = vUv;
    vec3 col = mix(vec3(0.06, 0.09, 0.2), vec3(0.01, 0.02, 0.06), smoothstep(0.1, 1.0, uv.y));
    col += vec3(0.8, 0.85, 1.0) * stars(uv, 80.0, 0.988) * 0.8 * smoothstep(0.5, 0.8, uv.y);
    // Snowy ground and dark pines.
    float ground = 0.22 + 0.04 * fbm(vec2(uv.x * 3.0, 0.5));
    col = mix(col, vec3(0.62, 0.7, 0.9), step(uv.y, ground));
    for (int i = 0; i < 7; i++) {
      float fi = float(i);
      float x = fract(0.13 + fi * 0.157);
      float hgt = 0.18 + 0.12 * fract(fi * 0.71);
      vec2 p = uv - vec2(x, ground - 0.01);
      float tri = step(abs(p.x) * 3.2, hgt - p.y) * step(0.0, p.y);
      col = mix(col, vec3(0.03, 0.06, 0.09), tri);
      col = mix(col, vec3(0.7, 0.78, 0.95), tri * step(0.6, fract(p.y * 18.0)) * 0.4);
    }
    // Falling snow, three layers.
    for (int k = 0; k < 3; k++) {
      float fk = float(k);
      vec2 g = uv * (18.0 + fk * 14.0) + vec2(sin(uTime * 0.3 + fk) * 0.6, uTime * (0.9 + fk * 0.5));
      vec2 id = floor(g);
      float h = hash(id + fk * 13.0);
      vec2 f = fract(g) - vec2(0.5 + 0.3 * sin(h * 40.0 + uTime), 0.5);
      col += vec3(0.9, 0.95, 1.0) * step(0.55, h) * smoothstep(0.12 - fk * 0.025, 0.0, length(f)) * (0.9 - fk * 0.2);
    }
    // Frost creeping in from the pane's edges.
    vec2 e = min(uv, 1.0 - uv);
    float edge = min(e.x, e.y);
    float frost = smoothstep(0.14, 0.0, edge + 0.05 * (fbm(uv * 26.0) - 0.5));
    col = mix(col, vec3(0.72, 0.82, 0.95), frost * 0.75);
    gl_FragColor = vec4(col, 1.0);
  }`;

const DUSK_SKY = /* glsl */`
  void main() {
    vec2 uv = vUv;
    vec3 col = mix(vec3(0.98, 0.5, 0.3), vec3(0.55, 0.3, 0.52), smoothstep(0.18, 0.5, uv.y));
    col = mix(col, vec3(0.1, 0.1, 0.28), smoothstep(0.5, 1.0, uv.y));
    col += vec3(0.9, 0.9, 1.0) * stars(uv, 70.0, 0.985) * smoothstep(0.6, 0.9, uv.y);
    // The evening star.
    col += vec3(1.4, 1.3, 1.1) * smoothstep(0.012, 0.0, length(uv - vec2(0.35, 0.72)));
    // Dunes in two ranges.
    float d1 = 0.22 + 0.06 * sin(uv.x * 7.0 + 1.0) + 0.03 * sin(uv.x * 17.0);
    float d2 = 0.14 + 0.05 * sin(uv.x * 5.0 + 3.0) + 0.02 * sin(uv.x * 23.0 + 1.0);
    col = mix(col, vec3(0.62, 0.32, 0.26), step(uv.y, d1));
    col = mix(col, mix(vec3(0.45, 0.2, 0.14), vec3(0.85, 0.5, 0.3), smoothstep(-0.02, 0.02, uv.y - d2 + 0.03)), step(uv.y, d2));
    gl_FragColor = vec4(col, 1.0);
  }`;

// ---------------------------------------------------------------------------

const BUILD = {
  alcove(R) {
    const win = V(1.85, 2.66, WALL_Z), wr = 0.7;
    const s = stone();
    const hole = new THREE.Path();
    hole.absarc(win.x, win.y, wr, 0, Math.PI * 2, true);
    R.wall(new THREE.MeshStandardMaterial({ map: s.map, bumpMap: s.bump, bumpScale: 2.2, roughness: 0.95, color: '#c8b8a8', envMapIntensity: 0.15 }), [hole]);
    const reveal = R.mesh(new THREE.CylinderGeometry(wr, wr, 0.18, 64, 1, true), new THREE.MeshStandardMaterial({ map: s.map, color: '#8a7e74', roughness: 1, side: THREE.BackSide, envMapIntensity: 0.1, emissive: '#3a4a70', emissiveIntensity: 0.55 }), win.x, win.y, WALL_Z - 0.09);
    reveal.rotation.x = Math.PI / 2;
    const iron = new THREE.MeshStandardMaterial({ color: '#1a1714', metalness: 0.7, roughness: 0.5 });
    R.mesh(new THREE.TorusGeometry(wr - 0.02, 0.045, 12, 96), iron, win.x, win.y, WALL_Z - 0.16);
    for (const rot of [0, Math.PI / 2]) R.mesh(new THREE.BoxGeometry(wr * 2, 0.035, 0.035), iron, win.x, win.y, WALL_Z - 0.16).rotation.z = rot;
    R.sky(NIGHT_SKY, win.x - 0.3, win.y + 0.2, WALL_Z - 0.9, 4, 4);
    const from = win.clone().add(V(0, 0, -0.2)), to = V(-0.05, -0.1, 0.5);
    R.beam(from, to, wr * 0.95, 1.25, '#7393f2', 0.055);
    const w = wood([96, 62, 38]);
    R.bench(new THREE.MeshStandardMaterial({ map: w.map, bumpMap: w.bump, bumpScale: 1.5, roughness: 0.72, envMapIntensity: 0.35 }));
    // Candles: three carry the rig's lights, two are just for company.
    const p = [0, 1, 2].map((i) => R.at(i));
    R.candle(p[0].x, p[0].z, p[0].y - 0.16, 0.075);
    R.candle(p[1].x, p[1].z, p[1].y - 0.16, 0.085);
    R.candle(p[2].x, p[2].z, p[2].y - 0.16, 0.09);
    R.candle(2.75, -0.3, R.r(0.3, 0.45), 0.07);
    R.candle(-0.85, -1.15, R.r(0.5, 0.7), 0.07);
    const w2 = wood([70, 46, 30]);
    const shelfMat = new THREE.MeshStandardMaterial({ map: w2.map, roughness: 0.8, envMapIntensity: 0.25 });
    R.trophyShelf = { x0: 0.62, x1: 3.3, y: win.y - wr - 0.12, z: WALL_Z + 0.25 };
    R.plank(shelfMat, 1.98, R.trophyShelf.y - 0.04, 2.9);
    R.plank(shelfMat, -2.1, 2.3, 3.4);
    R.bottles(R.spread(-3.6, -0.6, 0.32), 2.34, WALL_Z + 0.24, R.ws.ingredients.map((x) => x.glow));
    R.particles({ count: 260, color: '#bcd0ff', size: 0.028, opacity: 0.55, place: () => { const k = Math.random(); const q = from.clone().lerp(to, k); const r = (0.7 + 0.5 * k) * Math.sqrt(Math.random()); const a = Math.random() * 6.28; return q.add(V(Math.cos(a) * r, Math.sin(a) * r * 0.7, Math.sin(a) * r * 0.5)); } });
  },

  observatory(R) {
    const wx = 0.95, wy = 1.3, ww = 1.15, arch = 2.6;
    const s = stone();
    const hole = new THREE.Path();
    hole.moveTo(wx - ww, wy); hole.lineTo(wx + ww, wy); hole.lineTo(wx + ww, arch);
    hole.absarc(wx, arch, ww, 0, Math.PI, false);
    hole.lineTo(wx - ww, wy);
    R.wall(new THREE.MeshStandardMaterial({ map: s.map, bumpMap: s.bump, bumpScale: 2.2, roughness: 0.95, color: '#7a86b0', envMapIntensity: 0.2 }), [hole]);
    R.sky(SPACE_SKY, wx, 2.6, WALL_Z - 0.8, 4.2, 4.2);
    // Iron tracery: the arch, mullions and a transom.
    const iron = new THREE.MeshStandardMaterial({ color: '#15161c', metalness: 0.7, roughness: 0.45 });
    const archCurve = new THREE.CatmullRomCurve3(Array.from({ length: 33 }, (_, i) => { const a = (Math.PI * i) / 32; return V(wx + Math.cos(a) * ww, arch + Math.sin(a) * ww, WALL_Z - 0.04); }));
    R.mesh(new THREE.TubeGeometry(archCurve, 64, 0.04, 8), iron);
    for (const dx of [-ww, -ww / 3, ww / 3, ww]) R.mesh(new THREE.BoxGeometry(0.05, arch - wy + (Math.abs(dx) < ww ? Math.sqrt(ww * ww - dx * dx) : 0), 0.05), iron, wx + dx, (wy + arch + (Math.abs(dx) < ww ? Math.sqrt(ww * ww - dx * dx) : 0)) / 2, WALL_Z - 0.04);
    R.mesh(new THREE.BoxGeometry(ww * 2, 0.045, 0.05), iron, wx, 2.1, WALL_Z - 0.04);
    R.beam(V(wx, 2.6, WALL_Z - 0.3), V(0.1, -0.1, 0.6), 1.0, 1.4, '#6a7cff', 0.04);
    const w = wood([62, 40, 34]);
    R.bench(new THREE.MeshStandardMaterial({ map: w.map, bumpMap: w.bump, bumpScale: 1.2, roughness: 0.6, color: '#b0a0c0', envMapIntensity: 0.4 }), '#14121c');
    // The sill takes served potions.
    const sillMat = new THREE.MeshStandardMaterial({ map: s.map, color: '#9aa4c8', roughness: 0.9 });
    R.trophyShelf = { x0: wx - ww + 0.05, x1: wx + ww + 0.6, y: wy, z: WALL_Z + 0.22 };
    R.mesh(new THREE.BoxGeometry(ww * 2 + 0.9, 0.08, 0.5), sillMat, wx + 0.25, wy - 0.04, WALL_Z + 0.2);
    // A brass telescope on its tripod, aimed at the window.
    const brass = new THREE.MeshStandardMaterial({ color: '#c9a04e', metalness: 1, roughness: 0.28, envMapIntensity: 1.3 });
    const hub = V(2.75, 1.05, -1.35);
    for (const a of [0.3, 2.4, 4.4]) R.add(rodBetween(hub, V(hub.x + Math.cos(a) * 0.5, 0, hub.z + Math.sin(a) * 0.38), 0.02, brass));
    const tube = new THREE.Group();
    tube.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.075, 1.9, 28), brass));
    for (const y of [-0.8, -0.2, 0.5, 0.85]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.1 - (y + 0.95) * 0.012, 0.014, 8, 28), brass); r.rotation.x = Math.PI / 2; r.position.y = y; tube.add(r); }
    const eye = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.2, 16), brass);
    eye.position.y = -1.04;
    tube.add(eye);
    tube.position.copy(hub);
    tube.quaternion.setFromUnitVectors(V(0, 1, 0), V(-0.42, 0.85, -0.3).normalize());
    R.add(tube);
    // An armillary sphere turning slowly on the bench.
    const arm = new THREE.Group();
    for (const [rx, rz] of [[Math.PI / 2, 0], [0.4, 0.3], [-0.3, 1.2]]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.008, 6, 48), brass); r.rotation.set(rx, 0, rz); arm.add(r); }
    arm.add(new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 12), new THREE.MeshStandardMaterial({ color: '#4a6aff', emissive: '#2a3aff', emissiveIntensity: 0.6 })));
    arm.position.set(2.1, 0.5, -0.5);
    R.add(arm);
    R.spin.push([arm, 'y', 0.25]);
    R.add(rodBetween(V(2.1, 0, -0.5), V(2.1, 0.3, -0.5), 0.015, brass));
    R.mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.03, 20), brass, 2.1, 0.015, -0.5);
    R.shadow(2.1, -0.5, 0.25);
    // A star chart on the wall.
    const chart = R.mesh(new THREE.CircleGeometry(0.5, 48), new THREE.MeshStandardMaterial({ map: starChart(), roughness: 0.9, emissive: '#ffffff', emissiveIntensity: 0.12 }), -2.55, 2.45, WALL_Z + 0.02);
    chart.material.emissiveMap = chart.material.map;
    // Globe lamps carry the rig's first two lights.
    for (const i of [0, 1]) {
      const p = R.at(i);
      R.mesh(new THREE.SphereGeometry(0.085, 24, 16), new THREE.MeshStandardMaterial({ color: '#dfe6ff', emissive: R.ws.light.points[i][0], emissiveIntensity: 2.2 }), p.x, p.y, p.z);
      R.add(rodBetween(V(p.x, 0, p.z), V(p.x, p.y - 0.08, p.z), 0.012, brass));
      R.mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.03, 16), brass, p.x, 0.015, p.z);
      R.shadow(p.x, p.z, 0.2);
    }
    R.bottles(R.spread(-3.6, -0.8, 0.34), 2.34, WALL_Z + 0.24, R.ws.ingredients.map((x) => x.glow));
    R.plank(new THREE.MeshStandardMaterial({ map: w.map, roughness: 0.7, color: '#a090b0' }), -2.2, 2.3, 3.0);
    R.particles({ count: 220, color: '#c8d8ff', size: 0.022, twinkle: 0.9, opacity: 0.8, place: () => V(R.r(-3, 3), R.r(0.4, 3), R.r(-2, 0.6)) });
  },

  greenhouse(R) {
    // The back is all glass: a white iron grid over the dawn.
    R.sky(DAWN_SKY, 0.6, 1.9, WALL_Z - 1.2, 11, 6);
    const white = new THREE.MeshStandardMaterial({ color: '#e8e4dc', roughness: 0.5, metalness: 0.3 });
    for (let x = -4.5; x <= 4.6; x += 0.78) R.mesh(new THREE.BoxGeometry(0.045, 6, 0.05), white, x, 2.5, WALL_Z);
    for (const y of [0.55, 1.45, 2.35, 3.25]) R.mesh(new THREE.BoxGeometry(10, 0.04, 0.05), white, 0, y, WALL_Z);
    const pane = R.mesh(new THREE.PlaneGeometry(10, 6), new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.06, roughness: 0.05, envMapIntensity: 1.5, depthWrite: false }), 0, 2.5, WALL_Z + 0.01);
    pane.renderOrder = 1;
    for (const [x, k] of [[2.6, 1], [1.2, 0.7], [3.6, 0.6]]) R.beam(V(x + 1.4, 3.6, WALL_Z - 0.2), V(x - 1.2, -0.1, 0.4), 0.25, 0.6, '#ffb070', 0.05 * k);
    const w = wood([150, 112, 76]);
    const benchMat = new THREE.MeshStandardMaterial({ map: w.map, bumpMap: w.bump, bumpScale: 1.4, roughness: 0.8, envMapIntensity: 0.3 });
    R.bench(benchMat, '#3a2a1c');
    R.trophyShelf = { x0: 1.05, x1: 3.4, y: 1.42, z: WALL_Z + 0.3 };
    R.plank(benchMat, 2.25, 1.38, 2.6, WALL_Z + 0.3, 0.44);
    const clay = new THREE.MeshStandardMaterial({ color: '#b8603a', roughness: 0.85 });
    const leafTex = leaf();
    const leafMat = new THREE.MeshStandardMaterial({ map: leafTex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.7, color: '#d8f0c0' });
    const leafGeo = new THREE.PlaneGeometry(0.09, 0.18);
    leafGeo.translate(0, 0.09, 0);
    const pot = (x, y, z, r) => R.mesh(new THREE.LatheGeometry([[0, 0], [r * 0.7, 0], [r, r * 1.3], [r * 1.12, r * 1.3], [r * 1.12, r * 1.5], [0, r * 1.5]].map(([a, b]) => new THREE.Vector2(a, b)), 24), clay, x, y, z);
    const leaves = (count, place) => {
      const inst = new THREE.InstancedMesh(leafGeo, leafMat, count);
      const d = new THREE.Object3D();
      for (let i = 0; i < count; i++) { place(d, i); d.updateMatrix(); inst.setMatrixAt(i, d.matrix); }
      R.add(inst);
    };
    // Potted plants on the bench and the shelf.
    for (const [x, z, r] of [[-0.8, -1.35, 0.17], [2.35, -0.9, 0.14], [1.65, -1.75, 0.12]]) {
      const y0 = 0;
      pot(x, y0, z, r);
      R.shadow(x, z, r * 2.2);
      const top = y0 + r * 1.45;
      leaves(26, (d, i) => { const a = R.r(0, 6.28), up = R.r(0.25, 1.2); d.position.set(x + Math.cos(a) * r * 0.3, top, z + Math.sin(a) * r * 0.3); d.rotation.set(0, -a + Math.PI / 2, 0); d.rotateX(-(Math.PI / 2 - up)); const s = R.r(1.2, 2.4) * r * 6; d.scale.set(s, s, s); });
    }
    // Hanging pots with trailing vines.
    for (const [x, y, z] of [[-1.15, R.r(2.6, 2.8), -1.2], [1.75, R.r(2.75, 2.95), -1.35]]) {
      pot(x, y, z, 0.14);
      for (const a of [0, 2.1, 4.2]) R.add(rodBetween(V(x + Math.cos(a) * 0.15, y + 0.2, z + Math.sin(a) * 0.15), V(x, y + 0.9, z), 0.004, white));
      for (let k = 0; k < 4; k++) {
        const a = R.r(0, 6.28), len = R.r(0.5, 1.1);
        const sx = x + Math.cos(a) * 0.15, sz = z + Math.sin(a) * 0.15;
        leaves(16, (d, i) => { const t = i / 15; d.position.set(sx + Math.cos(a) * t * 0.12, y + 0.18 - t * len, sz + Math.sin(a) * t * 0.12); d.rotation.set(R.r(-0.6, 0.6), R.r(0, 6.28), Math.PI + R.r(-0.5, 0.5)); const s = R.r(0.8, 1.3) * (1 - t * 0.4); d.scale.set(s, s, s); });
      }
      leaves(14, (d) => { const a = R.r(0, 6.28); d.position.set(x, y + 0.2, z); d.rotation.set(0, a, 0); d.rotateX(-R.r(0.3, 1.1)); d.scale.setScalar(R.r(1, 1.6)); });
    }
    R.particles({ count: 200, color: '#ffd890', size: 0.03, opacity: 0.6, twinkle: 0.3, place: () => V(R.r(-3, 3.2), R.r(0.3, 3), R.r(-1.9, 0.6)) });
  },

  cavern(R) {
    const r = rock([74, 80, 106]);
    const rockMat = new THREE.MeshStandardMaterial({ map: r.map, bumpMap: r.bump, bumpScale: 4, roughness: 0.95, color: '#9aa0bc', envMapIntensity: 0.3 });
    const back = new THREE.PlaneGeometry(14, 9, 90, 60);
    const p = back.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      p.setZ(i, 0.35 * Math.sin(x * 1.3 + Math.sin(y * 0.9) * 1.5) * Math.cos(y * 1.1) + 0.12 * Math.sin(x * 4.1 + y * 3.3) + R.r(-0.02, 0.02));
    }
    back.computeVertexNormals();
    R.mesh(back, rockMat, 0, 2.5, WALL_Z - 0.3);
    for (const [x, y, z, s] of [[-3.4, 0.4, -0.4, 0.9], [3.5, 0.3, -0.2, 0.8], [-3, 2.8, -1.6, 1.0], [3.3, 3.0, -1.6, 0.9]]) {
      const b = R.mesh(new THREE.IcosahedronGeometry(s, 1), new THREE.MeshStandardMaterial({ map: r.map, bumpMap: r.bump, bumpScale: 3, roughness: 0.95, color: '#8a90a8', flatShading: true }), x, y, z);
      b.scale.set(1, R.r(0.8, 1.4), 1);
      b.rotation.set(R.r(0, 3), R.r(0, 3), 0);
    }
    R.bench(new THREE.MeshStandardMaterial({ map: r.map, bumpMap: r.bump, bumpScale: 2, roughness: 0.85, color: '#c0c4d8', envMapIntensity: 0.4 }), '#0c0d14');
    R.trophyShelf = { x0: 0.75, x1: 3.2, y: 1.42, z: WALL_Z + 0.22 };
    const ledge = R.mesh(new THREE.BoxGeometry(2.8, 0.14, 0.55, 8, 1, 2), new THREE.MeshStandardMaterial({ map: r.map, bumpMap: r.bump, bumpScale: 3, roughness: 0.9, color: '#a8aec8', flatShading: true }), 2.0, 1.35, WALL_Z + 0.2);
    const lp = ledge.geometry.attributes.position;
    for (let i = 0; i < lp.count; i++) if (lp.getY(i) < 0) lp.setY(i, lp.getY(i) - R.r(0, 0.12));
    ledge.geometry.computeVertexNormals();
    // Crystal clusters: the two big ones carry the rig's lights.
    const shard = (len, rad) => new THREE.LatheGeometry([[0, 0], [rad, len * 0.15], [rad * 1.05, len * 0.82], [rad * 0.55, len], [0, len]].map(([a, b]) => new THREE.Vector2(a, b)), 6);
    const mats = {};
    const crystalMat = (c) => (mats[c] ||= new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.85, roughness: 0.12, metalness: 0.1, transparent: true, opacity: 0.9, flatShading: true }));
    const cluster = (x, y, z, size, color, n, up = V(0, 1, 0)) => {
      for (let i = 0; i < n; i++) {
        const len = size * R.r(0.4, 1), rad = size * R.r(0.07, 0.14);
        const m = R.mesh(shard(len, rad), crystalMat(color), x + R.r(-0.2, 0.2) * size, y, z + R.r(-0.15, 0.15) * size);
        const dir = up.clone().add(V(R.r(-0.7, 0.7), 0, R.r(-0.5, 0.5))).normalize();
        m.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
        m.rotateY(R.r(0, 3));
      }
    };
    const pts = [0, 1, 2].map((i) => R.at(i));
    cluster(pts[0].x, 0, pts[0].z, 1.1, '#3fd8ff', 9);
    cluster(pts[1].x, 0, pts[1].z, 1.0, '#d060ff', 8);
    cluster(pts[2].x, 3.25, pts[2].z, 0.6, '#5fffc0', 7, V(0, -1, 0.1));
    for (let k = 0; k < 5; k++) cluster(R.pick([-1, 1]) * R.r(1.3, 3), 0, R.r(-1.9, -0.9), R.r(0.25, 0.45), R.pick(['#3fd8ff', '#d060ff', '#7a8cff']), 4);
    R.shadow(pts[0].x, pts[0].z, 0.6);
    R.shadow(pts[1].x, pts[1].z, 0.55);
    R.particles({ count: 240, color: '#9ae8ff', size: 0.026, twinkle: 1, opacity: 0.85, place: () => V(R.r(-3, 3), R.r(0.2, 3), R.r(-2, 0.6)) });
  },

  cottage(R) {
    const wx = 1.75, wy = 2.35, half = 0.62;
    const pl = planks([112, 82, 60]);
    const hole = new THREE.Path();
    hole.moveTo(wx - half, wy - half); hole.lineTo(wx + half, wy - half); hole.lineTo(wx + half, wy + half); hole.lineTo(wx - half, wy + half); hole.lineTo(wx - half, wy - half);
    R.wall(new THREE.MeshStandardMaterial({ map: pl.map, bumpMap: pl.bump, bumpScale: 1.6, roughness: 0.8, envMapIntensity: 0.2 }), [hole], [4, 1.6]);
    R.sky(SNOW_SKY, wx, wy, WALL_Z - 0.35, half * 2, half * 2);
    const frameMat = new THREE.MeshStandardMaterial({ color: '#3a2414', roughness: 0.75 });
    for (const [x, y, w, h] of [[wx, wy - half, half * 2 + 0.16, 0.1], [wx, wy + half, half * 2 + 0.16, 0.1], [wx - half, wy, 0.1, half * 2], [wx + half, wy, 0.1, half * 2], [wx, wy, 0.05, half * 2], [wx, wy, half * 2, 0.05]]) R.mesh(new THREE.BoxGeometry(w, h, 0.12), frameMat, x, y, WALL_Z - 0.02);
    R.beam(V(wx, wy, WALL_Z - 0.3), V(0.2, -0.1, 0.5), 0.6, 1.0, '#7090e0', 0.035);
    // A beam overhead with herbs drying on it.
    const beamMat = new THREE.MeshStandardMaterial({ color: '#2a1a10', roughness: 0.8 });
    R.mesh(new THREE.BoxGeometry(10, 0.28, 0.3), beamMat, 0, 3.25, -1.0);
    // Bundles of drying herbs: leaves hung head-down from a string.
    const herbMat = new THREE.MeshStandardMaterial({ map: leaf(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.85, color: '#c8b878' });
    const herbGeo = new THREE.PlaneGeometry(0.07, 0.2);
    herbGeo.translate(0, -0.1, 0);
    const xs = R.spread(-3.2, 0.4, 0.5);
    const herbs = new THREE.InstancedMesh(herbGeo, herbMat, xs.length * 10);
    const d = new THREE.Object3D();
    xs.forEach((x, b) => {
      const top = 3.0 - R.r(0, 0.12);
      R.mesh(new THREE.CylinderGeometry(0.003, 0.003, 3.11 - top, 4), beamMat, x, (3.11 + top) / 2, -1.0);
      R.mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.04, 8), new THREE.MeshStandardMaterial({ color: '#8a6a40' }), x, top, -1.0);
      for (let i = 0; i < 10; i++) {
        d.position.set(x, top, -1.0);
        d.rotation.set(R.r(-0.35, 0.35), R.r(0, 6.28), R.r(-0.35, 0.35));
        d.scale.setScalar(R.r(0.9, 1.5));
        d.updateMatrix();
        herbs.setMatrixAt(b * 10 + i, d.matrix);
      }
    });
    R.add(herbs);
    // The fireplace on the left, its glow the rig's first light.
    const s = stone();
    const stoneMat = new THREE.MeshStandardMaterial({ map: s.map, bumpMap: s.bump, bumpScale: 2, roughness: 0.95, color: '#b0a090' });
    const fx = -3.0;
    R.mesh(new THREE.BoxGeometry(0.5, 2.4, 0.9), stoneMat, fx - 0.75, 1.0, -1.2);
    R.mesh(new THREE.BoxGeometry(0.5, 2.4, 0.9), stoneMat, fx + 0.75, 1.0, -1.2);
    R.mesh(new THREE.BoxGeometry(2.0, 0.7, 0.9), stoneMat, fx, 2.05, -1.2);
    R.mesh(new THREE.BoxGeometry(2.3, 0.1, 1.0), beamMat, fx, 2.42, -1.15);
    R.mesh(new THREE.BoxGeometry(1.0, 1.4, 0.1), new THREE.MeshBasicMaterial({ color: '#140804' }), fx, 0.7, -1.6);
    const glow = R.mesh(new THREE.PlaneGeometry(1.0, 0.9), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 0.55, 0.12), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }), fx, 0.45, -1.5);
    glow.renderOrder = 2;
    for (const [dx, h] of [[-0.2, 0.55], [0.05, 0.75], [0.25, 0.5]]) R.flame(V(fx + dx, 0.36, -1.35), 0.32, h, [5.5, 3.6, 1.8], [3.6, 1.2, 0.25]);
    const log = new THREE.MeshStandardMaterial({ color: '#3a2214', roughness: 0.9, emissive: '#5a1a04', emissiveIntensity: 0.4 });
    for (const [rz, dz] of [[1.45, 0], [1.7, 0.12]]) { const l = R.mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.8, 10), log, fx, 0.1, -1.35 + dz); l.rotation.z = rz; }
    const w = wood([88, 54, 32]);
    R.bench(new THREE.MeshStandardMaterial({ map: w.map, bumpMap: w.bump, bumpScale: 1.6, roughness: 0.75, envMapIntensity: 0.3 }), '#1e120a');
    R.trophyShelf = { x0: wx - half - 0.6, x1: wx + half + 0.9, y: wy - half - 0.06, z: WALL_Z + 0.2 };
    R.plank(frameMat, wx + 0.15, wy - half - 0.1, half * 2 + 1.6, WALL_Z + 0.2, 0.4);
    // A candle and an oil lamp carry the rig's other lights.
    const c = R.at(2);
    R.candle(c.x, c.z, c.y - 0.16, 0.06, '#f4e8d8');
    const l = R.at(1);
    const brass = new THREE.MeshStandardMaterial({ color: '#c79a4a', metalness: 1, roughness: 0.3 });
    R.mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.12, 20), brass, l.x, 0.06, l.z);
    const chimney = R.mesh(new THREE.LatheGeometry([[0.05, 0], [0.08, 0.08], [0.06, 0.22], [0.04, 0.3]].map(([a, b]) => new THREE.Vector2(a, b)), 20), new THREE.MeshStandardMaterial({ color: '#fff4e0', transparent: true, opacity: 0.25, depthWrite: false, roughness: 0.05 }), l.x, 0.12, l.z);
    chimney.renderOrder = 2;
    R.flame(V(l.x, 0.24, l.z), 0.08, 0.18);
    R.shadow(l.x, l.z, 0.3);
    R.bottles(R.spread(-1.9, -0.9, 0.3), 0, -1.6, R.ws.ingredients.map((x) => x.glow));
    R.particles({ count: 120, color: '#ff9a40', size: 0.03, mode: 'rise', span: 2.2, speed: 0.9, opacity: 0.9, twinkle: 0.4, place: () => V(fx + R.r(-0.4, 0.4), R.r(0.2, 0.5), R.r(-1.4, -0.9)) });
  },

  desert(R) {
    const f = fabric();
    const wallGeo = new THREE.PlaneGeometry(9.2, 8, 160, 1);
    const p = wallGeo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, 0.12 * Math.sin(x * 5.2) + 0.05 * Math.sin(x * 13.1)); }
    wallGeo.computeVertexNormals();
    const cloth = new THREE.MeshStandardMaterial({ map: f, roughness: 0.92, envMapIntensity: 0.15, side: THREE.DoubleSide });
    R.mesh(wallGeo, cloth, -2.4, 3, WALL_Z);
    R.mesh(wallGeo.clone(), cloth, 8.4, 3, WALL_Z);
    // The open flap on the right shows the dunes at dusk.
    R.sky(DUSK_SKY, 3.1, 1.8, WALL_Z - 1.6, 5, 4.4);
    for (const [x, rot] of [[2.25, 0.5], [3.95, -0.5]]) {
      const flap = R.mesh(new THREE.PlaneGeometry(0.7, 4, 8, 1), cloth, x, 2.2, WALL_Z + 0.15);
      flap.rotation.y = rot;
    }
    const sag = R.mesh(new THREE.PlaneGeometry(12, 3, 1, 1), cloth, 0.4, 3.6, -0.8);
    sag.rotation.x = Math.PI / 2.4;
    // A low table under a kilim.
    R.bench(new THREE.MeshStandardMaterial({ map: rug(), roughness: 0.95, envMapIntensity: 0.1 }), '#5a1612');
    const brass = new THREE.MeshStandardMaterial({ color: '#d0a040', metalness: 1, roughness: 0.3, envMapIntensity: 1.2 });
    // Pierced lanterns hang where the rig's lights are.
    const pierced = piercedBrass();
    for (const i of [0, 1]) {
      const q = R.at(i);
      const body = R.mesh(new THREE.LatheGeometry([[0, -0.26], [0.1, -0.24], [0.17, -0.1], [0.17, 0.08], [0.1, 0.2], [0.05, 0.26], [0, 0.3]].map(([a, b]) => new THREE.Vector2(a, b)), 24), new THREE.MeshStandardMaterial({ color: '#8a6420', metalness: 0.8, roughness: 0.4, emissive: '#ffaa50', emissiveMap: pierced, emissiveIntensity: 2.4 }), q.x, q.y, q.z);
      body.rotation.y = R.r(0, 3);
      R.mesh(new THREE.SphereGeometry(0.07, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 1.8, 0.7) }), q.x, q.y, q.z);
      R.add(rodBetween(V(q.x, q.y + 0.3, q.z), V(q.x, 4.2, q.z), 0.008, brass));
    }
    // A tray with cups, and a little oil lamp: the rig's third light.
    const t = R.at(2);
    R.mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.025, 36), brass, t.x - 0.25, 0.0125, t.z - 0.1);
    for (const [dx, dz] of [[-0.4, -0.15], [-0.15, 0.05]]) R.mesh(new THREE.LatheGeometry([[0, 0], [0.05, 0], [0.06, 0.08], [0.065, 0.09], [0, 0.09]].map(([a, b]) => new THREE.Vector2(a, b)), 16), new THREE.MeshStandardMaterial({ color: '#2a6a8a', roughness: 0.3, metalness: 0.2 }), t.x + dx, 0.025, t.z + dz);
    const lamp = R.mesh(new THREE.SphereGeometry(0.09, 20, 12), brass, t.x, 0.07, t.z);
    lamp.scale.set(1.5, 0.6, 1);
    R.add(rodBetween(V(t.x + 0.1, 0.08, t.z), V(t.x + 0.2, 0.12, t.z), 0.014, brass));
    R.flame(V(t.x + 0.21, 0.19, t.z), 0.07, 0.16);
    R.shadow(t.x - 0.2, t.z - 0.1, 0.45);
    // Clay jars at the back.
    const clay = new THREE.MeshStandardMaterial({ color: '#a8603a', roughness: 0.85 });
    for (const x of R.spread(-3.4, -0.9, 0.45)) {
      const s = R.r(0.7, 1.2);
      R.mesh(new THREE.LatheGeometry([[0, 0], [0.1, 0], [0.2, 0.15], [0.19, 0.35], [0.08, 0.48], [0.07, 0.55], [0.09, 0.58], [0, 0.58]].map(([a, b]) => new THREE.Vector2(a * s, b * s)), 24), clay, x, 0, R.r(-1.9, -1.5));
    }
    R.trophyShelf = { x0: 0.5, x1: 2.05, y: 1.32, z: WALL_Z + 0.32 };
    const shelfWood = new THREE.MeshStandardMaterial({ color: '#5a3018', roughness: 0.75 });
    R.plank(shelfWood, 1.25, 1.28, 1.8, WALL_Z + 0.32, 0.4);
    R.particles({ count: 200, color: '#ffc880', size: 0.026, opacity: 0.5, twinkle: 0.2, speed: 0.6, place: () => V(R.r(-3, 3.2), R.r(0.2, 3), R.r(-1.9, 0.6)) });
  },
};

function rodBetween(a, b, r, mat) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, a.distanceTo(b), 10), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize());
  return m;
}

/** The room for a workshop; `rng` is the potion's seeded random, for what varies within it. */
export function buildRoom(ws, rng) {
  const room = new Room(ws, rng);
  (BUILD[ws.room] || BUILD.alcove)(room);
  return room;
}

/**
 * The stand the recipe card rests in, by card style: an easel, a framed
 * slate, or a scroll on its rollers. The page mesh is `.page`.
 */
export function cardStand(style, texture) {
  const g = new THREE.Group();
  const page = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.9),
    new THREE.MeshStandardMaterial({ map: texture, roughness: 0.95, emissive: '#ffffff', emissiveMap: texture, emissiveIntensity: style === 'slate' ? 0.45 : 0.3, envMapIntensity: 0.15 }),
  );
  page.position.y = 1.02;
  g.add(page);
  const woodMat = new THREE.MeshStandardMaterial({ color: style === 'scroll' ? '#5a3018' : '#4a2f1c', roughness: 0.8 });
  const ledge = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.06, 0.1), woodMat);
  ledge.position.set(0, 0.06, 0.04);
  g.add(ledge);
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.9, 0.04), woodMat);
  leg.position.set(0, 0.92, -0.22);
  leg.rotation.x = -0.2;
  g.add(leg);
  if (style === 'slate') {
    for (const [x, y, w, h] of [[0, 1.02 + 0.97, 1.6, 0.07], [0, 1.02 - 0.97, 1.6, 0.07], [-0.78, 1.02, 0.07, 2.0], [0.78, 1.02, 0.07, 2.0]]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.05), new THREE.MeshStandardMaterial({ color: '#6a4426', roughness: 0.7 }));
      b.position.set(x, y, 0.01);
      g.add(b);
    }
  } else if (style === 'scroll') {
    const brass = new THREE.MeshStandardMaterial({ color: '#d0a040', metalness: 1, roughness: 0.3 });
    for (const y of [1.02 + 0.96, 1.02 - 0.96]) {
      const r = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.66, 16), woodMat);
      r.rotation.z = Math.PI / 2;
      r.position.set(0, y, 0.03);
      g.add(r);
      for (const x of [-0.86, 0.86]) {
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), brass);
        cap.position.set(x, y, 0.03);
        g.add(cap);
      }
    }
  }
  g.userData.page = page;
  return g;
}
