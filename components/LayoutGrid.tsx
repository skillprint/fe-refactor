import React from 'react';

export function PortalPageLayout({ children }: { children: React.ReactNode }) {
  return <div className="portal-layout">{children}</div>;
}

export function PortalPageMain({ children }: { children: React.ReactNode }) {
  return <div className="portal-layout__main">{children}</div>;
}

export function PortalPageRail({ children, ariaLabelledBy, className }: { children: React.ReactNode, ariaLabelledBy?: string, className?: string }) {
  return (
    <aside className={`portal-rail ${className || ''}`} aria-labelledby={ariaLabelledBy}>
      {children}
    </aside>
  );
}

export function PortalSection({ children, ariaLabelledBy, className }: { children: React.ReactNode, ariaLabelledBy?: string, className?: string }) {
  return (
    <section className={`portal-section ${className || ''}`} aria-labelledby={ariaLabelledBy}>
      {children}
    </section>
  );
}
