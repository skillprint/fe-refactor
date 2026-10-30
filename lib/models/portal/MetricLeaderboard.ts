import { LEADERBOARD_SAMPLE_PLAYERS, formatLeaderboardPlayerLabel } from './LibraryGameLeaderboard';

export interface LeaderboardEntry {
  rank: number;
  user_display: string;
  userDisplay?: string;
  player_id?: string;
  playerId?: string;
  score: number;
  is_you: boolean;
  isYou?: boolean;
}

export interface MetricLeaderboard {
  pillar: string;
  dimension: string;
  entries: LeaderboardEntry[];
}

export function normalizeMetricLeaderboard(
  board: MetricLeaderboard | null,
  viewer?: { name?: string | null; playerId?: string | null },
): MetricLeaderboard | null {
  if (!board) return null;
  const entries = (board.entries ?? []).map((entry, idx) => {
    const isYou = Boolean(entry.is_you ?? entry.isYou);
    const rawDisplay = entry.user_display ?? entry.userDisplay ?? '';
    const rawPid = entry.player_id ?? entry.playerId;

    if (isYou) {
      const resolved = formatLeaderboardPlayerLabel({
        name: rawDisplay && rawDisplay !== 'You' ? rawDisplay : viewer?.name,
        playerId: rawPid || viewer?.playerId,
        isYou: true,
        fallbackLabel: rawDisplay || 'You',
      });
      return {
        ...entry,
        user_display: resolved.userDisplay,
        userDisplay: resolved.userDisplay,
        player_id: resolved.playerId || rawPid,
        playerId: resolved.playerId || rawPid,
        is_you: true,
        isYou: true,
      };
    }

    if (!rawDisplay || /^Player\s+#?\d+$/i.test(rawDisplay.trim())) {
      const sample = LEADERBOARD_SAMPLE_PLAYERS[idx % LEADERBOARD_SAMPLE_PLAYERS.length];
      return {
        ...entry,
        user_display: sample.name,
        userDisplay: sample.name,
        player_id: rawPid || sample.playerId,
        playerId: rawPid || sample.playerId,
        is_you: false,
        isYou: false,
      };
    }

    const resolved = formatLeaderboardPlayerLabel({
      name: rawDisplay,
      playerId: rawPid,
      isYou: false,
    });
    return {
      ...entry,
      user_display: resolved.userDisplay,
      userDisplay: resolved.userDisplay,
      player_id: resolved.playerId || rawPid,
      playerId: resolved.playerId || rawPid,
      is_you: false,
      isYou: false,
    };
  });

  return {
    ...board,
    entries,
  };
}

export const generateMockMetricLeaderboard = (
  viewer?: { name?: string | null; playerId?: string | null },
): MetricLeaderboard => {
  const resolvedYou = formatLeaderboardPlayerLabel({
    name: viewer?.name || 'Bob',
    playerId: viewer?.playerId || 'bob_m',
    isYou: true,
  });
  return {
    pillar: "cognition",
    dimension: "attention",
    entries: [
      { rank: 1, user_display: "Alice", userDisplay: "Alice", player_id: "alice_k", playerId: "alice_k", score: 92, is_you: false, isYou: false },
      { rank: 2, user_display: resolvedYou.userDisplay, userDisplay: resolvedYou.userDisplay, player_id: resolvedYou.playerId, playerId: resolvedYou.playerId, score: 88, is_you: true, isYou: true }
    ]
  };
};
