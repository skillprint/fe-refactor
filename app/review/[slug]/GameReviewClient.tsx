'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import PortalLayout from '@/components/PortalLayout';
import PortalHead from '@/components/PortalHead';
import { useRouteParams } from '@/lib/useRouteParams';
import { useUserSession } from '../../hooks/useUserSession';
import {
  gameReviewApi, GameReview, GameReviewApiError, RECOMMENDATIONS, ReviewDecision, ReviewGameDetail, ReviewQuestion,
  reviewStatusLabel,
} from '../../../lib/models/gameReview/gameReviewApi';
import { titleFromSlug } from '../../../lib/skillIcons';
import { formatRating, formatWhen, ReviewerGate, TargetTags } from '../components';
import DecisionPanel from './DecisionPanel';
import ReviewForm from './ReviewForm';
import '../review.css';

type DetailState =
  | { kind: 'loading' }
  | { kind: 'denied' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; game: ReviewGameDetail; questions: ReviewQuestion[] };

const DECISION_LABELS: Record<string, string> = {
  submitted: 'Submitted for review',
  released: 'Released',
  changes_requested: 'Changes requested',
  rejected: 'Rejected',
  resubmitted: 'Resubmitted',
  unreleased: 'Pulled back into review',
};

const recommendationLabel = (value: string) =>
  RECOMMENDATIONS.find((r) => r.value === value)?.label ?? value;

function decidedBy(by: ReviewDecision['by']): string {
  if (!by) return 'the system';
  return by.kind === 'human' ? by.email : `${by.name} (agent)`;
}

