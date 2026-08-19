import React, { useState } from 'react';
import { Icon } from '@/components/ui/Icon';

interface NavLinkItem {
  label: string;
  href: string;
  icon: 'ti-home' | 'ti-gamepad' | 'ti-chart' | 'ti-user' | 'ti-settings';
  isActive?: boolean;
}

interface PortalSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activePath?: string;
  className?: string;
}

const NAV_LINKS: NavLinkItem[] = [
  { label: 'Home', href: '/design-system/home', icon: 'ti-home' },
  { label: 'Games', href: '/games', icon: 'ti-gamepad' },
  { label: 'Skills', href: '/design-system/skills', icon: 'ti-chart' },
];

export const PortalSidebar: React.FC<PortalSidebarProps> = ({
  isOpen = false,
  onClose,
  activePath = '/design-system/home',
  className = '',
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <>
      <aside
        className={`portal-sidebar sp-side-nav ${isOpen ? 'is-active' : ''} ${className}`}
        id="portalNav"
        aria-label="Games Portal"
      >
        <a className="portal-brand flex items-center gap-2" href="/design-system/home">
          <img
            className="brand-logo brand-logo--dark h-6"
            src="/assets/design-system/logos/skillprint-logo-customer-dark.svg"
            alt="Skillprint"
          />
          <img
            className="brand-logo brand-logo--light h-6"
            src="/assets/design-system/logos/skillprint-logo-customer-light.svg"
            alt="Skillprint"
          />
          <span className="portal-brand__product">Games Portal</span>
        </a>

        <button
          className="portal-sidebar__close button button--tertiary button--icon-only button--sm"
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
        >
          <Icon name="ti-close" size="sm" />
        </button>

        <nav className="portal-sidebar__scroll sp-side-nav__scroll" aria-label="Portal sections">
          <div className="sp-side-nav__group">
            {NAV_LINKS.map(link => {
              const active = activePath === link.href;
              return (
                <a
                  key={link.label}
                  className={`sp-side-nav__link ${active ? 'is-active' : ''}`}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon name={link.icon} size="sm" />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </div>
        </nav>

        <div className="portal-sidebar__foot">
          <div className="sp-dropdown sp-dropdown--compact screen-switch">
            <button
              className="button button--tertiary button--sm full-width sp-dropdown__trigger screen-switch__trigger"
              type="button"
              aria-expanded={dropdownOpen}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="sp-dropdown__value">
                <span className="sp-dropdown__copy">
                  <strong>Portal Screens</strong>
                </span>
              </span>
              <Icon name="ti-chevron-down" size="xs" className="sp-dropdown__chevron" />
            </button>

            {dropdownOpen && (
              <div className="sp-dropdown__menu screen-switch__menu p-2 bg-slate-900 border border-slate-700 rounded-lg space-y-1 mt-1">
                <a className="block px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded font-medium" href="/design-system/home">
                  Home (Design System)
                </a>
                <a className="block px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 rounded" href="/design-system/tokens">
                  Tokens Showcase
                </a>
                <a className="block px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 rounded" href="/games">
                  Games Library
                </a>
              </div>
            )}
          </div>
        </div>
      </aside>

      {isOpen && (
        <button
          className="portal-scrim fixed inset-0 bg-black/60 z-40"
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default PortalSidebar;
