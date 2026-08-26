import React from 'react';

export function PortalPageTitle({ children, id }: { children: React.ReactNode, id?: string }) {
  return <h1 id={id}>{children}</h1>;
}

export function PortalSectionTitle({ children, id }: { children: React.ReactNode, id?: string }) {
  return <h2 className="portal-section__title" id={id}>{children}</h2>;
}

export function PortalSectionHint({ children }: { children: React.ReactNode }) {
  return <p className="portal-section__hint">{children}</p>;
}
