// The stage: one camera, one sky, one sea of cloud, and two twins that take
// turns being visible. Each frame the scene is drawn once per panel, with
// only that panel's twin switched on, then graded as a whole.

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { Pass } from 'three/addons/postprocessing/Pass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { ATMOS, NOISE_GLSL, patch, glowMat, disposeTree } from './gfx.js';
import { SEA, ARCH, shapeFor } from './terrain.js';
import { Rng, smoothstep } from './noise.js';
import { sampleSky } from './look.js';

class SplitPass extends Pass {
  constructor(world) {
    super();
    this.world = world;
    this.needsSwap = false;
  }
  render(renderer, writeBuffer, readBuffer) {
    const w = this.world;
    const rt = readBuffer;
    const sx = rt.width / w.cssW, sy = rt.height / w.cssH;
    rt.scissorTest = false;
    rt.viewport.set(0, 0, rt.width, rt.height);
    renderer.setRenderTarget(rt);
    renderer.setClearColor(0x0b0e18, 1);
    renderer.clear();
    for (let i = 0; i < 2; i++) {
      const p = w.panels[i];
      if (!p.enabled) continue;
      const r = p.rect;
      const x = Math.round(r.x * sx), y = Math.round((w.cssH - r.y - r.h) * sy);
      const pw = Math.round(r.w * sx), ph = Math.round(r.h * sy);
      rt.viewport.set(x, y, pw, ph);
      rt.scissor.set(x, y, pw, ph);
      rt.scissorTest = true;
      renderer.setRenderTarget(rt);
      w.usePanel(i, true);
      renderer.render(w.scene, w.camera);
    }
    rt.scissorTest = false;
    rt.viewport.set(0, 0, rt.width, rt.height);
    rt.scissor.set(0, 0, rt.width, rt.height);
    renderer.setRenderTarget(rt);
  }
}

const FinishShader = {
  uniforms: {
    tDiffuse: { value: null },
    uPanelA: { value: new THREE.Vector4(0, 0, 1, 1) },
    uPanelB: { value: new THREE.Vector4(0, 0, 0, 0) },
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
  },
  vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform vec4 uPanelA; uniform vec4 uPanelB; uniform float uTime; uniform vec2 uRes;
    varying vec2 vUv;
    float vig(vec4 r) {
      if (r.z <= 0.0) return 1.0;
      vec2 q = (vUv - r.xy) / r.zw;
      if (q.x < 0.0 || q.y < 0.0 || q.x > 1.0 || q.y > 1.0) return 1.0;
      q = q * 2.0 - 1.0;
      q *= vec2(0.6, 0.78);
      return mix(1.0, 0.72, smoothstep(0.22, 1.0, dot(q, q)));
    }
    float rnd(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
      c.rgb = mix(vec3(l), c.rgb, 1.14);
      c.rgb = clamp((c.rgb - 0.5) * 1.07 + 0.5, 0.0, 1.0);
      c.rgb *= vig(uPanelA) * vig(uPanelB);
      c.rgb += (rnd(vUv * uRes + fract(uTime * 7.13) * 91.7) - 0.5) * 0.03;
      gl_FragColor = c;
    }`,
};

function makeSky() {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uZenith: ATMOS.uZenith, uFogColor: ATMOS.uFogColor, uFogSun: ATMOS.uFogSun, uSunDir: ATMOS.uSunDir,
      uSunColor: ATMOS.uSunColor, uNight: ATMOS.uNight, uTime: ATMOS.uTime,
      uMilky: ATMOS.uMilky, uMilkyA: ATMOS.uMilkyA, uMilkyB: ATMOS.uMilkyB,
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = (modelMatrix * vec4(position, 1.0)).xyz - cameraPosition;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position.z = gl_Position.w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uZenith; uniform vec3 uFogColor; uniform vec3 uFogSun; uniform vec3 uSunDir; uniform vec3 uSunColor;
      uniform float uNight; uniform float uTime; uniform vec3 uMilky; uniform vec3 uMilkyA; uniform vec3 uMilkyB;
      varying vec3 vDir;
      ${NOISE_GLSL}
      void main() {
        vec3 d = normalize(vDir);
        float s = max(dot(d, uSunDir), 0.0);
        vec3 hz = mix(uFogColor, uFogSun, pow(s, 6.0));
        float y = max(d.y, 0.0);
        vec3 col = mix(hz, uZenith, pow(smoothstep(0.0, 0.5, y), 0.55));
        // The sun by day; at night the light is the moon, which is drawn on its own.
        col += uSunColor * (smoothstep(0.99935, 0.99965, s) * 5.0 + pow(s, 90.0) * 0.5 + pow(s, 10.0) * 0.1) * (1.0 - uNight);
        if (uNight > 0.01) {
          float above = smoothstep(-0.005, 0.06, d.y);
          // The Milky Way: a soft band along a great circle, with more stars inside it.
          float off = dot(d, uMilky) / 0.11;
          float band = exp(-off * off);
          vec2 bp = vec2(dot(d, uMilkyA), dot(d, uMilkyB)) * 7.0;
          float dust = fbm3(bp) * 0.9 + fbm3(bp * 3.1 + 4.0) * 0.4;
          col += vec3(0.5, 0.56, 0.78) * band * smoothstep(0.3, 0.9, dust) * 0.32 * uNight * above;
          vec3 q = floor(d * 380.0);
          float h = hash13(q);
          float st = step(0.9982 - band * 0.0025, h) * (0.45 + 0.55 * hash13(q + 7.0));
          st *= smoothstep(0.62, 0.15, length(fract(d * 380.0) - 0.5));
          st *= 0.65 + 0.35 * sin(uTime * (2.0 + h * 3.0) + h * 40.0);
          col += st * uNight * above * 1.7;
        }
        gl_FragColor = vec4(col, 1.0);
      }`,
    side: THREE.BackSide,
    depthWrite: false,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(6000, 32, 16), mat);
  sky.renderOrder = -10;
  sky.frustumCulled = false;
  return sky;
}

