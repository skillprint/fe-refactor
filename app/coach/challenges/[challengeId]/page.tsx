'use client';

/**
 * One challenge: the team total, each player's figure, and the leaderboard
 * (the team, or everyone at a coaching school with only this team's players
 * named). Skill figures appear only for players with a profile-level grant;
 * the rest say so rather than showing a blank.
 */
import { use, useState } from 'react';
import Link from 'next/link';
import {
  playerLabel,
  useCoachChallenge,
  useCoachChallengeLeaderboard,
  useCoachChallengeWrites,
  type CoachChallenge,
  type CoachLeaderboardRow,
  type CoachLeaderboardScope,
} from '@/lib/models/coach';
import { Empty, ErrorState, Loading, Panel, Suppressed, Tile } from '../../components/ui';
import { challengeGoal } from '../format';

function unit(c: CoachChallenge): string {
  return c.kind === 'Skill' ? 'pts' : c.metric === 'Minutes' ? 'min' : 'sessions';
}

function Figure({ c, value }: { c: CoachChallenge; value: number | null | undefined }) {
  if (value === null || value === undefined) return <span className="coach-meta">No baseline yet</span>;
  return (
    <>
      {c.kind === 'Skill' && value > 0 ? '+' : ''}
      {value} {unit(c)}
    </>
  );
}

function rowLabel(row: CoachLeaderboardRow, scope: CoachLeaderboardScope): string {
  if (row.own && row.userId !== undefined) return playerLabel({ userId: row.userId, displayName: row.displayName });
  return scope === 'playvs' ? 'Another player' : 'Player';
}

