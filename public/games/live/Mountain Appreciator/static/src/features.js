// The catalogue of differences. Each one knows where on a mountain it could
// plausibly be, how it changes the ground or what it puts on it, and what an
// appreciator would say about it.

import * as THREE from 'three';
import { RES, HALF, SEA, toWorld, toGrid } from './terrain.js';
import { smoothstep, lerp } from './noise.js';
import { ATMOS, NOISE_GLSL, std, glowMat, cloudMat, waterMaterial, waterfallMaterial, rockGeometry, puffTexture, treeMaterial, pineGeometry, juniperGeometry } from './gfx.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------------------
// Site finding

function findSite(ctx, test, o = {}) {
  const { rng, field, A } = ctx;
  const cands = [];
  for (let t = 0; t < (o.tries || 1400); t++) {
    const i = rng.int(4, RES - 5), j = rng.int(4, RES - 5), k = j * RES + i;
    const c = { x: toWorld(i), z: toWorld(j), k };
    c.h = field.h[k];
    if (c.h < SEA + 4) continue;
    c.slope = A.slope[k];
    c.cav = A.cav[k];
    c.flow = A.flow[k];
    c.dSummit = Math.hypot(c.x - ctx.summit.x, c.z - ctx.summit.z);
    const s = test(c);
    if (!(s > 0)) continue;
    cands.push([s + rng.next() * 0.6, c]);
  }
  cands.sort((a, b) => b[0] - a[0]);
  for (const [, c] of cands) {
    if (!ctx.spaced(c.x, c.z, (ctx.radius ?? 8) + 6)) continue;
    if (o.sight !== false && !ctx.sightOk(c, o)) continue;
    return c;
  }
  return null;
}

function traceDown(field, x, z, { step = 1.4, max = 60, inertia = 0.55, stop } = {}) {
  const pts = [[x, z]];
  let dx = 0, dz = 0;
  for (let s = 0; s < max; s++) {
    const [gx, gz] = field.gradient(x, z);
    const l = Math.hypot(gx, gz);
    if (l < 1e-4) break;
    dx = dx * inertia - (gx / l) * (1 - inertia);
    dz = dz * inertia - (gz / l) * (1 - inertia);
    const l2 = Math.hypot(dx, dz);
    dx /= l2; dz /= l2;
    x += dx * step; z += dz * step;
    if (Math.abs(x) > HALF - 4 || Math.abs(z) > HALF - 4) break;
    pts.push([x, z]);
    if (stop && stop(x, z, field.height(x, z), l)) break;
  }
  return pts;
}

// Write max(existing, fn(d)) into one channel of a 4-wide per-vertex array.
function stamp(arr, ch, x, z, r, fn) {
  const i0 = Math.max(0, Math.floor(toGrid(x - r))), i1 = Math.min(RES - 1, Math.ceil(toGrid(x + r)));
  const j0 = Math.max(0, Math.floor(toGrid(z - r))), j1 = Math.min(RES - 1, Math.ceil(toGrid(z + r)));
  for (let j = j0; j <= j1; j++) {
    for (let i = i0; i <= i1; i++) {
      const wx = toWorld(i), wz = toWorld(j);
      const d = Math.hypot(wx - x, wz - z);
      if (d > r) continue;
      const k = (j * RES + i) * 4 + ch;
      arr[k] = Math.max(arr[k], fn(d, wx, wz));
    }
  }
}

function stampPath(arr, ch, path, w0, w1, noise) {
  path.forEach(([x, z], i) => {
    const w = lerp(w0, w1, i / Math.max(1, path.length - 1));
    stamp(arr, ch, x, z, w, (d, wx, wz) => smoothstep(w, w * 0.35, d * (1 + 0.25 * noise(wx * 0.15, wz * 0.15))));
  });
}

const downhillAngle = (field, x, z) => {
  const [gx, gz] = field.gradient(x, z);
  return Math.atan2(-gx, -gz);
};

const mesh = (geo, mat, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = shadow;
  m.receiveShadow = true;
  return m;
};

const samplePath = (path, field, lift, every = 6) => {
  const out = [];
  for (let i = 0; i < path.length; i += every) out.push(V(path[i][0], field.height(path[i][0], path[i][1]) + lift, path[i][1]));
  const last = path[path.length - 1];
  out.push(V(last[0], field.height(last[0], last[1]) + lift, last[1]));
  return out;
};

// ---------------------------------------------------------------------------
// Little models

function hutModel(field, x, z, ang, roof) {
  const g = new THREE.Group();
  const w = 3.6, d = 2.8, wall = 1.9, roofH = 1.55, o = 0.3;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  let lo = Infinity, hi = -Infinity;
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]]) {
    const lx = (a * w) / 2, lz = (b * d) / 2;
    const hh = field.height(x + lx * ca + lz * sa, z - lx * sa + lz * ca);
    lo = Math.min(lo, hh); hi = Math.max(hi, hh);
  }
  const bodyH = hi - lo + wall + 0.6;
  const body = mesh(new THREE.BoxGeometry(w, bodyH, d), std('#cfc4b0'));
  body.position.y = lo - 0.6 + bodyH / 2;
  g.add(body);
  const shape = new THREE.Shape();
  shape.moveTo(-d / 2 - o, 0);
  shape.lineTo(d / 2 + o, 0);
  shape.lineTo(0, roofH);
  shape.closePath();
  const rg = new THREE.ExtrudeGeometry(shape, { depth: w + 2 * o, bevelEnabled: false });
  rg.translate(0, 0, -(w + 2 * o) / 2);
  rg.rotateY(Math.PI / 2);
  const rf = mesh(rg, std(roof));
  rf.position.y = hi + wall;
  g.add(rf);
  for (const sx of [-0.9, 0.9]) {
    const win = mesh(new THREE.PlaneGeometry(0.6, 0.5), glowMat, false);
    win.position.set(sx, hi + wall * 0.55, d / 2 + 0.02);
    g.add(win);
  }
  const door = mesh(new THREE.PlaneGeometry(0.62, 1.15), std('#4a3426'), false);
  door.position.set(0, hi + 0.57, d / 2 + 0.02);
  g.add(door);
  const ch = mesh(new THREE.BoxGeometry(0.45, 1.25, 0.45), std('#8b8178'));
  ch.position.set(w * 0.28, hi + wall + roofH * 0.55, -d * 0.18);
  g.add(ch);
  g.position.set(x, 0, z);
  g.rotation.y = ang;
  return g;
}

function ibexModel() {
  const g = new THREE.Group();
  const fur = std('#8c7457'), dark = std('#3d3229'), horn = std('#6b5a48');
  const body = mesh(new THREE.BoxGeometry(1.6, 0.8, 0.62), fur);
  body.position.y = 1.2;
  const neck = mesh(new THREE.BoxGeometry(0.36, 0.7, 0.36), fur);
  neck.position.set(0.78, 1.62, 0);
  neck.rotation.z = -0.5;
  const head = mesh(new THREE.BoxGeometry(0.58, 0.34, 0.32), fur);
  head.position.set(1.05, 1.95, 0);
  head.rotation.z = -0.35;
  g.add(body, neck, head);
  for (const [lx, lz] of [[-0.6, 0.2], [-0.6, -0.2], [0.58, 0.2], [0.58, -0.2]]) {
    const leg = mesh(new THREE.BoxGeometry(0.17, 0.9, 0.17), dark);
    leg.position.set(lx, 0.45, lz);
    g.add(leg);
  }
  for (const s of [-1, 1]) {
    const h = mesh(new THREE.TorusGeometry(0.5, 0.075, 4, 8, Math.PI * 0.85), horn);
    h.position.set(0.5, 2.05, s * 0.09);
    g.add(h);
  }
  const beard = mesh(new THREE.BoxGeometry(0.12, 0.25, 0.12), dark);
  beard.position.set(1.25, 1.72, 0);
  g.add(beard);
  g.scale.setScalar(1.25);
  return g;
}

function deerModel(stag) {
  const g = new THREE.Group();
  const coat = std('#8a5a34'), dark = std('#3d2a1c');
  const body = mesh(new THREE.BoxGeometry(1.5, 0.62, 0.5), coat);
  body.position.y = 1.15;
  const neck = mesh(new THREE.BoxGeometry(0.28, 0.72, 0.28), coat);
  neck.position.set(0.72, 1.62, 0);
  neck.rotation.z = -0.45;
  const head = mesh(new THREE.BoxGeometry(0.5, 0.26, 0.26), coat);
  head.position.set(1.0, 1.96, 0);
  head.rotation.z = -0.25;
  const rump = mesh(new THREE.BoxGeometry(0.06, 0.4, 0.4), std('#d9c7a6'));
  rump.position.set(-0.77, 1.2, 0);
  g.add(body, neck, head, rump);
  for (const [lx, lz] of [[-0.6, 0.17], [-0.6, -0.17], [0.6, 0.17], [0.6, -0.17]]) {
    const leg = mesh(new THREE.BoxGeometry(0.12, 0.9, 0.12), dark);
    leg.position.set(lx, 0.45, lz);
    g.add(leg);
  }
  if (stag) {
    for (const sz of [-1, 1]) {
      const beam = mesh(new THREE.BoxGeometry(0.07, 0.8, 0.07), std('#cbb89a'));
      beam.position.set(0.92, 2.42, sz * 0.2);
      beam.rotation.set(sz * 0.35, 0, 0.35);
      const tine = mesh(new THREE.BoxGeometry(0.06, 0.38, 0.06), std('#cbb89a'));
      tine.position.set(1.1, 2.45, sz * 0.24);
      tine.rotation.set(sz * 0.2, 0, -0.5);
      g.add(beam, tine);
    }
  }
  g.userData.head = head;
  g.scale.setScalar(1.2);
  return g;
}

