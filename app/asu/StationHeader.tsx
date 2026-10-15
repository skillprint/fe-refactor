'use client';

import Link from 'next/link';
import { REMIX_URL } from '@/lib/asuStation';
import { NextVisitorButton } from './NextVisitorButton';

/** Skillprint and the ReMix event side by side, with the host's controls. No side nav on a station. */
export function StationHeader() {
  return (
    <header className="asu-header">
      <div className="asu-header__inner layout-flex items-center justify-between gap-lg wrap">
        <Link href="/asu/" className="asu-brand layout-flex items-center gap-lg no-underline text-default" aria-label="Skillprint at ReMix the Future 2026, station home">
          <img className="brand-logo brand-logo--dark" src="/assets/logos/skillprint-logo-customer-dark.svg" alt="Skillprint" />
          <img className="brand-logo brand-logo--light" src="/assets/logos/skillprint-logo-customer-light.svg" alt="Skillprint" />
          {/* A rule, not a "×": an × in a header reads as a close button. */}
          <span aria-hidden="true" className="asu-brand__divider"></span>
          <span className="asu-brand__event layout-grid">
            <strong>ReMix the Future 2026</strong>
            <span className="font-xs">MIX Center, Mesa · Oct 15–18</span>
          </span>
        </Link>
        <div className="asu-header__actions layout-flex items-center gap-md wrap">
          <a className="button button--tertiary button--md" href={REMIX_URL} target="_blank" rel="noopener noreferrer">
            About ReMix
            <svg className="sp-icon ml-2" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-external"></use></svg>
          </a>
          <NextVisitorButton />
        </div>
      </div>
    </header>
  );
}
