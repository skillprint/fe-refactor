import React from 'react';
import Link from 'next/link';

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
}

export function GameTile({
  id,
  title,
  description,
  image,
  animatedImage,
  url,
  duration = '5–10 min',
  skills = [],
  statusBadge,
  tone = 'pink'
}: GameTileProps) {
  // SVG icon mapping fallback based on dimension/id
  const getSkillIcon = (skill: GameTileSkill) => {
    // For now, mapping directly to the SVG sprites in PortalSprite.
    // Ensure ids map closely to the sprite ids (e.g. ti-cognition-attention, ti-mood-focus)
    const skillIdStr = String(skill?.id || '');
    const iconId = `ti-${skill.dimension}-${skillIdStr.toLowerCase().replace(/\s+/g, '-')}`;
    return iconId;
  };

  return (
    <article className={`game-card game-card--portal sp-card sp-card--interactive card--flush tone tone--${tone} min-width-0 layout-flex flow-column clip`}>
      {/* Media Area */}
      <Link href={url} className="media-open layout-block full-width padding-none border-none surface-transparent text-left" aria-label={`Play ${title}`} tabIndex={-1}>
        <div className="game-media position-relative clip">
          <div className="art-stack stack position-absolute inset-none clip">
            <img alt={`${title} game artwork`} className="art-layer art-static position-absolute layout-block opaque" src={image} />
            {animatedImage && (
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
          {/* Note: We can route to a real game_detail.html or modal later */}
          <button className="game-info" aria-label={`View game details for ${title}`}>
            <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-info"></use></svg>
          </button>
        </div>
        
        <p className="game-description text-muted font-md leading-lg">{description}</p>
        
        <span className="duration layout-inline-flex items-center gap-md text-muted font-sm weight-semibold">
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-clock"></use></svg>
          {duration}
        </span>
        
        {skills && skills.length > 0 && (
          <div className="trait-group layout-grid gap-sm items-start">
            <span className="ui-label trait-label">Skills developed</span>
            <ul className="trait-skills layout-flex wrap items-center margin-none padding-none">
              {skills.map((skill) => (
                <li key={skill.id}>
                  <button className="trait-skill" type="button" data-skill-peek={skill.name} data-dimension={skill.dimension}>
                    <svg className="sp-icon sp-icon--2xs trait-skill__icon" aria-hidden="true" viewBox="0 0 24 24">
                      <use href={`#${getSkillIcon(skill)}`}></use>
                    </svg>
                    <span className="trait-skill__name">{skill.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <Link className="play-btn button button--primary button--md full-width push-block-end" href={url}>
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-play"></use></svg>
          Play<span className="sr-only"> {title}</span>
        </Link>
      </div>
    </article>
  );
}
