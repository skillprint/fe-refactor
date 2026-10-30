// Trees and props for the realms, as single vertex-coloured geometries ready
// for instancing. Builders that glow return two groups (matte, then glow), so
// one InstancedMesh can draw both with a [lambert, basic] material pair; glow
// vertex colours run above 1 so the bloom picks them up.

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Rng, lerp } from './rng.js';

const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/** Vertical gradient from low to high colour over the geometry's height. */
function paint(geo, low, high) {
  const pos = geo.attributes.position;
  geo.computeBoundingBox();
  const { min, max } = geo.boundingBox;
  const col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const c = mix3(low, high, (pos.getY(i) - min.y) / Math.max(1e-6, max.y - min.y));
    col.set(c, i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return geo;
}

const solid = (geo, c) => paint(geo, c, c);

/** Snow on whatever faces up. */
function frost(geo, snow, above = 0.35) {
  const n = geo.attributes.normal, col = geo.attributes.color;
  for (let i = 0; i < n.count; i++) {
    if (n.getY(i) > above) col.setXYZ(i, snow[0], snow[1], snow[2]);
  }
  return geo;
}

// Polyhedra come unindexed and the rest indexed; merging needs them alike.
function merge(parts) {
  const flat = parts.map((p) => (p.index ? p.toNonIndexed() : p));
  const g = mergeGeometries(flat);
  for (const p of new Set([...parts, ...flat])) p.dispose();
  return g;
}

/** Matte parts and glowing parts as two groups of one geometry. */
function twoPart(matte, glow) {
  const a = merge(matte), b = merge(glow);
  const g = mergeGeometries([a, b], true);
  a.dispose();
  b.dispose();
  return g;
}

// ---------------------------------------------------------------------------
// Trees

export function pine({ tiers = 4, seed = 3, colors, snow }) {
  const rng = new Rng(seed);
  const parts = [paint(new THREE.CylinderGeometry(0.14, 0.22, 1.6, 5).translate(0, 0.8, 0), colors.trunk[0], colors.trunk[1])];
  const [lo, hi] = colors.leaf;
  let y = 1.1, r = 1.6 + rng.range(0, 0.3);
  for (let i = 0; i < tiers; i++) {
    const h = 1.9 - i * 0.18;
    const k = i / tiers;
    const cone = new THREE.ConeGeometry(r, h, 7, 1).rotateY(rng.range(0, Math.PI)).translate(0, y + h / 2, 0);
    // Snowy pines whiten towards each tier's tip.
    paint(cone, mix3(lo, hi, 0.4 * k), snow ? mix3(hi, snow, 0.8) : mix3(lo, hi, 0.55 + 0.45 * k));
    parts.push(cone);
    y += h * 0.55;
    r *= 0.74;
  }
  return merge(parts);
}

export function birch({ seed, colors }) {
  const rng = new Rng(seed);
  const h = rng.range(6, 7.5);
  const trunk = new THREE.CylinderGeometry(0.11, 0.17, h, 6, 10).translate(0, h / 2, 0);
  // White bark with the dark lenticels birches are known by.
  const pos = trunk.attributes.position, col = new Float32Array(pos.count * 3);
  const bands = Array.from({ length: 11 }, () => rng.chance(0.4));
  for (let i = 0; i < pos.count; i++) {
    const row = Math.round((pos.getY(i) / h) * 10);
    const dark = bands[row] && rng.chance(0.6);
    col.set(dark ? [0.05, 0.045, 0.04] : colors.bark, i * 3);
  }
  trunk.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const parts = [trunk];
  for (let b = 0; b < 2; b++) {
    const len = rng.range(1.2, 1.8);
    const br = solid(new THREE.CylinderGeometry(0.03, 0.06, len, 4).translate(0, len / 2, 0), colors.bark);
    br.rotateZ((b ? 1 : -1) * rng.range(0.6, 0.9)).translate(0, h * rng.range(0.55, 0.7), 0);
    parts.push(br);
  }
  const [lo, hi] = colors.leaf;
  const clusters = rng.int(4, 6);
  for (let c = 0; c < clusters; c++) {
    const r = rng.range(0.8, 1.3);
    const blob = new THREE.IcosahedronGeometry(r, 0).scale(1, rng.range(0.8, 1.1), 1);
    const a = rng.range(0, Math.PI * 2), d = rng.range(0.2, 0.9);
    blob.translate(Math.cos(a) * d, h * rng.range(0.55, 1.0), Math.sin(a) * d);
    paint(blob, lo, hi);
    parts.push(blob);
  }
  return merge(parts);
}

export function willow({ seed, colors }) {
  const rng = new Rng(seed);
  const trunk = solid(new THREE.CylinderGeometry(0.28, 0.42, 3.0, 7).translate(0, 1.5, 0), colors.trunk);
  trunk.rotateZ(rng.range(-0.08, 0.08));
  const [lo, hi] = colors.leaf;
  const crown = new THREE.IcosahedronGeometry(2.4, 1).scale(1, 0.5, 1).translate(0, 3.6, 0);
  paint(crown, mix3(lo, hi, 0.5), hi);
  // The weeping strands: long thin bundles hanging from the crown's rim.
  const parts = [trunk, crown];
  const strands = 22;
  for (let i = 0; i < strands; i++) {
    const a = (i / strands) * Math.PI * 2 + rng.range(-0.1, 0.1);
    const r = rng.range(1.7, 2.5), len = rng.range(2.2, 3.4);
    const strand = new THREE.ConeGeometry(rng.range(0.16, 0.28), len, 4).rotateX(Math.PI).translate(0, 3.5 - len / 2, 0);
    strand.rotateZ(rng.range(-0.08, 0.08)).translate(Math.cos(a) * r, 0, Math.sin(a) * r);
    paint(strand, mix3(lo, hi, 0.9), mix3(lo, hi, 0.35));
    parts.push(strand);
  }
  return merge(parts);
}

export function bamboo({ seed, colors }) {
  const rng = new Rng(seed);
  const parts = [];
  const stalks = rng.int(5, 8);
  for (let s = 0; s < stalks; s++) {
    const h = rng.range(7, 11.5), r = rng.range(0.06, 0.1);
    const segs = Math.round(h / 1.4);
    const stalk = new THREE.CylinderGeometry(r * 0.85, r, h, 4, segs).translate(0, h / 2, 0);
    const c = mix3(colors.stalk[0], colors.stalk[1], rng.next());
    // Darker nodes where the segments meet.
    const pos = stalk.attributes.position, col = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const f = (pos.getY(i) / h) * segs;
      const node = Math.abs(f - Math.round(f)) < 0.02;
      col.set(node ? mix3(c, [0.02, 0.03, 0.01], 0.7) : mix3(c, [c[0] * 1.2, c[1] * 1.15, c[2]], f / segs), i * 3);
    }
    stalk.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const a = rng.range(0, Math.PI * 2), d = rng.range(0, 0.7);
    stalk.rotateZ(rng.range(-0.06, 0.06)).rotateX(rng.range(-0.06, 0.06)).translate(Math.cos(a) * d, 0, Math.sin(a) * d);
    parts.push(stalk);
    // Leaf sprays near the top.
    for (let l = 0; l < 3; l++) {
      const leaf = solid(new THREE.ConeGeometry(0.35, 1.6, 3).scale(1, 1, 0.15), colors.leaf);
      leaf.rotateZ(Math.PI / 2 + rng.range(-0.5, 0.5)).rotateY(rng.range(0, Math.PI * 2));
      leaf.translate(Math.cos(a) * d, h * rng.range(0.7, 0.95), Math.sin(a) * d);
      parts.push(leaf);
    }
  }
  return merge(parts);
}

