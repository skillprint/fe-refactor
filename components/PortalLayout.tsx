'use client';

import React, { Suspense } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import TimezoneSync from '../app/components/TimezoneSync';
import NotificationsSync from './NotificationsSync';

export interface PortalLayoutProps {
  children: React.ReactNode;
  pageClass?: string;
  header?: React.ReactNode;
  rail?: React.ReactNode;
}

export default function PortalLayout({ children, pageClass, header, rail }: PortalLayoutProps) {
  return (
    <div className={`portal-app ${pageClass || ''}`.trim()} data-portal-shell>
      <TimezoneSync />
      {/* Its data hooks read useSearchParams (via useUserSession), which
          fails the prerender of every static page that uses this layout
          unless it sits under a Suspense boundary. */}
      <Suspense fallback={null}>
        <NotificationsSync />
      </Suspense>
      <Sidebar />
      <button onClick={() => document.body.classList.remove('nav-open')} className="portal-scrim" type="button" aria-label="Close navigation" data-portal-nav-close></button>
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
