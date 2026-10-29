// Rows of gates across the path: stone posts, and between each pair an arch
// of coloured light with its operation written in it.

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { PATH_HALF } from './world.js';
import { gateTexture, OP_COLOR } from './labels.js';
import { label } from './stage.js';

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

function postGeometry() {
  const shaft = new THREE.CylinderGeometry(0.2, 0.3, 3.7, 6);
  shaft.translate(0, 1.85, 0);
  const cap = new THREE.CylinderGeometry(0.34, 0.26, 0.26, 6);
  cap.translate(0, 3.83, 0);
  const foot = new THREE.CylinderGeometry(0.42, 0.48, 0.3, 6);
  foot.translate(0, 0.15, 0);
  const g = mergeGeometries([shaft, cap, foot]);
  for (const p of [shaft, cap, foot]) p.dispose();
  return g;
}

export class Gates {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    scene.add(this.group);
    this.postGeo = postGeometry();
    this.postMat = new THREE.MeshStandardMaterial({ color: '#3b4652', roughness: 0.95, metalness: 0, flatShading: true });
    this.orbGeo = new THREE.IcosahedronGeometry(0.13, 1);
    this.orbMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 1.9, 1.7), toneMapped: false });
    this.rows = [];
    this.posts = null;
    this.orbs = null;
  }

  /**
   * Lays out a stage's rows at the given z positions.
   * @returns the rows, each { z, gates: [{ mesh, x, width, label, color }] }
   */
  build(stage, zs) {
    this.clear();
    const g = stage.gatesPerRow;
    const width = (PATH_HALF * 2) / g;
    const xs = laneCenters(g);
    const postCount = stage.rows.length * (g + 1);
    this.posts = new THREE.InstancedMesh(this.postGeo, this.postMat, postCount);
    this.orbs = new THREE.InstancedMesh(this.orbGeo, this.orbMat, postCount);
    let p = 0;
    this.rows = stage.rows.map((row, r) => {
      const z = zs[r];
      const posts = [];
      for (let i = 0; i <= g; i++) {
        posts.push({ i: p++, x: -PATH_HALF + width * i, ry: (r * 7 + i * 3) % 6, sy: 0.95 + ((r + i) % 3) * 0.05 });
      }
      this.place(posts, z, 0);
      const gates = row.gates.map((gate, i) => {
        const text = label(gate);
        const color = OP_COLOR[gate.steps[0].k];
        const w = width - 0.42;
        const map = gateTexture(text, color, w / PANEL_H);
        const mat = new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, color: new THREE.Color().setScalar(HDR) });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, PANEL_H), mat);
        mesh.position.set(xs[i], PANEL_Y + PANEL_H / 2, z);
        this.group.add(mesh);
        return { mesh, x: xs[i], width, label: text, color, chosen: false };
      });
      return { z, gates, posts, passed: false, sunk: 0 };
    });
    this.group.add(this.posts, this.orbs);
    return this.rows;
  }

  // Posts stand on the path until the row is passed, then sink away: the
  // camera rides behind the swarm and would otherwise fly into them.
  place(posts, z, sink) {
    const m = this.m ||= new THREE.Matrix4();
    const q = this.q ||= new THREE.Quaternion();
    const s = this.s ||= new THREE.Vector3();
    const v = this.v ||= new THREE.Vector3();
    const up = this.up ||= new THREE.Vector3(0, 1, 0);
    const drop = sink * sink * 4.6;
    for (const post of posts) {
      q.setFromAxisAngle(up, post.ry);
      this.posts.setMatrixAt(post.i, m.compose(v.set(post.x, -drop, z), q, s.set(1, post.sy, 1)));
      this.orbs.setMatrixAt(post.i, m.compose(v.set(post.x, 4.25 - drop * 1.2, z), q, s.setScalar(1 - sink)));
    }
    this.posts.instanceMatrix.needsUpdate = true;
    this.orbs.instanceMatrix.needsUpdate = true;
  }

  /** The swarm went through gate i of row r: that arch flares and opens; the others dim. */
  pass(r, i) {
    const row = this.rows[r];
    row.passed = true;
    row.gates.forEach((g, k) => { g.chosen = k === i; });
  }

  /** Passed rows fade by how far the swarm has flown past them, so it holds at any speed. */
  update(s) {
    for (const row of this.rows) {
      if (!row.passed || row.sunk >= 1) continue;
      const k = Math.min(1, Math.max(0, (s + row.z) / 3.5));
      if (k === row.sunk) continue;
      row.sunk = k;
      this.place(row.posts, row.z, k);
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
      }
    }
  }

  clear() {
    for (const row of this.rows) for (const g of row.gates) {
      g.mesh.geometry.dispose();
      g.mesh.material.map.dispose();
      g.mesh.material.dispose();
      this.group.remove(g.mesh);
    }
    if (this.posts) {
      this.group.remove(this.posts, this.orbs);
      this.posts.dispose();
      this.orbs.dispose();
      this.posts = this.orbs = null;
    }
    this.rows = [];
  }
}
