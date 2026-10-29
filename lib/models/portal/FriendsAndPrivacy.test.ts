import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PRIVACY_GROUPS,
  PRIVACY_GROUPING_CATALOG,
  PRIVACY_GROUPING_KEYS,
  PRIVACY_PRESETS,
  SEEDED_PLAYERS,
  buildGatedProfileFromSeed,
  enrichLeaderboardWithFriends,
  evaluateEffectivePrivacy,
} from './FriendsAndPrivacy';
import {
  formatLeaderboardPlayerLabel,
  generateMockLibraryGameLeaderboard,
  normalizeLeaderboardBoard,
  shortenPlayerId,
} from './LibraryGameLeaderboard';

test('PRIVACY_GROUPING_CATALOG covers all 6 discovered user data groupings', () => {
  assert.equal(PRIVACY_GROUPING_CATALOG.length, 6);
  const catalogKeys = PRIVACY_GROUPING_CATALOG.map((g) => g.key);
  assert.deepEqual(catalogKeys, PRIVACY_GROUPING_KEYS);
  // Mood Signals and Session History default to private
  assert.equal(DEFAULT_PRIVACY_GROUPS.moodSignals, 'private');
  assert.equal(DEFAULT_PRIVACY_GROUPS.sessionHistory, 'private');
  assert.equal(DEFAULT_PRIVACY_GROUPS.cognitionPersonality, 'friends');
  assert.equal(DEFAULT_PRIVACY_GROUPS.gameStats, 'friends');
});

test('evaluateEffectivePrivacy allows all 6 groupings for self regardless of default scope', () => {
  const privateVault = PRIVACY_PRESETS.find((p) => p.id === 'private_vault')!.groups;
  const result = evaluateEffectivePrivacy(privateVault, 'self');
  for (const key of PRIVACY_GROUPING_KEYS) {
    assert.equal(result.visibleGroups[key], true);
    assert.equal(result.gateReasons[key], 'allowed');
  }
});

test('evaluateEffectivePrivacy gates friends-only and private groupings for strangers', () => {
  const result = evaluateEffectivePrivacy(
    {
      ...DEFAULT_PRIVACY_GROUPS,
      activitySummary: 'public',
    },
    'none',
  );
  assert.equal(result.visibleGroups.activitySummary, true);
  assert.equal(result.visibleGroups.cognitionPersonality, false);
  assert.equal(result.gateReasons.cognitionPersonality, 'friends_only');
  assert.equal(result.visibleGroups.moodSignals, false);
  assert.equal(result.gateReasons.moodSignals, 'private');
});

test('evaluateEffectivePrivacy honors per-friend allow and deny overrides', () => {
  const result = evaluateEffectivePrivacy(DEFAULT_PRIVACY_GROUPS, 'friend', {
    moodSignals: 'allow', // Default is private, but allowed for this friend
    gameStats: 'deny', // Default is friends, but hidden for this friend
  });

  assert.equal(result.visibleGroups.cognitionPersonality, true);
  assert.equal(result.visibleGroups.moodSignals, true);
  assert.equal(result.gateReasons.moodSignals, 'allowed');
  assert.equal(result.visibleGroups.gameStats, false);
  assert.equal(result.gateReasons.gameStats, 'friend_override_denied');
});

test('buildGatedProfileFromSeed omits restricted payloads and strips primaryMood when moodSignals is private', () => {
  const jordan = SEEDED_PLAYERS.find((p) => p.userId === 'friend-jordan')!;
  const gatedAsFriend = buildGatedProfileFromSeed(jordan, 'friend');

  assert.ok(gatedAsFriend.cognitionPersonality !== null);
  assert.equal(gatedAsFriend.moodSignals, null);
  assert.equal(gatedAsFriend.gateReasons.moodSignals, 'private');
  assert.equal(gatedAsFriend.sessionHistory, null);

  const gatedAsStranger = buildGatedProfileFromSeed(jordan, 'none');
  assert.equal(gatedAsStranger.cognitionPersonality, null);
  assert.equal(gatedAsStranger.gateReasons.cognitionPersonality, 'friends_only');
});