// Stacked translucent sheets read as a soft cloud sea, hide the edge of the
// world, and catch the mountain's shadow in the evening.
function makeSea(layers) {
  const g = new THREE.Group();
  const geo = new THREE.PlaneGeometry(16000, 16000, 1, 1).rotateX(-Math.PI / 2);
  const ys = layers >= 3 ? [3, 6.5, 9.5, 12.5] : [3, 8, 12];
  ys.forEach((y, i) => {
    const level = i / (ys.length - 1);
    const mat = patch(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, transparent: i > 0, depthWrite: i === 0 }), {
      key: 'sea',
      uniforms: { uLayer: { value: level } },
      fragHead: `uniform float uLayer;\n${NOISE_GLSL}
        float cloudN(vec2 p) { return fbm3(p) + (vnoise(p * 4.3) - 0.5) * 0.12; }
        vec2 cloudP() { return vWPos.xz * 0.0072 + vec2(uTime * 0.005, uTime * 0.002); }`,
      fragColor: /* glsl */ `{
        float n = cloudN(cloudP());
        float lo = 0.3 + uLayer * 0.2;
        float cov = smoothstep(lo, lo + 0.15, n);
        diffuseColor.rgb = vec3(mix(0.72, 1.0, clamp(uLayer * 0.6 + (n - 0.4) * 1.5, 0.0, 1.0)));
        diffuseColor.a = uLayer < 0.01 ? 1.0 : cov;
      }`,
      // Billows: tilt the normal along the density gradient so tops facing a low sun light up.
      fragNormal: /* glsl */ `{
        vec2 p = cloudP();
        float e = 0.02;
        float n0 = cloudN(p);
        vec2 g = vec2(cloudN(p + vec2(e, 0.0)) - n0, cloudN(p + vec2(0.0, e)) - n0) / e;
        vec3 nw = normalize(vec3(-g.x * 0.55, 1.0, -g.y * 0.55));
        normal = normalize((viewMatrix * vec4(nw, 0.0)).xyz);
      }`,
      // Light scattering through the cloud: a little of the sun's colour everywhere.
      fragEmissive: 'totalEmissiveRadiance += uSunColor * 0.16 + uAmbient * 0.25;',
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.y = y;
    m.renderOrder = i;
    m.receiveShadow = true;
    g.add(m);
  });
  return g;
}

