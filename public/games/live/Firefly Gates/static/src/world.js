// The dark wood: sky, mist, the path, the trees either side, and the glow
// that makes it all worth looking at. The path runs down -z forever; trees,
// mushrooms and wild fireflies are recycled ahead of the camera as it goes.

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Rng, clamp, lerp } from './rng.js';

export const PATH_HALF = 4;
// Linear values, matched to the sky at the horizon so the mist and the sky meet without a seam.
const FOG = new THREE.Color().setRGB(0.012, 0.03, 0.045);
const SPAN = 200; // how far ahead the scenery is kept, in world units
const BEHIND = 24;

export const TIME = { value: 0 };
// Pixels per world unit at distance 1, for sizing point sprites in world units.
export const POINT_SCALE = { value: 300 };

const GLSL_NOISE = /* glsl */`
  float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(h21(i), h21(i + vec2(1, 0)), u.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p *= 2.07; a *= 0.5; } return s; }
`;

export class World {
  constructor(canvas) {
    const renderer = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' }));
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = (this.scene = new THREE.Scene());
    scene.background = FOG.clone();
    scene.fog = new THREE.FogExp2(FOG.clone(), 0.02);
    this.camera = new THREE.PerspectiveCamera(56, 1, 0.1, 700);

    scene.add(new THREE.HemisphereLight('#3d5d94', '#0a120e', 0.32));
    const moon = new THREE.DirectionalLight('#8ea8ff', 0.4);
    moon.position.set(-30, 40, -60);
    scene.add(moon, moon.target);
    this.moon = moon;

    this.sky = makeSky();
    scene.add(this.sky);
    this.ground = makeGround();
    scene.add(this.ground);
    this.forest = new Scenery(scene);
    this.wild = new WildFireflies(scene);

    this.composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }));
    this.composer.addPass(new RenderPass(scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.85, 0.55, 0.78);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.resize();
  }

  get aspect() { return this.camera.aspect; }

  resize() {
    const w = innerWidth, h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.composer.setPixelRatio(this.renderer.getPixelRatio());
    this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    // Portrait frames see less across, so the lens widens and the camera
    // stands further back and higher, keeping both edges of the path in view.
    this.portraitness = clamp((1.35 - this.camera.aspect) / 0.85, 0, 1);
    this.camera.fov = lerp(50, 64, this.portraitness);
    this.camera.updateProjectionMatrix();
    POINT_SCALE.value = (h * this.renderer.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2));
  }

  /** Dusk deepens to night as the stages go by; the aurora comes with a lit beacon. */
  setNight(k) { this.sky.material.uniforms.uNight.value = k; }
  setAurora(k) { this.sky.material.uniforms.uAurora.value = k; }

  update(focusZ, dt) {
    TIME.value += dt;
    this.sky.position.copy(this.camera.position);
    this.ground.position.z = Math.round(focusZ / 4) * 4 - 90;
    this.moon.position.set(this.camera.position.x - 30, 40, focusZ - 60);
    this.moon.target.position.set(0, 0, focusZ);
    this.forest.update(focusZ);
    this.wild.update(focusZ, dt);
  }

  render() { this.composer.render(); }
}

// ---------------------------------------------------------------------------

