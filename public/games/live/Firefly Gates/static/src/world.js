// The wood, in whichever realm the stage is set: sky, mist, light, the ground
// or still water, the trees and props either side, what drifts in the air,
// and the glow that makes it worth looking at. The path runs down -z forever;
// scenery is recycled ahead of the camera as it goes, placed beside the path
// wherever it bends.

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Rng, clamp, lerp } from './rng.js';
import { PATH_HALF, TIME, POINT_SCALE, path, GLSL_BEND } from './space.js';
import * as flora from './flora.js';
import { Weather } from './weather.js';

export { PATH_HALF, TIME, POINT_SCALE, path };

const SPAN = 200; // how far ahead the scenery is kept, in world units
const BEHIND = 24;
const v3 = (a) => new THREE.Vector3(...a);

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
    scene.background = new THREE.Color();
    scene.fog = new THREE.FogExp2(new THREE.Color(), 0.02);
    this.camera = new THREE.PerspectiveCamera(56, 1, 0.1, 700);

    this.hemi = new THREE.HemisphereLight();
    this.key = new THREE.DirectionalLight();
    this.keyDir = new THREE.Vector3();
    scene.add(this.hemi, this.key, this.key.target);

    this.sky = makeSky();
    this.ground = makeGround();
    this.water = makeWater();
    // Still water shows the world upside down: a mirrored copy of what matters,
    // drawn under a translucent surface.
    this.mirror = new THREE.Group();
    this.mirror.scale.y = -1;
    scene.add(this.sky, this.ground, this.water, this.mirror);
    this.scenery = new Scenery(scene, this.mirror);
    this.weather = new Weather(scene);
    this.wild = new WildFireflies(scene, this.mirror);

    this.composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }));
    this.composer.addPass(new RenderPass(scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.85, 0.55, 0.78);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.focusZ = 0;
    this.resize();
  }

  get aspect() { return this.camera.aspect; }
  get mirrored() { return Boolean(this.realm?.sky.mirror); }

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

  /**
   * Dress the world as a realm. `jitter` varies it a little from the seed (tree
   * counts, mist, the moon's place); stage 1 and the title go without.
   */
  setRealm(realm, seed, { jitter = true } = {}) {
    this.realm = realm;
    const rng = new Rng(seed);
    const j = (a, b) => (jitter ? rng.range(a, b) : 1);

    const u = this.sky.material.uniforms;
    const sky = realm.sky;
    u.uHorizon.value.set(...sky.horizon);
    u.uZenith.value.set(...sky.zenith);
    u.uBand.value.set(...sky.band).multiplyScalar(j(0.85, 1.15));
    u.uBandAhead.value = sky.bandAhead;
    u.uStars.value = sky.stars;
    const moon = sky.moon;
    u.uMoon.value.set(moon.dir[0] + (jitter ? rng.range(-0.08, 0.08) : 0), moon.dir[1], moon.dir[2]).normalize();
    const r = THREE.MathUtils.degToRad(moon.radius);
    u.uMoonCos.value.set(Math.cos(r * 1.15), Math.cos(r * 0.85));
    u.uMoonBite.value.set(...moon.bite).multiplyScalar(moon.radius / 1.5);
    u.uMoonColor.value.set(...moon.color);
    u.uMoonGlow.value = moon.glow;
    u.uAuroraBase.value = sky.aurora.base;
    u.uAuroraA.value.set(...sky.aurora.a);
    u.uAuroraB.value.set(...sky.aurora.b);
    u.uMirror.value = sky.mirror ? 1 : 0;

    this.scene.fog.color.setRGB(...realm.fog.color);
    this.scene.background.setRGB(...realm.fog.color);
    this.scene.fog.density = realm.fog.density * j(0.9, 1.1);

    const L = realm.light;
    this.hemi.color.set(L.sky);
    this.hemi.groundColor.set(L.ground);
    this.hemi.intensity = L.hemi;
    this.key.color.set(L.key);
    this.key.intensity = L.keyI;
    this.keyDir.set(...L.keyDir);

    const g = realm.ground, gu = this.ground.userData.uniforms;
    gu.uFloorLo.value.set(...g.floor[0]);
    gu.uFloorHi.value.set(...g.floor[1]);
    gu.uTrailLo.value.set(...g.trail[0]);
    gu.uTrailHi.value.set(...g.trail[1]);
    gu.uTrailGlow.value.set(...g.trailGlow);
    gu.uSpeckA.value.set(...g.speck.a);
    gu.uSpeckB.value.set(...g.speck.b);
    gu.uSpeck.value.set(g.speck.density, g.speck.glow, g.speck.scale, g.speck.edge);
    this.ground.visible = !g.water;
    this.water.visible = Boolean(g.water);
    if (g.water) {
      this.water.material.color.setRGB(...g.water.color);
      this.water.userData.uniforms.uAlpha.value.set(g.water.near, g.water.far);
    }

    this.scenery.build(realm, rng, { jitter, mirror: this.mirrored, focusZ: this.focusZ });
    this.weather.set(realm.weather, seed);
    this.wild.dress(realm.wild, this.mirrored);

    [this.bloom.strength, this.bloom.radius, this.bloom.threshold] = realm.bloom;
    this.renderer.toneMappingExposure = realm.exposure;
  }

  /** A lit beacon raises the realm's aurora. */
  setAurora(k) { this.sky.material.uniforms.uAurora.value = k; }

  update(focusZ, dt) {
    this.focusZ = focusZ;
    TIME.value += dt;
    this.sky.position.copy(this.camera.position);
    const gz = Math.round(focusZ / 4) * 4 - 90;
    this.ground.position.z = gz;
    this.water.position.z = gz;
    this.key.position.set(this.camera.position.x + this.keyDir.x, this.keyDir.y, focusZ + this.keyDir.z);
    this.key.target.position.set(this.camera.position.x, 0, focusZ);
    this.scenery.update(focusZ);
    this.weather.update(this.camera);
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
    uniforms: {
      uTime: TIME, uAurora: { value: 0 }, uAuroraBase: { value: 0 }, uAuroraA: { value: new THREE.Vector3() }, uAuroraB: { value: new THREE.Vector3() },
      uHorizon: { value: new THREE.Vector3() }, uZenith: { value: new THREE.Vector3() }, uBand: { value: new THREE.Vector3() }, uBandAhead: { value: 0.7 },
      uStars: { value: 1 }, uMoon: { value: new THREE.Vector3(0, 0.3, -1) }, uMoonCos: { value: new THREE.Vector2(0.9995, 0.9997) },
      uMoonBite: { value: new THREE.Vector3() }, uMoonColor: { value: new THREE.Vector3(1, 1, 1) }, uMoonGlow: { value: 1 }, uMirror: { value: 0 },
    },
    vertexShader: /* glsl */`
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position.z = gl_Position.w;
      }`,
    fragmentShader: /* glsl */`
      uniform float uTime, uAurora, uAuroraBase, uBandAhead, uStars, uMoonGlow, uMirror;
      uniform vec3 uHorizon, uZenith, uBand, uMoon, uMoonBite, uMoonColor, uAuroraA, uAuroraB;
      uniform vec2 uMoonCos;
      varying vec3 vDir;
      ${GLSL_NOISE}
      float h31(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      void main() {
        vec3 d = normalize(vDir);
        // Below the horizon, still water shows the sky again, dimmer.
        float under = step(d.y, 0.0) * uMirror;
        if (under > 0.0) d.y = -d.y;
        float h = d.y;
        vec3 col = mix(uHorizon, uZenith, smoothstep(-0.02, 0.6, h));
        // The last of the light: a band low on the horizon, strongest ahead.
        float ahead = smoothstep(-0.3, 1.0, -d.z);
        col += uBand * exp(-abs(h - 0.03) * 9.0) * ((1.0 - uBandAhead) + uBandAhead * ahead);

        vec3 sp = d * 260.0;
        vec3 cell = floor(sp);
        float r = h31(cell);
        float star = step(0.986, r) * smoothstep(0.42, 0.0, length(fract(sp) - 0.5));
        star *= (0.55 + 0.45 * sin(uTime * (1.5 + r * 4.0) + r * 80.0)) * smoothstep(0.04, 0.3, h);
        col += vec3(0.85, 0.9, 1.0) * star * uStars;

        float m = dot(d, uMoon);
        float disc = smoothstep(uMoonCos.x, uMoonCos.y, m);
        float bite = dot(uMoonBite, uMoonBite) > 0.0 ? smoothstep(uMoonCos.x, uMoonCos.y, dot(d, normalize(uMoon + uMoonBite))) : 0.0;
        col += uMoonColor * max(disc - bite, 0.0) * 1.4;
        col += uMoonColor * (pow(max(m, 0.0), 1400.0) * 0.05 + pow(max(m, 0.0), 60.0) * 0.012) * uMoonGlow;

        float aur = max(uAurora, uAuroraBase);
        if (aur > 0.001) {
          float a = atan(d.x, -d.z);
          float band = smoothstep(0.08, 0.22, h) * smoothstep(0.75, 0.3, h);
          float curtain = fbm(vec2(a * 3.0 + uTime * 0.05, h * 2.0 - uTime * 0.03));
          float rays = pow(0.5 + 0.5 * sin(a * 40.0 + curtain * 9.0 + uTime * 0.4), 3.0);
          float shape = band * smoothstep(0.35, 0.8, curtain) * (0.45 + 0.55 * rays);
          col += mix(uAuroraA, uAuroraB, smoothstep(0.2, 0.6, h)) * shape * aur * 0.9;
        }
        if (under > 0.0) col *= 0.75;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 48, 24), mat);
  sky.renderOrder = -3;
  sky.frustumCulled = false;
  return sky;
}

// The forest floor and the path, drawn in one shader that reads world
// position, so the ground can follow the camera without its pattern sliding,
// and the path can bend.
function makeGround() {
  const uniforms = {
    uTime: TIME, ...path.uniforms,
    uFloorLo: { value: new THREE.Vector3() }, uFloorHi: { value: new THREE.Vector3() },
    uTrailLo: { value: new THREE.Vector3() }, uTrailHi: { value: new THREE.Vector3() }, uTrailGlow: { value: new THREE.Vector3() },
    uSpeckA: { value: new THREE.Vector3() }, uSpeckB: { value: new THREE.Vector3() },
    uSpeck: { value: new THREE.Vector4(0.9, 2.2, 2.3, 1) }, // density, glow (0: flecks of colour instead), cells per unit, edge-only
  };
  const mat = new THREE.MeshLambertMaterial({ color: '#ffffff' });
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec3 vWPos;
        uniform float uTime, uBendPh;
        uniform vec4 uBend, uSpeck;
        uniform vec3 uFloorLo, uFloorHi, uTrailLo, uTrailHi, uTrailGlow, uSpeckA, uSpeckB;
        ${GLSL_NOISE}
        ${GLSL_BEND}`)
      .replace('#include <color_fragment>', /* glsl */`#include <color_fragment>
        float px = abs(vWPos.x - bendX(vWPos.z));
        float n = fbm(vWPos.xz * 0.28);
        float fine = vnoise(vWPos.xz * 3.1);
        float path = 1.0 - smoothstep(${PATH_HALF.toFixed(1)} - 0.4, ${PATH_HALF.toFixed(1)} + 1.6 + n * 1.2, px);
        vec3 floorCol = mix(uFloorLo, uFloorHi, n) * (0.75 + 0.5 * fine);
        vec3 trailCol = mix(uTrailLo, uTrailHi, n) * (0.8 + 0.4 * fine);
        diffuseColor.rgb = mix(floorCol, trailCol, path);
        // Specks: glowing moss and spores, snow glints, or flecks of fallen leaves.
        vec2 q = vWPos.xz * uSpeck.z;
        vec2 cell = floor(q);
        float hc = h21(cell);
        float edge = mix(1.0, smoothstep(2.4, 0.0, abs(px - ${PATH_HALF.toFixed(1)} - 0.6)), uSpeck.w);
        float rad = uSpeck.y > 0.0 ? 0.16 : 0.34;
        float speck = step(uSpeck.x, hc) * smoothstep(rad, 0.0, length(fract(q) - 0.5 - (vec2(h21(cell + 7.0), h21(cell + 3.0)) - 0.5) * 0.5));
        vec3 speckCol = mix(uSpeckA, uSpeckB, h21(cell + 1.0));
        if (uSpeck.y <= 0.0) diffuseColor.rgb = mix(diffuseColor.rgb, speckCol * (0.7 + 0.6 * fine), speck);`)
      .replace('#include <emissivemap_fragment>', /* glsl */`#include <emissivemap_fragment>
        if (uSpeck.y > 0.0) {
          float tw = 0.55 + 0.45 * sin(uTime * (1.2 + hc * 2.0) + hc * 60.0);
          totalEmissiveRadiance += speckCol * speck * tw * edge * uSpeck.y;
        }
        totalEmissiveRadiance += uTrailGlow * path * (0.6 + 0.4 * n);`);
  };
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(220, 300, 1, 1), mat);
  ground.rotation.x = -Math.PI / 2;
  ground.userData.uniforms = uniforms;
  return ground;
}

