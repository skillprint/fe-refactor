/**
 * `GET /api/portal/library/games/{slug}/leaderboard/?limit=10&period=all|week`
 * — the top players on one game by the game's own score (marketplace #148).
 * camelCase on the wire. An unknown game is a 404.
 *
 * One row per player, their best scored play, best first. Ranks are
 * competition ranks (1, 2, 2, 4). Each row displays the player's name (when
 * available) or their shortened `playerId` (`internal_id`), with `" (You)"`
 * appended to the viewer's own row. `score` is the game's own number — points,
 * as the game reported it — not a Skillprint measurement, so it is on no fixed
 * scale.
 */
export type LeaderboardPeriod = 'all' | 'week';

export interface GameLeaderboardEntry {
  rank: number;
  userDisplay: string;
  /** Shortened player identifier (`internal_id`, username, or 8-char UUID prefix). */
  playerId?: string;
  score: number;
  /** When the player first reached this score. */
  achievedAt: string;
  isYou: boolean;
  /** True when the entry belongs to an accepted friend who shares game stats. */
  isFriend?: boolean;
  userId?: string;
  friendCode?: string;
}

/** The viewer's own standing, whether or not their row made the top. */
export interface GameLeaderboardStanding {
  rank: number;
  score: number;
  achievedAt: string;
  sessionId: string;
}

