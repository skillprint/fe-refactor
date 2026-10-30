import type { ProfileBadge } from './models/portal/ProfileBadges';
import { daysUntilDue, dueLabel, type AssignedPlaybook } from './models/portal/AssignedPlaybook';
import type { HomeSummary } from './models/portal/HomeSummary';
import type { Insight } from './models/portal/Insight';
import type { ProfileTrendsResponse } from './models/portal/ProfileTrends';
import type { EmailAddressState } from './models/portal/useEmailAddress';

export type NotificationTone = 'info' | 'success' | 'warning' | 'danger';

export type NotificationKind =
  | 'welcome'
  | 'first_session'
  | 'pillar_unlock'
  | 'skillprint_ready'
  | 'badge_earned'
  | 'personal_best'
  | 'leaderboard_rank'
  | 'playbook_assigned'
  | 'playbook_due'
  | 'skill_insight'
  | 'streak_milestone'
  | 'save_progress'
  | 'coach_lesson'
  | 'system'
  | 'custom';

export interface PortalNotification {
  id: string;
  title: string;
  message: string;
  tone: NotificationTone;
  createdAt: string;
  read: boolean;
  actionLabel?: string;
  actionHref?: string;
  kind?: NotificationKind;
  categoryLabel?: string;
  icon?: string;
}

export type NewNotificationInput = {
  id?: string;
  title: string;
  message: string;
  tone?: NotificationTone;
  createdAt?: string;
  read?: boolean;
  actionLabel?: string;
  actionHref?: string;
  kind?: NotificationKind;
  categoryLabel?: string;
  icon?: string;
};

export interface PlatformSyncPayload {
  homeSummary?:
    | (Partial<Omit<HomeSummary, 'pillarAverages'>> & {
        pillarAverages?: Partial<HomeSummary['pillarAverages']>;
      })
    | null;
  badges?: Array<
    Pick<ProfileBadge, 'slug' | 'name' | 'animalName' | 'gameName' | 'reason'> & {
      seen?: boolean;
    }
  > | null;
  assignedPlaybooks?: Array<
    Pick<AssignedPlaybook, 'assignmentId' | 'slug' | 'title'> &
      Partial<
        Pick<
          AssignedPlaybook,
          'assignedByName' | 'note' | 'description' | 'status' | 'dueAt' | 'progress'
        >
      >
  > | null;
  insights?: Array<
    Pick<Insight, 'id' | 'title' | 'body'> & Partial<Pick<Insight, 'pillar' | 'dimension'>>
  > | null;
  trends?:
    | (Partial<Omit<ProfileTrendsResponse, 'pillars'>> & {
        pillars?: {
          mood?: { delta?: number | null };
          cognition?: { delta?: number | null };
          personality?: { delta?: number | null };
        };
      })
    | null;
  emailState?: Partial<EmailAddressState> | null;
  authStatus?: string | null;
}

/**
 * Design system section 29 (Notifications):
 * "19px of Skills Pink holds a single figure. Past nine it reads `9+`"
 */
export function formatNotificationBadgeCount(count: number): string {
  if (count <= 0) return '';
  if (count > 9) return '9+';
  return String(count);
}

/**
 * Design system section 29 (Notifications):
 * "The count must appear in the control accessible name —
 * `aria-label="Games, 3 notifications"` / `aria-label="Notifications, 9 or more waiting"`."
 */
export function formatNotificationsAriaLabel(count: number, baseLabel = 'Notifications'): string {
  if (count <= 0) return baseLabel;
  if (count === 1) return `${baseLabel}, 1 notification`;
  if (count > 9) return `${baseLabel}, 9 or more waiting`;
  return `${baseLabel}, ${count} notifications`;
}

export function iconForNotificationItem(
  item: Pick<PortalNotification, 'tone' | 'kind' | 'icon'>,
): string {
  if (item.icon) return item.icon;
  switch (item.kind) {
    case 'welcome':
    case 'skillprint_ready':
      return '#ti-star';
    case 'first_session':
      return '#ti-gamepad';
    case 'pillar_unlock':
      return '#ti-chart';
    case 'badge_earned':
    case 'personal_best':
    case 'leaderboard_rank':
      return '#ti-trophy';
    case 'playbook_assigned':
      return '#ti-calendar';
    case 'playbook_due':
      return '#ti-clock';
    case 'skill_insight':
      return '#ti-trending';
    case 'streak_milestone':
      return '#ti-bolt';
    case 'save_progress':
      return '#ti-mail';
    case 'coach_lesson':
      return '#ti-mood-curiosity';
    default:
      break;
  }
  switch (item.tone) {
    case 'success':
      return '#ti-success';
    case 'warning':
      return '#ti-alert';
    case 'danger':
      return '#ti-error';
    case 'info':
    default:
      return '#ti-info';
  }
}

