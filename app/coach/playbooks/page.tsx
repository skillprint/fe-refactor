'use client';

/** Playbooks the org has authored (SKI-225). */
import Link from 'next/link';
import { useCoachPlaybooks } from '@/lib/models/coach';
import { Empty, ErrorState, Loading, Panel } from '../components/ui';
import { formatDuration } from '../components/PlaybookBuilder';

export default function CoachPlaybooksPage() {
  const { data, isLoading, error, refetch } = useCoachPlaybooks();

  return (
    <>
      <div className="coach-pagehead coach-pagehead--split">
        <div>
          <h1>Playbooks</h1>
          <p>Sequences you can assign to a team or a player.</p>
        </div>
        <Link href="/coach/playbooks/new" className="coach-submit coach-submit--inline">
          New playbook
        </Link>
      </div>

      {isLoading && !data && <Panel><Loading rows={3} /></Panel>}
      {error && <ErrorState error={error} onRetry={refetch} />}

      {data && data.playbooks.length === 0 && (
        <Empty title="No playbooks yet">
          Build one from the game catalogue, then assign it to your squad.
        </Empty>
      )}

      {data && data.playbooks.length > 0 && (
        <div className="coach-teamgrid">
          {data.playbooks.map((playbook) => (
            <Link key={playbook.id} href={`/coach/playbooks/${playbook.id}`} className="coach-teamcard">
              <div className="coach-teamcard__row">
                <h3>{playbook.title}</h3>
                <span className={`coach-pill coach-pill--${playbook.status === 'published' ? 'active' : 'quiet'}`}>
                  {playbook.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="coach-teamcard__season">
                {playbook.games.length} {playbook.games.length === 1 ? 'game' : 'games'} · about{' '}
                {formatDuration(playbook.estimatedSeconds)}
              </p>
              {playbook.description && <p className="coach-meta">{playbook.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
