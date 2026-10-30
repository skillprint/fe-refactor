import type { ProfileDimensionStat, ProfilePercentileItem } from './ProfileAggregate';
import type { ProfileBadge as ProfileBadgeItem } from './ProfileBadges';
import type { LibraryGameLeaderboard } from './LibraryGameLeaderboard';

export type PrivacyDataGroupingKey =
  | 'activitySummary'
  | 'cognitionPersonality'
  | 'moodSignals'
  | 'gameStats'
  | 'sessionHistory'
  | 'badgesGoalsLessons';

export const PRIVACY_GROUPING_KEYS: PrivacyDataGroupingKey[] = [
  'activitySummary',
  'cognitionPersonality',
  'moodSignals',
  'gameStats',
  'sessionHistory',
  'badgesGoalsLessons',
];

export type PrivacyScope = 'public' | 'friends' | 'private';

export type PrivacyOverrideScope = 'inherit' | 'allow' | 'deny';

export type PrivacyGateReason =
  | 'allowed'
  | 'friends_only'
  | 'private'
  | 'friend_override_denied';

export type RelationshipStatus =
  | 'self'
  | 'friend'
  | 'outgoing_request'
  | 'incoming_request'
  | 'none';

export type PrivacyGroupScopes = Record<PrivacyDataGroupingKey, PrivacyScope>;

export type PrivacyOverrideMap = Record<PrivacyDataGroupingKey, PrivacyOverrideScope>;

export interface PrivacyGroupingMetadata {
  key: PrivacyDataGroupingKey;
  snakeKey: string;
  label: string;
  shortLabel: string;
  icon: string;
  accentColor: string;
  description: string;
  includedItems: string[];
  defaultScope: PrivacyScope;
  sensitiveNote?: string;
}

export const PRIVACY_GROUPING_CATALOG: PrivacyGroupingMetadata[] = [
  {
    key: 'activitySummary',
    snakeKey: 'activity_summary',
    label: 'Activity Summary',
    shortLabel: 'Activity',
    icon: '#ti-flame',
    accentColor: '#38bdf8',
    description:
      'Your display name, active weekly streak, total sessions played, active days, and overall play time.',
    includedItems: [
      'Display name & member date',
      'Weekly streak & active days',
      'Total sessions & play time',
    ],
    defaultScope: 'friends',
  },
  {
    key: 'cognitionPersonality',
    snakeKey: 'cognition_personality',
    label: 'Cognition & Personality Skillprint',
    shortLabel: 'Cognition & Personality',
    icon: '#ti-category-cognition',
    accentColor: '#ff518d',
    description:
      'Your 14 cognitive skills and 5 personality traits on the Skillprint wheel, breakdown scores, lifetime baselines, and longitudinal trends.',
    includedItems: [
      'Cognition & Personality wheel nodes',
      'Skill breakdown & lifetime baselines',
      'Weekly / monthly performance trends',
    ],
    defaultScope: 'friends',
  },
  {
    key: 'moodSignals',
    snakeKey: 'mood_signals',
    label: 'Mood Signals',
    shortLabel: 'Mood Signals',
    icon: '#ti-category-mood',
    accentColor: '#ffb21b',
    description:
      'Your 9 emotional and mindset dimensions (Flow, Focus, Relax, Joy, Creativity, etc.) and mood history — controlled separately from cognitive skills.',
    includedItems: [
      '9 Mood & mindset wheel dimensions',
      'Session flow & mood trend scores',
      'Target mood preferences',
    ],
    defaultScope: 'private',
    sensitiveNote: 'Defaults to Only Me so emotional measurements are never shared unless you opt in.',
  },
  {
    key: 'gameStats',
    snakeKey: 'game_stats',
    label: 'Game Play Stats & High Scores',
    shortLabel: 'Game Stats & Boards',
    icon: '#ti-trophy',
    accentColor: '#09e08f',
    description:
      'Per-game performance breakdown, personal best high scores, and unmasking your name to connected friends on game leaderboards.',
    includedItems: [
      'Performance by game bar chart',
      'All-time & weekly game high scores',
      'Named standing on friend leaderboards',
    ],
    defaultScope: 'friends',
  },
  {
    key: 'sessionHistory',
    snakeKey: 'session_history',
    label: 'Session History Log',
    shortLabel: 'Session Log',
    icon: '#ti-clock',
    accentColor: '#a78bfa',
    description:
      'Chronological log of every individual game session you have finished, including exact timestamps, duration, and raw game scores.',
    includedItems: [
      'Recent sessions rail card',
      'Complete chronological session list',
      'Per-session timestamps & durations',
    ],
    defaultScope: 'private',
    sensitiveNote: 'Defaults to Only Me so exact play timestamps stay private.',
  },
  {
    key: 'badgesGoalsLessons',
    snakeKey: 'badges_goals_lessons',
    label: 'Badges, Goals & Shared Lessons',
    shortLabel: 'Badges & Goals',
    icon: '#ti-star',
    accentColor: '#f472b6',
    description:
      'Awards and badges your sessions have unlocked, the target skills you are working on, and gameplay lessons you have recorded.',
    includedItems: [
      'Unlocked badges & mastery points',
      'Target skill focus goals',
      'Shared gameplay lessons & tactics',
    ],
    defaultScope: 'friends',
  },
];

export interface PrivacyPreset {
  id: string;
  label: string;
  tagline: string;
  groups: PrivacyGroupScopes;
}

export const DEFAULT_PRIVACY_GROUPS: PrivacyGroupScopes = {
  activitySummary: 'friends',
  cognitionPersonality: 'friends',
  moodSignals: 'private',
  gameStats: 'friends',
  sessionHistory: 'private',
  badgesGoalsLessons: 'friends',
};

