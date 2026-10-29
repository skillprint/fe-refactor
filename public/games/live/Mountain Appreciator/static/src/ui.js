// The paper layer: ink rings drawn on the mountains, field notes, the sun
// dial, and the cards between pairs.

import { KINDS } from './features.js';

const $ = (id) => document.getElementById(id);
const SVG = 'http://www.w3.org/2000/svg';
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// One small mark per kind of scenery, drawn like the rest of the ink.
const GLYPHS = {
  trees: '<path d="M8 1.5 12.5 8H10l3.5 4.5h-11L6 8H3.5Z"/><path d="M8 12.5V15"/>',
  water: '<path d="M8 2s-4.5 5.5-4.5 8.2a4.5 4.5 0 0 0 9 0C12.5 7.5 8 2 8 2Z"/>',
  sky: '<path d="m8 1.8 1.7 4.2 4.5.3-3.5 2.8 1.2 4.4L8 11l-3.9 2.5 1.2-4.4-3.5-2.8 4.5-.3Z"/>',
  wildlife: '<ellipse cx="8" cy="10.8" rx="3" ry="2.6"/><circle cx="3.5" cy="7" r="1.3"/><circle cx="6.2" cy="4.3" r="1.3"/><circle cx="9.8" cy="4.3" r="1.3"/><circle cx="12.5" cy="7" r="1.3"/>',
  land: '<path d="M1.5 14 6 5.5l2.6 3.8 2-2.8L14.5 14Z"/>',
  weather: '<path d="M4.6 12.5a3 3 0 0 1 .2-5.9 4 4 0 0 1 7.4.8 2.6 2.6 0 0 1-.2 5.1Z"/>',
  traces: '<path d="M2.5 14V7.5L8 3l5.5 4.5V14Z"/>',
};
const ORDER = Object.keys(GLYPHS);
const glyph = (kind) => `<svg viewBox="0 0 16 16" aria-hidden="true">${GLYPHS[kind]}</svg>`;

function scribble(seed) {
  let s = (seed % 2147483646) + 1;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const a0 = r() * Math.PI * 2, turns = 1.08 + r() * 0.14, wob = r() * 6, n = 46;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = a0 + t * turns * Math.PI * 2;
    const rr = 1 + 0.055 * Math.sin(a * 3 + wob) + (t - 0.5) * 0.11;
    d += `${i ? 'L' : 'M'}${(Math.cos(a) * rr * 1.08).toFixed(3)} ${(Math.sin(a) * rr * 0.92).toFixed(3)}`;
  }
  return d;
}

class Ink {
  constructor(svg) {
    this.svg = svg;
    this.marks = [];
    this.layers = [0, 1].map((i) => {
      const clip = document.createElementNS(SVG, 'clipPath');
      clip.id = `panel-clip-${i}`;
      const rect = document.createElementNS(SVG, 'rect');
      clip.appendChild(rect);
      svg.appendChild(clip);
      const g = document.createElementNS(SVG, 'g');
      g.setAttribute('clip-path', `url(#panel-clip-${i})`);
      svg.appendChild(g);
      return { g, rect };
    });
  }

  clear() {
    for (const m of this.marks) for (const g of m.g) g.remove();
    this.marks = [];
  }

  mark(diff, num, kind) {
    const center = diff.points[Math.floor(diff.points.length / 2)];
    let reach = diff.def.radius * 0.75;
    for (const p of diff.points) reach = Math.max(reach, p.distanceTo(center) + 3);
    const m = { diff, center, reach, g: [], ring: [], num: [] };
    const path = scribble(num * 7919 + diff.site.x * 13);
    for (let i = 0; i < 2; i++) {
      const g = document.createElementNS(SVG, 'g');
      g.setAttribute('class', `mark ${kind}`);
      const ring = document.createElementNS(SVG, 'path');
      ring.setAttribute('d', path);
      ring.setAttribute('pathLength', '1');
      ring.setAttribute('class', 'ring');
      const t = document.createElementNS(SVG, 'text');
      t.setAttribute('class', 'num');
      t.textContent = String(num);
      g.append(ring, t);
      this.layers[i].g.appendChild(g);
      m.g.push(g); m.ring.push(ring); m.num.push(t);
    }
    this.marks.push(m);
  }

  update(world, t) {
    world.panels.forEach((p, i) => {
      const r = p.rect;
      const rect = this.layers[i].rect;
      rect.setAttribute('x', r.x); rect.setAttribute('y', r.y);
      rect.setAttribute('width', p.enabled ? r.w : 0); rect.setAttribute('height', r.h);
    });
    const cam = world.camera.position;
    for (const m of this.marks) {
      const d = m.diff;
      const p = d.def.pos ? d.def.pos(d.site, t) : m.center;
      for (let i = 0; i < 2; i++) {
        const g = m.g[i];
        const panel = world.panels[i];
        if (!panel.enabled) { g.style.display = 'none'; continue; }
        const sp = world.project(p, i);
        if (sp.behind) { g.style.display = 'none'; continue; }
        g.style.display = '';
        const rad = clamp(m.reach * world.pxPerUnit(p, i), 14, 95);
        g.setAttribute('transform', `translate(${sp.x.toFixed(1)},${sp.y.toFixed(1)})`);
        m.ring[i].setAttribute('transform', `scale(${rad.toFixed(2)})`);
        m.ring[i].style.strokeWidth = (2.6 / rad).toFixed(4);
        m.num[i].setAttribute('x', (rad * 0.8 + 3).toFixed(1));
        m.num[i].setAttribute('y', (-rad * 0.72).toFixed(1));
        const f = world.fields[panel.show];
        const hidden = f && f.occluded(cam.x, cam.y, cam.z, p.x, p.y, p.z, 1.5);
        g.style.opacity = hidden ? '0.3' : '1';
      }
    }
  }
}

