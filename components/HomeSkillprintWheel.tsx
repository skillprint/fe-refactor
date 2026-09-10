'use client';

import React, { useEffect, useRef } from 'react';
import Script from 'next/script';

const WHEEL_SCRIPT = '/skillprint-portal-redesign/js/skillprint-wheel.js';

interface HomeSkillprintWheelProps {
  /** Which print to ink. `base` is the blank dial; any other key is a person from the wheel script's catalogue. */
  person: 'base' | 'ada';
  ariaLabel: string;
  description: string;
  children?: React.ReactNode;
}

/**
 * The compact Skillprint wheel used as artwork in the home rail. The drawing
 * itself comes from the shared wheel script (the same one the profile page
 * uses), which hydrates every `[data-skillprint]` root it finds. This wrapper
 * owns the markup the script expects and asks it to draw once it has loaded.
 */
export default function HomeSkillprintWheel({ person, ariaLabel, description, children }: HomeSkillprintWheelProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const descId = `homePrintDesc-${person}`;

  useEffect(() => {
    let cancelled = false;
    const root = rootRef.current;

    const hydrate = () => {
      const w = window as any;
      if (cancelled || !root || typeof w.skillprintHydrateWheel !== 'function') return false;
      delete (root as any).sp;
      w.skillprintHydrateWheel();
      return true;
    };

    if (hydrate()) return () => { cancelled = true; };

    // The script is loaded lazily; poll until its global appears.
    const interval = window.setInterval(() => {
      if (hydrate()) window.clearInterval(interval);
    }, 100);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [person]);

  return (
    <>
      <Script src={WHEEL_SCRIPT} strategy="lazyOnload" />
      <div
        ref={rootRef}
        key={person}
        className="rail-print__figure ontology-root"
        data-skillprint={person}
        data-sp-compact=""
      >
        <div className="ontology-visual clip layout-grid place-center">
          <svg
            className="skillprint__wheel"
            data-sp-wheel=""
            viewBox="0 0 1000 1000"
            role="img"
            aria-label={ariaLabel}
            aria-describedby={descId}
          >
            <desc id={descId}>{description}</desc>
          </svg>
        </div>
        {children}
      </div>
    </>
  );
}
