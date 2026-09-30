'use client';

/**
 * Assign a playbook (SKI-226).
 *
 * Team or a subset of players in one flow — picking a team preselects its
 * roster and switching to "some players" keeps the selection, so narrowing down
 * is not a restart.
 *
 * **Players are emailed when you assign** (SKI-232), unless they have turned
 * assignment email off or have no real address on file — partner-provisioned
 * players may not, until SKI-228. The screen says so, so a coach does not
 * assume everyone was told.
 */
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useCoachPlaybook,
  useCoachRoster,
  useCoachTeams,
  useCoachWrites,
  playerLabel,
  type CoachAssignmentCadence,
} from '@/lib/models/coach';
import { ErrorState, Loading, Panel } from '../../../components/ui';
import { FormError } from '../../../components/AuthForm';

export default function AssignPage({ params }: { params: Promise<{ playbookId: string }> }) {
  const { playbookId } = use(params);
  const router = useRouter();

  const playbook = useCoachPlaybook(playbookId);
  const teams = useCoachTeams();
  const { createAssignment } = useCoachWrites();

  const [teamId, setTeamId] = useState<number | null>(null);
  const [mode, setMode] = useState<'team' | 'player'>('team');
  const [selected, setSelected] = useState<number[]>([]);
  const [dueAt, setDueAt] = useState('');
  const [cadence, setCadence] = useState<CoachAssignmentCadence>('OneOff');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Default to the first team rather than making the coach pick when they only
  // have one.
  useEffect(() => {
    if (teamId === null && teams.data?.teams.length) setTeamId(teams.data.teams[0].id);
  }, [teams.data, teamId]);

  const roster = useCoachRoster(teamId);

  // Selecting the whole roster by default means switching to "some players"
  // starts from everyone and narrows, which is the common direction.
  useEffect(() => {
    if (roster.data) setSelected(roster.data.players.map((p) => p.userId));
  }, [roster.data]);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const { assignments } = await createAssignment({
        playbookId,
        targetType: mode,
        ...(mode === 'team' ? { teamId: teamId ?? undefined } : { userIds: selected }),
        dueAt: dueAt || null,
        cadence,
        note,
      });
      // One assignment per player for "some players", so several come back;
      // the list is the only screen that shows them all.
      router.push(
        assignments.length === 1 ? `/coach/assignments/${assignments[0].id}` : '/coach/assignments',
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not assign.');
      setBusy(false);
    }
  }

  return (
    <>
      <Link href={`/coach/playbooks/${playbookId}`} className="coach-back">&larr; Back to playbook</Link>

      <div className="coach-pagehead">
        <h1>Assign {playbook.data?.title ?? 'playbook'}</h1>
        <p>Choose who gets it and when it&rsquo;s due.</p>
      </div>

      {playbook.error && <ErrorState error={playbook.error} onRetry={playbook.refetch} />}

      <Panel title="Who">
        {teams.isLoading && !teams.data && <Loading rows={2} />}

        {teams.data && (
          <>
            <div className="coach-field">
              <label htmlFor="assign-team">Team</label>
              <select
                id="assign-team"
                value={teamId ?? ''}
                onChange={(e) => setTeamId(Number(e.target.value))}
              >
                {teams.data.teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div className="coach-choice">
              <label>
                <input type="radio" checked={mode === 'team'} onChange={() => setMode('team')} />
                The whole team
              </label>
              <label>
                <input type="radio" checked={mode === 'player'} onChange={() => setMode('player')} />
                Some players
              </label>
            </div>

            {mode === 'player' && (
              <>
                {roster.isLoading && !roster.data && <Loading rows={3} />}
                {roster.data && (
                  <ul className="coach-checklist">
                    {roster.data.players.map((player) => (
                      <li key={player.userId}>
                        <label>
                          <input
                            type="checkbox"
                            checked={selected.includes(player.userId)}
                            onChange={(e) =>
                              setSelected(
                                e.target.checked
                                  ? [...selected, player.userId]
                                  : selected.filter((id) => id !== player.userId),
                              )
                            }
                          />
                          {playerLabel(player)}
                          <span className="coach-meta">
                            {' '}· last played {player.lastPlayed ?? 'never'}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="coach-meta">
                  {selected.length} selected
                  {selected.length > 1 &&
                    ` · creates ${selected.length} assignments, one per player, so each can be cancelled on its own`}
                </p>
              </>
            )}
          </>
        )}
      </Panel>

      <Panel title="When">
        <div className="coach-field">
          <label htmlFor="assign-due">Due</label>
          <input id="assign-due" type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          <p className="coach-field__hint">
            {cadence === 'Weekly'
              ? 'Needed for a weekly assignment — it repeats until this date.'
              : 'Optional. Leave empty for no deadline.'}
          </p>
        </div>
        {/* No "every match day": the backend deliberately has no such cadence
            (marketplace PR #69) because we do not ingest a match schedule, and
            offering it here would be an option the API rejects. */}
        <div className="coach-field">
          <label htmlFor="assign-cadence">Repeat</label>
          <select
            id="assign-cadence"
            value={cadence}
            onChange={(e) => setCadence(e.target.value as CoachAssignmentCadence)}
          >
            <option value="OneOff">Once</option>
            <option value="Weekly">Every week until the due date</option>
          </select>
        </div>
      </Panel>

      <Panel title="Note" note="Shown to the player alongside the playbook.">
        <div className="coach-field">
          <label htmlFor="assign-note" className="sr-only">Note</label>
          <textarea
            id="assign-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ten minutes before Tuesday's match."
          />
        </div>
      </Panel>

      <div className="coach-state" style={{ marginBottom: 18 }}>
        <h3>Players are emailed when you assign this</h3>
        <p>
          Except anyone who has turned assignment emails off or has no email address on file. Everyone
          sees it in their portal either way, and players who haven&rsquo;t started get a reminder as
          the due date gets close.
        </p>
      </div>

      {error && <FormError message={error} />}

      <div className="coach-actions">
        <button type="button" className="coach-submit" disabled={busy} onClick={submit}>
          {busy ? 'Assigning…' : 'Assign'}
        </button>
      </div>
    </>
  );
}
