import { reviewStatusLabel } from '../../lib/models/gameReview/gameReviewApi';
import type { CoverageDimension, CoverageGame, CoverageReport, Pool, Weights } from '../../lib/models/gameCoverage/gameCoverageApi';
import { WEIGHT_NAMES } from '../../lib/models/gameCoverage/gameCoverageApi';

export const POOLS: { key: Pool; label: string }[] = [
  { key: 'listed', label: 'Listed' },
  { key: 'playable', label: 'Playable' },
  { key: 'all', label: 'All records' },
];

export const DEFAULT_POOL: Pool = 'playable';
/** Strength a dimension needs across the portfolio to count as covered. */
export const TARGET = 3;

export function readPool(value: string | null): Pool {
  return POOLS.some((p) => p.key === value) ? (value as Pool) : DEFAULT_POOL;
}

/** The weight overrides in the page's URL. */
export function readOverrides(params: URLSearchParams): Partial<Weights> {
  const overrides: Partial<Weights> = {};
  for (const name of WEIGHT_NAMES) {
    const raw = params.get(name);
    if (raw === null || raw.trim() === '') continue;
    const value = Number(raw);
    if (Number.isFinite(value)) overrides[name] = value;
  }
  return overrides;
}

export function formatNumber(value: number, digits = 1): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(digits);
}

export type GameTone = 'listed' | 'unlisted' | 'review' | 'rejected' | 'unplayable';

/** Where a game stands, in one word, for its pill. */
export function gameStatus(game: CoverageGame): { label: string; tone: GameTone } {
  if (game.reviewStatus === 'rejected') return { label: 'Rejected', tone: 'rejected' };
  if (game.reviewStatus === 'in_review' || game.reviewStatus === 'changes_requested') {
    return { label: reviewStatusLabel(game.reviewStatus), tone: 'review' };
  }
  if (!game.url) return { label: 'Not playable', tone: 'unplayable' };
  return game.isPubliclyListed ? { label: 'Listed', tone: 'listed' } : { label: 'Unlisted', tone: 'unlisted' };
}

export function readinessSummary(game: CoverageGame): string {
  const r = game.readiness;
  return `Playable ${r.playable} · Listed ${r.listed} · Adaptive ${r.adaptive} · Scored ${r.scored}`;
}

export function dimensionMap(report: CoverageReport): Record<string, CoverageDimension> {
  return Object.fromEntries(report.dimensions.map((d) => [d.slug, d]));
}

/**
 * The trait strengths the backend would derive from these mood strengths and
 * social rating (game_coverage/engine.py trait_strengths), for a live preview
 * while assessing. The report's signal matrix is rounded, so this is close,
 * not exact; the saved report is the source of truth.
 */
export function previewTraits(report: CoverageReport, strengths: Record<string, number>, social: number): Record<string, number> {
  const moods = report.dimensions.filter((d) => d.pillar === 'mood').map((d) => d.slug);
  const total = moods.reduce((sum, m) => sum + (strengths[m] || 0), 0);
  const traits: Record<string, number> = {};
  for (const [trait, signal] of Object.entries(report.moodTraitSignal)) {
    const base = total === 0 ? 0 : (3 * moods.reduce((sum, m) => sum + (strengths[m] || 0) * (signal[m] || 0), 0)) / total;
    traits[trait] = Math.min(3, base + social * (report.socialTraitWeights[trait] || 0));
  }
  return traits;
}
