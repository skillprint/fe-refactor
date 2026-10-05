/**
 * Icon and label helpers for the three-pillar skill taxonomy.
 *
 * The backend's `icon` field on skills is still unauthored (always ""), so the
 * sprite id is derived from pillar + slug, which is how the redesign's sprite
 * (components/PortalSprite.tsx) names every taxonomy icon.
 */

export type Pillar = 'mood' | 'cognition' | 'personality';

export const PILLARS: Pillar[] = ['mood', 'cognition', 'personality'];

export const PILLAR_LABELS: Record<Pillar, string> = {
  mood: 'Mood',
  cognition: 'Cognition',
  personality: 'Personality',
};

export const PILLAR_ICON_IDS: Record<Pillar, string> = {
  mood: 'ti-category-mood',
  cognition: 'ti-category-cognition',
  personality: 'ti-category-personality',
};

export function isPillar(value: unknown): value is Pillar {
  return value === 'mood' || value === 'cognition' || value === 'personality';
}

/** Sprite id for a taxonomy skill, e.g. `ti-cognition-pattern-matching`. */
export function skillIconId(pillar: string, slug: string, icon?: string | null): string {
  if (icon && icon.startsWith('ti-')) return icon;
  const p = isPillar(pillar) ? pillar : 'cognition';
  return `ti-${p}-${slug}`;
}

export function pillarLabel(pillar: string): string {
  return isPillar(pillar) ? PILLAR_LABELS[pillar] : pillar.charAt(0).toUpperCase() + pillar.slice(1);
}

/** Humanise a slug when no display name is available: `pattern-matching` → `Pattern Matching`. */
export function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
