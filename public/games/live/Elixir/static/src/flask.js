// The apparatus: the vessel of the moment on its stand, the liquid in layers,
// the workshop's tap above it, the pour, bubbles, splashes, the etched marks,
// and the gold lines that show the true measure once a potion is served.
//
// Levels are fractions of the vessel: 0 at the etched base line, 1 at the
// etched full line. Every vessel is a straight prism between them (see
// vessels.js), so height is volume.

import * as THREE from 'three';
import { INGREDIENT_LOOK } from './workshops.js';
import { label, dot } from './textures.js';
import { liquidMaterial } from './materials.js';
import { shapeOf, glassGeometry, liquidGeometry, surfaceGeometry, ringGeometry, tickGeometry, corkGeometry, corkY, standGeometry, MAX_LEVEL } from './vessels.js';
import { makeTap } from './taps.js';

export { MAX_LEVEL };

const linear = (hex) => new THREE.Color(hex);
const FOOT_EDGE = 0.11;
const look = (id) => INGREDIENT_LOOK[id] || { color: '#ffffff', glow: '#ffffff' };

export class Apparatus {
  constructor(world) {
    this.world = world;
    this.scene = world.scene;
    this.t = 0;
    this.level = 0;
    this.pouring = false;
    this.ingredient = null;
    this.bands = [];
    this.slosh = 0;
    this.pourAmt = 0;
    this.anim = null;
    this.ticksN = 0;
    this.fullText = 'full';
    this.dummy = new THREE.Object3D();
    this.buildStream();
    this.buildSparks();
  }

