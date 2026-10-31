// Rows of gates across the path: posts and crowns in the realm's own
// architecture (mossy stone, root arches, red torii, ice, mushroom stalks),
// and between each pair of posts an arch of coloured light with its
// operation written in it. The light keeps one colour code in every realm:
// × gold, + green, − red, ÷ violet.

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { PATH_HALF, path } from './space.js';
import { gateTexture, OP_COLOR } from './labels.js';
import { label } from './stage.js';
import { Rng } from './rng.js';

const PANEL_H = 3.2, PANEL_Y = 0.3;
const HDR = 1.55;

/** Lane centres across the path for a row of g gates. */
export function laneCenters(g) {
  const w = (PATH_HALF * 2) / g;
  return Array.from({ length: g }, (_, i) => -PATH_HALF + w * (i + 0.5));
}

export function laneOf(g, x) {
  const w = (PATH_HALF * 2) / g;
  return Math.max(0, Math.min(g - 1, Math.floor((x + PATH_HALF) / w)));
}

// ---------------------------------------------------------------------------
// Architecture. Each style gives a post (one per boundary), an optional top
// (glowing, one per post) and an optional crown (one per gate, spanning it).

function merged(parts) {
  const flat = parts.map((p) => (p.index ? p.toNonIndexed() : p));
  const g = mergeGeometries(flat);
  for (const p of new Set([...parts, ...flat])) p.dispose();
  return g;
}

function tinted(geo, rgb) {
  const n = geo.attributes.position.count, c = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) c.set(rgb, i * 3);
  geo.setAttribute('color', new THREE.BufferAttribute(c, 3));
  return geo;
}

const rgbOf = (hex) => new THREE.Color(hex).toArray();
// Knots in wood: a displacement that depends only on position, so vertices
// shared along a seam move together and no cracks open.
const gnarl = (a, b, c) => Math.sin(a * 5.1 + b * 3.7) * 0.03 + Math.sin(b * 7.3 + c * 4.1) * 0.025;

