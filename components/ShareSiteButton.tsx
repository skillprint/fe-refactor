'use client';

import React, { useState } from 'react';
import ShareSheet from './ShareSheet';
import { siteSharePayload } from '@/lib/share';
import { siteUrl } from '@/lib/siteUrl';

/** The sidebar's "Share" entry: opens the share sheet for the portal itself. */
export default function ShareSiteButton({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" title="Share Skillprint" className={className} onClick={() => setOpen(true)} data-share-site>
        <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-share"></use></svg>
        <span className="sp-side-nav__label">Share</span>
      </button>
      {open && (
        <ShareSheet open={open} onClose={() => setOpen(false)} heading="Share Skillprint" payload={siteSharePayload(siteUrl())} />
      )}
    </>
  );
}
