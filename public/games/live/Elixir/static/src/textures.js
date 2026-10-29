// Painted textures for the alcove: stone, wood, parchment, flame and labels.
// All drawn on canvases at load, so there is nothing to download.

import * as THREE from 'three';

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

// Cheap value noise for grain.
function grain(ctx, w, h, amount, scale = 1) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amount * scale;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

function finish(c, { srgb = true, repeat = null } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  t.anisotropy = 8;
  return t;
}

/** Rough-cut stone blocks in courses; returns colour and bump maps. */
export function stone() {
  const W = 1024, H = 1024;
  const col = canvas(W, H), bump = canvas(W, H);
  const c = col.getContext('2d'), b = bump.getContext('2d');
  c.fillStyle = '#2a2420';
  c.fillRect(0, 0, W, H);
  b.fillStyle = '#000';
  b.fillRect(0, 0, W, H);
  const rows = 9;
  const rh = H / rows;
  for (let r = 0; r < rows; r++) {
    let x = -Math.random() * 120;
    while (x < W) {
      const bw = 110 + Math.random() * 150;
      const shade = 34 + Math.random() * 22;
      const warm = Math.random() * 8;
      const pad = 5;
      const g = c.createLinearGradient(0, r * rh, 0, (r + 1) * rh);
      g.addColorStop(0, `rgb(${shade + warm + 8},${shade + 4},${shade - 2})`);
      g.addColorStop(1, `rgb(${shade + warm - 6},${shade - 8},${shade - 12})`);
      c.fillStyle = g;
      roundRect(c, x + pad, r * rh + pad, bw - pad * 2, rh - pad * 2, 14);
      c.fill();
      b.fillStyle = `rgb(${150 + Math.random() * 60},${150},${150})`;
      roundRect(b, x + pad, r * rh + pad, bw - pad * 2, rh - pad * 2, 16);
      b.fill();
      // A few chips and stains per block.
      for (let k = 0; k < 6; k++) {
        c.fillStyle = `rgba(${Math.random() < 0.5 ? '10,8,6' : '90,80,70'},${0.05 + Math.random() * 0.08})`;
        c.beginPath();
        c.ellipse(x + Math.random() * bw, r * rh + Math.random() * rh, 4 + Math.random() * 26, 3 + Math.random() * 12, Math.random() * 3, 0, Math.PI * 2);
        c.fill();
      }
      x += bw;
    }
  }
  grain(c, W, H, 26);
  grain(b, W, H, 60);
  return { map: finish(col, { repeat: [2, 1.4] }), bump: finish(bump, { srgb: false, repeat: [2, 1.4] }) };
}

/** Old oak planks running left to right. */
export function wood(tone = [92, 60, 36]) {
  const W = 1024, H = 512;
  const col = canvas(W, H), bump = canvas(W, H);
  const c = col.getContext('2d'), b = bump.getContext('2d');
  const planks = 4;
  const ph = H / planks;
  for (let p = 0; p < planks; p++) {
    const k = 0.85 + Math.random() * 0.25;
    for (let y = 0; y < ph; y++) {
      const yy = p * ph + y;
      const w1 = Math.sin(y * 0.21 + p * 3) * 0.5 + Math.sin(y * 0.047 + p) * 0.5;
      for (let x = 0; x < W; x += 4) {
        const ring = Math.sin(x * 0.006 + w1 * 2.2 + Math.sin(x * 0.0013 + y * 0.03 + p) * 3);
        const v = k * (0.8 + 0.2 * ring);
        c.fillStyle = `rgb(${tone[0] * v | 0},${tone[1] * v | 0},${tone[2] * v | 0})`;
        c.fillRect(x, yy, 4, 1);
      }
    }
    c.fillStyle = 'rgba(10,6,3,0.75)';
    c.fillRect(0, p * ph, W, 3);
    b.fillStyle = '#888';
    b.fillRect(0, p * ph, W, ph);
    b.fillStyle = '#222';
    b.fillRect(0, p * ph, W, 3);
  }
  grain(c, W, H, 16);
  grain(b, W, H, 40);
  return { map: finish(col, { repeat: [1.4, 1] }), bump: finish(bump, { srgb: false, repeat: [1.4, 1] }) };
}