/* ── Notification Builders for Platform Events ─────────────────────────── */

export function createWelcomeNotification(id = 'welcome-to-skillprint'): PortalNotification {
  return {
    id,
    title: 'Welcome to Skillprint',
    message:
      'Play short games to uncover your mood, cognition, and personality signals. Play at least 5 sessions to unlock your full Skillprint.',
    tone: 'info',
    createdAt: new Date().toISOString(),
    read: false,
    actionLabel: 'Explore games',
    actionHref: '/games',
    kind: 'welcome',
    categoryLabel: 'Welcome',
    icon: '#ti-star',
  };
}

export function createFirstSessionNotification(gameName?: string): PortalNotification {
  return {
    id: 'milestone-first-session',
    title: 'First session complete',
    message: `${gameName ? `Nice run in ${gameName}! ` : ''}Mood signals are now active. Play 4 more sessions to unlock your full Skillprint wheel.`,
    tone: 'info',
    createdAt: new Date().toISOString(),
    read: false,
    actionLabel: 'Keep playing',
    actionHref: '/games',
    kind: 'first_session',
    categoryLabel: 'Milestone',
    icon: '#ti-gamepad',
  };
}

export function createPillarUnlockNotification(
  pillar: 'mood' | 'cognition' | 'personality',
  averageScore?: number | null,
): PortalNotification {
  const labels: Record<
    'mood' | 'cognition' | 'personality',
    { name: string; icon: string; desc: string }
  > = {
    mood: {
      name: 'Mood',
      icon: '#ti-category-mood',
      desc: 'Your mood dimension scores (Focus, Relax, Grit, Creativity) are now live.',
    },
    cognition: {
      name: 'Cognition',
      icon: '#ti-category-cognition',
      desc: 'See how your attention, planning, perceptual speed, and pattern matching compare.',
    },
    personality: {
      name: 'Personality',
      icon: '#ti-category-personality',
      desc: 'Your openness, conscientiousness, and emotional stability readings are ready.',
    },
  };
  const info = labels[pillar];
  const scoreNote =
    averageScore != null ? ` Current pillar average: ${Math.round(averageScore)}.` : '';

  return {
    id: `milestone-pillar-${pillar}`,
    title: `${info.name} pillar unlocked`,
    message: `${info.desc}${scoreNote}`,
    tone: 'info',
    createdAt: new Date().toISOString(),
    read: false,
    actionLabel: `View ${info.name}`,
    actionHref: `/skills#${pillar}`,
    kind: 'pillar_unlock',
    categoryLabel: 'Pillar Unlock',
    icon: info.icon,
  };
}

export function createSkillprintReadyNotification(totalSessions = 5): PortalNotification {
  return {
    id: 'milestone-skillprint-ready',
    title: 'Your Skillprint is ready',
    message: `You've completed ${totalSessions} sessions! Your full 87-feature Skillprint wheel is now inked and ready to explore.`,
    tone: 'success',
    createdAt: new Date().toISOString(),
    read: false,
    actionLabel: 'View Skillprint',
    actionHref: '/profile',
    kind: 'skillprint_ready',
    categoryLabel: 'Skillprint',
    icon: '#ti-star',
  };
}

export function createBadgeEarnedNotification(
  badge: Pick<ProfileBadge, 'slug' | 'name' | 'animalName' | 'gameName' | 'reason'> & {
    earnedAt?: string;
  },
): PortalNotification {
  return {
    id: `badge-earned-${badge.slug}`,
    title: `New badge: ${badge.animalName} (${badge.name})`,
    message: `${badge.reason}${badge.gameName ? ` in ${badge.gameName}` : ''}.`,
    tone: 'success',
    createdAt: badge.earnedAt || new Date().toISOString(),
    read: false,
    actionLabel: 'View badge',
    actionHref: `/badge/${encodeURIComponent(badge.slug)}`,
    kind: 'badge_earned',
    categoryLabel: 'Badge Earned',
    icon: '#ti-trophy',
  };
}

export function createPersonalBestNotification(params: {
  gameSlug: string;
  gameTitle: string;
  score: number;
  previousBest?: number | null;
  sessionId?: string;
}): PortalNotification {
  const prevText =
    params.previousBest != null && params.previousBest > 0
      ? ` (beating your previous best of ${params.previousBest.toLocaleString()})`
      : '';
  return {
    id: `personal-best-${params.gameSlug}-${params.sessionId || params.score}`,
    title: `New personal best in ${params.gameTitle}`,
    message: `You scored ${params.score.toLocaleString()} points${prevText}!`,
    tone: 'success',
    createdAt: new Date().toISOString(),
    read: false,
    actionLabel: 'View game record',
    actionHref: `/game_detail?slug=${encodeURIComponent(params.gameSlug)}`,
    kind: 'personal_best',
    categoryLabel: 'Personal Best',
    icon: '#ti-trophy',
  };
}

