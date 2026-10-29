// The recipe card: parchment, a potion's name, its lines in ink with real
// stacked fractions, the line being poured marked, and the grades once served.

import * as THREE from 'three';
import { parchment, roundRect } from './textures.js';
import { LIQUIDS } from './look.js';

const W = 1024, H = 1300;
const SERIF = '"Cormorant Garamond", "Iowan Old Style", Georgia, serif';
const INK = '#3b2614';
const INK_SOFT = '#6b4a2a';
const GRADE_INK = { Perfect: '#9a6a12', Fine: '#2d7a4c', Fair: '#a85e1c', Spoiled: '#a3322a' };

export class Card {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = W;
    this.canvas.height = H;
    this.paper = parchment(W, H);
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 8;
  }

  /**
   * @param {object} o
   * @param {object} o.recipe from makeRecipe
   * @param {number} o.number the potion's number this session
   * @param {number} o.current the layer being poured (-1 before brewing)
   * @param {Array<{grade: string, errorPct: number|null}>|null} o.results once served
   */
  draw({ recipe, number, current, results }) {
    const x = this.canvas.getContext('2d');
    x.drawImage(this.paper, 0, 0);
    const M = 66;
    let y = 92;

    x.textAlign = 'center';
    x.textBaseline = 'alphabetic';
    x.fillStyle = INK_SOFT;
    x.font = `600 32px ${SERIF}`;
    spaced(x, `RECIPE  No. ${number}`, W / 2, y, 6);
    y += 80;
    x.fillStyle = INK;
    x.font = `italic 600 72px ${SERIF}`;
    for (const line of wrapWords(x, recipe.title, W - M * 2)) {
      x.fillText(line, W / 2, y);
      y += 76;
    }
    y += 2;
    ornament(x, W / 2, y - 26, 300);
    y += 34;

    x.textAlign = 'left';
    if (recipe.intro.length) {
      x.fillStyle = INK_SOFT;
      for (const line of recipe.intro) {
        y = flow(x, line.parts, M, y, W - M * 2, 52, { italic: true, color: INK_SOFT });
        y += 10;
      }
      y += 16;
    }

    recipe.layers.forEach((L, i) => {
      const done = results || i < current;
      const active = !results && i === current;
      const top = y - 58;
      const tokens = [{ word: L.name, bold: true }, ' — ', ...L.measure.parts];
      // Measure first, to size the highlight behind the line being poured.
      const end = flow(x, tokens, M + 64, y, W - M * 2 - 64, 60, { dry: true });
      if (active) {
        x.fillStyle = 'rgba(255, 196, 110, 0.32)';
        roundRect(x, M - 14, top - 6, W - M * 2 + 28, end - top - 18, 18);
        x.fill();
      }
      x.globalAlpha = done && !results ? 0.55 : 1;
      drop(x, M + 24, y - 20, 21, LIQUIDS[L.ingredient].css);
      y = flow(x, tokens, M + 64, y, W - M * 2 - 64, 60, { color: INK });
      x.globalAlpha = 1;
      if (done && !results) {
        x.fillStyle = '#2d7a4c';
        x.font = `700 48px ${SERIF}`;
        x.fillText('✓', W - M - 20, top + 56);
      }
      if (results && results[i]) {
        const r = results[i];
        x.font = `italic 700 46px ${SERIF}`;
        x.fillStyle = GRADE_INK[r.grade];
        x.textAlign = 'right';
        const err = r.errorPct == null ? 'not poured' : `${r.errorPct >= 0 ? '+' : '−'}${Math.abs(r.errorPct).toFixed(1)} %`;
        x.fillText(`${r.grade} · ${err}`, W - M, y - 8);
        x.textAlign = 'left';
        y += 50;
      }
      y += 22;
    });

    // A flourish to close the page.
    x.textAlign = 'center';
    x.fillStyle = 'rgba(80, 52, 26, 0.55)';
    x.font = `italic 500 34px ${SERIF}`;
    x.fillText('the measure is in the pouring', W / 2, H - 70);
    this.texture.needsUpdate = true;
  }
}

// ---------------------------------------------------------------------------

/**
 * Lays out words and stacked fractions across lines; returns the next baseline.
 * Tokens are strings (split into words) or { n, d } fractions or { word, bold }.
 */
