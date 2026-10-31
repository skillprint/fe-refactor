'use client';

import { useState } from 'react';
import {
  DECISIONS, DecisionAction, gameReviewApi, GameReviewApiError, ReviewGameDetail, reviewStatusLabel,
} from '../../../lib/models/gameReview/gameReviewApi';
import { formatWhen, StatusPill } from '../components';

const yesNo = (value: boolean) => (value ? 'Yes' : 'No');

/** Where the game stands, and the staff decisions that apply to it now. */
export default function DecisionPanel({ game, token, onDecided }: {
  game: ReviewGameDetail;
  token: string;
  onDecided: () => void;
}) {
  const [note, setNote] = useState('');
  const [pending, setPending] = useState<DecisionAction | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const actions = DECISIONS.filter((d) => d.from.includes(game.reviewStatus));
  const pendingDecision = DECISIONS.find((d) => d.action === pending);

  const decide = async (action: DecisionAction) => {
    setBusy(true);
    setResult(null);
    try {
      const after = await gameReviewApi.decide(game.slug, token, action, note.trim());
      setNote('');
      setResult({
        ok: true,
        text: `Now ${reviewStatusLabel(after.reviewStatus).toLowerCase()}: ${after.isPubliclyListed ? 'listed' : 'unlisted'}, ${after.isActive ? 'active' : 'inactive'}.`,
      });
    } catch (err) {
      // 409: the game moved on (someone else decided first); the reload shows where it is now.
      setResult({ ok: false, text: err instanceof GameReviewApiError ? err.message : String(err) });
    } finally {
      setBusy(false);
      setPending(null);
      onDecided();
    }
  };

  return (
    <section className="sp-card gr-panel" aria-labelledby="gr-decision-heading" data-review-decision>
      <div className="gr-card__title">
        <h2 id="gr-decision-heading">Decision</h2>
        <StatusPill status={game.reviewStatus} />
      </div>
      <dl className="gr-facts">
        <dt>Since</dt><dd>{formatWhen(game.reviewStatusChangedAt)}</dd>
        <dt>Listed</dt><dd>{yesNo(game.isPubliclyListed)}</dd>
        <dt>Active</dt><dd>{yesNo(game.isActive)}</dd>
        <dt>List on release</dt><dd>{yesNo(game.listOnRelease)}</dd>
      </dl>

      {actions.length > 0 && (
        <>
          <div className="field">
            <label htmlFor="gr-decision-note">Note (optional)</label>
            <textarea
              id="gr-decision-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why, and what should change. Saved in the game's history."
              rows={3}
              maxLength={5000}
            />
          </div>
          {pendingDecision ? (
            <div className="gr-actions" role="group" aria-label="Confirm decision">
              <button type="button" className="button button--primary button--sm" disabled={busy} onClick={() => decide(pendingDecision.action)}>
                {busy ? 'Saving…' : `Confirm: ${pendingDecision.label.toLowerCase()}`}
              </button>
              <button type="button" className="button button--tertiary button--sm" disabled={busy} onClick={() => setPending(null)}>
                Cancel
              </button>
            </div>
          ) : (
            <div className="gr-actions">
              {actions.map((d) => (
                <button
                  key={d.action}
                  type="button"
                  className={`button ${d.action === 'release' ? 'button--primary' : 'button--secondary'} button--sm`}
                  onClick={() => setPending(d.action)}
                  data-decision={d.action}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}
        </>
      )}
      {result && (
        <div className={`gr-alert ${result.ok ? 'gr-alert--ok' : ''}`} role={result.ok ? 'status' : 'alert'}>{result.text}</div>
      )}
    </section>
  );
}
