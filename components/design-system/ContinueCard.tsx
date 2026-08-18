import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

interface ContinueCardProps {
  sessionLabel: string;
  title: string;
  lede: string;
  progressPercent: number;
  continueHref: string;
  detailHref?: string;
  staticArt: string;
  animatedArt?: string;
  className?: string;
}

export const ContinueCard: React.FC<ContinueCardProps> = ({
  sessionLabel,
  title,
  lede,
  progressPercent,
  continueHref,
  detailHref,
  staticArt,
  animatedArt,
  className = '',
}) => {
  return (
    <Card className={`continue-card ${className}`}>
      <div className="continue-card__copy">
        <span className="portal-eyebrow">{sessionLabel}</span>
        <h3 className="continue-card__title">{title}</h3>
        <p className="continue-card__lede">{lede}</p>

        <div
          className="play-card__progress"
          role="img"
          aria-label={`${title}, ${progressPercent} percent complete`}
          style={{ '--meter': `${progressPercent}%` } as React.CSSProperties}
        >
          <i />
        </div>

        <div className="continue-card__actions">
          <Button variant="primary" size="md" icon="ti-play" href={continueHref}>
            Continue
          </Button>
          {detailHref && (
            <Button variant="secondary" size="md" href={detailHref}>
              Game details
            </Button>
          )}
        </div>
      </div>

      <div className="continue-card__art">
        <img alt={`${title} artwork`} className="art-static" src={staticArt} />
        {animatedArt && <img alt="" aria-hidden="true" className="art-animated" src={animatedArt} />}
      </div>
    </Card>
  );
};

export default ContinueCard;
