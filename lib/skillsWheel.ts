/**
 * Geometry of the Skillprint wheel, for the places that draw it without the
 * profile's interactive component: the shared snapshot page and its preview
 * card. Same layout as components/Profile/ProfileSkillsWheel.tsx: every
 * taxonomy skill is a spoke, grouped by pillar (mood, cognition, personality)
 * with a gap between pillars, strongest first within a pillar; a spoke
 * thickens and darkens with its score, and an unmeasured one is dashed.
 */
import { PORTAL_SKILLS } from '../app/config/skillsTaxonomy';
import type { Pillar } from './skillprintSnapshot';

export const WHEEL = {
  SIZE: 1000,
  CX: 500,
  CY: 500,
  R_HUB: 78,
  R_IN: 88,
  R_OUT: 268,
  R_LABEL: 284,
  LINE_MIN: 1,
  LINE_MAX: 4.5,
  GAP_DEG: 3,
  OP_MIN: 0.12,
} as const;

const PILLARS: Pillar[] = ['mood', 'cognition', 'personality'];

export interface WheelSpoke {
  slug: string;
  name: string;
  pillar: Pillar;
  hasScore: boolean;
  /** 0-100; 0 when unmeasured. */
  value: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strokeWidth: number;
  strokeOpacity: number;
  label: { x: number; y: number; rotate: number; anchor: 'start' | 'end'; scoreFirst: boolean };
}

const fixed = (n: number) => Math.round(n * 1000) / 1000;

function pt(angle: number, r: number): [number, number] {
  const a = ((angle - 90) * Math.PI) / 180;
  return [fixed(WHEEL.CX + Math.cos(a) * r), fixed(WHEEL.CY + Math.sin(a) * r)];
}

/** One spoke per taxonomy skill, in drawing order. */
export function wheelSpokes(scores: Record<string, number | undefined>): WheelSpoke[] {
  const groups = PILLARS.map((pillar) =>
    Object.keys(PORTAL_SKILLS)
      .filter((slug) => PORTAL_SKILLS[slug].pillar === pillar)
      .map((slug) => ({ slug, name: PORTAL_SKILLS[slug].name, pillar, score: scores[slug] }))
      .sort((a, b) => {
        const as = typeof a.score === 'number' ? a.score : -1;
        const bs = typeof b.score === 'number' ? b.score : -1;
        return bs !== as ? bs - as : a.name.localeCompare(b.name);
      }),
  );
  const total = groups.reduce((n, g) => n + g.length, 0);
  if (!total) return [];
  const perSkill = (360 - PILLARS.length * WHEEL.GAP_DEG) / total;

  const out: WheelSpoke[] = [];
  let angle = 0;
  for (const group of groups) {
    group.forEach((item, i) => {
      const a = angle + (i + 0.5) * perSkill;
      const hasScore = typeof item.score === 'number';
      const value = hasScore ? Math.max(0, Math.min(100, item.score as number)) : 0;
      const [x1, y1] = pt(a, WHEEL.R_IN);
      const [x2, y2] = pt(a, WHEEL.R_OUT);
      const [tx, ty] = pt(a, WHEEL.R_LABEL);
      const norm = ((a % 360) + 360) % 360;
      out.push({
        slug: item.slug,
        name: item.name,
        pillar: item.pillar,
        hasScore,
        value,
        x1, y1, x2, y2,
        strokeWidth: hasScore ? fixed(WHEEL.LINE_MIN + (WHEEL.LINE_MAX - WHEEL.LINE_MIN) * (value / 100)) : 1.5,
        strokeOpacity: hasScore ? fixed(WHEEL.OP_MIN + (1 - WHEEL.OP_MIN) * (value / 100)) : 0.5,
        label: {
          x: tx,
          y: ty,
          rotate: fixed(norm > 180 ? a + 90 : a - 90),
          anchor: norm > 180 ? 'end' : 'start',
          scoreFirst: norm <= 180,
        },
      });
    });
    angle += group.length * perSkill + WHEEL.GAP_DEG;
  }
  return out;
}

/**
 * The wheel as a standalone SVG (spokes, rings and hub; no text), for the
 * preview card renderer, which draws images but has no fonts for SVG text.
 */
export function wheelSvgMarkup(scores: Record<string, number | undefined>, colours: Record<Pillar, string>): string {
  const { CX, CY, R_HUB, R_IN, R_OUT } = WHEEL;
  const rings = [0.34, 0.67, 1]
    .map((f) => `<circle cx="${CX}" cy="${CY}" r="${fixed(R_IN + (R_OUT - R_IN) * f)}" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="1.5"${f === 1 ? ' stroke-dasharray="3 6"' : ''}/>`)
    .join('');
  const spokes = wheelSpokes(scores)
    .map((s) => {
      // Drawn a little heavier than on the page: the card is seen small.
      const w = fixed(s.strokeWidth * 2.2);
      const dash = s.hasScore ? '' : ' stroke-dasharray="4 8"';
      return `<line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" stroke="${colours[s.pillar]}" stroke-opacity="${s.strokeOpacity}" stroke-width="${w}" stroke-linecap="round"${dash}/>`;
    })
    .join('');
  const hub = `<circle cx="${CX}" cy="${CY}" r="${R_HUB - 8}" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)" stroke-width="1.5"/>`;
  const pad = R_OUT + 24;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${CX - pad} ${CY - pad} ${pad * 2} ${pad * 2}" width="${pad * 2}" height="${pad * 2}">${rings}${spokes}${hub}</svg>`;
}
