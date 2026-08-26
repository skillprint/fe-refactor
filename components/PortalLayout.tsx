import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="portal-app" data-portal-shell>
      <Sidebar />
      <button className="portal-scrim" type="button" aria-label="Close navigation" data-portal-nav-close></button>
      <div className="portal-main">
        <TopBar />
        <main className="portal-content" id="top">
          {children}
        </main>
      </div>
    </div>
  );
}
