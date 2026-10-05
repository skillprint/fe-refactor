import React from 'react';

export interface PortalHeadProps {
  eyebrow?: string;
  title: string;
  titleId?: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export default function PortalHead({
  eyebrow,
  title,
  titleId,
  description,
  actions,
  className = ''
}: PortalHeadProps) {
  return (
    <div className={`portal-head ${className}`.trim()}>
      {eyebrow && <div className="portal-eyebrow">{eyebrow}</div>}
      <div className="portal-head__row">
        <h1 id={titleId}>{title}</h1>
        {actions && (
          <div className="layout-flex gap-md">
            {actions}
          </div>
        )}
      </div>
      {description && <p>{description}</p>}
    </div>
  );
}