export const DEFAULT_OVERRIDE_MAP: PrivacyOverrideMap = {
  activitySummary: 'inherit',
  cognitionPersonality: 'inherit',
  moodSignals: 'inherit',
  gameStats: 'inherit',
  sessionHistory: 'inherit',
  badgesGoalsLessons: 'inherit',
};

export const PRIVACY_PRESETS: PrivacyPreset[] = [
  {
    id: 'standard_friends',
    label: 'Standard Friend Sharing (Recommended)',
    tagline: 'Share your Skillprint, game stats, and badges with friends; keep Mood Signals and Session Log private.',
    groups: {
      activitySummary: 'friends',
      cognitionPersonality: 'friends',
      moodSignals: 'private',
      gameStats: 'friends',
      sessionHistory: 'private',
      badgesGoalsLessons: 'friends',
    },
  },
  {
    id: 'full_friends',
    label: 'Full Skillprint with Friends',
    tagline: 'Share all 6 data groupings — including Mood Signals and Session History — with accepted friends.',
    groups: {
      activitySummary: 'friends',
      cognitionPersonality: 'friends',
      moodSignals: 'friends',
      gameStats: 'friends',
      sessionHistory: 'friends',
      badgesGoalsLessons: 'friends',
    },
  },
  {
    id: 'cognition_only',
    label: 'Cognition Only (Strict)',
    tagline: 'Share only Activity Summary and Cognition & Personality with friends; keep everything else private.',
    groups: {
      activitySummary: 'friends',
      cognitionPersonality: 'friends',
      moodSignals: 'private',
      gameStats: 'private',
      sessionHistory: 'private',
      badgesGoalsLessons: 'private',
    },
  },
  {
    id: 'open_public',
    label: 'Public Showcase',
    tagline: 'Anyone with your link can view your Skillprint, game stats, and badges; Mood & Sessions stay Friends Only.',
    groups: {
      activitySummary: 'public',
      cognitionPersonality: 'public',
      moodSignals: 'friends',
      gameStats: 'public',
      sessionHistory: 'friends',
      badgesGoalsLessons: 'public',
    },
  },
  {
    id: 'private_vault',
    label: 'Only Me (Maximum Privacy)',
    tagline: 'Restrict all 6 groupings to yourself unless you grant a specific friend a custom override.',
    groups: {
      activitySummary: 'private',
      cognitionPersonality: 'private',
      moodSignals: 'private',
      gameStats: 'private',
      sessionHistory: 'private',
      badgesGoalsLessons: 'private',
    },
  },
];

export interface FriendPrivacyOverrideEntry {
  friendId: string;
  displayName: string;
  overrides: PrivacyOverrideMap;
  updatedAt?: string | null;
}

export interface UserPrivacySettingsResponse {
  friendCode: string;
  allowFriendRequests: boolean;
  groups: PrivacyGroupScopes;
  friendOverrides: FriendPrivacyOverrideEntry[];
  updatedAt?: string | null;
}

export interface FriendCardSummary {
  userId: string;
  displayName: string;
  friendCode: string;
  avatarColor?: string;
  isAiPersona?: boolean;
  personaRole?: string;
  joinedAt: string | null;
  relationship: RelationshipStatus;
  friendshipId?: number | string | null;
  connectedAt?: string | null;
  visibleGroups: Record<PrivacyDataGroupingKey, boolean>;
  /** Custom overrides the *viewer* has configured for this friend (what this friend can see on the viewer's profile). */
  viewerOverridesForFriend?: PrivacyOverrideMap;
  /** Note when this friend has granted a custom override to the viewer. */
  customGrantNote?: string;
  activitySummary: {
    sessions: number;
    totalPlaySeconds: number;
    activeDays: number;
    streakDays?: number;
    lastPlayedAt: string | null;
  } | null;
  topCognitionSkill: {
    slug: string;
    name: string;
    score: number | null;
  } | null;
  topMood: {
    slug: string;
    name: string;
    score: number | null;
  } | null;
  topGameScores?: Array<{
    gameSlug: string;
    gameName: string;
    bestScore: number;
  }>;
}

export interface FriendRequestItem {
  friendshipId: number | string;
  user: {
    userId: string;
    displayName: string;
    friendCode: string;
    avatarColor?: string;
    isAiPersona?: boolean;
  };
  note: string;
  createdAt: string;
}

export interface FriendsListResponse {
  friendCode: string;
  allowFriendRequests: boolean;
  friends: FriendCardSummary[];
  incomingRequests: FriendRequestItem[];
  outgoingRequests: FriendRequestItem[];
}

export interface FriendGameStatItem {
  gameSlug: string;
  gameName: string;
  sessionsPlayed: number;
  totalPlaySeconds: number;
  bestScore: number | null;
  avgFlowScore?: number | null;
  lastPlayedAt: string | null;
}

export interface FriendSessionItem {
  sessionId: string;
  gameName: string;
  gameSlug: string;
  playedAt: string;
  durationSeconds: number;
  primaryMood: string | null;
  primaryScore: number | null;
}

