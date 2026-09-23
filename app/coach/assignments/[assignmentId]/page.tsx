'use client';

/**
 * Per-player status, with close/cancel and — on sample data only — remind
 * (SKI-226).
 *
 * Status is derived from sessions since the assignment was made, not
 * self-reported — "in progress" means they actually played some of the
 * sequence.
 *
 * **Remind is hidden when the playbooks area is live.** Reminding sends email,
 * which is Phase 4 (SKI-232), and the API deliberately has no remind endpoint
 * until then: SKI-226's rule is that unbuilt sends are hidden rather than
 * stubbed. On sample data the mock still shows it, with a 24-hour cooldown per
 * player and a report of who was skipped — the behaviour SKI-232 owes on the
 * server.
 *
 * Closing and cancelling are one-way status changes, never deletes: the record
 * that the work was asked for outlives the coach changing their mind.
 */
import { use, useState } from 'react';
import Link from 'next/link';
import {
  isCoachMocked,
  useCoachAssignment,
  useCoachWrites,
  type CoachRemindResult,
} from '@/lib/models/coach';
import { ErrorState, Loading, Panel, Tile, localDay } from '../../components/ui';

const STATUS_LABEL = {
  not_started: 'Not started',
  in_progress: 'In progress',
  complete: 'Complete',
  dismissed: 'Dismissed',
} as const;

const STATUS_PILL = {
  not_started: 'coach-pill coach-pill--quiet',
  in_progress: 'coach-pill coach-pill--lapsed',
  complete: 'coach-pill coach-pill--active',
  dismissed: 'coach-pill coach-pill--quiet',
} as const;

/** Only the mock has a remind endpoint; see the module comment. */
const CAN_REMIND = isCoachMocked('playbooks');

/** Nobody is chased for work they finished or declined. */
const isOutstanding = (status: keyof typeof STATUS_LABEL) =>
  status === 'not_started' || status === 'in_progress';

type SortKey = 'userId' | 'status' | 'progress';