export class UI {
  constructor() {
    this.ink = new Ink($('ink'));
    this.noteTimer = 0;
  }

  showTitle(standing, linger) {
    $('title').hidden = false;
    $('standing').textContent = standing;
    $('linger').checked = linger;
    this.hud(false);
  }

  hideTitle() { $('title').classList.add('leaving'); setTimeout(() => { $('title').hidden = true; $('title').classList.remove('leaving'); }, 600); }

  hud(on) { for (const id of ['hud-top', 'actions', 'captions']) $(id).hidden = !on; }

  setPair(round) {
    $('pair-no').textContent = `Pair ${round.level} · ${round.label}`;
    $('pair-name').textContent = round.names.pair;
  }

  // A mark per difference, grouped by kind: a hint at where to look next.
  setDots(diffs) {
    const el = $('dots');
    const sorted = [...diffs].sort((a, b) => ORDER.indexOf(a.cat) - ORDER.indexOf(b.cat));
    el.replaceChildren(...sorted.map((d) => {
      const s = document.createElement('span');
      s.className = `kind${d.found ? ' found' : ''}${d.missed ? ' missed' : ''}`;
      s.title = d.found || d.missed ? `${KINDS[d.cat]}: ${d.title}` : KINDS[d.cat];
      s.innerHTML = glyph(d.cat);
      return s;
    }));
    const left = diffs.filter((d) => !d.found).map((d) => KINDS[d.cat].toLowerCase());
    el.setAttribute('aria-label', `${diffs.length - left.length} of ${diffs.length} differences noticed${left.length ? `; still to find: ${left.join(', ')}` : ''}`);
  }

  setDaylight(remaining, seconds, linger, night) {
    $('dial').classList.toggle('night', night);
    $('dial-svg').classList.toggle('linger', linger);
    $('light').hidden = !linger;
    $('dusk').hidden = linger;
    const p = 1 - clamp(remaining, 0, 1);
    const a = Math.PI * (0.6 - 0.6 * p);
    const sun = $('dial-sun');
    sun.setAttribute('cx', (40 + 33 * Math.cos(a)).toFixed(2));
    sun.setAttribute('cy', (40 - 33 * Math.sin(a)).toFixed(2));
    sun.style.fill = night ? 'var(--moon)' : `color-mix(in oklab, var(--gold) ${Math.round((1 - p) * 100)}%, var(--rose))`;
    if (!linger) {
      const s = Math.max(0, Math.ceil(seconds));
      $('dusk').textContent = `${night ? 'dawn' : 'dusk'} in ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    }
  }

  flashSun() {
    const el = $('dial');
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  }

  note(kicker, title, text, ms = 5200) {
    const el = $('note');
    $('note-kicker').textContent = kicker;
    const body = $('note-text');
    body.replaceChildren();
    if (title) {
      const b = document.createElement('b');
      b.textContent = `${title}. `;
      body.append(b);
    }
    body.append(text);
    el.hidden = false;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(this.noteTimer);
    this.noteTimer = setTimeout(() => el.classList.remove('show'), ms);
  }

  hideNote() { clearTimeout(this.noteTimer); $('note').classList.remove('show'); }

  float(text, x, y, kind = '') {
    const el = document.createElement('div');
    el.className = `floater ${kind}`;
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    $('floaters').appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  captions(world, round, blinking) {
    for (let i = 0; i < 2; i++) {
      const el = $(`cap${i}`);
      const p = world.panels[i];
      if (!p.enabled || !round) { el.hidden = true; continue; }
      el.hidden = false;
      // Landscape: outer bottom corners. Portrait: either side of the divider.
      const r = p.rect;
      const below = world.portrait && i === 1;
      const right = !world.portrait && i === 1;
      el.style.left = `${r.x}px`;
      el.style.width = `${r.w}px`;
      el.style.top = `${below ? r.y : r.y + r.h}px`;
      el.classList.toggle('below', below);
      el.classList.toggle('right', right);
      el.classList.toggle('blinking', blinking);
      const name = round.names.twins[p.show];
      if (el.dataset.name !== name) {
        el.dataset.name = name;
        $(`cap${i}-name`).textContent = name;
        $(`cap${i}-alt`).textContent = `${round.elevation.toLocaleString('en-US')} m`;
      }
    }
  }

  showEnd({ head, sub, diffs, score, names }) {
    $('end-head').textContent = head;
    $('end-sub').textContent = sub;
    $('end-list').replaceChildren(...diffs.map((d) => {
      const li = document.createElement('li');
      li.className = d.found ? 'found' : 'missed';
      li.innerHTML = `<span class="n"></span><p><span class="kind">${glyph(d.cat)}</span><b></b> <i></i></p>`;
      li.children[0].textContent = d.num;
      li.querySelector('b').textContent = d.title;
      li.querySelector('i').textContent = d.found ? d.note : d.def.missed || d.note;
      return li;
    }));
    $('end-score').textContent = score;
    $('keep0').textContent = `Keep ${names.twins[0]}`;
    $('keep1').textContent = `Keep ${names.twins[1]}`;
    $('keep').hidden = false;
    $('quip').hidden = true;
    $('next').hidden = true;
    $('end').hidden = false;
    requestAnimationFrame(() => $('end').classList.add('show'));
  }

  kept(quip) {
    $('keep').hidden = true;
    $('quip').textContent = quip;
    $('quip').hidden = false;
    $('next').hidden = false;
    $('next').focus({ preventScroll: true });
  }

  hideEnd() { $('end').classList.remove('show'); $('end').hidden = true; }

  veil(on, text) {
    if (text) $('veil-text').textContent = text;
    $('veil').classList.toggle('on', on);
  }
}
