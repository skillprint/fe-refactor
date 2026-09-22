'use client';

import { use } from 'react';
import Link from 'next/link';
import { useCoachPlaybook } from '@/lib/models/coach';
import { ErrorState, Loading, Panel } from '../../components/ui';
import PlaybookBuilder, { formatDuration } from '../../components/PlaybookBuilder';

export default function EditPlaybookPage({ params }: { params: Promise<{ playbookId: string }> }) {
  const { playbookId } = use(params);
  const { data, isLoading, error, refetch } = useCoachPlaybook(playbookId);

  return (
    <>
      <Link href="/coach/playbooks" className="coach-back">&larr; Playbooks</Link>

      {isLoading && !data && <Panel><Loading rows={4} /></Panel>}
      {error && <ErrorState error={error} onRetry={refetch} />}

      {data && (
        <>
          <div className="coach-pagehead coach-pagehead--split">
            <div>
              <h1>{data.title}</h1>
              <p>
                <span className={`coach-pill coach-pill--${data.status === 'published' ? 'active' : 'quiet'}`}>
                  {data.status === 'published' ? 'Published' : 'Draft'}
                </span>{' '}
                · {data.games.length} games · about {formatDuration(data.estimatedSeconds)}
              </p>
            </div>
            {/* A draft is deliberately not assignable — that is the whole
                reason the two states exist. */}
            {data.status === 'published' && (
              <Link href={`/coach/playbooks/${data.id}/assign`} className="coach-submit coach-submit--inline">
                Assign
              </Link>
            )}
          </div>

          <PlaybookBuilder key={data.id} playbook={data} />
        </>
      )}
    </>
  );
}
