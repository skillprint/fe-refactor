import React from 'react';

interface LayoutProps {
  sidebar?: React.ReactNode;
  topNav?: React.ReactNode;
  header?: React.ReactNode;
  rail?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  theme?: 'dark' | 'light';
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  sidebar,
  topNav,
  header,
  rail,
  children,
  footer,
  theme = 'dark',
  className = '',
}) => {
  return (
    <div
      className={`page page--portal page--portal-home portal-app ${theme} ${className}`}
      data-portal-shell=""
      data-skillprint-page="portal-home"
      data-theme={theme}
      data-surface={theme}
    >
      {sidebar}
      
      <div className="portal-main">
        {topNav}

        <main className="portal-content" id="top">
          {header && <div className="portal-head">{header}</div>}

          {rail ? (
            <div className="portal-layout" data-portal-search-scope="">
              <div className="portal-layout__main">{children}</div>
              <aside className="portal-rail">{rail}</aside>
            </div>
          ) : (
            <div className="portal-layout">{children}</div>
          )}
        </main>

        {footer && (
          <footer className="portal-foot">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

export default Layout;
