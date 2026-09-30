/**
 * Playbooks a coach assigned to this player (SKI-227).
 *
 * The backend half is SKI-224: `/api/portal/playbooks/` grows a third
 * `source`, `assigned`, carrying the coach's name, the note, the due date and
 * the assignment id. Until that lands, `useAssignedPlaybooks` serves fixtures
 * behind the same sandbox flag as the coach surface, so the player side can be
 * built and reviewed without waiting.
 *
 * The extra fields live in their own interface rather than as optionals on
 * `PlaybookSummary`, so nothing in the existing portal has to learn about
 * assignment to keep compiling.
 */
import type { PlaybookProgress } from './Playbooks';

export type PlayerAssignmentStatus = 'not_started' | 'in_progress' | 'complete';

export interface AssignedPlaybook {
  /** The assignment, not the playbook — a playbook can be assigned twice. */
  assignmentId: string;
  slug: string;
  title: string;
  description: string;
  /** Who set it. A name, because "your coach" is colder than "Coach Whitfield". */
  assignedByName: string;
  /** The coach's own words. Empty string when they wrote none. */
  note: string;
  /** ISO date, or null when the coach set no deadline. */
  dueAt: string | null;
  status: PlayerAssignmentStatus;
  progress: PlaybookProgress;
  /** Set once the player dismisses it; the coach can see this (SKI-220). */
  dismissedAt: string | null;
}

/** Days until `dueAt`; negative when overdue, null when there is no deadline. */
export function daysUntilDue(dueAt: string | null): number | null {
  if (!dueAt) return null;
  const due = new Date(dueAt);
  due.setHours(23, 59, 59, 999);
  return Math.ceil((due.getTime() - Date.now()) / 86_400_000);
}

/**
 * How a deadline reads to a player. Overdue says "Was due 2 days ago" — never
 * OVERDUE or MISSED (SKI-227: these are teenagers).
 */
export function dueLabel(dueAt: string | null): { text: string; overdue: boolean } | null {
  const days = daysUntilDue(dueAt);
  if (days === null) return null;
  if (days < -1) return { text: `Was due ${Math.abs(days)} days ago`, overdue: true };
  if (days === -1) return { text: 'Was due yesterday', overdue: true };
  if (days === 0) return { text: 'Due today', overdue: false };
  if (days === 1) return { text: 'Due tomorrow', overdue: false };
  return { text: `Due in ${days} days`, overdue: false };
}

const isoInDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

/**
 * Fixtures covering the states a player can actually be in: one overdue and
 * untouched, one due soon and half done, one with no deadline.
 */
export const generateMockAssignedPlaybooks = (): AssignedPlaybook[] => [
  {
    assignmentId: 'as-1',
    slug: 'match-day-warm-up',
    title: 'Match-day warm-up',
    description: 'Ten minutes before first serve.',
    assignedByName: 'Coach Whitfield',
    note: 'Before Tuesday’s match. Ten minutes, no excuses.',
    dueAt: isoInDays(-2),
    status: 'not_started',
    progress: { totalGames: 3, playedGames: 0, percent: 0 },
    dismissedAt: null,
  },
  {
    assignmentId: 'as-2',
    slug: 'reaction-ladder',
    title: 'Reaction ladder',
    description: 'Short bursts to sharpen response time.',
    assignedByName: 'Coach Whitfield',
    note: '',
    dueAt: isoInDays(3),
    status: 'in_progress',
    progress: { totalGames: 4, playedGames: 2, percent: 50 },
    dismissedAt: null,
  },
  {
    assignmentId: 'as-3',
    slug: 'post-scrim-winddown',
    title: 'Post-scrim wind-down',
    description: 'Whenever practice runs long.',
    assignedByName: 'Coach Whitfield',
    note: 'No deadline on this one — just when you need it.',
    dueAt: null,
    status: 'in_progress',
    progress: { totalGames: 2, playedGames: 1, percent: 50 },
    dismissedAt: null,
  },
];
