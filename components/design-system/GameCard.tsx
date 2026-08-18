import React from 'react';
import { Card } from './Card';
import { Tag } from './Tag';
import { Button } from './Button';

export type GameCardVariant = 'recommended' | 'recent' | 'new';

interface GameCardProps {
  title: string;
  href: string;
  staticArt: string;
  animatedArt?: string;
  variant?: GameCardVariant;
  flag?: string; // e.g. "Top pick" or "New"
  skillOrTimeMeta?: string; // e.g. "Attention · 4–7 min" or "Today 09:14 · Score 1,240" or "Rotate and match hexagons"
  tagLabel?: string; // e.g. "Playful", "Flow 74"
  actionType?: 'play' | 'again';
  onActionClick?: (e: React.MouseEvent) => void;
  searchData?: string;
  className?: string;
}

export const GameCard: React.FC<GameCardProps> = ({
  title,
  href,
  staticArt,
  animatedArt,
  variant = 'recommended',
  flag,
  skillOrTimeMeta,
  tagLabel,
  actionType = 'play',
  onActionClick,
  searchData,
  className = '',
}) => {
  return (
    <Card
      interactive
      href={href}
      className={`play-card ${className}`}
      {...(searchData ? { 'data-search': searchData } : {})}
    >
      <span className="play-card__art">
        <img alt={`${title} artwork`} className="art-static" src={staticArt} />
        {animatedArt && <img alt="" aria-hidden="true" className="art-animated" src={animatedArt} />}
        {flag && <Tag variant="flag">{flag}</Tag>}
      </span>

      <span className="play-card__body">
        <span className="play-card__title">{title}</span>
        {skillOrTimeMeta && (
          <span className="play-card__meta">
            {skillOrTimeMeta}
          </span>
        )}

        {(tagLabel || variant !== 'new') && (
          <span className="play-card__foot">
            {tagLabel && <Tag variant="tag">{tagLabel}</Tag>}
            {actionType === 'play' && (
              <Button
                variant="primary"
                size="xs"
                icon="ti-play"
                onClick={onActionClick}
              >
                Play
              </Button>
            )}
            {actionType === 'again' && (
              <Button
                variant="secondary"
                size="xs"
                icon="ti-refresh"
                onClick={onActionClick}
              >
                Again
              </Button>
            )}
          </span>
        )}
      </span>
    </Card>
  );
};

export default GameCard;
