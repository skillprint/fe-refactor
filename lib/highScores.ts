import type { LibraryGameLeaderboard } from './models/portal/LibraryGameLeaderboard';

export type HighScoreMilestoneId =
  | 'leaderboard-all'
  | 'leaderboard-week'
  | 'personal-all'
  | 'personal-week';

export interface HighScoreMilestone {
  id: HighScoreMilestoneId;
  label: string;
  period: 'all' | 'week';
  scope: 'leaderboard' | 'personal';
  previousBest: number;
  delta: number;
}

export interface HighScoreAchievement {
  /** The score achieved in this session. */
  score: number;
  /** Highest-priority milestone achieved, driving the headline and eyebrow. */
  primary: HighScoreMilestone;
  /** All milestones achieved in this run, in priority order. */
  milestones: HighScoreMilestone[];
  /** True when any all-time record (personal or leaderboard) was broken. */
  isAllTime: boolean;
  /** True when any weekly record (personal or leaderboard) was broken. */
  isWeekly: boolean;
  /** True when a #1 leaderboard record (weekly or all-time) was broken. */
  isLeaderboardTop: boolean;
  /** True when a personal best (weekly or all-time) was broken. */
  isPersonalBest: boolean;
  /** Eyebrow text (e.g. "New all-time record", "New weekly high score"). */
  eyebrow: string;
  /** Main headline (e.g. "New all-time high score!", "New weekly high score!"). */
  headline: string;
  /** Summary line explaining what previous score(s) were beaten. */
  summary: string;
  /** Pre-filled share text for ShareSheet. */
  shareText: string;
}

export interface HighScoreEvaluationInput {
  gameTitle: string;
  score?: number | null;
  sessionId?: string;
  /** Previous all-time personal best before this session (`session.previousBestScore` or personal stats). */
  previousPersonalAllTime?: number | null;
  /** From SessionDetail (`session.isPersonalBest`). */
  sessionIsPersonalBest?: boolean;
  /** Previous best score by this player in the last 7 days before this session. */
  previousPersonalWeek?: number | null;
  /** Previous #1 score on the all-time leaderboard before this session. */
  previousLeaderAllTime?: number | null;
  /** Previous #1 score on the weekly leaderboard before this session. */
  previousLeaderWeek?: number | null;
  /** Optional post-session all-time leaderboard. */
  postAllTimeBoard?: LibraryGameLeaderboard | null;
  /** Optional post-session weekly leaderboard. */
  postWeeklyBoard?: LibraryGameLeaderboard | null;
}

const STORAGE_KEY = 'skillprint:high-scores:v1';
const WEEK_MS = 7 * 86400000;

interface StoredRun {
  score: number;
  at: number;
  sessionId?: string;
}

interface StoredGameHighScores {
  allTimeBest: number;
  allTimeSessionId?: string;
  previousAllTimeBest?: number | null;
  weeklyRuns: StoredRun[];
}

type StoredHighScoreMap = Record<string, StoredGameHighScores>;

function positiveNumberOrNull(val: unknown): number | null {
  return typeof val === 'number' && Number.isFinite(val) && val > 0 ? val : null;
}

