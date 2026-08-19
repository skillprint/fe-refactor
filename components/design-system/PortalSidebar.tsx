import React, { useState } from 'react';
import Link from 'next/link';

interface NavLinkItem {
  label: string;
  href: string;
  iconId: string;
  subnav?: { label: string; href: string; iconId: string; dimension: string }[];
}

interface PortalSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activePath?: string;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  className?: string;
}

const NAV_LINKS: NavLinkItem[] = [
  { label: 'Home', href: '/design-system/home', iconId: 'ti-home' },
  { label: 'Games', href: '/design-system/games', iconId: 'ti-gamepad' },
  {
    label: 'Skills',
    href: '/design-system/skills',
    iconId: 'ti-chart',
    subnav: [
      { label: 'Mood', href: '/design-system/skills#mood', iconId: 'ti-mood-focus', dimension: 'mood' },
      { label: 'Cognition', href: '/design-system/skills#cognition', iconId: 'ti-cognition-pattern-matching', dimension: 'cognition' },
      { label: 'Personality', href: '/design-system/skills#personality', iconId: 'ti-personality-openness', dimension: 'personality' },
    ],
  },
];

export const PortalSidebar: React.FC<PortalSidebarProps> = ({
  isOpen = false,
  onClose,
  activePath = '/design-system/skills',
  theme = 'dark',
  onToggleTheme,
  className = '',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [screenSwitchOpen, setScreenSwitchOpen] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <>
      <aside
        className={`portal-sidebar sp-side-nav ${isCollapsed ? 'is-collapsed' : ''} ${isOpen ? 'is-active nav-open' : ''} ${className}`}
        id="portalNav"
        aria-label="Games Portal"
        data-portal-nav=""
      >
        <div className="portal-sidebar__head">
          <Link className="portal-brand flex items-center gap-2" href="/design-system/home">
            <img
              className="brand-logo brand-logo--dark"
              src="/assets/design-system/logos/skillprint-logo-customer-dark.svg"
              alt="Skillprint"
              width="132"
            />
            <img
              className="brand-logo brand-logo--light"
              src="/assets/design-system/logos/skillprint-logo-customer-light.svg"
              alt="Skillprint"
              width="132"
            />
            <img
              className="portal-brand__mark"
              src="/assets/design-system/icons/skillprint-favicon-customer.svg"
              alt=""
              aria-hidden="true"
              width="32"
              height="32"
              style={{ display: isCollapsed ? 'block' : 'none' }}
            />
            {!isCollapsed && <span className="portal-brand__product">Games Portal</span>}
          </Link>

          <button
            className="portal-sidebar__toggle icon-button button button--tertiary button--icon-only button--sm"
            type="button"
            aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            onClick={toggleCollapse}
          >
            <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
              <use href={`/assets/design-system/icons/sprite.svg#${isCollapsed ? 'ti-chevron-right' : 'ti-chevron-left'}`}></use>
            </svg>
          </button>
        </div>

        <button
          className="portal-sidebar__close button button--tertiary button--icon-only button--sm"
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
        >
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
            <use href="/assets/design-system/icons/sprite.svg#ti-close"></use>
          </svg>
        </button>

        <nav className="portal-sidebar__scroll sp-side-nav__scroll" aria-label="Portal sections">
          <div className="sp-side-nav__group">
            {NAV_LINKS.map(link => {
              const active = activePath === link.href || activePath.startsWith(link.href);
              return (
                <React.Fragment key={link.label}>
                  <Link
                    className={`sp-side-nav__link ${active ? 'is-active' : ''}`}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    title={link.label}
                  >
                    <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                      <use href={`/assets/design-system/icons/sprite.svg#${link.iconId}`}></use>
                    </svg>
                    <span className="sp-side-nav__label">{link.label}</span>
                  </Link>

                  {/* Subnav rendered under active Skills link */}
                  {active && link.subnav && !isCollapsed && (
                    <div className="portal-subnav" data-skills-subnav="">
                      {link.subnav.map(sub => (
                        <a
                          key={sub.label}
                          className="portal-subnav__link"
                          href={sub.href}
                          data-dimension={sub.dimension}
                          title={sub.label}
                        >
                          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                            <use href={`/assets/design-system/icons/sprite.svg#${sub.iconId}`}></use>
                          </svg>
                          <span className="portal-subnav__label">{sub.label}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </nav>

        {/* COMBINED NAVIGATION SIDEBAR FOOTER (Profile, Settings, Theme, Screen Switcher) */}
        <div className="portal-sidebar__foot">
          <div className="sp-side-nav__group portal-sidebar__utilities">
            <Link className="sp-side-nav__link" href="/profile" title="Profile">
              <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                <use href="/assets/design-system/icons/sprite.svg#ti-user"></use>
              </svg>
              <span className="sp-side-nav__label">Profile</span>
            </Link>

            <Link className="sp-side-nav__link" href="/profile#settings" title="Settings">
              <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                <use href="/assets/design-system/icons/sprite.svg#ti-settings"></use>
              </svg>
              <span className="sp-side-nav__label">Settings</span>
            </Link>

            <button
              className="sp-side-nav__link"
              type="button"
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                <use href={`/assets/design-system/icons/sprite.svg#${theme === 'dark' ? 'ti-sun' : 'ti-moon'}`}></use>
              </svg>
              <span className="sp-side-nav__label">Theme</span>
            </button>
          </div>

          <div className="sp-dropdown sp-dropdown--compact screen-switch">
            <button
              className="button button--tertiary button--sm full-width sp-dropdown__trigger screen-switch__trigger"
              type="button"
              aria-expanded={screenSwitchOpen}
              onClick={() => setScreenSwitchOpen(!screenSwitchOpen)}
            >
              <span className="sp-dropdown__value">
                <span className="sp-dropdown__copy">
                  <strong>Portal screens</strong>
                </span>
              </span>
              <svg className="sp-icon sp-dropdown__chevron" aria-hidden="true" viewBox="0 0 24 24">
                <use href="/assets/design-system/icons/sprite.svg#ti-chevron-down"></use>
              </svg>
            </button>

            {screenSwitchOpen && (
              <div className="sp-dropdown__menu screen-switch__menu p-2 bg-slate-900 border border-slate-700 rounded-lg space-y-1 mt-1">
                <div className="sp-dropdown__header text-xs text-slate-400 font-semibold px-2 py-1">Portal screens</div>
                <Link className="button button--tertiary button--sm sp-dropdown__item flex items-center justify-between" href="/design-system/home">
                  <span>Home</span>
                </Link>
                <Link className="button button--tertiary button--sm sp-dropdown__item flex items-center justify-between" href="/design-system/games">
                  <span>Games</span>
                </Link>
                <Link className="button button--tertiary button--sm sp-dropdown__item flex items-center justify-between is-active" href="/design-system/skills">
                  <span>Skills</span>
                  <span className="sp-dropdown__selected-mark">✓</span>
                </Link>
                <Link className="button button--tertiary button--sm sp-dropdown__item flex items-center justify-between" href="/profile">
                  <span>Profile</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      {isOpen && (
        <button
          className="portal-scrim"
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default PortalSidebar;