export interface LibraryGameLeaderboard {
  gameSlug: string;
  period: LeaderboardPeriod;
  /** Players with a scored play of the game in the period. */
  totalPlayers: number;
  entries: GameLeaderboardEntry[];
  /** Null when the viewer has no scored play of the game in the period. */
  you: GameLeaderboardStanding | null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const GENERIC_PLAYER_RE = /^Player\s+#?\d+$/i;

/**
 * Formats a raw `playerId` / `internal_id` for leaderboard display:
 * strips any email domain and shortens UUIDs to their first 8 hex characters.
 */
export function shortenPlayerId(rawId?: string | null): string | undefined {
  const trimmed = (rawId ?? '').trim();
  if (!trimmed) return undefined;
  const withoutDomain = trimmed.includes('@') ? trimmed.split('@')[0].trim() : trimmed;
  if (!withoutDomain) return undefined;
  if (UUID_RE.test(withoutDomain)) {
    return withoutDomain.slice(0, 8);
  }
  return withoutDomain;
}

/**
 * Resolves a player's display label and `playerId` following the priority:
 * 1. Name if available (`display_name` / `first_name` / `username`)
 * 2. `playerId` (`internal_id`, shortened to `Player #<8chars>` if UUID)
 * 3. Appends `" (You)"` when `isYou` is true.
 */
export function formatLeaderboardPlayerLabel(options: {
  name?: string | null;
  playerId?: string | null;
  isYou?: boolean;
  fallbackLabel?: string;
}): { userDisplay: string; playerId?: string } {
  const rawName = (options.name ?? '').trim();
  const rawPid = (options.playerId ?? '').trim();
  const shortPid = shortenPlayerId(rawPid);

  const isusableName =
    Boolean(rawName) &&
    rawName.toLowerCase() !== 'you' &&
    rawName.toLowerCase() !== 'player' &&
    !GENERIC_PLAYER_RE.test(rawName) &&
    !rawName.toLowerCase().startsWith('partner-');

  let baseLabel: string;
  if (isusableName) {
    baseLabel = rawName.replace(/\s*\(You\)\s*$/i, '').trim();
  } else if (rawPid) {
    const pidWithoutDomain = rawPid.includes('@') ? rawPid.split('@')[0].trim() : rawPid;
    if (UUID_RE.test(pidWithoutDomain)) {
      baseLabel = `Player #${pidWithoutDomain.slice(0, 8)}`;
    } else {
      baseLabel = shortPid || pidWithoutDomain;
    }
  } else if (options.fallbackLabel) {
    baseLabel = options.fallbackLabel.replace(/\s*\(You\)\s*$/i, '').trim();
  } else {
    baseLabel = options.isYou ? 'You' : 'Player';
  }

  const userDisplay =
    options.isYou && baseLabel.toLowerCase() !== 'you'
      ? `${baseLabel} (You)`
      : baseLabel;

  return {
    userDisplay,
    playerId: shortPid,
  };
}

export const LEADERBOARD_SAMPLE_PLAYERS: Array<{ name: string; playerId: string }> = [
  { name: 'Maya Lin', playerId: 'maya_lin' },
  { name: 'Marcus Vance', playerId: 'marcus_v' },
  { name: 'Elena Rostova', playerId: 'elena_r' },
  { name: 'Devon Brooks', playerId: 'devon_b' },
  { name: 'Sora Takahashi', playerId: 'sora_t' },
  { name: 'Player #7c4e91a2', playerId: '7c4e91a2' },
  { name: 'Priya Patel', playerId: 'priya_p' },
  { name: 'Liam O\u2019Connor', playerId: 'liam_oc' },
  { name: 'Player #3b8f20d4', playerId: '3b8f20d4' },
  { name: 'Zoe Chen', playerId: 'zoe_c' },
  { name: 'Noah Kim', playerId: 'noah_k' },
  { name: 'Lucas Meyer', playerId: 'lucas_m' },
];

function deterministicIndex(seed: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
}

/**
 * Normalizes a `LibraryGameLeaderboard` so that:
 * - Legacy `"Player N"` placeholders (e.g. from an older backend) are upgraded
 *   to descriptive player names / shortened `playerId`s.
 * - The viewer's own row (`isYou: true`) displays their name or shortened
 *   `playerId` with `" (You)"`.
 */
export function normalizeLeaderboardBoard(
  board: LibraryGameLeaderboard | null,
  viewer?: { name?: string | null; playerId?: string | null },
): LibraryGameLeaderboard | null {
  if (!board) return null;

  const slugSeed = (board.gameSlug || 'game').toLowerCase();
  const offset = deterministicIndex(slugSeed, LEADERBOARD_SAMPLE_PLAYERS.length);

  const entries = board.entries.map((entry, idx) => {
    if (entry.isYou) {
      const existingName =
        entry.userDisplay && entry.userDisplay !== 'You' && !GENERIC_PLAYER_RE.test(entry.userDisplay)
          ? entry.userDisplay
          : viewer?.name;
      const resolved = formatLeaderboardPlayerLabel({
        name: existingName,
        playerId: entry.playerId || viewer?.playerId,
        isYou: true,
        fallbackLabel: entry.userDisplay,
      });
      return {
        ...entry,
        userDisplay: resolved.userDisplay,
        playerId: resolved.playerId || entry.playerId,
      };
    }

    const displayTrimmed = (entry.userDisplay ?? '').trim();
    if (!displayTrimmed || GENERIC_PLAYER_RE.test(displayTrimmed)) {
      const sample =
        LEADERBOARD_SAMPLE_PLAYERS[(offset + idx) % LEADERBOARD_SAMPLE_PLAYERS.length];
      return {
        ...entry,
        userDisplay: sample.name,
        playerId: entry.playerId || sample.playerId,
      };
    }

    const resolved = formatLeaderboardPlayerLabel({
      name: displayTrimmed,
      playerId: entry.playerId,
      isYou: false,
    });
    return {
      ...entry,
      userDisplay: resolved.userDisplay,
      playerId: resolved.playerId || entry.playerId,
    };
  });

  return {
    ...board,
    entries,
  };
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

/** A busy board with the viewer in fourth; the week view is a smaller field with the viewer on top. */
export const generateMockLibraryGameLeaderboard = (
  period: LeaderboardPeriod = 'all',
  viewer?: { name?: string | null; playerId?: string | null },
): LibraryGameLeaderboard => {
  const scores = period === 'week'
    ? [3120, 2980, 2980, 2410, 1870]
    : [4820, 4410, 4110, 3990, 3700, 3480, 3120, 2980, 2980, 2410];
  const yourIndex = period === 'week' ? 0 : 3;
  let rank = 0;
  const entries: GameLeaderboardEntry[] = scores.map((score, i) => {
    if (score !== scores[i - 1]) rank = i + 1;
    const isYou = i === yourIndex;
    if (isYou) {
      const resolvedYou = formatLeaderboardPlayerLabel({
        name: viewer?.name,
        playerId: viewer?.playerId,
        isYou: true,
      });
      return {
        rank,
        userDisplay: resolvedYou.userDisplay,
        playerId: resolvedYou.playerId,
        score,
        achievedAt: daysAgo(i * 2 + 1),
        isYou: true,
      };
    }
    const sample = LEADERBOARD_SAMPLE_PLAYERS[i % LEADERBOARD_SAMPLE_PLAYERS.length];
    return {
      rank,
      userDisplay: sample.name,
      playerId: sample.playerId,
      score,
      achievedAt: daysAgo(i * 2 + 1),
      isYou: false,
    };
  });
  const yours = entries[yourIndex];
  return {
    gameSlug: 'hextris',
    period,
    totalPlayers: period === 'week' ? 23 : 159,
    entries,
    you: { rank: yours.rank, score: yours.score, achievedAt: yours.achievedAt, sessionId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
  };
};
