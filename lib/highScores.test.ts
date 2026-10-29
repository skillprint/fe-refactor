import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateHighScoreAchievement,
  extractLeaderboardBaseline,
  getStoredGameHighScores,
  recordStoredGameScore,
} from './highScores';
import type { LibraryGameLeaderboard } from './models/portal/LibraryGameLeaderboard';

test('returns null when score is missing, zero, or not higher than any baseline', () => {
  assert.equal(evaluateHighScoreAchievement({ gameTitle: 'Hextris', score: undefined }), null);
  assert.equal(evaluateHighScoreAchievement({ gameTitle: 'Hextris', score: 0, previousPersonalAllTime: 500 }), null);
  assert.equal(
    evaluateHighScoreAchievement({
      gameTitle: 'Hextris',
      score: 1200,
      previousPersonalAllTime: 1500,
      previousPersonalWeek: 1300,
      previousLeaderAllTime: 4000,
      previousLeaderWeek: 2000,
    }),
    null,
  );
  // First ever run with no prior personal or leaderboard baseline sets the initial baseline
  assert.equal(
    evaluateHighScoreAchievement({
      gameTitle: 'Hextris',
      score: 1200,
      previousPersonalAllTime: null,
      previousPersonalWeek: null,
    }),
    null,
  );
});

test('detects a new weekly personal best when all-time personal best is higher', () => {
  const res = evaluateHighScoreAchievement({
    gameTitle: 'Hextris',
    score: 3600,
    previousPersonalAllTime: 4820,
    previousPersonalWeek: 3100,
  });

  assert.ok(res);
  assert.equal(res.primary.id, 'personal-week');
  assert.equal(res.isWeekly, true);
  assert.equal(res.isAllTime, false);
  assert.equal(res.isPersonalBest, true);
  assert.equal(res.isLeaderboardTop, false);
  assert.equal(res.primary.delta, 500);
  assert.match(res.headline, /week/i);
  assert.match(res.summary, /\+500/);
  assert.match(res.summary, /3,100/);
});

test('detects a new all-time personal best (and weekly personal best when applicable)', () => {
  const res = evaluateHighScoreAchievement({
    gameTitle: 'Hextris',
    score: 4120,
    previousPersonalAllTime: 3421,
    previousPersonalWeek: 3000,
  });

  assert.ok(res);
  assert.equal(res.primary.id, 'personal-all');
  assert.equal(res.isAllTime, true);
  assert.equal(res.isWeekly, true);
  assert.equal(res.milestones.length, 2);
  assert.equal(res.milestones[0].id, 'personal-all');
  assert.equal(res.milestones[1].id, 'personal-week');
  assert.equal(res.primary.delta, 699);
  assert.match(res.headline, /all-time high score/i);
  assert.match(res.summary, /\+699/);
});

test('detects a #1 weekly leaderboard high score', () => {
  const res = evaluateHighScoreAchievement({
    gameTitle: 'Box Tower',
    score: 3500,
    previousPersonalAllTime: 4000,
    previousPersonalWeek: 2800,
    previousLeaderAllTime: 5200,
    previousLeaderWeek: 3200,
  });

  assert.ok(res);
  assert.equal(res.primary.id, 'leaderboard-week');
  assert.equal(res.isLeaderboardTop, true);
  assert.equal(res.isWeekly, true);
  assert.equal(res.isAllTime, false);
  assert.equal(res.primary.delta, 300);
  assert.match(res.summary, /3,200/);
});

test('detects a #1 all-time leaderboard high score as highest priority', () => {
  const res = evaluateHighScoreAchievement({
    gameTitle: 'Hextris',
    score: 5000,
    previousPersonalAllTime: 4500,
    previousPersonalWeek: 4100,
    previousLeaderAllTime: 4820,
    previousLeaderWeek: 4200,
  });

  assert.ok(res);
  assert.equal(res.primary.id, 'leaderboard-all');
  assert.equal(res.isLeaderboardTop, true);
  assert.equal(res.isAllTime, true);
  assert.equal(res.isWeekly, true);
  assert.equal(res.milestones.length, 4);
  assert.equal(res.primary.delta, 180);
});

test('extractLeaderboardBaseline handles both pre-session and post-session boards', () => {
  const preBoard: LibraryGameLeaderboard = {
    gameSlug: 'hextris',
    period: 'week',
    totalPlayers: 5,
    entries: [
      { rank: 1, userDisplay: 'Player 1', score: 3200, achievedAt: '2026-10-28T00:00:00Z', isYou: false },
      { rank: 2, userDisplay: 'You', score: 2900, achievedAt: '2026-10-27T00:00:00Z', isYou: true },
    ],
    you: { rank: 2, score: 2900, achievedAt: '2026-10-27T00:00:00Z', sessionId: 'older-session' },
  };

  assert.deepEqual(extractLeaderboardBaseline(preBoard, 'current-session'), {
    personalBest: 2900,
    leaderTopScore: 3200,
  });

  // Post-session board where the player's current session already took #1:
  const postBoard: LibraryGameLeaderboard = {
    gameSlug: 'hextris',
    period: 'week',
    totalPlayers: 5,
    entries: [
      { rank: 1, userDisplay: 'You', score: 3500, achievedAt: '2026-10-29T00:00:00Z', isYou: true },
      { rank: 2, userDisplay: 'Player 1', score: 3200, achievedAt: '2026-10-28T00:00:00Z', isYou: false },
    ],
    you: { rank: 1, score: 3500, achievedAt: '2026-10-29T00:00:00Z', sessionId: 'current-session' },
  };

  assert.deepEqual(extractLeaderboardBaseline(postBoard, 'current-session'), {
    personalBest: null,
    leaderTopScore: 3200,
  });
});

test('localStorage helpers track weekly and all-time scores and exclude current sessionId', () => {
  const memory = new Map<string, string>();
  (globalThis as any).window = {
    localStorage: {
      getItem: (k: string) => memory.get(k) ?? null,
      setItem: (k: string, v: string) => memory.set(k, v),
    },
  };

  const now = 1_700_000_000_000;
  const tenDaysAgo = now - 10 * 86400000;
  const twoDaysAgo = now - 2 * 86400000;

  // Record an older all-time run (10 days ago) and a run from 2 days ago
  recordStoredGameScore('hextris', 5000, 's-old', tenDaysAgo);
  recordStoredGameScore('hextris', 3100, 's-week-1', twoDaysAgo);

  const beforeNewRun = getStoredGameHighScores('hextris', 's-current', now);
  assert.deepEqual(beforeNewRun, {
    allTimeBest: 5000,
    weeklyBest: 3100,
  });

  // Record current run beating all-time best; excluding 's-current' still returns previous baseline
  recordStoredGameScore('hextris', 5400, 's-current', now);
  assert.deepEqual(getStoredGameHighScores('hextris', 's-current', now), {
    allTimeBest: 5000,
    weeklyBest: 3100,
  });
  assert.deepEqual(getStoredGameHighScores('hextris', 's-next', now), {
    allTimeBest: 5400,
    weeklyBest: 5400,
  });

  delete (globalThis as any).window;
});

