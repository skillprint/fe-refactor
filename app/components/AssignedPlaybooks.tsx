'use client';

/**
 * "Assigned to you" on the portal home (SKI-227).
 *
 * On the home page rather than inside `/playbooks`, because a player who has
 * been set work should not have to go looking for it.
 *
 * ## Tone
 *
 * SKI-227 asks that an overdue assignment read as overdue "without being
 * punitive — these are teenagers, and a red banner that says FAILED is a
 * product decision nobody made." So:
 *
 * - Overdue is amber, never red, and says "was due Tuesday" rather than
 *   "OVERDUE" or "MISSED".
 * - Progress is "2 of 4 done", not a percentage bar sitting at 0%, which reads
 *   as a judgement on a player who simply has not started.
 * - Dismiss is offered plainly. A player who has decided not to do something is
 *   better served by saying so than by a card that nags forever, and the coach
 *   can see that they did.
 *
 * Renders nothing at all when there are no assignments — this whole surface is
 * invisible to a player who has no coach, which is most of them.
 */
import React from 'react';
import Link from 'next/link';
import {
  daysUntilDue,
  type AssignedPlaybook,
} from '@/lib/models/portal/AssignedPlaybook';
import { useAssignedPlaybooks } from '@/lib/models/portal/useAssignedPlaybooks';

function dueLabel(dueAt: string | null): { text: string; overdue: boolean } | null {
  const days = daysUntilDue(dueAt);
  if (days === null) return null;
  if (days < -1) return { text: `Was due ${Math.abs(days)} days ago`, overdue: true };
  if (days === -1) return { text: 'Was due yesterday', overdue: true };
  if (days === 0) return { text: 'Due today', overdue: false };
  if (days === 1) return { text: 'Due tomorrow', overdue: false };
  return { text: `Due in ${days} days`, overdue: false };
}

function AssignmentCard({
  assignment,
  onDismiss,
}: {
  assignment: AssignedPlaybook;
  onDismiss: (id: string) => void;
}) {
  const due = dueLabel(assignment.dueAt);
  const { playedGames, totalGames } = assignment.progress;

  return (
    <article className="assigned-card">
      <div className="assigned-card__head">
        <h3 className="assigned-card__title">{assignment.title}</h3>
        {due && (
          <span className={`assigned-card__due${due.overdue ? ' assigned-card__due--late' : ''}`}>
            {due.text}
          </span>
        )}
      </div>

      <p className="assigned-card__from">From {assignment.assignedByName}</p>

      {assignment.note && <p className="assigned-card__note">&ldquo;{assignment.note}&rdquo;</p>}

      <p className="assigned-card__progress">
        {playedGames} of {totalGames} done
      </p>

      <div className="assigned-card__actions">
        <Link href={`/playbooks/${assignment.slug}`} className="assigned-card__start">
          {playedGames === 0 ? 'Start' : 'Continue'}
        </Link>
        <button
          type="button"
          className="assigned-card__dismiss"
          onClick={() => onDismiss(assignment.assignmentId)}
        >
          Not now
        </button>
      </div>
    </article>
  );
}

export default function AssignedPlaybooks() {
  const { data, isLoading, dismiss } = useAssignedPlaybooks();

  // No skeleton: this section is absent for most players, and flashing a
  // placeholder on every home load for something that usually is not there
  // would be worse than it appearing a moment late.
  if (isLoading || !data || data.length === 0) return null;

  return (
    <section className="assigned" aria-labelledby="assigned-heading">
      <div className="assigned__head">
        <h2 id="assigned-heading" className="assigned__heading">
          Assigned to you
        </h2>
        <p className="assigned__sub">
          {data.length === 1 ? 'Your coach set this' : `Your coach set ${data.length} of these`}
        </p>
      </div>
      <div className="assigned__grid">
        {data.map((assignment) => (
          <AssignmentCard
            key={assignment.assignmentId}
            assignment={assignment}
            onDismiss={dismiss}
          />
        ))}
      </div>
    </section>
  );
}
