// Shared shading: one atmosphere every material fades into, the terrain
// shader, water, and the small geometries trees are built from.

import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

export const ATMOS = {
  uTime: { value: 0 },
  uSunDir: { value: new THREE.Vector3(0.5, 0.5, 0.5).normalize() },
  uSunColor: { value: new THREE.Color(1, 1, 1) },
  uFogColor: { value: new THREE.Color(0.7, 0.8, 0.9) },
  uFogSun: { value: new THREE.Color(1, 0.9, 0.8) },
  uFogDensity: { value: 0.00022 },
  uZenith: { value: new THREE.Color(0.2, 0.4, 0.8) },
  uAmbient: { value: new THREE.Color(0.5, 0.55, 0.6) },
  uNight: { value: 0 },
  uMoon: { value: 0 },
  uPx: { value: 1 },
  uMilky: { value: new THREE.Vector3(0, 0, 1) },
  uMilkyA: { value: new THREE.Vector3(1, 0, 0) },
  uMilkyB: { value: new THREE.Vector3(0, 1, 0) },
  uSea: { value: 10 },
};

export const NOISE_GLSL = /* glsl */ `
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float hash13(vec3 p3) { p3 = fract(p3 * 0.1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm3(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + vec2(17.1, 9.2); a *= 0.5; }
  return s;
}
`;

// Distance haze tinted toward the sun, plus a low mist that pools above the cloud sea.
export const ATMOS_GLSL = /* glsl */ `
uniform vec3 uSunDir;
uniform vec3 uFogColor;
uniform vec3 uFogSun;
uniform float uFogDensity;
uniform float uSea;
vec3 applyAtmos(vec3 col, vec3 wpos) {
  vec3 v = wpos - cameraPosition;
  float d = length(v);
  vec3 dir = v / max(d, 0.001);
  float f = 1.0 - exp(-d * uFogDensity);
  float low = exp(-max(wpos.y - uSea, 0.0) * 0.15);
  f = clamp(f + low * 0.12 * (1.0 - exp(-d * 0.003)), 0.0, 1.0);
  float s = pow(max(dot(dir, uSunDir), 0.0), 6.0);
  return mix(col, mix(uFogColor, uFogSun, s), f);
}
`;

const SHARED = ['uSunDir', 'uFogColor', 'uFogSun', 'uFogDensity', 'uSea', 'uTime', 'uAmbient', 'uSunColor'];

// Teach a built-in material about the atmosphere (and optionally recolour it).
export function patch(mat, o = {}) {
  mat.onBeforeCompile = (sh) => {
    for (const k of SHARED) sh.uniforms[k] = ATMOS[k];
    if (o.uniforms) Object.assign(sh.uniforms, o.uniforms);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vWPos;\n${o.vertHead || ''}`)
      .replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
{
  vec4 wp4 = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
  wp4 = instanceMatrix * wp4;
  #endif
  vWPos = (modelMatrix * wp4).xyz;
}
${o.vertMain || ''}`,
      );
    sh.fragmentShader = sh.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>\nvarying vec3 vWPos;\nuniform float uTime;\nuniform vec3 uAmbient;\nuniform vec3 uSunColor;\n${ATMOS_GLSL}\n${o.fragHead || ''}`,
      )
      .replace('#include <fog_fragment>', 'gl_FragColor.rgb = applyAtmos(gl_FragColor.rgb, vWPos);');
    if (o.fragColor) {
      sh.fragmentShader = sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>\n${o.fragColor}`);
    }
    if (o.fragNormal) {
      sh.fragmentShader = sh.fragmentShader.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>\n${o.fragNormal}`);
    }
    if (o.fragEmissive) {
      sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\n${o.fragEmissive}`);
    }
  };
  mat.customProgramCacheKey = () => o.key || 'atmos';
  return mat;
}

const stdCache = new Map();
export function std(color, o = {}) {
  const key = `${color}|${o.flat ?? true}|${o.rough ?? 0.9}|${o.side ?? 0}|${o.emissive ?? ''}`;
  if (stdCache.has(key)) return stdCache.get(key);
  const m = patch(
    new THREE.MeshStandardMaterial({
      color,
      roughness: o.rough ?? 0.9,
      metalness: 0,
      flatShading: o.flat ?? true,
      side: o.side ?? THREE.FrontSide,
      emissive: o.emissive ?? '#000000',
    }),
  );
  m.userData.shared = true;
  stdCache.set(key, m);
  return m;
}