export function createLeaderboardRankNotification(params: {
  gameSlug: string;
  gameTitle: string;
  rank: number;
  score: number;
  period: 'week' | 'all';
  totalPlayers?: number;
}): PortalNotification {
  const periodText = params.period === 'week' ? 'this week' : 'all time';
  const fieldText = params.totalPlayers
    ? ` out of ${params.totalPlayers.toLocaleString()} players`
    : '';
  return {
    id: `leaderboard-rank-${params.gameSlug}-${params.period}-${params.rank}`,
    title: `Ranked #${params.rank} on ${params.gameTitle}`,
    message: `Your score of ${params.score.toLocaleString()} stands #${params.rank}${fieldText} ${periodText}.`,
    tone: 'success',
    createdAt: new Date().toISOString(),
    read: false,
    actionLabel: 'View leaderboard',
    actionHref: `/game_detail?slug=${encodeURIComponent(params.gameSlug)}#gdBoard`,
    kind: 'leaderboard_rank',
    categoryLabel: 'Leaderboard',
    icon: '#ti-trophy',
  };
}

export function createPlaybookAssignedNotification(
  playbook: Pick<
    AssignedPlaybook,
    'assignmentId' | 'slug' | 'title' | 'assignedByName' | 'note' | 'description'
  >,
): PortalNotification {
  const copy = playbook.note ? `"${playbook.note}"` : playbook.description;
  return {
    id: `playbook-assigned-${playbook.assignmentId}`,
    title: `${playbook.assignedByName} assigned ${playbook.title}`,
    message: copy,
    tone: 'info',
    createdAt: new Date().toISOString(),
    read: false,
    actionLabel: 'Open playbook',
    actionHref: `/playbooks?slug=${encodeURIComponent(playbook.slug)}`,
    kind: 'playbook_assigned',
    categoryLabel: 'Assignment',
    icon: '#ti-calendar',
  };
}

export function createPlaybookDueNotification(
  playbook: Pick<AssignedPlaybook, 'assignmentId' | 'slug' | 'title' | 'dueAt' | 'progress'>,
): PortalNotification {
  const due = dueLabel(playbook.dueAt);
  const statusText = due ? due.text : 'Due soon';
  return {
    id: `playbook-due-${playbook.assignmentId}-${playbook.dueAt || 'soon'}`,
    title: `${playbook.title} · ${statusText}`,
    message: `${playbook.progress.playedGames} of ${playbook.progress.totalGames} games completed (${playbook.progress.percent}%).`,
    tone: 'warning',
    createdAt: new Date().toISOString(),
    read: false,
    actionLabel: 'Continue playbook',
    actionHref: `/playbooks?slug=${encodeURIComponent(playbook.slug)}`,
    kind: 'playbook_due',
    categoryLabel: 'Deadline',
    icon: '#ti-clock',
  };
}

