'use client';

/** Challenges on the coach's teams (SKI-218): a play goal or a skill improvement. */
import Link from 'next/link';
import { useCoachChallenges, type CoachChallenge } from '@/lib/models/coach';
import { Empty, ErrorState, Loading, Panel } from '../components/ui';
import { challengeGoal } from './format';
import { NewChallenge } from './NewChallenge';

const STATE: Record<CoachChallenge['state'], string> = {
  upcoming: 'Starts soon',
  active: 'Running',
  ended: 'Ended',
  cancelled: 'Cancelled',
};

export default function CoachChallengesPage() {
  const { data, isLoading, error, refetch } = useCoachChallenges();

  return (
    <>
      <div className="coach-pagehead coach-pagehead--split">
        <div>
          <h1>Challenges</h1>
          <p>Set a team a goal for a few days or weeks, and see who&rsquo;s on track.</p>
        </div>
        <NewChallenge />
      </div>

      {isLoading && !data && (
        <Panel>
          <Loading rows={3} />
        </Panel>
      )}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {data && data.challenges.length === 0 && (
        <Empty title="No challenges yet">Create one with &ldquo;New challenge&rdquo;.</Empty>
      )}
      {data && data.challenges.length > 0 && (
        <Panel>
          <div className="coach-tablewrap">
            <table className="coach-table">
              <thead>
                <tr>
                  <th scope="col">Challenge</th>
                  <th scope="col">Team</th>
                  <th scope="col">Goal</th>
                  <th scope="col">Dates</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.challenges.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/coach/challenges/${c.id}`}>{c.title}</Link>
                    </td>
                    <td>{c.team.name}</td>
                    <td>{challengeGoal(c)}</td>
                    <td className="coach-meta">
                      {c.startsOn} – {c.endsOn}
                    </td>
                    <td>{STATE[c.state]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </>
  );
}