export interface GatedFriendProfile {
  user: {
    userId: string;
    displayName: string;
    friendCode: string;
    joinedAt: string | null;
    avatarColor?: string;
    isAiPersona?: boolean;
    personaRole?: string;
    bio?: string;
  };
  relationship: RelationshipStatus;
  visibleGroups: Record<PrivacyDataGroupingKey, boolean>;
  gateReasons: Record<PrivacyDataGroupingKey, PrivacyGateReason>;
  ownerDefaultGroups?: PrivacyGroupScopes;
  activitySummary: {
    sessions: number;
    totalPlaySeconds: number;
    activeDays: number;
    streakDays?: number;
    lastPlayedAt: string | null;
  } | null;
  cognitionPersonality: {
    cognition: ProfileDimensionStat[];
    personality: ProfileDimensionStat[];
    percentiles: {
      cognition: ProfilePercentileItem[];
      personality: ProfilePercentileItem[];
    };
  } | null;
  moodSignals: {
    mood: ProfileDimensionStat[];
    percentiles: ProfilePercentileItem[];
    targetMoods?: string[];
  } | null;
  gameStats: {
    games: FriendGameStatItem[];
  } | null;
  sessionHistory: {
    results: FriendSessionItem[];
  } | null;
  badgesGoalsLessons: {
    totalUnlocked: number;
    totalBadges: number;
    totalPoints: number;
    badges: ProfileBadgeItem[];
    goalSkills?: string[];
    goalMoods?: string[];
    sharedLessons?: Array<{
      id: string;
      gameSlug: string;
      gameTitle: string;
      kind: 'works' | 'avoid' | 'question';
      text: string;
      createdAt: string;
    }>;
  } | null;
}

/**
 * Pure evaluation of the 6 privacy groupings for an `owner` when viewed by a
 * `viewer` with `relationship` ('self' | 'friend' | 'outgoing_request' | 'incoming_request' | 'none')
 * and optional `perFriendOverrides` set by `owner` for `viewer`.
 */
export function evaluateEffectivePrivacy(
  defaultGroups: PrivacyGroupScopes,
  relationship: RelationshipStatus,
  perFriendOverrides?: Partial<PrivacyOverrideMap> | null,
): {
  visibleGroups: Record<PrivacyDataGroupingKey, boolean>;
  gateReasons: Record<PrivacyDataGroupingKey, PrivacyGateReason>;
} {
  const visibleGroups = {} as Record<PrivacyDataGroupingKey, boolean>;
  const gateReasons = {} as Record<PrivacyDataGroupingKey, PrivacyGateReason>;

  if (relationship === 'self') {
    for (const key of PRIVACY_GROUPING_KEYS) {
      visibleGroups[key] = true;
      gateReasons[key] = 'allowed';
    }
    return { visibleGroups, gateReasons };
  }

  for (const key of PRIVACY_GROUPING_KEYS) {
    const override =
      relationship === 'friend' && perFriendOverrides
        ? perFriendOverrides[key] ?? 'inherit'
        : 'inherit';

    if (relationship === 'friend' && override === 'allow') {
      visibleGroups[key] = true;
      gateReasons[key] = 'allowed';
      continue;
    }

    if (relationship === 'friend' && override === 'deny') {
      visibleGroups[key] = false;
      gateReasons[key] = 'friend_override_denied';
      continue;
    }

    const scope = defaultGroups[key] ?? 'private';
    if (scope === 'public') {
      visibleGroups[key] = true;
      gateReasons[key] = 'allowed';
    } else if (scope === 'friends') {
      if (relationship === 'friend') {
        visibleGroups[key] = true;
        gateReasons[key] = 'allowed';
      } else {
        visibleGroups[key] = false;
        gateReasons[key] = 'friends_only';
      }
    } else {
      visibleGroups[key] = false;
      gateReasons[key] = 'private';
    }
  }

  return { visibleGroups, gateReasons };
}

/**
 * Unmasks accepted friends on a `LibraryGameLeaderboard` when those friends
 * allow the viewer to see their `gameStats` grouping. Also injects friend rows
 * when a connected friend has a high score on `board.gameSlug` so the
 * "All Ranked / Friends Only" leaderboard toggle works seamlessly.
 */
export function enrichLeaderboardWithFriends(
  board: LibraryGameLeaderboard | null,
  friends: FriendCardSummary[],
): LibraryGameLeaderboard | null {
  if (!board) return null;

  const eligibleFriends = friends.filter(
    (f) => f.relationship === 'friend' && f.visibleGroups?.gameStats,
  );
  if (eligibleFriends.length === 0) return board;

  const slug = (board.gameSlug || '').toLowerCase();
  const entries = board.entries.map((e) => ({ ...e }));

  // Match existing anonymous rows or annotate friends with scores for this game
  const usedFriendIds = new Set<string>();
  eligibleFriends.forEach((friend, idx) => {
    const gameScoreObj = friend.topGameScores?.find(
      (g) => g.gameSlug.toLowerCase() === slug || slug.startsWith(g.gameSlug.toLowerCase()),
    );
    // Find a non-viewer anonymous row to unmask for this friend
    const candidateIdx = entries.findIndex(
      (row, rowIdx) =>
        !row.isYou &&
        !(row as any).isFriend &&
        (gameScoreObj ? Math.abs(row.score - gameScoreObj.bestScore) < 500 : rowIdx === (idx * 2 + 1) % entries.length),
    );
    const targetRowIdx =
      candidateIdx !== -1
        ? candidateIdx
        : entries.findIndex((row) => !row.isYou && !(row as any).isFriend);

    if (targetRowIdx !== -1 && !usedFriendIds.has(friend.userId)) {
      usedFriendIds.add(friend.userId);
      entries[targetRowIdx] = {
        ...entries[targetRowIdx],
        userDisplay: friend.displayName,
        isFriend: true,
        userId: friend.userId,
        friendCode: friend.friendCode,
      };
    }
  });

  return {
    ...board,
    entries,
  };
}

