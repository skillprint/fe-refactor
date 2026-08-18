import React from 'react';
import { Card } from './Card';
import { Icon } from '@/components/ui/Icon';

interface ActivityItem {
  gameTitle: string;
  timestamp: string;
  thumbSrc: string;
  href?: string;
}

interface RecentActivityCardProps {
  title?: string;
  profileHref?: string;
  activities: ActivityItem[];
  className?: string;
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  title = 'Recent activity',
  profileHref = '/profile',
  activities,
  className = '',
}) => {
  return (
    <Card className={`rail-card ${className}`}>
      <div className="rail-card__head">
        <span className="rail-card__label font-bold text-sm">{title}</span>
        {profileHref && (
          <a className="portal-section__link font-sm flex items-center gap-1" href={profileHref}>
            <span>Profile</span>
            <Icon name="ti-chevron-right" size="xs" />
          </a>
        )}
      </div>
      <ul className="rail-list">
        {activities.map((item, idx) => (
          <li key={idx}>
            <img className="rail-thumb" alt={item.gameTitle} src={item.thumbSrc} />
            <span className="rail-list__name font-ui font-medium">{item.gameTitle}</span>
            <span className="rail-list__value font-mono text-muted">{item.timestamp}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default RecentActivityCard;
