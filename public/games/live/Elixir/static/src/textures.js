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
export function label(text, { font = '600 72px "Cormorant Garamond", Georgia, serif', color = '#f6e7c4', glow = 'rgba(0,0,0,0.65)', pad = 18, plate = null } = {}) {
  const m = canvas(8, 8).getContext('2d');
  m.font = font;
  const w = Math.ceil(m.measureText(text).width + pad * 2);
  const size = parseInt(font.match(/(\d+)px/)[1], 10);
  const h = Math.ceil(size * 1.35 + pad * 2);
  const c = canvas(w, h);
  const x = c.getContext('2d');
  if (plate) {
    // A dark plate behind the text, for labels over a bright room.
    x.fillStyle = plate;
    roundRect(x, 4, 6, w - 8, h - 12, (h - 12) / 2);
    x.fill();
  }
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

// ---------------------------------------------------------------------------
// The other workshops' surfaces.

function noiseField(w, h, scale, seed = Math.random() * 1000) {
  // A few octaves of smooth value noise, 0..1, as a Float32Array.
  const out = new Float32Array(w * h);
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7 + seed) * 43758.5453; return s - Math.floor(s); };
  const vnoise = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0, amp = 0.5, f = scale;
      for (let o = 0; o < 4; o++) { v += amp * vnoise(x * f, y * f); amp *= 0.5; f *= 2.03; }
      out[y * w + x] = v;
    }
  }
  return out;
}

/** Cave rock: dark, cool, cracked. */
export function rock(tint = [46, 50, 66]) {
  const W = 512, H = 512;
  const col = canvas(W, H), bump = canvas(W, H);
  const c = col.getContext('2d'), b = bump.getContext('2d');
  const n = noiseField(W, H, 0.012);
  const ci = c.createImageData(W, H), bi = b.createImageData(W, H);
  for (let i = 0; i < W * H; i++) {
    const v = n[i];
    const k = 0.55 + v * 0.9;
    ci.data[i * 4] = tint[0] * k; ci.data[i * 4 + 1] = tint[1] * k; ci.data[i * 4 + 2] = tint[2] * k; ci.data[i * 4 + 3] = 255;
    const g = 255 * Math.min(1, Math.max(0, (v - 0.25) * 1.6));
    bi.data[i * 4] = bi.data[i * 4 + 1] = bi.data[i * 4 + 2] = g; bi.data[i * 4 + 3] = 255;
  }
  c.putImageData(ci, 0, 0);
  b.putImageData(bi, 0, 0);
  c.strokeStyle = 'rgba(8,8,14,0.5)';
  for (let i = 0; i < 26; i++) {
    c.lineWidth = 1 + Math.random() * 2;
    c.beginPath();
    let x = Math.random() * W, y = Math.random() * H;
    c.moveTo(x, y);
    for (let k = 0; k < 6; k++) { x += (Math.random() - 0.5) * 60; y += Math.random() * 40; c.lineTo(x, y); }
    c.stroke();
  }
  grain(c, W, H, 18);
  return { map: finish(col, { repeat: [3, 2] }), bump: finish(bump, { srgb: false, repeat: [3, 2] }) };
}

