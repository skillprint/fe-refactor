import type { Pillar } from '../../skillIcons';

/** `GET /api/portal/playbooks/` and `/playbooks/{slug}/` (SKI-129). */

export type PlaybookSource = 'authored' | 'generated';

export interface PlaybookProgress {
  totalGames: number;
  playedGames: number;
  percent: number;
}

export interface PlaybookSummary {
  slug: string;
  title: string;
  description: string;
  source: PlaybookSource;
  pillar: Pillar;
  dimension: string | null;
  /** Player's score for `dimension`; null (never 0) when unmeasured. */
  currentScore: number | null;
  gameCount: number;
  progress: PlaybookProgress;
  /** Presentation copy; null on generated playbooks. */
  tone: string | null;
  icon: string | null;
  target: string | null;
  estTime: string | null;
}

export interface PlaybookGame {
  id: number;
  slug: string;
  title: string;
  image: string | null;
  description: string;
  estimatedDurationSeconds: number | null;
  difficulty: string | null;
  targetedSkills: string[];
}

export interface PlaybookTargetSkill {
  slug: string;
  name: string;
  description: string;
  pillar: Pillar;
  icon: string;
  category: string | null;
}

export interface PlaybookDetail extends Omit<PlaybookSummary, 'gameCount' | 'currentScore'> {
  games: PlaybookGame[];
  targetSkills: PlaybookTargetSkill[];
  howItWorks: string | null;
  currentScore?: number | null;
}

export interface PlaybookListResponse {
  playbooks: PlaybookSummary[];
}

const GENERATED_SLUG = /^(mood|cognition|personality)-[a-z0-9-]+$/;

/**
 * Fill in fields a backend without authored playbooks (pre SKI-137) does not
 * send: `source` is inferred from the `{pillar}-{dimension}` slug, and the
 * presentation fields default to null so generated playbooks render the same
 * whichever backend answered.
 */
export function normalizePlaybookSummary<T extends Partial<PlaybookSummary> & { slug: string }>(raw: T): T & PlaybookSummary {
  const generated = raw.source === 'generated' || (!raw.source && GENERATED_SLUG.test(raw.slug));
  const progress = raw.progress || { totalGames: raw.gameCount ?? 0, playedGames: 0, percent: 0 };
  return {
    ...raw,
    title: raw.title || raw.slug,
    description: raw.description || '',
    source: generated ? 'generated' : 'authored',
    pillar: (raw.pillar || 'cognition') as Pillar,
    dimension: raw.dimension ?? null,
    currentScore: raw.currentScore ?? null,
    gameCount: raw.gameCount ?? progress.totalGames ?? 0,
    progress,
    tone: raw.tone ?? null,
    icon: raw.icon ?? null,
    target: raw.target ?? null,
    estTime: raw.estTime ?? null,
  };
}

export function normalizePlaybookDetail(raw: Partial<PlaybookDetail> & { slug: string }): PlaybookDetail {
  const base = normalizePlaybookSummary(raw as any);
  return {
    ...base,
    games: raw.games || [],
    targetSkills: raw.targetSkills || [],
    howItWorks: raw.howItWorks ?? null,
  };
}

export const generateMockPlaybookList = (): PlaybookListResponse => ({
  playbooks: [
    {
      slug: 'deep-focus-routine', title: 'Deep Focus Routine', description: 'Sharpen attention and cut distractions.',
      source: 'authored', pillar: 'cognition', dimension: 'attention', currentScore: 62, gameCount: 3,
      progress: { totalGames: 3, playedGames: 1, percent: 33 },
      tone: 'tone--pink', icon: 'playbook-focus', target: 'Attention', estTime: '11–21 min',
    },
    {
      slug: 'cognition-memory', title: 'Improve Memory', description: 'Holding things in mind.',
      source: 'generated', pillar: 'cognition', dimension: 'memory', currentScore: 20, gameCount: 2,
      progress: { totalGames: 2, playedGames: 1, percent: 50 },
      tone: null, icon: null, target: null, estTime: null,
    },
  ],
});

export const generateMockPlaybookDetail = (slug: string = 'deep-focus-routine'): PlaybookDetail => ({
  slug, title: 'Deep Focus Routine', description: 'Sharpen attention and cut distractions.',
  source: 'authored', pillar: 'cognition', dimension: 'attention',
  games: [
    { id: 42, slug: 'whack-em-all', title: "Whack 'em All", image: '/skillprint-portal-redesign/assets/images/games/game-mole.svg', description: 'Hit the moles.', estimatedDurationSeconds: 300, difficulty: 'moderate', targetedSkills: ['attention'] },
    { id: 43, slug: 'hidden-objects', title: 'Hidden Objects', image: '/skillprint-portal-redesign/assets/images/games/game-hide.svg', description: 'Find hidden objects in the image.', estimatedDurationSeconds: 420, difficulty: 'moderate', targetedSkills: ['attention'] },
  ],
  targetSkills: [
    { slug: 'attention', name: 'Attention', description: 'Holding one target.', pillar: 'cognition', icon: '', category: 'Attention' },
    { slug: 'focus', name: 'Focus', description: 'Locked in.', pillar: 'mood', icon: '', category: null },
  ],
  progress: { totalGames: 2, playedGames: 1, percent: 50 },
  howItWorks: 'Play the games in order, in one sitting or across a week.',
  tone: 'tone--pink', icon: 'playbook-focus', target: 'Attention', estTime: '11–21 min',
});