// Still water: dark and nearly opaque underfoot, clearer towards the
// distance where the mirrored world shows through.
function makeWater() {
  const uniforms = { uTime: TIME, uAlpha: { value: new THREE.Vector2(0.9, 0.42) } };
  // Lambert, not standard: a specular moon on the water blooms into a white smear.
  const mat = new THREE.MeshLambertMaterial({ color: '#06161a', transparent: true });
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vWPos;\nuniform float uTime;\nuniform vec2 uAlpha;\n${GLSL_NOISE}`)
      .replace('#include <normal_fragment_maps>', /* glsl */`#include <normal_fragment_maps>
        // Slow ripples, enough to break up the reflection.
        vec2 rp = vWPos.xz * 0.9 + vec2(uTime * 0.12, uTime * 0.07);
        normal = normalize(normal + vec3(vnoise(rp) - 0.5, 0.0, vnoise(rp + 13.1) - 0.5) * 0.12);`)
      .replace('#include <opaque_fragment>', /* glsl */`
        float facing = abs(dot(normalize(vViewPosition), mat3(viewMatrix) * vec3(0.0, 1.0, 0.0)));
        diffuseColor.a = mix(uAlpha.y, uAlpha.x, smoothstep(0.05, 0.6, facing));
        #include <opaque_fragment>`);
  };
  const water = new THREE.Mesh(new THREE.PlaneGeometry(220, 300, 1, 1), mat);
  water.rotation.x = -Math.PI / 2;
  water.renderOrder = -1;
  water.visible = false;
  water.userData.uniforms = uniforms;
  return water;
}