/** Upright pine boards for the cottage. */
export function planks(tone = [120, 78, 46]) {
  const W = 1024, H = 512;
  const col = canvas(W, H), bump = canvas(W, H);
  const c = col.getContext('2d'), b = bump.getContext('2d');
  const boards = 8;
  const bw = W / boards;
  b.fillStyle = '#999';
  b.fillRect(0, 0, W, H);
  for (let k = 0; k < boards; k++) {
    const m = 0.8 + Math.random() * 0.3;
    for (let x = 0; x < bw; x += 2) {
      for (let y = 0; y < H; y += 4) {
        const ring = Math.sin(y * 0.02 + Math.sin(x * 0.09 + k * 5) * 2.5 + k * 3);
        const v = m * (0.82 + 0.18 * ring);
        c.fillStyle = `rgb(${tone[0] * v | 0},${tone[1] * v | 0},${tone[2] * v | 0})`;
        c.fillRect(k * bw + x, y, 2, 4);
      }
    }
    c.fillStyle = 'rgba(20,10,4,0.8)';
    c.fillRect(k * bw, 0, 4, H);
    b.fillStyle = '#222';
    b.fillRect(k * bw, 0, 4, H);
    // A knot or two.
    for (let j = 0; j < 2; j++) {
      c.fillStyle = 'rgba(50,25,10,0.5)';
      c.beginPath();
      c.ellipse(k * bw + 20 + Math.random() * (bw - 40), Math.random() * H, 6 + Math.random() * 6, 10 + Math.random() * 8, 0, 0, Math.PI * 2);
      c.fill();
    }
  }
  grain(c, W, H, 14);
  grain(b, W, H, 30);
  return { map: finish(col, { repeat: [2, 1] }), bump: finish(bump, { srgb: false, repeat: [2, 1] }) };
}

/** Striped tent canvas with a stitched border motif. */
export function fabric() {
  const W = 1024, H = 1024;
  const c = canvas(W, H);
  const x = c.getContext('2d');
  const bands = ['#7a1f1c', '#9a3a1a', '#c27a2a', '#7a1f1c', '#2a2350', '#7a1f1c', '#b0602a', '#5a1414'];
  let px = 0;
  let i = 0;
  while (px < W) {
    const w = 40 + (i % 3) * 36;
    x.fillStyle = bands[i % bands.length];
    x.fillRect(px, 0, w, H);
    if (w > 80) {
      // A row of small diamonds down the wide bands.
      x.fillStyle = 'rgba(240,200,120,0.55)';
      for (let y = 20; y < H; y += 48) {
        x.beginPath();
        x.moveTo(px + w / 2, y); x.lineTo(px + w / 2 + 9, y + 12); x.lineTo(px + w / 2, y + 24); x.lineTo(px + w / 2 - 9, y + 12);
        x.closePath();
        x.fill();
      }
    }
    px += w;
    i++;
  }
  grain(x, W, H, 22);
  // Weave.
  x.fillStyle = 'rgba(0,0,0,0.06)';
  for (let y = 0; y < H; y += 3) x.fillRect(0, y, W, 1);
  return finish(c, { repeat: [2, 1] });
}

/** A kilim rug for the caravan's table. */
export function rug() {
  const W = 1024, H = 512;
  const c = canvas(W, H);
  const x = c.getContext('2d');
  x.fillStyle = '#7d1d1a';
  x.fillRect(0, 0, W, H);
  x.fillStyle = '#1f2a55';
  x.fillRect(24, 24, W - 48, H - 48);
  x.fillStyle = '#9a2a20';
  x.fillRect(48, 48, W - 96, H - 96);
  const colors = ['#e0a040', '#f0e0c0', '#1f2a55', '#2e6a50'];
  for (let k = 0; k < 7; k++) {
    const cx = 120 + k * 130, cy = H / 2;
    for (let s = 4; s > 0; s--) {
      x.fillStyle = colors[(s + k) % colors.length];
      x.beginPath();
      x.moveTo(cx, cy - s * 34); x.lineTo(cx + s * 26, cy); x.lineTo(cx, cy + s * 34); x.lineTo(cx - s * 26, cy);
      x.closePath();
      x.fill();
    }
  }
  x.fillStyle = '#e0a040';
  for (let px = 30; px < W - 30; px += 22) { x.fillRect(px, 30, 10, 10); x.fillRect(px, H - 40, 10, 10); }
  grain(x, W, H, 26);
  return finish(c, { repeat: [1, 1] });
}

