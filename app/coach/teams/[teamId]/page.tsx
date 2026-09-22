'use client';

/**
 * Team detail: roster, trends and games (SKI-215, SKI-207, SKI-208).
 *
 * The roster is the screen a coach opens daily, so it leads. Trends and games
 * sit below it and can each be independently suppressed on a small roster —
 * hence three separate requests rather than one composite endpoint.
 *
 * Roster rows carry `userId` and no name (see SKI-251), so players are labelled
 * by id until the payload grows an identity field. The label is produced in one
 * place, `playerLabel`, so adding a name later is a one-line change.
 */
import { use, useState } from 'react';
import Link from 'next/link';
import {
  useCoachRoster,
  useCoachTeamGames,
  useCoachTeamTrends,
  type CoachRosterPlayer,
} from '@/lib/models/coach';
import {
  ActivityPill,
  dimensionLabel,
  Empty,
  ErrorState,
  Loading,
  Panel,
  Sparkline,
  Suppressed,
} from '../../components/ui';

/** Until the roster payload carries identity (SKI-251). */
function playerLabel(player: CoachRosterPlayer): string {
  return `Player ${player.userId}`;
}

export default function CoachTeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = use(params);
  const id = Number(teamId);

  const [days, setDays] = useState(30);

  const roster = useCoachRoster(Number.isFinite(id) ? id : null, days);
  const trends = useCoachTeamTrends(Number.isFinite(id) ? id : null, 90, 'week');
  const games = useCoachTeamGames(Number.isFinite(id) ? id : null, days, 'plays');

  const team = roster.data?.team ?? trends.data?.team;

  return (
    <>
      <Link href="/coach/teams" className="coach-back">
        &larr; All teams
      </Link>

      <div className="coach-pagehead">
        <h1>{team?.name ?? 'Team'}</h1>
        <p>
          {roster.data
            ? `${roster.data.players.length} on the roster · ${roster.data.range.start} to ${roster.data.range.end}`
            : 'Roster and engagement'}
        </p>
      </div>

      <Panel
        title="Roster"
        note="Who is turning up, and where they are strongest and weakest."
        actions={
          <div className="coach-controls">
            <label className="coach-meta" htmlFor="coach-range">
              Range
            </label>
            <select
              id="coach-range"
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
            >
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>
        }
      >
        {roster.isLoading && !roster.data && <Loading rows={5} />}
        {roster.error && <ErrorState error={roster.error} onRetry={roster.refetch} />}

        {roster.data && roster.data.players.length === 0 && (
          <Empty title="Nobody on this roster yet">
            A team with no players is a real state, not an error — import a roster or add players to
            see them here.
          </Empty>
        )}

        {roster.data && roster.data.players.length > 0 && (
          <div className="coach-tablewrap">
            <table className="coach-table">
              <thead>
                <tr>
                  <th scope="col">Player</th>
                  <th scope="col">Last played</th>
                  <th scope="col">Sessions</th>
                  <th scope="col">Minutes</th>
                  <th scope="col">Strongest</th>
                  <th scope="col">Weakest</th>
                </tr>
              </thead>
              <tbody>
                {roster.data.players.map((player) => (
                  <tr key={player.userId}>
                    <td>
                      <Link href={`/coach/players/${player.userId}`}>{playerLabel(player)}</Link>
                    </td>
                    <td>
                      <ActivityPill lastPlayed={player.lastPlayed} />
                    </td>
                    <td className="num">{player.sessionsInRange}</td>
                    <td className="num">{player.minutesInRange}</td>
                    {/* Absent for two different reasons — too few measured
                        dimensions, or a grant that stops at engagement. Both
                        render the same way here, and the player page explains
                        which applies. */}
                    <td>
                      {player.topDimension ? (
                        <span className="coach-dim">
                          {dimensionLabel(player.topDimension.slug)}
                          <span className="coach-dim__value">{player.topDimension.value}</span>
                        </span>
                      ) : (
                        <span className="coach-pill coach-pill--locked">—</span>
                      )}
                    </td>
                    <td>
                      {player.bottomDimension ? (
                        <span className="coach-dim">
                          {dimensionLabel(player.bottomDimension.slug)}
                          <span className="coach-dim__value">{player.bottomDimension.value}</span>
                        </span>
                      ) : (
                        <span className="coach-pill coach-pill--locked">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title="Team trends" note="Cognition dimensions, weekly averages over 90 days.">
        {trends.isLoading && !trends.data && <Loading rows={3} />}
        {trends.error && <ErrorState error={trends.error} onRetry={trends.refetch} />}

        {trends.data?.suppressed && <Suppressed reason={trends.data.suppressionReason} />}

        {trends.data && !trends.data.suppressed && trends.data.teamSeries.length === 0 && (
          <Empty title="No measurements in this window">
            Nobody on this roster has played enough for a trend yet.
          </Empty>
        )}

        {trends.data && !trends.data.suppressed && trends.data.teamSeries.length > 0 && (
          <div className="coach-serieslist">
            {trends.data.teamSeries.map((series) => {
              const latest = series.points[series.points.length - 1];
              return (
                <div key={series.slug} className="coach-series">
                  <div className="coach-series__head">
                    <span className="coach-series__name">{dimensionLabel(series.slug)}</span>
                    <span className="coach-series__value">
                      {latest?.value} · {latest?.players} players
                    </span>
                  </div>
                  <Sparkline points={series.points} />
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <Panel title="What the team plays" note="Feeds the playbook builder when assignment lands.">
        {games.isLoading && !games.data && <Loading rows={3} />}
        {games.error && <ErrorState error={games.error} onRetry={games.refetch} />}

        {games.data?.suppressed && <Suppressed reason={games.data.suppressionReason} />}

        {games.data && !games.data.suppressed && games.data.games.length === 0 && (
          <Empty title="No games played in this window" />
        )}

        {games.data && !games.data.suppressed && games.data.games.length > 0 && (
          <div className="coach-tablewrap">
            <table className="coach-table">
              <thead>
                <tr>
                  <th scope="col">Game</th>
                  <th scope="col">Plays</th>
                  <th scope="col">Players</th>
                  <th scope="col">Avg score</th>
                  <th scope="col">Exercises</th>
                </tr>
              </thead>
              <tbody>
                {games.data.games.map((game) => (
                  <tr key={game.slug}>
                    <td>{game.name}</td>
                    <td className="num">{game.plays}</td>
                    <td className="num">{game.players}</td>
                    <td className="num">{game.averageScore ?? '—'}</td>
                    <td>{game.skills.map((skill) => skill.name).join(', ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
