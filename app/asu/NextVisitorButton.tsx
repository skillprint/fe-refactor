'use client';

import { useState } from 'react';
import { useStationGuest } from './useStationGuest';

/**
 * Starts the station over for the next person. It asks once first, since it
 * drops the current visitor's session and can't be undone.
 */
export function NextVisitorButton({ variant = 'secondary' }: { variant?: 'primary' | 'secondary' | 'tertiary' }) {
  const { nextVisitor } = useStationGuest();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button type="button" className={`button button--${variant} button--md`} onClick={() => setConfirming(true)}>
        <svg className="sp-icon mr-2" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-refresh"></use></svg>
        Next visitor
      </button>
    );
  }

  return (
    <span className="asu-confirm layout-inline-flex items-center gap-md" role="group" aria-label="Start over for the next visitor">
      <span className="asu-confirm__text font-sm">Start over for a new visitor?</span>
      <button type="button" className="button button--tertiary button--md" onClick={() => setConfirming(false)}>Cancel</button>
      <button type="button" className="button button--primary button--md" onClick={nextVisitor}>Start over</button>
    </span>
  );
}