/** A school slate: dark, smudged with old chalk. */
export function slate(w, h, tint = 'slate') {
  const c = canvas(w, h);
  const x = c.getContext('2d');
  const base = tint === 'stone' ? ['#2c3038', '#1c1f26'] : ['#26302c', '#151b19'];
  const g = x.createRadialGradient(w * 0.5, h * 0.42, h * 0.1, w * 0.5, h * 0.5, h * 0.8);
  g.addColorStop(0, base[0]);
  g.addColorStop(1, base[1]);
  x.fillStyle = g;
  x.fillRect(0, 0, w, h);
  // Ghosts of old sums wiped away.
  x.strokeStyle = 'rgba(230,235,230,0.05)';
  x.lineWidth = 26;
  x.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    x.beginPath();
    const y = Math.random() * h;
    x.moveTo(Math.random() * w * 0.3, y);
    x.bezierCurveTo(w * 0.4, y + (Math.random() - 0.5) * 120, w * 0.6, y + (Math.random() - 0.5) * 120, w * (0.7 + Math.random() * 0.3), y + (Math.random() - 0.5) * 60);
    x.stroke();
  }
  grain(x, w, h, 16);
  return c;
}

/** Heavy cream card with a pressed-plant border: ferns, or holly for winter. */
export function botanical(w, h, motif = 'fern') {
  const c = canvas(w, h);
  const x = c.getContext('2d');
  x.fillStyle = motif === 'holly' ? '#f4ece0' : '#f1efe0';
  x.fillRect(0, 0, w, h);
  grain(x, w, h, 10);
  const ink = motif === 'holly' ? 'rgba(130,30,30,0.85)' : 'rgba(60,100,50,0.8)';
  x.strokeStyle = ink;
  x.lineWidth = 4;
  x.strokeRect(28, 28, w - 56, h - 56);
  x.lineWidth = 1.5;
  x.strokeRect(40, 40, w - 80, h - 80);
  const sprig = (cx, cy, ang, len) => {
    x.save();
    x.translate(cx, cy);
    x.rotate(ang);
    x.strokeStyle = motif === 'holly' ? 'rgba(40,90,50,0.8)' : 'rgba(70,110,55,0.75)';
    x.lineWidth = 3;
    x.beginPath(); x.moveTo(0, 0); x.lineTo(len, 0); x.stroke();
    for (let t = 0.12; t < 1; t += motif === 'holly' ? 0.3 : 0.1) {
      for (const side of [-1, 1]) {
        x.fillStyle = motif === 'holly' ? 'rgba(45,100,55,0.85)' : 'rgba(85,135,65,0.7)';
        x.beginPath();
        const lx = len * t, ll = (motif === 'holly' ? 34 : 30) * (1 - t * 0.6);
        x.ellipse(lx + ll * 0.3, side * ll * 0.5, ll * 0.6, ll * (motif === 'holly' ? 0.32 : 0.18), side * 0.7, 0, Math.PI * 2);
        x.fill();
      }
    }
    if (motif === 'holly') {
      x.fillStyle = 'rgba(190,30,35,0.95)';
      for (const [bx, by] of [[len * 0.95, -6], [len * 0.98, 8], [len * 0.88, 2]]) { x.beginPath(); x.arc(bx, by, 8, 0, Math.PI * 2); x.fill(); }
    }
    x.restore();
  };
  sprig(58, h - 58, -0.75, 210);
  sprig(w - 58, h - 58, -2.39, 210);
  sprig(58, 58, 0.75, 150);
  sprig(w - 58, 58, 2.39, 150);
  return c;
}

