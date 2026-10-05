'use client';

import { RefObject, useEffect } from 'react';

// Portal v2's logo hover motion (js/logo-motion.js, 20 September 2026): the
// marketing site's menu-logo animation, played from its Lottie file
// (public/assets/logos/skillprint-icon-hover.json). The file is one shape layer
// of path keyframes, so it is played directly, with no library. On hover an
// inline SVG is laid exactly over the icon in the logo image, the icon's part
// of the image is clipped away while it plays (skillprint.css,
// .is-logo-playing), and both are put back when it ends. First and last frame
// sit on the static mark. No autoplay, no loop. Touch screens, reduced motion
// and a failed load keep the static logo.

const URL = '/assets/logos/skillprint-icon-hover.json';
const SVG_NS = 'http://www.w3.org/2000/svg';
const ICON_SHARE = 100 / 494; // the icon's box in the 494x100 wordmark

type Point = [number, number];
interface ShapeValue { v: Point[]; i: Point[]; o: Point[] }
interface Bezier { x: number | number[]; y: number | number[] }
interface ShapeKey { t: number; s: ShapeValue[]; o?: Bezier; i?: Bezier }
interface Movie { fps: number; first: number; last: number; shapes: ShapeKey[][] }

let movie: Movie | null = null;
let loading: Promise<void> | null = null;

function load() {
  if (!loading) {
    loading = fetch(URL)
      .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
      .then((data) => {
        const group = data.layers[0].shapes[0].it as { ty: string; ks: { k: ShapeKey[] } }[];
        movie = {
          fps: data.fr,
          first: data.ip,
          last: data.op - 1,
          shapes: group.filter((item) => item.ty === 'sh').map((item) => item.ks.k),
        };
      })
      .catch(() => { movie = null; });
  }
  return loading;
}

// Lottie eases a key with a cubic-bezier from (0,0) to (1,1).
function ease(o: Bezier | undefined, i: Bezier | undefined, x: number) {
  if (!o || !i) return x;
  const x1 = ([] as number[]).concat(o.x)[0], y1 = ([] as number[]).concat(o.y)[0];
  const x2 = ([] as number[]).concat(i.x)[0], y2 = ([] as number[]).concat(i.y)[0];
  const at = (a: number, b: number, t: number) => 3 * a * t * (1 - t) * (1 - t) + 3 * b * t * t * (1 - t) + t * t * t;
  let lo = 0, hi = 1, t = x;
  for (let n = 0; n < 20; n += 1) {
    t = (lo + hi) / 2;
    if (at(x1, x2, t) < x) lo = t; else hi = t;
  }
  return at(y1, y2, t);
}

function shapeAt(keys: ShapeKey[], frame: number): ShapeValue {
  let k = 0;
  while (k < keys.length - 2 && frame >= keys[k + 1].t) k += 1;
  const a = keys[k], b = keys[k + 1] || a;
  const span = b.t - a.t;
  const w = span > 0 ? ease(a.o, a.i, Math.min(1, Math.max(0, (frame - a.t) / span))) : 0;
  const from = a.s[0], to = (b.s || a.s)[0];
  const mix = (p: Point[], q: Point[]) => p.map((point, n): Point => [point[0] + (q[n][0] - point[0]) * w, point[1] + (q[n][1] - point[1]) * w]);
  return { v: mix(from.v, to.v), i: mix(from.i, to.i), o: mix(from.o, to.o) };
}

const r = (value: number) => Math.round(value * 100) / 100;

function pathAt(m: Movie, frame: number) {
  return m.shapes.map((keys) => {
    const { v, i, o } = shapeAt(keys, frame);
    let d = `M${r(v[0][0])} ${r(v[0][1])}`;
    for (let n = 0; n < v.length; n += 1) {
      const next = (n + 1) % v.length;
      d += `C${r(v[n][0] + o[n][0])} ${r(v[n][1] + o[n][1])} ${r(v[next][0] + i[next][0])} ${r(v[next][1] + i[next][1])} ${r(v[next][0])} ${r(v[next][1])}`;
    }
    return d + 'Z';
  }).join('');
}

/** Plays the icon's hover animation when the pointer enters the brand link. */
export function useLogoMotion(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const brand = ref.current;
    if (!brand || !window.requestAnimationFrame) return;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let svg: SVGSVGElement | null = null;
    let path: SVGPathElement | null = null;
    let playing = false;
    let raf = 0;

    const play = () => {
      const m = movie;
      if (playing || !m || reduceMotion.matches || !finePointer.matches) return;
      // Whichever logo image is showing: the wordmark of the current theme, or
      // the mark alone when the sidebar is collapsed.
      const img = Array.from(brand.querySelectorAll<HTMLImageElement>('img.brand-logo, img.portal-brand__mark'))
        .find((el) => el.offsetWidth > 0 && el.offsetHeight > 0);
      if (!img) return;
      if (!svg || !path) {
        svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('class', 'sp-logo-motion');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.setAttribute('aria-hidden', 'true');
        path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('fill', '#09e08f');
        svg.appendChild(path);
        if (getComputedStyle(brand).position === 'static') brand.style.position = 'relative';
        brand.appendChild(svg);
      }
      const box = img.getBoundingClientRect(), home = brand.getBoundingClientRect();
      const side = img.classList.contains('brand-logo') ? box.width * ICON_SHARE : box.width;
      svg.style.left = `${box.left - home.left - brand.clientLeft}px`;
      svg.style.top = `${box.top - home.top - brand.clientTop + (box.height - side) / 2}px`;
      svg.style.width = `${side}px`;
      svg.style.height = `${side}px`;

      playing = true;
      const target = path;
      target.setAttribute('d', pathAt(m, m.first));
      brand.classList.add('is-logo-playing');
      const length = ((m.last - m.first) / m.fps) * 1000;
      let start: number | null = null;
      const frame = (now: number) => {
        if (start === null) start = now;
        const k = Math.min(1, (now - start) / length);
        target.setAttribute('d', pathAt(m, m.first + (m.last - m.first) * k));
        if (k < 1) {
          raf = window.requestAnimationFrame(frame);
        } else {
          brand.classList.remove('is-logo-playing');
          playing = false;
        }
      };
      raf = window.requestAnimationFrame(frame);
    };

    const onEnter = () => { load().then(play); };
    brand.addEventListener('mouseenter', onEnter);

    // Fetched while the page is idle, so the first hover already has it.
    let idle = 0;
    if (!reduceMotion.matches && finePointer.matches) {
      idle = window.requestIdleCallback ? window.requestIdleCallback(() => load()) : window.setTimeout(load, 1200);
    }

    return () => {
      brand.removeEventListener('mouseenter', onEnter);
      if (idle && window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else if (idle) window.clearTimeout(idle);
      window.cancelAnimationFrame(raf);
      brand.classList.remove('is-logo-playing');
      svg?.remove();
    };
  }, [ref]);
}