function makeSky() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: { uTime: TIME, uNight: { value: 0 }, uAurora: { value: 0 }, uMoon: { value: new THREE.Vector3(0.42, 0.3, -1).normalize() } },
    vertexShader: /* glsl */`
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position.z = gl_Position.w;
      }`,
    fragmentShader: /* glsl */`
      uniform float uTime, uNight, uAurora;
      uniform vec3 uMoon;
      varying vec3 vDir;
      ${GLSL_NOISE}
      float h31(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 horizon = mix(vec3(0.012, 0.03, 0.045), vec3(0.006, 0.016, 0.03), uNight);
        vec3 zenith = mix(vec3(0.003, 0.007, 0.024), vec3(0.001, 0.002, 0.009), uNight);
        vec3 col = mix(horizon, zenith, smoothstep(-0.02, 0.6, h));
        // The last of the dusk: a violet band low ahead, fading as night comes on.
        float ahead = smoothstep(-0.3, 1.0, -d.z);
        col += mix(vec3(0.075, 0.035, 0.09), vec3(0.02, 0.015, 0.05), uNight) * exp(-abs(h - 0.03) * 9.0) * (0.3 + 0.7 * ahead);

        // Stars, more of them as it darkens.
        vec3 sp = d * 260.0;
        vec3 cell = floor(sp);
        float r = h31(cell);
        float star = step(0.986 - 0.006 * uNight, r) * smoothstep(0.42, 0.0, length(fract(sp) - 0.5));
        star *= (0.55 + 0.45 * sin(uTime * (1.5 + r * 4.0) + r * 80.0)) * smoothstep(0.04, 0.3, h);
        col += vec3(0.85, 0.9, 1.0) * star * 0.9;

        // A low crescent moon over the end of the path.
        float m = dot(d, uMoon);
        float disc = smoothstep(0.99955, 0.99975, m);
        float bite = smoothstep(0.99955, 0.99975, dot(d, normalize(uMoon + vec3(-0.012, 0.007, 0.0))));
        col += vec3(1.0, 0.94, 0.8) * max(disc - bite, 0.0) * 1.4;
        col += vec3(0.25, 0.32, 0.5) * pow(max(m, 0.0), 1400.0) * 0.12 + vec3(0.05, 0.07, 0.12) * pow(max(m, 0.0), 60.0) * 0.18;

        // Aurora: soft curtains that ripple sideways, for a lit beacon.
        if (uAurora > 0.001) {
          float a = atan(d.x, -d.z);
          float band = smoothstep(0.08, 0.22, h) * smoothstep(0.75, 0.3, h);
          float curtain = fbm(vec2(a * 3.0 + uTime * 0.05, h * 2.0 - uTime * 0.03));
          float rays = pow(0.5 + 0.5 * sin(a * 40.0 + curtain * 9.0 + uTime * 0.4), 3.0);
          float shape = band * smoothstep(0.35, 0.8, curtain) * (0.45 + 0.55 * rays);
          vec3 aur = mix(vec3(0.15, 1.0, 0.55), vec3(0.55, 0.3, 1.0), smoothstep(0.2, 0.6, h));
          col += aur * shape * uAurora * 0.9;
        }
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 48, 24), mat);
  sky.renderOrder = -1;
  sky.frustumCulled = false;
  return sky;
}

// The forest floor and the path, drawn in one shader that reads world
// position, so the ground can follow the camera without its pattern sliding.
function makeGround() {
  const mat = new THREE.MeshLambertMaterial({ color: '#ffffff' });
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = TIME;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vWPos;\nuniform float uTime;\n${GLSL_NOISE}`)
      .replace('#include <color_fragment>', /* glsl */`#include <color_fragment>
        float px = abs(vWPos.x);
        float n = fbm(vWPos.xz * 0.28);
        float fine = vnoise(vWPos.xz * 3.1);
        float path = 1.0 - smoothstep(${PATH_HALF.toFixed(1)} - 0.4, ${PATH_HALF.toFixed(1)} + 1.6 + n * 1.2, px);
        vec3 floorCol = mix(vec3(0.008, 0.02, 0.016), vec3(0.02, 0.04, 0.03), n) * (0.75 + 0.5 * fine);
        vec3 trailCol = mix(vec3(0.05, 0.052, 0.045), vec3(0.085, 0.085, 0.07), n) * (0.8 + 0.4 * fine);
        diffuseColor.rgb = mix(floorCol, trailCol, path);`)
      .replace('#include <emissivemap_fragment>', /* glsl */`#include <emissivemap_fragment>
        {
          // Glowing moss along the path's edges, and a faint shimmer down its middle.
          vec2 q = vWPos.xz * 2.3;
          vec2 cell = floor(q);
          float hc = h21(cell);
          float edge = smoothstep(2.4, 0.0, abs(px - ${PATH_HALF.toFixed(1)} - 0.6));
          float speck = step(0.9, hc) * smoothstep(0.16, 0.0, length(fract(q) - 0.5 - (vec2(h21(cell + 7.0), h21(cell + 3.0)) - 0.5) * 0.5));
          float tw = 0.55 + 0.45 * sin(uTime * (1.2 + hc * 2.0) + hc * 60.0);
          totalEmissiveRadiance += mix(vec3(0.2, 0.95, 0.8), vec3(0.55, 0.9, 0.3), h21(cell + 1.0)) * speck * tw * edge * 2.2;
          totalEmissiveRadiance += vec3(0.008, 0.018, 0.016) * path * (0.6 + 0.4 * n);
        }`);
  };
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(220, 300, 1, 1), mat);
  ground.rotation.x = -Math.PI / 2;
  return ground;
}

// ---------------------------------------------------------------------------

