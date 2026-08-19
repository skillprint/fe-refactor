import React from 'react';

interface PortalTopNavProps {
  onMenuToggle?: () => void;
  className?: string;
}

export const PortalTopNav: React.FC<PortalTopNavProps> = ({
  onMenuToggle,
  className = '',
}) => {
  return (
    <header className={`portal-topbar ${className}`}>
      <button
        className="icon-button portal-nav-toggle"
        type="button"
        aria-label="Open navigation"
        onClick={onMenuToggle}
      >
        <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
          <use href="/assets/design-system/icons/sprite.svg#ti-menu"></use>
        </svg>
      </button>

      <img
        className="portal-topbar__mark"
        src="/assets/design-system/icons/skillprint-favicon-customer.svg"
        alt="Skillprint"
        width="28"
        height="28"
      />
    </header>
  );
};

export default PortalTopNav;
