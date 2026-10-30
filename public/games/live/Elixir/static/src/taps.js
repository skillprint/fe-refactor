// The spouts above the vessel, one kind per workshop. Each pours from
// (0, spoutY, 0), shows the ingredient it holds, and moves while it pours.

import * as THREE from 'three';
import { liquidMaterial } from './materials.js';
import { wood, rock } from './textures.js';

const BRASS = () => new THREE.MeshStandardMaterial({ color: '#c79a4a', metalness: 1, roughness: 0.3, envMapIntensity: 1.2 });
const COPPER = () => new THREE.MeshStandardMaterial({ color: '#c06a3a', metalness: 1, roughness: 0.34, envMapIntensity: 1.2 });
const IRON = () => new THREE.MeshStandardMaterial({ color: '#2a2a30', metalness: 0.7, roughness: 0.45 });
const GLASS = (opacity = 0.18) => new THREE.MeshStandardMaterial({ color: '#eef4ff', transparent: true, opacity, roughness: 0.06, envMapIntensity: 1.4, depthWrite: false });

function rod(a, b, r, mat, radial = 16) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, a.distanceTo(b), radial), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return m;
}
const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);

class Tap {
  constructor(spoutY) {
    this.group = new THREE.Group();
    this.spoutY = spoutY;
    this.indicators = [];   // liquid materials showing the ingredient
    this.glows = [];        // emissive materials tinted by it
    this.animate = () => {};
    this.from = null;
    this.k = 1;
  }

  add(...objs) { this.group.add(...objs); return objs[0]; }

  /** The tap now holds this ingredient; it fades over unless `instant`. */
  setColor(color, glow, instant) {
    this.from = { c: this.indicators[0]?.uniforms.uColor.value.clone() ?? new THREE.Color(color), g: this.indicators[0]?.uniforms.uGlow.value.clone() ?? new THREE.Color(glow) };
    this.to = { c: new THREE.Color(color), g: new THREE.Color(glow) };
    this.k = instant ? 1 : 0;
    if (instant) this.paint(1);
  }

  paint(k) {
    const c = this.from.c.clone().lerp(this.to.c, k), g = this.from.g.clone().lerp(this.to.g, k);
    for (const m of this.indicators) { m.uniforms.uColor.value.copy(c); m.uniforms.uGlow.value.copy(g); }
    for (const m of this.glows) { m.color.copy(c); m.emissive.copy(g); }
  }

  update(dt, t, pouring) {
    if (this.k < 1 && this.to) {
      this.k = Math.min(1, this.k + dt * 1.6);
      this.paint(this.k * this.k * (3 - 2 * this.k));
    }
    for (const m of this.indicators) m.uniforms.uTime.value = t;
    this.animate(dt, t, pouring);
  }

  dispose() {
    this.group.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) for (const m of [].concat(o.material)) { m.map?.dispose(); m.dispose(); }
    });
  }
}

// The alcove: brass pipes, a glass reservoir and a valve wheel.
function brass(sy) {
  const tap = new Tap(sy);
  const b = BRASS();
  const py = sy + 0.22;
  const orb = V(0.64, py, -0.05);
  const nozzle = tap.add(new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.05, 0.14, 24), b));
  nozzle.position.set(0, sy + 0.07, 0);
  tap.add(rod(V(0, sy + 0.12), V(0, py), 0.032, b));
  const joint = tap.add(new THREE.Mesh(new THREE.SphereGeometry(0.046, 20, 14), b));
  joint.position.set(0, py, 0);
  tap.add(rod(V(0, py), V(orb.x - 0.14, py, orb.z), 0.032, b));
  tap.add(rod(V(orb.x - 0.03, orb.y + 0.12, orb.z), V(orb.x - 0.3, orb.y + 1.8, orb.z - 0.3), 0.03, b));
  for (const x of [0.14, orb.x - 0.19]) {
    const c = tap.add(new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.05, 20), b));
    c.rotation.z = Math.PI / 2;
    c.position.set(x, py, 0);
  }
  const wheel = new THREE.Group();
  wheel.add(new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.013, 10, 40), b));
  for (let i = 0; i < 4; i++) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 8), b);
    s.rotation.z = (i * Math.PI) / 4;
    wheel.add(s);
  }
  wheel.add(new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 8), b));
  wheel.position.set(0.32, py, 0.13);
  tap.add(wheel, rod(V(0.32, py), V(0.32, py, 0.13), 0.016, b));
  const glass = tap.add(new THREE.Mesh(new THREE.SphereGeometry(0.16, 40, 24), GLASS(0.16)));
  glass.position.copy(orb);
  glass.renderOrder = 2;
  const liquid = liquidMaterial();
  tap.indicators.push(liquid);
  const fill = tap.add(new THREE.Mesh(new THREE.SphereGeometry(0.14, 32, 20), liquid));
  fill.position.copy(orb);
  const band = tap.add(new THREE.Mesh(new THREE.TorusGeometry(0.162, 0.013, 10, 48), b));
  band.position.copy(orb);
  band.rotation.x = Math.PI / 2;
  tap.frameTop = py + 0.2;
  tap.animate = (dt, t, pouring) => {
    fill.scale.setScalar(1 + Math.sin(t * 2.1) * 0.01);
    if (pouring) wheel.rotation.z -= dt * 5;
  };
  return tap;
}