const STYLES = {
  stone: {
    post: () => merged([
      new THREE.CylinderGeometry(0.2, 0.3, 3.7, 6).translate(0, 1.85, 0),
      new THREE.CylinderGeometry(0.34, 0.26, 0.26, 6).translate(0, 3.83, 0),
      new THREE.CylinderGeometry(0.42, 0.48, 0.3, 6).translate(0, 0.15, 0),
    ]),
    top: () => new THREE.IcosahedronGeometry(0.13, 1),
    topY: 4.25,
  },
  roots: {
    // A trunk of twisted roots, and over each gate an arch of root.
    post: () => {
      const g = new THREE.CylinderGeometry(0.2, 0.36, 4.0, 6, 8).translate(0, 2, 0);
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const [x, y, z] = [p.getX(i), p.getY(i), p.getZ(i)];
        p.setXYZ(i, x + Math.sin(y * 1.7) * 0.1 + gnarl(x, y, z), y, z + Math.cos(y * 1.3) * 0.09 + gnarl(z, y, x));
      }
      g.computeVertexNormals();
      return merged([g, new THREE.ConeGeometry(0.62, 0.7, 6).translate(0, 0.35, 0)]);
    },
    top: () => new THREE.IcosahedronGeometry(0.12, 0),
    topY: 4.12,
    crown: (width) => {
      const parts = [];
      for (const [r, y, t] of [[width / 2, 3.75, 0.13], [width / 2 - 0.2, 3.7, 0.07]]) {
        const arch = new THREE.TorusGeometry(r, t, 5, 18, Math.PI).scale(1, 0.42, 1).translate(0, y, 0);
        const p = arch.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const [x, yy, z] = [p.getX(i), p.getY(i), p.getZ(i)];
          p.setXYZ(i, x, yy + gnarl(x, yy, z) * 1.4, z + gnarl(z, x, yy));
        }
        arch.computeVertexNormals();
        parts.push(arch);
      }
      return merged(parts);
    },
  },
  torii: {
    // Lacquered red posts with black feet; over each gate a black kasagi
    // with upturned ends and a red nuki below it.
    post: (s) => {
      const red = rgbOf(s.post), black = rgbOf(s.beam);
      return merged([
        tinted(new THREE.CylinderGeometry(0.15, 0.17, 4.1, 10).translate(0, 2.05, 0), red),
        tinted(new THREE.CylinderGeometry(0.22, 0.22, 0.45, 10).translate(0, 0.22, 0), black),
      ]);
    },
    crown: (width, s) => {
      const red = rgbOf(s.post), black = rgbOf(s.beam);
      const L = width + 0.9;
      const parts = [
        tinted(new THREE.BoxGeometry(L, 0.2, 0.36).translate(0, 4.32, 0), black),
        tinted(new THREE.BoxGeometry(L - 0.2, 0.14, 0.3).translate(0, 4.16, 0), red),
        tinted(new THREE.BoxGeometry(width + 0.35, 0.14, 0.16).translate(0, 3.55, 0), red),
        tinted(new THREE.BoxGeometry(0.14, 0.5, 0.14).translate(0, 3.85, 0), red),
      ];
      for (const side of [-1, 1]) {
        parts.push(tinted(new THREE.BoxGeometry(0.5, 0.18, 0.36).rotateZ(side * 0.32).translate(side * (L / 2 + 0.18), 4.42, 0), black));
      }
      return merged(parts);
    },
    vertexColors: true,
    // Lacquer that holds the lantern light.
    emissive: '#3a0806',
    rough: 0.45,
  },
  ice: {
    // A column of ice with crystals leaning on its foot.
    post: () => {
      const rng = new Rng(11);
      const parts = [
        new THREE.CylinderGeometry(0.22, 0.3, 3.5, 6).translate(0, 1.75, 0),
        new THREE.ConeGeometry(0.22, 0.75, 6).translate(0, 3.87, 0),
      ];
      for (let i = 0; i < 3; i++) {
        const h = rng.range(0.5, 1.1);
        parts.push(new THREE.CylinderGeometry(0.09, 0.11, h, 6).translate(0, h / 2, 0).rotateZ(rng.range(-0.5, 0.5)).rotateY(rng.range(0, 6.28)).translate(rng.range(-0.25, 0.25), 0, rng.range(-0.25, 0.25)));
      }
      return merged(parts);
    },
    top: () => merged([0, 1, 2].map((i) => new THREE.OctahedronGeometry(0.1 + i * 0.03, 0).scale(0.6, 1.8, 0.6).rotateZ((i - 1) * 0.5).translate((i - 1) * 0.08, 0, 0))),
    topY: 4.35,
    emissive: '#13324a',
    rough: 0.2,
  },
  mushroom: {
    // A pale stalk, bulging a little, under a glowing cap.
    post: () => {
      const g = new THREE.CylinderGeometry(0.24, 0.34, 3.6, 10, 6).translate(0, 1.8, 0);
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const k = 1 + Math.sin((p.getY(i) / 3.6) * Math.PI) * 0.18;
        p.setX(i, p.getX(i) * k);
        p.setZ(i, p.getZ(i) * k);
      }
      g.computeVertexNormals();
      return g;
    },
    top: () => merged([
      new THREE.SphereGeometry(0.62, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.55, 1),
      new THREE.CircleGeometry(0.6, 14).rotateX(Math.PI / 2),
    ]),
    topY: 3.55,
    rough: 0.8,
  },
};

// ---------------------------------------------------------------------------

export class Gates {
  constructor(scene, mirror) {
    this.scene = scene;
    this.mirror = mirror;
    this.group = new THREE.Group();
    scene.add(this.group);
    this.rows = [];
    this.parts = [];
    this.twins = [];
    this.m = new THREE.Matrix4();
    this.q = new THREE.Quaternion();
    this.s = new THREE.Vector3();
    this.v = new THREE.Vector3();
    this.up = new THREE.Vector3(0, 1, 0);
  }