/** One game in review at /review/<slug>: what it is, how it has fared, and the review and decision forms. */
export default function GameReviewClient() {
  const { slug: rawSlug } = useRouteParams('/review/[slug]');
  const slug = decodeURIComponent(rawSlug);
  const { userToken } = useUserSession();
  const [state, setState] = useState<DetailState>({ kind: 'loading' });

  // `quiet` keeps the page up while it refreshes after a review or decision.
  const load = useCallback(async (quiet = false) => {
    if (!userToken || !slug) return;
    if (!quiet) setState({ kind: 'loading' });
    const [game, questions] = await Promise.allSettled([
      gameReviewApi.game(slug, userToken),
      gameReviewApi.questions(userToken),
    ]);
    if (game.status === 'fulfilled' && questions.status === 'fulfilled') {
      setState({ kind: 'ready', game: game.value, questions: questions.value.results });
      return;
    }
    const failed = [game, questions].find((r): r is PromiseRejectedResult => r.status === 'rejected')!.reason;
    if (failed instanceof GameReviewApiError && failed.isForbidden) setState({ kind: 'denied' });
    else if (questions.status === 'rejected' && questions.reason instanceof GameReviewApiError && questions.reason.status === 404) {
      setState({ kind: 'error', message: "This backend doesn't have game review yet (marketplace #155)." });
    } else if (failed instanceof GameReviewApiError && failed.status === 404) {
      setState({ kind: 'error', message: `No game has the slug “${slug}”.` });
    } else setState({ kind: 'error', message: failed instanceof Error ? failed.message : String(failed) });
  }, [slug, userToken]);

  useEffect(() => {
    load();
  }, [load]);

  const game = state.kind === 'ready' ? state.game : null;
  const playHref = `/game/${encodeURIComponent(slug)}`;

  return (
    <PortalLayout
      pageClass="page--portal-review"
      header={
        <PortalHead
          eyebrow="Game review"
          title={game?.name || titleFromSlug(slug)}
          description={game?.shortDescription || undefined}
          actions={
            <>
              <Link href="/review" className="button button--tertiary button--md">
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-left"></use></svg>
                Queue
              </Link>
              {state.kind !== 'denied' && (
                // A new tab, so the review form (and its draft) stays where it is.
                <a href={playHref} target="_blank" rel="noopener" className="button button--primary button--md" data-review-play>
                  <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-play"></use></svg>
                  Play it
                </a>
              )}
            </>
          }
        />
      }
    >
      {state.kind === 'loading' && <p className="font-sm gr-muted">Loading…</p>}
      {state.kind === 'denied' && <ReviewerGate />}
      {state.kind === 'error' && <div className="gr-alert" role="alert">{state.message}</div>}
      {state.kind === 'ready' && userToken && (
        <div className="gr-detail">
          <div className="gr-layout">
            <div className="gr-stack">
              <AboutPanel game={state.game} playHref={playHref} />
              <ReviewForm key={state.game.slug} game={state.game} questions={state.questions} token={userToken} onFiled={() => load(true)} />
              <ReviewsPanel reviews={state.game.latestReviews} total={state.game.reviews.count} />
            </div>
            <div className="gr-stack">
              <DecisionPanel game={state.game} token={userToken} onDecided={() => load(true)} />
              <HistoryPanel decisions={state.game.decisions} />
              <SessionsPanel game={state.game} />
              <TuningPanel game={state.game} />
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

function AboutPanel({ game, playHref }: { game: ReviewGameDetail; playHref: string }) {
  const { reviews } = game;
  return (
    <section className="sp-card gr-panel" aria-labelledby="gr-about-heading">
      <h2 id="gr-about-heading">About this game</h2>
      {game.longDescription && <p className="gr-prose">{game.longDescription}</p>}
      <div className="gr-stack" style={{ gap: '0.4rem' }}>
        <h3>Targets</h3>
        <TargetTags moods={game.moods} skills={game.skills} />
      </div>
      {game.moods.length > 0 && (
        <div className="gr-play">
          <span className="font-sm gr-muted">Play for</span>
          {game.moods.map((mood) => (
            <a
              key={mood}
              href={`${playHref}?mood=${encodeURIComponent(mood)}`}
              target="_blank"
              rel="noopener"
              className="button button--secondary button--sm"
            >
              {titleFromSlug(mood)}
            </a>
          ))}
        </div>
      )}
      {game.instructions && (
        <div className="gr-stack" style={{ gap: '0.4rem' }}>
          <h3>How to play</h3>
          <p className="gr-prose">{game.instructions}</p>
        </div>
      )}
      <dl className="gr-facts">
        <dt>Slug</dt><dd><code>{game.slug}</code></dd>
        {game.organization && <><dt>Organization</dt><dd>{game.organization.name}</dd></>}
        <dt>Build</dt>
        <dd>{game.url ? <a href={game.url} target="_blank" rel="noopener">{game.url}</a> : 'No playable URL on the record'}</dd>
        <dt>Reviews</dt>
        <dd>
          {reviews.count} ({reviews.human} staff, {reviews.agent} agent) · target fit{' '}
          {formatRating(reviews.avgTargetFit)} · adjustments {formatRating(reviews.avgAdjustmentFit)}
        </dd>
      </dl>
    </section>
  );
}

function ReviewsPanel({ reviews, total }: { reviews: GameReview[]; total: number }) {
  return (
    <section className="sp-card gr-panel" aria-labelledby="gr-reviews-heading" data-review-list>
      <h2 id="gr-reviews-heading">Reviews ({total})</h2>
      {total > reviews.length && <p className="margin-none font-sm gr-muted">The {reviews.length} newest.</p>}
      {reviews.length === 0 && <p className="margin-none font-sm gr-muted">No reviews yet.</p>}
      {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
    </section>
  );
}

function ReviewCard({ review }: { review: GameReview }) {
  const { reviewer } = review;
  return (
    <article className="gr-review" data-review-id={review.id}>
      <div className="gr-review__head">
        <div className="gr-tags" style={{ alignItems: 'center' }}>
          <strong className="font-sm">{reviewer.name || reviewer.email || 'Unknown'}</strong>
          <span className="ui-badge ui-badge--sm">
            {reviewer.kind === 'agent' ? `Agent${reviewer.model ? ` · ${reviewer.model}` : ''}` : 'Staff'}
          </span>
          <span className="font-xs gr-muted">{formatWhen(review.createdAt)}</span>
        </div>
        <span className="ui-badge ui-badge--sm">Recommends: {recommendationLabel(review.recommendation)}</span>
      </div>
      <dl className="gr-stats">
        <div><dt>Target fit</dt><dd>{formatRating(review.targetFitRating)}</dd></div>
        <div><dt>Adjustments</dt><dd>{formatRating(review.adjustmentFitRating)}</dd></div>
        <div><dt>Feedback</dt><dd>{review.status}</dd></div>
        {review.sessionIds.length > 0 && <div><dt>Sessions</dt><dd>{review.sessionIds.length}</dd></div>}
        {review.gameReviewStatus && <div><dt>Filed while</dt><dd>{reviewStatusLabel(review.gameReviewStatus).toLowerCase()}</dd></div>}
      </dl>
      {review.summary && <p className="gr-prose">{review.summary}</p>}
      {review.targetRatings.length > 0 && (
        <ul className="margin-none font-sm" style={{ paddingLeft: '1.1rem' }}>
          {review.targetRatings.map((t) => (
            <li key={`${t.kind}:${t.slug}`}>
              {titleFromSlug(t.slug)} ({t.kind}): {formatRating(t.rating)}{t.note ? ` · ${t.note}` : ''}
            </li>
          ))}
        </ul>
      )}
      {review.answers.map((a) => (
        <div className="gr-qa" key={a.key}>
          <span className="gr-muted">{a.prompt}</span>
          <p className="gr-prose">{a.answer}</p>
        </div>
      ))}
      {review.buildRef && <span className="font-xs gr-muted">Build: {review.buildRef}</span>}
      {review.resolution && (
        <div className="font-xs gr-muted">
          {review.status} by {review.resolution.by || 'someone'} {formatWhen(review.resolution.at)}
          {review.resolution.note && <>: {review.resolution.note}</>}
          {review.resolution.url && <> · <a href={review.resolution.url} target="_blank" rel="noopener">link</a></>}
        </div>
      )}
    </article>
  );
}

function HistoryPanel({ decisions }: { decisions: ReviewDecision[] }) {
  return (
    <section className="sp-card gr-panel" aria-labelledby="gr-history-heading" data-review-history>
      <h2 id="gr-history-heading">History</h2>
      {decisions.length === 0 ? (
        <p className="margin-none font-sm gr-muted">No decisions yet.</p>
      ) : (
        <ol className="gr-timeline">
          {decisions.map((d, i) => (
            <li key={`${d.createdAt}-${i}`}>
              <strong>{DECISION_LABELS[d.action] ?? d.action}</strong>
              <span className="font-xs gr-muted">{formatWhen(d.createdAt)} · {decidedBy(d.by)}</span>
              {d.note && <span className="gr-prose">{d.note}</span>}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function SessionsPanel({ game }: { game: ReviewGameDetail }) {
  return (
    <section className="sp-card gr-panel" aria-labelledby="gr-sessions-heading">
      <h2 id="gr-sessions-heading">Recent sessions</h2>
      {game.recentSessions.length === 0 ? (
        <p className="margin-none font-sm gr-muted">Nobody has played it yet.</p>
      ) : (
        <div className="gr-table-wrap">
          <table className="gr-table">
            <thead>
              <tr><th>When</th><th>Mood</th><th>State</th><th>Adjustments</th></tr>
            </thead>
            <tbody>
              {game.recentSessions.map((s) => (
                <tr key={s.sessionId}>
                  <td>{formatWhen(s.atCreated)}</td>
                  <td>{s.targetMood ? titleFromSlug(s.targetMood) : '–'}</td>
                  <td>{s.state}</td>
                  <td>{s.adjustmentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function TuningPanel({ game }: { game: ReviewGameDetail }) {
  const config = game.scoringConfig;
  return (
    <section className="sp-card gr-panel" aria-labelledby="gr-tuning-heading">
      <h2 id="gr-tuning-heading">Tuning</h2>
      {!config ? (
        <p className="margin-none font-sm gr-muted">No scoring config, so nothing adjusts it during play.</p>
      ) : (
        <>
          {config.adjustmentInstructions && (
            <details>
              <summary className="font-sm">Mood adjustment instructions</summary>
              <pre className="gr-pre">{config.adjustmentInstructions}</pre>
            </details>
          )}
          {config.skillAdjustmentInstructions && (
            <details>
              <summary className="font-sm">Skill adjustment instructions</summary>
              <pre className="gr-pre">{config.skillAdjustmentInstructions}</pre>
            </details>
          )}
          <details>
            <summary className="font-sm">Parameters</summary>
            <pre className="gr-pre">{JSON.stringify(config.parameterDefinitions, null, 2)}</pre>
          </details>
        </>
      )}
    </section>
  );
}