// Soft-edged cloud: fades where the surface turns away from the eye.
export const cloudMat = patch(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, transparent: true, depthWrite: false }), {
  key: 'cloud',
  fragEmissive: /* glsl */ `
    totalEmissiveRadiance += uSunColor * 0.22 + uAmbient * 0.5;
    diffuseColor.a *= smoothstep(0.05, 0.55, abs(dot(normalize(normal), normalize(vViewPosition))));`,
});
cloudMat.userData.shared = true;

// Windows that light up as the day goes.
export const glowMat = patch(new THREE.MeshStandardMaterial({ color: '#23242b', emissive: '#ffa64d', emissiveIntensity: 0, roughness: 0.4 }));
glowMat.userData.shared = true;

// ---------------------------------------------------------------------------

const TERRAIN_GLSL = /* glsl */ `
{
  vec3 Nw = normalize(vWNormal);
  float h = vWPos.y;
  float slope = 1.0 - clamp(Nw.y, 0.0, 1.0);
  vec2 p = vWPos.xz;
  float n1 = fbm3(p * 0.03) - 0.47;
  float n2 = vnoise(p * 0.21) - 0.5;
  vec3 an = abs(Nw) + 0.001;
  float n3 = (vnoise(vWPos.xz * 1.15) * an.y + vnoise(vWPos.xy * 1.15) * an.z + vnoise(vWPos.zy * 1.15) * an.x) / (an.x + an.y + an.z) - 0.5;
  float cav = vAux.w;
  float flow = vAux2.x;
  float forest = vAux2.y;

  vec3 grass = mix(uGrassA, uGrassB, smoothstep(-0.25, 0.25, n1 + n2 * 0.4));
  grass = mix(grass, uGrassDry, smoothstep(0.55, 1.05, h / uTreeline + n2 * 0.3) * 0.75);
  grass = mix(grass, uGrassWet, clamp(flow * 1.1 + cav * 0.5, 0.0, 1.0) * 0.6);
  float bloom = vAux2.z;
  if (bloom > 0.01) {
    vec2 fc = floor(p * 2.4);
    float fh = hash12(fc);
    vec3 petal = fh < 0.34 ? vec3(0.62, 0.36, 0.86) : fh < 0.67 ? vec3(0.98, 0.84, 0.25) : vec3(0.95, 0.42, 0.62);
    float speck = smoothstep(0.42, 0.1, length(fract(p * 2.4) - 0.5)) * step(0.35, hash12(fc + 7.1));
    grass = mix(grass, petal, bloom * (0.35 + 0.6 * speck));
  }
  grass *= 1.0 - forest * 0.4;
  grass *= 0.93 + n3 * 0.16;

  float strata = sin((h + n1 * 9.0 + n3 * 1.2) * uStrataFreq) * 0.5 + 0.5;
  vec3 rock = mix(uRockA, uRockB, clamp(strata * uStrata + (n2 + 0.5) * (1.0 - uStrata) * 0.8 + n3 * 0.35, 0.0, 1.0));
  rock = mix(rock, uRockDark, clamp(cav * 1.6 + n3 * 0.3, 0.0, 1.0) * 0.55);
  rock *= 0.88 + n3 * 0.32;
  rock *= 1.0 + clamp(-cav * 1.4, 0.0, 1.0) * 0.16;

  float alpine = smoothstep(uTreeline + 6.0, uTreeline + 26.0, h + n1 * 18.0);
  float steep = smoothstep(uRockSlope - 0.07, uRockSlope + 0.05, slope + n2 * 0.1);
  float rockAmt = max(steep, alpine * smoothstep(uRockSlope * 0.3, uRockSlope * 0.8, slope + n2 * 0.15 + 0.08));
  vec3 col = mix(grass, rock, rockAmt);

  float scar = vAux.y * smoothstep(0.1, 0.45, vAux.y + n2 * 0.3);
  col = mix(col, uScar * (0.88 + n3 * 0.3), scar);

  float sl = uSnowline + n1 * 16.0 + n2 * 4.0 - cav * 14.0;
  float snow = smoothstep(sl - 2.5, sl + 2.5, h);
  snow *= 1.0 - smoothstep(uSnowSlope - 0.06, uSnowSlope + 0.03, slope - cav * 0.12 + n3 * 0.05);
  float drift = vAux.z * (1.0 - smoothstep(0.5, 0.66, slope));
  snow = max(snow, smoothstep(0.25, 0.55, drift + n2 * 0.35));
  col = mix(col, uSnow * (0.94 + n3 * 0.08), snow);

  float g = vAux.x;
  if (g > 0.001) {
    vec2 down = normalize(Nw.xz + vec2(0.0001));
    float along = dot(p, down);
    float crev = smoothstep(0.62, 0.95, sin(along * 1.7 + n2 * 6.0) * 0.5 + 0.5) * smoothstep(0.12, 0.35, slope);
    vec3 ice = mix(uIce, uIceDeep, crev * 0.85 + n3 * 0.15);
    float gm = smoothstep(0.15, 0.5, g + n2 * 0.25);
    col = mix(col, ice, gm);
    col = mix(col, uRockDark * 1.3, gm * (1.0 - gm) * 1.2);
  }
  diffuseColor.rgb = col;
}
`;