test('enrichLeaderboardWithFriends unmasks accepted friends who share gameStats', () => {
  const board = generateMockLibraryGameLeaderboard('all');
  const maya = SEEDED_PLAYERS.find((p) => p.userId === 'friend-maya')!;
  const devon = SEEDED_PLAYERS.find((p) => p.userId === 'friend-devon')!; // denies gameStats

  const enriched = enrichLeaderboardWithFriends(board, [
    {
      userId: maya.userId,
      displayName: maya.displayName,
      friendCode: maya.friendCode,
      joinedAt: maya.joinedAt,
      relationship: 'friend',
      visibleGroups: {
        activitySummary: true,
        cognitionPersonality: true,
        moodSignals: true,
        gameStats: true,
        sessionHistory: true,
        badgesGoalsLessons: true,
      },
      activitySummary: maya.activitySummary,
      topCognitionSkill: null,
      topMood: null,
      topGameScores: [{ gameSlug: 'hextris', gameName: 'Hextris', bestScore: 4410 }],
    },
    {
      userId: devon.userId,
      displayName: devon.displayName,
      friendCode: devon.friendCode,
      joinedAt: devon.joinedAt,
      relationship: 'friend',
      visibleGroups: {
        activitySummary: true,
        cognitionPersonality: true,
        moodSignals: true,
        gameStats: false, // Denied!
        sessionHistory: false,
        badgesGoalsLessons: true,
      },
      activitySummary: devon.activitySummary,
      topCognitionSkill: null,
      topMood: null,
      topGameScores: [],
    },
  ]);

  assert.ok(enriched);
  const friendRows = enriched!.entries.filter((e) => e.isFriend);
  assert.equal(friendRows.length, 1);
  assert.equal(friendRows[0].userDisplay, 'Maya Lin');
  assert.equal(friendRows[0].userId, 'friend-maya');
});

test('formatLeaderboardPlayerLabel and normalizeLeaderboardBoard resolve descriptive names and playerIds', () => {
  // 1. Named player
  assert.deepEqual(
    formatLeaderboardPlayerLabel({ name: 'Ada Lovelace', playerId: 'ada_l', isYou: false }),
    { userDisplay: 'Ada Lovelace', playerId: 'ada_l' },
  );

  // 2. Viewer with name gets "(You)" suffix
  assert.deepEqual(
    formatLeaderboardPlayerLabel({ name: 'Jeremy', playerId: 'jeremy@mageduel.com', isYou: true }),
    { userDisplay: 'Jeremy (You)', playerId: 'jeremy' },
  );

  // 3. Fallback to shortened UUID playerId when name is missing
  assert.deepEqual(
    formatLeaderboardPlayerLabel({
      name: '',
      playerId: '5f0c1a2b-3c4d-4e5f-8a9b-0c1d2e3f4a5b',
      isYou: true,
    }),
    { userDisplay: 'Player #5f0c1a2b (You)', playerId: '5f0c1a2b' },
  );

  assert.equal(shortenPlayerId('5f0c1a2b-3c4d-4e5f-8a9b-0c1d2e3f4a5b'), '5f0c1a2b');
  assert.equal(shortenPlayerId('player01@demo.skillprint.co'), 'player01');

  // 4. Normalizing a legacy board with "Player N" and "You"
  const normalized = normalizeLeaderboardBoard(
    {
      gameSlug: 'hextris',
      period: 'all',
      totalPlayers: 2,
      entries: [
        { rank: 1, userDisplay: 'Player 1', score: 4200, achievedAt: '2026-10-28T00:00:00Z', isYou: false },
        { rank: 2, userDisplay: 'You', score: 3900, achievedAt: '2026-10-29T00:00:00Z', isYou: true },
      ],
      you: { rank: 2, score: 3900, achievedAt: '2026-10-29T00:00:00Z', sessionId: 's-1' },
    },
    { name: 'Jeremy', playerId: '5f0c1a2b-3c4d-4e5f-8a9b-0c1d2e3f4a5b' },
  );

  assert.ok(normalized);
  assert.notEqual(normalized!.entries[0].userDisplay, 'Player 1');
  assert.ok(normalized!.entries[0].playerId);
  assert.equal(normalized!.entries[1].userDisplay, 'Jeremy (You)');
  assert.equal(normalized!.entries[1].playerId, '5f0c1a2b');
});
