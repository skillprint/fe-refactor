// Building a pair: one eroded mountain, copied twice, with each difference
// applied to only one of the copies.

import * as THREE from 'three';
import { Rng, fbm, smoothstep, clamp } from './noise.js';
import { RES, CELL, HALF, SEA, toWorld, toGrid, generate, analyze, cavity, extents } from './terrain.js';
import { BIOMES } from './look.js';
import { terrainMaterial, treeMaterial, pineGeometry, juniperGeometry } from './gfx.js';
import { chooseDifferences, skyPoint, SKY_R } from './features.js';
import { namePair } from './words.js';

let PINE = null, JUNIPER = null;

function scatterTrees(ctx, clear) {
  const { rng, field, A, treeline, biome, noise } = ctx;
  const out = [];
  const step = biome.tree === 'juniper' ? 3.3 : 2.05;
  const density = biome.tree === 'juniper' ? 0.55 : 1;
  for (let z = -HALF + 3; z < HALF - 3; z += step) {
    for (let x = -HALF + 3; x < HALF - 3; x += step) {
      const px = x + rng.range(-0.45, 0.45) * step, pz = z + rng.range(-0.45, 0.45) * step;
      const h = field.height(px, pz);
      if (h < SEA + 1) continue;
      const tl = treeline + fbm(noise, px * 0.02, pz * 0.02, 3) * 12;
      if (h > tl) continue;
      const k = Math.round(toGrid(pz)) * RES + Math.round(toGrid(px));
      const slope = A.slope[k];
      if (slope > 0.8) continue;
      const clump = fbm(noise, px * 0.025 + 40, pz * 0.025 - 13, 4);
      let p = smoothstep(-0.2, 0.3, clump) * (1 - smoothstep(0.45, 0.78, slope)) * (1 - smoothstep(tl - 12, tl, h));
      p = Math.max(p, A.flow[k] * 0.5 * (1 - smoothstep(0.5, 0.8, slope)));
      if (rng.next() > p * density) continue;
      if (clear.some((c) => Math.hypot(px - c.x, pz - c.z) < c.r)) continue;
      out.push({
        x: px, z: pz, r: rng.range(0, 6.283),
        s: rng.range(0.8, 1.35) * (1 - 0.4 * smoothstep(tl - 16, tl, h)),
        c: rng.pick(biome.trees),
      });
    }
  }
  return out;
}

function treeMesh(trees, field, biome) {
  if (!PINE) { PINE = pineGeometry(); JUNIPER = juniperGeometry(); }
  const geo = biome.tree === 'juniper' ? JUNIPER : PINE;
  const m = new THREE.InstancedMesh(geo, treeMaterial, Math.max(1, trees.length));
  m.count = trees.length;
  const q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), mat = new THREE.Matrix4();
  const up = new THREE.Vector3(0, 1, 0);
  const col = new THREE.Color();
  trees.forEach((t, i) => {
    p.set(t.x, field.height(t.x, t.z) - 0.2, t.z);
    q.setFromAxisAngle(up, t.r);
    s.set(t.s, t.s * (0.9 + ((i * 7919) % 100) / 400), t.s);
    m.setMatrixAt(i, mat.compose(p, q, s));
    col.set(t.c).multiplyScalar(0.9 + ((i * 104729) % 100) / 500);
    m.setColorAt(i, col);
  });
  m.instanceMatrix.needsUpdate = true;
  if (m.instanceColor) m.instanceColor.needsUpdate = true;
  m.castShadow = true;
  m.receiveShadow = true;
  m.frustumCulled = false;
  m.userData.keepGeometry = true; // shared across rounds

  return m;
}

