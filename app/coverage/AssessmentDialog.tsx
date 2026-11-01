'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { CoverageGame, CoverageReport } from '../../lib/models/gameCoverage/gameCoverageApi';
import { gameCoverageApi } from '../../lib/models/gameCoverage/gameCoverageApi';
import { skillIconId } from '../../lib/skillIcons';
import { formatWhen, TargetTags } from '../review/components';
import { formatNumber, previewTraits, readinessSummary } from './coverageUtils';

const LEVELS = [0, 1, 2, 3];
const LEVEL_HINT = '0 none · 1 minor · 2 secondary · 3 primary demand';

/**
 * One game's 0-3 strengths in every skill and mood, plus how social or
 * competitive its play is, in a dialog. A game nobody has assessed starts from
 * its backend tags, so saving confirms (or corrects) them. Personality is
 * derived, shown as a preview.
 */
export default function AssessmentDialog({
  report, game, token, onSaved, onCancel,
}: {
  report: CoverageReport;
  game: CoverageGame;
  token: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const assessed = report.dimensions.filter((d) => d.pillar !== 'personality');
  const [strengths, setStrengths] = useState<Record<string, number>>(() =>
    Object.fromEntries(assessed.map((d) => [d.slug, Math.round(Math.min(3, Math.max(0, game.strengths[d.slug] ?? 0)))])),
  );
  const [social, setSocial] = useState(game.assessment?.social ?? 0);
  const [notes, setNotes] = useState(game.assessment?.notes ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const traits = previewTraits(report, strengths, social);

  // Escape closes; the page behind does not scroll (as ShareSheet does).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onCancel]);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await gameCoverageApi.assess(game.slug, token, { strengths, social, notes });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  };

  const clear = async () => {
    setBusy(true);
    setError(null);
    try {
      await gameCoverageApi.clearAssessment(game.slug, token);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  };

  // Rendered on the body: a transformed ancestor would otherwise pin the fixed backdrop.
  return createPortal(
    <div className="popup-backdrop inset-none place-center is-open" onClick={onCancel} data-coverage-dialog>
      <article
        aria-labelledby="cv-dialog-title"
        aria-modal="true"
        className="popup popup--dark cv-dialog"
        role="dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          className="popup__content cv-editor gr-form"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <div className="cv-dialog__title">
            <h2 id="cv-dialog-title" className="margin-none">Assess {game.name}</h2>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close"
              className="button button--tertiary button--icon-only button--md layout-grid place-center radius-control surface-transparent padding-none no-grow"
            >
              <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-close"></use></svg>
            </button>
          </div>
          <div className="cv-editor__head">
            <div className="font-sm">
              {game.assessment ? (
                game.assessment.updatedBy ? (
                  <>Assessed by {game.assessment.updatedBy}, {formatWhen(game.assessment.updatedAt)}.</>
                ) : (
                  <>Seeded from the coverage sheet (Sep 2026).</>
                )
              ) : (
                <>Not assessed yet: starting from its backend tags, each worth {formatNumber(report.weights.tagStrength)}.</>
              )}{' '}
              <span className="gr-muted">Readiness {formatNumber(game.readiness.total)}: {readinessSummary(game)}.</span>
            </div>
            <div className="cv-editor__tags">
              <span className="font-xs gr-muted">Backend tags</span>
              <TargetTags moods={game.moods} skills={game.skills} />
            </div>
            {game.url && (
              <a className="font-xs" href={game.url} target="_blank" rel="noreferrer">Open the build</a>
            )}
          </div>

          <p className="font-xs gr-muted margin-none">{LEVEL_HINT}</p>
          <div className="cv-editor__grid">
            {(['cognition', 'mood'] as const).map((pillar) => (
              <fieldset key={pillar} className="gr-fieldset">
                <legend>{pillar === 'cognition' ? 'Cognition' : 'Mood'}</legend>
                {assessed.filter((d) => d.pillar === pillar).map((d) => (
                  <div key={d.slug} className="cv-level-row">
                    <span className="cv-dim__name" title={d.description || undefined}>
                      <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href={`#${skillIconId(pillar, d.slug)}`}></use></svg>
                      {d.name}
                    </span>
                    <LevelPicker
                      name={`${game.slug}-${d.slug}`}
                      label={`${d.name}, 0 to 3`}
                      value={strengths[d.slug] ?? 0}
                      onChange={(v) => setStrengths((s) => ({ ...s, [d.slug]: v }))}
                    />
                  </div>
                ))}
              </fieldset>
            ))}
            <fieldset className="gr-fieldset">
              <legend>Personality (derived)</legend>
              <div className="cv-level-row">
                <span className="cv-dim__name" title="Multiplayer, co-op or competitive play: adds to openness, extraversion and agreeableness">
                  <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-users"></use></svg>
                  Social / competitive
                </span>
                <LevelPicker name={`${game.slug}-social`} label="Social or competitive play, 0 to 3" value={social} onChange={setSocial} />
              </div>
              {report.dimensions.filter((d) => d.pillar === 'personality').map((d) => (
                <div key={d.slug} className="cv-level-row cv-level-row--derived">
                  <span className="cv-dim__name">
                    <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href={`#${skillIconId('personality', d.slug)}`}></use></svg>
                    {d.name}
                  </span>
                  <span className="cv-bar cv-bar--trait" aria-hidden="true"><span style={{ width: `${(traits[d.slug] / 3) * 100}%` }} /></span>
                  <span className="cv-dim__stat">{traits[d.slug].toFixed(2)}</span>
                </div>
              ))}
              <p className="font-xs gr-muted margin-none">
                From the moods above, through the scorer&apos;s mood and OCEAN weight matrices, plus social play.
              </p>
            </fieldset>
          </div>

          <label className="gr-fieldset">
            <span className="font-sm"><strong>Notes</strong></span>
            <textarea rows={2} value={notes} maxLength={4000} onChange={(e) => setNotes(e.target.value)} placeholder="Why these ratings, caveats about the build or its tags" />
          </label>

          {error && <div className="gr-alert" role="alert">{error}</div>}
          <div className="cv-editor__actions">
            <button type="submit" className="button button--primary button--sm" disabled={busy}>
              {busy ? 'Saving…' : 'Save assessment'}
            </button>
            <button type="button" className="button button--tertiary button--sm" onClick={onCancel} disabled={busy}>Cancel</button>
            {game.assessment && (
              <button type="button" className="button button--tertiary button--sm cv-editor__clear" onClick={clear} disabled={busy}>
                Remove assessment (rank on tags)
              </button>
            )}
          </div>
        </form>
      </article>
    </div>,
    document.body,
  );
}

function LevelPicker({ name, label, value, onChange }: { name: string; label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="gr-scale cv-scale" role="radiogroup" aria-label={label}>
      {LEVELS.map((n) => (
        <label key={n}>
          <input type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)} />
          <span>{n}</span>
        </label>
      ))}
    </div>
  );
}