function bearModel() {
  const g = new THREE.Group();
  const fur = std('#5a3c27', { flat: false }), dark = std('#2f2119');
  const body = mesh(new THREE.SphereGeometry(1, 9, 7), fur);
  body.scale.set(1.6, 0.95, 0.9);
  body.position.y = 1.35;
  const hump = mesh(new THREE.SphereGeometry(0.6, 8, 6), fur);
  hump.position.set(0.55, 1.95, 0);
  const head = mesh(new THREE.SphereGeometry(0.55, 8, 6), fur);
  head.position.set(1.7, 1.55, 0);
  const snout = mesh(new THREE.BoxGeometry(0.5, 0.32, 0.34), std('#7a5a40'));
  snout.position.set(0.5, -0.1, 0);
  head.add(snout);
  for (const sz of [-1, 1]) {
    const ear = mesh(new THREE.SphereGeometry(0.17, 5, 4), fur);
    ear.position.set(-0.05, 0.48, sz * 0.32);
    head.add(ear);
  }
  g.add(body, hump, head);
  for (const [lx, lz] of [[-0.9, 0.45], [-0.9, -0.45], [0.9, 0.45], [0.9, -0.45]]) {
    const leg = mesh(new THREE.CylinderGeometry(0.25, 0.22, 1.0, 6), dark);
    leg.position.set(lx, 0.5, lz);
    g.add(leg);
  }
  g.userData.head = head;
  return g;
}

function marmotModel(rng) {
  const g = new THREE.Group();
  const fur = std('#9a7448', { flat: false });
  const rock = mesh(rockGeometry(rng, 0.9, 0), std('#8d8a84'));
  rock.scale.set(1.3, 0.6, 1.1);
  rock.position.y = 0.2;
  const body = mesh(new THREE.SphereGeometry(0.42, 8, 6), fur);
  body.scale.set(1, 1.45, 0.9);
  body.position.y = 1.15;
  const head = mesh(new THREE.SphereGeometry(0.3, 8, 6), fur);
  head.position.y = 1.85;
  const nose = mesh(new THREE.BoxGeometry(0.16, 0.12, 0.14), std('#c4a477'));
  nose.position.set(0.28, 1.8, 0);
  g.add(rock, body, head, nose);
  g.userData.head = head;
  g.scale.setScalar(1.3);
  return g;
}

function eagleModel(color = '#3a2a1f', headColor = '#c9a46a') {
  const g = new THREE.Group();
  const m = std(color, { side: THREE.DoubleSide });
  const body = mesh(new THREE.ConeGeometry(0.24, 1.5, 5), m);
  body.rotation.x = Math.PI / 2;
  const head = mesh(new THREE.SphereGeometry(0.2, 5, 4), std(headColor));
  head.position.z = 0.82;
  g.add(body, head);
  const wing = new THREE.BufferGeometry();
  wing.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.35, 0, 0, -0.35, 2.3, 0, -0.55, 0, 0, 0.35, 2.3, 0, -0.55, 2.0, 0, 0.2], 3));
  wing.computeVertexNormals();
  const L = mesh(wing, m), R = mesh(wing, m);
  R.scale.x = -1;
  g.add(L, R);
  const tail = mesh(new THREE.ConeGeometry(0.35, 0.7, 3).rotateX(-Math.PI / 2), m);
  tail.position.z = -0.95;
  tail.scale.y = 0.2;
  g.add(tail);
  g.userData.wings = [L, R];
  return g;
}

function lensCloud(R) {
  const prof = [];
  for (let i = 0; i <= 14; i++) {
    const a = (i / 14) * Math.PI;
    const y = Math.cos(a);
    prof.push(new THREE.Vector2(Math.max(0.001, Math.sin(a)), y < 0 ? y * 0.45 : y));
  }
  const g = new THREE.Group();
  [[R, 0, 3.0], [R * 0.86, 2.2, 2.4], [R * 0.7, 4.0, 2.0], [R * 0.5, 5.6, 1.6]].forEach(([r, y, t], i) => {
    const m = mesh(new THREE.LatheGeometry(prof, 36), cloudMat);
    m.scale.set(r, t, r * 0.68);
    m.position.set(i * 1.2, y, i * 0.4);
    m.renderOrder = 20 + i;
    g.add(m);
  });
  return g;
}

function sprites(n, color, opacity) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTexture(), color, transparent: true, opacity, depthWrite: false }));
    g.add(s);
  }
  return g;
}

