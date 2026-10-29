// Numbers drawn on canvases for textures in the scene. The scorer sees only
// the WebGL frame, so every number the player reasons about is drawn here.

import * as THREE from 'three';

export const SERIF = "'Cinzel', 'Trajan Pro', Georgia, serif";

/** Gate colours by the operation they lead with. */
export const OP_COLOR = { '×': '#ffc44f', '+': '#7dffa6', '−': '#ff6b57', '÷': '#c49cff' };

export function fontsReady() {
  return Promise.all([
    document.fonts.load(`700 100px ${SERIF}`),
    document.fonts.load(`600 40px ${SERIF}`),
  ]).catch(() => {});
}

function texture(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/**
 * A gate's panel: an arch of coloured light with the operation in it.
 * Two-step operations ("×2 −5") get a line each.
 */
export function gateTexture(text, color, aspect) {
  const W = 512, H = Math.round(W / aspect);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  const pad = 18, r = Math.min((W - pad * 2) / 2, H * 0.42);
  const arch = () => {
    g.beginPath();
    g.moveTo(pad, H - pad);
    g.lineTo(pad, pad + r);
    g.arc(W / 2, pad + r, W / 2 - pad, Math.PI, 0);
    g.lineTo(W - pad, H - pad);
    g.closePath();
  };

  // A veil of the gate's colour, brightest under the arch.
  arch();
  const fill = g.createLinearGradient(0, 0, 0, H);
  fill.addColorStop(0, hexA(color, 0.34));
  fill.addColorStop(0.55, hexA(color, 0.16));
  fill.addColorStop(1, hexA(color, 0.04));
  g.fillStyle = fill;
  g.fill();
  const glow = g.createRadialGradient(W / 2, H * 0.48, 0, W / 2, H * 0.48, W * 0.55);
  glow.addColorStop(0, hexA(color, 0.28));
  glow.addColorStop(1, hexA(color, 0));
  g.fillStyle = glow;
  g.fill();

  // The rim.
  g.save();
  g.shadowColor = color;
  g.shadowBlur = 26;
  g.strokeStyle = color;
  g.lineWidth = 9;
  arch();
  g.stroke();
  g.lineWidth = 3;
  g.strokeStyle = 'rgba(255, 252, 240, 0.85)';
  g.stroke();
  g.restore();

  const lines = text.split(' ');
  const size = Math.min(H * (lines.length > 1 ? 0.3 : 0.44), (W * 0.82) / (0.62 * Math.max(...lines.map((l) => l.length))));
  g.font = `700 ${size}px ${SERIF}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const lh = size * 1.02;
  const y0 = H * 0.52 - ((lines.length - 1) * lh) / 2;
  lines.forEach((l, i) => {
    g.save();
    g.shadowColor = color;
    g.shadowBlur = 34;
    g.fillStyle = '#fffaf0';
    g.fillText(l, W / 2, y0 + i * lh);
    g.shadowBlur = 10;
    g.shadowColor = 'rgba(10, 14, 20, 0.6)';
    g.fillText(l, W / 2, y0 + i * lh);
    g.restore();
  });
  return texture(c);
}

/** A redrawable number on a sprite: the swarm's count, the beacon's fill, floaters. */
export class NumberSprite {
  constructor({ width = 512, height = 224, scale = 1, size = 150, glow = '#ffe9a0' } = {}) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.size = size;
    this.glow = glow;
    this.map = texture(this.canvas);
    this.material = new THREE.SpriteMaterial({ map: this.map, transparent: true, depthWrite: false, depthTest: false, toneMapped: false });
    this.sprite = new THREE.Sprite(this.material);
    this.sprite.renderOrder = 10;
    this.aspect = width / height;
    this.base = scale;
    this.sprite.scale.set(scale * this.aspect, scale, 1);
    this.text = null;
  }

  set(text, glow = this.glow, ink = '#fffaf0') {
    if (text === this.text && glow === this.lastGlow) return;
    this.text = text;
    this.lastGlow = glow;
    const { canvas: c } = this;
    const g = c.getContext('2d');
    g.clearRect(0, 0, c.width, c.height);
    let size = this.size;
    g.font = `700 ${size}px ${SERIF}`;
    const w = g.measureText(text).width;
    if (w > c.width * 0.9) size *= (c.width * 0.9) / w;
    g.font = `700 ${size}px ${SERIF}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.shadowColor = glow;
    g.shadowBlur = 30;
    g.fillStyle = ink;
    g.fillText(text, c.width / 2, c.height * 0.54);
    g.fillText(text, c.width / 2, c.height * 0.54);
    g.shadowBlur = 6;
    g.shadowColor = 'rgba(6, 10, 16, 0.7)';
    g.fillText(text, c.width / 2, c.height * 0.54);
    this.map.needsUpdate = true;
  }

  dispose() {
    this.map.dispose();
    this.material.dispose();
  }
}

/** The beacon's carved number: pale stone-cut figures that warm when it's lit. */
export function carvedTexture(text) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const g = c.getContext('2d');
  g.font = `700 150px ${SERIF}`;
  const w = g.measureText(text).width;
  const size = w > 440 ? (150 * 440) / w : 150;
  g.font = `700 ${size}px ${SERIF}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.shadowColor = 'rgba(160, 230, 255, 0.9)';
  g.shadowBlur = 24;
  g.fillStyle = '#f2fbff';
  g.fillText(text, 256, 136);
  g.shadowBlur = 0;
  g.strokeStyle = 'rgba(20, 30, 40, 0.5)';
  g.lineWidth = 3;
  g.strokeText(text, 256, 136);
  return texture(c);
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
