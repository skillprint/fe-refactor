'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PortalLayout from '@/components/PortalLayout';
import PortalHead from '@/components/PortalHead';
import { PortalSection } from '@/components/LayoutGrid';
import { GamesFilter, SkillOption } from '@/components/GamesFilter';
import { useUserSession } from '../hooks/useUserSession';
import { PORTAL_SKILLS } from '../config/skillsTaxonomy';
import { titleFromSlug } from '../../lib/skillIcons';
import {
  gameReviewApi, GameReviewApiError, REVIEW_STATUSES, ReviewGameSummary, ReviewStatus,
} from '../../lib/models/gameReview/gameReviewApi';
import { formatRating, formatWhen, ReviewerGate, StatusPill, TargetTags } from './components';
import './review.css';

type Pillar = SkillOption['pillar'];

/** The URL parameter each filter dropdown keeps its choice in. */
const FILTER_PARAMS: Record<Pillar, string> = { mood: 'mood', cognition: 'skill', personality: 'trait' };

const targetName = (slug: string) => PORTAL_SKILLS[slug]?.name ?? titleFromSlug(slug);

/** A game's skill tag belongs under personality when the taxonomy says so, else cognition. */
const skillPillar = (slug: string): Pillar => (PORTAL_SKILLS[slug]?.pillar === 'personality' ? 'personality' : 'cognition');

/**
 * The dropdown options: the targets the loaded games carry, A–Z, plus any
 * chosen one they don't (picked in another tab, or from a link), so its
 * dropdown still names it.
 */
function filterOptions(games: ReviewGameSummary[], selected: Record<Pillar, string | null>) {
  const slugs: Record<Pillar, Set<string>> = { mood: new Set(), cognition: new Set(), personality: new Set() };
  for (const game of games) {
    game.moods.forEach((slug) => slugs.mood.add(slug));
    game.skills.forEach((slug) => slugs[skillPillar(slug)].add(slug));
  }
  const options = {} as Record<Pillar, SkillOption[]>;
  for (const pillar of Object.keys(slugs) as Pillar[]) {
    if (selected[pillar]) slugs[pillar].add(selected[pillar]!);
    options[pillar] = [...slugs[pillar]]
      .map((slug) => ({ slug, name: targetName(slug), pillar }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  return options;
}

function matchesFilters(game: ReviewGameSummary, selected: Record<Pillar, string | null>, query: string) {
  if (selected.mood && !game.moods.includes(selected.mood)) return false;
  if (selected.cognition && !game.skills.includes(selected.cognition)) return false;
  if (selected.personality && !game.skills.includes(selected.personality)) return false;
  if (!query) return true;
  const haystack = [game.name, game.slug, game.shortDescription, ...[...game.moods, ...game.skills].map(targetName)];
  return haystack.some((text) => text?.toLowerCase().includes(query));
}

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
  const selected: Record<Pillar, string | null> = {
    mood: searchParams.get(FILTER_PARAMS.mood),
    cognition: searchParams.get(FILTER_PARAMS.cognition),
    personality: searchParams.get(FILTER_PARAMS.personality),
  };
  const { userToken } = useUserSession();

  const [state, setState] = useState<QueueState>({ kind: 'loading' });
  const [query, setQuery] = useState('');
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

  // The tab and the dropdown choices live in the URL, so a filtered queue can be linked to.
  const updateUrl = (changes: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.replace(`/review/?${params}`, { scroll: false });
  };
  const select = (pillar: Pillar) => (slug: string | null) => updateUrl({ [FILTER_PARAMS[pillar]]: slug });
  const clearFilters = () => {
    setQuery('');
    updateUrl({ mood: null, skill: null, trait: null });
  };

  const games = state.kind === 'ready' ? state.games : [];
  const options = filterOptions(games, selected);
  const needle = query.trim().toLowerCase();
  const shown = games.filter((game) => matchesFilters(game, selected, needle));
  const filtering = Boolean(needle || selected.mood || selected.cognition || selected.personality);

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
                      onClick={() => updateUrl({ status })}
                    >
                      {label}
                      {count !== undefined && <span className="gr-count">{count}</span>}
                    </button>
                  );
                })}
              </div>
              <label className="field gr-search">
                <span className="sr-only">Search games</span>
                <input
                  type="search"
                  placeholder="Search name, slug or target"
                  autoComplete="off"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            </div>
            <GamesFilter
              moods={options.mood}
              cognitions={options.cognition}
              // Personality shows only once a game carries a personality skill tag.
              personalities={options.personality.length > 0 ? options.personality : undefined}
              selectedMood={selected.mood}
              selectedCognition={selected.cognition}
              selectedPersonality={selected.personality}
              onSelectMood={select('mood')}
              onSelectCognition={select('cognition')}
              onSelectPersonality={select('personality')}
              onClearAll={clearFilters}
            />
          </PortalSection>

          {state.kind === 'loading' && <p className="font-sm gr-muted">Loading the queue…</p>}
          {state.kind === 'error' && <div className="gr-alert" role="alert">{state.message}</div>}
          {state.kind === 'ready' && games.length === 0 && (
            <p className="font-sm gr-muted">{EMPTY[tab]}</p>
          )}
          {state.kind === 'ready' && games.length > 0 && filtering && (
            <div className="gr-actions font-sm gr-muted" role="status" data-review-filter-count>
              {shown.length} of {games.length} {games.length === 1 ? 'game' : 'games'}
              <button type="button" className="button button--tertiary button--sm" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}
          {shown.length > 0 && (
            <div className="gr-grid" data-review-queue>
              {shown.map((game) => <QueueCard key={game.slug} game={game} />)}
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