function ribbon(field, path, w0, w1) {
  const pts = path.map(([x, z]) => V(x, field.height(x, z), z));
  const pos = [], uv = [], idx = [];
  let len = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const t = b.clone().sub(a).setY(0).normalize();
    const side = V(-t.z, 0, t.x);
    const [nx, ny, nz] = field.normal(p.x, p.z);
    const lift = V(nx, ny, nz).multiplyScalar(0.45);
    const w = lerp(w0, w1, i / (pts.length - 1)) / 2;
    if (i > 0) len += p.distanceTo(pts[i - 1]);
    const l = p.clone().add(lift).addScaledVector(side, -w), r = p.clone().add(lift).addScaledVector(side, w);
    pos.push(l.x, l.y, l.z, r.x, r.y, r.z);
    uv.push(0, len, 1, len);
    if (i > 0) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

// ---------------------------------------------------------------------------
// The sky. Things up there sit far out on a sphere around the opening
// viewpoint, placed by their angle from the middle of that view, so they rise
// just above the mountain where the player is already looking.

const DEG = Math.PI / 180;
export const SKY_R = 4500;

export function skyPoint(ctx, off, el, R = SKY_R) {
  const az = ctx.viewAz + off * DEG, e = el * DEG;
  return V(ctx.eye.x + Math.sin(az) * Math.cos(e) * R, ctx.eye.y + Math.sin(e) * R, ctx.eye.z + Math.cos(az) * Math.cos(e) * R);
}

// A free patch of sky (angles in degrees), clear of the moon and anything else up there.
function skySpot(ctx, { lo = 4, hi = 11, spread = 8, r = 3 } = {}) {
  for (let i = 0; i < 80; i++) {
    const off = ctx.rng.range(-spread, spread), el = ctx.rng.range(lo, hi);
    if (ctx.skySpots.some((q) => Math.hypot(q.off - off, q.el - el) < q.r + r + 0.5)) continue;
    return { off, el, r, sky: true, x: 1e5 + off * 40, z: 1e5 + el * 40 };
  }
  return null;
}

// A small shader for glows, light and weather. vLocal is the untransformed position.
function fx(frag, uniforms = {}, { additive = true } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: ATMOS.uTime, uNight: ATMOS.uNight, uMoon: ATMOS.uMoon, uSunColor: ATMOS.uSunColor, uAmbient: ATMOS.uAmbient, ...uniforms },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vLocal;
      void main() { vUv = uv; vLocal = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform float uNight; uniform float uMoon; uniform vec3 uSunColor; uniform vec3 uAmbient;
      varying vec2 vUv; varying vec3 vLocal;
      ${NOISE_GLSL}
      ${frag}`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
}

function facing(geo, mat, pos, eye) {
  const m = new THREE.Mesh(geo, mat);
  m.position.copy(pos);
  m.lookAt(eye);
  m.renderOrder = 2;
  m.frustumCulled = false;
  return m;
}

// A quad from a to b, w wide, turned to face the eye. uv.x runs a to b.
function strip(a, b, wa, wb, eye, mat) {
  const view = a.clone().sub(eye).normalize();
  const side = b.clone().sub(a).cross(view).normalize();
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([
    ...a.clone().addScaledVector(side, -wa).toArray(), ...a.clone().addScaledVector(side, wa).toArray(),
    ...b.clone().addScaledVector(side, -wb).toArray(), ...b.clone().addScaledVector(side, wb).toArray(),
  ], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 0, 1, 1, 0, 1, 1], 2));
  g.setIndex([0, 1, 2, 1, 3, 2]);
  const m = new THREE.Mesh(g, mat);
  m.renderOrder = 2;
  m.frustumCulled = false;
  return m;
}

// Soft points that hold their size on screen. blink: 0 steady, 1 twinkle, 2 firefly.
function glowPoints(list, color, blink = 0, nightOnly = true) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(list.flatMap((q) => [q.p.x, q.p.y, q.p.z]), 3));
  g.setAttribute('aSize', new THREE.Float32BufferAttribute(list.map((q) => q.size), 1));
  g.setAttribute('aPhase', new THREE.Float32BufferAttribute(list.map((q) => q.phase ?? 0), 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: ATMOS.uTime, uPx: ATMOS.uPx, uNight: ATMOS.uNight, uColor: { value: new THREE.Color(color) },
      uBlink: { value: blink }, uNightOnly: { value: nightOnly ? 1 : 0 },
    },
    vertexShader: /* glsl */ `
      attribute float aSize; attribute float aPhase; uniform float uPx; varying float vPhase;
      void main() { vPhase = aPhase; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_PointSize = aSize * uPx; }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform float uNight; uniform vec3 uColor; uniform float uBlink; uniform float uNightOnly; varying float vPhase;
      void main() {
        vec2 q = gl_PointCoord * 2.0 - 1.0;
        float r2 = dot(q, q);
        float a = exp(-r2 * 6.0) * 0.6 + exp(-r2 * 28.0);
        float tw = uBlink > 1.5 ? pow(max(sin(uTime * 1.3 + vPhase * 6.283), 0.0), 4.0)
                 : uBlink > 0.5 ? 0.72 + 0.28 * sin(uTime * (2.0 + vPhase) + vPhase * 30.0) : 1.0;
        a *= tw * mix(1.0, uNight, uNightOnly);
        gl_FragColor = vec4(uColor * a, a);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(g, mat);
  pts.frustumCulled = false;
  pts.renderOrder = 3;
  return pts;
}

const ASTERISMS = [
  { name: 'The Plough', note: 'Follow its last two stars and they point to the Pole Star.', stars: [[0, 0], [2.2, 0.5], [4, 0.6], [5.6, 0], [6, -2], [8.2, -2.4], [8.6, -0.4]] },
  { name: 'Cassiopeia', note: 'The W, sitting opposite the Plough across the pole.', stars: [[0, 0], [1.6, -1.8], [3.2, -0.6], [4.6, -2.2], [6.4, -0.8]] },
  { name: 'Orion', note: 'Two shoulders, two feet, and a belt of three in a row.', stars: [[0, 3.5], [4.2, 3.8], [1.6, 0.2], [2.1, 0], [2.6, -0.2], [0.4, -3.6], [4, -3.4]] },
  { name: 'The Pleiades', note: 'A young star cluster. Most people can count six.', stars: [[0, 0], [0.65, 0.4], [1.2, -0.1], [0.5, -0.65], [1.6, 0.5], [2, -0.4], [1.2, 1]] },
  { name: 'The Southern Cross', note: 'Its long bar points toward the south celestial pole.', stars: [[0, 2.4], [0, -2.4], [-1.6, 0.4], [1.8, 0.9], [0.7, -0.6]] },
];

// The two tarns (one of them may be frozen) share a site and a basin.
const tarnFind = (ctx) => findSite(ctx, (c) => (c.h > ctx.H * 0.22 && c.h < ctx.H * 0.66 && c.slope < 0.8 && c.cav > -0.3 ? 1.2 + c.cav * 0.6 - c.slope : 0));
const tarnPrep = (s, ctx) => {
  s.R = ctx.rng.range(7, 9.5);
  s.level = ctx.field.height(s.x, s.z) - 0.2;
};
function tarnBasin(field, s) {
  const { R, level } = s;
  field.edit(s.x, s.z, R * 1.95, (h, d) => {
    const target = d < R ? level - 2.6 * (1 - (d / R) * (d / R)) : level + (d - R) * 0.06;
    return lerp(h, target, 1 - smoothstep(R * 1.12, R * 1.9, d));
  });
}
function tarnSurface(s, mat) {
  const w = new THREE.Mesh(new THREE.CircleGeometry(s.R, 40).rotateX(-Math.PI / 2), mat);
  w.position.set(s.x, s.level - 0.3, s.z);
  return w;
}

// ---------------------------------------------------------------------------
// The catalogue

const notDesert = (c) => c.biomeId !== 'desert';
const snowy = (c) => c.snowline < c.H * 0.95;

export const FEATURES = [
  {
    id: 'hut', cat: 'traces', tier: 1,
    title: (c) => (c.biomeId === 'desert' ? 'A line shack' : 'A refuge hut'),
    notes: ['Every plank of it was carried up on someone’s back.', 'Somewhere to wait out the weather with strangers.', 'Warm soup, cold dormitory, and a view of this exact twin.'],
    keep: ['You kept the one with the hut. You like somewhere to sleep.', 'You kept the one without the hut. A mountain nobody has improved.'],
    radius: 7, minPx: 26, clear: 8,
    find: (ctx) => findSite(ctx, (c) => (c.h > ctx.H * 0.2 && c.h < ctx.H * 0.62 && c.slope < 0.75 ? 1.6 - c.slope * 2 : 0)),
    build(s, field, has) {
      if (!has) return null;
      return hutModel(field, s.x, s.z, downhillAngle(field, s.x, s.z), s.roof);
    },
    prep: (s, ctx) => { s.roof = ctx.rng.pick(['#9c3b2b', '#a4492c', '#3f4c5c', '#5a3b2e']); },
    points: (s, field) => [V(s.x, field.height(s.x, s.z) + 2.5, s.z)],
  },

  {
    id: 'tarn', cat: 'water', tier: 1,
    title: (c) => (c.biomeId === 'desert' ? 'A tinaja' : 'A tarn'),
    notes: ['A small lake sitting in the hollow a glacier left behind.', 'On a still evening it holds a second, upside-down mountain.', 'Cold enough to make you shout. People swim in it anyway.'],
    keep: ['You kept the one with the tarn. Water makes a mountain look thoughtful.', 'You kept the dry one. No reflections, no distractions.'],
    radius: 11, minPx: 26, clear: 18,
    allow: (c) => c.archId !== 'spires',
    find: tarnFind,
    prep: tarnPrep,
    terrain(field, s, has) { if (has) tarnBasin(field, s); },
    build: (s, field, has) => (has ? tarnSurface(s, waterMaterial()) : null),
    points: (s) => [V(s.x, s.level, s.z)],
  },

  {
    id: 'peak', cat: 'land', tier: 1,
    title: (c) => (c.archId === 'volcano' ? 'A parasitic cone' : c.archId === 'mesa' ? 'A second butte' : 'A subsidiary summit'),
    notes: ['Climbers argue about whether it counts as its own mountain.', 'The kind of summit you reach thinking you’re done. You aren’t.', 'A smaller vent that opened on the flank and built its own little hill.'],
    keep: ['You kept the one with the extra summit. More mountain for the money.', 'You kept the simpler skyline.'],
    radius: 12, minPx: 30,
    allow: (c) => c.archId !== 'mesa',
    find: (ctx) => findSite(ctx, (c) => (c.h > ctx.H * 0.36 && c.h < ctx.H * 0.72 && c.dSummit > 38 && c.cav < 0.2 ? 1 - c.cav * 0.5 : 0), { lift: 8 }),
    prep: (s, ctx) => { s.A = ctx.H * ctx.rng.range(0.11, 0.15); s.w = ctx.rng.range(10, 13); s.top = s.h + s.A; },
    terrain(field, s, has, ctx) {
      if (!has) return;
      const cone = ctx.archId === 'volcano';
      field.edit(s.x, s.z, s.w * 1.05, (h, d, x, z) => {
        const t = Math.max(0, 1 - d / s.w);
        let add = s.A * Math.pow(t, cone ? 1.15 : 1.7) * (1 + 0.18 * ctx.noise(x * 0.3, z * 0.3));
        if (cone) add -= s.A * 0.18 * smoothstep(0.82, 1, t);
        return h + add;
      });
    },
    points: (s, field) => [V(s.x, field.height(s.x, s.z) + 1.5, s.z)],
  },

  {
    id: 'col', cat: 'land', tier: 2,
    title: (c) => (c.archId === 'mesa' ? 'A notch in the rim' : 'A col'),
    notes: ['The low saddle in a ridge, where weather crosses over.', 'Frost cut this notch one winter at a time.', 'Where a ridge stops to catch its breath.'],
    keep: ['You kept the one with the notch. You like a ridge with a flaw in it.', 'You kept the unbroken ridge.'],
    radius: 11, minPx: 28,
    allow: (c) => c.archId !== 'spires',
    find: (ctx) => findSite(ctx, (c) => (c.h > ctx.H * (ctx.archId === 'mesa' ? 0.8 : 0.5) && c.h < ctx.H * 0.93 && c.dSummit > 24 && c.cav < -0.25 ? -c.cav : 0), { lift: 2 }),
    prep: (s, ctx) => { s.D = ctx.H * ctx.rng.range(0.07, 0.095); s.w = ctx.rng.range(6.5, 8.5); },
    terrain(field, s, has) {
      if (!has) return;
      field.edit(s.x, s.z, s.w * 2.4, (h, d) => h - s.D * Math.exp(-(d * d) / (s.w * s.w)));
    },
    points: (s, field) => [V(s.x, field.height(s.x, s.z) + 1, s.z)],
  },

  {
    id: 'glacier', cat: 'land', tier: 1,
    title: () => 'A glacier',
    notes: ['Moving faster than it looks, slower than you can watch.', 'Still finishing the valley it started.', 'Last winter’s snow, and a few hundred winters before it.'],
    keep: ['You kept the one with the glacier. You like a mountain that’s still working.', 'You kept the one without the glacier. Bare rock, honest about itself.'],
    radius: 10, minPx: 26, clear: 0,
    allow: (c) => notDesert(c) && snowy(c),
    find(ctx) {
      for (let attempt = 0; attempt < 8; attempt++) {
        const s = findSite(ctx, (c) => (c.h > ctx.snowline - 4 && c.h < ctx.H * 0.88 && c.cav > 0.1 && c.slope > 0.15 && c.slope < 1.6 ? c.cav : 0), { tries: 700, sight: false });
        if (!s) return null;
        const path = traceDown(ctx.field, s.x, s.z, { step: 1.5, max: 50, stop: (x, z, h, sl) => h < ctx.treeline - 2 || sl < 0.06 });
        if (path.length < 11) continue;
        s.path = path;
        const mid = path[Math.floor(path.length / 2)];
        if (!ctx.sightOk({ x: mid[0], z: mid[1], h: ctx.field.height(mid[0], mid[1]) }, { lift: 1.5 })) continue;
        return s;
      }
      return null;
    },
    mask(aux, s, has, ctx) { if (has) stampPath(aux, 0, s.path, 9.5, 4.5, ctx.noise); },
    points: (s, field) => samplePath(s.path, field, 1.2, 7),
  },

  {
    id: 'forest', cat: 'trees', tier: 1,
    title: (c) => (c.biomeId === 'desert' ? 'A juniper grove' : 'A stand of pines'),
    notes: ['Holding the slope together, root by root.', 'It keeps the snow from sliding in spring.', 'Quieter inside than you’d expect.'],
    keep: ['You kept the one with the forest. You like a mountain with some shade.', 'You kept the one with the open meadow.'],
    radius: 15, minPx: 30, clear: 17,
    find: (ctx) => findSite(ctx, (c) => (c.h > SEA + 7 && c.h < ctx.treeline - 3 && c.slope < 0.85 ? 1.2 - c.slope : 0)),
    trees(s, has, ctx) {
      if (!has) return [];
      const out = [];
      for (let i = 0; i < 160; i++) {
        const a = ctx.rng.range(0, Math.PI * 2), r = Math.sqrt(ctx.rng.next()) * 15;
        const x = s.x + Math.cos(a) * r, z = s.z + Math.sin(a) * r;
        if (r > 15 * (0.75 + 0.25 * ctx.noise(x * 0.2, z * 0.2))) continue;
        out.push({ x, z, s: ctx.rng.range(0.85, 1.3), r: ctx.rng.range(0, 6.28), c: ctx.rng.pick(ctx.biome.trees) });
      }
      return out;
    },
    points: (s, field) => [V(s.x, field.height(s.x, s.z) + 2, s.z)],
  },

  {
    id: 'larches', cat: 'trees', tier: 2,
    title: () => 'Larches in autumn',
    notes: ['The only conifers that turn gold and drop their needles.', 'One twin has noticed the season. The other hasn’t yet.', 'Gold for two weeks a year. You caught it.'],
    keep: ['You kept the one with the golden larches. You like a mountain that keeps a calendar.', 'You kept the evergreen one. Steady.'],
    radius: 13, minPx: 28, clear: 14,
    allow: (c) => c.biome.tree === 'pine',
    find: (ctx) => findSite(ctx, (c) => (c.h > SEA + 8 && c.h < ctx.treeline - 2 && c.slope < 0.85 ? 1.2 - c.slope : 0)),
    trees(s, has, ctx) {
      const out = [];
      const r2 = ctx.rng.fork(Math.round(s.x * 31 + s.z));
      for (let i = 0; i < 90; i++) {
        const a = r2.range(0, Math.PI * 2), r = Math.sqrt(r2.next()) * 12;
        out.push({
          x: s.x + Math.cos(a) * r, z: s.z + Math.sin(a) * r, s: r2.range(0.9, 1.3), r: r2.range(0, 6.28),
          c: has ? r2.pick(['#d9a03a', '#c88a2c', '#e2b450', '#cf9433']) : r2.pick(ctx.biome.trees),
        });
      }
      return out;
    },
    points: (s, field) => [V(s.x, field.height(s.x, s.z) + 2, s.z)],
  },

  {
    id: 'waterfall', cat: 'water', tier: 1,
    title: (c) => (c.biomeId === 'desert' ? 'A pour-off' : 'A waterfall'),
    notes: ['Snowmelt taking the shortest way down.', 'The mountain, out loud.', 'You can hear it from the other twin. Probably.'],
    keep: ['You kept the one with the waterfall. You like a mountain that makes noise.', 'You kept the quiet one.'],
    radius: 9, minPx: 26, clear: 6,
    find(ctx) {
      for (let attempt = 0; attempt < 10; attempt++) {
        const s = findSite(ctx, (c) => (c.h > SEA + 18 && c.h < Math.min(ctx.snowline + 4, ctx.H * 0.72) && c.slope > 0.65 && c.cav > 0.25 ? c.slope + c.cav : 0), { tries: 900 });
        if (!s) return null;
        const path = traceDown(ctx.field, s.x, s.z, { step: 1.1, max: 14, inertia: 0.35, stop: (x, z, h, sl) => sl < 0.4 || h < SEA + 6 });
        const drop = s.h - ctx.field.height(...path[path.length - 1]);
        if (path.length < 7 || drop < 7) continue;
        s.path = path;
        return s;
      }
      return null;
    },
    build(s, field, has) {
      if (!has) return null;
      const g = new THREE.Group();
      g.add(new THREE.Mesh(ribbon(field, s.path, 1.0, 2.0), waterfallMaterial()));
      const end = s.path[s.path.length - 1];
      const mist = sprites(4, '#dfe6ea', 0.15);
      const base = V(end[0], field.height(end[0], end[1]) + 1.5, end[1]);
      g.add(mist);
      g.userData.update = (t) => {
        mist.children.forEach((sp, i) => {
          const ph = (t * 0.35 + i / 5) % 1;
          sp.position.set(base.x + Math.sin(i * 2.1) * 1.6, base.y + ph * 4, base.z + Math.cos(i * 1.7) * 1.6);
          sp.scale.setScalar(1.6 + ph * 3);
          sp.material.opacity = Math.sin(ph * Math.PI) * 0.14;
        });
      };
      return g;
    },
    points: (s, field) => samplePath(s.path, field, 0.6, 5),
  },

  {
    id: 'summit', cat: 'traces', tier: 3,
    title: (c, s) => ({ cross: 'A summit cross', cairn: 'A summit cairn', flag: 'A summit flag' })[s.kind],
    notes: [],
    noteFor: (s) => ({
      cross: 'Bolted on against the wind, a long way from the nearest bolt.',
      cairn: 'Each climber adds a stone, so the mountain grows a little every summer.',
      flag: 'Somebody was here and would like you to know.',
    })[s.kind],
    keep: ['You kept the one with something on top. You like proof that people were there.', 'You kept the one with a bare summit.'],
    radius: 6, minPx: 26,
    find(ctx) {
      const s = { ...ctx.summit };
      if (!ctx.spaced(s.x, s.z, 16)) return null;
      return s;
    },
    prep: (s, ctx) => { s.kind = ctx.rng.pick(['cross', 'cairn', 'flag']); },
    build(s, field, has) {
      if (!has) return null;
      const g = new THREE.Group();
      const y = field.height(s.x, s.z) - 0.3;
      if (s.kind === 'cross') {
        const m = std('#2f2b28');
        const post = mesh(new THREE.BoxGeometry(0.34, 4.6, 0.34), m);
        post.position.y = 2.3;
        const bar = mesh(new THREE.BoxGeometry(2.4, 0.32, 0.32), m);
        bar.position.y = 3.4;
        g.add(post, bar);
      } else if (s.kind === 'cairn') {
        let yy = 0;
        [1.1, 0.9, 0.75, 0.6, 0.42].forEach((r, i) => {
          const st = mesh(new THREE.DodecahedronGeometry(r, 0), std(i % 2 ? '#8e8a83' : '#77736c'));
          st.scale.y = 0.7;
          st.position.y = yy + r * 0.6;
          st.rotation.y = i;
          yy += r * 1.1;
          g.add(st);
        });
      } else {
        const pole = mesh(new THREE.CylinderGeometry(0.07, 0.09, 5, 5), std('#3a3530'));
        pole.position.y = 2.5;
        const fg = new THREE.PlaneGeometry(2.2, 1.3, 10, 4).translate(1.1, 0, 0);
        const flag = mesh(fg, std('#c8402e', { side: THREE.DoubleSide, flat: false }));
        flag.position.y = 4.3;
        g.add(pole, flag);
        const base = fg.attributes.position.array.slice();
        g.userData.update = (t) => {
          const p = fg.attributes.position;
          for (let i = 0; i < p.count; i++) {
            const x = base[i * 3];
            p.setZ(i, Math.sin(x * 2.2 - t * 6) * 0.22 * x);
          }
          p.needsUpdate = true;
          fg.computeVertexNormals();
        };
      }
      g.position.set(s.x, y, s.z);
      g.rotation.y = s.x * 0.37;
      return g;
    },
    points: (s, field) => [V(s.x, field.height(s.x, s.z) + 2, s.z)],
  },

  {
    id: 'ibex', cat: 'wildlife', tier: 3,
    title: (c) => (c.biomeId === 'desert' ? 'A bighorn sheep' : 'An ibex'),
    notes: ['Standing where nothing should be able to stand.', 'It has been watching you the whole time.', 'Unbothered by gradient.'],
    missed: 'It saw you, though.',
    keep: ['You kept the one with the ibex. You like a mountain that looks back.', 'You kept the one without the goat. Fewer witnesses.'],
    radius: 4, minPx: 22, clear: 3,
    find: (ctx) => findSite(ctx, (c) => (c.h > ctx.H * 0.3 && c.h < Math.min(ctx.H * 0.78, ctx.snowline - 6) && c.slope > 0.45 && c.slope < 1.1 && c.cav < 0.1 ? 1 : 0), { lift: 1.5 }),
    build(s, field, has, ctx) {
      if (!has) return null;
      const g = ibexModel();
      g.position.set(s.x, field.height(s.x, s.z) - 0.1, s.z);
      g.rotation.y = downhillAngle(field, s.x, s.z) + Math.PI / 2 + ctx.rng.range(-0.6, 0.6);
      const head = g.children[2];
      g.userData.update = (t) => { head.rotation.z = -0.35 + Math.max(0, Math.sin(t * 0.7)) * 0.25; };
      return g;
    },
    points: (s, field) => [V(s.x, field.height(s.x, s.z) + 1.6, s.z)],
  },

  {
    id: 'snowfield', cat: 'land', tier: 2,
    title: () => 'A late snowfield',
    notes: ['The last of last winter, hiding in the shade.', 'It may last all summer. Some years it does.', 'Snow that never got the message.'],
    keep: ['You kept the one with the snowfield. You like a mountain that holds on to things.', 'You kept the one that let the snow go.'],
    radius: 10, minPx: 26, clear: 12,
    allow: (c) => notDesert(c) && snowy(c),
    find: (ctx) => findSite(ctx, (c) => (c.h > ctx.snowline - 28 && c.h < ctx.snowline - 7 && c.h > SEA + 10 && c.cav > 0 && c.slope < 0.95 ? 0.5 + c.cav - c.slope * 0.3 : 0)),
    prep: (s, ctx) => { s.R = ctx.rng.range(8, 11); },
    mask(aux, s, has, ctx) {
      if (!has) return;
      stamp(aux, 2, s.x, s.z, s.R * 1.3, (d, x, z) => smoothstep(s.R, s.R * 0.4, d * (1 + 0.35 * ctx.noise(x * 0.18, z * 0.18))));
    },
    points: (s, field) => [V(s.x, field.height(s.x, s.z) + 1, s.z)],
  },

  {
    id: 'rockfall', cat: 'land', tier: 2,
    title: () => 'A rockfall scar',
    notes: ['Fresh, as mountains count time: a few centuries.', 'Where the mountain let go of a piece of itself.', 'Pale rock that hasn’t weathered yet. Give it a thousand years.'],
    keep: ['You kept the one with the rockfall. You like a mountain with a story.', 'You kept the intact one.'],
    radius: 9, minPx: 26, clear: 10,
    find(ctx) {
      for (let attempt = 0; attempt < 8; attempt++) {
        const s = findSite(ctx, (c) => (c.h > ctx.H * 0.35 && c.h < ctx.H * 0.82 && c.slope > 0.75 ? c.slope : 0), { tries: 500 });
        if (!s) return null;
        const path = traceDown(ctx.field, s.x, s.z, { step: 1.4, max: 32, inertia: 0.5, stop: (x, z, h, sl) => sl < 0.3 || h < SEA + 4 });
        if (path.length < 12) continue;
        s.path = path;
        return s;
      }
      return null;
    },
    mask(aux, s, has, ctx) { if (has) stampPath(aux, 1, s.path, 3, 9, ctx.noise); },
    build(s, field, has, ctx) {
      if (!has) return null;
      const g = new THREE.Group();
      const end = s.path[s.path.length - 1];
      const r2 = ctx.rng.fork(77);
      const mat = std(ctx.biome.scar);
      for (let i = 0; i < 14; i++) {
        const a = r2.range(0, Math.PI * 2), r = r2.range(0, 7);
        const x = end[0] + Math.cos(a) * r, z = end[1] + Math.sin(a) * r;
        const rk = mesh(rockGeometry(r2, r2.range(0.45, 1.2), 0), mat);
        rk.position.set(x, field.height(x, z) + 0.2, z);
        rk.rotation.set(r2.range(0, 3), r2.range(0, 3), 0);
        g.add(rk);
      }
      return g;
    },
    points: (s, field) => samplePath(s.path, field, 1, 6),
  },

  {
    id: 'eagle', cat: 'wildlife', when: 'day', tier: 2,
    title: (c) => (c.biomeId === 'desert' ? 'A red-tailed hawk' : 'A golden eagle'),
    notes: ['Riding the warm air up the slope without a single wingbeat.', 'It can see the ibex. It can see you.', 'Circling the same thermal it circled yesterday.'],
    keep: ['You kept the one with the eagle. You like a mountain that’s being watched over.', 'You kept the one with the empty sky.'],
    radius: 6, minPx: 34, air: true,
    find: (ctx) => findSite(ctx, (c) => (c.h > ctx.H * 0.5 && c.h < ctx.H * 0.85 && c.cav < 0 ? 1 : 0), { lift: 16, air: true }),
    prep: (s, ctx) => { s.cy = s.h + ctx.rng.range(14, 20); s.R = ctx.rng.range(10, 14); s.w = ctx.rng.range(0.28, 0.4) * ctx.rng.sign(); s.ph = ctx.rng.range(0, 6.28); },
    pos: (s, t) => V(s.x + Math.cos(t * s.w + s.ph) * s.R, s.cy + Math.sin(t * 0.4) * 1.5, s.z + Math.sin(t * s.w + s.ph) * s.R),
    build(s, field, has) {
      if (!has) return null;
      const g = eagleModel();
      const [L, R] = g.userData.wings;
      g.userData.update = (t) => {
        const a = t * s.w + s.ph;
        g.position.set(s.x + Math.cos(a) * s.R, s.cy + Math.sin(t * 0.4) * 1.5, s.z + Math.sin(a) * s.R);
        const vx = -Math.sin(a) * Math.sign(s.w), vz = Math.cos(a) * Math.sign(s.w);
        g.rotation.set(0, Math.atan2(vx, vz), 0);
        g.rotateZ(0.35 * Math.sign(s.w));
        const cyc = t % 7;
        const flap = cyc < 1.4 ? Math.sin(cyc * 11) * 0.55 : 0.08;
        L.rotation.z = flap;
        R.rotation.z = -flap;
      };
      g.userData.update(0);
      return g;
    },
    points: (s) => [V(s.x, s.cy, s.z)],
  },

  {
    id: 'lenticular', cat: 'weather', tier: 1,
    title: () => 'A lenticular cloud',
    notes: ['Wind piling up over the summit and standing perfectly still.', 'The mountain is wearing a hat made of weather.', 'Pilots steer around these. Appreciators stare at them.'],
    keep: ['You kept the one wearing the cloud. You like a mountain with a sense of occasion.', 'You kept the one with the clear summit.'],
    radius: 20, minPx: 40, air: true,
    find(ctx) {
      const s = { ...ctx.summit };
      if (!ctx.spaced(s.x, s.z, 18)) return null;
      return s;
    },
    prep: (s, ctx) => { s.cy = s.h + ctx.rng.range(3, 6); s.R = ctx.rng.range(14, 18); s.rot = ctx.rng.range(0, 6.28); },
    build(s, field, has) {
      if (!has) return null;
      const g = lensCloud(s.R);
      g.position.set(s.x, s.cy, s.z);
      g.rotation.y = s.rot;
      return g;
    },
    points: (s) => [V(s.x, s.cy + 2, s.z)],
  },

  {
    id: 'deer', cat: 'wildlife', tier: 2,
    title: (c) => (c.biomeId === 'desert' ? 'Mule deer' : 'Red deer'),
    notes: ['Up in the high meadows for the summer grass.', 'A small herd. One of them has already seen you.', 'They come up at dusk and are gone by morning.'],
    keep: ['You kept the one with the deer. You like a mountain with company.', 'You kept the one with the empty meadow.'],
    radius: 9, minPx: 28, clear: 10,
    find: (ctx) => findSite(ctx, (c) => (c.h > SEA + 6 && c.h < Math.min(ctx.treeline + 10, ctx.H * 0.5) && c.slope < 0.55 ? 1.2 - c.slope * 2 : 0)),
    build(s, field, has, ctx) {
      if (!has) return null;
      const g = new THREE.Group();
      const r2 = ctx.rng.fork(123);
      const herd = [];
      for (let i = 0; i < 6; i++) {
        const a = r2.range(0, Math.PI * 2), r = Math.sqrt(r2.next()) * 6;
        const x = s.x + Math.cos(a) * r, z = s.z + Math.sin(a) * r;
        const d = deerModel(i === 0);
        d.position.set(x, field.height(x, z) - 0.05, z);
        d.rotation.y = r2.range(0, 6.28);
        g.add(d);
        herd.push([d.userData.head, r2.range(0, 6)]);
      }
      g.userData.update = (t) => { for (const [h, p] of herd) h.rotation.z = -0.25 - Math.max(0, Math.sin(t * 0.4 + p)) * 1.1; };
      return g;
    },
    points: (s, field) => [V(s.x, field.height(s.x, s.z) + 1.5, s.z)],
  },

  {
    id: 'boulder', cat: 'land', tier: 3,
    title: () => 'A glacial erratic',
    notes: ['Carried here by ice ten thousand years ago, then left.', 'A boulder from somewhere else entirely.', 'The ice went home. The boulder stayed.'],
    keep: ['You kept the one with the boulder. You like a mountain with a souvenir.', 'You kept the tidier one.'],
    radius: 5, minPx: 24, clear: 6,
    find: (ctx) => findSite(ctx, (c) => (c.h > SEA + 6 && c.h < ctx.H * 0.6 && c.slope < 0.65 ? 1.2 - c.slope : 0), { lift: 2 }),
    build(s, field, has, ctx) {
      if (!has) return null;
      const r2 = ctx.rng.fork(5);
      const b = mesh(rockGeometry(r2, 2.5, 1), std(ctx.biome.rockB));
      b.scale.set(1.35, 0.95, 1.1);
      b.position.set(s.x, field.height(s.x, s.z) + 0.9, s.z);
      b.rotation.y = r2.range(0, 6.28);
      return b;
    },
    points: (s, field) => [V(s.x, field.height(s.x, s.z) + 2, s.z)],
  },

  {
    id: 'fumarole', cat: 'land', tier: 1,
    title: () => 'A fumarole',
    notes: ['The mountain is still warm inside.', 'Steam and sulphur. Not a place for lunch.', 'Proof this one is only sleeping.'],
    keep: ['You kept the steaming one. You like a mountain with a pulse.', 'You kept the quiet volcano. Hopefully it stays that way.'],
    radius: 8, minPx: 30,
    allow: (c) => c.archId === 'volcano',
    find: (ctx) => findSite(ctx, (c) => (c.h > ctx.H * 0.55 && c.h < ctx.H * 0.9 ? 1 : 0), { lift: 5 }),
    mask(aux, s, has) { if (has) stamp(aux, 1, s.x, s.z, 5, (d) => smoothstep(5, 1.5, d)); },
    build(s, field, has) {
      if (!has) return null;
      const g = sprites(12, '#ffffff', 0.4);
      const y = field.height(s.x, s.z);
      g.userData.update = (t) => {
        g.children.forEach((sp, i) => {
          const ph = (t * 0.16 + i / 12) % 1;
          sp.position.set(s.x + ph * 5 + Math.sin(i) * 0.6, y + 1 + ph * 15, s.z + ph * 2 + Math.cos(i) * 0.6);
          sp.scale.setScalar(2 + ph * 9);
          sp.material.opacity = Math.sin(ph * Math.PI) * 0.45;
        });
      };
      return g;
    },
    points: (s, field) => [V(s.x, field.height(s.x, s.z) + 5, s.z)],
  },

  {
    id: 'hoodoo', cat: 'land', tier: 1,
    title: () => 'A hoodoo',
    notes: ['A pillar of soft rock kept standing by its harder cap.', 'Rain took everything around it and lost interest.', 'Balanced, for now.'],
    keep: ['You kept the one with the hoodoo. You like a mountain with a sculpture garden.', 'You kept the plain apron.'],
    radius: 7, minPx: 28,
    allow: (c) => c.archId === 'mesa',
    find: (ctx) => findSite(ctx, (c) => (c.h > SEA + 6 && c.h < ctx.H * 0.45 && c.slope < 0.45 ? 1 : 0), { lift: 8 }),
    prep: (s, ctx) => { s.T = ctx.rng.range(12, 16); s.base = ctx.field.height(s.x, s.z); },
    terrain(field, s, has) {
      if (!has) return;
      field.edit(s.x, s.z, 4.5, (h, d) => Math.max(h, s.base + s.T * (1 - smoothstep(2.0, 3.6, d)) - d * 0.4));
    },
    build(s, field, has, ctx) {
      if (!has) return null;
      const cap = mesh(rockGeometry(ctx.rng.fork(9), 2.4, 0), std(ctx.biome.rockDark));
      cap.scale.set(1.25, 0.5, 1.15);
      cap.position.set(s.x, field.height(s.x, s.z) + 0.6, s.z);
      return cap;
    },
    points: (s, field) => [V(s.x, field.height(s.x, s.z), s.z), V(s.x, field.height(s.x, s.z) - 7, s.z)],
  },
  // Trees & plants ----------------------------------------------------------

  {
    id: 'pine', cat: 'trees', tier: 2,
    title: (c) => (c.biome.tree === 'juniper' ? 'An old juniper' : 'A lone pine'),
    notes: ['Shaped by the wind into a flag.', 'The highest tree on the mountain, by some distance.', 'It grows a few millimetres a year up here. It is in no hurry.'],
    keep: ['You kept the one with the lone tree. You like a mountain with a lookout.', 'You kept the bare ridge.'],
    radius: 6, minPx: 26, clear: 6,
    find: (ctx) => findSite(ctx, (c) => (c.h > ctx.treeline - 4 && c.h < Math.min(ctx.snowline - 4, ctx.H * 0.8) && c.slope < 0.95 && c.cav < 0.1 ? 1 - c.cav : 0), { lift: 5 }),
    build(s, field, has, ctx) {
      if (!has) return null;
      const geo = ctx.biome.tree === 'juniper' ? juniperGeometry() : pineGeometry();
      const m = new THREE.InstancedMesh(geo, treeMaterial, 1);
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(ctx.rng.range(-0.14, 0.14), ctx.rng.range(0, 6.28), ctx.rng.range(-0.14, 0.14)));
      m.setMatrixAt(0, new THREE.Matrix4().compose(V(s.x, field.height(s.x, s.z) - 0.3, s.z), q, V(2.5, 2.9, 2.5)));
      m.setColorAt(0, new THREE.Color(ctx.biome.trees[0]));
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    },
    points: (s, field) => [V(s.x, field.height(s.x, s.z) + 4, s.z)],
  },

  {
    id: 'flowers', cat: 'trees', tier: 2,
    title: (c) => (c.biomeId === 'desert' ? 'Desert wildflowers' : 'Alpine flowers'),
    notes: ['Blooming fast before the short summer ends.', 'Gentians and buttercups, mostly. The bees know exactly where.', 'One wet week, and the slope remembers it was a meadow.'],
    keep: ['You kept the one in flower. You like a mountain in a good mood.', 'You kept the plain green slope.'],
    radius: 11, minPx: 30, clear: 4,
    find: (ctx) => findSite(ctx, (c) => (c.h > SEA + 6 && c.h < ctx.treeline + 10 && c.slope < 0.7 ? 1.2 - c.slope : 0)),
    prep: (s, ctx) => { s.R = ctx.rng.range(10, 13); },
    mask(aux, s, has, ctx, aux2) {
      if (!has) return;
      stamp(aux2, 2, s.x, s.z, s.R * 1.3, (d, x, z) => smoothstep(s.R, s.R * 0.45, d * (1 + 0.3 * ctx.noise(x * 0.16, z * 0.16))));
    },
    points: (s, field) => [V(s.x, field.height(s.x, s.z) + 1, s.z)],
  },

  // Water -------------------------------------------------------------------

  {
    id: 'stream', cat: 'water', tier: 1,
    title: (c) => (c.biomeId === 'desert' ? 'A running creek' : 'A stream'),
    notes: ['Gathering snowmelt on its way down.', 'Cold enough to make your teeth ache.', 'It will be at the sea in a week or so.'],
    keep: ['You kept the one with the stream. You like a mountain you can hear.', 'You kept the dry slope.'],
    radius: 7, minPx: 26, clear: 0,
    find(ctx) {
      for (let attempt = 0; attempt < 8; attempt++) {
        const s = findSite(ctx, (c) => (c.h > ctx.H * 0.3 && c.h < ctx.H * 0.62 && c.cav > 0.05 && c.slope > 0.2 && c.slope < 1.1 ? c.cav + 0.3 : 0), { tries: 600 });
        if (!s) return null;
        const path = traceDown(ctx.field, s.x, s.z, { step: 1.3, max: 80, inertia: 0.7, stop: (x, z, h) => h < SEA + 1 });
        if (path.length < 22) continue;
        s.path = path;
        return s;
      }
      return null;
    },
    terrain(field, s, has) {
      if (!has) return;
      for (let i = 0; i < s.path.length; i += 2) {
        const [x, z] = s.path[i];
        field.edit(x, z, 2.6, (h, d) => h - 0.6 * (1 - d / 2.6) * (1 - d / 2.6));
      }
    },
    build: (s, field, has) => (has ? new THREE.Mesh(ribbon(field, s.path, 1.3, 2.8), waterMaterial()) : null),
    points: (s, field) => samplePath(s.path, field, 0.8, 8),
  },

  {
    id: 'frozen', cat: 'water', tier: 2,
    title: () => 'A frozen tarn',
    notes: ['This twin’s tarn is still frozen. It must be a few degrees colder.', 'Ice in July, on the shady side.', 'Same lake, different season.'],
    keep: ['You kept the one with the frozen tarn. You like a mountain that keeps winter.', 'You kept the one with open water.'],
    radius: 11, minPx: 26, clear: 18,
    allow: (c) => c.archId !== 'spires' && c.biomeId !== 'desert',
    find: tarnFind,
    prep: tarnPrep,
    terrain: (field, s) => tarnBasin(field, s),
    build: (s, field, has) => tarnSurface(s, has ? std('#dce8f0', { flat: false, rough: 0.3 }) : waterMaterial()),
    points: (s) => [V(s.x, s.level, s.z)],
  },

  // Sky & stars -------------------------------------------------------------

  {
    id: 'aurora', cat: 'sky', when: 'night', tier: 1,
    title: () => 'The aurora',
    notes: ['The solar wind, arriving at the top of the sky.', 'Curtains of light a hundred kilometres up.', 'Green from oxygen, violet at the fringes.'],
    keep: ['You kept the one under the aurora. You like a sky that moves.', 'You kept the still sky.'],
    radius: 260, minPx: 60, air: true,
    find: (ctx) => skySpot(ctx, { lo: 4, hi: 6, spread: 5, r: 3 }),
    build(s, field, has, ctx) {
      if (!has) return null;
      const N = 70, pos = [], uv = [], idx = [];
      for (let i = 0; i <= N; i++) {
        const u = i / N, off = s.off - 9 + u * 18;
        const R = SKY_R * 0.92 * (1 + 0.05 * Math.sin(u * 11 + 1.3));
        const lo = skyPoint(ctx, off, s.el - 4 + Math.sin(u * 5) * 0.8, R);
        const hi = skyPoint(ctx, off + 1.5, s.el + 5.5 + Math.sin(u * 7 + 2) * 1.4, R);
        pos.push(...lo.toArray(), ...hi.toArray());
        uv.push(u, 0, u, 1);
        if (i > 0) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx);
      const m = new THREE.Mesh(g, fx(/* glsl */ `void main() {
        float rays = vnoise(vec2(vUv.x * 70.0, uTime * 0.35)) * 0.65 + vnoise(vec2(vUv.x * 190.0 - uTime * 0.6, 3.0)) * 0.45;
        float v = vUv.y;
        float body = smoothstep(0.0, 0.1, v) * (1.0 - smoothstep(0.3, 1.0, v));
        float edge = smoothstep(0.0, 0.14, vUv.x) * smoothstep(1.0, 0.86, vUv.x);
        float sway = 0.7 + 0.3 * sin(vUv.x * 14.0 + uTime * 0.4);
        vec3 col = mix(vec3(0.2, 1.0, 0.5), vec3(0.65, 0.3, 0.95), smoothstep(0.35, 0.95, v));
        float a = body * edge * sway * (0.2 + rays) * uNight * 0.55;
        gl_FragColor = vec4(col * a, a);
      }`));
      m.renderOrder = 1;
      m.frustumCulled = false;
      return m;
    },
    points: (s, field, ctx) => [-6, -2, 2, 6].map((o) => skyPoint(ctx, s.off + o, s.el + 1)),
  },

  {
    id: 'stars', cat: 'sky', when: 'night', tier: 2,
    title: (c, s) => s.shape.name,
    notes: [],
    noteFor: (s) => s.shape.note,
    keep: ['You kept the one with the constellation. You like a sky with a story in it.', 'You kept the plainer sky.'],
    radius: 280, minPx: 50, air: true,
    find: (ctx) => skySpot(ctx, { lo: 5, hi: 11, spread: 7, r: 3.5 }),
    prep: (s, ctx) => { s.shape = ctx.rng.pick(ASTERISMS); s.roll = ctx.rng.range(-0.5, 0.5); },
    starPoints(s, ctx) {
      const pts = s.shape.stars;
      const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
      const c = Math.cos(s.roll), sn = Math.sin(s.roll);
      return pts.map(([x, y]) => {
        const dx = (x - cx) * 0.85, dy = (y - cy) * 0.85;
        return skyPoint(ctx, s.off + dx * c - dy * sn, s.el + dx * sn + dy * c, SKY_R * 0.98);
      });
    },
    build(s, field, has, ctx) {
      if (!has) return null;
      const r2 = ctx.rng.fork(31);
      return glowPoints(this.starPoints(s, ctx).map((p) => ({ p, size: r2.range(8, 12), phase: r2.next() })), '#f2f6ff', 1);
    },
    points(s, field, ctx) { return this.starPoints(s, ctx); },
  },

  {
    id: 'meteor', cat: 'sky', when: 'night', tier: 2,
    title: () => 'A shooting star',
    notes: ['A grain of comet dust, burning up eighty kilometres over your head.', 'Make a wish. It only works on one of the twins.', 'It keeps coming back. Shooting stars don’t usually do that.'],
    keep: ['You kept the one with the shooting star. You like a sky that does things.', 'You kept the steadier sky.'],
    radius: 160, minPx: 44, air: true,
    find: (ctx) => skySpot(ctx, { lo: 6.5, hi: 11, spread: 8, r: 3.5 }),
    prep: (s, ctx) => { s.dir = ctx.rng.sign(); s.period = ctx.rng.range(4.5, 6.5); s.phase = ctx.rng.range(0, 5); },
    build(s, field, has, ctx) {
      if (!has) return null;
      const a = skyPoint(ctx, s.off - s.dir * 3, s.el + 2), b = skyPoint(ctx, s.off + s.dir * 3, s.el - 2);
      return strip(a, b, 9, 9, ctx.eye, fx(/* glsl */ `uniform float uPeriod; uniform float uOff; void main() {
        float p = mod(uTime + uOff, uPeriod) / 0.8;
        float a = 0.0;
        if (p < 1.0) {
          float head = p * 1.1;
          a = smoothstep(head - 0.45, head, vUv.x) * step(vUv.x, head) * (1.0 - smoothstep(0.75, 1.0, p));
        }
        float across = max(1.0 - abs(vUv.y * 2.0 - 1.0), 0.0);
        a *= across * across * uNight;
        gl_FragColor = vec4(vec3(1.0, 0.96, 0.88) * a * 1.6, a);
      }`, { uPeriod: { value: s.period }, uOff: { value: s.phase } }));
    },
    points: (s, field, ctx) => [-2, 0, 2].map((o) => skyPoint(ctx, s.off + s.dir * o, s.el - (o * 2) / 3)),
  },

  {
    id: 'planet', cat: 'sky', when: 'night', tier: 3,
    title: () => 'A planet',
    notes: ['It shines steadily while the stars around it twinkle.', 'Jupiter, probably. It’s usually Jupiter.', 'Brighter than any star near it, and not twinkling. A planet.'],
    keep: ['You kept the one with the planet. You like a sky with a neighbour in it.', 'You kept the sky with only stars.'],
    radius: 70, minPx: 26, air: true,
    find: (ctx) => skySpot(ctx, { lo: 3.5, hi: 11, spread: 11, r: 1.5 }),
    build: (s, field, has, ctx) => (has ? glowPoints([{ p: skyPoint(ctx, s.off, s.el), size: 9 }], '#ffe2b0', 0) : null),
    points: (s, field, ctx) => [skyPoint(ctx, s.off, s.el)],
  },

  {
    id: 'comet', cat: 'sky', when: 'night', tier: 1,
    title: () => 'A comet',
    notes: ['Back from the far side of the solar system, tail pointing away from the sun.', 'People will be talking about this one for years.', 'Ice and dust, lit up on its way past.'],
    keep: ['You kept the one with the comet. You like a sky with news in it.', 'You kept the ordinary night.'],
    radius: 220, minPx: 50, air: true,
    find: (ctx) => skySpot(ctx, { lo: 5, hi: 10, spread: 9, r: 4 }),
    prep: (s, ctx) => { s.tx = ctx.rng.range(2.5, 4.5) * ctx.rng.sign(); s.ty = ctx.rng.range(3, 4.5); },
    build(s, field, has, ctx) {
      if (!has) return null;
      const g = new THREE.Group();
      const head = skyPoint(ctx, s.off, s.el), tail = skyPoint(ctx, s.off + s.tx, s.el + s.ty);
      g.add(strip(head, tail, 10, 75, ctx.eye, fx(/* glsl */ `void main() {
        float a = pow(clamp(1.0 - vUv.x, 0.0, 1.0), 1.4) * pow(max(1.0 - abs(vUv.y * 2.0 - 1.0), 0.0), 1.3) * 0.8 * uNight;
        a *= 0.8 + 0.2 * vnoise(vec2(vUv.y * 9.0, vUv.x * 3.0 - uTime * 0.05));
        gl_FragColor = vec4(vec3(0.75, 0.9, 1.0) * a, a);
      }`)));
      g.add(glowPoints([{ p: head, size: 10 }], '#e8f4ff', 0));
      return g;
    },
    points: (s, field, ctx) => [skyPoint(ctx, s.off, s.el), skyPoint(ctx, s.off + s.tx * 0.5, s.el + s.ty * 0.5)],
  },

  {
    id: 'corona', cat: 'sky', when: 'night', tier: 2,
    title: () => 'A ring round the moon',
    notes: ['A corona: moonlight bending round tiny water droplets.', 'Rain tomorrow, if you believe the old saying.', 'Thin cloud, and the moon wearing it as a ring.'],
    keep: ['You kept the one with the ringed moon. You like a little drama.', 'You kept the clear moon.'],
    radius: 300, minPx: 50, air: true,
    // It needs no room of its own, so give the rest of the sky a chance first.
    find: (ctx) => (ctx.moon && ctx.rng.chance(0.45) ? { ...ctx.moon.spot, x: 2e5, z: 2e5 } : null),
    build(s, field, has, ctx) {
      if (!has) return null;
      const { pos, size } = ctx.moon;
      return facing(new THREE.PlaneGeometry(size * 9, size * 9), fx(/* glsl */ `void main() {
        float d = length(vUv * 2.0 - 1.0) * 4.5;
        float r1 = (d - 1.9) / 0.3, r2 = (d - 2.7) / 0.32;
        float a = exp(-r1 * r1) * 0.3 + exp(-r2 * r2) * 0.17 + exp(-max(d - 1.0, 0.0) * 1.3) * 0.07;
        vec3 col = mix(vec3(0.75, 0.85, 1.0), vec3(1.0, 0.72, 0.58), smoothstep(1.9, 2.8, d));
        a *= uMoon * uNight * step(1.0, d);
        gl_FragColor = vec4(col * a, a);
      }`), pos.clone().lerp(ctx.eye, 0.002), ctx.eye);
    },
    points: (s, field, ctx) => [ctx.moon.pos],
  },

  {
    id: 'daymoon', cat: 'sky', when: 'day', tier: 3,
    title: () => 'The moon, by day',
    notes: ['Up in daylight. It often is; people just don’t look.', 'A pale moon over a blue afternoon.', 'Half lit, half lost in the blue.'],
    keep: ['You kept the one with the daytime moon. You notice things.', 'You kept the empty blue.'],
    radius: 110, minPx: 26, air: true,
    find: (ctx) => skySpot(ctx, { lo: 3.5, hi: 7, spread: 10, r: 2.5 }),
    prep: (s, ctx) => { s.phase = ctx.rng.range(0.9, 1.6) * ctx.rng.sign(); },
    build(s, field, has, ctx) {
      if (!has) return null;
      const size = SKY_R * 1.2 * DEG;
      return facing(new THREE.PlaneGeometry(size * 6, size * 6), fx(/* glsl */ `uniform float uPhase; void main() {
        vec2 q = (vUv * 2.0 - 1.0) * 3.0;
        float disc = 1.0 - smoothstep(0.95, 1.0, length(q));
        float shade = 1.0 - smoothstep(0.95, 1.05, length(q - vec2(uPhase, 0.0)));
        float a = disc * (1.0 - shade) * (0.75 + 0.25 * fbm3(q * 2.3 + 3.0)) * 0.45 * (1.0 - uNight);
        gl_FragColor = vec4(vec3(0.92, 0.94, 1.0) * a, a);
      }`, { uPhase: { value: s.phase } }), skyPoint(ctx, s.off, s.el), ctx.eye);
    },
    points: (s, field, ctx) => [skyPoint(ctx, s.off, s.el)],
  },

  // Wildlife ----------------------------------------------------------------

  {
    id: 'bear', cat: 'wildlife', tier: 2,
    title: (c) => (c.biomeId === 'desert' ? 'A black bear' : 'A brown bear'),
    notes: ['Grazing. Mostly they eat grass, roots and berries.', 'Minding its own business. Let it.', 'Fattening up for a long winter’s sleep.'],
    keep: ['You kept the one with the bear. Brave.', 'You kept the one without the bear. Sensible.'],
    radius: 6, minPx: 26, clear: 6,
    find: (ctx) => findSite(ctx, (c) => (c.h > SEA + 6 && c.h < ctx.treeline + 8 && c.slope < 0.7 ? 1.2 - c.slope : 0), { lift: 2 }),
    build(s, field, has, ctx) {
      if (!has) return null;
      const g = bearModel();
      g.position.set(s.x, field.height(s.x, s.z) - 0.1, s.z);
      g.rotation.y = ctx.rng.range(0, 6.28);
      const head = g.userData.head;
      g.userData.update = (t) => { head.position.y = 1.55 - Math.max(0, Math.sin(t * 0.35)) * 0.55; };
      return g;
    },
    points: (s, field) => [V(s.x, field.height(s.x, s.z) + 1.6, s.z)],
  },

  {
    id: 'marmot', cat: 'wildlife', tier: 3,
    title: () => 'A marmot',
    notes: ['On lookout. It whistles when it sees an eagle.', 'Fattening up for a six-month sleep.', 'Standing very straight, pretending to be a rock.'],
    missed: 'It saw you, and whistled.',
    keep: ['You kept the one with the marmot. You like a mountain with a doorman.', 'You kept the one without the marmot. Quieter.'],
    radius: 4, minPx: 22, clear: 3,
    allow: (c) => c.biomeId !== 'desert',
    find: (ctx) => findSite(ctx, (c) => (c.h > ctx.treeline - 2 && c.h < Math.min(ctx.snowline - 4, ctx.H * 0.72) && c.slope < 0.8 ? 1 : 0), { lift: 1.5 }),
    build(s, field, has, ctx) {
      if (!has) return null;
      const g = marmotModel(ctx.rng.fork(3));
      g.position.set(s.x, field.height(s.x, s.z) - 0.2, s.z);
      g.rotation.y = ctx.rng.range(0, 6.28);
      const head = g.userData.head;
      g.userData.update = (t) => { head.rotation.y = Math.sin(t * 0.8) * 0.9; };
      return g;
    },
    points: (s, field) => [V(s.x, field.height(s.x, s.z) + 1.4, s.z)],
  },

  {
    id: 'geese', cat: 'wildlife', when: 'day', tier: 2,
    title: () => 'Geese in a V',
    notes: ['Heading south. They take turns at the front.', 'You can hear them before you see them. Usually.', 'Leaving early this year.'],
    keep: ['You kept the one with the geese. You like a mountain people pass through.', 'You kept the quiet sky.'],
    radius: 12, minPx: 40, air: true,
    find: (ctx) => ({ x: 3e5, z: 3e5, h: 0, cx: ctx.ext.cx, cz: ctx.ext.cz }),
    prep: (s, ctx) => { s.R = ctx.ext.reach * 0.95; s.cy = ctx.H * ctx.rng.range(0.78, 0.9); s.w = 0.11 * ctx.rng.sign(); s.ph = ctx.rng.range(0, 6.28); },
    pos: (s, t) => V(s.cx + Math.cos(t * s.w + s.ph) * s.R, s.cy, s.cz + Math.sin(t * s.w + s.ph) * s.R),
    build(s, field, has) {
      if (!has) return null;
      const g = new THREE.Group();
      const birds = [];
      for (let i = 0; i < 9; i++) {
        const b = eagleModel('#8f8a80', '#2f2b28');
        const row = Math.ceil(i / 2), side = i === 0 ? 0 : i % 2 ? 1 : -1;
        b.position.set(side * row * 1.5, 0, -row * 1.6);
        b.scale.setScalar(0.55);
        g.add(b);
        birds.push(b);
      }
      g.userData.update = (t) => {
        const a = t * s.w + s.ph;
        g.position.set(s.cx + Math.cos(a) * s.R, s.cy, s.cz + Math.sin(a) * s.R);
        g.rotation.y = Math.atan2(-Math.sin(a) * Math.sign(s.w), Math.cos(a) * Math.sign(s.w));
        birds.forEach((b, i) => {
          const f = Math.sin(t * 7 + i * 0.7) * 0.5;
          b.userData.wings[0].rotation.z = f;
          b.userData.wings[1].rotation.z = -f;
        });
      };
      g.userData.update(0);
      return g;
    },
    points: (s) => [V(s.cx + s.R, s.cy, s.cz)],
  },

  {
    id: 'fireflies', cat: 'wildlife', when: 'night', tier: 2,
    title: () => 'Fireflies',
    notes: ['Signalling to each other across the meadow.', 'Each flash pattern means something. Not to us.', 'A small, private constellation, down at grass height.'],
    keep: ['You kept the one with fireflies. You like a mountain with a secret.', 'You kept the dark meadow.'],
    radius: 9, minPx: 32, clear: 6,
    find: (ctx) => findSite(ctx, (c) => (c.h > SEA + 6 && c.h < ctx.treeline + 4 && c.slope < 0.7 ? 1.2 - c.slope : 0), { lift: 2 }),
    build(s, field, has, ctx) {
      if (!has) return null;
      const r2 = ctx.rng.fork(17), list = [];
      for (let i = 0; i < 40; i++) {
        const a = r2.range(0, Math.PI * 2), r = Math.sqrt(r2.next()) * 8;
        const x = s.x + Math.cos(a) * r, z = s.z + Math.sin(a) * r;
        list.push({ p: V(x, field.height(x, z) + r2.range(0.4, 3), z), size: r2.range(4, 6.5), phase: r2.next() });
      }
      return glowPoints(list, '#d8ff7a', 2);
    },
    points: (s, field) => [V(s.x, field.height(s.x, s.z) + 1.5, s.z)],
  },

  // Weather -----------------------------------------------------------------

  {
    id: 'rainbow', cat: 'weather', when: 'day', tier: 1,
    title: () => 'A rainbow',
    notes: ['From a shower you can’t see from here.', 'Sunlight split by raindrops. Red on the outside, always.', 'Gone in ten minutes. Look now.'],
    keep: ['You kept the one with the rainbow. Of course you did.', 'You kept the one without the rainbow. Unsentimental.'],
    radius: 16, minPx: 36, air: true,
    find(ctx) {
      const side = ctx.rng.sign();
      const az = ctx.viewAz + Math.PI / 2;
      const off = ctx.ext.reach * ctx.rng.range(0.3, 0.5) * side;
      const near = ctx.ext.reach * 0.9;
      return {
        x: 4e5, z: 4e5, h: 0, side,
        cx: ctx.ext.cx + Math.sin(az) * off - Math.sin(ctx.viewAz) * near,
        cz: ctx.ext.cz + Math.cos(az) * off - Math.cos(ctx.viewAz) * near,
      };
    },
    prep: (s, ctx) => { s.R = ctx.H * ctx.rng.range(0.5, 0.62); s.w = s.R * 0.1; },
    build(s, field, has, ctx) {
      if (!has) return null;
      const m = new THREE.Mesh(new THREE.RingGeometry(s.R - s.w, s.R, 96, 1, 0, Math.PI), fx(/* glsl */ `uniform float uInner; uniform float uOuter; void main() {
        float t = (length(vLocal.xy) - uInner) / (uOuter - uInner);
        vec3 col = clamp(abs(fract((1.0 - t) * 0.8 + vec3(0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0) - 1.0, 0.0, 1.0);
        float a = pow(max(sin(t * 3.14159), 0.0), 1.5) * 0.42 * (1.0 - uNight) * smoothstep(0.0, uOuter * 0.3, vLocal.y);
        gl_FragColor = vec4(col, a);
      }`, { uInner: { value: s.R - s.w }, uOuter: { value: s.R } }, { additive: false }));
      m.position.set(s.cx, SEA - 2, s.cz);
      m.lookAt(ctx.eye.x, SEA - 2, ctx.eye.z);
      m.renderOrder = 2;
      return m;
    },
    points(s, field, ctx) {
      const az = ctx.viewAz + Math.PI / 2, r = s.R - s.w / 2;
      return [-0.7, 0, 0.7].map((k) => V(s.cx + Math.sin(az) * Math.sin(k) * r, SEA - 2 + Math.cos(k) * r, s.cz + Math.cos(az) * Math.sin(k) * r));
    },
  },

  {
    id: 'shower', cat: 'weather', when: 'day', tier: 2,
    title: () => 'A passing shower',
    notes: ['Soaking one twin and leaving the other dry.', 'Rain you can watch from somewhere dry.', 'It will have moved on in twenty minutes.'],
    keep: ['You kept the rainy one. You like a mountain with weather.', 'You kept the dry one. Sensible shoes.'],
    radius: 12, minPx: 34,
    find: (ctx) => findSite(ctx, (c) => (c.h > ctx.H * 0.35 && c.h < ctx.H * 0.7 ? 1 : 0), { lift: 10, air: true }),
    prep(s, ctx) {
      const dx = s.x - ctx.ext.cx, dz = s.z - ctx.ext.cz, l = Math.hypot(dx, dz) || 1;
      s.cx = s.x + (dx / l) * 8; s.cz = s.z + (dz / l) * 8;
      s.cy = Math.min(ctx.H * 0.95, s.h + ctx.rng.range(18, 26));
    },
    build(s, field, has, ctx) {
      if (!has) return null;
      const g = new THREE.Group();
      const r2 = ctx.rng.fork(8);
      for (let i = 0; i < 11; i++) {
        const p = mesh(new THREE.SphereGeometry(r2.range(3.2, 5.5), 16, 12), cloudMat);
        p.position.set(r2.range(-8, 8), r2.range(-0.5, 3), r2.range(-3.5, 3.5));
        p.scale.y = 0.62;
        p.renderOrder = 4;
        g.add(p);
      }
      const len = s.cy - SEA + 2;
      const rain = new THREE.Mesh(new THREE.CylinderGeometry(7, 9.5, len, 32, 1, true), fx(/* glsl */ `void main() {
        float n = vnoise(vec2(vUv.x * 220.0, vUv.y * 9.0 + uTime * 8.0));
        float a = smoothstep(0.6, 0.9, n) * smoothstep(0.0, 0.45, vUv.y) * smoothstep(1.0, 0.88, vUv.y) * 0.32;
        vec3 col = vec3(0.42, 0.47, 0.56) * (0.55 + uSunColor * 0.45);
        gl_FragColor = vec4(col, a);
      }`, {}, { additive: false }));
      rain.position.y = -len / 2;
      rain.renderOrder = 2;
      g.add(rain);
      g.position.set(s.cx, s.cy, s.cz);
      return g;
    },
    points: (s) => [V(s.cx, s.cy, s.cz), V(s.cx, s.cy - 14, s.cz)],
  },
];

export const FEATURE_BY_ID = Object.fromEntries(FEATURES.map((f) => [f.id, f]));

// How many differences a pair has, how subtle, and how many hide round the back.
export function planFor(level) {
  const n = Math.min(3 + Math.floor((level - 1) / 2), 7);
  let tiers;
  if (level === 1) tiers = [1, 1, 1];
  else if (level === 2) tiers = [1, 1, 2];
  else if (level <= 4) tiers = [1, 1, 2, 2];
  else if (level <= 6) tiers = [1, 2, 2, 3, 3];
  else tiers = [1, 2, 2, 3, 3, 2, 3].slice(0, n);
  while (tiers.length < n) tiers.push(2);
  const hidden = level <= 2 ? 0 : level <= 5 ? 1 : Math.floor(n / 3);
  return { n, tiers, hidden };
}

export const KINDS = {
  trees: 'Trees & plants',
  water: 'Water',
  sky: 'Sky & stars',
  wildlife: 'Wildlife',
  land: 'Rock & ice',
  weather: 'Weather',
  traces: 'Traces of people',
};

// Pairs that can't share a mountain.
const CLASH = { summit: 'lenticular', lenticular: 'summit', tarn: 'frozen', frozen: 'tarn' };

// One of each kind of scenery before any kind repeats. Night pairs open with
// the sky (twice, once there's room) and favour things only seen at night; by
// day the sky and traces of people are occasional guests.
export function chooseDifferences(ctx, level) {
  const plan = planFor(level);
  const time = ctx.night ? 'night' : 'day';
  const pool = FEATURES.filter((f) => (!f.when || f.when === time) && (!f.allow || f.allow(ctx)));
  const kinds = [...new Set(pool.map((f) => f.cat))];
  const order = ctx.rng.shuffle(kinds.filter((k) => k !== 'traces' && k !== 'sky'));
  if (ctx.night) {
    order.unshift('sky');
    if (plan.n >= 4) order.splice(3, 0, 'sky');
  }
  const guest = (k, p) => { if (kinds.includes(k) && ctx.rng.chance(p)) order.splice(ctx.rng.int(1, Math.max(1, plan.n - 1)), 0, k); };
  if (!ctx.night) guest('sky', 0.3);
  guest('traces', 0.35);

  const slots = plan.tiers.map((t, i) => ({ t, hidden: i >= plan.n - plan.hidden }));
  ctx.rng.shuffle(slots).forEach((slot, i) => { slot.cat = order[i % order.length]; });

  const chosen = [];
  const used = new Set();
  for (const slot of slots) {
    const options = ctx.rng.shuffle(pool.filter((f) => !used.has(f.id) && !used.has(CLASH[f.id])));
    const cost = (f) => (f.cat === slot.cat ? 0 : 10) + Math.abs(f.tier - slot.t) - (f.when === 'night' ? 0.6 : 0);
    options.sort((a, b) => cost(a) - cost(b));
    for (const def of options) {
      ctx.wantHidden = slot.hidden && !def.air && def.id !== 'summit';
      ctx.radius = def.radius;
      let site = def.find(ctx);
      if (!site && ctx.wantHidden) { ctx.wantHidden = false; site = def.find(ctx); }
      ctx.wantHidden = false;
      if (!site) continue;
      if (def.prep) def.prep(site, ctx);
      ctx.sites.push({ x: site.x, z: site.z, r: def.radius });
      if (site.sky) ctx.skySpots.push({ off: site.off, el: site.el, r: site.r });
      used.add(def.id);
      chosen.push({ def, site, cat: def.cat, has: ctx.rng.int(0, 1), hidden: slot.hidden, tier: def.tier });
      break;
    }
  }
  return chosen;
}
