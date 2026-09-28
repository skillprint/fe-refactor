'use client';

/**
 * "New challenge": a play goal (sessions or minutes, optionally of chosen
 * games) or a skill improvement (points on one cognition dimension), set for
 * one team over a date range. Coach-side only: players aren't told in the
 * app yet.
 */
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CoachApiError,
  useCoachCatalogue,
  useCoachChallengeWrites,
  useCoachTeams,
  type CoachChallengeKind,
  type CoachChallengeMetric,
} from '@/lib/models/coach';
import { dimensionLabel } from '../components/ui';

function day(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function refusal(error: unknown): string {
  if (error instanceof CoachApiError) return error.message;
  return error instanceof Error ? error.message : 'Could not create the challenge.';
}

export function NewChallenge() {
  const router = useRouter();
  const { createChallenge } = useCoachChallengeWrites();
  const teams = useCoachTeams();
  const catalogue = useCoachCatalogue();
  const skills = useMemo(
    () => [...new Set((catalogue.data?.games ?? []).flatMap((g) => g.skills))].sort(),
    [catalogue.data],
  );

  const [open, setOpen] = useState(false);
  const [team, setTeam] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<CoachChallengeKind>('Play');
  const [metric, setMetric] = useState<CoachChallengeMetric>('Sessions');
  const [games, setGames] = useState<string[]>([]);
  const [dimension, setDimension] = useState('');
  const [goal, setGoal] = useState('10');
  const [startsOn, setStartsOn] = useState(day(0));
  const [endsOn, setEndsOn] = useState(day(6));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button type="button" className="coach-submit coach-submit--inline" onClick={() => setOpen(true)}>
        New challenge
      </button>
    );
  }

  const teamId = team === '' ? teams.data?.teams[0]?.id : team;
  const ready = title.trim() && teamId && Number(goal) >= 1 && (kind === 'Play' || dimension);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!teamId) return;
    setBusy(true);
    setError(null);
    try {
      const created = await createChallenge({
        team: teamId,
        title: title.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
        kind,
        ...(kind === 'Play' ? { metric, games } : { dimension }),
        goal: Number(goal),
        startsOn,
        endsOn,
      });
      router.push(`/coach/challenges/${created.id}`);
    } catch (caught) {
      setError(refusal(caught));
      setBusy(false);
    }
  }

  const unit = kind === 'Skill' ? 'points of improvement' : metric === 'Minutes' ? 'minutes' : 'sessions';

  return (
    <form onSubmit={onSubmit} noValidate className="coach-rosteradd coach-newchallenge">
      <div className="coach-field">
        <label htmlFor="ch-team">Team</label>
        <select id="ch-team" value={teamId ?? ''} onChange={(e) => setTeam(Number(e.target.value))}>
          {(teams.data?.teams ?? []).map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div className="coach-field">
        <label htmlFor="ch-title">Title</label>
        <input id="ch-title" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="coach-field">
        <label htmlFor="ch-desc">Description (optional)</label>
        <input id="ch-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <fieldset className="coach-field coach-choice">
        <legend>Kind</legend>
        <label>
          <input type="radio" name="ch-kind" checked={kind === 'Play'} onChange={() => setKind('Play')} /> Play goal
        </label>
        <label>
          <input type="radio" name="ch-kind" checked={kind === 'Skill'} onChange={() => setKind('Skill')} /> Skill
          improvement
        </label>
      </fieldset>

      {kind === 'Play' ? (
        <>
          <div className="coach-field">
            <label htmlFor="ch-metric">Count</label>
            <select id="ch-metric" value={metric} onChange={(e) => setMetric(e.target.value as CoachChallengeMetric)}>
              <option value="Sessions">Sessions played</option>
              <option value="Minutes">Minutes played</option>
            </select>
          </div>
          <div className="coach-field">
            <label htmlFor="ch-games">Games (optional)</label>
            <select
              id="ch-games"
              multiple
              size={Math.min(6, catalogue.data?.games.length ?? 3)}
              value={games}
              onChange={(e) => setGames([...e.target.selectedOptions].map((o) => o.value))}
            >
              {(catalogue.data?.games ?? []).map((g) => (
                <option key={g.slug} value={g.slug}>
                  {g.name}
                </option>
              ))}
            </select>
            <p className="coach-field__hint">Leave empty to count every game.</p>
          </div>
        </>
      ) : (
        <div className="coach-field">
          <label htmlFor="ch-dim">Skill</label>
          <select id="ch-dim" value={dimension} onChange={(e) => setDimension(e.target.value)}>
            <option value="">Choose a skill</option>
            {skills.map((slug) => (
              <option key={slug} value={slug}>
                {dimensionLabel(slug)}
              </option>
            ))}
          </select>
          <p className="coach-field__hint">
            Measured against each player&rsquo;s last 28 days. You&rsquo;ll see a player&rsquo;s figure only with a
            profile-level grant.
          </p>
        </div>
      )}

      <div className="coach-field">
        <label htmlFor="ch-goal">Goal per player ({unit})</label>
        <input id="ch-goal" type="number" min={1} value={goal} onChange={(e) => setGoal(e.target.value)} />
      </div>
      <div className="coach-dates">
        <div className="coach-field">
          <label htmlFor="ch-start">Starts</label>
          <input id="ch-start" type="date" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} />
        </div>
        <div className="coach-field">
          <label htmlFor="ch-end">Ends</label>
          <input id="ch-end" type="date" value={endsOn} onChange={(e) => setEndsOn(e.target.value)} />
        </div>
      </div>

      {error && (
        <p className="coach-formerror" role="alert">
          {error}
        </p>
      )}
      <div className="coach-actions" style={{ justifyContent: 'flex-start' }}>
        <button type="submit" className="coach-submit coach-submit--inline" disabled={busy || !ready}>
          {busy ? 'Creating…' : 'Create challenge'}
        </button>
        <button type="button" className="coach-submit coach-submit--ghost coach-submit--inline" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