// The observatory: a glass pipette held in a ring stand; its bulb squeezes as it pours.
function pipette(sy) {
  const tap = new Tap(sy);
  const pts = [[0, 0], [0.01, 0], [0.036, 0.13], [0.036, 0.5], [0.026, 0.55], [0.026, 0.6], [0, 0.6]].map(([x, y]) => new THREE.Vector2(x, y));
  const glass = tap.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 28), GLASS(0.28)));
  glass.position.y = sy;
  glass.renderOrder = 2;
  const liquid = liquidMaterial();
  tap.indicators.push(liquid);
  const inner = [[0, 0.02], [0.006, 0.02], [0.027, 0.13], [0.027, 0.42], [0, 0.42]].map(([x, y]) => new THREE.Vector2(x, y));
  const fill = tap.add(new THREE.Mesh(new THREE.LatheGeometry(inner, 20), liquid));
  fill.position.y = sy;
  const bulb = tap.add(new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 16), new THREE.MeshStandardMaterial({ color: '#5a1a2a', roughness: 0.45 })));
  bulb.position.y = sy + 0.66;
  bulb.scale.set(1, 1.25, 1);
  const steel = IRON(), b = BRASS();
  const base = tap.add(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.3), steel));
  base.position.set(0.62, 0.015, -0.18);
  tap.add(rod(V(0.62, 0, -0.18), V(0.62, sy + 0.62, -0.18), 0.016, steel));
  tap.add(rod(V(0.62, sy + 0.38, -0.18), V(0.06, sy + 0.38, 0), 0.012, b));
  const clamp = tap.add(new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 8, 24), b));
  clamp.rotation.x = Math.PI / 2;
  clamp.position.set(0, sy + 0.38, 0);
  const screw = tap.add(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.06, 12), b));
  screw.position.set(0.62, sy + 0.38, -0.1);
  screw.rotation.x = Math.PI / 2;
  tap.frameTop = sy + 0.76;
  tap.animate = (dt, t, pouring) => {
    const k = pouring ? 1 : 0;
    bulb.userData.k = (bulb.userData.k ?? 0) + (k - (bulb.userData.k ?? 0)) * (1 - Math.exp(-dt * 12));
    const q = bulb.userData.k;
    bulb.scale.set(1 + 0.18 * q, 1.25 - 0.3 * q, 1 + 0.18 * q);
  };
  return tap;
}

// The greenhouse: an oak cask on a bracket, its wooden spigot over the beaker.
function spigot(sy) {
  const tap = new Tap(sy);
  const w = wood([118, 76, 44]);
  const oak = new THREE.MeshStandardMaterial({ map: w.map, bumpMap: w.bump, bumpScale: 1.2, roughness: 0.7, envMapIntensity: 0.4 });
  const iron = IRON();
  const cy = sy + 0.4, cx = 0.82, cz = -0.22;
  const cask = tap.add(new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.66, 32, 4), oak));
  // Bulge the staves.
  const p = cask.geometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i), k = 1 + 0.12 * (1 - (y / 0.33) ** 2);
    p.setX(i, p.getX(i) * k);
    p.setZ(i, p.getZ(i) * k);
  }
  cask.geometry.computeVertexNormals();
  cask.rotation.z = Math.PI / 2;
  cask.position.set(cx, cy, cz);
  for (const dx of [-0.24, 0, 0.24]) {
    const hoop = tap.add(new THREE.Mesh(new THREE.TorusGeometry(dx ? 0.285 : 0.305, 0.012, 8, 40), iron));
    hoop.rotation.y = Math.PI / 2;
    hoop.position.set(cx + dx, cy, cz);
  }
  const shelf = tap.add(new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.05, 0.5), oak));
  shelf.position.set(cx + 0.05, cy - 0.32, cz);
  tap.add(rod(V(cx + 0.38, 0, cz - 0.1), V(cx + 0.38, cy - 0.32, cz - 0.1), 0.035, oak));
  for (const dx of [-0.2, 0.2]) {
    const chock = tap.add(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.42), oak));
    chock.position.set(cx + dx, cy - 0.26, cz);
  }
  // The spigot: out of the cask's end, across, and down.
  const y = sy + 0.16;
  tap.add(rod(V(cx - 0.33, y, cz * 0.4), V(0, y, 0), 0.03, oak));
  tap.add(rod(V(cx - 0.33, y, cz * 0.4), V(cx - 0.33, y, cz), 0.03, oak));
  tap.add(rod(V(0, y + 0.02), V(0, sy), 0.028, oak));
  const knob = tap.add(new THREE.Mesh(new THREE.SphereGeometry(0.034, 12, 8), oak));
  knob.position.set(0, y, 0);
  const key = new THREE.Group();
  key.add(rod(V(0, 0), V(0, 0.09), 0.012, oak), rod(V(-0.07, 0.09), V(0.07, 0.09), 0.014, oak));
  key.position.set(0.14, y + 0.02, 0);
  tap.add(key);
  const bulbGlass = tap.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 24, 16), GLASS(0.2)));
  bulbGlass.position.set(0.32, y, cz * 0.18);
  bulbGlass.renderOrder = 2;
  const liquid = liquidMaterial();
  tap.indicators.push(liquid);
  const fill = tap.add(new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 14), liquid));
  fill.position.copy(bulbGlass.position);
  tap.frameTop = cy + 0.3;
  tap.animate = (dt, t, pouring) => {
    const goal = pouring ? Math.PI / 2 : 0;
    key.rotation.y += (goal - key.rotation.y) * (1 - Math.exp(-dt * 10));
  };
  return tap;
}

