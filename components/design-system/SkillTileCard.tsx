import React from 'react';
import { Card } from './Card';
import { Icon, IconName } from '@/components/ui/Icon';

interface SkillTileCardProps {
  title: string;
  gameCount: number | string;
  iconName: IconName;
  href: string;
  searchData?: string;
  className?: string;
}

export const SkillTileCard: React.FC<SkillTileCardProps> = ({
  title,
  gameCount,
  iconName,
  href,
  searchData,
  className = '',
}) => {
  const gameCountLabel = typeof gameCount === 'number' ? `${gameCount} game${gameCount === 1 ? '' : 's'}` : gameCount;

  return (
    <Card
      interactive
      href={href}
      className={`layout-flex items-center gap-lg ${className}`}
      {...(searchData ? { 'data-search': searchData } : {})}
    >
      <span className="sp-icon-frame sp-icon-frame--md no-grow" aria-hidden="true">
        <Icon name={iconName} size="sm" className="sp-icon--brand" />
      </span>
      <span className="min-width-0 layout-grid gap-xs">
        <span className="weight-semibold font-ui text-sm">{title}</span>
        <span className="text-muted font-sm leading-sm">{gameCountLabel}</span>
      </span>
    </Card>
  );
};

export default SkillTileCard;