  /** Puts this vessel on the stand and this tap above it (a workshop's pair). */
  setVessel(vesselId, tapKind, standLook) {
    this.disposeVessel();
    const s = (this.shape = shapeOf(vesselId));
    this.group = new THREE.Group(); // everything that is bottled and carried away
    this.scene.add(this.group);

    // One transmissive mesh in the scene: this glass.
    this.glass = new THREE.Mesh(glassGeometry(s), new THREE.MeshPhysicalMaterial({
      color: '#ffffff', metalness: 0, roughness: 0.035, transmission: 1, thickness: 0.06, ior: 1.46,
      specularIntensity: 0.7, envMapIntensity: 1.2, clearcoat: 0.25, clearcoatRoughness: 0.12, depthWrite: false,
      attenuationColor: new THREE.Color('#e8fff4'), attenuationDistance: 3,
    }));
    this.glass.renderOrder = 1;
    this.group.add(this.glass);

    this.liquid = new THREE.Group();
    this.group.add(this.liquid);
    this.bandGeo = liquidGeometry(s);
    this.bandMeshes = [];
    this.surface = new THREE.Mesh(surfaceGeometry(s), this.surfaceMaterial(s));
    this.surface.visible = false;
    this.group.add(this.surface);

    // Etched base and full lines all the way round, labelled on the left.
    this.markMat = new THREE.MeshBasicMaterial({ color: this.marks ? new THREE.Color(this.marks.line) : new THREE.Color(0.75, 0.66, 0.5) });
    // A prism's vertical edges catch the light, so its glass reads even in a dark room.
    if (!s.round) {
      const edgeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.55, 0.58, 0.62), transparent: true, opacity: 0.55, depthWrite: false });
      const len = s.straightTop - FOOT_EDGE;
      for (let k = 0; k < s.n; k++) {
        const a = s.rot + (2 * Math.PI * k) / s.n;
        const e = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, len, 4), edgeMat);
        e.position.set(Math.cos(a) * (s.outer + 0.002), FOOT_EDGE + len / 2, Math.sin(a) * (s.outer + 0.002));
        e.renderOrder = 2;
        this.group.add(e);
      }
      const rim = new THREE.Mesh(ringGeometry(s, 0.005, 0.002), edgeMat);
      rim.position.y = s.neck ? s.straightTop : s.straightTop + 0.012;
      this.group.add(rim);
    }
    for (const [lv, tube] of [[0, 0.0045], [1, 0.0055]]) {
      const m = new THREE.Mesh(ringGeometry(s, tube), this.markMat);
      m.position.y = s.yOf(lv);
      this.group.add(m);
    }
    this.zeroLabel = this.sprite('0', 0.15);
    this.zeroLabel.position.set(-s.left - 0.04 - (0.15 * this.zeroLabel.userData.aspect) / 2, s.yOf(0) + 0.005, 0.05);
    this.group.add(this.zeroLabel);
    this.fullLabel = null;
    this.setFullLabel(this.fullText);
    this.ticks = new THREE.Group();
    this.group.add(this.ticks);
    this.setTicks(this.ticksN);
    this.targetGroup = new THREE.Group();
    this.group.add(this.targetGroup);
    this.guide = null;

    this.cork = new THREE.Mesh(corkGeometry(s), new THREE.MeshStandardMaterial({ color: '#9a7048', roughness: 0.92, envMapIntensity: 0.3 }));
    this.cork.visible = false;
    this.group.add(this.cork);

    this.buildBubbles();

    // The stand and its shadow stay on the bench.
    this.stand = new THREE.Mesh(standGeometry(s), new THREE.MeshStandardMaterial({ envMapIntensity: 1.2, ...standLook }));
    this.scene.add(this.stand);
    this.standShadow = this.world.shadow(0, 0, (s.foot || s.outer) + 0.45, (s.foot || s.outer) + 0.35, 0.9);

    this.tap = makeTap(tapKind, s.spoutY);
    this.scene.add(this.tap.group);
    this.streamMesh.position.y = s.spoutY;
    this.stream = { tail: s.spoutY, head: s.spoutY, on: false };
    if (this.ingredient) this.setIngredient(this.ingredient, true);
    this.world.setFrame({ y1: this.tap.frameTop, spoutY: s.spoutY, half: Math.max(s.left, s.right) });
  }

  disposeVessel() {
    if (!this.group) return;
    this.scene.remove(this.group, this.stand, this.standShadow, this.tap.group);
    this.clearTargets();
    for (const o of [this.group, this.stand, this.standShadow]) {
      o.traverse((x) => {
        if (x.geometry) x.geometry.dispose();
        if (x.material && !x.isSprite) for (const m of [].concat(x.material)) m.dispose();
        if (x.isSprite) { x.material.map?.dispose(); x.material.dispose(); }
      });
    }
    this.tap.dispose();
  }

  surfaceMaterial(s) {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color() }, uGlow: { value: new THREE.Color() }, uTime: { value: 0 }, uPour: { value: 0 }, uSlosh: { value: 0 },
        uR: { value: s.r }, uN: { value: s.round ? 0 : s.n }, uRot: { value: s.rot }, uApo: { value: s.apothem },
      },
      vertexShader: /* glsl */`
        uniform float uTime, uPour, uSlosh;
        varying vec2 vXZ;
        float height(vec2 p) {
          float r = length(p);
          float ripple = uPour * 0.009 * sin(r * 70.0 - uTime * 16.0) * exp(-r * 5.0);
          float slosh = uSlosh * 0.03 * (p.x * cos(uTime * 7.0) + p.y * sin(uTime * 5.3));
          return ripple + slosh;
        }
        void main() {
          vec3 p = position;
          vXZ = p.xz;
          p.y += height(p.xz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: /* glsl */`
        uniform vec3 uColor, uGlow; uniform float uTime, uPour, uSlosh, uR, uN, uRot, uApo;
        varying vec2 vXZ;
        void main() {
          float r = length(vXZ);
          // How far towards the wall: by radius in a round vessel, by face in a prism.
          float edge = r / uR;
          if (uN > 0.5) {
            edge = 0.0;
            for (int k = 0; k < 8; k++) {
              if (float(k) >= uN) break;
              float a = uRot + (2.0 * float(k) + 1.0) * 3.14159265 / uN;
              edge = max(edge, dot(vXZ, vec2(cos(a), sin(a))) / uApo);
            }
          }
          float dr = uPour * 0.009 * 70.0 * cos(r * 70.0 - uTime * 16.0) * exp(-r * 5.0);
          vec3 n = normalize(vec3(-dr * vXZ.x / max(r, 1e-3) - uSlosh * 0.03 * cos(uTime * 7.0), 1.0, -dr * vXZ.y / max(r, 1e-3) - uSlosh * 0.03 * sin(uTime * 5.3)));
          float glint = pow(max(dot(n, normalize(vec3(-0.35, 1.0, 0.55))), 0.0), 60.0);
          float meniscus = smoothstep(0.86, 0.99, edge);
          vec3 col = uColor * 0.42 + uGlow * 0.55;
          col += vec3(1.0, 0.95, 0.85) * (meniscus * 0.55 + glint * 1.4);
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
  }

  /** The workshop's ink for marks and their labels (dark in bright rooms). */
  setMarks(marks) { this.marks = marks || null; }

  sprite(text, height, color) {
    // In a bright room the marks' labels go dark on a pale halo, and the
    // coloured error labels sit on a dark plate.
    const ink = this.marks ? (color ? { color, plate: 'rgba(28, 20, 14, 0.78)' } : { color: this.marks.ink, glow: this.marks.glow }) : color ? { color } : undefined;
    const { texture, aspect } = label(text, ink);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, depthTest: false }));
    sp.scale.set(height * aspect, height, 1);
    sp.renderOrder = 5;
    sp.userData.aspect = aspect;
    return sp;
  }

  setFullLabel(text) {
    this.fullText = text;
    if (!this.group) return;
    if (this.fullLabel) {
      this.group.remove(this.fullLabel);
      this.fullLabel.material.map.dispose();
      this.fullLabel.material.dispose();
    }
    const s = this.shape;
    this.fullLabel = this.sprite(text, 0.15);
    const w = 0.15 * this.fullLabel.userData.aspect;
    this.fullLabel.position.set(-s.left - 0.04 - w / 2, s.yOf(1) + 0.005, 0.05);
    this.group.add(this.fullLabel);
  }

  /** Faint ticks on the face towards the camera, at every 1/n. */
  setTicks(n) {
    this.ticksN = n;
    if (!this.group) return;
    const old = this.ticks.children[0];
    if (old) { old.geometry.dispose(); old.material.dispose(); }
    this.ticks.clear();
    if (!n || n < 2) return;
    const geo = tickGeometry(this.shape);
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.85, 0.8, 0.7) });
    for (let k = 1; k < n; k++) {
      const m = new THREE.Mesh(geo, mat);
      m.position.y = this.shape.yOf(k / n);
      this.ticks.add(m);
    }
  }

  /** A dotted ghost line round the glass at this level (the tutorial's first pour), or none. */
  setGuide(level) {
    if (this.guide) { this.group.remove(this.guide); this.guide.geometry.dispose(); this.guide.material.dispose(); this.guide = null; }
    if (level == null) return;
    const g = ringGeometry(this.shape, 0.007, 0.008);
    g.computeBoundingSphere();
    const m = new THREE.Mesh(g, new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      vertexShader: 'varying vec3 vP; void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'varying vec3 vP; uniform float uTime; void main() { float a = atan(vP.z, vP.x); float on = step(0.0, sin(a * 40.0 - uTime * 2.0)); gl_FragColor = vec4(vec3(1.3, 1.2, 0.95), on * (0.65 + 0.35 * sin(uTime * 4.0))); }',
    }));
    m.position.y = this.shape.yOf(level);
    m.renderOrder = 4;
    this.guide = m;
    this.group.add(m);
  }

  buildStream() {
    const sg = new THREE.CylinderGeometry(0.02, 0.014, 1, 18, 8, true);
    sg.translate(0, -0.5, 0);
    this.streamMesh = new THREE.Mesh(sg, new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color() }, uGlow: { value: new THREE.Color() }, uTime: { value: 0 } },
      vertexShader: /* glsl */`
        varying vec2 vUv; varying vec3 vN; varying vec3 vV;
        void main() { vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: /* glsl */`
        varying vec2 vUv; varying vec3 vN; varying vec3 vV;
        uniform vec3 uColor, uGlow; uniform float uTime;
        void main() {
          float facing = abs(dot(normalize(vN), normalize(vV)));
          float flow = 0.85 + 0.15 * sin(vUv.y * 90.0 + uTime * 40.0) * sin(vUv.x * 18.0);
          vec3 col = (uColor * 0.5 + uGlow * 1.1) * (0.5 + 0.8 * facing) * flow;
          gl_FragColor = vec4(col, 1.0);
        }`,
    }));
    this.streamMesh.visible = false;
    this.scene.add(this.streamMesh);
  }

  buildBubbles() {
    // Bubbles rise through the liquid; splashes jump where the pour lands.
    const N = 140;
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.6, 1.7), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
    this.bubbleMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), mat, N);
    this.bubbleMesh.frustumCulled = false;
    this.bubbleMesh.renderOrder = 3;
    this.group.add(this.bubbleMesh);
    this.bubbles = Array.from({ length: N }, () => ({ live: false, x: 0, y: 0, z: 0, v: 0, s: 0 }));
    const S = 60;
    this.splashMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(), transparent: true, opacity: 0.9, depthWrite: false });
    this.splashMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 4), this.splashMat, S);
    this.splashMesh.frustumCulled = false;
    this.splashMesh.renderOrder = 3;
    this.group.add(this.splashMesh);
    this.splashes = Array.from({ length: S }, () => ({ live: false, p: new THREE.Vector3(), v: new THREE.Vector3(), s: 0 }));
  }

  buildSparks() {
    // Sparkles when a potion is bottled.
    const K = 90;
    this.sparkPos = new Float32Array(K * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.sparkPos, 3));
    this.sparkMat = new THREE.PointsMaterial({ size: 0.07, map: dot(), color: new THREE.Color(2.4, 2.0, 1.2), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    this.sparks = new THREE.Points(geo, this.sparkMat);
    this.sparks.frustumCulled = false;
    this.sparkData = Array.from({ length: K }, () => ({ p: new THREE.Vector3(), v: new THREE.Vector3() }));
    this.scene.add(this.sparks);
    this.sparkT = 1;
  }

  /** The tap now holds this ingredient. */
  setIngredient(id, instant = false) {
    this.ingredient = id;
    const l = look(id);
    this.tap.setColor(l.color, l.glow, instant);
    this.streamMesh.material.uniforms.uColor.value.copy(linear(l.color));
    this.streamMesh.material.uniforms.uGlow.value.copy(linear(l.glow));
    this.splashMat.color.copy(linear(l.glow)).multiplyScalar(1.4);
  }

  /** @param {Array<{ingredient: string, from: number, to: number}>} bands */
  setBands(bands) {
    this.bands = bands;
    const s = this.shape;
    while (this.bandMeshes.length < bands.length) {
      const m = new THREE.Mesh(this.bandGeo, liquidMaterial());
      this.liquid.add(m);
      this.bandMeshes.push(m);
    }
    this.bandMeshes.forEach((m, i) => {
      const b = bands[i];
      if (!b || b.to - b.from < 1e-4) { m.visible = false; return; }
      m.visible = true;
      if (m.userData.ingredient !== b.ingredient) {
        const l = look(b.ingredient);
        m.material.uniforms.uColor.value.copy(linear(l.color));
        m.material.uniforms.uGlow.value.copy(linear(l.glow));
        m.userData.ingredient = b.ingredient;
      }
      m.position.y = s.yOf(b.from);
      m.scale.y = (b.to - b.from) * s.h;
    });
    const level = bands.length ? bands[bands.length - 1].to : 0;
    this.level = level;
    const topBand = [...bands].reverse().find((b) => b.to - b.from > 1e-4);
    this.surface.visible = level > 0.001 && Boolean(topBand);
    if (topBand) {
      const l = look(topBand.ingredient);
      this.surface.material.uniforms.uColor.value.copy(linear(l.color));
      this.surface.material.uniforms.uGlow.value.copy(linear(l.glow));
    }
    this.surface.position.y = s.yOf(level) + 0.0015;
  }

  setPouring(on) {
    if (on === this.pouring) return;
    this.pouring = on;
    const sy = this.shape.spoutY;
    if (on) {
      this.stream.on = true;
      this.stream.tail = sy;
      if (this.stream.head >= sy - 0.001) this.stream.head = sy;
    } else {
      this.stream.on = false;
      this.slosh = Math.max(this.slosh, 0.6);
    }
  }

  /**
   * The true measures, drawn as gold lines round the glass, each with its error.
   * @param {Array<{level: number, text: string, color: string}>} list
   */
  showTargets(list) {
    this.clearTargets();
    const s = this.shape;
    const gold = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.05, 0.35) });
    const geo = ringGeometry(s, 0.0065, 0.006);
    list.forEach((t, i) => {
      const ring = new THREE.Mesh(geo, gold);
      ring.position.y = s.yOf(t.level);
      ring.scale.setScalar(0.001);
      ring.userData.born = this.t + i * 0.25;
      this.targetGroup.add(ring);
      const sp = this.sprite(t.text, 0.15, t.color);
      const w = 0.15 * sp.userData.aspect;
      sp.position.set(s.right + 0.08 + w / 2, s.yOf(t.level), 0.12);
      sp.material.opacity = 0;
      sp.userData.born = this.t + i * 0.25 + 0.15;
      this.targetGroup.add(sp);
    });
  }

  clearTargets() {
    if (!this.targetGroup) return;
    const geos = new Set();
    for (const c of [...this.targetGroup.children]) {
      if (c.isSprite) { c.material.map.dispose(); c.material.dispose(); } else { geos.add(c.geometry); c.material.dispose(); }
      this.targetGroup.remove(c);
    }
    for (const g of geos) g.dispose();
  }

  sparkle(color) {
    this.sparkMat.color.copy(new THREE.Color(color)).multiplyScalar(2.2);
    this.sparkT = 0;
    const centre = new THREE.Vector3(0, this.shape.yOf(this.level * 0.6), 0).applyMatrix4(this.group.matrixWorld);
    for (const sp of this.sparkData) {
      sp.p.copy(centre).add(new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 0.4));
      sp.v.set((Math.random() - 0.5) * 1.2, 0.6 + Math.random() * 1.4, (Math.random() - 0.5) * 0.8);
    }
  }

  /**
   * Corks the vessel, blends its layers, and carries it to the shelf. `onShelf`
   * runs once it's there; the vessel stays away until regrow() brings the next.
   */
  bottle(spot, blendColor, onShelf) {
    this.cork.visible = true;
    this.cork.position.y = this.shape.spoutY + 0.1;
    this.anim = { t: 0, spot, onShelf, k: 0.42 / this.shape.rimY, blend: new THREE.Color(blendColor), handed: false, from: this.bandMeshes.map((m) => ({ c: m.material.uniforms.uColor.value.clone(), g: m.material.uniforms.uGlow.value.clone() })) };
  }

  /** The next vessel grows on the stand. */
  regrow() {
    if (!this.anim) this.anim = { t: 0, handed: true };
    this.anim.growAt = this.anim.t;
  }

  get busy() { return Boolean(this.anim); }

  reset() {
    this.clearTargets();
    this.setGuide(null);
    this.setBands([]);
    this.cork.visible = false;
    for (const m of this.bandMeshes) { m.userData.ingredient = null; m.material.uniforms.uBright.value = 1; }
    for (const b of this.bubbles) b.live = false;
  }

  surfaceY() { return this.shape.yOf(this.level); }

  /** The world-space point at the middle of the surface at this level, for pointers. */
  pointAt(level) {
    return new THREE.Vector3(0, this.shape.yOf(level), 0).applyMatrix4(this.group.matrixWorld);
  }

  update(dt) {
    this.t += dt;
    const t = this.t;
    for (const m of this.bandMeshes) m.material.uniforms.uTime.value = t;
    this.streamMesh.material.uniforms.uTime.value = t;
    if (this.guide) this.guide.material.uniforms.uTime.value = t;
    const su = this.surface.material.uniforms;
    su.uTime.value = t;
    this.pourAmt += ((this.pouring ? 1 : 0) - this.pourAmt) * (1 - Math.exp(-dt * 10));
    this.slosh *= Math.exp(-dt * 1.8);
    su.uPour.value = this.pourAmt;
    su.uSlosh.value = this.slosh;
    this.tap.update(dt, t, this.pouring);

    // The stream: its front falls to the surface; when the tap shuts, its tail follows.
    const st = this.stream;
    const sy = this.shape.spoutY;
    const surf = this.surfaceY();
    const fall = 14 * dt;
    if (st.on) {
      st.tail = sy;
      st.head = Math.max(surf, st.head - fall);
    } else {
      st.tail = Math.max(surf, st.tail - fall);
      st.head = Math.max(surf, st.head - fall);
      if (st.tail <= surf + 0.002) st.head = st.tail = sy;
    }
    const len = st.tail - st.head;
    this.streamMesh.visible = len > 0.005;
    this.streamMesh.position.y = st.tail;
    this.streamMesh.scale.y = Math.max(0.001, len);

    const landing = st.on && st.head <= surf + 0.01;
    this.updateBubbles(dt, landing);
    this.updateSplashes(dt, landing);
    this.updateSparks(dt);
    this.updateTargets();
    this.updateBottling(dt);
  }

  updateBubbles(dt, landing) {
    const s = this.shape;
    const top = this.surfaceY();
    const reach = s.apothem - 0.04;
    const spawn = (near) => {
      const b = this.bubbles.find((x) => !x.live);
      if (!b || this.level < 0.02) return;
      const r = near ? Math.random() * Math.min(0.1, reach) : Math.sqrt(Math.random()) * reach;
      const a = Math.random() * Math.PI * 2;
      b.live = true;
      b.x = Math.cos(a) * r;
      b.z = Math.sin(a) * r;
      b.y = near ? top - 0.05 - Math.random() * Math.min(0.5, this.level * s.h * 0.8) : s.y0 + 0.01 + Math.random() * (top - s.y0) * 0.3;
      b.v = near ? 0.35 + Math.random() * 0.5 : 0.12 + Math.random() * 0.2;
      b.s = near ? 0.006 + Math.random() * 0.012 : 0.004 + Math.random() * 0.008;
      b.ph = Math.random() * 10;
    };
    let n = (landing ? 70 : 3) * dt;
    while (n > 0) { if (Math.random() < n) spawn(landing); n -= 1; }
    const d = this.dummy;
    this.bubbles.forEach((b, i) => {
      if (b.live) {
        b.y += b.v * dt;
        b.x += Math.sin(this.t * 6 + b.ph) * 0.02 * dt;
        if (b.y >= top - 0.004 || b.y < s.y0) b.live = false;
      }
      d.position.set(b.x, b.y, b.z);
      d.scale.setScalar(b.live ? b.s : 0);
      d.updateMatrix();
      this.bubbleMesh.setMatrixAt(i, d.matrix);
    });
    this.bubbleMesh.instanceMatrix.needsUpdate = true;
  }

  updateSplashes(dt, landing) {
    const top = this.surfaceY();
    const reach = this.shape.apothem - 0.01;
    if (landing) {
      let n = 45 * dt;
      while (n > 0) {
        if (Math.random() < n) {
          const sp = this.splashes.find((x) => !x.live);
          if (sp) {
            const a = Math.random() * Math.PI * 2;
            sp.live = true;
            sp.p.set(Math.cos(a) * 0.03, top + 0.005, Math.sin(a) * 0.03);
            sp.v.set(Math.cos(a) * (0.2 + Math.random() * 0.35), 0.45 + Math.random() * 0.7, Math.sin(a) * (0.2 + Math.random() * 0.35));
            sp.s = 0.006 + Math.random() * 0.008;
          }
        }
        n -= 1;
      }
    }
    const d = this.dummy;
    this.splashes.forEach((sp, i) => {
      if (sp.live) {
        sp.v.y -= 6 * dt;
        sp.p.addScaledVector(sp.v, dt);
        if (sp.p.y < top || Math.hypot(sp.p.x, sp.p.z) > reach) sp.live = false;
      }
      d.position.copy(sp.p);
      d.scale.setScalar(sp.live ? sp.s : 0);
      d.updateMatrix();
      this.splashMesh.setMatrixAt(i, d.matrix);
    });
    this.splashMesh.instanceMatrix.needsUpdate = true;
  }

  updateSparks(dt) {
    if (this.sparkT >= 1) { this.sparkMat.opacity = 0; return; }
    this.sparkT = Math.min(1, this.sparkT + dt / 1.6);
    this.sparkMat.opacity = Math.sin(this.sparkT * Math.PI) * 0.95;
    this.sparkData.forEach((sp, i) => {
      sp.v.y -= 0.6 * dt;
      sp.v.multiplyScalar(Math.exp(-dt * 1.2));
      sp.p.addScaledVector(sp.v, dt);
      this.sparkPos[i * 3] = sp.p.x; this.sparkPos[i * 3 + 1] = sp.p.y; this.sparkPos[i * 3 + 2] = sp.p.z;
    });
    this.sparks.geometry.attributes.position.needsUpdate = true;
  }

  updateTargets() {
    for (const c of this.targetGroup.children) {
      const k = Math.min(1, Math.max(0, (this.t - c.userData.born) / 0.5));
      const e = 1 - Math.pow(1 - k, 3);
      if (c.isSprite) c.material.opacity = e;
      else c.scale.setScalar(Math.max(0.001, e));
    }
  }

  updateBottling(dt) {
    const a = this.anim;
    if (!a) return;
    a.t += dt;
    const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
    if (!a.handed) {
      // 0–0.5 s: the cork drops in; 0.25–1.25 s: the layers blend into one colour.
      const s = this.shape;
      this.cork.position.y = THREE.MathUtils.lerp(s.spoutY + 0.1, corkY(s), ease(a.t / 0.45));
      const blendK = ease((a.t - 0.25) / 1.0);
      this.bandMeshes.forEach((m, i) => {
        const f = a.from[i];
        if (!f) return;
        m.material.uniforms.uColor.value.copy(f.c).lerp(a.blend, blendK * 0.8);
        m.material.uniforms.uGlow.value.copy(f.g).lerp(a.blend, blendK * 0.8);
        m.material.uniforms.uBright.value = 1 + Math.sin(blendK * Math.PI) * 0.8;
      });
      if (!a.sparked && a.t > 0.5) { a.sparked = true; this.sparkle(a.blend); this.slosh = 1; }
      // 1.3–2.2 s: carried up and over to the shelf, shrinking.
      const fly = ease((a.t - 1.3) / 0.9);
      this.group.position.set(
        THREE.MathUtils.lerp(0, a.spot.x, fly),
        THREE.MathUtils.lerp(0, a.spot.y - 0.075 * a.k, fly) + Math.sin(fly * Math.PI) * 0.5,
        THREE.MathUtils.lerp(0, a.spot.z, fly),
      );
      this.group.scale.setScalar(THREE.MathUtils.lerp(1, a.k, fly));
      if (a.t > 2.2) {
        a.handed = true;
        this.group.visible = false;
        this.reset();
        this.group.position.set(0, 0, 0);
        this.group.scale.setScalar(0.001);
        a.onShelf?.();
      }
      return;
    }
    // Then, once asked: the next vessel grows on the stand.
    if (a.growAt == null) return;
    this.group.visible = true;
    const k = Math.min(1, (a.t - a.growAt) / 0.7);
    const back = 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2);
    this.group.scale.set(1, Math.max(0.001, back), 1);
    if (k >= 1) {
      this.group.scale.setScalar(1);
      this.anim = null;
    }
  }
}