/** A scroll: parchment with rolled, shadowed ends top and bottom. */
export function scroll(w, h) {
  const c = parchment(w, h);
  const x = c.getContext('2d');
  for (const [y0, dir] of [[0, 1], [h, -1]]) {
    const g = x.createLinearGradient(0, y0, 0, y0 + dir * 70);
    g.addColorStop(0, 'rgba(90,55,25,0.55)');
    g.addColorStop(0.5, 'rgba(90,55,25,0.12)');
    g.addColorStop(1, 'rgba(90,55,25,0)');
    x.fillStyle = g;
    x.fillRect(0, Math.min(y0, y0 + dir * 70), w, 70);
  }
  // A woven border.
  x.strokeStyle = 'rgba(140,40,30,0.55)';
  x.lineWidth = 5;
  x.setLineDash([18, 10]);
  x.strokeRect(36, 80, w - 72, h - 160);
  x.setLineDash([]);
  return c;
}

/** A circular star chart for the observatory wall. */
export function starChart() {
  const S = 512;
  const c = canvas(S, S);
  const x = c.getContext('2d');
  x.fillStyle = '#0e1430';
  x.beginPath(); x.arc(S / 2, S / 2, S / 2 - 4, 0, Math.PI * 2); x.fill();
  x.strokeStyle = 'rgba(210,190,130,0.7)';
  x.lineWidth = 3;
  x.beginPath(); x.arc(S / 2, S / 2, S / 2 - 10, 0, Math.PI * 2); x.stroke();
  x.lineWidth = 1;
  for (let r = 60; r < S / 2 - 10; r += 50) { x.beginPath(); x.arc(S / 2, S / 2, r, 0, Math.PI * 2); x.stroke(); }
  for (let a = 0; a < 12; a++) { x.beginPath(); x.moveTo(S / 2, S / 2); x.lineTo(S / 2 + Math.cos(a * Math.PI / 6) * (S / 2 - 10), S / 2 + Math.sin(a * Math.PI / 6) * (S / 2 - 10)); x.stroke(); }
  const stars = Array.from({ length: 60 }, () => [S / 2 + (Math.random() - 0.5) * S * 0.8, S / 2 + (Math.random() - 0.5) * S * 0.8]);
  x.strokeStyle = 'rgba(240,220,160,0.6)';
  for (let k = 0; k < 8; k++) {
    x.beginPath();
    const a = stars[k * 5];
    x.moveTo(a[0], a[1]);
    for (let j = 1; j < 4; j++) x.lineTo(stars[k * 5 + j][0], stars[k * 5 + j][1]);
    x.stroke();
  }
  x.fillStyle = '#f6ecc8';
  for (const [sx, sy] of stars) { x.beginPath(); x.arc(sx, sy, 1.5 + Math.random() * 2.5, 0, Math.PI * 2); x.fill(); }
  return finish(c);
}

/** Pierced brass: bright holes in a dark field, for a lantern's emissive map. */
export function piercedBrass() {
  const W = 256, H = 256;
  const c = canvas(W, H);
  const x = c.getContext('2d');
  x.fillStyle = '#000';
  x.fillRect(0, 0, W, H);
  x.fillStyle = '#ffd890';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cx = col * 32 + (row % 2 ? 16 : 0) + 8, cy = row * 32 + 16;
      x.beginPath();
      for (let k = 0; k < 8; k++) {
        const r = k % 2 ? 3 : 7;
        const a = (k * Math.PI) / 4;
        x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      x.closePath();
      x.fill();
    }
  }
  return finish(c, { repeat: [2, 1] });
}

/** A soft leaf, for hanging and potted plants. */
export function leaf() {
  const c = canvas(128, 256);
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 128, 0);
  g.addColorStop(0, '#2f6a2a');
  g.addColorStop(0.5, '#5fa848');
  g.addColorStop(1, '#2f6a2a');
  x.fillStyle = g;
  x.beginPath();
  x.moveTo(64, 250);
  x.bezierCurveTo(0, 180, 6, 60, 64, 6);
  x.bezierCurveTo(122, 60, 128, 180, 64, 250);
  x.fill();
  x.strokeStyle = 'rgba(200,240,170,0.5)';
  x.lineWidth = 3;
  x.beginPath(); x.moveTo(64, 250); x.lineTo(64, 12); x.stroke();
  return finish(c);
}
