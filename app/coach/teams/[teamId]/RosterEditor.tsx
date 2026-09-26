'use client';

/**
 * Roster editing on the team screen (SKI-202): add players, rename, remove.
 *
 * Coaches build their own rosters, so adding is a paste box rather than a
 * one-at-a-time form: a squad is 12–30 players, usually copied from a
 * spreadsheet. Every line gets its own result, and the lines that were
 * refused stay in the box so the coach can fix and resend just those.
 */
import { useState } from 'react';
import {
  CoachApiError,
  parseRosterLines,
  playerLabel,
  useCoachRosterWrites,
  type CoachAddPlayerResult,
  type CoachRosterPlayer,
} from '@/lib/models/coach';

const STATUS_LABEL: Record<CoachAddPlayerResult['status'], string> = {
  added: 'Added',
  already_on_team: 'Already on the team',
  refused: 'Not added',
};

function errorText(error: unknown): string {
  return error instanceof CoachApiError || error instanceof Error ? error.message : 'Something went wrong.';
}

export function AddPlayers({ teamId, onChanged }: { teamId: number; onChanged: () => void }) {
  const { addPlayers } = useCoachRosterWrites();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<CoachAddPlayerResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const entries = parseRosterLines(text);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!entries.length) return;
    setBusy(true);
    setError(null);
    try {
      const { results } = await addPlayers(teamId, entries);
      setResults(results);
      // Keep only what was refused, so it can be fixed and sent again.
      setText(
        results
          .map((result, index) => (result.status === 'refused' ? text.split(/\r?\n/).filter((l) => l.trim())[index] : null))
          .filter(Boolean)
          .join('\n'),
      );
      if (results.some((result) => result.status === 'added')) onChanged();
    } catch (caught) {
      setError(errorText(caught));
    } finally {
      setBusy(false);
    }
  }

  const count = (status: CoachAddPlayerResult['status']) =>
    results?.filter((r) => r.status === status).length ?? 0;
  const summary = [
    `${count('added')} added`,
    count('already_on_team') ? `${count('already_on_team')} already on the team` : null,
    count('refused') ? `${count('refused')} not added` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <form onSubmit={onSubmit} noValidate className="coach-rosteradd">
      <div className="coach-field">
        <label htmlFor="roster-add">Add players</label>
        <textarea
          id="roster-add"
          rows={5}
          value={text}
          placeholder={'Ada Lovelace, ada@school.edu\nBo Diaz <bo@school.edu>\ncy@school.edu'}
          onChange={(event) => setText(event.target.value)}
        />
        <p className="coach-field__hint">
          One player per line: a name and an email, in any order, or paste from a spreadsheet. Players
          sign in from the links in their assignment emails, so they don&rsquo;t need a password.
        </p>
      </div>
      {error && (
        <p className="coach-formerror" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="coach-submit coach-submit--inline" disabled={busy || !entries.length}>
        {busy ? 'Adding…' : entries.length > 1 ? `Add ${entries.length} players` : 'Add player'}
      </button>

      {results && (
        <div className="coach-rosteradd__results" role="status">
          <p className="coach-meta">{summary}</p>
          <ul>
            {/* Refusals first: they are the lines that need the coach. */}
            {[...results]
              .sort((a, b) => Number(b.status === 'refused') - Number(a.status === 'refused'))
              .map((result, index) => (
                <li key={`${result.email}-${index}`} data-status={result.status}>
                  <strong>{result.player ? playerLabel(result.player) : result.email || 'Blank line'}</strong>
                  {result.player && result.email ? <span className="coach-meta"> · {result.email}</span> : null}
                  {' — '}
                  {result.detail ?? STATUS_LABEL[result.status]}
                </li>
              ))}
          </ul>
        </div>
      )}
    </form>
  );
}

export function RosterRowActions({
  teamId,
  player,
  onChanged,
}: {
  teamId: number;
  player: CoachRosterPlayer;
  onChanged: () => void;
}) {
  const { renamePlayer, removePlayer } = useCoachRosterWrites();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(player.displayName ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      setEditing(false);
      onChanged();
    } catch (caught) {
      setError(errorText(caught));
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <form
        className="coach-rowedit"
        onSubmit={(event) => {
          event.preventDefault();
          run(() => renamePlayer(teamId, player.userId, name));
        }}
      >
        <input
          aria-label={`New name for ${playerLabel(player)}`}
          value={name}
          maxLength={150}
          autoFocus
          onChange={(event) => setName(event.target.value)}
        />
        <button type="submit" className="coach-submit coach-submit--inline" disabled={busy}>
          Save
        </button>
        <button type="button" className="coach-submit coach-submit--ghost" onClick={() => setEditing(false)}>
          Cancel
        </button>
        {error && <span className="coach-formerror" role="alert">{error}</span>}
      </form>
    );
  }

  return (
    <span className="coach-rowactions">
      <button type="button" className="coach-linkbutton" onClick={() => setEditing(true)} disabled={busy}>
        Rename
      </button>
      <button
        type="button"
        className="coach-linkbutton"
        disabled={busy}
        onClick={() => {
          if (window.confirm(`Take ${playerLabel(player)} off this team? Their history stays; you can add them back.`)) {
            run(() => removePlayer(teamId, player.userId));
          }
        }}
      >
        Remove
      </button>
      {error && <span className="coach-formerror" role="alert">{error}</span>}
    </span>
  );
}
