// What drifts through the air in a realm: falling leaves, snow, motes of
// mist, rising spores. Each particle's place is worked out on the GPU from
// time and the camera's position, wrapped in a box around the view, so the
// CPU does nothing per frame.

import * as THREE from 'three';
import { TIME, POINT_SCALE } from './space.js';
import { Rng } from './rng.js';

const BOX = new THREE.Vector3(36, 14, 70);
const SHAPE = { motes: 0, spores: 0, snow: 1, leaves: 2 };

export class Weather {
  constructor(scene) {
    this.scene = scene;
    this.points = null;
    this.cam = { value: new THREE.Vector3() };
  }

  set(spec, seed) {
    this.clear();
    if (!spec) return;
    const rng = new Rng(seed);
    const n = spec.count;
    const base = new Float32Array(n * 3), seedA = new Float32Array(n), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      base.set([rng.range(0, BOX.x), rng.range(0, BOX.y), rng.range(0, BOX.z)], i * 3);
      seedA[i] = rng.next();
      col.set(rng.pick(spec.colors), i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(base, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seedA, 1));
    geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    const glow = spec.kind === 'motes' || spec.kind === 'spores';
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: glow ? THREE.AdditiveBlending : THREE.NormalBlending,
      fog: true,
      uniforms: {
        ...THREE.UniformsLib.fog,
        uTime: TIME,
        uPixel: POINT_SCALE,
        uCam: this.cam,
        uBox: { value: BOX },
        uSize: { value: spec.size },
        uFall: { value: spec.fall },
        uWind: { value: spec.wind },
        uSway: { value: spec.sway },
        uShape: { value: SHAPE[spec.kind] ?? 0 },
      },
      vertexShader: /* glsl */`
        #include <fog_pars_vertex>
        attribute float aSeed;
        attribute vec3 aColor;
        uniform float uTime, uPixel, uSize, uFall, uWind, uSway;
        uniform vec3 uCam, uBox;
        varying vec3 vCol;
        varying float vSpin;
        varying float vFade;
        void main() {
          float t = uTime;
          vec3 p = position;
          p.x += uWind * t + sin(t * (0.6 + aSeed) + aSeed * 40.0) * uSway;
          p.y -= uFall * t * (0.7 + 0.6 * aSeed);
          p.z += cos(t * (0.5 + aSeed * 0.7) + aSeed * 17.0) * uSway * 0.6;
          // Wrap into a box that rides with the camera, mostly ahead of it.
          vec3 o = vec3(uCam.x - uBox.x * 0.5, 0.0, uCam.z - uBox.z * 0.85);
          p.x = o.x + mod(p.x - o.x, uBox.x);
          p.y = mod(p.y, uBox.y);
          p.z = o.z + mod(p.z - o.z, uBox.z);
          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          vCol = aColor;
          vSpin = t * (1.0 + aSeed * 2.0) + aSeed * 6.28;
          // Fade at the box's edges so nothing pops in.
          vec3 q = (p - o) / uBox;
          vFade = smoothstep(0.0, 0.08, q.y) * smoothstep(1.0, 0.85, q.y) * smoothstep(0.0, 0.1, q.z) * smoothstep(1.0, 0.92, q.z);
          // Close to the lens a flake would fill the screen: hold its size and let it fade.
          vFade *= smoothstep(1.5, 4.0, -mvPosition.z);
          gl_PointSize = uSize * uPixel / max(4.0, -mvPosition.z);
          #include <fog_vertex>
        }`,
      fragmentShader: /* glsl */`
        #include <fog_pars_fragment>
        uniform float uShape;
        varying vec3 vCol;
        varying float vSpin;
        varying float vFade;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float a;
          if (uShape > 1.5) {
            // A leaf: a pointed oval, turning as it falls.
            float s = sin(vSpin), k = cos(vSpin);
            vec2 r = vec2(k * c.x - s * c.y, s * c.x + k * c.y);
            r.x *= 1.0 + 0.7 * abs(sin(vSpin * 0.7));
            float d = length(vec2(r.x * 2.1, r.y * 1.1));
            a = smoothstep(0.5, 0.42, d + abs(r.x) * 0.25);
            if (a < 0.02) discard;
            gl_FragColor = vec4(vCol * (0.75 + 0.25 * (1.0 - abs(r.x) * 4.0)), a * vFade);
          } else if (uShape > 0.5) {
            float d = length(c) * 2.0;
            a = smoothstep(1.0, 0.35, d);
            if (a < 0.02) discard;
            gl_FragColor = vec4(vCol, a * 0.85 * vFade);
          } else {
            float d = length(c) * 2.0;
            a = exp(-d * d * 5.0);
            if (d > 1.0) discard;
            gl_FragColor = vec4(vCol * a * vFade * 1.6, 1.0);
          }
          #include <fog_fragment>
        }`,
    });
    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    // Under the gates' panels, so a passing leaf never hides an operand.
    this.points.renderOrder = -0.5;
    this.scene.add(this.points);
  }

  update(camera) { this.cam.value.copy(camera.position); }

  clear() {
    if (!this.points) return;
    this.scene.remove(this.points);
    this.points.geometry.dispose();
    this.points.material.dispose();
    this.points = null;
  }
}