export function terrainMaterial(biome, snowline, treeline) {
  const c = (hex) => ({ value: new THREE.Color(hex) });
  const uniforms = {
    uGrassA: c(biome.grassA), uGrassB: c(biome.grassB), uGrassDry: c(biome.grassDry), uGrassWet: c(biome.grassWet),
    uRockA: c(biome.rockA), uRockB: c(biome.rockB), uRockDark: c(biome.rockDark),
    uSnow: c(biome.snow), uIce: c(biome.ice), uIceDeep: c(biome.iceDeep), uScar: c(biome.scar),
    uSnowline: { value: snowline }, uTreeline: { value: treeline },
    uRockSlope: { value: biome.rockSlope }, uSnowSlope: { value: biome.snowSlope },
    uStrata: { value: biome.strata }, uStrataFreq: { value: biome.strataFreq },
  };
  const decl = Object.keys(uniforms)
    .map((k) => `uniform ${uniforms[k].value.isColor ? 'vec3' : 'float'} ${k};`)
    .join('\n');
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.94, metalness: 0 });
  patch(mat, {
    key: 'terrain',
    uniforms,
    vertHead: 'attribute vec4 aux;\nattribute vec4 aux2;\nvarying vec4 vAux;\nvarying vec4 vAux2;\nvarying vec3 vWNormal;',
    vertMain: 'vAux = aux; vAux2 = aux2; vWNormal = normalize(mat3(modelMatrix) * objectNormal);',
    fragHead: `varying vec4 vAux;\nvarying vec4 vAux2;\nvarying vec3 vWNormal;\n${decl}\n${NOISE_GLSL}`,
    fragColor: TERRAIN_GLSL,
  });
  return mat;
}

export function waterMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: ATMOS.uTime, uSunDir: ATMOS.uSunDir, uSunColor: ATMOS.uSunColor, uFogColor: ATMOS.uFogColor,
      uFogSun: ATMOS.uFogSun, uFogDensity: ATMOS.uFogDensity, uSea: ATMOS.uSea, uZenith: ATMOS.uZenith,
    },
    vertexShader: /* glsl */ `
      varying vec3 vWPos;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vWPos = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform vec3 uSunColor; uniform vec3 uZenith; varying vec3 vWPos;
      ${ATMOS_GLSL}
      ${NOISE_GLSL}
      void main() {
        vec3 V = normalize(vWPos - cameraPosition);
        vec2 p = vWPos.xz * 0.7;
        float t = uTime * 0.5;
        float a = vnoise(p + vec2(t, 0.3 * t)), b = vnoise(p * 1.7 - vec2(0.2 * t, t));
        vec3 N = normalize(vec3((a - 0.5) * 0.16, 1.0, (b - 0.5) * 0.16));
        vec3 R = reflect(V, N);
        float fres = 0.04 + 0.96 * pow(clamp(1.0 - dot(-V, N), 0.0, 1.0), 5.0);
        vec3 sky = mix(uFogColor, uZenith, clamp(R.y * 1.4, 0.0, 1.0));
        vec3 col = mix(vec3(0.012, 0.05, 0.06), sky * 0.95, fres);
        col += uSunColor * pow(max(dot(R, uSunDir), 0.0), 160.0) * 1.6;
        gl_FragColor = vec4(applyAtmos(col, vWPos), 1.0);
      }`,
  });
}

