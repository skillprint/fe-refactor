import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export interface PortalLayoutProps {
  children: React.ReactNode;
  pageClass?: string;
  header?: React.ReactNode;
  rail?: React.ReactNode;
}

export default function PortalLayout({ children, pageClass, header, rail }: PortalLayoutProps) {
  return (
    <div className={`page--portal portal-app ${pageClass || ''}`.trim()} data-portal-shell>
      <Sidebar />
      <button className="portal-scrim" type="button" aria-label="Close navigation" data-portal-nav-close></button>
      <div className="portal-main">
        <TopBar />
        <main className="portal-content" id="top">
          {header}
          {rail ? (
            <div className="portal-layout">
              <div className="portal-layout__main">
                {children}
              </div>
              <aside className="portal-rail" aria-label="Summary">
                {rail}
              </aside>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
