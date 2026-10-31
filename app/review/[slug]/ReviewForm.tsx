'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  gameReviewApi, GameReview, GameReviewApiError, Recommendation, RECOMMENDATIONS, ReviewGameDetail, ReviewQuestion,
  TargetRating,
} from '../../../lib/models/gameReview/gameReviewApi';
import { portalFetch } from '../../../lib/models/portal/portalFetch';
import type { PaginatedSession, SessionSummaryItem } from '../../../lib/models/portal/PaginatedSession';
import { titleFromSlug } from '../../../lib/skillIcons';
import { formatWhen } from '../components';

/** The backend links at most 20 sessions to a review. */
const MAX_SESSIONS = 20;

interface Draft {
  targetFit: number | null;
  adjustmentFit: number | null;
  /** Per target, keyed `mood:relax` / `skill:planning`. */
  targets: Record<string, { rating: number | null; note: string }>;
  answers: Record<string, string>;
  recommendation: Recommendation | null;
  summary: string;
  buildRef: string;
  sessionIds: string[];
}

const EMPTY_DRAFT: Draft = {
  targetFit: null,
  adjustmentFit: null,
  targets: {},
  answers: {},
  recommendation: null,
  summary: '',
  buildRef: '',
  sessionIds: [],
};

// Kept per game in this browser, so going off to play the game doesn't lose a half-written review.
const draftKey = (slug: string) => `game-review-draft:${slug}`;

function loadDraft(slug: string): Draft {
  try {
    return { ...EMPTY_DRAFT, ...JSON.parse(window.localStorage.getItem(draftKey(slug)) || '{}') };
  } catch {
    return EMPTY_DRAFT;
  }
}

function saveDraft(slug: string, draft: Draft | null) {
  try {
    if (draft) window.localStorage.setItem(draftKey(slug), JSON.stringify(draft));
    else window.localStorage.removeItem(draftKey(slug));
  } catch {
    /* storage unavailable: drafts just don't persist */
  }
}

function formatDuration(seconds: number): string {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** A 1–5 rating as radio buttons; `allowSkip` adds a "not rated" choice. */
function Scale({ name, value, onChange, label, allowSkip = false, invalid = false, describedBy }: {
  name: string;
  value: number | null;
  onChange: (value: number | null) => void;
  label: string;
  allowSkip?: boolean;
  invalid?: boolean;
  describedBy?: string;
}) {
  return (
    <div className="gr-scale" role="radiogroup" aria-label={label} aria-invalid={invalid || undefined} aria-describedby={describedBy}>
      {allowSkip && (
        <label>
          <input type="radio" name={name} checked={value === null} onChange={() => onChange(null)} />
          <span>Skip</span>
        </label>
      )}
      {[1, 2, 3, 4, 5].map((n) => (
        <label key={n}>
          <input type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)} />
          <span>{n}</span>
        </label>
      ))}
    </div>
  );
}