// ---------------------------------------------------------------------------

const BUILD = {
  pine: flora.pine, birch: flora.birch, willow: flora.willow, bamboo: flora.bamboo, bare: flora.bare, giantMushroom: flora.giantMushroom,
};
const TREE_SCALE = { pine: null, birch: [0.85, 1.25], willow: [0.9, 1.35], bamboo: [0.85, 1.25], bare: [0.9, 1.5], giantMushroom: [0.75, 1.35] };
const PROP_SCALE = { glowMushroom: [0.6, 1.6], rock: [0.5, 1.7], paperLantern: [0.95, 1.1], lilyPad: [0.6, 1.8], reeds: [0.8, 1.3], frogGlow: [1, 1], iceShard: [0.7, 1.6] };
const GLOWS = new Set(['glowMushroom', 'frogGlow', 'iceShard']);

function zoneX(zone, rng) {
  const side = rng.chance(0.5) ? -1 : 1;
  switch (zone) {
    case 'far': return side * (PATH_HALF + 9 + rng.next() * 40);
    case 'verge': return side * (PATH_HALF + rng.range(1.1, 4.5));
    case 'edge': return side * (PATH_HALF + rng.range(0.5, 1.3));
    case 'water': return rng.range(-26, 26);
    default: return side * (PATH_HALF + 2.6 + Math.pow(rng.next(), 1.6) * 46);
  }
}