function terrainMesh(field, aux, aux2, mat) {
  const N = RES;
  const pos = new Float32Array(N * N * 3), nor = new Float32Array(N * N * 3);
  const h = field.h;
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const k = j * N + i;
      pos[k * 3] = toWorld(i);
      pos[k * 3 + 1] = h[k];
      pos[k * 3 + 2] = toWorld(j);
      const il = i > 0 ? k - 1 : k, ir = i < N - 1 ? k + 1 : k;
      const jd = j > 0 ? k - N : k, ju = j < N - 1 ? k + N : k;
      const dx = (h[ir] - h[il]) / (((ir - il) || 1) * CELL);
      const dz = (h[ju] - h[jd]) / ((((ju - jd) / N) || 1) * CELL);
      const l = Math.hypot(dx, 1, dz);
      nor[k * 3] = -dx / l; nor[k * 3 + 1] = 1 / l; nor[k * 3 + 2] = -dz / l;
    }
  }
  const idx = new Uint32Array((N - 1) * (N - 1) * 6);
  let o = 0;
  for (let j = 0; j < N - 1; j++) {
    for (let i = 0; i < N - 1; i++) {
      const a = j * N + i, b = a + 1, c = a + N, d = c + 1;
      // Split each quad along the diagonal that follows the terrain better.
      if (Math.abs(h[a] - h[d]) < Math.abs(h[b] - h[c])) { idx.set([a, c, d, a, d, b], o); }
      else { idx.set([a, c, b, b, c, d], o); }
      o += 6;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('aux', new THREE.BufferAttribute(aux, 4));
  g.setAttribute('aux2', new THREE.BufferAttribute(aux2, 4));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  g.computeBoundingSphere();
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// Everything the difference catalogue needs to know about a fresh mountain.
export function survey(seed, archId, night = false) {
  const gen = generate(seed, archId);
  const rng = gen.rng;
  const biomeId = rng.pick(gen.arch.biomes);
  const biome = BIOMES[biomeId];
  const H = gen.H;
  const snowline = biome.snowline ? H * rng.range(biome.snowline[0], biome.snowline[1]) : 1e4;
  const treeline = Math.max(SEA + 16, H * biome.treeline);
  const A = analyze(gen.field);
  A.flow = gen.flow;
  const ext = extents(gen.field);

  // A massif is seen broadside: look across its ridge, not along it.
  const camAz = gen.axis != null ? -gen.axis + rng.range(-0.35, 0.35) + (rng.chance(0.5) ? Math.PI : 0) : rng.range(0, Math.PI * 2);
  const sunAz = camAz + rng.sign() * rng.range(0.85, 1.35);
  // Night pairs sit the mountain lower in the frame to leave room for the sky.
  const frame = night ? { pol: 1.4, lift: -0.15 } : { pol: 1.36, lift: -0.07 };
  const target = new THREE.Vector3(ext.cx, SEA + (H - SEA) * 0.46, ext.cz);
  const d = ext.reach * 3.1;
  const eye = new THREE.Vector3(
    target.x + Math.sin(camAz) * Math.sin(frame.pol) * d,
    target.y + Math.cos(frame.pol) * d,
    target.z + Math.cos(camAz) * Math.sin(frame.pol) * d,
  );

  const ctx = {
    rng: rng.fork(11), noise: gen.noise, field: gen.field, A, H, snowline, treeline, ext, night,
    biomeId, biome, archId, summit: gen.field.summit(), eye, viewAz: camAz + Math.PI, sites: [], skySpots: [], wantHidden: false,
    spaced(x, z, r) { return this.sites.every((s) => Math.hypot(s.x - x, s.z - z) > r + s.r); },
    sightOk(c, o = {}) {
      const y = c.h + (o.lift ?? 2);
      let vis = !this.field.occluded(eye.x, eye.y, eye.z, c.x, y, c.z, 0.4);
      if (vis && !o.air) {
        const [nx, ny, nz] = this.field.normal(c.x, c.z);
        const dx = eye.x - c.x, dy = eye.y - y, dz = eye.z - c.z, l = Math.hypot(dx, dy, dz);
        vis = (nx * dx + ny * dy + nz * dz) / l > 0.12;
      }
      return this.wantHidden ? !vis : vis;
    },
  };

  if (night) {
    // The moon rises beside the summit; the Milky Way climbs from the horizon past it.
    const spot = { off: rng.sign() * rng.range(6, 9), el: rng.range(8.5, 10.5), r: 3 };
    ctx.skySpots.push(spot);
    const side = rng.sign();
    const a = new THREE.Vector3(Math.sin(ctx.viewAz + side * 0.3), 0, Math.cos(ctx.viewAz + side * 0.3));
    const across = new THREE.Vector3(Math.cos(ctx.viewAz), 0, -Math.sin(ctx.viewAz)).multiplyScalar(-side * 0.55);
    const up = new THREE.Vector3(0, 1, 0).add(across).normalize();
    const n = new THREE.Vector3().crossVectors(a, up).normalize();
    ctx.moon = {
      spot,
      pos: skyPoint(ctx, spot.off, spot.el),
      size: SKY_R * 1.25 * (Math.PI / 180),
      phase: rng.range(0.9, 1.7) * rng.sign(),
      milky: { n, a, b: new THREE.Vector3().crossVectors(n, a).normalize() },
    };
  }
  return { gen, ctx, ext, camAz, sunAz, frame };
}

export function buildRound({ level, seed, archId, night = false }) {
  const t0 = performance.now();
  const { gen, ctx, ext, camAz, sunAz, frame } = survey(seed, archId, night);
  const { A, H, snowline, treeline, biomeId, biome } = ctx;

  const diffs = chooseDifferences(ctx, level);

  const fields = [gen.field.clone(), gen.field.clone()];
  for (const d of diffs) if (d.def.terrain) for (const t of [0, 1]) d.def.terrain(fields[t], d.site, t === d.has, ctx);

  const clear = diffs.filter((d) => d.def.clear).map((d) => ({ x: d.site.x, z: d.site.z, r: d.def.clear }));
  for (const d of diffs) if (d.site.path) for (const [x, z] of d.site.path) clear.push({ x, z, r: 5 });
  const baseTrees = scatterTrees(ctx, clear);

  const mat = terrainMaterial(biome, snowline, treeline);
  const groups = [];
  const updates = [[], []];
  for (const t of [0, 1]) {
    const field = fields[t];
    const aux = new Float32Array(RES * RES * 4), aux2 = new Float32Array(RES * RES * 4);
    const cav = cavity(field);
    for (let k = 0; k < RES * RES; k++) {
      aux[k * 4 + 3] = clamp(cav[k] / 3, -1, 1);
      aux2[k * 4] = A.flow[k];
    }
    for (const d of diffs) if (d.def.mask) d.def.mask(aux, d.site, t === d.has, ctx, aux2);

    let trees = baseTrees.slice();
    for (const d of diffs) if (d.def.trees) trees = trees.concat(d.def.trees(d.site, t === d.has, { ...ctx, rng: ctx.rng.fork(d.def.id.length * 97 + t) }));
    trees = trees.filter((tr) => field.height(tr.x, tr.z) > SEA + 0.5);
    for (const tr of trees) {
      const i = Math.round(toGrid(tr.x)), j = Math.round(toGrid(tr.z));
      for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) {
        const ii = clamp(i + a, 0, RES - 1), jj = clamp(j + b, 0, RES - 1);
        const k = (jj * RES + ii) * 4 + 1;
        aux2[k] = Math.min(1, aux2[k] + (a === 0 && b === 0 ? 0.45 : 0.18));
      }
    }

    const g = new THREE.Group();
    g.add(terrainMesh(field, aux, aux2, mat));
    if (trees.length) g.add(treeMesh(trees, field, biome));
    for (const d of diffs) {
      if (!d.def.build) continue;
      const obj = d.def.build(d.site, field, t === d.has, { ...ctx, rng: ctx.rng.fork(d.def.id.length * 131 + 7) });
      if (!obj) continue;
      if (obj.userData.update) updates[t].push(obj.userData.update);
      g.add(obj);
    }
    groups.push(g);
  }

  for (const d of diffs) {
    d.points = d.def.points(d.site, fields[d.has], ctx);
    d.title = d.def.title(ctx, d.site);
    d.note = d.def.noteFor ? d.def.noteFor(d.site) : ctx.rng.pick(d.def.notes);
    d.found = false;
  }

  const names = namePair(new Rng(seed ^ 0x5bd1e995), archId);
  const elevation = Math.round(H * 28 + 600);

  return {
    level, seed, archId, biomeId, H, snowline, treeline, ext, camAz, sunAz, frame, night, moon: ctx.moon, fields, groups, updates, diffs, names,
    elevation, label: gen.arch.label, ms: Math.round(performance.now() - t0),
  };
}
