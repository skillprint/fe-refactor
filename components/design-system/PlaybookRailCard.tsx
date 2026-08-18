import React from 'react';
import { Card } from './Card';
import { Tag } from './Tag';
import { Button } from './Button';

interface PlaybookStat {
  label: string;
  value: string | number;
}

interface PlaybookRailCardProps {
  title?: string;
  badgeLabel?: string;
  description: string;
  stats: PlaybookStat[];
  playHref: string;
  className?: string;
}

export const PlaybookRailCard: React.FC<PlaybookRailCardProps> = ({
  title = 'Current playbook',
  badgeLabel = 'Week 29',
  description,
  stats,
  playHref,
  className = '',
}) => {
  return (
    <Card className={`rail-card ${className}`}>
      <div className="rail-card__head">
        <h2 className="rail-card__title">{title}</h2>
        {badgeLabel && <Tag variant="badge" size="sm">{badgeLabel}</Tag>}
      </div>
      <p className="margin-none text-muted font-sm leading-md">{description}</p>
      
      {stats && stats.length > 0 && (
        <dl className="rail-stats">
          {stats.map((stat, idx) => (
            <div key={idx} className="rail-stat">
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <Button variant="primary" size="md" fullWidth icon="ti-play" href={playHref}>
        Play today’s game
      </Button>
    </Card>
  );
};

export default PlaybookRailCard;