// The cavern: a crystal hanging from the rock, glowing the colour it gives.
function crystal(sy) {
  const tap = new Tap(sy);
  const glow = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.7, roughness: 0.12, metalness: 0.1, transparent: true, opacity: 0.88, flatShading: true });
  tap.glows.push(glow);
  const shard = (len, rad) => new THREE.LatheGeometry([[0, 0], [rad, len * 0.22], [rad * 1.05, len * 0.85], [rad * 0.6, len], [0, len]].map(([x, y]) => new THREE.Vector2(x, y)), 6);
  const main = tap.add(new THREE.Mesh(shard(0.75, 0.1), glow));
  main.position.y = sy;
  const others = [];
  for (const [x, z, len, rad, tilt] of [[0.13, -0.05, 0.5, 0.07, -0.4], [-0.12, 0.02, 0.45, 0.06, 0.45], [0.05, 0.12, 0.38, 0.05, -0.2], [-0.04, -0.13, 0.55, 0.06, 0.25]]) {
    const m = tap.add(new THREE.Mesh(shard(len, rad), glow));
    m.position.set(x, sy + 0.3, z);
    m.rotation.set(tilt * 0.6, Math.random() * 3, tilt);
    others.push(m);
  }
  const r = rock();
  const stone = new THREE.MeshStandardMaterial({ map: r.map, bumpMap: r.bump, bumpScale: 3, roughness: 0.95, color: '#8a90a8', flatShading: true });
  const lump = tap.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 1), stone));
  lump.scale.set(1.2, 1.6, 1);
  lump.position.set(0.05, sy + 1.25, -0.1);
  const cone = tap.add(new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.9, 7, 3), stone));
  cone.rotation.x = Math.PI;
  cone.position.set(0, sy + 0.95, -0.05);
  tap.frameTop = sy + 0.55;
  tap.animate = (dt, t, pouring) => {
    const goal = pouring ? 1.6 : 0.7 + 0.12 * Math.sin(t * 1.7);
    glow.emissiveIntensity += (goal - glow.emissiveIntensity) * (1 - Math.exp(-dt * 8));
  };
  return tap;
}

