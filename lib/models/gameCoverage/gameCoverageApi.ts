import { BASE_URL } from '../../../app/api/api';

/**
 * Game coverage on the marketplace backend (`game_coverage` app): the coverage
 * ranking sheet (2026-09-14) made live. Ranks games by how well they cover the
 * 14 cognition skills, 9 moods and 5 OCEAN traits, weighted towards rare ones,
 * plus how ready each is to ship. Internal: a Knox token for verified
 * skillprint.co staff (reads and assessments) or a `game_review` key (reads).
 *
 * camelCase on the wire; dimension slugs (`pattern-matching`) are keys as-is.
 */
const COVERAGE_URL = `${BASE_URL}api/game-coverage/`;

export type Pool = 'listed' | 'playable' | 'all';
export type CoveragePillar = 'cognition' | 'mood' | 'personality';
export type StrengthSource = 'assessed' | 'tags' | 'none';

export interface Weights {
  cognition: number;
  mood: number;
  personality: number;
  scarcityCap: number;
  coverage: number;
  readiness: number;
  tagStrength: number;
  playable: number;
  listed: number;
  unlisted: number;
  adaptive: number;
  scored: number;
}

export type WeightName = keyof Weights;

/** The weights the page lets staff try, grouped as on the sheet's Weights tab. */
export const WEIGHT_GROUPS: { title: string; fields: { name: WeightName; label: string; hint: string; max: number; step: number }[] }[] = [
  {
    title: 'Pillars',
    fields: [
      { name: 'cognition', label: 'Cognition', hint: 'Multiplier on every cognition skill', max: 10, step: 0.1 },
      { name: 'mood', label: 'Mood', hint: 'Multiplier on every mood', max: 10, step: 0.1 },
      { name: 'personality', label: 'Personality', hint: 'Traits are derived, not tagged, so they count for less', max: 10, step: 0.1 },
    ],
  },
  {
    title: 'Scoring',
    fields: [
      { name: 'scarcityCap', label: 'Scarcity cap', hint: 'So an all-but-empty dimension cannot dominate', max: 100, step: 0.5 },
      { name: 'coverage', label: 'Coverage weight', hint: 'Weight of coverage in the total', max: 10, step: 0.1 },
      { name: 'readiness', label: 'Readiness weight', hint: 'Weight of readiness in the total', max: 10, step: 0.1 },
      { name: 'tagStrength', label: 'Tag strength', hint: 'What a backend tag counts for in a game nobody has assessed (0-3)', max: 3, step: 1 },
    ],
  },
  {
    title: 'Readiness points',
    fields: [
      { name: 'playable', label: 'Playable', hint: 'Plays from the games CDN or an uploaded build', max: 10, step: 0.5 },
      { name: 'listed', label: 'Listed', hint: 'Released and publicly listed', max: 10, step: 0.5 },
      { name: 'unlisted', label: 'Registered, unlisted', hint: 'In review, or not listed', max: 10, step: 0.5 },
      { name: 'adaptive', label: 'Adaptive', hint: 'Scoring config with adjustable parameters, enabled', max: 10, step: 0.5 },
      { name: 'scored', label: 'Scored', hint: 'At least one session the pipeline processed', max: 10, step: 0.5 },
    ],
  },
];

export const WEIGHT_NAMES: WeightName[] = WEIGHT_GROUPS.flatMap((g) => g.fields.map((f) => f.name));

export interface CoverageDimension {
  slug: string;
  name: string;
  description: string;
  pillar: CoveragePillar;
  /** Sum of the pool's strengths in this dimension. */
  coverage: number;
  /** Games in the pool rating it 3. */
  primaryCount: number;
  /** Games in the pool carrying the backend tag; null for traits, which have none. */
  taggedCount: number | null;
  scarcity: number;
  effectiveWeight: number;
}

export interface Assessment {
  /** 0-3 per skill and mood slug; missing = 0. */
  strengths: Record<string, number>;
  social: number;
  notes: string;
  updatedAt: string;
  /** Null when seeded from the coverage sheet. */
  updatedBy: string | null;
}

export interface Readiness {
  total: number;
  playable: number;
  listed: number;
  adaptive: number;
  scored: number;
}

export interface CoverageGame {
  slug: string;
  name: string;
  thumbnail: string | null;
  url: string | null;
  reviewStatus: string;
  isPubliclyListed: boolean;
  isActive: boolean;
  skills: string[];
  moods: string[];
  source: StrengthSource;
  assessment: Assessment | null;
  /** All 28 strengths, traits derived from moods and social play. */
  strengths: Record<string, number>;
  primaryDimensions: string[];
  coverage: number;
  readiness: Readiness;
  total: number;
  rank: number;
  greedyPick: number | null;
  greedyAdds: string[];
}

export interface CoverageReport {
  pool: Pool;
  pools: { key: Pool; label: string }[];
  weights: Weights;
  defaultWeights: Weights;
  dimensions: CoverageDimension[];
  moodTraitSignal: Record<string, Record<string, number>>;
  socialTraitWeights: Record<string, number>;
  greedy: { pick: number; slug: string; adds: string[] }[];
  games: CoverageGame[];
}

export interface AssessmentInput {
  strengths: Record<string, number>;
  social: number;
  notes: string;
}

export class GameCoverageApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }

  /** Signed out, or signed in but not Skillprint staff. */
  get isForbidden() {
    return this.status === 401 || this.status === 403;
  }
}

function describeError(body: unknown): string {
  if (body == null) return '';
  if (typeof body === 'string') return body;
  if (Array.isArray(body)) return body.map(describeError).filter(Boolean).join(' ');
  if (typeof body === 'object') {
    const record = body as Record<string, unknown>;
    if (typeof record.detail === 'string') return record.detail;
    return Object.entries(record)
      .map(([field, errors]) => {
        const text = describeError(errors);
        return text ? `${field}: ${text}` : '';
      })
      .filter(Boolean)
      .join('; ');
  }
  return String(body);
}

async function request<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string> | undefined), Authorization: `Token ${token}` };
  const response = await fetch(`${COVERAGE_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new GameCoverageApiError(response.status, describeError(body) || `Request failed (${response.status})`);
  }
  return (response.status === 204 ? null : await response.json()) as T;
}

export const gameCoverageApi = {
  /** `weights` holds only the overrides; the backend fills in the rest. */
  report: (token: string, pool: Pool, weights: Partial<Weights> = {}) => {
    const params = new URLSearchParams({ pool });
    for (const [name, value] of Object.entries(weights)) {
      if (value !== undefined) params.set(name, String(value));
    }
    return request<CoverageReport>(`?${params}`, token);
  },
  assess: (slug: string, token: string, assessment: AssessmentInput) =>
    request<Assessment>(`games/${encodeURIComponent(slug)}/assessment/`, token, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessment),
    }),
  /** Back to ranking the game on its backend tags. */
  clearAssessment: (slug: string, token: string) =>
    request<null>(`games/${encodeURIComponent(slug)}/assessment/`, token, { method: 'DELETE' }),
};