function pineGeometry(tiers, seed) {
  const rng = new Rng(seed);
  const parts = [];
  const trunk = new THREE.CylinderGeometry(0.14, 0.22, 1.6, 5);
  trunk.translate(0, 0.8, 0);
  paint(trunk, [0.05, 0.035, 0.025], [0.07, 0.05, 0.035]);
  parts.push(trunk);
  let y = 1.1, r = 1.6 + rng.range(0, 0.3);
  for (let i = 0; i < tiers; i++) {
    const h = 1.9 - i * 0.18;
    const cone = new THREE.ConeGeometry(r, h, 7, 1);
    cone.rotateY(rng.range(0, Math.PI));
    cone.translate(0, y + h / 2, 0);
    const k = i / tiers;
    paint(cone, [0.016 + k * 0.01, 0.05 + k * 0.02, 0.05 + k * 0.02], [0.03 + k * 0.02, 0.085 + k * 0.03, 0.075 + k * 0.03]);
    parts.push(cone);
    y += h * 0.55;
    r *= 0.74;
  }
  const g = mergeGeometries(parts);
  for (const p of parts) p.dispose();
  return g;
}

function paint(geo, low, high) {
  const pos = geo.attributes.position;
  geo.computeBoundingBox();
  const { min, max } = geo.boundingBox;
  const col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const k = (pos.getY(i) - min.y) / Math.max(1e-6, max.y - min.y);
    for (let c = 0; c < 3; c++) col[i * 3 + c] = lerp(low[c], high[c], k);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
}

function mushroomGeometry() {
  const stem = new THREE.CylinderGeometry(0.035, 0.05, 0.22, 5);
  stem.translate(0, 0.11, 0);
  const cap = new THREE.SphereGeometry(0.11, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
  cap.scale(1, 0.6, 1);
  cap.translate(0, 0.21, 0);
  const g = mergeGeometries([stem, cap]);
  stem.dispose();
  cap.dispose();
  return g;
}

// Trees in two shapes and clumps of glowing mushrooms, laid down in a strip
// SPAN long and moved ahead whenever they fall behind the camera.
class Scenery {
  constructor(scene) {
    const rng = (this.rng = new Rng(20261028));
    const treeMat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
    this.kinds = [
      { mesh: new THREE.InstancedMesh(pineGeometry(4, 3), treeMat, 300), items: [] },
      { mesh: new THREE.InstancedMesh(pineGeometry(3, 11), treeMat, 220), items: [] },
    ];
    for (const kind of this.kinds) {
      for (let i = 0; i < kind.mesh.count; i++) {
        // Thicker away from the path, a few close enough to frame it.
        const side = rng.chance(0.5) ? -1 : 1;
        const x = side * (PATH_HALF + 2.6 + Math.pow(rng.next(), 1.6) * 46);
        const near = Math.abs(x) < PATH_HALF + 6;
        kind.items.push({ x, z: -rng.range(-BEHIND, SPAN), s: rng.range(near ? 0.9 : 1.1, near ? 1.5 : 2.6), ry: rng.range(0, 6.28), tint: rng.range(0.7, 1.25) });
      }
      kind.mesh.frustumCulled = false;
      scene.add(kind.mesh);
    }
    this.mush = { mesh: new THREE.InstancedMesh(mushroomGeometry(), new THREE.MeshBasicMaterial({ toneMapped: false }), 260), items: [] };
    const hues = [new THREE.Color(0.25, 1.6, 1.9), new THREE.Color(1.6, 0.45, 1.5), new THREE.Color(0.55, 1.5, 0.5)];
    for (let c = 0; c < this.mush.mesh.count; c += 4) {
      // Clumps of four along the verges.
      const side = rng.chance(0.5) ? -1 : 1;
      const cx = side * (PATH_HALF + rng.range(1.1, 4.5)), cz = -rng.range(-BEHIND, SPAN);
      const hue = rng.pick(hues);
      for (let k = 0; k < 4 && c + k < this.mush.mesh.count; k++) {
        this.mush.items.push({ x: cx + rng.range(-0.5, 0.5), z: cz + rng.range(-0.5, 0.5), s: rng.range(0.6, 1.6), ry: rng.range(0, 6.28), clump: c });
        this.mush.mesh.setColorAt(c + k, hue.clone().multiplyScalar(rng.range(0.7, 1.2)));
      }
    }
    scene.add(this.mush.mesh);
    this.mush.mesh.frustumCulled = false;
    this.m = new THREE.Matrix4();
    this.q = new THREE.Quaternion();
    this.e = new THREE.Euler();
    this.v = new THREE.Vector3();
    this.sv = new THREE.Vector3();
    this.c = new THREE.Color();
    this.all = [...this.kinds, this.mush];
    this.update(0, true);
  }

  update(focusZ, all = false) {
    for (const kind of this.all) {
      let dirty = all;
      kind.items.forEach((it, i) => {
        let moved = all;
        // Fallen behind: go back to the far end, a little reshuffled.
        while (it.z > focusZ + BEHIND) { it.z -= SPAN + BEHIND; moved = true; }
        while (it.z < focusZ - SPAN) { it.z += SPAN + BEHIND; moved = true; }
        if (!moved) return;
        dirty = true;
        this.e.set(0, it.ry, 0);
        this.q.setFromEuler(this.e);
        this.m.compose(this.v.set(it.x, 0, it.z), this.q, this.sv.setScalar(it.s));
        kind.mesh.setMatrixAt(i, this.m);
        if (it.tint && all) kind.mesh.setColorAt(i, this.c.setScalar(it.tint));
      });
      if (dirty) {
        kind.mesh.instanceMatrix.needsUpdate = true;
        if (kind.mesh.instanceColor) kind.mesh.instanceColor.needsUpdate = true;
      }
    }
  }
}

// ---------------------------------------------------------------------------

/** The shared look of a firefly: a hot core in a soft halo, twinkling. */
export function fireflyMaterial({ color = [0.62, 1.0, 0.1], core = [1.0, 0.86, 0.32], size = 0.55, alpha = 1 } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: TIME,
      uSize: { value: size },
      uPixel: POINT_SCALE,
      uAlpha: { value: alpha },
      uColor: { value: new THREE.Vector3(...color) },
      uCore: { value: new THREE.Vector3(...core) },
    },
    vertexShader: /* glsl */`
      attribute float aSeed;
      attribute float aBirth;
      uniform float uTime, uSize, uPixel;
      varying float vGlow;
      varying float vFlash;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        vGlow = 0.6 + 0.4 * sin(uTime * (2.2 + aSeed * 3.0) + aSeed * 61.0);
        float age = uTime - aBirth;
        vFlash = age >= 0.0 ? exp(-age * 3.5) : 0.0;
        gl_PointSize = uSize * uPixel * (1.0 + vFlash * 1.4) / max(0.5, -mv.z);
      }`,
    fragmentShader: /* glsl */`
      uniform float uAlpha;
      uniform vec3 uColor, uCore;
      varying float vGlow;
      varying float vFlash;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        if (r > 1.0) discard;
        float core = smoothstep(0.28, 0.0, r);
        float halo = exp(-r * r * 6.0) * 0.5;
        float a = (core + halo) * uAlpha;
        vec3 col = mix(uColor, uCore, core) * (vGlow * 2.0 + vFlash * 4.0);
        gl_FragColor = vec4(col * a, 1.0);
      }`,
  });
}

