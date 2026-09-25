'use client';

/**
 * Player detail (SKI-216).
 *
 * The most privacy-sensitive screen in the product: one adult reading one named
 * child's record, and the only coach read written to the audit log.
 *
 * The UI mirrors the backend's layering rather than flattening it. Engagement
 * always renders. The skill profile and session list appear only where the
 * grant reaches, and where it does not the screen says *that* — a consent gap
 * is a thing a coach can act on, and showing an empty panel instead would read
 * as "this player has done nothing".
 *
 * Individual mood is deliberately absent at every level in v1 (SKI-192).
 */
import { use, useState } from 'react';
import Link from 'next/link';
import {
  CoachApiError,
  useCoachPlayer,
  useCoachPlayerSessions,
  useCoachPlayerTrends,
  playerLabel,
} from '@/lib/models/coach';
import {
  ActivityPill,
  ConsentGap,
  dimensionLabel,
  Empty,
  ErrorState,
  Loading,
  localDay,
  Panel,
  Sparkline,
  Tile,
} from '../../components/ui';

/** A 403 is a consent gap; anything else is a real failure. */
function isConsentGap(error: Error | null): boolean {
  return error instanceof CoachApiError && error.isConsentGap;
}

export default function CoachPlayerPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const id = Number(userId);
  const valid = Number.isFinite(id);

  const [days, setDays] = useState(30);

  const detail = useCoachPlayer(valid ? id : null, days);
  const trends = useCoachPlayerTrends(valid ? id : null, 90);
  const sessions = useCoachPlayerSessions(valid ? id : null, 25);

  const player = detail.data?.player;

  return (
    <>
      <Link href="/coach/teams" className="coach-back">
        &larr; Teams
      </Link>

      <div className="coach-pagehead">
        <h1>{valid ? playerLabel({ userId: id, displayName: player?.displayName }) : 'Player'}</h1>
        <p>{player?.email ?? 'Engagement, profile and sessions as your grant allows.'}</p>
      </div>

      {detail.isLoading && !detail.data && (
        <Panel>
          <Loading rows={4} />
        </Panel>
      )}

      {detail.error && <ErrorState error={detail.error} onRetry={detail.refetch} />}

      {player && (
        <Panel
          title="Engagement"
          note="Always visible — this is what a coach is for."
          actions={
            <div className="coach-controls">
              <label className="coach-meta" htmlFor="coach-player-range">
                Range
              </label>
              <select
                id="coach-player-range"
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
          <div className="coach-tiles">
            <Tile
              label="Last played"
              value={<ActivityPill lastPlayed={player.lastPlayed} />}
              hint={player.lastPlayed ?? 'No sessions on record'}
            />
            <Tile label="Sessions in range" value={player.sessionsInRange} />
            <Tile label="Minutes in range" value={`${player.minutesInRange}m`} />
            <Tile label="Sessions all time" value={player.totalSessions} />
          </div>
        </Panel>
      )}

      {player && (
        <Panel title="Skill profile" note="Aggregate cognition. Needs a level-2 grant.">
          {/* Absent, never null — the backend builds the layer or omits it. */}
          {!('skillProfile' in player) ? (
            <ConsentGap what="their aggregate skill profile" />
          ) : player.skillProfile!.length === 0 ? (
            <Empty title="Nothing measured in this window" />
          ) : (
            <div className="coach-tablewrap">
              <table className="coach-table">
                <thead>
                  <tr>
                    <th scope="col">Dimension</th>
                    <th scope="col">Value</th>
                    <th scope="col">Sessions behind it</th>
                  </tr>
                </thead>
                <tbody>
                  {player.skillProfile!.map((entry) => (
                    <tr key={entry.slug}>
                      <td style={{ textTransform: 'capitalize' }}>{dimensionLabel(entry.slug)}</td>
                      <td className="num">{entry.value}</td>
                      <td className="num">{entry.sessions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}

      <Panel title="Trend" note="Cognition over 90 days. Needs a level-2 grant.">
        {trends.isLoading && !trends.data && <Loading rows={2} />}
        {isConsentGap(trends.error) && <ConsentGap what="their skill trend" />}
        {trends.error && !isConsentGap(trends.error) && (
          <ErrorState error={trends.error} onRetry={trends.refetch} />
        )}

        {trends.data && trends.data.series.length === 0 && (
          <Empty title="Not enough history for a trend yet" />
        )}

        {trends.data && trends.data.series.length > 0 && (
          <div className="coach-serieslist">
            {trends.data.series.map((series) => {
              const latest = series.points[series.points.length - 1];
              return (
                <div key={series.slug} className="coach-series">
                  <div className="coach-series__head">
                    <span className="coach-series__name">{dimensionLabel(series.slug)}</span>
                    <span className="coach-series__value">{latest?.value}</span>
                  </div>
                  <Sparkline points={series.points} />
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <Panel title="Sessions" note="Links only, never what happened inside. Needs a level-3 grant.">
        {sessions.isLoading && !sessions.data && <Loading rows={3} />}
        {isConsentGap(sessions.error) && <ConsentGap what="their session detail" />}
        {sessions.error && !isConsentGap(sessions.error) && (
          <ErrorState error={sessions.error} onRetry={sessions.refetch} />
        )}

        {sessions.data && sessions.data.results.length === 0 && (
          <Empty title="No sessions in this window" />
        )}

        {sessions.data && sessions.data.results.length > 0 && (
          <div className="coach-tablewrap">
            <table className="coach-table">
              <thead>
                <tr>
                  <th scope="col">Game</th>
                  <th scope="col">Played</th>
                  <th scope="col">Duration</th>
                </tr>
              </thead>
              <tbody>
                {sessions.data.results.map((session) => (
                  <tr key={session.sessionId}>
                    <td>{session.gameName ?? session.gameSlug ?? 'Unknown game'}</td>
                    <td>{localDay(session.playedAt)}</td>
                    <td className="num">{session.durationMinutes}m</td>
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