export function bare({ seed, colors }) {
  const rng = new Rng(seed);
  const [lo, hi] = colors.bark;
  const parts = [];
  const limb = (len, r0, r1, x, y, z, rz, ry) => {
    const g = new THREE.CylinderGeometry(r1, r0, len, 4, 1, true).translate(0, len / 2, 0);
    paint(g, lo, hi);
    g.rotateZ(rz).rotateY(ry).translate(x, y, z);
    frost(g, colors.snow, 0.3);
    parts.push(g);
    return g;
  };
  const h = rng.range(3.5, 4.8);
  limb(h, 0.26, 0.12, 0, 0, 0, rng.range(-0.05, 0.05), 0);
  const n = rng.int(4, 6);
  for (let i = 0; i < n; i++) {
    const y = h * rng.range(0.45, 0.95), ry = rng.range(0, Math.PI * 2), rz = rng.range(0.5, 1.0);
    const len = rng.range(1.4, 2.6);
    limb(len, 0.09, 0.03, 0, y, 0, rz, ry);
    // A twig or two off each branch.
    const tipX = Math.sin(rz) * len * 0.7, tipY = y + Math.cos(rz) * len * 0.7;
    for (let t = 0; t < 2; t++) {
      limb(rng.range(0.6, 1.1), 0.03, 0.01, Math.cos(ry) * -tipX, tipY, Math.sin(ry) * tipX, rz + rng.range(-0.7, 0.2), ry + rng.range(-0.6, 0.6));
    }
  }
  return merge(parts);
}

