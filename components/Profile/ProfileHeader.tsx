'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PortalHead from '@/components/PortalHead';
import ShareSheet from '@/components/ShareSheet';
import { snapshotSharePayload } from '@/lib/share';
import { siteUrl } from '@/lib/siteUrl';
import type { SnapshotEntry } from '@/lib/skillprintSnapshot';

export interface ProfileHeaderProps {
  /** The player's top scores; Share shows once at least one skill is measured. */
  snapshot?: SnapshotEntry[];
}

export default function ProfileHeader({ snapshot = [] }: ProfileHeaderProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const canShare = snapshot.length > 0;

  const actions = (
    <>
      {canShare && (
        <button type="button" className="button button--secondary button--md" onClick={() => setShareOpen(true)} data-pp-share="">
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
            <use href="#ti-share"></use>
          </svg>
          Share
        </button>
      )}
      <Link href="/skills" className="button button--secondary button--md">
        Skills
      </Link>
      <Link href="/games" className="button button--primary button--md">
        <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
          <use href="#ti-play"></use>
        </svg>
        Play a game
      </Link>
    </>
  );

  return (
    <>
      <PortalHead
        eyebrow="Profile"
        title="Your Skillprint"
        titleId="ppPageTitle"
        description="Your Skillprint: 28 skills across mood, cognition and personality, scored from every session you finish."
        actions={actions}
      />
      {canShare && shareOpen && (
        <ShareSheet
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          heading="Share your Skillprint"
          payload={snapshotSharePayload(siteUrl(), snapshot)}
        />
      )}
    </>
  );
}