// The cottage: a copper pot still on the bench, its swan neck arching over.
function still(sy) {
  const tap = new Tap(sy);
  const cu = COPPER();
  const px = 1.12, pz = -0.62;
  const pot = tap.add(new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.26, 0.01], [0.36, 0.2], [0.35, 0.42], [0.24, 0.58], [0.1, 0.66], [0.09, 0.76], [0, 0.76]].map(([x, y]) => new THREE.Vector2(x, y)), 40), cu));
  pot.position.set(px, 0, pz);
  const rivets = tap.add(new THREE.Mesh(new THREE.TorusGeometry(0.355, 0.012, 8, 48), cu));
  rivets.rotation.x = Math.PI / 2;
  rivets.position.set(px, 0.3, pz);
  const curve = new THREE.CatmullRomCurve3([V(px, 0.74, pz), V(px - 0.02, sy + 0.2, pz + 0.05), V(px - 0.25, sy + 0.48, pz + 0.25), V(0.42, sy + 0.42, -0.08), V(0.1, sy + 0.24, 0), V(0, sy + 0.08, 0), V(0, sy, 0)]);
  tap.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.032, 14), cu));
  const globe = curve.getPoint(0.6);
  const glass = tap.add(new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 16), GLASS(0.2)));
  glass.position.copy(globe);
  glass.renderOrder = 2;
  const liquid = liquidMaterial();
  tap.indicators.push(liquid);
  const fill = tap.add(new THREE.Mesh(new THREE.SphereGeometry(0.064, 20, 14), liquid));
  fill.position.copy(globe);
  // A pressure gauge whose needle climbs while it pours.
  const gauge = tap.add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 24), new THREE.MeshStandardMaterial({ color: '#f2e8d0', roughness: 0.6, emissive: '#3a2a1a', emissiveIntensity: 0.4 })));
  gauge.rotation.x = Math.PI / 2;
  gauge.position.set(px - 0.12, 0.42, pz + 0.33);
  gauge.lookAt(px - 0.12 - 0.3, 0.42, pz + 1.3);
  gauge.rotateX(Math.PI / 2);
  const bezel = tap.add(new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.01, 8, 24), BRASS()));
  bezel.position.copy(gauge.position);
  bezel.lookAt(px - 0.12 - 0.3, 0.42, pz + 1.3);
  const needle = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.055, 0.004), new THREE.MeshBasicMaterial({ color: '#8a1a10' }));
  needle.geometry.translate(0, 0.025, 0);
  const needleHolder = new THREE.Group();
  needleHolder.position.copy(gauge.position);
  needleHolder.lookAt(px - 0.12 - 0.3, 0.42, pz + 1.3);
  needleHolder.translateZ(0.014);
  needleHolder.add(needle);
  tap.add(needleHolder);
  tap.frameTop = sy + 0.55;
  tap.animate = (dt, t, pouring) => {
    const goal = pouring ? -1.2 + Math.sin(t * 18) * 0.05 : 0.9;
    needle.rotation.z += (goal - needle.rotation.z) * (1 - Math.exp(-dt * 5));
  };
  return tap;
}

// The caravan: a long-spouted brass ewer on a gimbal, tipping a little as it pours.
function ewer(sy) {
  const tap = new Tap(sy);
  const b = new THREE.MeshStandardMaterial({ color: '#d0a040', metalness: 1, roughness: 0.28, envMapIntensity: 1.3 });
  // Everything that tips hangs from the spout's tip, so the pour stays put.
  const pivot = new THREE.Group();
  pivot.position.set(0, sy, 0);
  tap.add(pivot);
  const bx = 0.82, by = -0.12;
  const body = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.12, 0], [0.13, 0.03], [0.22, 0.16], [0.21, 0.3], [0.1, 0.42], [0.08, 0.52], [0.13, 0.6], [0.1, 0.66], [0.03, 0.7], [0.02, 0.78], [0, 0.8]].map(([x, y]) => new THREE.Vector2(x, y)), 36), b);
  body.position.set(bx, by, -0.12);
  pivot.add(body);
  const curve = new THREE.CatmullRomCurve3([V(bx - 0.18, by + 0.16, -0.08), V(bx - 0.42, by + 0.3, -0.03), V(0.25, 0.2, 0), V(0.06, 0.05, 0), V(0, 0, 0)]);
  pivot.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 60, 0.022, 12), b));
  const handle = new THREE.CatmullRomCurve3([V(bx + 0.14, by + 0.5, -0.12), V(bx + 0.34, by + 0.42, -0.12), V(bx + 0.34, by + 0.2, -0.12), V(bx + 0.2, by + 0.12, -0.12)]);
  pivot.add(new THREE.Mesh(new THREE.TubeGeometry(handle, 30, 0.014, 8), b));
  const jewelMat = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.9, roughness: 0.15 });
  tap.glows.push(jewelMat);
  const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.045, 20, 14), jewelMat);
  jewel.position.set(bx - 0.06, by + 0.24, 0.08);
  pivot.add(jewel);
  const liquid = liquidMaterial();
  tap.indicators.push(liquid);
  const drip = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 8), liquid);
  pivot.add(drip);
  // The gimbal: a post and ring that stay put.
  tap.add(rod(V(bx, 0, -0.12), V(bx, sy + by + 0.12, -0.12), 0.02, b));
  const ring = tap.add(new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.014, 8, 40), b));
  ring.rotation.x = Math.PI / 2;
  ring.position.set(bx, sy + by + 0.16, -0.12);
  const foot = tap.add(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.04, 24), b));
  foot.position.set(bx, 0.02, -0.12);
  tap.frameTop = sy + 0.62;
  tap.animate = (dt, t, pouring) => {
    const goal = pouring ? 0.07 : 0;
    pivot.rotation.z += (goal - pivot.rotation.z) * (1 - Math.exp(-dt * 6));
  };
  return tap;
}

const BUILDERS = { brass, pipette, spigot, crystal, still, ewer };

/** A tap of this kind pouring at height `spoutY`. */
export function makeTap(kind, spoutY) {
  return (BUILDERS[kind] || brass)(spoutY);
}