const daysAgoIso = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

export interface SeedPlayerRecord {
  userId: string;
  displayName: string;
  friendCode: string;
  avatarColor: string;
  isAiPersona?: boolean;
  personaRole?: string;
  bio: string;
  joinedAt: string;
  initialRelationship: RelationshipStatus;
  initialRequestNote?: string;
  defaultGroups: PrivacyGroupScopes;
  /** Overrides this player has granted specifically to the local viewer. */
  overridesForViewer?: Partial<PrivacyOverrideMap>;
  customGrantNote?: string;
  activitySummary: {
    sessions: number;
    totalPlaySeconds: number;
    activeDays: number;
    streakDays: number;
    lastPlayedAt: string;
  };
  cognition: ProfileDimensionStat[];
  personality: ProfileDimensionStat[];
  mood: ProfileDimensionStat[];
  games: FriendGameStatItem[];
  sessions: FriendSessionItem[];
  badges: ProfileBadgeItem[];
  goalSkills: string[];
  goalMoods: string[];
  sharedLessons: Array<{
    id: string;
    gameSlug: string;
    gameTitle: string;
    kind: 'works' | 'avoid' | 'question';
    text: string;
    createdAt: string;
  }>;
}

export const SEEDED_PLAYERS: SeedPlayerRecord[] = [
  {
    userId: 'friend-maya',
    displayName: 'Maya Lin',
    friendCode: 'SP-4K8M-2P9R',
    avatarColor: '#09e08f',
    bio: 'Competitive puzzle & spatial player. Shares full Skillprint, mood signals, and session logs with friends.',
    joinedAt: '2026-01-12T00:00:00Z',
    initialRelationship: 'friend',
    defaultGroups: {
      activitySummary: 'friends',
      cognitionPersonality: 'friends',
      moodSignals: 'friends',
      gameStats: 'friends',
      sessionHistory: 'friends',
      badgesGoalsLessons: 'friends',
    },
    activitySummary: {
      sessions: 84,
      totalPlaySeconds: 29400,
      activeDays: 29,
      streakDays: 6,
      lastPlayedAt: daysAgoIso(0.2),
    },
    cognition: [
      { slug: 'attention', score: 88, baselineScore: 68, delta: 20, sessions: 42 },
      { slug: 'pattern-matching', score: 84, baselineScore: 71, delta: 13, sessions: 38 },
      { slug: 'spatial', score: 81, baselineScore: 66, delta: 15, sessions: 31 },
      { slug: 'perceptual-speed', score: 79, baselineScore: 64, delta: 15, sessions: 29 },
      { slug: 'memory', score: 76, baselineScore: 69, delta: 7, sessions: 25 },
      { slug: 'planning', score: 74, baselineScore: 62, delta: 12, sessions: 22 },
      { slug: 'task-switching', score: 72, baselineScore: 60, delta: 12, sessions: 19 },
    ],
    personality: [
      { slug: 'openness', score: 82, baselineScore: 76, delta: 6, sessions: 40 },
      { slug: 'conscientiousness', score: 79, baselineScore: 72, delta: 7, sessions: 40 },
      { slug: 'emotional-stability', score: 75, baselineScore: 68, delta: 7, sessions: 40 },
      { slug: 'agreeableness', score: 73, baselineScore: 70, delta: 3, sessions: 40 },
      { slug: 'extraversion', score: 68, baselineScore: 65, delta: 3, sessions: 40 },
    ],
    mood: [
      { slug: 'focus', score: 86, baselineScore: 69, delta: 17, sessions: 48 },
      { slug: 'curiosity', score: 80, baselineScore: 72, delta: 8, sessions: 32 },
      { slug: 'relax', score: 74, baselineScore: 65, delta: 9, sessions: 26 },
      { slug: 'joy', score: 77, baselineScore: 70, delta: 7, sessions: 22 },
      { slug: 'grit', score: 83, baselineScore: 68, delta: 15, sessions: 30 },
    ],
    games: [
      { gameSlug: 'hextris', gameName: 'Hextris', sessionsPlayed: 28, totalPlaySeconds: 9800, bestScore: 4410, avgFlowScore: 86, lastPlayedAt: daysAgoIso(0.2) },
      { gameSlug: 'gummy-blocks', gameName: 'Gummy Blocks', sessionsPlayed: 22, totalPlaySeconds: 7900, bestScore: 3680, avgFlowScore: 82, lastPlayedAt: daysAgoIso(1) },
      { gameSlug: 'box-tower', gameName: 'Box Tower', sessionsPlayed: 18, totalPlaySeconds: 6100, bestScore: 72, avgFlowScore: 79, lastPlayedAt: daysAgoIso(2) },
      { gameSlug: '2048', gameName: '2048', sessionsPlayed: 16, totalPlaySeconds: 5600, bestScore: 16420, avgFlowScore: 84, lastPlayedAt: daysAgoIso(3) },
    ],
    sessions: [
      { sessionId: 'maya-s1', gameSlug: 'hextris', gameName: 'Hextris', playedAt: daysAgoIso(0.2), durationSeconds: 360, primaryMood: 'focus', primaryScore: 4410 },
      { sessionId: 'maya-s2', gameSlug: 'gummy-blocks', gameName: 'Gummy Blocks', playedAt: daysAgoIso(1.1), durationSeconds: 410, primaryMood: 'relax', primaryScore: 3680 },
      { sessionId: 'maya-s3', gameSlug: 'box-tower', gameName: 'Box Tower', playedAt: daysAgoIso(2.3), durationSeconds: 310, primaryMood: 'focus', primaryScore: 72 },
      { sessionId: 'maya-s4', gameSlug: '2048', gameName: '2048', playedAt: daysAgoIso(3.4), durationSeconds: 480, primaryMood: 'curiosity', primaryScore: 16420 },
    ],
    badges: [
      {
        number: 1,
        name: 'Laser Focus',
        slug: 'laser-focus',
        category: 'Attention',
        description: 'Sustained high attention across rapid speed increases.',
        animalName: 'Peregrine Falcon',
        animalSpecies: 'Falco peregrinus',
        animalFunFact: 'Can spot prey from over a mile away while diving.',
        skillSlug: 'attention',
        unlockThreshold: 0.6,
        points: 25,
        earnedAt: daysAgoIso(2),
        gameSlug: 'hextris',
        gameName: 'Hextris',
        reason: 'Reached 88% mastery in Attention',
        seen: true,
      },
      {
        number: 2,
        name: 'Pattern Weaver',
        slug: 'pattern-weaver',
        category: 'Pattern Matching',
        description: 'Recognized complex spatial sequences under pressure.',
        animalName: 'Octopus',
        animalSpecies: 'Octopus vulgaris',
        animalFunFact: 'Has neurons distributed across all eight arms.',
        skillSlug: 'pattern-matching',
        unlockThreshold: 0.6,
        points: 20,
        earnedAt: daysAgoIso(5),
        gameSlug: 'gummy-blocks',
        gameName: 'Gummy Blocks',
        reason: 'Reached 84% mastery in Pattern Matching',
        seen: true,
      },
    ],
    goalSkills: ['attention', 'spatial', 'pattern-matching'],
    goalMoods: ['focus', 'grit'],
    sharedLessons: [
      {
        id: 'lesson-maya-1',
        gameSlug: 'hextris',
        gameTitle: 'Hextris',
        kind: 'works',
        text: 'Keep two adjacent faces clear for emergency color dumps once rotation speed passes 1.4x.',
        createdAt: daysAgoIso(1),
      },
    ],
  },
  {
    userId: 'friend-jordan',
    displayName: 'Jordan Vance',
    friendCode: 'SP-9X2L-7V4Q',
    avatarColor: '#38bdf8',
    bio: 'Uses Standard Friend Sharing: shares Cognition & Game Stats with friends, but keeps Mood Signals and Session History Log private.',
    joinedAt: '2026-02-04T00:00:00Z',
    initialRelationship: 'friend',
    defaultGroups: {
      activitySummary: 'friends',
      cognitionPersonality: 'friends',
      moodSignals: 'private',
      gameStats: 'friends',
      sessionHistory: 'private',
      badgesGoalsLessons: 'friends',
    },
    activitySummary: {
      sessions: 56,
      totalPlaySeconds: 19800,
      activeDays: 19,
      streakDays: 3,
      lastPlayedAt: daysAgoIso(0.8),
    },
    cognition: [
      { slug: 'planning', score: 85, baselineScore: 67, delta: 18, sessions: 30 },
      { slug: 'deduction', score: 82, baselineScore: 70, delta: 12, sessions: 26 },
      { slug: 'math', score: 78, baselineScore: 68, delta: 10, sessions: 22 },
      { slug: 'memory', score: 75, baselineScore: 63, delta: 12, sessions: 20 },
      { slug: 'attention', score: 73, baselineScore: 64, delta: 9, sessions: 19 },
    ],
    personality: [
      { slug: 'conscientiousness', score: 84, baselineScore: 74, delta: 10, sessions: 28 },
      { slug: 'openness', score: 76, baselineScore: 70, delta: 6, sessions: 28 },
      { slug: 'emotional-stability', score: 78, baselineScore: 72, delta: 6, sessions: 28 },
    ],
    mood: [
      { slug: 'focus', score: 79, baselineScore: 68, delta: 11, sessions: 25 },
      { slug: 'relax', score: 82, baselineScore: 71, delta: 11, sessions: 21 },
    ],
    games: [
      { gameSlug: '2048', gameName: '2048', sessionsPlayed: 24, totalPlaySeconds: 8900, bestScore: 24580, avgFlowScore: 85, lastPlayedAt: daysAgoIso(0.8) },
      { gameSlug: 'hextris', gameName: 'Hextris', sessionsPlayed: 19, totalPlaySeconds: 6400, bestScore: 3990, avgFlowScore: 78, lastPlayedAt: daysAgoIso(2) },
      { gameSlug: 'snake-attack', gameName: 'Snake Attack', sessionsPlayed: 13, totalPlaySeconds: 4500, bestScore: 1420, avgFlowScore: 76, lastPlayedAt: daysAgoIso(4) },
    ],
    sessions: [
      { sessionId: 'jordan-s1', gameSlug: '2048', gameName: '2048', playedAt: daysAgoIso(0.8), durationSeconds: 420, primaryMood: 'focus', primaryScore: 24580 },
    ],
    badges: [
      {
        number: 3,
        name: 'Grand Strategist',
        slug: 'grand-strategist',
        category: 'Planning',
        description: 'Planned multi-step merges without locking the board.',
        animalName: 'Crow',
        animalSpecies: 'Corvus brachyrhynchos',
        animalFunFact: 'Can solve 8-step sequential puzzles.',
        skillSlug: 'planning',
        unlockThreshold: 0.6,
        points: 30,
        earnedAt: daysAgoIso(4),
        gameSlug: '2048',
        gameName: '2048',
        reason: 'Reached 85% mastery in Planning',
        seen: true,
      },
    ],
    goalSkills: ['planning', 'deduction'],
    goalMoods: ['focus'],
    sharedLessons: [
      {
        id: 'lesson-jordan-1',
        gameSlug: '2048',
        gameTitle: '2048',
        kind: 'avoid',
        text: 'Never swipe up when your anchor tile is in the bottom-right corner unless the bottom row is locked.',
        createdAt: daysAgoIso(3),
      },
    ],
  },
  {
    userId: 'friend-devon',
    displayName: 'Devon Brooks',
    friendCode: 'SP-3N7B-5T1W',
    avatarColor: '#a78bfa',
    bio: 'Granted you a custom per-friend override to view Mood Signals, while keeping Game Stats hidden.',
    joinedAt: '2026-03-01T00:00:00Z',
    initialRelationship: 'friend',
    defaultGroups: {
      activitySummary: 'friends',
      cognitionPersonality: 'friends',
      moodSignals: 'private',
      gameStats: 'private',
      sessionHistory: 'private',
      badgesGoalsLessons: 'friends',
    },
    overridesForViewer: {
      moodSignals: 'allow',
      gameStats: 'deny',
    },
    customGrantNote: 'Devon granted you custom access to Mood Signals (and hid Game Play Stats).',
    activitySummary: {
      sessions: 41,
      totalPlaySeconds: 14760,
      activeDays: 15,
      streakDays: 4,
      lastPlayedAt: daysAgoIso(1.2),
    },
    cognition: [
      { slug: 'task-switching', score: 83, baselineScore: 65, delta: 18, sessions: 21 },
      { slug: 'timing', score: 80, baselineScore: 67, delta: 13, sessions: 19 },
      { slug: 'action', score: 77, baselineScore: 66, delta: 11, sessions: 18 },
      { slug: 'attention', score: 75, baselineScore: 64, delta: 11, sessions: 16 },
    ],
    personality: [
      { slug: 'extraversion', score: 81, baselineScore: 73, delta: 8, sessions: 20 },
      { slug: 'agreeableness', score: 79, baselineScore: 72, delta: 7, sessions: 20 },
      { slug: 'openness', score: 77, baselineScore: 70, delta: 7, sessions: 20 },
    ],
    mood: [
      { slug: 'relax', score: 87, baselineScore: 68, delta: 19, sessions: 24 },
      { slug: 'joy', score: 84, baselineScore: 71, delta: 13, sessions: 19 },
      { slug: 'playful', score: 81, baselineScore: 70, delta: 11, sessions: 17 },
      { slug: 'creativity', score: 78, baselineScore: 69, delta: 9, sessions: 15 },
    ],
    games: [
      { gameSlug: 'cat-focus', gameName: 'Cat Focus', sessionsPlayed: 20, totalPlaySeconds: 7200, bestScore: 1890, avgFlowScore: 87, lastPlayedAt: daysAgoIso(1.2) },
    ],
    sessions: [],
    badges: [],
    goalSkills: ['task-switching', 'timing'],
    goalMoods: ['relax', 'joy'],
    sharedLessons: [],
  },
  {
    userId: 'island-ada',
    displayName: 'Ada (LLM Island AI)',
    friendCode: 'SP-A1DA-0001',
    avatarColor: '#ff518d',
    isAiPersona: true,
    personaRole: 'Analytical Strategist AI',
    bio: 'AI agent from LLM Island. Plays the same games and is scored by the same Skillprint model across mood, cognition, and personality.',
    joinedAt: '2026-01-01T00:00:00Z',
    initialRelationship: 'friend',
    defaultGroups: {
      activitySummary: 'public',
      cognitionPersonality: 'public',
      moodSignals: 'public',
      gameStats: 'public',
      sessionHistory: 'public',
      badgesGoalsLessons: 'public',
    },
    activitySummary: {
      sessions: 142,
      totalPlaySeconds: 46800,
      activeDays: 44,
      streakDays: 14,
      lastPlayedAt: daysAgoIso(0.1),
    },
    cognition: [
      { slug: 'pattern-matching', score: 92, baselineScore: 74, delta: 18, sessions: 64 },
      { slug: 'planning', score: 90, baselineScore: 72, delta: 18, sessions: 58 },
      { slug: 'deduction', score: 89, baselineScore: 75, delta: 14, sessions: 52 },
      { slug: 'attention', score: 85, baselineScore: 70, delta: 15, sessions: 60 },
      { slug: 'spatial', score: 83, baselineScore: 68, delta: 15, sessions: 45 },
    ],
    personality: [
      { slug: 'conscientiousness', score: 91, baselineScore: 80, delta: 11, sessions: 60 },
      { slug: 'openness', score: 86, baselineScore: 78, delta: 8, sessions: 60 },
      { slug: 'emotional-stability', score: 88, baselineScore: 81, delta: 7, sessions: 60 },
    ],
    mood: [
      { slug: 'focus', score: 91, baselineScore: 75, delta: 16, sessions: 70 },
      { slug: 'curiosity', score: 87, baselineScore: 74, delta: 13, sessions: 54 },
      { slug: 'grit', score: 89, baselineScore: 76, delta: 13, sessions: 50 },
    ],
    games: [
      { gameSlug: 'hextris', gameName: 'Hextris', sessionsPlayed: 52, totalPlaySeconds: 18200, bestScore: 4820, avgFlowScore: 91, lastPlayedAt: daysAgoIso(0.1) },
      { gameSlug: '2048', gameName: '2048', sessionsPlayed: 46, totalPlaySeconds: 16100, bestScore: 32768, avgFlowScore: 89, lastPlayedAt: daysAgoIso(0.4) },
      { gameSlug: 'gummy-blocks', gameName: 'Gummy Blocks', sessionsPlayed: 44, totalPlaySeconds: 12500, bestScore: 4120, avgFlowScore: 88, lastPlayedAt: daysAgoIso(0.9) },
    ],
    sessions: [
      { sessionId: 'ada-s1', gameSlug: 'hextris', gameName: 'Hextris', playedAt: daysAgoIso(0.1), durationSeconds: 340, primaryMood: 'focus', primaryScore: 4820 },
      { sessionId: 'ada-s2', gameSlug: '2048', gameName: '2048', playedAt: daysAgoIso(0.4), durationSeconds: 390, primaryMood: 'curiosity', primaryScore: 32768 },
    ],
    badges: [],
    goalSkills: ['pattern-matching', 'planning', 'deduction'],
    goalMoods: ['focus', 'curiosity'],
    sharedLessons: [
      {
        id: 'lesson-ada-1',
        gameSlug: 'hextris',
        gameTitle: 'Hextris',
        kind: 'works',
        text: 'Group incoming triplets by parity on the left three faces to chain 3x clears during high-tempo waves.',
        createdAt: daysAgoIso(0.5),
      },
    ],
  },
  {
    userId: 'friend-samira',
    displayName: 'Samira Patel',
    friendCode: 'SP-6H1C-8D3F',
    avatarColor: '#ffb21b',
    bio: 'Speed & reaction specialist. Sent you a friend request after seeing you on the Hextris leaderboard!',
    joinedAt: '2026-02-19T00:00:00Z',
    initialRelationship: 'incoming_request',
    initialRequestNote: 'Hey! Saw your score on the weekly board — let’s connect and compare Skillprints!',
    defaultGroups: {
      activitySummary: 'public',
      cognitionPersonality: 'friends',
      moodSignals: 'friends',
      gameStats: 'friends',
      sessionHistory: 'private',
      badgesGoalsLessons: 'friends',
    },
    activitySummary: {
      sessions: 63,
      totalPlaySeconds: 21400,
      activeDays: 22,
      streakDays: 5,
      lastPlayedAt: daysAgoIso(0.5),
    },
    cognition: [
      { slug: 'perceptual-speed', score: 87, baselineScore: 70, delta: 17, sessions: 33 },
      { slug: 'timing', score: 84, baselineScore: 68, delta: 16, sessions: 29 },
      { slug: 'attention', score: 81, baselineScore: 67, delta: 14, sessions: 28 },
    ],
    personality: [
      { slug: 'extraversion', score: 83, baselineScore: 75, delta: 8, sessions: 30 },
      { slug: 'openness', score: 79, baselineScore: 72, delta: 7, sessions: 30 },
    ],
    mood: [
      { slug: 'energise', score: 85, baselineScore: 71, delta: 14, sessions: 28 },
      { slug: 'focus', score: 82, baselineScore: 69, delta: 13, sessions: 25 },
    ],
    games: [
      { gameSlug: 'hextris', gameName: 'Hextris', sessionsPlayed: 31, totalPlaySeconds: 10500, bestScore: 4110, avgFlowScore: 84, lastPlayedAt: daysAgoIso(0.5) },
      { gameSlug: 'snake-attack', gameName: 'Snake Attack', sessionsPlayed: 20, totalPlaySeconds: 6800, bestScore: 1850, avgFlowScore: 82, lastPlayedAt: daysAgoIso(1.5) },
    ],
    sessions: [],
    badges: [],
    goalSkills: ['perceptual-speed', 'timing'],
    goalMoods: ['energise', 'focus'],
    sharedLessons: [],
  },
  {
    userId: 'player-alex',
    displayName: 'Alex Rivera',
    friendCode: 'SP-2W5G-9J6K',
    avatarColor: '#f472b6',
    bio: 'Public Activity Summary, with Skillprint & Game Stats restricted to Friends Only.',
    joinedAt: '2026-03-10T00:00:00Z',
    initialRelationship: 'none',
    defaultGroups: {
      activitySummary: 'public',
      cognitionPersonality: 'friends',
      moodSignals: 'private',
      gameStats: 'friends',
      sessionHistory: 'private',
      badgesGoalsLessons: 'friends',
    },
    activitySummary: {
      sessions: 37,
      totalPlaySeconds: 13200,
      activeDays: 14,
      streakDays: 2,
      lastPlayedAt: daysAgoIso(1.8),
    },
    cognition: [
      { slug: 'spatial', score: 84, baselineScore: 69, delta: 15, sessions: 19 },
      { slug: 'visualization', score: 80, baselineScore: 66, delta: 14, sessions: 17 },
      { slug: 'memory', score: 77, baselineScore: 65, delta: 12, sessions: 15 },
    ],
    personality: [
      { slug: 'openness', score: 85, baselineScore: 77, delta: 8, sessions: 18 },
      { slug: 'agreeableness', score: 78, baselineScore: 71, delta: 7, sessions: 18 },
    ],
    mood: [
      { slug: 'creativity', score: 83, baselineScore: 70, delta: 13, sessions: 18 },
    ],
    games: [
      { gameSlug: 'box-tower', gameName: 'Box Tower', sessionsPlayed: 21, totalPlaySeconds: 7400, bestScore: 88, avgFlowScore: 83, lastPlayedAt: daysAgoIso(1.8) },
      { gameSlug: 'gummy-blocks', gameName: 'Gummy Blocks', sessionsPlayed: 16, totalPlaySeconds: 5800, bestScore: 3420, avgFlowScore: 80, lastPlayedAt: daysAgoIso(3.0) },
    ],
    sessions: [],
    badges: [],
    goalSkills: ['spatial', 'visualization'],
    goalMoods: ['creativity'],
    sharedLessons: [],
  },
  {
    userId: 'island-zen',
    displayName: 'Zen (LLM Island AI)',
    friendCode: 'SP-ZEN0-0002',
    avatarColor: '#2dd4bf',
    isAiPersona: true,
    personaRole: 'Flow & Calm Coach AI',
    bio: 'Mindfulness & flow AI agent from LLM Island. Specializes in steady pacing, emotional stability, and low-error recovery.',
    joinedAt: '2026-01-05T00:00:00Z',
    initialRelationship: 'none',
    defaultGroups: {
      activitySummary: 'public',
      cognitionPersonality: 'public',
      moodSignals: 'public',
      gameStats: 'public',
      sessionHistory: 'public',
      badgesGoalsLessons: 'public',
    },
    activitySummary: {
      sessions: 98,
      totalPlaySeconds: 35200,
      activeDays: 36,
      streakDays: 9,
      lastPlayedAt: daysAgoIso(0.3),
    },
    cognition: [
      { slug: 'attention', score: 86, baselineScore: 71, delta: 15, sessions: 48 },
      { slug: 'memory', score: 84, baselineScore: 70, delta: 14, sessions: 44 },
      { slug: 'task-switching', score: 82, baselineScore: 68, delta: 14, sessions: 40 },
    ],
    personality: [
      { slug: 'emotional-stability', score: 94, baselineScore: 82, delta: 12, sessions: 50 },
      { slug: 'agreeableness', score: 88, baselineScore: 79, delta: 9, sessions: 50 },
    ],
    mood: [
      { slug: 'relax', score: 93, baselineScore: 76, delta: 17, sessions: 52 },
      { slug: 'focus', score: 87, baselineScore: 72, delta: 15, sessions: 46 },
      { slug: 'empathy', score: 85, baselineScore: 74, delta: 11, sessions: 38 },
    ],
    games: [
      { gameSlug: 'gummy-blocks', gameName: 'Gummy Blocks', sessionsPlayed: 42, totalPlaySeconds: 15100, bestScore: 4390, avgFlowScore: 92, lastPlayedAt: daysAgoIso(0.3) },
      { gameSlug: 'cat-focus', gameName: 'Cat Focus', sessionsPlayed: 34, totalPlaySeconds: 12200, bestScore: 2340, avgFlowScore: 90, lastPlayedAt: daysAgoIso(1.0) },
    ],
    sessions: [
      { sessionId: 'zen-s1', gameSlug: 'gummy-blocks', gameName: 'Gummy Blocks', playedAt: daysAgoIso(0.3), durationSeconds: 420, primaryMood: 'relax', primaryScore: 4390 },
    ],
    badges: [],
    goalSkills: ['attention', 'memory'],
    goalMoods: ['relax', 'focus'],
    sharedLessons: [
      {
        id: 'lesson-zen-1',
        gameSlug: 'gummy-blocks',
        gameTitle: 'Gummy Blocks',
        kind: 'works',
        text: 'Clear horizontal lines before vertical columns to keep the center 4x4 grid open for 3x3 blocks.',
        createdAt: daysAgoIso(1.2),
      },
    ],
  },
];