export default function CoachChallengePage({ params }: { params: Promise<{ challengeId: string }> }) {
  const { challengeId } = use(params);
  const id = Number.isFinite(Number(challengeId)) ? Number(challengeId) : null;
  const detail = useCoachChallenge(id);
  const [scope, setScope] = useState<CoachLeaderboardScope>('team');
  const board = useCoachChallengeLeaderboard(id, scope);
  const { cancelChallenge } = useCoachChallengeWrites();
  const [busy, setBusy] = useState(false);

  const c = detail.data?.challenge;
  const total = detail.data?.teamTotal;

  return (
    <>
      <Link href="/coach/challenges" className="coach-back">
        &larr; Challenges
      </Link>
      <div className="coach-pagehead coach-pagehead--split">
        <div>
          <h1>{c?.title ?? 'Challenge'}</h1>
          <p>
            {c ? `${c.team.name} · ${challengeGoal(c)} · ${c.startsOn} – ${c.endsOn}` : ''}
            {c?.state === 'cancelled' ? ' · Cancelled' : ''}
          </p>
        </div>
        {c && c.state !== 'cancelled' && c.state !== 'ended' && (
          <button
            type="button"
            className="coach-submit coach-submit--ghost coach-submit--inline"
            disabled={busy}
            onClick={async () => {
              if (!id || !window.confirm('Cancel this challenge? It stays in the list as cancelled.')) return;
              setBusy(true);
              try {
                await cancelChallenge(id);
                detail.refetch();
              } finally {
                setBusy(false);
              }
            }}
          >
            Cancel challenge
          </button>
        )}
      </div>

      {detail.isLoading && !detail.data && (
        <Panel>
          <Loading rows={4} />
        </Panel>
      )}
      {detail.error && <ErrorState error={detail.error} onRetry={detail.refetch} />}

      {c && total && (
        <Panel title="Team" note={c.description || undefined}>
          {c.kind === 'Play' ? (
            <div className="coach-tiles">
              <Tile label="Team total" value={`${total.value ?? 0} ${unit(c)}`} hint={`Goal ${total.goal ?? 0}`} />
              <Tile label="Reached goal" value={`${total.playersMet ?? 0} of ${total.players}`} hint="Players" />
            </div>
          ) : total.suppressed ? (
            <Suppressed reason={total.suppressionReason ?? 'Too few players measured for a team average.'} />
          ) : (
            <div className="coach-tiles">
              <Tile label="Average improvement" value={`${total.averageImprovement} pts`} hint={`${total.measuredPlayers} measured`} />
              <Tile label="Reached goal" value={`${total.playersMet ?? 0} of ${total.players}`} hint="Players" />
            </div>
          )}
        </Panel>
      )}

      {c && detail.data && (
        <Panel title="Players" note={c.kind === 'Skill' ? 'Improvement is shown for players with a profile-level grant.' : undefined}>
          <div className="coach-tablewrap">
            <table className="coach-table">
              <thead>
                <tr>
                  <th scope="col">Player</th>
                  <th scope="col">{c.kind === 'Skill' ? 'Improvement' : c.metric === 'Minutes' ? 'Minutes' : 'Sessions'}</th>
                  <th scope="col">Toward goal</th>
                </tr>
              </thead>
              <tbody>
                {detail.data.players.map((p) => {
                  const figures = c.kind === 'Skill' ? p.skillProgress : p;
                  const value = c.kind === 'Skill' ? p.skillProgress?.improvement : p.value;
                  return (
                    <tr key={p.userId}>
                      <td>
                        <Link href={`/coach/players/${p.userId}`}>{playerLabel(p)}</Link>
                      </td>
                      <td className="num">
                        {c.kind === 'Skill' && !p.skillProgress ? (
                          <span className="coach-pill coach-pill--locked">Needs a level-2 grant</span>
                        ) : (
                          <Figure c={c} value={value} />
                        )}
                      </td>
                      <td>
                        {figures?.met ? (
                          <span className="coach-pill coach-pill--active">Reached</span>
                        ) : figures?.progress != null ? (
                          `${Math.round(figures.progress * 100)}%`
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {c && (
        <Panel
          title="Leaderboard"
          note={
            scope === 'playvs'
              ? 'Everyone at a PlayVS school, measured the same way. Only your team is named.'
              : 'Your team, ranked.'
          }
          actions={
            <div className="coach-controls" role="group" aria-label="Leaderboard scope">
              <button
                type="button"
                className={`coach-submit coach-submit--inline${scope === 'team' ? '' : ' coach-submit--ghost'}`}
                aria-pressed={scope === 'team'}
                onClick={() => setScope('team')}
              >
                Team
              </button>
              <button
                type="button"
                className={`coach-submit coach-submit--inline${scope === 'playvs' ? '' : ' coach-submit--ghost'}`}
                aria-pressed={scope === 'playvs'}
                onClick={() => setScope('playvs')}
              >
                All of PlayVS
              </button>
            </div>
          }
        >
          {board.isLoading && !board.data && <Loading rows={4} />}
          {board.error && <ErrorState error={board.error} onRetry={board.refetch} />}
          {board.data?.suppressed && <Suppressed reason={board.data.suppressionReason ?? 'Too few players to rank.'} />}
          {board.data && !board.data.suppressed && board.data.rows.length === 0 && (
            <Empty title="Nobody ranked yet">Players appear once they have a figure.</Empty>
          )}
          {board.data && !board.data.suppressed && board.data.rows.length > 0 && (
            <>
              <ol className="coach-leaderboard">
                {board.data.rows.map((row, index) => (
                  <li key={`${row.rank}-${row.userId ?? `a${index}`}`} data-own={row.own ? 'true' : 'false'}>
                    <span className="coach-leaderboard__rank">{row.rank}</span>
                    <span className="coach-leaderboard__name">
                      {row.own && row.userId !== undefined ? (
                        <Link href={`/coach/players/${row.userId}`}>{rowLabel(row, scope)}</Link>
                      ) : (
                        rowLabel(row, scope)
                      )}
                    </span>
                    <span className="coach-leaderboard__value">
                      <Figure c={c} value={c.kind === 'Skill' && row.own ? row.skillProgress?.improvement : row.value} />
                    </span>
                  </li>
                ))}
              </ol>
              <p className="coach-meta">
                {board.data.rankedPlayers} ranked
                {board.data.hiddenPlayers ? ` · ${board.data.hiddenPlayers} not shown without a profile-level grant` : ''}
              </p>
            </>
          )}
        </Panel>
      )}
    </>
  );
}
