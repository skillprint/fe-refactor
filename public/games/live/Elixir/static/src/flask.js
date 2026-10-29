// The apparatus: a tall cylindrical flask on a brass stand, the liquid in
// layers, the tap above it with its reservoir and valve, the pour, bubbles,
// splashes, the etched marks, and the gold lines that show the true measure
// once a potion is served.
//
// Levels are fractions of the flask: 0 at the etched base line, 1 at the
// etched full line. The flask is a straight cylinder between them, so height
// is volume.

import * as THREE from 'three';
import { LIQUIDS } from './look.js';
import { label, dot } from './textures.js';

export const R = 0.3;          // inner radius
const T = 0.016;               // wall
export const Y0 = 0.16;        // level 0
export const H = 1.6;          // level 0 to level 1
export const MAX_LEVEL = 1.12; // the rim
const SPOUT_Y = 2.2;
const ORB = new THREE.Vector3(0.64, 2.42, -0.05);
const PIPE_Y = 2.42;

const yOf = (level) => Y0 + level * H;
const linear = (hex) => new THREE.Color(hex);

const liquidVert = /* glsl */`
  varying vec3 vN; varying vec3 vV; varying vec3 vP;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal); vV = -mv.xyz; vP = position;
    gl_Position = projectionMatrix * mv;
  }`;
const liquidFrag = /* glsl */`
  varying vec3 vN; varying vec3 vV; varying vec3 vP;
  uniform vec3 uColor; uniform vec3 uGlow; uniform float uTime; uniform float uBright;
  void main() {
    float facing = abs(dot(normalize(vN), normalize(vV)));
    float a = atan(vP.z, vP.x);
    float swirl = sin(a * 3.0 + vP.y * 9.0 - uTime * 0.7) * 0.5 + sin(a * 5.0 - vP.y * 13.0 + uTime * 0.45) * 0.5;
    vec3 col = uColor * (0.14 + 0.36 * facing) + uGlow * (0.16 + 0.55 * pow(facing, 2.5)) * uBright;
    col *= 0.92 + 0.08 * swirl;
    gl_FragColor = vec4(col, 1.0);
  }`;

function liquidMaterial(id) {
  const l = LIQUIDS[id];
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: linear(l.color) }, uGlow: { value: linear(l.glow) }, uTime: { value: 0 }, uBright: { value: 1 } },
    vertexShader: liquidVert,
    fragmentShader: liquidFrag,
  });
}

export class Apparatus {
  constructor(world) {
    this.world = world;
    this.scene = world.scene;
    this.group = new THREE.Group(); // everything that is bottled and carried away
    this.scene.add(this.group);
    this.t = 0;
    this.level = 0;
    this.pouring = false;
    this.ingredient = 'moonwater';
    this.bands = [];
    this.stream = { tail: SPOUT_Y, head: SPOUT_Y, on: false };
    this.slosh = 0;
    this.pourAmt = 0;
    this.anim = null;
    this.targets = [];

    this.build();
    this.buildTap();
    this.buildParticles();
    this.setIngredient('moonwater', true);
  }

