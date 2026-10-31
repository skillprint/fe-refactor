'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PortalLayout from '@/components/PortalLayout';
import PortalHead from '@/components/PortalHead';
import { PortalSection } from '@/components/LayoutGrid';
import { useUserSession } from '../hooks/useUserSession';
import {
  gameReviewApi, GameReviewApiError, REVIEW_STATUSES, ReviewGameSummary, ReviewStatus,
} from '../../lib/models/gameReview/gameReviewApi';
import { formatRating, formatWhen, ReviewerGate, StatusPill, TargetTags } from './components';
import './review.css';

type QueueState =
  | { kind: 'loading' }
  | { kind: 'denied' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; games: ReviewGameSummary[] };

const EMPTY: Record<ReviewStatus, string> = {
  in_review: 'Nothing is waiting for review.',
  changes_requested: 'No games are waiting on changes.',
  released: 'No games have been released through review yet.',
  rejected: 'No games have been rejected.',
};

function isReviewStatus(value: string | null): value is ReviewStatus {
  return REVIEW_STATUSES.some((s) => s.status === value);
}

function errorMessage(err: unknown): string {
  if (err instanceof GameReviewApiError && err.status === 404) {
    return "This backend doesn't have game review yet (marketplace #155).";
  }
  return err instanceof Error ? err.message : String(err);
}

/** The review queue at /review: games by review status, oldest waiting first. */
export default function ReviewQueue() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requested = searchParams.get('status');
  const tab: ReviewStatus = isReviewStatus(requested) ? requested : 'in_review';
  const { userToken } = useUserSession();

  const [state, setState] = useState<QueueState>({ kind: 'loading' });
  // How many games wait in the two working tabs, for their labels.
  const [waiting, setWaiting] = useState<Partial<Record<ReviewStatus, number>>>({});

  useEffect(() => {
    if (!userToken) return;
    let live = true;
    setState({ kind: 'loading' });
    gameReviewApi.games(userToken, [tab]).then(
      ({ results }) => live && setState({ kind: 'ready', games: results }),
      (err) => {
        if (!live) return;
        if (err instanceof GameReviewApiError && err.isForbidden) setState({ kind: 'denied' });
        else setState({ kind: 'error', message: errorMessage(err) });
      },
    );
    return () => {
      live = false;
    };
  }, [userToken, tab]);

  useEffect(() => {
    if (!userToken) return;
    let live = true;
    gameReviewApi.games(userToken, ['in_review', 'changes_requested']).then(({ results }) => {
      if (!live) return;
      setWaiting({
        in_review: results.filter((g) => g.reviewStatus === 'in_review').length,
        changes_requested: results.filter((g) => g.reviewStatus === 'changes_requested').length,
      });
    }, () => {});
    return () => {
      live = false;
    };
  }, [userToken]);

  const countFor = (status: ReviewStatus) =>
    status === tab && state.kind === 'ready' ? state.games.length : waiting[status];

  return (
    <PortalLayout
      pageClass="page--portal-review"
      header={
        <PortalHead
          eyebrow="Skillprint staff"
          title="Game review"
          description="New games wait here, unlisted, until staff release them. Play one, file a review, then release it, ask for changes or reject it."
        />
      }
    >
      {state.kind === 'denied' ? (
        <ReviewerGate />
      ) : (
        <div className="gr-stack">
          <PortalSection ariaLabelledBy="gr-tabs">
            <div className="gr-tabs">
              <div className="button-group" role="tablist" aria-label="Review status" id="gr-tabs">
                {REVIEW_STATUSES.map(({ status, label }) => {
                  const count = countFor(status);
                  return (
                    <button
                      key={status}
                      type="button"
                      role="tab"
                      aria-selected={tab === status}
                      aria-pressed={tab === status}
                      className={`button-group__item ${tab === status ? 'is-current' : ''}`}
                      onClick={() => router.replace(`/review/?status=${status}`, { scroll: false })}
                    >
                      {label}
                      {count !== undefined && <span className="gr-count">{count}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </PortalSection>

          {state.kind === 'loading' && <p className="font-sm gr-muted">Loading the queue…</p>}
          {state.kind === 'error' && <div className="gr-alert" role="alert">{state.message}</div>}
          {state.kind === 'ready' && state.games.length === 0 && (
            <p className="font-sm gr-muted">{EMPTY[tab]}</p>
          )}
          {state.kind === 'ready' && state.games.length > 0 && (
            <div className="gr-grid" data-review-queue>
              {state.games.map((game) => <QueueCard key={game.slug} game={game} />)}
            </div>
          )}
        </div>
      )}
    </PortalLayout>
  );
}

function QueueCard({ game }: { game: ReviewGameSummary }) {
  const { reviews } = game;
  return (
    <Link href={`/review/${encodeURIComponent(game.slug)}`} className="sp-card sp-card--interactive gr-card" data-review-game={game.slug}>
      <div className="gr-card__cover">
        {game.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={game.thumbnail} alt="" loading="lazy" />
        ) : (
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-gamepad"></use></svg>
        )}
      </div>
      <div className="gr-card__body">
        <div className="gr-card__title">
          <h2>{game.name || game.slug}</h2>
          <StatusPill status={game.reviewStatus} />
        </div>
        <span className="font-xs gr-muted">
          {game.slug} · since {formatWhen(game.reviewStatusChangedAt)}
        </span>
        {game.shortDescription && <p className="font-sm gr-clamp">{game.shortDescription}</p>}
        <TargetTags moods={game.moods} skills={game.skills} />
        <dl className="gr-stats">
          <div>
            <dt>Reviews</dt>
            <dd>
              {reviews.count}
              {reviews.count > 0 && <span className="gr-muted"> ({reviews.human} staff, {reviews.agent} agent)</span>}
            </dd>
          </div>
          <div><dt>Target fit</dt><dd>{formatRating(reviews.avgTargetFit)}</dd></div>
          <div><dt>Adjustments</dt><dd>{formatRating(reviews.avgAdjustmentFit)}</dd></div>
          {reviews.openFeedback > 0 && <div><dt>Open feedback</dt><dd>{reviews.openFeedback}</dd></div>}
        </dl>
      </div>
    </Link>
  );
}
