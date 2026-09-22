'use client';

/**
 * Per-player status, with remind (SKI-226).
 *
 * Status is derived from sessions upstream, not self-reported — "in progress"
 * means they actually played some of the sequence.
 *
 * Remind is rate-limited. The mock enforces a 24-hour cooldown per player and
 * reports who was skipped, because a coach who clicks twice should be told six
 * were skipped rather than quietly mailing twenty teenagers again. **The real
 * limit belongs on the server** (SKI-232); a client-side one is a courtesy, not
 * a control.
 */
import { use, useState } from 'react';
import Link from 'next/link';
import { useCoachAssignment, useCoachWrites, type CoachRemindResult } from '@/lib/models/coach';
import { ErrorState, Loading, Panel, Tile } from '../../components/ui';

const STATUS_LABEL = {
  not_started: 'Not started',
  in_progress: 'In progress',
  complete: 'Complete',
} as const;

const STATUS_PILL = {
  not_started: 'coach-pill coach-pill--quiet',
  in_progress: 'coach-pill coach-pill--lapsed',
  complete: 'coach-pill coach-pill--active',
} as const;

type SortKey = 'userId' | 'status' | 'progress';

export default function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = use(params);
  const { data, isLoading, error, refetch } = useCoachAssignment(assignmentId);
  const { remind } = useCoachWrites();

  const [sort, setSort] = useState<SortKey>('status');
  const [result, setResult] = useState<CoachRemindResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [remindError, setRemindError] = useState<string | null>(null);

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

  const order = { not_started: 0, in_progress: 1, complete: 2 } as const;
  const players = [...(data?.players ?? [])].sort((a, b) => {
    if (sort === 'userId') return a.userId - b.userId;
    if (sort === 'progress') return b.playedGames / b.totalGames - a.playedGames / a.totalGames;
    return order[a.status] - order[b.status];
  });

  const outstanding = players.filter((p) => p.status !== 'complete').length;

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
              {data.assignment.target.name} · assigned {data.assignment.assignedAt.slice(0, 10)}
              {data.assignment.dueAt ? ` · due ${data.assignment.dueAt.slice(0, 10)}` : ''}
            </p>
          </div>

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
                <button
                  type="button"
                  className="coach-submit coach-submit--inline"
                  disabled={busy || outstanding === 0}
                  onClick={() => onRemind()}
                >
                  {busy ? 'Sending…' : `Remind ${outstanding} outstanding`}
                </button>
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

            <div className="coach-tablewrap">
              <table className="coach-table coach-table--assignment">
                <thead>
                  <tr>
                    <th scope="col">Player</th>
                    <th scope="col">Status</th>
                    <th scope="col">Games</th>
                    <th scope="col">Started</th>
                    <th scope="col">Last reminded</th>
                    <th scope="col"> </th>
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
                      <td className="coach-meta">{player.firstStartedAt?.slice(0, 10) ?? '—'}</td>
                      <td className="coach-meta">{player.lastRemindedAt?.slice(0, 10) ?? 'Never'}</td>
                      <td>
                        {player.status !== 'complete' && (
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
