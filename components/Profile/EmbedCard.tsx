import React from 'react';
import StatBlock from './StatBlock';
import TraitProgress from './TraitProgress';

export interface EmbedTrait {
  traitName: string;
  score: number;
  iconId: string;
}

export interface EmbedTargetMood {
  /** Taxonomy slug, used for the sprite id (`#ti-mood-<slug>`). */
  slug: string;
  name: string;
}

export interface EmbedCardProps {
  error?: Error | null;
  onRetry?: () => void;
  userName?: string;
  summaryText?: string;
  /** Hidden when null: there was no prior week to compare against. */
  momentumText?: string | null;
  /** Null renders an em dash: the player has no scored sessions yet. */
  flowMedian?: number | null;
  flowBest?: number | null;
  stats?: { label: string; value: string | number }[];
  traits?: EmbedTrait[];
  /** Null hides the "Targeting …" phrase. */
  targetMood?: EmbedTargetMood | null;
  streakDays?: number;
  visualizationNode?: React.ReactNode;
}

const dash = '—';

export default function EmbedCard({
  error,
  onRetry,
  userName = 'Player',
  summaryText,
  momentumText = null,
  flowMedian = null,
  flowBest = null,
  stats = [],
  traits = [],
  targetMood = null,
  streakDays = 0,
  visualizationNode,
}: EmbedCardProps) {

  if (error) {
    return (
      <div className="embed-card embed-card--error sp-card card--flush clip layout-grid" data-embed-card>
        <div className="embed-card__head layout-flex items-center justify-between gap-md">
          <span className="embed-card__brand layout-inline-flex items-center gap-sm">
            <img alt="Skillprint" className="embed-card__mark" height="20" src="/assets/logos/skillprint-favicon-customer.svg" width="20" />
            <span className="ui-label">Skillprint</span>
          </span>
        </div>
        <div className="embed-card__body embed-empty layout-grid place-center text-center gap-lg">
          <span aria-hidden="true" className="embed-empty__glyph sp-icon-frame sp-icon-frame--lg sp-icon-frame--round">
            <svg className="sp-icon sp-icon--lg" viewBox="0 0 24 24">
              <use href="#ti-alert"></use>
            </svg>
          </span>
          <div>
            <p className="embed-empty__title margin-none weight-semibold">Unable to load profile</p>
            <p className="margin-none text-muted font-xs leading-md">
              The Skillprint service did not respond. Nothing was lost &mdash; scores sync again on the next request.
            </p>
          </div>
          <button className="button button--secondary button--sm no-grow" type="button" onClick={onRetry} data-embed-retry>
            <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
              <use href="#ti-refresh"></use>
            </svg>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="embed-card sp-card card--flush clip layout-grid" data-embed-card>
      <div className="embed-card__head layout-flex items-center justify-between gap-md">
        <span className="embed-card__brand layout-inline-flex items-center gap-sm">
          <img alt="Skillprint" className="embed-card__mark" height="20" src="/assets/logos/skillprint-favicon-customer.svg" width="20" />
          <span className="ui-label">Skillprint</span>
        </span>
        <span className="ui-label embed-card__week">Profile</span>
      </div>

      <div className="embed-card__body layout-grid gap-xl">
        <div className="embed-score layout-flex items-center gap-xl">
          <div className="embed-print ontology-root" data-sp-compact>
            <div className="ontology-visual clip layout-grid place-center">
              {visualizationNode}
            </div>
          </div>
          <div className="min-width-0">
            <p className="ui-label embed-score__label margin-none">{userName}</p>
            {summaryText && (
              <p className="embed-print__lede margin-none weight-semibold">{summaryText}</p>
            )}
            {momentumText && (
              <p className="embed-score__trend margin-none layout-inline-flex items-center gap-sm font-xs weight-semibold">
                <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24">
                  <use href="#ti-trending"></use>
                </svg>
                {momentumText}
              </p>
            )}
            <p className="margin-none text-muted font-xs leading-md">
              Flow median {flowMedian ?? dash} &middot; best {flowBest ?? dash}
            </p>
          </div>
        </div>

        {stats.length > 0 && (
          <div className="embed-stats grid grid-3 gap-md">
            {stats.map((stat) => (
              <StatBlock key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        )}

        {traits.length > 0 && (
          <div className="embed-traits-block layout-grid gap-md">
            <p className="ui-label margin-none">Top cognitive traits</p>
            <ul className="embed-traits margin-none padding-none layout-grid gap-lg">
              {traits.map((trait) => (
                <TraitProgress key={trait.traitName} traitName={trait.traitName} score={trait.score} iconId={trait.iconId} />
              ))}
            </ul>
          </div>
        )}

        <p className="embed-target margin-none layout-inline-flex items-center gap-sm font-xs weight-semibold text-muted">
          {targetMood && (
            <>
              <svg className="sp-icon sp-icon--xs sp-icon--mood" aria-hidden="true" viewBox="0 0 24 24">
                <use href={`#ti-mood-${targetMood.slug}`}></use>
              </svg>
              Targeting {targetMood.name} &middot;{' '}
            </>
          )}
          {streakDays}-day streak
        </p>
      </div>

      <a className="embed-card__action button button--primary button--sm full-width" href="/profile" target="_blank" rel="noopener noreferrer">
        View full profile
        <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
          <use href="#ti-arrow-right"></use>
        </svg>
      </a>
    </div>
  );
}
