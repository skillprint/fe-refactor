// Shaders the rooms, taps and vessels share: glowing liquid, candle and
// lantern flames, and drifting particles animated on the GPU.

import * as THREE from 'three';
import { dot } from './textures.js';

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

/** A glowing liquid that needs no lights, so it reads the same in every room. */
export function liquidMaterial(color = '#ffffff', glow = '#ffffff') {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uGlow: { value: new THREE.Color(glow) }, uTime: { value: 0 }, uBright: { value: 1 } },
    vertexShader: liquidVert,
    fragmentShader: liquidFrag,
  });
}

/** A billboard flame; `hue` tints it (warm candle by default). */
export function flameMaterial(core = [5.0, 3.6, 2.2], body = [3.2, 1.25, 0.32]) {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPhase: { value: Math.random() * 20 }, uCore: { value: new THREE.Vector3(...core) }, uBody: { value: new THREE.Vector3(...body) } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
      varying vec2 vUv; uniform float uTime; uniform float uPhase; uniform vec3 uCore; uniform vec3 uBody;
      void main() {
        vec2 p = vUv - vec2(0.5, 0.18);
        float sway = sin(uTime * 7.0 + uPhase) * 0.05 + sin(uTime * 13.0 + uPhase * 2.0) * 0.025;
        p.x -= sway * pow(max(p.y, 0.0), 1.4) * 3.0;
        p.x *= 2.6 + p.y * 2.0;
        float r = length(vec2(p.x, max(p.y, 0.0) * 0.55 + min(p.y, 0.0) * 1.8));
        float body = smoothstep(0.32, 0.0, r);
        float core = smoothstep(0.12, 0.0, length(vec2(p.x * 1.4, (p.y - 0.06) * 0.9)));
        vec3 col = uBody * body + uCore * core;
        float blue = smoothstep(0.08, 0.0, length(vec2(p.x, p.y + 0.06))) * 0.6;
        col += vec3(0.2, 0.35, 1.2) * blue;
        gl_FragColor = vec4(col * body, 1.0);
      }`,
  });
}

const MODES = { drift: 0, fall: 1, rise: 2 };

/**
 * Motes that move by themselves: `drift` turns slowly about where they start,
 * `fall` comes down like snow, `rise` goes up like embers; all can twinkle.
 * @param {object} o
 * @param {number} o.count
 * @param {(i: number) => THREE.Vector3} o.place a starting point for mote i
 * @param {string} o.color
 * @param {number} o.size world units
 * @param {'drift'|'fall'|'rise'} o.mode
 * @param {number} o.span how far fall/rise travel before wrapping
 * @param {number} o.twinkle 0 steady … 1 flickering
 * @param {number} o.opacity
 */
export function motes({ count, place, color, size = 0.03, mode = 'drift', span = 3, speed = 1, twinkle = 0, opacity = 0.6 }) {
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const p = place(i);
    pos.set([p.x, p.y, p.z], i * 3);
    seed[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }, uColor: { value: new THREE.Color(color) }, uSize: { value: size }, uMode: { value: MODES[mode] },
      uSpan: { value: span }, uSpeed: { value: speed }, uTwinkle: { value: twinkle }, uOpacity: { value: opacity }, uMap: { value: dot() },
      uScale: { value: 400 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute float seed;
      uniform float uTime, uSize, uMode, uSpan, uSpeed, uTwinkle, uScale;
      varying float vA;
      void main() {
        vec3 p = position;
        float t = uTime * uSpeed;
        float ph = seed * 100.0;
        if (uMode < 0.5) {
          p += vec3(sin(t * 0.13 * (0.4 + seed) + ph) * 0.18, sin(t * 0.09 * (0.4 + seed) + ph * 2.0) * 0.22, cos(t * 0.11 * (0.4 + seed) + ph) * 0.15);
        } else if (uMode < 1.5) {
          p.y -= mod(t * (0.25 + 0.35 * seed) + seed * uSpan, uSpan);
          p.x += sin(t * 0.7 + ph) * 0.08;
        } else {
          float k = mod(t * (0.25 + 0.4 * seed) + seed * uSpan, uSpan);
          p.y += k;
          p.x += sin(t * 1.3 + ph) * 0.06 * k;
        }
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * uScale / -mv.z;
        float tw = 1.0 - uTwinkle * (0.5 + 0.5 * sin(uTime * (2.0 + seed * 5.0) + ph));
        float life = uMode > 1.5 ? 1.0 - mod(t * (0.25 + 0.4 * seed) + seed * uSpan, uSpan) / uSpan : 1.0;
        vA = tw * life;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; uniform float uOpacity; uniform sampler2D uMap;
      varying float vA;
      void main() {
        float a = texture2D(uMap, gl_PointCoord).a;
        gl_FragColor = vec4(uColor * a * vA * uOpacity, 1.0);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  return points;
}
