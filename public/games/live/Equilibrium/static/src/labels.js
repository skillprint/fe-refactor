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

/** The small distance marks above a beam: 1, 2, 3… */
export function tick(text) {
  const key = `t:${text}`;
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#6d675d';
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

/** Faint plaster grain for the gallery wall. */
export function plaster() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const img = g.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 238 + Math.random() * 17;
    img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = texture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(10, 10);
  return t;
}
