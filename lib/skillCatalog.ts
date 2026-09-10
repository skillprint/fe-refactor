/**
 * Joins the backend skill taxonomy (SKI-133) with the game catalogue and the
 * player's profile scores into the shapes the skills pages render.
 */
import type { GameTileProps } from '@/components/GameTile';
import type { GamePillProps } from '@/components/GamePill';
import type { SkillCardProps } from '@/components/SkillCard';
import type { SkillFeatureCardProps } from '@/components/SkillFeatureCard';
import type { TaxonomyDimension, TaxonomySkill, TaxonomySkillsResponse } from './models/portal/TaxonomySkills';
import type { ProfileDimensionStat } from './models/portal/ProfileAggregate';
import { PILLAR_ICON_IDS, Pillar, pillarLabel, skillIconId } from './skillIcons';
import { DEFAULT_GAME_IMAGE } from './playbookUtils';

/** One taxonomy skill with everything the catalog and progression pages need. */
export interface SkillCatalogEntry extends SkillCardProps {
  pillar: Pillar;
  featured: boolean;
  category: string | null;
  gameCount: number | null;
  /** Full tiles for rails; `games` on SkillCardProps holds the pill summaries. */
  gameTiles: GameTileProps[];
  score: number | null;
  baselineScore: number | null;
  delta: number | null;
}

export interface SkillCatalogDimension {
  pillar: Pillar;
  title: string;
  description: string;
  iconId: string;
  featured: SkillCatalogEntry | null;
  skills: SkillCatalogEntry[];
}

const DIMENSION_COPY: Record<Pillar, (count: number) => string> = {
  mood: (n) => `${n} states a session moves you through — the energy you bring to the board and the one it leaves you with.`,
  cognition: (n) => `${n} skills, read directly from how a game is played. Pick one to filter the library down to the games that train it.`,
  personality: (n) => `The big ${n} traits that make up your personality profile.`,
};

/** Catalogue item from `games/api/catalog/` → GameTile props. */
export function catalogGameToTile(game: any): GameTileProps {
  const seen = new Set<string>();
  const skills = [
    ...((game.skills || []) as any[]).map((s) => ({ id: String(s.slug || s.id || s), name: String(s.name || s), dimension: 'cognition' as const })),
    ...((game.moods || []) as any[]).map((m) => ({ id: String(m.slug || m.id || m), name: String(m.name || m), dimension: 'mood' as const })),
  ].filter((s) => (seen.has(s.id) ? false : (seen.add(s.id), true)));
  return {
    id: game.slug,
    title: game.name || game.title || game.slug,
    description: game.description || '',
    image: game.screenshot || game.image || DEFAULT_GAME_IMAGE,
    url: `/game/${game.slug}`,
    skills,
  };
}

export function tileToPill(tile: GameTileProps): GamePillProps {
  return { slug: tile.id, name: tile.title, description: tile.description, image: tile.image };
}

function dedupeBySlug(games: any[]): any[] {
  return Array.from(new Map(games.map((g) => [g.slug, g])).values());
}

/** Catalogue games that exercise `skill`, from the per-skill / per-mood catalogue calls. */
export function gamesForSkill(skill: TaxonomySkill, gamesBySkill: any[], gamesByMood: any[]): GameTileProps[] {
  let matches: any[] = [];
  if (skill.pillar === 'cognition') {
    matches = gamesBySkill.filter((g) => (g.skills || []).some((s: any) => (s.slug || s) === skill.slug));
  } else if (skill.pillar === 'mood') {
    matches = gamesByMood.filter((g) => (g.moods || []).some((m: any) => (m.slug || m) === skill.slug));
  }
  return dedupeBySlug(matches).map(catalogGameToTile);
}

export function buildSkillEntry(
  skill: TaxonomySkill,
  gamesBySkill: any[],
  gamesByMood: any[],
  scores: Record<string, ProfileDimensionStat>
): SkillCatalogEntry {
  const gameTiles = gamesForSkill(skill, gamesBySkill, gamesByMood);
  const stat = scores[skill.slug];
  return {
    id: skill.slug,
    name: skill.name,
    description: skill.description,
    dimension: skill.pillar,
    pillar: skill.pillar,
    iconId: skillIconId(skill.pillar, skill.slug, skill.icon),
    progressPercentage: stat ? Math.round(stat.score) : 0,
    games: gameTiles.slice(0, 4).map(tileToPill),
    gameTiles,
    featured: skill.featured,
    category: skill.category,
    gameCount: skill.gameCount ?? (gameTiles.length || null),
    score: stat ? stat.score : null,
    baselineScore: stat?.baselineScore ?? null,
    delta: stat?.delta ?? null,
  };
}

export function buildSkillCatalog(
  taxonomy: TaxonomySkillsResponse | null | undefined,
  gamesBySkill: any[],
  gamesByMood: any[],
  scores: Record<string, ProfileDimensionStat>
): SkillCatalogDimension[] {
  if (!taxonomy) return [];
  return taxonomy.dimensions.map((dim: TaxonomyDimension) => {
    const skills = dim.skills.map((s) => buildSkillEntry(s, gamesBySkill, gamesByMood, scores));
    const featured = skills.find((s) => s.featured) || skills.find((s) => s.id === dim.featuredSlug) || null;
    return {
      pillar: dim.pillar,
      title: dim.displayName || pillarLabel(dim.pillar),
      description: DIMENSION_COPY[dim.pillar]?.(skills.length) || '',
      iconId: PILLAR_ICON_IDS[dim.pillar],
      featured,
      skills,
    };
  });
}

export function featureCardProps(entry: SkillCatalogEntry, dimensionTitle: string): SkillFeatureCardProps {
  return {
    skillName: entry.name,
    skillSlug: entry.id,
    skillDescription: entry.description,
    iconId: entry.iconId,
    dimensionName: dimensionTitle,
    games: entry.gameTiles,
  };
}

export function findSkillEntry(catalog: SkillCatalogDimension[], slug: string): SkillCatalogEntry | undefined {
  for (const dim of catalog) {
    const hit = dim.skills.find((s) => s.id === slug);
    if (hit) return hit;
  }
  return undefined;
}