export function waterfallMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: ATMOS.uTime, uSunDir: ATMOS.uSunDir, uSunColor: ATMOS.uSunColor, uAmbient: ATMOS.uAmbient,
      uFogColor: ATMOS.uFogColor, uFogSun: ATMOS.uFogSun, uFogDensity: ATMOS.uFogDensity, uSea: ATMOS.uSea,
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vWPos;
      void main() { vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vWPos = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform vec3 uSunColor; uniform vec3 uAmbient; varying vec2 vUv; varying vec3 vWPos;
      ${ATMOS_GLSL}
      ${NOISE_GLSL}
      void main() {
        float edge = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
        float s = vnoise(vec2(vUv.x * 7.0, vUv.y * 0.9 - uTime * 2.4));
        float s2 = vnoise(vec2(vUv.x * 13.0 + 3.0, vUv.y * 1.7 - uTime * 3.3));
        float a = edge * clamp(0.5 + s * 0.6 + s2 * 0.3, 0.0, 1.0);
        vec3 col = mix(vec3(0.6, 0.74, 0.78), vec3(1.0), s * 0.7 + s2 * 0.3);
        col *= uAmbient * 0.95 + uSunColor * 0.4;
        gl_FragColor = vec4(applyAtmos(col, vWPos), a);
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

// ---------------------------------------------------------------------------

function tint(geo, hex) {
  geo = geo.index ? geo.toNonIndexed() : geo;
  geo.deleteAttribute('uv');
  const c = new THREE.Color(hex);
  const n = geo.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return geo;
}

export function pineGeometry() {
  return mergeGeometries([
    tint(new THREE.CylinderGeometry(0.13, 0.18, 0.9, 5).translate(0, 0.45, 0), '#6b5040'),
    tint(new THREE.ConeGeometry(0.95, 1.7, 7).translate(0, 1.35, 0), '#ffffff'),
    tint(new THREE.ConeGeometry(0.72, 1.45, 7).translate(0, 2.1, 0), '#ffffff'),
    tint(new THREE.ConeGeometry(0.46, 1.15, 7).translate(0, 2.75, 0), '#ffffff'),
  ]);
}

export function juniperGeometry() {
  return mergeGeometries([
    tint(new THREE.CylinderGeometry(0.12, 0.16, 0.7, 5).translate(0, 0.35, 0), '#6b5040'),
    tint(new THREE.IcosahedronGeometry(0.85, 0).scale(1.1, 0.9, 1).translate(0, 1.15, 0), '#ffffff'),
    tint(new THREE.IcosahedronGeometry(0.55, 0).translate(0.45, 1.55, 0.2), '#ffffff'),
  ]);
}

export const treeMaterial = patch(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true }), {
  key: 'tree',
  fragEmissive: 'totalEmissiveRadiance += diffuseColor.rgb * uAmbient * 0.45;',
});
treeMaterial.userData.shared = true;

export function rockGeometry(rng, r, detail = 1) {
  let g = new THREE.IcosahedronGeometry(r, detail);
  g.deleteAttribute('normal');
  g.deleteAttribute('uv');
  g = mergeVertices(g);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const s = 1 + (rng.next() - 0.5) * 0.35;
    p.setXYZ(i, p.getX(i) * s, p.getY(i) * s * 0.8, p.getZ(i) * s);
  }
  g.computeVertexNormals();
  return g;
}

let puff = null;
export function puffTexture() {
  if (puff) return puff;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  puff = new THREE.CanvasTexture(c);
  puff.colorSpace = THREE.SRGBColorSpace;
  return puff;
}

export function disposeTree(obj) {
  obj.traverse((o) => {
    if (o.geometry && !o.userData.keepGeometry) o.geometry.dispose();
    if (o.isInstancedMesh) o.dispose();
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of mats) if (!m.userData.shared) m.dispose();
  });
}