export function giantMushroom({ seed, colors }) {
  const rng = new Rng(seed);
  const h = rng.range(4, 7), r = rng.range(1.8, 3);
  const stalk = new THREE.CylinderGeometry(0.32, 0.55, h, 8, 4).translate(0, h / 2, 0);
  const p = stalk.attributes.position, lean = rng.range(-0.5, 0.5);
  for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) + Math.sin((p.getY(i) / h) * Math.PI * 0.5) * lean);
  stalk.computeVertexNormals();
  paint(stalk, mix3(colors.stalk, [0, 0, 0], 0.5), colors.stalk);
  const cap = new THREE.SphereGeometry(r, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, rng.range(0.4, 0.6), 1).translate(lean, h, 0);
  paint(cap, colors.cap[0], colors.cap[1]);
  const gills = solid(new THREE.CircleGeometry(r * 0.96, 14).rotateX(Math.PI / 2).translate(lean, h + 0.02, 0), colors.gill);
  const rim = solid(new THREE.TorusGeometry(r * 0.98, 0.06, 4, 20).rotateX(Math.PI / 2).translate(lean, h + 0.05, 0), colors.gill.map((v) => v * 1.3));
  return twoPart([stalk, cap], [gills, rim]);
}

// ---------------------------------------------------------------------------
// Props

export function glowMushroom() {
  const stem = new THREE.CylinderGeometry(0.035, 0.05, 0.22, 5).translate(0, 0.11, 0);
  const cap = new THREE.SphereGeometry(0.11, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.6, 1).translate(0, 0.21, 0);
  return merge([solid(stem, [1, 1, 1]), solid(cap, [1, 1, 1])]);
}

export function rock({ seed = 1, color }) {
  const g = new THREE.DodecahedronGeometry(0.5, 0).scale(1, 0.6, 0.9).translate(0, 0.18, 0);
  const p = g.attributes.position, rng = new Rng(seed);
  for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * rng.range(0.85, 1.15), p.getY(i), p.getZ(i) * rng.range(0.85, 1.15));
  g.computeVertexNormals();
  return solid(g, color);
}

export function paperLantern() {
  const pole = solid(new THREE.CylinderGeometry(0.04, 0.05, 2.4, 5).translate(0, 1.2, 0), [0.02, 0.015, 0.01]);
  const arm = solid(new THREE.BoxGeometry(0.5, 0.04, 0.04).translate(0.22, 2.35, 0), [0.02, 0.015, 0.01]);
  const body = solid(new THREE.CylinderGeometry(0.2, 0.2, 0.42, 10).translate(0.42, 1.95, 0), [1, 1, 1]);
  const top = solid(new THREE.CylinderGeometry(0.12, 0.2, 0.06, 10).translate(0.42, 2.19, 0), [0.4, 0.2, 0.1]);
  return twoPart([pole, arm], [body, top]);
}

export function lilyPad({ flower, color }) {
  const pad = paint(new THREE.CircleGeometry(0.5, 12, 0.35, Math.PI * 2 - 0.7).rotateX(-Math.PI / 2).translate(0, 0.02, 0), color, color);
  if (!flower) return pad;
  const bloom = solid(new THREE.ConeGeometry(0.14, 0.2, 6).translate(0.08, 0.12, 0.06), flower);
  return twoPart([pad], [bloom]);
}

export function reeds({ seed = 2, color }) {
  const rng = new Rng(seed);
  const parts = [];
  for (let i = 0; i < 6; i++) {
    const h = rng.range(1.1, 2.1), x = rng.range(-0.3, 0.3), z = rng.range(-0.3, 0.3);
    parts.push(paint(new THREE.CylinderGeometry(0.012, 0.02, h, 3).translate(x, h / 2, z).rotateZ(rng.range(-0.08, 0.08)), color.map((v) => v * 0.5), color));
    if (rng.chance(0.6)) parts.push(solid(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 5).translate(x, h * 0.85, z), [0.55, 0.35, 0.22]));
  }
  return merge(parts);
}

export function frogGlow() {
  return merge([-1, 1].map((s) => solid(new THREE.SphereGeometry(0.03, 5, 3).translate(s * 0.05, 0.06, 0), [1, 1, 1])));
}

export function iceShard({ seed = 4 }) {
  const rng = new Rng(seed);
  const parts = [];
  for (let i = 0; i < 3; i++) {
    const h = rng.range(0.4, 1.1), r = rng.range(0.06, 0.13);
    const prism = new THREE.CylinderGeometry(r, r, h, 6).translate(0, h / 2, 0);
    const tip = new THREE.ConeGeometry(r, r * 2.4, 6).translate(0, h + r * 1.2, 0);
    for (const g of [prism, tip]) {
      solid(g, [1, 1, 1]);
      g.rotateZ(rng.range(-0.35, 0.35)).rotateX(rng.range(-0.3, 0.3)).translate(rng.range(-0.15, 0.15), 0, rng.range(-0.15, 0.15));
      parts.push(g);
    }
  }
  return merge(parts);
}
