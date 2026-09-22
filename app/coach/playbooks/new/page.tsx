'use client';

import Link from 'next/link';
import PlaybookBuilder from '../../components/PlaybookBuilder';

export default function NewPlaybookPage() {
  return (
    <>
      <Link href="/coach/playbooks" className="coach-back">&larr; Playbooks</Link>
      <div className="coach-pagehead">
        <h1>New playbook</h1>
        <p>Pick games, put them in order, publish when it&rsquo;s ready to assign.</p>
      </div>
      <PlaybookBuilder />
    </>
  );
}