export function formatHighScore(score: number): string {
  return score.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/**
 * Extracts the pre-session personal best and #1 leaderboard score from a
 * `LibraryGameLeaderboard` response, accounting for whether `currentSessionId`
 * has already been recorded onto the board.
 */
export function extractLeaderboardBaseline(
  board: LibraryGameLeaderboard | null | undefined,
  currentSessionId?: string,
): { personalBest: number | null; leaderTopScore: number | null } {
  if (!board) {
    return { personalBest: null, leaderTopScore: null };
  }

  let personalBest: number | null = null;
  if (board.you && (!currentSessionId || board.you.sessionId !== currentSessionId)) {
    personalBest = positiveNumberOrNull(board.you.score);
  }

  let leaderTopScore: number | null = null;
  if (Array.isArray(board.entries) && board.entries.length > 0) {
    const first = board.entries[0];
    const firstIsCurrentSession =
      Boolean(first.isYou) && Boolean(currentSessionId) && board.you?.sessionId === currentSessionId;
    if (firstIsCurrentSession) {
      const runnerUp = board.entries.find((e) => !e.isYou);
      leaderTopScore = positiveNumberOrNull(runnerUp?.score);
    } else {
      leaderTopScore = positiveNumberOrNull(first.score);
    }
  }

  return { personalBest, leaderTopScore };
}

/**
 * Evaluates whether a completed play session achieved a new high score for the
 * week or all time (personal best and/or #1 on the game's leaderboard).
 */
export function evaluateHighScoreAchievement(
  input: HighScoreEvaluationInput,
): HighScoreAchievement | null {
  const score = positiveNumberOrNull(input.score);
  if (score === null) return null;

  const postAllBaseline = extractLeaderboardBaseline(input.postAllTimeBoard, input.sessionId);
  const postWeekBaseline = extractLeaderboardBaseline(input.postWeeklyBoard, input.sessionId);

  const prevLeaderAll =
    positiveNumberOrNull(input.previousLeaderAllTime) ?? postAllBaseline.leaderTopScore;
  const prevLeaderWeek =
    positiveNumberOrNull(input.previousLeaderWeek) ?? postWeekBaseline.leaderTopScore;
  const prevPersonalAll =
    positiveNumberOrNull(input.previousPersonalAllTime) ?? postAllBaseline.personalBest;
  const prevPersonalWeek =
    positiveNumberOrNull(input.previousPersonalWeek) ?? postWeekBaseline.personalBest;

  const milestones: HighScoreMilestone[] = [];

  if (prevLeaderAll !== null && score > prevLeaderAll) {
    milestones.push({
      id: 'leaderboard-all',
      label: '#1 All-Time Leaderboard',
      period: 'all',
      scope: 'leaderboard',
      previousBest: prevLeaderAll,
      delta: score - prevLeaderAll,
    });
  }

  if (prevLeaderWeek !== null && score > prevLeaderWeek) {
    milestones.push({
      id: 'leaderboard-week',
      label: '#1 Weekly Leaderboard',
      period: 'week',
      scope: 'leaderboard',
      previousBest: prevLeaderWeek,
      delta: score - prevLeaderWeek,
    });
  }

  if (prevPersonalAll !== null && score > prevPersonalAll) {
    milestones.push({
      id: 'personal-all',
      label: 'All-time personal best',
      period: 'all',
      scope: 'personal',
      previousBest: prevPersonalAll,
      delta: score - prevPersonalAll,
    });
  }

  if (prevPersonalWeek !== null && score > prevPersonalWeek) {
    milestones.push({
      id: 'personal-week',
      label: 'Weekly personal best',
      period: 'week',
      scope: 'personal',
      previousBest: prevPersonalWeek,
      delta: score - prevPersonalWeek,
    });
  }

  if (milestones.length === 0) return null;

  const primary = milestones[0];
  const isAllTime = milestones.some((m) => m.period === 'all');
  const isWeekly = milestones.some((m) => m.period === 'week');
  const isLeaderboardTop = milestones.some((m) => m.scope === 'leaderboard');
  const isPersonalBest = milestones.some((m) => m.scope === 'personal');

  let eyebrow: string;
  let headline: string;
  let summary: string;
  let shareText: string;

  const formattedScore = formatHighScore(score);
  const formattedDelta = `+${formatHighScore(primary.delta)}`;
  const formattedPrev = formatHighScore(primary.previousBest);

  switch (primary.id) {
    case 'leaderboard-all': {
      eyebrow = 'New all-time record';
      headline = 'New all-time high score!';
      const personalMilestone = milestones.find((m) => m.id === 'personal-all');
      summary =
        personalMilestone && personalMilestone.previousBest !== primary.previousBest
          ? `${formattedDelta} over the #1 all-time score of ${formattedPrev} on ${input.gameTitle} (+${formatHighScore(personalMilestone.delta)} on your personal best).`
          : `${formattedDelta} over the #1 all-time leaderboard score of ${formattedPrev} on ${input.gameTitle}.`;
      shareText = `I just set a new #1 all-time high score of ${formattedScore} in ${input.gameTitle} on Skillprint! Think you can beat it?`;
      break;
    }
    case 'leaderboard-week': {
      eyebrow = isAllTime ? 'New all-time & weekly record' : 'New weekly record';
      headline = isAllTime ? 'New all-time high score!' : 'New weekly high score!';
      const personalAllMilestone = milestones.find((m) => m.id === 'personal-all');
      summary = personalAllMilestone
        ? `#1 on ${input.gameTitle} this week (${formattedDelta} over ${formattedPrev}) and +${formatHighScore(personalAllMilestone.delta)} on your all-time personal best of ${formatHighScore(personalAllMilestone.previousBest)}.`
        : `${formattedDelta} over this week's #1 leaderboard score of ${formattedPrev} on ${input.gameTitle}.`;
      shareText = `I just set this week's #1 high score of ${formattedScore} in ${input.gameTitle} on Skillprint! Think you can beat it?`;
      break;
    }
    case 'personal-all': {
      eyebrow = isWeekly ? 'New all-time & weekly best' : 'New all-time personal best';
      headline = 'New all-time high score!';
      summary = `${formattedDelta} on your previous all-time best of ${formattedPrev} in ${input.gameTitle}.`;
      shareText = `I just set a new all-time high score of ${formattedScore} in ${input.gameTitle} on Skillprint! Think you can beat it?`;
      break;
    }
    case 'personal-week': {
      eyebrow = 'New weekly personal best';
      headline = 'New high score this week!';
      summary = `${formattedDelta} on your previous best this week of ${formattedPrev} in ${input.gameTitle}.`;
      shareText = `I just set a new weekly high score of ${formattedScore} in ${input.gameTitle} on Skillprint! Think you can beat it?`;
      break;
    }
  }

  return {
    score,
    primary,
    milestones,
    isAllTime,
    isWeekly,
    isLeaderboardTop,
    isPersonalBest,
    eyebrow,
    headline,
    summary,
    shareText,
  };
}

function readStore(): StoredHighScoreMap {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: StoredHighScoreMap): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage quota or private mode errors
  }
}