  build() {
    // Glass: a thick base, straight walls, a flared lip.
    const o = R + T;
    const pts = [
      [0, 0.075], [o - 0.035, 0.075], [o - 0.008, 0.085], [o, 0.11], [o, 1.9], [o + 0.012, 1.95], [o + 0.04, 2.0],
      [o + 0.045, 2.012], [o + 0.03, 2.02], [R + 0.012, 1.99], [R, 1.94], [R, Y0 + 0.025], [R - 0.025, Y0], [0, Y0],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    this.glass = new THREE.Mesh(
      new THREE.LatheGeometry(pts, 96),
      new THREE.MeshPhysicalMaterial({
        color: '#ffffff', metalness: 0, roughness: 0.035, transmission: 1, thickness: 0.06, ior: 1.46,
        specularIntensity: 0.7, envMapIntensity: 1.2, clearcoat: 0.25, clearcoatRoughness: 0.12, depthWrite: false,
        attenuationColor: new THREE.Color('#e8fff4'), attenuationDistance: 3,
      }),
    );
    this.glass.renderOrder = 1;
    this.group.add(this.glass);

    // The liquid: one cylinder per band, and a moving surface on top.
    this.liquid = new THREE.Group();
    this.group.add(this.liquid);
    this.bandMeshes = [];
    this.unitCyl = new THREE.CylinderGeometry(R - 0.004, R - 0.004, 1, 72, 1, false);
    this.unitCyl.translate(0, 0.5, 0);
    const surfGeo = new THREE.RingGeometry(0.0005, R - 0.004, 72, 14);
    surfGeo.rotateX(-Math.PI / 2);
    this.surface = new THREE.Mesh(surfGeo, new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color() }, uGlow: { value: new THREE.Color() }, uTime: { value: 0 }, uPour: { value: 0 }, uSlosh: { value: 0 }, uR: { value: R } },
      vertexShader: /* glsl */`
        uniform float uTime, uPour, uSlosh;
        varying vec2 vXZ; varying float vH;
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
          vH = p.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: /* glsl */`
        uniform vec3 uColor, uGlow; uniform float uTime, uPour, uSlosh, uR;
        varying vec2 vXZ; varying float vH;
        void main() {
          float r = length(vXZ);
          // The surface's slope, for a moving glint.
          float dr = uPour * 0.009 * 70.0 * cos(r * 70.0 - uTime * 16.0) * exp(-r * 5.0);
          vec3 n = normalize(vec3(-dr * vXZ.x / max(r, 1e-3) - uSlosh * 0.03 * cos(uTime * 7.0), 1.0, -dr * vXZ.y / max(r, 1e-3) - uSlosh * 0.03 * sin(uTime * 5.3)));
          float glint = pow(max(dot(n, normalize(vec3(-0.35, 1.0, 0.55))), 0.0), 60.0);
          float meniscus = smoothstep(uR - 0.045, uR - 0.004, r);
          vec3 col = uColor * 0.42 + uGlow * 0.55;
          col += vec3(1.0, 0.95, 0.85) * (meniscus * 0.55 + glint * 1.4);
          gl_FragColor = vec4(col, 1.0);
        }`,
    }));
    this.surface.visible = false;
    this.group.add(this.surface);

    // Etched marks: the base and full lines all the way round, labelled.
    const markMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.75, 0.66, 0.5) });
    this.markMat = markMat;
    const ring = (y, tube = 0.0045) => {
      const m = new THREE.Mesh(new THREE.TorusGeometry(o + 0.003, tube, 6, 120), markMat);
      m.rotation.x = Math.PI / 2;
      m.position.y = y;
      return m;
    };
    this.group.add(ring(yOf(0)), ring(yOf(1), 0.0055));
    this.zeroLabel = this.sprite('0', 0.15);
    this.zeroLabel.position.set(-o - 0.15, yOf(0) + 0.005, 0.05);
    this.group.add(this.zeroLabel);
    this.fullLabel = this.sprite('full', 0.15);
    this.fullLabel.position.set(-o - 0.2, yOf(1) + 0.005, 0.05);
    this.group.add(this.fullLabel);
    this.ticks = new THREE.Group();
    this.group.add(this.ticks);
    this.targetGroup = new THREE.Group();
    this.group.add(this.targetGroup);

    // Cork, waiting above until a potion is bottled.
    this.cork = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.03, R - 0.01, 0.16, 32), new THREE.MeshStandardMaterial({ color: '#9a7048', roughness: 0.92, envMapIntensity: 0.3 }));
    this.cork.visible = false;
    this.group.add(this.cork);

    // The brass stand stays on the bench.
    const brass = (this.brass = new THREE.MeshStandardMaterial({ color: '#c79a4a', metalness: 1, roughness: 0.3, envMapIntensity: 1.2 }));
    const base = new THREE.Mesh(new THREE.CylinderGeometry(o + 0.1, o + 0.15, 0.07, 64), brass);
    base.position.y = 0.035;
    this.scene.add(base);
    const collar = new THREE.Mesh(new THREE.TorusGeometry(o + 0.035, 0.018, 12, 64), brass);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.11;
    this.scene.add(collar);
    this.world.shadow(0, 0, o + 0.45, o + 0.35, 0.9);
  }

  sprite(text, height, color) {
    const { texture, aspect } = label(text, color ? { color } : undefined);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, depthTest: false }));
    s.scale.set(height * aspect, height, 1);
    s.renderOrder = 5;
    s.userData.aspect = aspect;
    return s;
  }

  setFullLabel(text) {
    this.group.remove(this.fullLabel);
    this.fullLabel.material.map.dispose();
    this.fullLabel.material.dispose();
    this.fullLabel = this.sprite(text, 0.15);
    const w = 0.15 * this.fullLabel.userData.aspect;
    this.fullLabel.position.set(-(R + T) - 0.04 - w / 2, yOf(1) + 0.005, 0.05);
    this.zeroLabel.position.x = -(R + T) - 0.04 - (0.15 * this.zeroLabel.userData.aspect) / 2;
    this.group.add(this.fullLabel);
  }

  /** Faint ticks on the front of the glass at every 1/n. */
  setTicks(n) {
    const old = this.ticks.children[0];
    if (old) { old.geometry.dispose(); old.material.dispose(); }
    this.ticks.clear();
    if (!n || n < 2) return;
    const arc = 0.5, centre = 1.95;
    const geo = new THREE.TorusGeometry(R + T + 0.003, 0.0032, 5, 24, arc);
    geo.rotateX(Math.PI / 2);
    geo.rotateY(arc / 2 - centre);
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.85, 0.8, 0.7) });
    for (let k = 1; k < n; k++) {
      const m = new THREE.Mesh(geo, mat);
      m.position.y = yOf(k / n);
      this.ticks.add(m);
    }
  }

  buildTap() {
    const brass = this.brass;
    const pipe = (a, b, r = 0.032) => {
      const len = a.distanceTo(b);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 20), brass);
      m.position.copy(a).add(b).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
      this.scene.add(m);
      return m;
    };
    const joint = (p, r = 0.046) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), brass);
      m.position.copy(p);
      this.scene.add(m);
    };
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.05, 0.14, 24), brass);
    nozzle.position.set(0, SPOUT_Y + 0.07, 0);
    this.scene.add(nozzle);
    pipe(new THREE.Vector3(0, SPOUT_Y + 0.12, 0), new THREE.Vector3(0, PIPE_Y, 0));
    joint(new THREE.Vector3(0, PIPE_Y, 0));
    pipe(new THREE.Vector3(0, PIPE_Y, 0), new THREE.Vector3(ORB.x - 0.14, PIPE_Y, ORB.z));
    pipe(new THREE.Vector3(ORB.x - 0.03, ORB.y + 0.12, ORB.z), new THREE.Vector3(ORB.x - 0.3, ORB.y + 1.8, ORB.z - 0.3), 0.03);
    for (const x of [0.14, ORB.x - 0.19]) {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.05, 20), brass);
      c.rotation.z = Math.PI / 2;
      c.position.set(x, PIPE_Y, 0);
      this.scene.add(c);
    }

    // The valve wheel turns while the tap is open.
    const wheel = (this.wheel = new THREE.Group());
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.013, 10, 40), brass);
    wheel.add(rim);
    for (let i = 0; i < 4; i++) {
      const s = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 8), brass);
      s.rotation.z = (i * Math.PI) / 4;
      wheel.add(s);
    }
    wheel.add(new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 8), brass));
    wheel.position.set(0.32, PIPE_Y, 0.13);
    this.scene.add(wheel);
    pipe(new THREE.Vector3(0.32, PIPE_Y, 0), new THREE.Vector3(0.32, PIPE_Y, 0.13), 0.016);

    // The reservoir: a glass globe of whatever is being poured.
    const orbGlass = new THREE.Mesh(new THREE.SphereGeometry(0.16, 40, 24), new THREE.MeshStandardMaterial({ color: '#e8f0ff', transparent: true, opacity: 0.16, roughness: 0.08, envMapIntensity: 1.0, depthWrite: false }));
    orbGlass.position.copy(ORB);
    orbGlass.renderOrder = 2;
    this.scene.add(orbGlass);
    this.orbLiquid = new THREE.Mesh(new THREE.SphereGeometry(0.14, 32, 20), liquidMaterial('moonwater'));
    this.orbLiquid.position.copy(ORB);
    this.scene.add(this.orbLiquid);
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.162, 0.013, 10, 48), brass);
    band.position.copy(ORB);
    band.rotation.x = Math.PI / 2;
    this.scene.add(band);

    // The pour: a thin glowing column from the nozzle to the surface.
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
    this.streamMesh.position.set(0, SPOUT_Y, 0);
    this.streamMesh.visible = false;
    this.scene.add(this.streamMesh);
  }

  buildParticles() {
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
    this.dummy = new THREE.Object3D();
  }

  /** The tap now holds this ingredient. */
  setIngredient(id, instant = false) {
    this.ingredient = id;
    const l = LIQUIDS[id];
    this.orbFrom = { c: this.orbLiquid.material.uniforms.uColor.value.clone(), g: this.orbLiquid.material.uniforms.uGlow.value.clone() };
    this.orbTo = { c: linear(l.color), g: linear(l.glow) };
    this.orbT = instant ? 1 : 0;
    if (instant) {
      this.orbLiquid.material.uniforms.uColor.value.copy(this.orbTo.c);
      this.orbLiquid.material.uniforms.uGlow.value.copy(this.orbTo.g);
    }
    this.streamMesh.material.uniforms.uColor.value.copy(this.orbTo.c);
    this.streamMesh.material.uniforms.uGlow.value.copy(this.orbTo.g);
    this.splashMat.color.copy(this.orbTo.g).multiplyScalar(1.4);
  }

  /** @param {Array<{ingredient: string, from: number, to: number}>} bands */
  setBands(bands) {
    this.bands = bands;
    while (this.bandMeshes.length < bands.length) {
      const m = new THREE.Mesh(this.unitCyl, liquidMaterial('moonwater'));
      this.liquid.add(m);
      this.bandMeshes.push(m);
    }
    this.bandMeshes.forEach((m, i) => {
      const b = bands[i];
      if (!b || b.to - b.from < 1e-4) { m.visible = false; return; }
      m.visible = true;
      if (m.userData.ingredient !== b.ingredient) {
        const l = LIQUIDS[b.ingredient];
        m.material.uniforms.uColor.value.copy(linear(l.color));
        m.material.uniforms.uGlow.value.copy(linear(l.glow));
        m.userData.ingredient = b.ingredient;
      }
      m.position.y = yOf(b.from);
      m.scale.y = (b.to - b.from) * H;
    });
    const top = bands.length ? bands[bands.length - 1] : null;
    const level = top ? top.to : 0;
    this.level = level;
    const topBand = [...bands].reverse().find((b) => b.to - b.from > 1e-4);
    this.surface.visible = level > 0.001 && Boolean(topBand);
    if (topBand) {
      const l = LIQUIDS[topBand.ingredient];
      this.surface.material.uniforms.uColor.value.copy(linear(l.color));
      this.surface.material.uniforms.uGlow.value.copy(linear(l.glow));
    }
    this.surface.position.y = yOf(level) + 0.0015;
  }

  setPouring(on) {
    if (on === this.pouring) return;
    this.pouring = on;
    if (on) {
      this.stream.on = true;
      this.stream.tail = SPOUT_Y;
      if (this.stream.head >= SPOUT_Y - 0.001) this.stream.head = SPOUT_Y;
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
    const gold = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.05, 0.35) });
    list.forEach((t, i) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(R + T + 0.006, 0.0065, 6, 120), gold);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = yOf(t.level);
      ring.scale.setScalar(0.001);
      ring.userData.born = this.t + i * 0.25;
      this.targetGroup.add(ring);
      const s = this.sprite(t.text, 0.15, t.color);
      const w = 0.15 * s.userData.aspect;
      s.position.set(R + T + 0.08 + w / 2, yOf(t.level), 0.12);
      s.material.opacity = 0;
      s.userData.born = this.t + i * 0.25 + 0.15;
      this.targetGroup.add(s);
    });
  }

  clearTargets() {
    for (const c of [...this.targetGroup.children]) {
      c.geometry?.dispose?.();
      if (c.material?.map) c.material.map.dispose();
      c.material?.dispose?.();
      this.targetGroup.remove(c);
    }
  }

  sparkle(color) {
    this.sparkMat.color.copy(new THREE.Color(color)).multiplyScalar(2.2);
    this.sparkT = 0;
    const centre = new THREE.Vector3(0, yOf(this.level * 0.6), 0).applyMatrix4(this.group.matrixWorld);
    for (const s of this.sparkData) {
      s.p.copy(centre).add(new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 0.4));
      s.v.set((Math.random() - 0.5) * 1.2, 0.6 + Math.random() * 1.4, (Math.random() - 0.5) * 0.8);
    }
  }

  /**
   * Corks the flask, blends its layers, and carries it to the shelf; then a
   * fresh flask grows back on the stand. `done` runs once the shelf has it.
   */
  bottle(spot, blendColor, done) {
    this.cork.visible = true;
    this.cork.position.y = 2.45;
    this.anim = { t: 0, spot, done, blend: new THREE.Color(blendColor), handed: false, from: this.bandMeshes.map((m) => ({ c: m.material.uniforms.uColor.value.clone(), g: m.material.uniforms.uGlow.value.clone() })) };
  }

  get busy() { return Boolean(this.anim); }

  reset() {
    this.clearTargets();
    this.setBands([]);
    this.cork.visible = false;
    for (const m of this.bandMeshes) m.userData.ingredient = null;
    for (const b of this.bubbles) b.live = false;
  }

  surfaceY() { return yOf(this.level); }

  update(dt) {
    this.t += dt;
    const t = this.t;
    for (const m of this.bandMeshes) m.material.uniforms.uTime.value = t;
    this.orbLiquid.material.uniforms.uTime.value = t;
    this.streamMesh.material.uniforms.uTime.value = t;
    const su = this.surface.material.uniforms;
    su.uTime.value = t;
    this.pourAmt += ((this.pouring ? 1 : 0) - this.pourAmt) * (1 - Math.exp(-dt * 10));
    this.slosh *= Math.exp(-dt * 1.8);
    su.uPour.value = this.pourAmt;
    su.uSlosh.value = this.slosh;

    // Reservoir colour follows the tap's ingredient.
    if (this.orbT < 1) {
      this.orbT = Math.min(1, this.orbT + dt * 1.6);
      const k = this.orbT * this.orbT * (3 - 2 * this.orbT);
      this.orbLiquid.material.uniforms.uColor.value.copy(this.orbFrom.c).lerp(this.orbTo.c, k);
      this.orbLiquid.material.uniforms.uGlow.value.copy(this.orbFrom.g).lerp(this.orbTo.g, k);
    }
    this.orbLiquid.scale.setScalar(1 + Math.sin(t * 2.1) * 0.01);
    if (this.pouring) this.wheel.rotation.z -= dt * 5;

    // The stream: its front falls to the surface; when the tap shuts, its tail follows.
    const st = this.stream;
    const surf = this.surfaceY();
    const fall = 14 * dt;
    if (st.on) {
      st.tail = SPOUT_Y;
      st.head = Math.max(surf, st.head - fall);
    } else {
      st.tail = Math.max(surf, st.tail - fall);
      st.head = Math.max(surf, st.head - fall);
      if (st.tail <= surf + 0.002) st.head = st.tail = SPOUT_Y;
    }
    const len = st.tail - st.head;
    this.streamMesh.visible = len > 0.005;
    this.streamMesh.position.y = st.tail;
    this.streamMesh.scale.y = Math.max(0.001, len);

    this.updateBubbles(dt, st.on && st.head <= surf + 0.01);
    this.updateSplashes(dt, st.on && st.head <= surf + 0.01);
    this.updateSparks(dt);
    this.updateTargets();
    this.updateBottling(dt);
  }

  updateBubbles(dt, landing) {
    const top = this.surfaceY();
    const spawn = (near) => {
      const b = this.bubbles.find((x) => !x.live);
      if (!b || this.level < 0.02) return;
      const r = near ? Math.random() * 0.1 : Math.sqrt(Math.random()) * (R - 0.04);
      const a = Math.random() * Math.PI * 2;
      b.live = true;
      b.x = Math.cos(a) * r;
      b.z = Math.sin(a) * r;
      b.y = near ? top - 0.05 - Math.random() * Math.min(0.5, this.level * H * 0.8) : Y0 + 0.01 + Math.random() * (top - Y0) * 0.3;
      b.v = near ? 0.35 + Math.random() * 0.5 : 0.12 + Math.random() * 0.2;
      b.s = near ? 0.006 + Math.random() * 0.012 : 0.004 + Math.random() * 0.008;
      b.ph = Math.random() * 10;
    };
    const rate = landing ? 70 : 3;
    let n = rate * dt;
    while (n > 0) { if (Math.random() < n) spawn(landing); n -= 1; }
    const d = this.dummy;
    this.bubbles.forEach((b, i) => {
      if (b.live) {
        b.y += b.v * dt;
        b.x += Math.sin(this.t * 6 + b.ph) * 0.02 * dt;
        if (b.y >= top - 0.004 || b.y < Y0) b.live = false;
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
    if (landing) {
      let n = 45 * dt;
      while (n > 0) {
        if (Math.random() < n) {
          const s = this.splashes.find((x) => !x.live);
          if (s) {
            const a = Math.random() * Math.PI * 2;
            s.live = true;
            s.p.set(Math.cos(a) * 0.03, top + 0.005, Math.sin(a) * 0.03);
            s.v.set(Math.cos(a) * (0.2 + Math.random() * 0.35), 0.45 + Math.random() * 0.7, Math.sin(a) * (0.2 + Math.random() * 0.35));
            s.s = 0.006 + Math.random() * 0.008;
          }
        }
        n -= 1;
      }
    }
    const d = this.dummy;
    this.splashes.forEach((s, i) => {
      if (s.live) {
        s.v.y -= 6 * dt;
        s.p.addScaledVector(s.v, dt);
        if (s.p.y < top || Math.hypot(s.p.x, s.p.z) > R - 0.01) s.live = false;
      }
      d.position.copy(s.p);
      d.scale.setScalar(s.live ? s.s : 0);
      d.updateMatrix();
      this.splashMesh.setMatrixAt(i, d.matrix);
    });
    this.splashMesh.instanceMatrix.needsUpdate = true;
  }

  updateSparks(dt) {
    if (this.sparkT >= 1) { this.sparkMat.opacity = 0; return; }
    this.sparkT = Math.min(1, this.sparkT + dt / 1.6);
    this.sparkMat.opacity = Math.sin(this.sparkT * Math.PI) * 0.95;
    this.sparkData.forEach((s, i) => {
      s.v.y -= 0.6 * dt;
      s.v.multiplyScalar(Math.exp(-dt * 1.2));
      s.p.addScaledVector(s.v, dt);
      this.sparkPos[i * 3] = s.p.x; this.sparkPos[i * 3 + 1] = s.p.y; this.sparkPos[i * 3 + 2] = s.p.z;
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
    // 0–0.5 s: cork drops in; 0.2–1.2 s: the layers blend into one colour.
    const corkY = yOf(MAX_LEVEL) + 0.02;
    this.cork.position.y = THREE.MathUtils.lerp(2.45, corkY - 0.04, ease(a.t / 0.45));
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
    if (!a.handed) {
      const fly = ease((a.t - 1.3) / 0.9);
      const end = a.spot;
      this.group.position.set(
        THREE.MathUtils.lerp(0, end.x, fly),
        THREE.MathUtils.lerp(0, end.y - 0.075 * 0.205, fly) + Math.sin(fly * Math.PI) * 0.5,
        THREE.MathUtils.lerp(0, end.z, fly),
      );
      this.group.scale.setScalar(THREE.MathUtils.lerp(1, 0.205, fly));
    }
    if (a.t > 2.2 && !a.handed) {
      a.handed = true;
      this.group.visible = false;
      a.done?.();
      this.reset();
      this.group.position.set(0, 0, 0);
      this.group.scale.setScalar(0.001);
      this.group.visible = true;
      for (const m of this.bandMeshes) m.material.uniforms.uBright.value = 1;
    }
    // 2.2–2.9 s: a fresh flask grows on the stand.
    if (a.handed) {
      const k = Math.min(1, (a.t - 2.2) / 0.7);
      const back = 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2);
      this.group.scale.set(1, Math.max(0.001, back), 1);
      if (k >= 1) {
        this.group.scale.setScalar(1);
        this.anim = null;
      }
    }
  }
}
