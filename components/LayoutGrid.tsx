import React from 'react';

export function PortalPageLayout({ children }: { children: React.ReactNode }) {
  return <div className="portal-layout">{children}</div>;
}

export function PortalPageMain({ children }: { children: React.ReactNode }) {
  return <div className="portal-layout__main">{children}</div>;
}

export function PortalPageRail({ children, ariaLabelledBy }: { children: React.ReactNode, ariaLabelledBy?: string }) {
  return (
    <aside className="portal-rail" aria-labelledby={ariaLabelledBy}>
      {children}
    </aside>
  );
}

export function PortalSection({ children, ariaLabelledBy }: { children: React.ReactNode, ariaLabelledBy?: string }) {
  return (
    <section className="portal-section" aria-labelledby={ariaLabelledBy}>
      {children}
    </section>
  );
}