/** Aged parchment: the background every recipe is written on. */
export function parchment(w, h) {
  const c = canvas(w, h);
  const x = c.getContext('2d');
  const g = x.createRadialGradient(w * 0.5, h * 0.45, h * 0.1, w * 0.5, h * 0.5, h * 0.75);
  g.addColorStop(0, '#f1e3c2');
  g.addColorStop(0.6, '#e6d1a5');
  g.addColorStop(1, '#bf9c66');
  x.fillStyle = g;
  x.fillRect(0, 0, w, h);
  for (let i = 0; i < 26; i++) {
    x.fillStyle = `rgba(${120 + Math.random() * 40},${80 + Math.random() * 30},${40},${0.03 + Math.random() * 0.05})`;
    x.beginPath();
    x.ellipse(Math.random() * w, Math.random() * h, 20 + Math.random() * 120, 10 + Math.random() * 70, Math.random() * 3, 0, Math.PI * 2);
    x.fill();
  }
  // Fibres.
  x.strokeStyle = 'rgba(110,80,40,0.06)';
  x.lineWidth = 1;
  for (let i = 0; i < 400; i++) {
    const px = Math.random() * w, py = Math.random() * h, a = Math.random() * Math.PI;
    x.beginPath();
    x.moveTo(px, py);
    x.lineTo(px + Math.cos(a) * 18, py + Math.sin(a) * 18);
    x.stroke();
  }
  grain(x, w, h, 18);
  // Darkened, slightly burnt edges.
  const e = x.createLinearGradient(0, 0, w, 0);
  e.addColorStop(0, 'rgba(90,50,20,0.35)');
  e.addColorStop(0.06, 'rgba(90,50,20,0)');
  e.addColorStop(0.94, 'rgba(90,50,20,0)');
  e.addColorStop(1, 'rgba(90,50,20,0.35)');
  x.fillStyle = e;
  x.fillRect(0, 0, w, h);
  const f = x.createLinearGradient(0, 0, 0, h);
  f.addColorStop(0, 'rgba(90,50,20,0.3)');
  f.addColorStop(0.05, 'rgba(90,50,20,0)');
  f.addColorStop(0.95, 'rgba(90,50,20,0)');
  f.addColorStop(1, 'rgba(90,50,20,0.38)');
  x.fillStyle = f;
  x.fillRect(0, 0, w, h);
  return c;
}

/** A soft round dot, for dust and sparkles. */
export function dot() {
  const c = canvas(64, 64);
  const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.6)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  return finish(c);
}

/** A soft dark pool, laid under things standing on the bench. */
export function contactShadow() {
  const c = canvas(128, 128);
  const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(0,0,0,0.75)');
  g.addColorStop(0.5, 'rgba(0,0,0,0.35)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  return finish(c);
}

/**
 * A short label in the room's hand: returns a texture and its aspect.
 * @param {string} text
 * @param {object} o font, colour, glow
 */
export function label(text, { font = '600 72px "Cormorant Garamond", Georgia, serif', color = '#f6e7c4', glow = 'rgba(0,0,0,0.65)', pad = 18 } = {}) {
  const m = canvas(8, 8).getContext('2d');
  m.font = font;
  const w = Math.ceil(m.measureText(text).width + pad * 2);
  const size = parseInt(font.match(/(\d+)px/)[1], 10);
  const h = Math.ceil(size * 1.35 + pad * 2);
  const c = canvas(w, h);
  const x = c.getContext('2d');
  x.font = font;
  x.textBaseline = 'middle';
  x.textAlign = 'center';
  x.shadowColor = glow;
  x.shadowBlur = 14;
  x.fillStyle = color;
  x.fillText(text, w / 2, h / 2 + size * 0.04);
  return { texture: finish(c), aspect: w / h };
}

export function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
