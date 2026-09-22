'use client';

/**
 * Team overview — the coach's landing screen (SKI-215).
 *
 * Answers "is my team doing the work?" before anything else. Aggregate only:
 * this payload never names a player, which is why it needs no consent grant and
 * is not written to the audit log.
 */
import Link from 'next/link';
import { useCoachTeams } from '@/lib/models/coach';
import { ErrorState, Loading, Panel, Tile } from '../components/ui';

export default function CoachTeamsPage() {
  const { data, isLoading, error, refetch } = useCoachTeams();

  return (
    <>
      <div className="coach-pagehead">
        <h1>Teams</h1>
        <p>Engagement across every squad you coach.</p>
      </div>

      {isLoading && !data && (
        <Panel>
          <Loading rows={4} />
        </Panel>
      )}

      {error && <ErrorState error={error} onRetry={refetch} />}

      {data && data.teams.length === 0 && (
        <div className="coach-state">
          <h3>No teams yet</h3>
          <p>
            Once a roster is imported or a team is created for you, it appears here with its
            engagement figures.
          </p>
        </div>
      )}

      {data && data.teams.length > 0 && (
        <div className="coach-teamgrid">
          {data.teams.map((team) => (
            <Link key={team.id} href={`/coach/teams/${team.id}`} className="coach-teamcard">
              <h3>{team.name}</h3>
              <p className="coach-teamcard__season">
                {team.season ?? 'No season set'} · {team.playerCount}{' '}
                {team.playerCount === 1 ? 'player' : 'players'}
              </p>

              <div className="coach-tiles">
                <Tile label="Active" value={team.activePlayers} hint="Played in 7 days" />
                <Tile
                  label="Lapsed"
                  value={team.lapsedPlayers}
                  hint="Silent 14+ days"
                  warn={team.lapsedPlayers > 0}
                />
                <Tile label="Sessions" value={team.sessionsThisWeek} hint="This week" />
                <Tile label="Median" value={`${team.medianMinutes}m`} hint="Minutes per player" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
