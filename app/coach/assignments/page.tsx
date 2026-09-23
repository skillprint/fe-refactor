'use client';

/** Everything assigned, newest first (SKI-226). */
import Link from 'next/link';
import { useCoachAssignments } from '@/lib/models/coach';
import { Empty, ErrorState, Loading, Panel, localDay } from '../components/ui';

export default function CoachAssignmentsPage() {
  const { data, isLoading, error, refetch } = useCoachAssignments();

  return (
    <>
      <div className="coach-pagehead">
        <h1>Assignments</h1>
        <p>What you&rsquo;ve set, and how far through it people are.</p>
      </div>

      {isLoading && !data && <Panel><Loading rows={3} /></Panel>}
      {error && <ErrorState error={error} onRetry={refetch} />}

      {data && data.assignments.length === 0 && (
        <Empty title="Nothing assigned yet">
          Publish a playbook, then assign it to a team or a few players.
        </Empty>
      )}

      {data && data.assignments.length > 0 && (
        <Panel>
          <div className="coach-tablewrap">
            <table className="coach-table">
              <thead>
                <tr>
                  <th scope="col">Playbook</th>
                  <th scope="col">Assigned to</th>
                  <th scope="col">Due</th>
                  <th scope="col">Repeat</th>
                  <th scope="col">Complete</th>
                </tr>
              </thead>
              <tbody>
                {data.assignments.map((assignment) => {
                  const overdue =
                    assignment.dueAt !== null &&
                    new Date(assignment.dueAt).getTime() < Date.now() &&
                    assignment.completedCount < assignment.playerCount;
                  return (
                    <tr key={assignment.id}>
                      <td>
                        <Link href={`/coach/assignments/${assignment.id}`}>
                          {assignment.playbook.title}
                        </Link>
                      </td>
                      <td>{assignment.target.name}</td>
                      <td>
                        {assignment.dueAt ? (
                          <span className={overdue ? 'coach-pill coach-pill--lapsed' : undefined}>
                            {localDay(assignment.dueAt)}
                            {overdue ? ' · overdue' : ''}
                          </span>
                        ) : (
                          <span className="coach-meta">No deadline</span>
                        )}
                      </td>
                      <td className="coach-meta">
                        {assignment.cadence === 'OneOff' ? 'Once' : 'Weekly'}
                        {assignment.status !== 'Active' && ` · ${assignment.status}`}
                      </td>
                      <td className="num">
                        {assignment.completedCount} / {assignment.playerCount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </>
  );
}