export function createSkillInsightNotification(params: {
  id?: string | number;
  title: string;
  body: string;
  pillar?: string;
  dimension?: string;
}): PortalNotification {
  const slugKey = String(params.id || params.title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  const href = params.pillar ? `/skills#${params.pillar.toLowerCase()}` : '/skills';
  return {
    id: `skill-insight-${slugKey}`,
    title: `Insight · ${params.title}`,
    message: params.body,
    tone: 'success',
    createdAt: new Date().toISOString(),
    read: false,
    actionLabel: 'Explore skills',
    actionHref: href,
    kind: 'skill_insight',
    categoryLabel: 'Skill Insight',
    icon: '#ti-trending',
  };
}

export function createStreakMilestoneNotification(streakDays: number): PortalNotification {
  return {
    id: `streak-milestone-${streakDays}d`,
    title: `${streakDays}-day play streak`,
    message: `You've played ${streakDays} days in a row! Play one quick session today to keep your streak alive.`,
    tone: 'info',
    createdAt: new Date().toISOString(),
    read: false,
    actionLabel: 'Play a session',
    actionHref: '/games',
    kind: 'streak_milestone',
    categoryLabel: 'Streak',
    icon: '#ti-bolt',
  };
}

export function createSaveProgressNotification(totalSessions?: number): PortalNotification {
  const countText =
    totalSessions && totalSessions > 1 ? `${totalSessions} sessions` : 'your recent sessions';
  return {
    id: 'account-save-progress',
    title: 'Warning · save your Skillprint progress',
    message: `You've recorded ${countText} on a guest profile. Link an email address in Settings so you don't lose your history.`,
    tone: 'warning',
    createdAt: new Date().toISOString(),
    read: false,
    actionLabel: 'Link email in Settings',
    actionHref: '/settings',
    kind: 'save_progress',
    categoryLabel: 'Account',
    icon: '#ti-mail',
  };
}

export function createCoachLessonNotification(params: {
  id?: string;
  coachName?: string;
  gameTitle: string;
  text: string;
}): PortalNotification {
  const coach = params.coachName || 'AI Coach';
  return {
    id: `coach-lesson-${params.id || Date.now()}`,
    title: `${coach} · ${params.gameTitle} reflection`,
    message: params.text,
    tone: 'info',
    createdAt: new Date().toISOString(),
    read: false,
    actionLabel: 'View profile lessons',
    actionHref: '/profile#lessons',
    kind: 'coach_lesson',
    categoryLabel: 'AI Coach',
    icon: '#ti-mood-curiosity',
  };
}

/**
 * Evaluates a platform data snapshot and returns all deterministic notifications
 * that apply to the player's current state. Used on the backend (`/api/notifications`)
 * to generate notifications from live portal data.
 */
export function evaluatePlatformNotifications(payload: PlatformSyncPayload): PortalNotification[] {
  const generated: PortalNotification[] = [];

  const { homeSummary, badges, assignedPlaybooks, insights, trends, emailState, authStatus } =
    payload;

  if (homeSummary) {
    if (homeSummary.totalSessions === 1) {
      generated.push(createFirstSessionNotification());
    }
    if (homeSummary.pillarAverages?.cognition != null) {
      generated.push(
        createPillarUnlockNotification('cognition', homeSummary.pillarAverages.cognition),
      );
    }
    if (homeSummary.pillarAverages?.personality != null) {
      generated.push(
        createPillarUnlockNotification('personality', homeSummary.pillarAverages.personality),
      );
    }
    if (typeof homeSummary.totalSessions === 'number' && homeSummary.totalSessions >= 5) {
      generated.push(createSkillprintReadyNotification(homeSummary.totalSessions));
    }
    if (typeof homeSummary.streakDays === 'number' && homeSummary.streakDays >= 3) {
      generated.push(createStreakMilestoneNotification(homeSummary.streakDays));
    }
  }

  if (Array.isArray(badges)) {
    for (const badge of badges) {
      if (badge && badge.seen === false) {
        generated.push(createBadgeEarnedNotification(badge));
      }
    }
  }

  if (Array.isArray(assignedPlaybooks)) {
    for (const playbook of assignedPlaybooks) {
      if (!playbook) continue;
      if (playbook.status === 'not_started') {
        generated.push(
          createPlaybookAssignedNotification({
            assignmentId: playbook.assignmentId,
            slug: playbook.slug,
            title: playbook.title,
            assignedByName: playbook.assignedByName ?? '',
            note: playbook.note ?? '',
            description: playbook.description ?? '',
          }),
        );
      }
      if (playbook.status !== 'complete' && playbook.dueAt) {
        const days = daysUntilDue(playbook.dueAt);
        if (days !== null && days <= 1) {
          generated.push(
            createPlaybookDueNotification({
              assignmentId: playbook.assignmentId,
              slug: playbook.slug,
              title: playbook.title,
              dueAt: playbook.dueAt,
              progress: playbook.progress ?? { totalGames: 0, playedGames: 0, percent: 0 },
            }),
          );
        }
      }
    }
  }

  if (Array.isArray(insights)) {
    for (const insight of insights) {
      if (insight?.title && insight?.body) {
        generated.push(
          createSkillInsightNotification({
            id: insight.id,
            title: insight.title,
            body: insight.body,
            pillar: insight.pillar,
            dimension: insight.dimension,
          }),
        );
      }
    }
  }

  if (trends?.pillars) {
    const entries: Array<['mood' | 'cognition' | 'personality', string]> = [
      ['mood', 'Mood'],
      ['cognition', 'Cognition'],
      ['personality', 'Personality'],
    ];
    for (const [key, label] of entries) {
      const delta = trends.pillars[key]?.delta;
      if (delta != null && delta >= 5) {
        generated.push(
          createSkillInsightNotification({
            id: `trend-${key}-plus-${Math.round(delta)}`,
            title: `${label} trending +${Math.round(delta)} pts`,
            body: `Your ${label.toLowerCase()} score is up ${Math.round(delta)} points above your baseline.`,
            pillar: key,
          }),
        );
      }
    }
  }

  const totalSessions = homeSummary?.totalSessions ?? 0;
  if (totalSessions >= 2) {
    const needsEmail =
      authStatus === 'guest' ||
      Boolean(emailState?.available && !emailState.email && !emailState.pending);
    if (needsEmail) {
      generated.push(createSaveProgressNotification(totalSessions));
    }
  }

  return generated;
}

export const PLATFORM_NOTIFICATION_PRESETS: Array<{
  key: NotificationKind;
  label: string;
  create: () => PortalNotification;
}> = [
  {
    key: 'welcome',
    label: 'Welcome notification',
    create: () => createWelcomeNotification(`welcome-${Date.now()}`),
  },
  {
    key: 'first_session',
    label: 'First session complete',
    create: () => ({
      ...createFirstSessionNotification('Hextris'),
      id: `milestone-first-session-${Date.now()}`,
    }),
  },
  {
    key: 'pillar_unlock',
    label: 'Pillar unlocked (Cognition)',
    create: () => ({
      ...createPillarUnlockNotification('cognition', 72),
      id: `milestone-pillar-cognition-${Date.now()}`,
    }),
  },
  {
    key: 'skillprint_ready',
    label: 'Full Skillprint ready (5 sessions)',
    create: () => ({
      ...createSkillprintReadyNotification(5),
      id: `milestone-skillprint-ready-${Date.now()}`,
    }),
  },
  {
    key: 'badge_earned',
    label: 'Badge earned (Copycat Cuttlefish)',
    create: () => ({
      ...createBadgeEarnedNotification({
        slug: 'pattern-matching',
        name: 'Pattern Matching',
        animalName: 'Copycat Cuttlefish',
        gameName: 'Hextris',
        reason: 'Reached 72% mastery in Pattern Matching',
      }),
      id: `badge-earned-pattern-matching-${Date.now()}`,
    }),
  },
  {
    key: 'personal_best',
    label: 'New personal best score',
    create: () =>
      createPersonalBestNotification({
        gameSlug: 'hextris',
        gameTitle: 'Hextris',
        score: 4820,
        previousBest: 3990,
        sessionId: String(Date.now()),
      }),
  },
  {
    key: 'leaderboard_rank',
    label: 'Weekly leaderboard top rank',
    create: () => ({
      ...createLeaderboardRankNotification({
        gameSlug: 'hextris',
        gameTitle: 'Hextris',
        rank: 1,
        score: 3120,
        period: 'week',
        totalPlayers: 23,
      }),
      id: `leaderboard-rank-hextris-week-${Date.now()}`,
    }),
  },
  {
    key: 'playbook_assigned',
    label: 'Coach assigned playbook',
    create: () => ({
      ...createPlaybookAssignedNotification({
        assignmentId: `as-1-${Date.now()}`,
        slug: 'match-day-warm-up',
        title: 'Match-day warm-up',
        assignedByName: 'Coach Whitfield',
        note: 'Before Tuesday’s match. Ten minutes, no excuses.',
        description: 'Ten minutes before first serve.',
      }),
    }),
  },
  {
    key: 'playbook_due',
    label: 'Playbook deadline reminder',
    create: () => ({
      ...createPlaybookDueNotification({
        assignmentId: `as-2-${Date.now()}`,
        slug: 'reaction-ladder',
        title: 'Reaction ladder',
        dueAt: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10),
        progress: { totalGames: 4, playedGames: 2, percent: 50 },
      }),
    }),
  },
  {
    key: 'skill_insight',
    label: 'Skill trend insight',
    create: () =>
      createSkillInsightNotification({
        id: Date.now(),
        title: 'Rising Star in Attention',
        body: 'Your Attention score has improved by +12% over your last weekly sessions.',
        pillar: 'cognition',
      }),
  },
  {
    key: 'streak_milestone',
    label: 'Active play streak (4 days)',
    create: () => ({
      ...createStreakMilestoneNotification(4),
      id: `streak-milestone-4d-${Date.now()}`,
    }),
  },
  {
    key: 'save_progress',
    label: 'Guest save-progress reminder',
    create: () => ({
      ...createSaveProgressNotification(3),
      id: `account-save-progress-${Date.now()}`,
    }),
  },
  {
    key: 'coach_lesson',
    label: 'AI Coach post-game lesson',
    create: () =>
      createCoachLessonNotification({
        id: String(Date.now()),
        coachName: 'Hana',
        gameTitle: 'Hextris',
        text: 'Keep rotating the outer ring early when three matching blocks queue up.',
      }),
  },
];
