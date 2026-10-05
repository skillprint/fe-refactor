import type { Pillar } from '../../skillIcons';

/** One skill in the official taxonomy (`GET /api/portal/taxonomy/skills/`). */
export interface TaxonomySkill {
  slug: string;
  name: string;
  description: string;
  pillar: Pillar;
  /** Client-side icon key; "" until the design system icon set is mapped. */
  icon: string;
  /** Talent category; null outside cognition. */
  category: string | null;
  /** Number of games exercising the skill; null for personality (nothing measured). */
  gameCount: number | null;
  /** Rotates weekly off the ISO week number; one per pillar. */
  featured: boolean;
}

export interface TaxonomyDimension {
  pillar: Pillar;
  displayName: string;
  featuredSlug: string | null;
  skills: TaxonomySkill[];
}

export interface TaxonomySkillsResponse {
  dimensions: TaxonomyDimension[];
}

export function findTaxonomySkill(data: TaxonomySkillsResponse | null | undefined, slug: string): TaxonomySkill | undefined {
  if (!data) return undefined;
  for (const dim of data.dimensions) {
    const hit = dim.skills.find((s) => s.slug === slug);
    if (hit) return hit;
  }
  return undefined;
}

export function allTaxonomySkills(data: TaxonomySkillsResponse | null | undefined): TaxonomySkill[] {
  return data ? data.dimensions.flatMap((d) => d.skills) : [];
}

export const generateMockTaxonomySkills = (): TaxonomySkillsResponse => ({
  dimensions: [
    {
      pillar: 'mood',
      displayName: 'Mood',
      featuredSlug: 'focus',
      skills: [
        { slug: 'focus', name: 'Focus', description: 'Hold a narrow attention for a long stretch.', pillar: 'mood', icon: '', category: null, gameCount: 5, featured: true },
        { slug: 'relax', name: 'Relax', description: 'Low pressure, steady pace, room to breathe.', pillar: 'mood', icon: '', category: null, gameCount: 3, featured: false },
      ],
    },
    {
      pillar: 'cognition',
      displayName: 'Cognition',
      featuredSlug: 'memory',
      skills: [
        { slug: 'memory', name: 'Memory', description: 'Holding things in mind.', pillar: 'cognition', icon: '', category: 'Mental Agility', gameCount: 8, featured: true },
        { slug: 'attention', name: 'Attention', description: 'Hold your focus on what matters.', pillar: 'cognition', icon: '', category: 'Attention', gameCount: 6, featured: false },
      ],
    },
    {
      pillar: 'personality',
      displayName: 'Personality',
      featuredSlug: 'openness',
      skills: [
        { slug: 'openness', name: 'Openness', description: 'How readily you try an unfamiliar rule set.', pillar: 'personality', icon: '', category: null, gameCount: null, featured: true },
      ],
    },
  ],
});
