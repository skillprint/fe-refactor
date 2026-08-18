import React from 'react';
import { Icon } from '@/components/ui/Icon';

interface SectionHeaderProps {
  title: string;
  id?: string;
  hint?: string;
  linkHref?: string;
  linkText?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  id,
  hint,
  linkHref,
  linkText = 'All games',
}) => {
  return (
    <div className="portal-section__bar">
      <div>
        <h2 className="portal-section__title" id={id}>
          {title}
        </h2>
        {hint && <p className="portal-section__hint">{hint}</p>}
      </div>
      {linkHref && (
        <a className="portal-section__link flex items-center gap-1" href={linkHref}>
          <span>{linkText}</span>
          <Icon name="ti-chevron-right" size="xs" />
        </a>
      )}
    </div>
  );
};

interface PortalSectionProps {
  title: string;
  id?: string;
  hint?: string;
  linkHref?: string;
  linkText?: string;
  children: React.ReactNode;
  className?: string;
}

export const PortalSection: React.FC<PortalSectionProps> = ({
  title,
  id,
  hint,
  linkHref,
  linkText,
  children,
  className = '',
}) => {
  return (
    <section className={`portal-section ${className}`} aria-labelledby={id}>
      <SectionHeader
        title={title}
        id={id}
        hint={hint}
        linkHref={linkHref}
        linkText={linkText}
      />
      {children}
    </section>
  );
};

export const GameRail: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`game-rail ${className}`}>{children}</div>;
};

export const GameGrid: React.FC<{
  children: React.ReactNode;
  variant?: 'default' | 'pairs';
  className?: string;
}> = ({ children, variant = 'default', className = '' }) => {
  const variantClass = variant === 'pairs' ? 'game-grid--pairs' : '';
  return <div className={`game-grid ${variantClass} ${className}`}>{children}</div>;
};