// A far mountain: the archetype's shape without erosion, vertex-coloured.
function farPeak(seed, archId, res = 56) {
  const { shape } = shapeFor(seed, archId);
  const geo = new THREE.PlaneGeometry(2, 2, res, res).rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  let max = 0;
  const hs = new Float32Array(p.count);
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i), v = p.getZ(i);
    let h = shape.base(u, v);
    if (shape.post) h = shape.post(u, v, h);
    hs[i] = h;
    if (h > max) max = h;
  }
  for (let i = 0; i < p.count; i++) p.setY(i, hs[i] / max);
  geo.computeVertexNormals();
  const col = new Float32Array(p.count * 3);
  const rock = new THREE.Color(archId === 'mesa' ? '#a55a37' : archId === 'volcano' ? '#4a4140' : '#77736d');
  const snow = new THREE.Color('#eef2f8');
  const grass = new THREE.Color(archId === 'mesa' ? '#a08e5c' : '#4f6a35');
  const n = geo.attributes.normal;
  const tmp = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const h = p.getY(i), ny = n.getY(i);
    tmp.copy(grass).lerp(rock, smoothstep(0.2, 0.4, h) * 0.8 + smoothstep(0.75, 0.6, ny) * 0.5);
    if (archId !== 'mesa') tmp.lerp(snow, smoothstep(0.55, 0.62, h) * smoothstep(0.45, 0.6, ny));
    col.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return geo;
}

function makeMoon() {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uMoon: ATMOS.uMoon, uPhase: { value: 1.2 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uMoon; uniform float uPhase; varying vec2 vUv;
      ${NOISE_GLSL}
      void main() {
        vec2 q = (vUv * 2.0 - 1.0) * 3.0;
        float r = length(q);
        float disc = 1.0 - smoothstep(0.96, 1.0, r);
        float shade = 1.0 - smoothstep(0.96, 1.04, length(q - vec2(uPhase, 0.12)));
        float lit = disc * (1.0 - shade * 0.94);
        float maria = 0.8 + 0.2 * fbm3(q * 2.3 + 3.0);
        vec3 col = vec3(1.0, 0.97, 0.9) * lit * maria * 1.7;
        float glow = exp(-max(r - 1.0, 0.0) * 2.4) * 0.16 * (1.0 - disc);
        col += vec3(0.55, 0.65, 1.0) * glow;
        gl_FragColor = vec4(col * uMoon, max(lit, glow) * uMoon);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  m.renderOrder = -5;
  return m;
}

const farMat = patch(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }), { key: 'far' });

export class World {
  constructor(canvas, { mobile }) {
    this.mobile = mobile;
    const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' }));
    this.dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
    r.setPixelRatio(this.dpr);
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, 1, 1.5, 14000);

    const sun = (this.sun = new THREE.DirectionalLight(0xffffff, 3));
    sun.castShadow = true;
    const sc = sun.shadow.camera;
    sc.left = -165; sc.right = 165; sc.top = 165; sc.bottom = -165; sc.near = 50; sc.far = 1300;
    sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.45;
    this.scene.add(sun, sun.target);
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    this.scene.add(this.hemi);

    this.sky = makeSky();
    this.scene.add(this.sky);
    this.sea = makeSea(mobile ? 2 : 3);
    this.scene.add(this.sea);
    this.far = new THREE.Group();
    this.scene.add(this.far);
    this.moon = makeMoon();
    this.moon.visible = false;
    this.scene.add(this.moon);
    ATMOS.uPx.value = this.dpr;

    this.twins = [null, null];
    this.fields = [null, null];
    this.split = 0;
    this.shift = 0;
    this.lift = 0;
    this.frameLift = 0;
    this.panels = [
      { rect: { x: 0, y: 0, w: 1, h: 1 }, show: 0, enabled: true },
      { rect: { x: 0, y: 0, w: 0, h: 1 }, show: 1, enabled: false },
    ];
    this.cssW = 1; this.cssH = 1;
    this.raycaster = new THREE.Raycaster();
    this.tmp = new THREE.Vector3();

