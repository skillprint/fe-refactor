/**
 * A shared Skillprint snapshot: a player's top scores, carried in the link.
 *
 * There is no public profile to link to (a profile needs the player's token),
 * so the link itself holds the few numbers the player chose to share:
 * `/snapshot/?s=attention.81,focus.74`. No name and no account id. The page
 * and its preview card only show skills the taxonomy knows, scored 0-100.
 */
import { PORTAL_SKILLS } from '../app/config/skillsTaxonomy';
import type { ProfileAggregate } from './models/portal/ProfileAggregate';

export type Pillar = 'mood' | 'cognition' | 'personality';

export interface SnapshotEntry {
  slug: string;
  score: number;
}

export interface SnapshotSkill extends SnapshotEntry {
  name: string;
  pillar: Pillar;
}

/** How many skills a snapshot shows. */
export const SNAPSHOT_SIZE = 5;

/** The profile wheel's pillar colours (--mood-500, --cognition-500, --personality-500). */
export const PILLAR_COLOURS: Record<Pillar, string> = {
  mood: '#c1ee16',
  cognition: '#5bfde1',
  personality: '#27baff',
};

export const PILLAR_LABELS: Record<Pillar, string> = {
  mood: 'Mood',
  cognition: 'Cognition',
  personality: 'Personality',
};

/** The player's strongest measured skills, highest first. */
export function snapshotFromProfile(profile: ProfileAggregate | null | undefined): SnapshotEntry[] {
  if (!profile) return [];
  const all: SnapshotEntry[] = [];
  for (const pillar of ['mood', 'cognition', 'personality'] as const) {
    for (const stat of profile.topDimensions?.[pillar] || []) {
      const score = Math.round(stat.score);
      if (PORTAL_SKILLS[stat.slug] && score > 0) all.push({ slug: stat.slug, score });
    }
  }
  return all.sort((a, b) => b.score - a.score).slice(0, SNAPSHOT_SIZE);
}

export function encodeSnapshot(entries: SnapshotEntry[]): string {
  return entries.map((e) => `${e.slug}.${Math.round(e.score)}`).join(',');
}

/** Read `?s=` back, keeping only known skills with a whole score from 0 to 100. */
export function parseSnapshot(raw: string | null | undefined): SnapshotSkill[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const out: SnapshotSkill[] = [];
  for (const part of raw.split(',')) {
    const m = /^([a-z0-9-]{1,40})\.(\d{1,3})$/.exec(part.trim());
    if (!m) continue;
    const [, slug, digits] = m;
    const score = Number(digits);
    const skill = PORTAL_SKILLS[slug];
    if (!skill || score > 100 || seen.has(slug)) continue;
    seen.add(slug);
    out.push({ slug, score, name: skill.name, pillar: skill.pillar });
    if (out.length === SNAPSHOT_SIZE) break;
  }
  return out.sort((a, b) => b.score - a.score);
}

export function snapshotSharePath(entries: SnapshotEntry[]): string {
  return `/snapshot/?s=${encodeURIComponent(encodeSnapshot(entries))}`;
}