// Fireflies that aren't yours, drifting among the trees.
class WildFireflies {
  constructor(scene) {
    const N = (this.N = 220);
    const rng = new Rng(77);
    this.items = [];
    const pos = new Float32Array(N * 3), seed = new Float32Array(N), birth = new Float32Array(N).fill(-99);
    for (let i = 0; i < N; i++) {
      const side = rng.chance(0.5) ? -1 : 1;
      this.items.push({ x: side * rng.range(PATH_HALF + 1.5, 30), y: rng.range(0.4, 4.5), z: -rng.range(-BEHIND, SPAN * 0.7), p: rng.range(0, 6.28), w: rng.range(0.2, 0.6) });
      seed[i] = rng.next();
    }
    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    this.geo.setAttribute('aBirth', new THREE.BufferAttribute(birth, 1));
    this.points = new THREE.Points(this.geo, fireflyMaterial({ color: [0.45, 0.85, 0.3], core: [0.8, 1.0, 0.6], size: 0.5, alpha: 0.55 }));
    this.points.frustumCulled = false;
    scene.add(this.points);
    this.t = 0;
  }

  update(focusZ, dt) {
    this.t += dt;
    const pos = this.geo.attributes.position.array;
    const span = SPAN * 0.7;
    this.items.forEach((it, i) => {
      while (it.z > focusZ + BEHIND) it.z -= span + BEHIND;
      while (it.z < focusZ - span) it.z += span + BEHIND;
      const t = this.t * it.w + it.p;
      pos[i * 3] = it.x + Math.sin(t) * 1.2;
      pos[i * 3 + 1] = it.y + Math.sin(t * 1.7) * 0.5;
      pos[i * 3 + 2] = it.z + Math.cos(t * 0.8) * 1.2;
    });
    this.geo.attributes.position.needsUpdate = true;
  }
}