/**
 * Reads the locally cached all-time and weekly best scores for `gameSlug`,
 * excluding `excludeSessionId` so the current session is never compared
 * against itself.
 */
export function getStoredGameHighScores(
  gameSlug: string,
  excludeSessionId?: string,
  nowMs: number = Date.now(),
): { allTimeBest: number | null; weeklyBest: number | null } {
  const key = (gameSlug || '').trim().toLowerCase();
  if (!key) return { allTimeBest: null, weeklyBest: null };

  const store = readStore();
  const entry = store[key];
  if (!entry) return { allTimeBest: null, weeklyBest: null };

  const cutoff = nowMs - WEEK_MS;
  const validWeeklyRuns = Array.isArray(entry.weeklyRuns)
    ? entry.weeklyRuns.filter(
        (r) =>
          typeof r?.score === 'number' &&
          r.score > 0 &&
          typeof r?.at === 'number' &&
          r.at >= cutoff &&
          (!excludeSessionId || r.sessionId !== excludeSessionId),
      )
    : [];

  const weeklyBest =
    validWeeklyRuns.length > 0 ? Math.max(...validWeeklyRuns.map((r) => r.score)) : null;

  const allTimeBest =
    excludeSessionId && entry.allTimeSessionId === excludeSessionId
      ? positiveNumberOrNull(entry.previousAllTimeBest)
      : positiveNumberOrNull(entry.allTimeBest);

  return { allTimeBest, weeklyBest };
}

/**
 * Records a completed session's score into local storage so subsequent sessions
 * in the same week or all time have an immediate baseline even when offline or
 * before the leaderboard endpoint updates.
 */
export function recordStoredGameScore(
  gameSlug: string,
  score: number,
  sessionId?: string,
  nowMs: number = Date.now(),
): void {
  const validScore = positiveNumberOrNull(score);
  const key = (gameSlug || '').trim().toLowerCase();
  if (!key || validScore === null) return;

  const store = readStore();
  const existing = store[key] || { allTimeBest: 0, weeklyRuns: [] };
  const cutoff = nowMs - WEEK_MS;

  const filteredRuns = Array.isArray(existing.weeklyRuns)
    ? existing.weeklyRuns.filter(
        (r) =>
          typeof r?.score === 'number' &&
          r.score > 0 &&
          typeof r?.at === 'number' &&
          r.at >= cutoff &&
          (!sessionId || r.sessionId !== sessionId),
      )
    : [];

  filteredRuns.push({ score: validScore, at: nowMs, ...(sessionId ? { sessionId } : {}) });

  const prevAllTime =
    sessionId && existing.allTimeSessionId === sessionId
      ? positiveNumberOrNull(existing.previousAllTimeBest) ?? 0
      : positiveNumberOrNull(existing.allTimeBest) ?? 0;

  if (validScore > prevAllTime) {
    store[key] = {
      allTimeBest: validScore,
      ...(sessionId ? { allTimeSessionId: sessionId } : {}),
      previousAllTimeBest: prevAllTime > 0 ? prevAllTime : null,
      weeklyRuns: filteredRuns.slice(-50),
    };
  } else {
    store[key] = {
      ...existing,
      allTimeBest: Math.max(prevAllTime, validScore),
      weeklyRuns: filteredRuns.slice(-50),
    };
  }

  writeStore(store);
}