function flow(x, tokens, left, y, width, size, { italic = false, color = INK, dry = false } = {}) {
  const lh = Math.round(size * 1.42);
  const items = [];
  for (const t of tokens) {
    if (typeof t === 'string') {
      for (const piece of t.split(/(\s+)/)) if (piece) items.push({ text: piece, space: /^\s+$/.test(piece) });
    } else if (t.word) items.push({ text: t.word, bold: true });
    else items.push({ frac: t });
  }
  const fontFor = (it) => `${italic ? 'italic ' : ''}${it.bold ? 700 : 500} ${it.bold ? Math.round(size * 0.86) : size}px ${SERIF}`;
  const widthOf = (it) => {
    if (it.frac) {
      x.font = `600 ${Math.round(size * 0.62)}px ${SERIF}`;
      return Math.max(x.measureText(String(it.frac.n)).width, x.measureText(String(it.frac.d)).width) + size * 0.24;
    }
    x.font = fontFor(it);
    const text = it.bold ? it.text.toUpperCase() : it.text;
    return x.measureText(text).width + (it.bold ? text.length * size * 0.05 : 0);
  };
  let cx = left;
  for (const it of items) {
    const w = widthOf(it);
    if (it.space) {
      if (cx > left) cx += w;
      continue;
    }
    if (cx + w > left + width && cx > left) {
      cx = left;
      y += lh;
    }
    if (!dry) {
      x.fillStyle = color;
      if (it.frac) drawFrac(x, it.frac, cx + size * 0.12, y, size);
      else if (it.bold) {
        x.font = fontFor(it);
        spaced(x, it.text.toUpperCase(), cx, y, size * 0.05, 'left');
      } else {
        x.font = fontFor(it);
        x.textAlign = 'left';
        x.fillText(it.text, cx, y);
      }
    }
    cx += w;
  }
  return y + lh;
}

function drawFrac(x, { n, d }, left, base, size) {
  const s = Math.round(size * 0.62);
  x.font = `600 ${s}px ${SERIF}`;
  const nw = x.measureText(String(n)).width, dw = x.measureText(String(d)).width;
  const w = Math.max(nw, dw);
  const mid = base - size * 0.3;
  x.textAlign = 'center';
  x.fillText(String(n), left + w / 2, mid - s * 0.12);
  x.fillText(String(d), left + w / 2, mid + s * 0.82);
  x.fillRect(left - 2, mid + s * 0.06, w + 4, Math.max(2, size * 0.05));
  x.textAlign = 'left';
}

function spaced(x, text, cx, y, spacing, align = 'center') {
  const widths = [...text].map((ch) => x.measureText(ch).width + spacing);
  const total = widths.reduce((a, b) => a + b, 0) - spacing;
  let px = align === 'center' ? cx - total / 2 : cx;
  const prev = x.textAlign;
  x.textAlign = 'left';
  [...text].forEach((ch, i) => { x.fillText(ch, px, y); px += widths[i]; });
  x.textAlign = prev;
}

function wrapWords(x, text, width) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (x.measureText(next).width > width && line) { lines.push(line); line = w; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function ornament(x, cx, y, w) {
  x.strokeStyle = 'rgba(80, 52, 26, 0.55)';
  x.lineWidth = 2;
  x.beginPath();
  x.moveTo(cx - w / 2, y);
  x.lineTo(cx - 16, y);
  x.moveTo(cx + 16, y);
  x.lineTo(cx + w / 2, y);
  x.stroke();
  x.fillStyle = 'rgba(80, 52, 26, 0.7)';
  x.beginPath();
  x.moveTo(cx, y - 9); x.lineTo(cx + 9, y); x.lineTo(cx, y + 9); x.lineTo(cx - 9, y);
  x.closePath();
  x.fill();
}

function drop(x, cx, cy, r, color) {
  x.beginPath();
  x.moveTo(cx, cy - r * 1.55);
  x.bezierCurveTo(cx + r * 0.4, cy - r * 0.9, cx + r, cy - r * 0.2, cx + r, cy + r * 0.25);
  x.arc(cx, cy + r * 0.25, r, 0, Math.PI);
  x.bezierCurveTo(cx - r, cy - r * 0.2, cx - r * 0.4, cy - r * 0.9, cx, cy - r * 1.55);
  x.closePath();
  x.fillStyle = color;
  x.fill();
  x.lineWidth = 3;
  x.strokeStyle = 'rgba(59, 38, 20, 0.75)';
  x.stroke();
  x.fillStyle = 'rgba(255,255,255,0.55)';
  x.beginPath();
  x.ellipse(cx - r * 0.35, cy + r * 0.05, r * 0.18, r * 0.32, -0.4, 0, Math.PI * 2);
  x.fill();
}