  /**
   * Lays out a stage's rows at the given z positions, in a realm's style;
   * with `mirrored`, still water under them shows them upside down.
   * @returns the rows, each { z, gates: [{ mesh, x, width, label, color }] }
   */
  build(stage, zs, realm, mirrored = false, capacity = stage.rows.length) {
    this.clear();
    const style = realm.gate;
    const kit = (this.kit = STYLES[style.style] || STYLES.stone);
    const g = (this.g = stage.gatesPerRow);
    const n = capacity;
    this.realm = realm;
    this.mirrored = mirrored;

    const postMat = new THREE.MeshStandardMaterial({
      color: kit.vertexColors ? '#ffffff' : style.post, vertexColors: Boolean(kit.vertexColors),
      roughness: kit.rough ?? 0.95, metalness: 0, flatShading: true, emissive: kit.emissive || '#000000',
    });
    const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(...style.glow), toneMapped: false });
    const width = (PATH_HALF * 2) / g;
    this.posts = this.instanced(kit.post(style), postMat, n * (g + 1), mirrored);
    this.tops = kit.top ? this.instanced(kit.top(style), glowMat, n * (g + 1), mirrored) : null;
    this.crowns = kit.crown ? this.instanced(kit.crown(width, style), postMat, n * g, mirrored) : null;
    if (!kit.top) glowMat.dispose();
    this.used = { p: 0, c: 0 };
    stage.rows.forEach((row, r) => this.addRow(row, zs[r]));
    return this.rows;
  }

  /** One more row at depth z; with `rise`, it grows out of the ground rather than appearing. */
  addRow(row, z, rise = false) {
    const { kit, g, realm, mirrored } = this;
    const r = this.rows.length;
    const width = (PATH_HALF * 2) / g;
    const xs = laneCenters(g);
    const posts = [];
    for (let i = 0; i <= g; i++) posts.push({ i: this.used.p++, x: -PATH_HALF + width * i, ry: kit.vertexColors ? 0 : (r * 7 + i * 3) % 6, sy: 0.95 + ((r + i) % 3) * 0.05 });
    const crowns = kit.crown ? xs.map((x) => ({ i: this.used.c++, x })) : [];
    const gates = row.gates.map((gate, i) => {
      const text = label(gate);
      const color = OP_COLOR[gate.steps[0].k];
      const w = width - 0.42;
      const map = gateTexture(text, color, w / PANEL_H, realm.backing);
      const mat = new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, color: new THREE.Color().setScalar(HDR), opacity: rise ? 0 : 1 });
      const geo = new THREE.PlaneGeometry(w, PANEL_H);
      const mesh = new THREE.Mesh(geo, mat);
      this.group.add(mesh);
      // No reflection of the panels: upside down, a 2 reads as a 5.
      return { mesh, twin: null, x: xs[i], width, label: text, color, chosen: false };
    });
    const out = { z, cx: path.x(z), yaw: path.yaw(z), gates, posts, crowns, passed: false, sunk: 0, rise: rise ? 1 : 0, topY: kit.topY ?? 4.2 };
    this.rows.push(out);
    for (const mesh of [...this.parts, ...this.twins]) {
      const of = mesh.userData.of || mesh;
      mesh.count = of === this.crowns ? this.used.c : this.used.p;
    }
    this.place(out, out.rise);
    return out;
  }

  instanced(geo, mat, count, mirrored) {
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    mesh.frustumCulled = false;
    mesh.count = 0;
    this.group.add(mesh);
    this.parts.push(mesh);
    if (mirrored) {
      const twin = new THREE.InstancedMesh(geo, mat, count);
      twin.instanceMatrix = mesh.instanceMatrix;
      twin.frustumCulled = false;
      twin.count = 0;
      twin.userData.of = mesh;
      this.mirror.add(twin);
      this.twins.push(twin);
    }
    return mesh;
  }

  /** World position of a point x across the row (in the path's own frame) at height y. */
  at(row, x, y, out) {
    return out.set(row.cx + x * Math.cos(row.yaw), y, row.z - x * Math.sin(row.yaw));
  }

  // Posts stand on the path until the row is passed, then sink away: the
  // camera rides behind the swarm and would otherwise fly into them.
  place(row, sink) {
    const { m, q, s, v, up } = this;
    const drop = sink * sink * 4.6;
    for (const post of row.posts) {
      q.setFromAxisAngle(up, row.yaw + post.ry);
      this.posts.setMatrixAt(post.i, m.compose(this.at(row, post.x, -drop, v), q, s.set(1, post.sy, 1)));
      if (this.tops) this.tops.setMatrixAt(post.i, m.compose(this.at(row, post.x, row.topY * post.sy - drop * 1.2, v), q, s.setScalar(Math.max(0.001, 1 - sink))));
    }
    q.setFromAxisAngle(up, row.yaw);
    for (const cr of row.crowns) this.crowns.setMatrixAt(cr.i, m.compose(this.at(row, cr.x, -drop * 1.3, v), q, s.set(1, 1, 1)));
    for (const mesh of this.parts) mesh.instanceMatrix.needsUpdate = true;
    for (const g of row.gates) {
      this.at(row, g.x, PANEL_Y + PANEL_H / 2, g.mesh.position);
      g.mesh.rotation.y = row.yaw;
      if (g.twin) {
        g.twin.position.copy(g.mesh.position);
        g.twin.rotation.y = row.yaw;
      }
    }
  }

  /** The swarm went through gate i of row r: that arch flares and opens; the others dim. */
  pass(r, i) {
    const row = this.rows[r];
    row.passed = true;
    row.gates.forEach((g, k) => { g.chosen = k === i; });
  }

  /** Where gate i of row r stands, for sparks. */
  center(r, i, out) { return this.at(this.rows[r], this.rows[r].gates[i].x, PANEL_Y + PANEL_H / 2, out); }

  /** Passed rows fade by how far the swarm has flown past them, so it holds at any speed. */
  update(s, dt) {
    for (const row of this.rows) {
      if (row.rise > 0) {
        row.rise = Math.max(0, row.rise - dt / 1.2);
        this.place(row, row.rise);
        for (const g of row.gates) g.mesh.material.opacity = 1 - row.rise;
      }
      if (!row.passed || row.sunk >= 1) continue;
      const k = Math.min(1, Math.max(0, (s + row.z) / 3.5));
      if (k === row.sunk) continue;
      row.sunk = k;
      this.place(row, k);
      for (const g of row.gates) {
        const mat = g.mesh.material;
        if (g.chosen) {
          mat.color.setScalar(HDR + 3 * Math.sin(Math.min(1, k * 2) * Math.PI));
          mat.opacity = (1 - k) * (1 - k);
          g.mesh.scale.setScalar(1 + k * 0.3);
        } else {
          mat.opacity = Math.max(0, 1 - k * 2.2) * 0.75;
        }
        g.mesh.visible = k < 1;
        if (g.twin) {
          g.twin.scale.copy(g.mesh.scale);
          g.twin.visible = g.mesh.visible;
        }
      }
    }
  }

  clear() {
    for (const row of this.rows) for (const g of row.gates) {
      g.mesh.geometry.dispose();
      g.mesh.material.map.dispose();
      g.mesh.material.dispose();
      this.group.remove(g.mesh);
      if (g.twin) this.mirror.remove(g.twin);
    }
    const mats = new Set();
    for (const mesh of this.parts) {
      this.group.remove(mesh);
      mesh.geometry.dispose();
      mats.add(mesh.material);
      mesh.dispose();
    }
    for (const twin of this.twins) this.mirror.remove(twin);
    for (const m of mats) m.dispose();
    this.parts = [];
    this.twins = [];
    this.posts = this.tops = this.crowns = null;
    this.rows = [];
  }
}