/** File a review of one game: ratings, answers to the feedback questions, and the sessions played for it. */
export default function ReviewForm({ game, questions, token, onFiled }: {
  game: ReviewGameDetail;
  questions: ReviewQuestion[];
  token: string;
  onFiled: (review: GameReview) => void;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filed, setFiled] = useState(false);

  const [mySessions, setMySessions] = useState<SessionSummaryItem[] | null>(null);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(loadDraft(game.slug));
    setDraftLoaded(true);
  }, [game.slug]);

  useEffect(() => {
    if (draftLoaded) saveDraft(game.slug, draft);
  }, [draftLoaded, game.slug, draft]);

  const update = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setFiled(false);
  };

  // The reviewer's own sessions of this game, newest first: the evidence a review can link.
  const loadMySessions = useCallback(async () => {
    setSessionsError(null);
    try {
      const page = await portalFetch<PaginatedSession>(
        `/sessions/?game_slug=${encodeURIComponent(game.slug)}&limit=${MAX_SESSIONS}`, token,
      );
      setMySessions(page.results);
    } catch (err) {
      setSessionsError(err instanceof Error ? err.message : String(err));
    }
  }, [game.slug, token]);

  useEffect(() => {
    loadMySessions();
  }, [loadMySessions]);

  const adjustmentCounts = new Map(game.recentSessions.map((s) => [s.sessionId, s.adjustmentCount]));
  const targets = [
    ...game.moods.map((slug) => ({ kind: 'mood' as const, slug })),
    ...game.skills.map((slug) => ({ kind: 'skill' as const, slug })),
  ];

  const toggleSession = (id: string) => {
    const picked = draft.sessionIds.includes(id);
    if (!picked && draft.sessionIds.length >= MAX_SESSIONS) return;
    update({ sessionIds: picked ? draft.sessionIds.filter((s) => s !== id) : [...draft.sessionIds, id] });
  };

  const validate = (): Record<string, string> => {
    const found: Record<string, string> = {};
    if (!draft.targetFit) found.targetFit = 'Rate how well it meets its targets.';
    if (!draft.adjustmentFit) found.adjustmentFit = 'Rate how well the live adjustments matched its targets.';
    if (!draft.recommendation) found.recommendation = 'Choose a recommendation.';
    questions.forEach((q) => {
      if (q.required && !draft.answers[q.key]?.trim()) found[`q:${q.key}`] = 'This question needs an answer.';
    });
    return found;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setSubmitError(`Fill in the ${Object.keys(found).length === 1 ? 'highlighted field' : `${Object.keys(found).length} highlighted fields`} first.`);
      return;
    }
    const targetRatings: TargetRating[] = targets.flatMap(({ kind, slug }) => {
      const entry = draft.targets[`${kind}:${slug}`];
      return entry?.rating ? [{ kind, slug, rating: entry.rating, note: entry.note.trim() }] : [];
    });
    setSubmitting(true);
    try {
      const review = await gameReviewApi.fileReview(game.slug, token, {
        targetFitRating: draft.targetFit!,
        adjustmentFitRating: draft.adjustmentFit!,
        targetRatings,
        answers: questions
          .filter((q) => draft.answers[q.key]?.trim())
          .map((q) => ({ key: q.key, answer: draft.answers[q.key].trim() })),
        recommendation: draft.recommendation!,
        summary: draft.summary.trim(),
        buildRef: draft.buildRef.trim(),
        sessionIds: draft.sessionIds,
      });
      setDraft(EMPTY_DRAFT);
      setFiled(true);
      onFiled(review);
    } catch (err) {
      setSubmitError(err instanceof GameReviewApiError ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="sp-card gr-panel" aria-labelledby="gr-form-heading" data-review-form>
      <div>
        <h2 id="gr-form-heading">Your review</h2>
        <p className="margin-none font-sm gr-muted">
          Play it first (each target mood if you can), then rate it. Your draft is kept in this browser until you file it.
        </p>
      </div>
      <form className="gr-form" onSubmit={submit} noValidate>
        <fieldset className="gr-fieldset">
          <legend>Meets its target moods and skills<span className="gr-required" aria-hidden="true">*</span></legend>
          <Scale
            name="targetFit"
            label="Target fit, 1 to 5"
            value={draft.targetFit}
            onChange={(v) => update({ targetFit: v })}
            invalid={!!errors.targetFit}
            describedBy="gr-scale-hint-target"
          />
          <div className="gr-scale-hint gr-muted" id="gr-scale-hint-target"><span>1 misses them</span><span>5 nails them</span></div>
          {errors.targetFit && <span className="font-xs gr-required" role="alert">{errors.targetFit}</span>}
        </fieldset>

        <fieldset className="gr-fieldset">
          <legend>Live adjustments moved it toward those targets<span className="gr-required" aria-hidden="true">*</span></legend>
          <Scale
            name="adjustmentFit"
            label="Adjustment fit, 1 to 5"
            value={draft.adjustmentFit}
            onChange={(v) => update({ adjustmentFit: v })}
            invalid={!!errors.adjustmentFit}
            describedBy="gr-scale-hint-adjust"
          />
          <div className="gr-scale-hint gr-muted" id="gr-scale-hint-adjust"><span>1 worked against them</span><span>5 spot on</span></div>
          {errors.adjustmentFit && <span className="font-xs gr-required" role="alert">{errors.adjustmentFit}</span>}
        </fieldset>

        {targets.length > 0 && (
          <fieldset className="gr-fieldset">
            <legend>Each target (optional)</legend>
            {targets.map(({ kind, slug }) => {
              const key = `${kind}:${slug}`;
              const entry = draft.targets[key] ?? { rating: null, note: '' };
              const setEntry = (patch: Partial<typeof entry>) =>
                update({ targets: { ...draft.targets, [key]: { ...entry, ...patch } } });
              const title = `${titleFromSlug(slug)} (${kind})`;
              return (
                <div className="gr-target-row" key={key}>
                  <span className="font-sm">{title}</span>
                  <Scale name={`target-${key}`} label={`${title} rating`} value={entry.rating} allowSkip onChange={(v) => setEntry({ rating: v })} />
                  <div className="field" data-size="sm">
                    <input
                      type="text"
                      aria-label={`${title} note`}
                      placeholder="Note"
                      value={entry.note}
                      maxLength={2000}
                      disabled={!entry.rating}
                      onChange={(e) => setEntry({ note: e.target.value })}
                    />
                  </div>
                </div>
              );
            })}
          </fieldset>
        )}

        {questions.map((q) => {
          const id = `gr-q-${q.key}`;
          const error = errors[`q:${q.key}`];
          return (
            <div className="field" key={q.key}>
              <label htmlFor={id}>
                {q.prompt}
                {q.required && <span className="gr-required" aria-hidden="true">*</span>}
              </label>
              {q.helpText && <span className="font-xs gr-muted" id={`${id}-help`}>{q.helpText}</span>}
              <textarea
                id={id}
                rows={3}
                maxLength={5000}
                required={q.required}
                aria-invalid={error ? true : undefined}
                aria-describedby={q.helpText ? `${id}-help` : undefined}
                value={draft.answers[q.key] ?? ''}
                onChange={(e) => update({ answers: { ...draft.answers, [q.key]: e.target.value } })}
              />
              {error && <span className="font-xs gr-required" role="alert">{error}</span>}
            </div>
          );
        })}

        <fieldset className="gr-fieldset">
          <legend>Recommendation<span className="gr-required" aria-hidden="true">*</span></legend>
          <div className="gr-scale" role="radiogroup" aria-label="Recommendation" aria-invalid={errors.recommendation ? true : undefined}>
            {RECOMMENDATIONS.map((r) => (
              <label key={r.value}>
                <input
                  type="radio"
                  name="recommendation"
                  value={r.value}
                  checked={draft.recommendation === r.value}
                  onChange={() => update({ recommendation: r.value })}
                />
                <span>{r.label}</span>
              </label>
            ))}
          </div>
          <span className="font-xs gr-muted">Advisory: the decision is made separately.</span>
          {errors.recommendation && <span className="font-xs gr-required" role="alert">{errors.recommendation}</span>}
        </fieldset>

        <div className="field">
          <label htmlFor="gr-summary">Summary</label>
          <textarea
            id="gr-summary"
            rows={3}
            maxLength={10000}
            value={draft.summary}
            onChange={(e) => update({ summary: e.target.value })}
          />
        </div>

        <div className="field">
          <label htmlFor="gr-build-ref">Build reviewed</label>
          <input
            id="gr-build-ref"
            type="text"
            maxLength={200}
            placeholder="skillprint/games@abc1234 or a PR link"
            value={draft.buildRef}
            onChange={(e) => update({ buildRef: e.target.value })}
          />
        </div>

        <fieldset className="gr-fieldset">
          <legend>Sessions you played for this review</legend>
          <span className="font-xs gr-muted">
            Their live adjustments are attached to the review as evidence. Played it in another tab? Refresh the list.
          </span>
          {sessionsError && <div className="gr-alert" role="alert">Couldn&apos;t load your sessions: {sessionsError}</div>}
          {mySessions === null && !sessionsError && <span className="font-sm gr-muted">Loading your sessions…</span>}
          {mySessions?.length === 0 && <span className="font-sm gr-muted">You haven&apos;t played this game yet.</span>}
          {mySessions && mySessions.length > 0 && (
            <div className="gr-sessions" data-review-sessions>
              {mySessions.map((s) => {
                const adjustments = adjustmentCounts.get(s.sessionId);
                return (
                  <label className="gr-session" key={s.sessionId}>
                    <input
                      type="checkbox"
                      checked={draft.sessionIds.includes(s.sessionId)}
                      onChange={() => toggleSession(s.sessionId)}
                    />
                    <span>
                      <strong>{formatWhen(s.playedAt)}</strong>
                      <span className="gr-muted">
                        {' · '}{formatDuration(s.durationSeconds)}
                        {s.primaryMood && <> · {titleFromSlug(s.primaryMood)}</>}
                        {adjustments !== undefined && <> · {adjustments} adjustment{adjustments === 1 ? '' : 's'}</>}
                        {s.primaryScore != null && <> · score {s.primaryScore}</>}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
          <div>
            <button type="button" className="button button--tertiary button--sm" onClick={loadMySessions}>
              <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-refresh"></use></svg>
              Refresh sessions
            </button>
          </div>
        </fieldset>

        {submitError && <div className="gr-alert" role="alert">{submitError}</div>}
        {filed && <div className="gr-alert gr-alert--ok" role="status">Review filed.</div>}
        <div className="gr-actions">
          <button type="submit" className="button button--primary button--md" disabled={submitting}>
            {submitting ? 'Filing…' : 'File review'}
          </button>
        </div>
      </form>
    </section>
  );
}
