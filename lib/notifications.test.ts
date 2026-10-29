import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBadgeEarnedNotification,
  createCoachLessonNotification,
  createFirstSessionNotification,
  createLeaderboardRankNotification,
  createPersonalBestNotification,
  createPillarUnlockNotification,
  createPlaybookAssignedNotification,
  createPlaybookDueNotification,
  createSaveProgressNotification,
  createSkillInsightNotification,
  createSkillprintReadyNotification,
  createStreakMilestoneNotification,
  createWelcomeNotification,
  evaluatePlatformNotifications,
  formatNotificationBadgeCount,
  formatNotificationsAriaLabel,
  PLATFORM_NOTIFICATION_PRESETS,
} from './notificationsCore';

test('formatNotificationBadgeCount keeps counts to one digit and caps at 9+', () => {
  assert.equal(formatNotificationBadgeCount(0), '');
  assert.equal(formatNotificationBadgeCount(-2), '');
  assert.equal(formatNotificationBadgeCount(1), '1');
  assert.equal(formatNotificationBadgeCount(9), '9');
  assert.equal(formatNotificationBadgeCount(10), '9+');
  assert.equal(formatNotificationBadgeCount(25), '9+');
});

test('formatNotificationsAriaLabel embeds the count in the accessible name', () => {
  assert.equal(formatNotificationsAriaLabel(0), 'Notifications');
  assert.equal(formatNotificationsAriaLabel(1), 'Notifications, 1 notification');
  assert.equal(formatNotificationsAriaLabel(3), 'Notifications, 3 notifications');
  assert.equal(formatNotificationsAriaLabel(12), 'Notifications, 9 or more waiting');
});

test('createWelcomeNotification returns an unread welcome notification pointing to games', () => {
  const welcome = createWelcomeNotification();
  assert.equal(welcome.id, 'welcome-to-skillprint');
  assert.equal(welcome.title, 'Welcome to Skillprint');
  assert.equal(welcome.read, false);
  assert.equal(welcome.tone, 'info');
  assert.equal(welcome.kind, 'welcome');
  assert.equal(welcome.actionHref, '/games');
});

test('platform notification builders generate expected kinds, tones, and deep links', () => {
  const firstSession = createFirstSessionNotification('Hextris');
  assert.equal(firstSession.kind, 'first_session');
  assert.equal(firstSession.actionHref, '/games');

  const pillar = createPillarUnlockNotification('cognition', 74);
  assert.equal(pillar.kind, 'pillar_unlock');
  assert.equal(pillar.actionHref, '/skills#cognition');

  const ready = createSkillprintReadyNotification(5);
  assert.equal(ready.kind, 'skillprint_ready');
  assert.equal(ready.tone, 'success');
  assert.equal(ready.actionHref, '/profile');

  const badge = createBadgeEarnedNotification({
    slug: 'pattern-matching',
    name: 'Pattern Matching',
    animalName: 'Copycat Cuttlefish',
    gameName: 'Hextris',
    reason: 'Reached 72% mastery',
  });
  assert.equal(badge.kind, 'badge_earned');
  assert.equal(badge.actionHref, '/badge/pattern-matching');

  const pb = createPersonalBestNotification({
    gameSlug: 'hextris',
    gameTitle: 'Hextris',
    score: 4820,
    previousBest: 3990,
  });
  assert.equal(pb.kind, 'personal_best');
  assert.equal(pb.tone, 'success');

  const rank = createLeaderboardRankNotification({
    gameSlug: 'hextris',
    gameTitle: 'Hextris',
    rank: 1,
    score: 3120,
    period: 'week',
    totalPlayers: 23,
  });
  assert.equal(rank.kind, 'leaderboard_rank');
  assert.equal(rank.actionHref, '/game_detail?slug=hextris#gdBoard');

  const assigned = createPlaybookAssignedNotification({
    assignmentId: 'as-1',
    slug: 'match-day-warm-up',
    title: 'Match-day warm-up',
    assignedByName: 'Coach Whitfield',
    note: 'Ten minutes, no excuses.',
    description: 'Warm up.',
  });
  assert.equal(assigned.kind, 'playbook_assigned');

  const due = createPlaybookDueNotification({
    assignmentId: 'as-2',
    slug: 'reaction-ladder',
    title: 'Reaction ladder',
    dueAt: new Date().toISOString().slice(0, 10),
    progress: { totalGames: 4, playedGames: 2, percent: 50 },
  });
  assert.equal(due.kind, 'playbook_due');
  assert.equal(due.tone, 'warning');

  const insight = createSkillInsightNotification({
    id: 17,
    title: 'Rising Star',
    body: 'Your Attention has improved by 12% recently.',
    pillar: 'cognition',
  });
  assert.equal(insight.kind, 'skill_insight');
  assert.equal(insight.actionHref, '/skills#cognition');

  const streak = createStreakMilestoneNotification(4);
  assert.equal(streak.kind, 'streak_milestone');

  const save = createSaveProgressNotification(3);
  assert.equal(save.kind, 'save_progress');
  assert.equal(save.tone, 'warning');
  assert.equal(save.actionHref, '/settings');

  const lesson = createCoachLessonNotification({
    id: 'l-1',
    coachName: 'Hana',
    gameTitle: 'Hextris',
    text: 'Rotate early.',
  });
  assert.equal(lesson.kind, 'coach_lesson');
  assert.equal(lesson.actionHref, '/profile#lessons');

  assert.equal(PLATFORM_NOTIFICATION_PRESETS.length, 13);
});

test('evaluatePlatformNotifications evaluates server sync payload into platform notifications', () => {
  const generated = evaluatePlatformNotifications({
    homeSummary: {
      totalSessions: 5,
      streakDays: 3,
      pillarAverages: {
        cognition: 72,
        personality: 65,
      },
    },
    badges: [
      {
        slug: 'pattern-matching',
        name: 'Pattern Matching',
        animalName: 'Copycat Cuttlefish',
        gameName: 'Hextris',
        reason: 'Reached 72% mastery',
        seen: false,
      },
    ],
    assignedPlaybooks: [
      {
        assignmentId: 'as-1',
        slug: 'match-day-warm-up',
        title: 'Match-day warm-up',
        assignedByName: 'Coach Whitfield',
        note: 'Ten minutes',
        description: 'Warm up',
        status: 'not_started',
      },
    ],
    insights: [
      {
        id: 101,
        title: 'Focus climbing',
        body: 'Focus is up 11% this week.',
        pillar: 'cognition',
      },
    ],
    trends: {
      pillars: {
        mood: { delta: 7 },
      },
    },
    authStatus: 'guest',
  });

  const kinds = generated.map((item) => item.kind);
  assert.ok(kinds.includes('pillar_unlock'));
  assert.ok(kinds.includes('skillprint_ready'));
  assert.ok(kinds.includes('streak_milestone'));
  assert.ok(kinds.includes('badge_earned'));
  assert.ok(kinds.includes('playbook_assigned'));
  assert.ok(kinds.includes('skill_insight'));
  assert.ok(kinds.includes('save_progress'));
});
