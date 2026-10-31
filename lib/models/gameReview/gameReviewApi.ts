import { BASE_URL } from '../../../app/api/api';

/**
 * Game review on the marketplace backend (`game_reviews` app, marketplace #155):
 * a game created through the API starts in review, unlisted, until Skillprint
 * staff release it. Internal: a Knox token for an account with a verified
 * skillprint.co address, or a partner key with the `game_review` scope (agents).
 * Anyone else gets 401/403, which is how the portal tells staff apart.
 *
 * camelCase on the wire, except parameter definitions, whose keys are the
 * game's own ADJUST_GAME names.
 */
const REVIEW_URL = `${BASE_URL}api/game-reviews/`;

export type ReviewStatus = 'in_review' | 'changes_requested' | 'released' | 'rejected';
export type Recommendation = 'release' | 'request_changes' | 'reject';
export type DecisionAction = 'release' | 'request_changes' | 'reject' | 'unrelease' | 'resubmit';
export type ReviewerKind = 'human' | 'agent';
export type FeedbackStatus = 'open' | 'addressed' | 'dismissed';

export const REVIEW_STATUSES: { status: ReviewStatus; label: string }[] = [
  { status: 'in_review', label: 'In review' },
  { status: 'changes_requested', label: 'Changes requested' },
  { status: 'released', label: 'Released' },
  { status: 'rejected', label: 'Rejected' },
];

export const reviewStatusLabel = (status: string) =>
  REVIEW_STATUSES.find((s) => s.status === status)?.label ?? status.replace(/_/g, ' ');

export const RECOMMENDATIONS: { value: Recommendation; label: string }[] = [
  { value: 'release', label: 'Release' },
  { value: 'request_changes', label: 'Request changes' },
  { value: 'reject', label: 'Reject' },
];

/**
 * The decisions, and the statuses each applies to: a copy of the backend's
 * `game_reviews/lifecycle.py` TRANSITIONS, used only to choose which buttons to
 * show. The backend still decides, and answers 409 when one doesn't apply.
 */
export const DECISIONS: { action: DecisionAction; label: string; from: ReviewStatus[] }[] = [
  { action: 'release', label: 'Release', from: ['in_review', 'changes_requested', 'rejected'] },
  { action: 'request_changes', label: 'Request changes', from: ['in_review'] },
  { action: 'reject', label: 'Reject', from: ['in_review', 'changes_requested'] },
  { action: 'resubmit', label: 'Resubmit for review', from: ['changes_requested', 'rejected'] },
  { action: 'unrelease', label: 'Pull back into review', from: ['released'] },
];

export interface ReviewQuestion {
  key: string;
  prompt: string;
  helpText: string;
  required: boolean;
  position: number;
}

export interface ReviewStats {
  count: number;
  human: number;
  agent: number;
  openFeedback: number;
  avgTargetFit: number | null;
  avgAdjustmentFit: number | null;
  lastReviewedAt: string | null;
}

export interface ReviewGameSummary {
  slug: string;
  name: string;
  shortDescription: string;
  reviewStatus: ReviewStatus;
  reviewStatusChangedAt: string | null;
  skills: string[];
  moods: string[];
  thumbnail: string | null;
  /** Where the game plays (the games CDN), when the record has it. */
  url: string | null;
  reviews: ReviewStats;
}

export interface ReviewDecision {
  action: string;
  fromStatus: string;
  toStatus: string;
  by: { kind: 'human'; email: string } | { kind: 'agent'; name: string } | null;
  note: string;
  createdAt: string;
}

export interface ReviewRecentSession {
  sessionId: string;
  atCreated: string;
  state: string;
  targetMood: string | null;
  score: number | null;
  adjustmentCount: number;
}

export interface TargetRating {
  kind: 'mood' | 'skill';
  slug: string;
  rating: number;
  note?: string;
}

export interface GameReview {
  id: string;
  game: string;
  reviewer: { kind: ReviewerKind; name: string; email?: string; model?: string };
  targetFitRating: number;
  adjustmentFitRating: number;
  targetRatings: TargetRating[];
  answers: { key: string; prompt: string; answer: string }[];
  recommendation: Recommendation;
  summary: string;
  buildRef: string;
  gameReviewStatus: string;
  sessionIds: string[];
  status: FeedbackStatus;
  resolution: { note: string; url: string; at: string; by: string } | null;
  createdAt: string;
  updatedAt: string;
}

/** One game: the queue row (its `reviews` stats included) and everything about it. */
export interface ReviewGameDetail extends ReviewGameSummary {
  longDescription: string;
  instructions: string;
  isActive: boolean;
  isPubliclyListed: boolean;
  isPlayableInPwa: boolean;
  listOnRelease: boolean;
  organization: { slug: string; name: string } | null;
  scoringConfig: {
    /** Keyed by the game's ADJUST_GAME parameter names, verbatim. */
    parameterDefinitions: unknown;
    adjustmentInstructions: string;
    skillAdjustmentInstructions: string;
  } | null;
  decisions: ReviewDecision[];
  recentSessions: ReviewRecentSession[];
  /** The 50 newest reviews. */
  latestReviews: GameReview[];
}

export interface NewGameReview {
  targetFitRating: number;
  adjustmentFitRating: number;
  targetRatings: TargetRating[];
  answers: { key: string; answer: string }[];
  recommendation: Recommendation;
  summary: string;
  buildRef: string;
  sessionIds: string[];
}

export class GameReviewApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }

  /** Signed out, or signed in but not Skillprint staff. */
  get isForbidden() {
    return this.status === 401 || this.status === 403;
  }
}

/** A DRF error body as one readable line: `detail`, or each field's messages (nested ones too). */
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
        if (!text) return '';
        return field === 'nonFieldErrors' ? text : `${field}: ${text}`;
      })
      .filter(Boolean)
      .join('; ');
  }
  return String(body);
}

async function request<T>(path: string, token: string | null | undefined, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string> | undefined) };
  if (token) headers.Authorization = `Token ${token}`;
  const response = await fetch(`${REVIEW_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new GameReviewApiError(response.status, describeError(body) || `Request failed (${response.status})`);
  }
  return (await response.json()) as T;
}

const post = <T>(path: string, token: string, body: unknown) =>
  request<T>(path, token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const gameReviewApi = {
  questions: (token: string) => request<{ results: ReviewQuestion[] }>('questions/', token),
  /** The queue, oldest waiting first. */
  games: (token: string, statuses: ReviewStatus[]) =>
    request<{ count: number; results: ReviewGameSummary[] }>(`games/?status=${statuses.join(',')}`, token),
  game: (slug: string, token: string) =>
    request<ReviewGameDetail>(`games/${encodeURIComponent(slug)}/`, token),
  fileReview: (slug: string, token: string, review: NewGameReview) =>
    post<GameReview>(`games/${encodeURIComponent(slug)}/reviews/`, token, review),
  decide: (slug: string, token: string, action: DecisionAction, note: string) =>
    post<ReviewGameSummary & { isActive: boolean; isPubliclyListed: boolean; decision: ReviewDecision }>(
      `games/${encodeURIComponent(slug)}/decision/`, token, { action, note },
    ),
};

// One check per token per page load: the sidebar asks on every page.
const accessChecks = new Map<string, Promise<boolean>>();

/** True when the token belongs to Skillprint staff (the backend decides). False on any failure. */
export function isGameReviewer(token: string): Promise<boolean> {
  let check = accessChecks.get(token);
  if (!check) {
    check = gameReviewApi.questions(token).then(() => true, () => false);
    accessChecks.set(token, check);
  }
  return check;
}
