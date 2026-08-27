import React from 'react';
import StatBlock from './StatBlock';
import TraitProgress from './TraitProgress';

export interface EmbedCardProps {
  error?: Error | null;
  onRetry?: () => void;
  userName?: string;
  summaryText?: string;
  momentumText?: string;
  flowMedian?: number;
  flowBest?: number;
  stats?: { label: string; value: string | number }[];
  traits?: { traitName: string; score: number; iconId: string }[];
  targetMood?: string;
  streakDays?: number;
  visualizationNode?: React.ReactNode;
}

export default function EmbedCard({
  error,
  onRetry,
  userName = "Player",
  summaryText = "Quiet reasoning carries this print.",
  momentumText = "+0 momentum on last week",
  flowMedian = 0,
  flowBest = 0,
  stats = [],
  traits = [],
  targetMood = "Focus",
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

  const moodIconId = `#ti-mood-${targetMood.toLowerCase()}`;

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
          <div className="embed-print ontology-root" data-skillprint={userName.toLowerCase()} data-sp-compact>
            <div className="ontology-visual clip layout-grid place-center">
              {visualizationNode}
            </div>
          </div>
          <div className="min-width-0">
            <p className="ui-label embed-score__label margin-none">{userName}</p>
            <p className="embed-print__lede margin-none weight-semibold">{summaryText}</p>
            <p className="embed-score__trend margin-none layout-inline-flex items-center gap-sm font-xs weight-semibold">
              <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24">
                <use href="#ti-trending"></use>
              </svg>
              {momentumText}
            </p>
            <p className="margin-none text-muted font-xs leading-md">Flow median {flowMedian} &middot; best {flowBest}</p>
          </div>
        </div>

        {stats.length > 0 && (
          <div className="embed-stats grid grid-3 gap-md">
            {stats.map((stat, idx) => (
              <StatBlock key={idx} label={stat.label} value={stat.value} />
            ))}
          </div>
        )}

        {traits.length > 0 && (
          <div className="embed-traits-block layout-grid gap-md">
            <p className="ui-label margin-none">Top cognitive traits</p>
            <ul className="embed-traits margin-none padding-none layout-grid gap-lg">
              {traits.map((trait, idx) => (
                <TraitProgress key={idx} traitName={trait.traitName} score={trait.score} iconId={trait.iconId} />
              ))}
            </ul>
          </div>
        )}

        <p className="embed-target margin-none layout-inline-flex items-center gap-sm font-xs weight-semibold text-muted">
          <svg className="sp-icon sp-icon--xs sp-icon--mood" aria-hidden="true" viewBox="0 0 24 24">
            <use href={moodIconId}></use>
          </svg>
          Targeting {targetMood} &middot; {streakDays}-day streak
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
