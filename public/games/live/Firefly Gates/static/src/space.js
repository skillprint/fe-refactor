// The shape of the world that everything else agrees on: the path's width,
// its bend, and the clocks shaders share.
//
// The path runs down -z. In a stage that bends it, its centre swings side to
// side as a sine whose swing fades to nothing at both ends of the stage, so a
// stage always starts and finishes straight and stages join without a seam.
// Steering, lanes and moths all live in path-local x; only drawing adds
// path.x(z).

import * as THREE from 'three';

export const PATH_HALF = 4;
export const TIME = { value: 0 };
// Pixels per world unit at distance 1, for sizing point sprites in world units.
export const POINT_SCALE = { value: 300 };

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const path = {
  // amplitude, start and end (distance flown), angular rate, phase
  uniforms: { uBend: { value: new THREE.Vector4(0, 0, 1, 0.03) }, uBendPh: { value: 0 } },

  set(a, s0, s1, k = 0.03, ph = 0) {
    this.uniforms.uBend.value.set(a, s0, s1, k);
    this.uniforms.uBendPh.value = ph;
  },

  /** The path's centre at depth z. */
  x(z) {
    const { x: a, y: s0, z: s1, w: k } = this.uniforms.uBend.value;
    if (!a) return 0;
    const s = -z;
    const env = smoothstep(s0 + 4, s0 + 34, s) * (1 - smoothstep(s1 - 32, s1, s));
    return env ? a * env * Math.sin((s - s0) * k + this.uniforms.uBendPh.value) : 0;
  },

  /** The yaw that turns something facing +z to face back down the path at depth z. */
  yaw(z) { return Math.atan2(this.x(z + 0.5) - this.x(z - 0.5), 1); },
};

/** The same bend, for shaders: declare `uniform vec4 uBend; uniform float uBendPh;` first. */
export const GLSL_BEND = /* glsl */`
  float bendX(float z) {
    if (uBend.x == 0.0) return 0.0;
    float s = -z;
    float env = smoothstep(uBend.y + 4.0, uBend.y + 34.0, s) * (1.0 - smoothstep(uBend.z - 32.0, uBend.z, s));
    return uBend.x * env * sin((s - uBend.y) * uBend.w + uBendPh);
  }
`;
