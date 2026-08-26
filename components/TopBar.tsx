import Link from 'next/link';

export default function TopBar() {
  return (
    <header className="portal-topbar">
      <Link className="portal-topbar__brand" href="/" aria-label="Skillprint home">
        <img className="brand-logo brand-logo--dark" src="/assets/logos/skillprint-logo-customer-dark.svg" alt="Skillprint" />
        <img className="brand-logo brand-logo--light" src="/assets/logos/skillprint-logo-customer-light.svg" alt="Skillprint" />
      </Link>
      <button className="icon-button portal-nav-toggle" type="button" aria-label="Open navigation" aria-controls="portalNav" aria-expanded="false" data-portal-nav-open data-home-spot="routes-sm">
        <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-menu"></use></svg>
      </button>
    </header>
  );
}
