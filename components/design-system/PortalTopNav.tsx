import React from 'react';
import { Icon } from '@/components/ui/Icon';

interface PortalTopNavProps {
  onMenuToggle?: () => void;
  searchQuery?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit?: (e: React.FormEvent) => void;
  onThemeToggle?: () => void;
  currentTheme?: 'dark' | 'light';
  profileHref?: string;
  settingsHref?: string;
}

export const PortalTopNav: React.FC<PortalTopNavProps> = ({
  onMenuToggle,
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
  onThemeToggle,
  currentTheme = 'dark',
  profileHref = '/profile',
  settingsHref = '/profile#settings',
}) => {
  return (
    <header className="portal-topbar">
      <button
        className="icon-button portal-nav-toggle"
        type="button"
        aria-label="Open navigation"
        onClick={onMenuToggle}
      >
        <Icon name="ti-menu" size="md" />
      </button>

      <form
        className="portal-search"
        role="search"
        onSubmit={onSearchSubmit}
      >
        <Icon name="ti-search" size="sm" />
        <label className="sr-only" htmlFor="portalSearch">
          Search games and skills
        </label>
        <input
          className="full-width"
          id="portalSearch"
          name="q"
          type="search"
          placeholder="Search"
          autoComplete="off"
          value={searchQuery}
          onChange={onSearchChange}
        />
      </form>

      <div className="portal-utilities">
        <a className="icon-button" href="/design-system/home" aria-label="Home" title="Home">
          <Icon name="ti-home" size="sm" />
        </a>
        <button
          className="icon-button"
          type="button"
          onClick={onThemeToggle}
          aria-label="Toggle theme"
          title="Toggle colour mode"
        >
          <Icon name={currentTheme === 'dark' ? 'ti-sun' : 'ti-moon'} size="sm" />
        </button>
        <a className="icon-button" href={settingsHref} aria-label="Settings" title="Settings">
          <Icon name="ti-settings" size="sm" />
        </a>
        <a className="portal-profile-link" href={profileHref} title="Profile">
          <span className="portal-avatar" aria-hidden="true">
            <Icon name="ti-user" size="sm" />
          </span>
          <span className="sr-only">Profile</span>
        </a>
      </div>
    </header>
  );
};

export default PortalTopNav;
