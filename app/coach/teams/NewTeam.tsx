'use client';

/**
 * "New team" on the Teams screen. Admins and coaches can create a team; a
 * coach who creates one coaches it, so it opens straight onto its roster.
 * The school picker only appears for staff at more than one school.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CoachApiError, useCoachContext, useCoachRosterWrites } from '@/lib/models/coach';

function refusal(error: unknown): string {
  if (error instanceof CoachApiError) {
    const code = (error.detail as { code?: string } | undefined)?.code;
    if (code === 'organization_required') return 'Choose which school the team is for.';
    if (code === 'not_found') return 'You can create teams only at a school where you coach or administer.';
    return error.message;
  }
  return error instanceof Error ? error.message : 'Could not create the team.';
}

export function NewTeam() {
  const router = useRouter();
  const { createTeam } = useCoachRosterWrites();
  const context = useCoachContext();
  const schools = context.data?.organizations ?? [];

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [season, setSeason] = useState('');
  const [school, setSchool] = useState<number | ''>('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button type="button" className="coach-submit coach-submit--inline" onClick={() => setOpen(true)}>
        New team
      </button>
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const team = await createTeam({
        name: name.trim(),
        ...(season.trim() ? { season: season.trim() } : {}),
        ...(schools.length > 1 && school !== '' ? { organization: school } : {}),
      });
      router.push(`/coach/teams/${team.id}`);
    } catch (caught) {
      setError(refusal(caught));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="coach-rosteradd coach-newteam">
      {schools.length > 1 && (
        <div className="coach-field">
          <label htmlFor="team-school">School</label>
          <select id="team-school" value={school} onChange={(e) => setSchool(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Choose a school</option>
            {schools.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="coach-field">
        <label htmlFor="team-name">Team name</label>
        <input id="team-name" value={name} maxLength={255} autoFocus onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="coach-field">
        <label htmlFor="team-season">Season (optional)</label>
        <input id="team-season" value={season} maxLength={64} placeholder="Spring 2027" onChange={(e) => setSeason(e.target.value)} />
        <p className="coach-field__hint">If you&rsquo;re a coach, you&rsquo;ll coach the new team.</p>
      </div>
      {error && (
        <p className="coach-formerror" role="alert">
          {error}
        </p>
      )}
      <div className="coach-actions" style={{ justifyContent: 'flex-start' }}>
        <button type="submit" className="coach-submit coach-submit--inline" disabled={busy || !name.trim()}>
          {busy ? 'Creating…' : 'Create team'}
        </button>
        <button type="button" className="coach-submit coach-submit--ghost coach-submit--inline" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