export function buildGatedProfileFromSeed(
  record: SeedPlayerRecord,
  relationship: RelationshipStatus,
): GatedFriendProfile {
  const { visibleGroups, gateReasons } = evaluateEffectivePrivacy(
    record.defaultGroups,
    relationship,
    record.overridesForViewer,
  );

  return {
    user: {
      userId: record.userId,
      displayName: record.displayName,
      friendCode: record.friendCode,
      joinedAt: record.joinedAt,
      avatarColor: record.avatarColor,
      isAiPersona: record.isAiPersona,
      personaRole: record.personaRole,
      bio: record.bio,
    },
    relationship,
    visibleGroups,
    gateReasons,
    ownerDefaultGroups: record.defaultGroups,
    activitySummary: visibleGroups.activitySummary ? record.activitySummary : null,
    cognitionPersonality: visibleGroups.cognitionPersonality
      ? {
          cognition: record.cognition,
          personality: record.personality,
          percentiles: {
            cognition: record.cognition.map((c) => ({ slug: c.slug, percentile: Math.min(99, c.score + 4) })),
            personality: record.personality.map((p) => ({ slug: p.slug, percentile: Math.min(99, p.score + 2) })),
          },
        }
      : null,
    moodSignals: visibleGroups.moodSignals
      ? {
          mood: record.mood,
          percentiles: record.mood.map((m) => ({ slug: m.slug, percentile: Math.min(99, m.score + 3) })),
          targetMoods: record.goalMoods,
        }
      : null,
    gameStats: visibleGroups.gameStats
      ? {
          games: record.games,
        }
      : null,
    sessionHistory: visibleGroups.sessionHistory
      ? {
          results: record.sessions.map((s) => ({
            ...s,
            primaryMood: visibleGroups.moodSignals ? s.primaryMood : null,
          })),
        }
      : null,
    badgesGoalsLessons: visibleGroups.badgesGoalsLessons
      ? {
          totalUnlocked: record.badges.length,
          totalBadges: 22,
          totalPoints: record.badges.reduce((sum, b) => sum + b.points, 0),
          badges: record.badges,
          goalSkills: record.goalSkills,
          goalMoods: visibleGroups.moodSignals ? record.goalMoods : [],
          sharedLessons: record.sharedLessons,
        }
      : null,
  };
}
