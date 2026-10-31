// Text drawn into canvases and handed to three.js as textures, so every
// number the player reasons about is part of the rendered frame.

import * as THREE from 'three';

export const FONT = '"Outfit", "Avenir Next", "Segoe UI", system-ui, sans-serif';
export const SERIF = '"Fraunces", "Iowan Old Style", Georgia, serif';

const cache = new Map();

function texture(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

/** A weight's number, painted to fill a 2:1 canvas; shared between weights. */
export function numeral(text, color) {
  const key = `n:${text}:${color}`;
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = color;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 124px ${FONT}`;
  // Two digits get squeezed a little so "15" fits a small disc.
  const w = g.measureText(text).width;
  const squeeze = Math.min(1, 200 / w);
  g.setTransform(squeeze, 0, 0, 1, 128 * (1 - squeeze), 0);
  g.fillText(text, 128, 72);
  const t = texture(c);
  cache.set(key, t);
  return t;
}

/** The small distance marks above a beam: 1, 2, 3…, in a colour that reads on the wall. */
export function tick(text, color = '#6d675d') {
  const key = `t:${text}:${color}`;
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = color;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `500 50px ${FONT}`;
  g.fillText(text, 32, 36);
  const t = texture(c);
  cache.set(key, t);
  return t;
}

/** A rounded pill with a short reading on it ("Σ 12", "18"). Returns the texture and its aspect. */
export function pill(text, { fg = '#1d1b18', bg = 'rgba(250, 247, 240, 0.92)', border = 'rgba(29, 27, 24, 0.22)' } = {}) {
  const key = `p:${text}:${fg}:${bg}:${border}`;
  if (cache.has(key)) return cache.get(key);
  const h = 96;
  const probe = document.createElement('canvas').getContext('2d');
  probe.font = `600 58px ${FONT}`;
  const w = Math.ceil(probe.measureText(text).width + 64);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  const r = h / 2 - 4;
  g.beginPath();
  g.roundRect(3, 3, w - 6, h - 6, r);
  g.fillStyle = bg;
  g.fill();
  g.lineWidth = 3;
  g.strokeStyle = border;
  g.stroke();
  g.fillStyle = fg;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `600 58px ${FONT}`;
  g.fillText(text, w / 2, h / 2 + 3);
  const out = { map: texture(c), aspect: w / h };
  cache.set(key, out);
  return out;
}

/** The museum label beside the mobile. Redrawn per mobile, so not cached. */
export function placard(lines) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 232;
  // Drawn at the label's size on the plinth, 1.35 × 0.61.
  const g = c.getContext('2d');
  g.fillStyle = '#fbf9f4';
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#1d1b18';
  g.textBaseline = 'alphabetic';
  g.font = `italic 400 52px ${SERIF}`;
  g.fillText(lines[0], 34, 76);
  g.font = `400 26px ${FONT}`;
  g.fillStyle = '#4a463f';
  g.fillText(lines[1], 36, 124);
  g.fillText(lines[2], 36, 160);
  g.fillStyle = '#8b857a';
  g.font = `500 21px ${FONT}`;
  g.fillText(lines[3].toUpperCase(), 36, 204);
  return texture(c);
}

/**
 * The wall's surface, as a light texture the wall colour multiplies:
 * plaster (fine grain), limewash (soft clouds and brush strokes), concrete
 * (mottling and pores), paper (fibres), starry (paper, for a night sky that
 * starlight() then sprinkles with stars). Each kind is drawn once.
 */
export function grain(kind) {
  const key = `g:${kind}`;
  if (cache.has(key)) return cache.get(key);
  const N = 512;
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const g = c.getContext('2d');
  const img = g.createImageData(N, N);
  const d = img.data;
  const rnd = mulberry(kind.length * 7919 + kind.charCodeAt(0));
  // Every term repeats a whole number of times across the tile, so it wraps.
  const cloud = valueNoise(rnd, 6, 6), fine = valueNoise(rnd, 64, 64);
  const along = valueNoise(rnd, 12, 160), across = valueNoise(rnd, 160, 12);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const u = x / N, v = y / N;
      let l;
      if (kind === 'limewash') {
        const stroke = Math.sin((u * 3 + v + cloud(u, v) * 0.8) * Math.PI * 2) * 0.5 + 0.5;
        l = 0.9 + 0.055 * cloud(u, v) + 0.03 * stroke + 0.02 * (rnd() - 0.5);
      } else if (kind === 'concrete') {
        l = 0.87 + 0.06 * cloud(u, v) + 0.05 * fine(u, v) + 0.03 * (rnd() - 0.5);
        if (rnd() < 0.003) l -= 0.1 * rnd();
      } else if (kind === 'paper' || kind === 'starry') {
        l = 0.9 + 0.03 * along(u, v) + 0.02 * across(u, v) + 0.035 * cloud(u, v) + 0.025 * (rnd() - 0.5);
      } else {
        l = 0.93 + 0.065 * rnd();
      }
      const i = (y * N + x) * 4;
      d[i] = d[i + 1] = d[i + 2] = Math.max(0, Math.min(255, l * 255));
      d[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const t = texture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(40, 24);
  cache.set(key, t);
  return t;
}

/**
 * Pinpricks of light for a night-sky wall, used as its glow: black, with a
 * few hundred stars and a handful bright enough to glint. Tiles like grain().
 */
export function starlight() {
  if (cache.has('stars')) return cache.get('stars');
  const N = 512;
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const g = c.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, N, N);
  const rnd = mulberry(4242);
  for (let i = 0; i < 260; i++) {
    const b = rnd();
    g.fillStyle = `rgba(255, 250, 235, ${0.25 + 0.75 * b * b})`;
    g.beginPath();
    g.arc(rnd() * N, rnd() * N, b > 0.97 ? 2.2 : 0.8 + b * 0.7, 0, Math.PI * 2);
    g.fill();
  }
  // No mipmaps: averaged down, a pinprick turns into a grey square.
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.generateMipmaps = false;
  t.minFilter = THREE.LinearFilter;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(24, 14);
  cache.set('stars', t);
  return t;
}

function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Smooth noise on a wrapping `nx`×`ny` lattice over the unit square, so it tiles.
function valueNoise(rnd, nx, ny) {
  const grid = Array.from({ length: nx * ny }, () => rnd());
  const at = (i, j) => grid[((j % ny + ny) % ny) * nx + ((i % nx + nx) % nx)];
  const fade = (t) => t * t * (3 - 2 * t);
  return (u, v) => {
    const x = u * nx, y = v * ny;
    const i = Math.floor(x), j = Math.floor(y);
    const fx = fade(x - i), fy = fade(y - j);
    const a = at(i, j) + (at(i + 1, j) - at(i, j)) * fx;
    const b = at(i, j + 1) + (at(i + 1, j + 1) - at(i, j + 1)) * fx;
    return a + (b - a) * fy;
  };
}
