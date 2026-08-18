import React from 'react';

interface TagProps {
  children: React.ReactNode;
  variant?: 'tag' | 'badge' | 'flag';
  size?: 'sm' | 'md';
  tone?: 'default' | 'brand' | 'violet' | 'lime' | 'mint' | 'pink';
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'tag',
  size = 'md',
  tone = 'default',
  className = '',
}) => {
  if (variant === 'flag') {
    return <span className={`play-card__flag ${className}`}>{children}</span>;
  }

  if (variant === 'badge') {
    const sizeClass = size === 'sm' ? 'ui-badge--sm' : '';
    const toneClass = tone !== 'default' ? `ui-badge--${tone}` : '';
    return (
      <span className={`ui-badge ${sizeClass} ${toneClass} ${className}`.trim()}>
        {children}
      </span>
    );
  }

  return <span className={`ui-tag ${className}`.trim()}>{children}</span>;
};

export const Badge = Tag;
export default Tag;