    const size = r.getDrawingBufferSize(new THREE.Vector2());
    const rt = new THREE.WebGLRenderTarget(Math.max(1, size.x), Math.max(1, size.y), { type: THREE.HalfFloatType, samples: mobile ? 0 : 4 });
    this.composer = new EffectComposer(r, rt);
    this.composer.addPass(new SplitPass(this));
    if (!mobile) {
      this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.32, 0.6, 0.95);
      this.composer.addPass(this.bloom);
    }
    this.composer.addPass(new OutputPass());
    this.finish = new ShaderPass(FinishShader);
    this.composer.addPass(this.finish);
    this.resize();
  }

  resize() {
    const W = window.innerWidth, H = window.innerHeight;
    this.cssW = W; this.cssH = H;
    this.renderer.setSize(W, H, false);
    this.composer.setPixelRatio(this.dpr);
    this.composer.setSize(W, H);
    this.finish.uniforms.uRes.value.set(W * this.dpr, H * this.dpr);
    this.layout();
  }

  get portrait() { return this.cssH > this.cssW * 1.05; }

  layout() {
    const W = this.cssW, H = this.cssH, s = this.split;
    const gap = s > 0.001 ? 2 : 0;
    const [a, b] = this.panels;
    if (!this.portrait) {
      const w0 = Math.round(W * (1 - 0.5 * s));
      a.rect = { x: 0, y: 0, w: w0 - gap / 2, h: H };
      b.rect = { x: w0 + gap / 2, y: 0, w: W - w0 - gap / 2, h: H };
    } else {
      const h0 = Math.round(H * (1 - 0.5 * s));
      a.rect = { x: 0, y: 0, w: W, h: h0 - gap / 2 };
      b.rect = { x: 0, y: h0 + gap / 2, w: W, h: H - h0 - gap / 2 };
    }
    b.enabled = s > 0.001 && b.rect.w > 1 && b.rect.h > 1;
    const toUv = (r) => new THREE.Vector4(r.x / W, 1 - (r.y + r.h) / H, r.w / W, r.h / H);
    this.finish.uniforms.uPanelA.value.copy(toUv(a.rect));
    this.finish.uniforms.uPanelB.value.copy(b.enabled ? toUv(b.rect) : new THREE.Vector4(0, 0, 0, 0));
  }

  // Point the shared camera at one panel's rectangle (and its twin, when drawing).
  usePanel(i, drawing = false) {
    const p = this.panels[i];
    const r = p.rect;
    const cam = this.camera;
    cam.aspect = r.w / Math.max(1, r.h);
    // shift slides the title shot aside; lift raises both views above the end
    // card; frameLift lowers the horizon to leave room for the sky.
    let ox = 0, oy = (this.lift + this.frameLift) * r.h;
    if (i === 0 && this.shift) {
      if (this.portrait) oy += this.shift * r.h;
      else ox -= this.shift * r.w;
    }
    if (Math.abs(ox) + Math.abs(oy) > 0.5) cam.setViewOffset(r.w, r.h, ox, oy, r.w, r.h);
    else if (cam.view && cam.view.enabled) cam.clearViewOffset();
    cam.updateProjectionMatrix();
    if (drawing) {
      if (this.twins[0]) this.twins[0].visible = p.show === 0;
      if (this.twins[1]) this.twins[1].visible = p.show === 1;
    }
    return p;
  }

  panelAt(x, y) {
    for (let i = 0; i < 2; i++) {
      const p = this.panels[i];
      if (!p.enabled) continue;
      const r = p.rect;
      if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) return i;
    }
    return -1;
  }

  setTwins(groups, fields) {
    for (const g of this.twins) if (g) { this.scene.remove(g); disposeTree(g); }
    this.twins = groups;
    this.fields = fields;
    for (const g of groups) this.scene.add(g);
  }

  // Night pairs get a moon and a Milky Way placed to rise over the mountain.
  setSky(round) {
    this.frameLift = round.frame.lift;
    this.moon.visible = !!round.moon;
    if (!round.moon) return;
    const { pos, size, phase, milky } = round.moon;
    this.moon.position.copy(pos);
    this.moon.scale.setScalar(size * 6);
    this.moon.material.uniforms.uPhase.value = phase;
    ATMOS.uMilky.value.copy(milky.n);
    ATMOS.uMilkyA.value.copy(milky.a);
    ATMOS.uMilkyB.value.copy(milky.b);
  }

  setTime(tod, sunAz, night = false) {
    const k = sampleSky(tod, night);
    const el = (k.elev * Math.PI) / 180;
    const dir = ATMOS.uSunDir.value.set(Math.cos(el) * Math.sin(sunAz), Math.sin(el), Math.cos(el) * Math.cos(sunAz));
    const lel = Math.max(el, (5 * Math.PI) / 180);
    this.sun.target.position.set(0, 35, 0);
    this.sun.position.set(Math.cos(lel) * Math.sin(sunAz), Math.sin(lel), Math.cos(lel) * Math.cos(sunAz)).multiplyScalar(650).add(this.sun.target.position);
    this.sun.color.copy(k.sun);
    this.sun.intensity = k.sunI;
    this.hemi.color.copy(k.sky);
    this.hemi.groundColor.copy(k.gnd);
    this.hemi.intensity = k.hemiI;
    ATMOS.uSunColor.value.copy(k.sun).multiplyScalar(k.sunI / 3);
    ATMOS.uFogColor.value.copy(k.fog);
    ATMOS.uFogSun.value.copy(k.fogSun);
    ATMOS.uZenith.value.copy(k.zen);
    ATMOS.uAmbient.value.copy(k.sky).multiplyScalar(k.hemiI * 0.45);
    ATMOS.uNight.value = k.night;
    ATMOS.uMoon.value = k.moon;
    this.renderer.toneMappingExposure = k.exp;
    glowMat.emissiveIntensity = (night ? 1 - smoothstep(0.86, 0.98, tod) : smoothstep(0.55, 0.95, tod)) * 5;
    this.dir = dir;
  }

  // The backdrop: a fixed ring of strangers, and any mountains the player has kept.
  setRange(kept) {
    disposeTree(this.far);
    this.far.clear();
    const rng = new Rng(20261028);
    const ids = ['horn', 'massif', 'horn', 'volcano', 'massif', 'spires'];
    const count = 16;
    for (let i = 0; i < count; i++) {
      const id = ids[i % ids.length];
      const geo = farPeak(rng.int(1, 1e9), id, 40);
      const m = new THREE.Mesh(geo, farMat);
      const a = (i / count) * Math.PI * 2 + rng.range(-0.12, 0.12);
      const d = rng.range(1700, 2900);
      const sc = rng.range(300, 560);
      m.scale.set(sc, sc * rng.range(0.32, 0.5), sc);
      m.position.set(Math.sin(a) * d, -sc * 0.06, Math.cos(a) * d);
      m.rotation.y = rng.range(0, Math.PI * 2);
      this.far.add(m);
    }
    kept.forEach((k, i) => {
      const geo = farPeak(k.seed, k.arch, 56);
      const m = new THREE.Mesh(geo, farMat);
      const a = 0.6 + i * 2.39996;
      const d = 900 + (i % 4) * 140;
      const sc = 150 * (ARCH[k.arch]?.height?.[1] ?? 110) / 120;
      m.scale.set(sc, sc * 0.8, sc);
      m.position.set(Math.sin(a) * d, -2, Math.cos(a) * d);
      m.rotation.y = (k.seed % 628) / 100;
      m.userData.kept = k;
      this.far.add(m);
    });
  }

  pick(cx, cy) {
    const idx = this.panelAt(cx, cy);
    if (idx < 0) return null;
    const p = this.usePanel(idx);
    const r = p.rect;
    const ndc = new THREE.Vector2(((cx - r.x) / r.w) * 2 - 1, -((cy - r.y) / r.h) * 2 + 1);
    this.camera.updateMatrixWorld();
    this.raycaster.setFromCamera(ndc, this.camera);
    const o = this.raycaster.ray.origin, d = this.raycaster.ray.direction;
    const field = this.fields[p.show];
    const t = field ? field.raycast(o.x, o.y, o.z, d.x, d.y, d.z) : -1;
    let hit = t >= 0 ? o.clone().addScaledVector(d, t) : null;
    let cloud = false;
    if (hit && hit.y < SEA) { cloud = true; hit = null; }
    else if (!hit && d.y < 0) cloud = true;
    return { panel: idx, twin: p.show, hit, cloud, origin: o.clone() };
  }

  project(v, idx) {
    const p = this.usePanel(idx);
    const r = p.rect;
    const q = this.tmp.copy(v).project(this.camera);
    return { x: r.x + ((q.x + 1) / 2) * r.w, y: r.y + ((1 - q.y) / 2) * r.h, behind: q.z > 1 };
  }

  pxPerUnit(v, idx) {
    const r = this.panels[idx].rect;
    const d = this.camera.position.distanceTo(v);
    return r.h / (2 * d * Math.tan((this.camera.fov * Math.PI) / 360));
  }

  render() {
    if (!window.innerWidth || !window.innerHeight) return; // a hidden, zero-sized page
    if (window.innerWidth !== this.cssW || window.innerHeight !== this.cssH) this.resize();
    this.layout();
    this.sky.position.copy(this.camera.position);
    if (this.moon.visible) this.moon.quaternion.copy(this.camera.quaternion);
    this.finish.uniforms.uTime.value = ATMOS.uTime.value;
    this.composer.render();
  }

  compile() {
    for (const g of this.twins) if (g) g.visible = true;
    this.renderer.compile(this.scene, this.camera);
  }
}
