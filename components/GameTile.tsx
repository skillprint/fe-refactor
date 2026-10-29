'use client';

import React from 'react';
import Link, { useLinkStatus } from 'next/link';
import { TraitSkillPill } from './TraitSkillPill';
import { PatternArt, patternArtFile } from './PatternArt';
import { DEFAULT_GAME_IMAGE } from '@/lib/playbookUtils';
import { gameDurationLabel } from '@/app/config/gameConfig';

export interface GameTileSkill {
  id: string;
  name: string;
  dimension: 'cognition' | 'mood' | 'personality';
}

export interface GameTileProps {
  id: string;
  title: string;
  description: string;
  image: string;
  animatedImage?: string;
  url: string;
  duration?: string;
  skills?: GameTileSkill[];
  statusBadge?: string;
  tone?: 'pink' | 'mint' | 'green' | 'blue' | 'yellow' | 'purple'; // Matches the tone--* classes
  /** Link to the game's detail page beside the title. Off where visitors shouldn't leave, as on a shared station. */
  showInfoLink?: boolean;
  /** Shown above the Play button. */
  extra?: React.ReactNode;
}

/** A link's icon, which turns to a spinner the moment the link is clicked. */
function LinkIcon({ icon }: { icon: string }) {
  const { pending } = useLinkStatus();
  if (pending) return <span className="sp-icon sp-icon--pending" aria-hidden="true" />;
  return <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href={`#${icon}`}></use></svg>;
}

export function GameTile({
  id,
  title,
  description,
  image,
  animatedImage,
  url,
  duration,
  skills = [],
  statusBadge,
  tone = 'pink',
  showInfoLink = true,
  extra
}: GameTileProps) {
  // Games the design has drawn get its moving pattern card; the rest keep their cover.
  const artFile = patternArtFile(id, title);

  return (
    <article className={`game-card game-card--portal sp-card sp-card--interactive card--flush tone tone--${tone} min-width-0 layout-flex flow-column clip`}>
      {/* Media Area */}
      <Link href={url} className="media-open layout-block full-width padding-none border-none surface-transparent text-left" aria-label={`Play ${title}`} tabIndex={-1}>
        <div className="game-media position-relative clip">
          <div className="art-stack stack position-absolute inset-none clip">
            {artFile ? <PatternArt file={artFile} alt={`${title} game artwork`} /> : <img
              alt={`${title} game artwork`}
              className="art-layer art-static position-absolute layout-block opaque"
              src={image}
              onError={(e) => {
                // SKI-145: a missing cover (untracked asset, dead backend URL) must not
                // leave a broken-image icon in the rail. Fall back to the generic art once.
                if (e.currentTarget.getAttribute('src') !== DEFAULT_GAME_IMAGE) {
                  e.currentTarget.src = DEFAULT_GAME_IMAGE;
                }
              }}
            />}
            {!artFile && animatedImage && (
              <img alt="" aria-hidden="true" className="art-layer art-animated position-absolute layout-block" src={animatedImage} />
            )}
          </div>
          {statusBadge && (
            <span className="media-badge ui-badge position-absolute layout-inline-flex items-center radius-full font-xs leading-sm" data-status={statusBadge.toLowerCase()}>
              {statusBadge}
            </span>
          )}
        </div>
      </Link>

      {/* Body Area */}
      <div className="game-body layout-flex flow-column">
        <div className="game-head layout-flex items-center gap-sm">
          <h3>
            <Link className="no-underline text-default" href={url}>{title}</Link>
          </h3>
          {showInfoLink && (
            <Link className="game-info" aria-label={`View game details for ${title}`} href={`/game_detail?game=${id}`}>
              <LinkIcon icon="ti-info" />
            </Link>
          )}
        </div>
        
        <p className="game-description text-muted font-md leading-lg">{description}</p>
        
        <span className="duration layout-inline-flex items-center gap-md text-muted font-sm weight-semibold">
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-clock"></use></svg>
          {duration ?? gameDurationLabel(id)}
        </span>
        
        {skills && skills.length > 0 && (
          <div className="trait-group layout-grid gap-sm items-start">
            <span className="ui-label trait-label">Skills developed</span>
            <ul className="trait-skills layout-flex wrap items-center margin-none padding-none">
              {skills.map((skill) => (
                <li key={skill.id}>
                  <TraitSkillPill skill={skill} />
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {extra}

        <Link className="play-btn button button--primary button--md full-width push-block-end" href={url}>
          <LinkIcon icon="ti-play" />
          Play<span className="sr-only"> {title}</span>
        </Link>
      </div>
    </article>
  );
}