export default function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = use(params);
  const { data, isLoading, error, refetch } = useCoachAssignment(assignmentId);
  const { remind, closeAssignment } = useCoachWrites();

  const [sort, setSort] = useState<SortKey>('status');
  const [result, setResult] = useState<CoachRemindResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [remindError, setRemindError] = useState<string | null>(null);
  const [closeError, setCloseError] = useState<string | null>(null);

  async function onClose(status: 'Completed' | 'Cancelled') {
    if (
      status === 'Cancelled' &&
      !window.confirm('Cancel this assignment? It stays on record, but players are no longer asked to do it.')
    ) {
      return;
    }
    setBusy(true);
    setCloseError(null);
    try {
      await closeAssignment(assignmentId, status);
      refetch();
    } catch (caught) {
      setCloseError(caught instanceof Error ? caught.message : 'Could not update the assignment.');
    } finally {
      setBusy(false);
    }
  }

  async function onRemind(userIds?: number[]) {
    setBusy(true);
    setRemindError(null);
    try {
      setResult(await remind(assignmentId, userIds));
      refetch();
    } catch (caught) {
      setRemindError(caught instanceof Error ? caught.message : 'Could not send reminders.');
    } finally {
      setBusy(false);
    }
  }

  const order = { not_started: 0, in_progress: 1, complete: 2, dismissed: 3 } as const;
  // A playbook whose games were all retired has zero playable games.
  const fraction = (p: { playedGames: number; totalGames: number }) =>
    p.totalGames ? p.playedGames / p.totalGames : 0;
  const players = [...(data?.players ?? [])].sort((a, b) => {
    if (sort === 'userId') return a.userId - b.userId;
    if (sort === 'progress') return fraction(b) - fraction(a);
    return order[a.status] - order[b.status];
  });

  const active = data?.assignment.status === 'Active';
  const outstanding = players.filter((p) => isOutstanding(p.status)).length;
  const remindable = CAN_REMIND && active;

  return (
    <>
      <Link href="/coach/assignments" className="coach-back">&larr; Assignments</Link>

      {isLoading && !data && <Panel><Loading rows={4} /></Panel>}
      {error && <ErrorState error={error} onRetry={refetch} />}

      {data && (
        <>
          <div className="coach-pagehead">
            <h1>{data.assignment.playbook.title}</h1>
            <p>
              {data.assignment.target.name} · assigned {localDay(data.assignment.assignedAt)}
              {data.assignment.dueAt ? ` · due ${localDay(data.assignment.dueAt)}` : ''}
              {!active && (
                <>
                  {' '}·{' '}
                  <span className="coach-pill coach-pill--quiet">
                    {data.assignment.status === 'Cancelled' ? 'Cancelled' : 'Closed'}
                  </span>
                </>
              )}
            </p>
          </div>

          {active && (
            <div className="coach-actions" style={{ justifyContent: 'flex-start', marginBottom: 18 }}>
              <button
                type="button"
                className="coach-submit coach-submit--inline"
                disabled={busy}
                onClick={() => onClose('Completed')}
              >
                Mark closed
              </button>
              <button
                type="button"
                className="coach-nav__signout"
                disabled={busy}
                onClick={() => onClose('Cancelled')}
              >
                Cancel assignment
              </button>
            </div>
          )}
          {closeError && <p className="coach-formerror" role="alert">{closeError}</p>}

          {data.assignment.note && (
            <Panel title="Your note">
              <p className="coach-meta">{data.assignment.note}</p>
            </Panel>
          )}

          <Panel
            title="Progress"
            actions={
              <div className="coach-controls">
                <label className="coach-meta" htmlFor="assign-sort">Sort</label>
                <select id="assign-sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                  <option value="status">Status</option>
                  <option value="progress">Progress</option>
                  <option value="userId">Player</option>
                </select>
                {remindable && (
                  <button
                    type="button"
                    className="coach-submit coach-submit--inline"
                    disabled={busy || outstanding === 0}
                    onClick={() => onRemind()}
                  >
                    {busy ? 'Sending…' : `Remind ${outstanding} outstanding`}
                  </button>
                )}
              </div>
            }
          >
            <div className="coach-tiles" style={{ marginBottom: 16 }}>
              <Tile label="Complete" value={`${data.assignment.completedCount} / ${data.assignment.playerCount}`} />
              <Tile label="Outstanding" value={outstanding} warn={outstanding > 0} />
            </div>

            {result && (
              <div className="coach-state" style={{ marginBottom: 14, textAlign: 'left' }}>
                <h3>
                  {result.remindedUserIds.length} reminded
                  {result.skipped.length > 0 && `, ${result.skipped.length} skipped`}
                </h3>
                {result.skipped.length > 0 && (
                  <ul className="coach-meta" style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                    {result.skipped.map((skip) => (
                      <li key={skip.userId}>
                        Player {skip.userId} — {skip.reason}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {remindError && <p className="coach-formerror" role="alert">{remindError}</p>}
            {!CAN_REMIND && active && outstanding > 0 && (
              <p className="coach-meta" style={{ marginBottom: 14 }}>
                Reminders arrive with assignment email. Until then, nudge outstanding players yourself.
              </p>
            )}

            <div className="coach-tablewrap">
              <table className="coach-table coach-table--assignment">
                <thead>
                  <tr>
                    <th scope="col">Player</th>
                    <th scope="col">Status</th>
                    <th scope="col">Games</th>
                    <th scope="col">Started</th>
                    {CAN_REMIND && <th scope="col">Last reminded</th>}
                    {remindable && <th scope="col"> </th>}
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.userId}>
                      <td>
                        <Link href={`/coach/players/${player.userId}`}>Player {player.userId}</Link>
                      </td>
                      <td>
                        <span className={STATUS_PILL[player.status]}>{STATUS_LABEL[player.status]}</span>
                      </td>
                      <td className="num">{player.playedGames} / {player.totalGames}</td>
                      <td className="coach-meta">{player.firstStartedAt ? localDay(player.firstStartedAt) : '—'}</td>
                      {CAN_REMIND && (
                        <td className="coach-meta">{player.lastRemindedAt ? localDay(player.lastRemindedAt) : 'Never'}</td>
                      )}
                      {remindable && (
                        <td>
                          {isOutstanding(player.status) && (
                            <button
                              type="button"
                              className="coach-nav__signout"
                              disabled={busy}
                              onClick={() => onRemind([player.userId])}
                            >
                              Remind
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </>
  );
}
