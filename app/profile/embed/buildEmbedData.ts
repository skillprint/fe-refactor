/**
 * Pure derivation of everything the embed card renders from portal payloads.
 *
 * Every number on the card traces back to a backend field; when a payload is
 * missing (optional fetch failed, or the player has no sessions yet) the
 * corresponding slot is `null` and the card renders an honest placeholder
 * instead of a reference-design figure.
 */

import type { HomeSummary } from '@/lib/models/portal/HomeSummary';
import type { HomeJustPlayed } from '@/lib/models/portal/HomeJustPlayed';
import type { PaginatedSession } from '@/lib/models/portal/PaginatedSession';
import type { ProfileAggregate, ProfileDimensionStat } from '@/lib/models/portal/ProfileAggregate';
import type { ProfileTrendsResponse } from '@/lib/models/portal/ProfileTrends';
import { TaxonomySkillsResponse, findTaxonomySkill } from '@/lib/models/portal/TaxonomySkills';
import { skillIconId, titleFromSlug } from '@/lib/skillIcons';
import type { EmbedTrait, EmbedTargetMood } from '@/components/Profile/EmbedCard';

export interface EmbedGraphInput {
  userSkills: string[];
  userMoods: string[];
  hasScoreBySkill: Record<string, boolean>;
  hasScoreByMood: Record<string, boolean>;
}

export interface EmbedData {
  userName: string;
  summaryText: string;
  momentumText: string | null;
  flowMedian: number | null;
  flowBest: number | null;
  stats: { label: string; value: string | number }[];
  traits: EmbedTrait[];
  targetMood: EmbedTargetMood | null;
  streakDays: number;
  graph: EmbedGraphInput;
}

export interface EmbedSources {
  /** `GET /api/portal/profile/` — required. */
  profile: ProfileAggregate;
  /** `GET /api/portal/home/summary/` */
  summary: HomeSummary | null;
  /** `GET /api/portal/sessions/?limit=50` */
  sessions: PaginatedSession | null;
  /** `GET /api/portal/home/just-played/` (empty body when nothing was played) */
  justPlayed: HomeJustPlayed | null;
  /** `GET /api/portal/profile/trends/?period=weekly&points=2` */
  trends: ProfileTrendsResponse | null;
  /** `GET /api/portal/taxonomy/skills/` — display names for slugs */
  taxonomy: TaxonomySkillsResponse | null;
  /** Number of skill / mood nodes the static graph can label. */
  graphSlots: { skills: number; moods: number };
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** `4320` → `1h 12m`; `720` → `12m`; `0` → `0m`. */
export function formatPlayTime(totalSeconds: number): string {
  const minutes = Math.max(0, Math.round(totalSeconds / 60));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours > 0 ? `${hours}h ${rest}m` : `${rest}m`;
}

/**
 * Guest accounts have no first name, and the backend currently substitutes the
 * internal partner username (`partner-<org>-<internal id>`), which must not be
 * shown to players (SKI-188). Fall back to a neutral label in that case.
 */
export function displayName(firstName: string | null | undefined): string {
  const name = (firstName ?? '').trim();
  if (!name || /^partner-[a-z0-9]+-/i.test(name)) return 'Player';
  return name;
}

function byScoreDesc(a: ProfileDimensionStat, b: ProfileDimensionStat): number {
  return (b.score ?? 0) - (a.score ?? 0);
}

export function buildEmbedData(src: EmbedSources): EmbedData {
  const { profile, summary, sessions, justPlayed, trends, taxonomy, graphSlots } = src;

  const nameOf = (slug: string): string => findTaxonomySkill(taxonomy, slug)?.name ?? titleFromSlug(slug);
  const iconOf = (pillar: 'cognition' | 'mood', slug: string): string =>
    skillIconId(pillar, slug, findTaxonomySkill(taxonomy, slug)?.icon);

  const cognition = [...(profile.topDimensions?.cognition ?? [])].sort(byScoreDesc);
  const moods = [...(profile.topDimensions?.mood ?? [])].sort(byScoreDesc);

  // Flow: the backend has no lifetime flow aggregate yet (SKI-183), so summarise
  // the most recent sessions' primary mood scores.
  const flowScores = (sessions?.results ?? [])
    .map((s) => s.primaryScore)
    .filter((n): n is number => typeof n === 'number');
  const flowMedianRaw = median(flowScores);
  const flowMedian = flowMedianRaw === null ? null : Math.round(flowMedianRaw);
  const flowBest = flowScores.length ? Math.round(Math.max(...flowScores)) : null;

  const traits: EmbedTrait[] = cognition.slice(0, 3).map((d) => ({
    traitName: nameOf(d.slug),
    score: Math.round(d.score),
    iconId: iconOf('cognition', d.slug),
  }));

  const topCognition = cognition[0];
  const summaryText = topCognition
    ? `${nameOf(topCognition.slug)} leads this print.`
    : 'Play a few games to build this print.';

  // Momentum: mood score this week vs last week from the weekly trend series.
  let momentumText: string | null = null;
  const points = trends?.points ?? [];
  if (points.length >= 2) {
    const prev = points[points.length - 2].mood;
    const last = points[points.length - 1].mood;
    if (typeof prev === 'number' && typeof last === 'number') {
      const delta = Math.round(last - prev);
      momentumText = `${delta >= 0 ? '+' : ''}${delta} momentum on last week`;
    }
  }

  const targetSlug = justPlayed?.targetMood || moods[0]?.slug || null;
  const targetMood: EmbedTargetMood | null = targetSlug ? { slug: targetSlug, name: nameOf(targetSlug) } : null;

  // Graph labels: scored dimensions first (so their nodes light up), then the
  // most-trained taxonomy skills to fill the remaining fixed node slots.
  const taxonomyNames = (pillar: 'cognition' | 'mood'): string[] =>
    [...(taxonomy?.dimensions.find((d) => d.pillar === pillar)?.skills ?? [])]
      .sort((a, b) => (b.gameCount ?? -1) - (a.gameCount ?? -1))
      .map((s) => s.name);

  const fillSlots = (scored: string[], pool: string[], slots: number): string[] => {
    const out = [...scored];
    for (const name of pool) {
      if (out.length >= slots) break;
      if (!out.includes(name)) out.push(name);
    }
    return out.slice(0, slots);
  };

  const scoredSkillNames = cognition.map((d) => nameOf(d.slug));
  const scoredMoodNames = moods.map((d) => nameOf(d.slug));

  const graph: EmbedGraphInput = {
    userSkills: fillSlots(scoredSkillNames, taxonomyNames('cognition'), graphSlots.skills),
    userMoods: fillSlots(scoredMoodNames, taxonomyNames('mood'), graphSlots.moods),
    hasScoreBySkill: Object.fromEntries(scoredSkillNames.map((n) => [n, true])),
    hasScoreByMood: Object.fromEntries(scoredMoodNames.map((n) => [n, true])),
  };

  return {
    userName: displayName(profile.user?.firstName),
    summaryText,
    momentumText,
    flowMedian,
    flowBest,
    stats: [
      { label: 'Flow', value: flowMedian ?? '—' },
      { label: 'Sessions', value: profile.totals?.sessions ?? 0 },
      { label: 'Played', value: formatPlayTime(profile.totals?.totalPlaySeconds ?? 0) },
    ],
    traits,
    targetMood,
    streakDays: summary?.streakDays ?? 0,
    graph,
  };
}