// Trees and props laid down in a strip SPAN long and moved ahead whenever
// they fall behind the camera, beside the path wherever it has bent to.
class Scenery {
  constructor(scene, mirror) {
    this.scene = scene;
    this.mirror = mirror;
    this.sets = [];
    this.m = new THREE.Matrix4();
    this.q = new THREE.Quaternion();
    this.e = new THREE.Euler();
    this.v = new THREE.Vector3();
    this.sv = new THREE.Vector3();
    this.c = new THREE.Color();
  }

  build(realm, rng, { jitter, mirror, focusZ }) {
    this.clear();
    const j = (a, b) => (jitter ? rng.range(a, b) : 1);
    const [t0, t1] = realm.tint;
    for (const spec of realm.trees) {
      const geo = BUILD[spec.kind](spec);
      const glow = geo.groups.length > 1;
      const matte = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: spec.kind === 'willow' ? THREE.DoubleSide : THREE.FrontSide });
      const mat = glow ? [matte, new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })] : matte;
      const count = Math.round(spec.count * j(0.85, 1.15));
      const sc = TREE_SCALE[spec.kind];
      const items = [];
      for (let i = 0; i < count; i++) {
        const xl = zoneX(spec.far ? 'far' : 'forest', rng);
        const near = Math.abs(xl) < PATH_HALF + 6;
        const s = sc ? rng.range(...sc) * (near ? 1 : 1.25) : rng.range(near ? 0.9 : 1.1, near ? 1.5 : 2.6);
        const tint = rng.range(t0, t1);
        items.push({ xl, z: focusZ - rng.range(-BEHIND, SPAN), s: s * j(0.92, 1.1), ry: rng.range(0, 6.28), col: [tint * rng.range(0.94, 1.06), tint * rng.range(0.94, 1.06), tint * rng.range(0.94, 1.06)] });
      }
      this.add(geo, mat, items, mirror);
    }
    for (const spec of realm.props) {
      const kinds = spec.kind === 'lilyPad' ? [false, true] : [null];
      for (const flower of kinds) {
        const geo = spec.kind === 'lilyPad'
          ? flora.lilyPad({ flower: flower ? spec.flower : null, color: colorOf(spec.color) })
          : flora[spec.kind]({ seed: rng.int(1, 999), color: spec.color && colorOf(spec.color) });
        const glow = GLOWS.has(spec.kind);
        const two = geo.groups.length > 1;
        const matte = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: spec.kind !== 'lilyPad', side: spec.kind === 'lilyPad' ? THREE.DoubleSide : THREE.FrontSide });
        const lit = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });
        const mat = glow ? lit : two ? [matte, lit] : matte;
        const share = flower === null ? 1 : flower ? 0.25 : 0.75;
        const count = Math.round(spec.count * share * j(0.85, 1.15));
        const items = [];
        const clump = spec.clump || 1;
        for (let i = 0; i < count; i += clump) {
          const cx = zoneX(spec.zone, rng), cz = focusZ - rng.range(-BEHIND, SPAN);
          const hue = spec.colors ? rng.pick(spec.colors) : null;
          for (let k = 0; k < clump && i + k < count; k++) {
            const x = cx + (clump > 1 ? rng.range(-0.6, 0.6) : 0);
            const s = rng.range(...(PROP_SCALE[spec.kind] || [0.8, 1.2]));
            const tint = rng.range(0.7, 1.2);
            const col = hue ? hue.map((v) => v * tint) : [tint, tint, tint].map((v) => Math.min(1.15, v));
            // Lanterns hang their light out over the path.
            const ry = spec.kind === 'paperLantern' ? (x < 0 ? 0 : Math.PI) : rng.range(0, 6.28);
            items.push({ xl: x, z: cz + (clump > 1 ? rng.range(-0.6, 0.6) : 0), s, ry, col });
          }
        }
        this.add(geo, mat, items, mirror && spec.zone !== 'water');
      }
    }
    this.update(focusZ, true);
  }

  add(geo, mat, items, mirror) {
    const mesh = new THREE.InstancedMesh(geo, mat, Math.max(1, items.length));
    mesh.count = items.length;
    mesh.frustumCulled = false;
    items.forEach((it, i) => mesh.setColorAt(i, this.c.setRGB(it.col[0], it.col[1], it.col[2])));
    this.scene.add(mesh);
    let twin = null;
    if (mirror) {
      twin = new THREE.InstancedMesh(geo, mat, Math.max(1, items.length));
      twin.count = items.length;
      twin.instanceMatrix = mesh.instanceMatrix;
      twin.instanceColor = mesh.instanceColor;
      twin.frustumCulled = false;
      this.mirror.add(twin);
    }
    this.sets.push({ mesh, twin, items });
  }

  update(focusZ, all = false) {
    for (const { mesh, items } of this.sets) {
      let dirty = all;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        let moved = all;
        // Fallen behind: go back to the far end.
        while (it.z > focusZ + BEHIND) { it.z -= SPAN + BEHIND; moved = true; }
        while (it.z < focusZ - SPAN) { it.z += SPAN + BEHIND; moved = true; }
        if (!moved) continue;
        dirty = true;
        this.e.set(0, it.ry, 0);
        this.q.setFromEuler(this.e);
        this.m.compose(this.v.set(it.xl + path.x(it.z), 0, it.z), this.q, this.sv.setScalar(it.s));
        mesh.setMatrixAt(i, this.m);
      }
      if (dirty) {
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      }
    }
  }

  clear() {
    for (const { mesh, twin } of this.sets) {
      this.scene.remove(mesh);
      if (twin) this.mirror.remove(twin);
      mesh.geometry.dispose();
      for (const m of [].concat(mesh.material)) m.dispose();
      mesh.dispose();
    }
    this.sets = [];
  }
}

