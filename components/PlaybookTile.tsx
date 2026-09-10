import React from 'react';
import Link from 'next/link';

export interface PlaybookTileProps {
  id: string;
  title: string;
  description: string;
  iconSrc: string;
  /** Next unplayed game; omit to send the player to the playbook page to start. */
  nextGameSlug?: string;
  nextGameImage?: string;
  totalGames: number;
  completedGames: number;
  isFinished: boolean;
  tone?: 'pink' | 'magenta' | 'orange' | 'blue' | 'green' | 'yellow' | 'purple';
}

export function PlaybookTile({
  id,
  title,
  description,
  iconSrc,
  nextGameSlug,
  nextGameImage,
  totalGames,
  completedGames,
  isFinished,
  tone = 'pink'
}: PlaybookTileProps) {
  const detailUrl = `/playbooks/${encodeURIComponent(id)}`;
  // A finished set, or one whose next game we do not know client-side, starts
  // from the playbook page, which picks the next game in sequence.
  const playUrl = isFinished || !nextGameSlug
    ? detailUrl
    : `/game/${encodeURIComponent(nextGameSlug)}/interstitial?source=playbook&playbookId=${encodeURIComponent(id)}`;

  return (
    <article className={`game-card game-card--portal playbook-card sp-card sp-card--interactive card--flush tone tone--${tone} min-width-0 layout-flex flow-column clip`}>
      <div className="playbook-card__head">
        <img alt="" aria-hidden="true" className="playbook-card__mark layout-block" src={iconSrc} width="512" height="512" />
        <h3 className="playbook-card__title">
          <Link className="no-underline playbook-card__link" href={playUrl}>{title}</Link>
        </h3>
        <p className="playbook-card__blurb">{description}</p>
      </div>

      <div className="playbook-card__progress layout-flex items-center">
        <span className="playbook-card__preview layout-block clip">
          <img alt="" aria-hidden="true" className="layout-block" src={nextGameImage || '/assets/images/games/game-arcade-machine.svg'} width="64" height="64" />
        </span>
        <div className="playbook-card__tally min-width-0">
          <p className="playbook-card__count">{completedGames} of {totalGames} games played</p>
          <ol className="playbook-pips layout-flex items-center margin-none padding-none" aria-hidden="true">
            {Array.from({ length: totalGames }).map((_, i) => (
              <li key={i} className={`playbook-pip ${i < completedGames ? 'playbook-pip--played' : ''}`}></li>
            ))}
          </ol>
        </div>
      </div>

      <div className="card-actions cluster playbook-card__actions">
        <Link aria-label={`How to play ${title}`} className="details-btn button button--secondary button--sm" href={detailUrl}>
          How to play
        </Link>
        <Link 
          aria-label={`Play ${title}`} 
          className="play-btn button button--primary button--sm" 
          href={playUrl}
        >
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-play"></use></svg>
          {isFinished ? 'Play again' : completedGames > 0 ? 'Continue' : 'Play'}
        </Link>
      </div>
    </article>
  );
}