function colorOf(hex) {
  const c = new THREE.Color(hex);
  return [c.r, c.g, c.b];
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
  constructor(scene, mirror) {
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
    this.points = new THREE.Points(this.geo, fireflyMaterial({ size: 0.5, alpha: 0.55 }));
    this.points.frustumCulled = false;
    scene.add(this.points);
    this.twin = new THREE.Points(this.geo, this.points.material);
    this.twin.frustumCulled = false;
    this.twin.renderOrder = -2;
    this.twin.visible = false;
    mirror.add(this.twin);
    this.t = 0;
  }

  dress(spec, mirrored) {
    const u = this.points.material.uniforms;
    u.uColor.value.set(...spec.color);
    u.uCore.value.set(...spec.core);
    u.uAlpha.value = spec.alpha;
    this.twin.visible = mirrored;
  }

  update(focusZ, dt) {
    this.t += dt;
    const pos = this.geo.attributes.position.array;
    const span = SPAN * 0.7;
    for (let i = 0; i < this.items.length; i++) {
      const it = this.items[i];
      while (it.z > focusZ + BEHIND) it.z -= span + BEHIND;
      while (it.z < focusZ - span) it.z += span + BEHIND;
      const t = this.t * it.w + it.p;
      pos[i * 3] = it.x + path.x(it.z) + Math.sin(t) * 1.2;
      pos[i * 3 + 1] = it.y + Math.sin(t * 1.7) * 0.5;
      pos[i * 3 + 2] = it.z + Math.cos(t * 0.8) * 1.2;
    }
    this.geo.attributes.position.needsUpdate = true;
  }
}
