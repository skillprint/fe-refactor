'use client';

import React, { useState } from 'react';
import ShareSheet from './ShareSheet';
import { ShareableBadge, badgeSharePayload } from '@/lib/share';
import { baseSlug } from '@/lib/gameSlug';
import { siteUrl } from '@/lib/siteUrl';

export interface BadgeShareButtonProps {
  badge: ShareableBadge;
  /** The game the badge was earned in, any slug form; null when unknown. */
  gameSlug?: string | null;
  gameName?: string | null;
  className?: string;
}

/**
 * "Share" on an earned badge. The link is the badge's public page, which
 * carries the badge's preview card and names the game it was earned in.
 */
export default function BadgeShareButton({ badge, gameSlug, gameName, className = '' }: BadgeShareButtonProps) {
  const [open, setOpen] = useState(false);
  const game = gameSlug ? { baseSlug: baseSlug(gameSlug), name: gameName || '' } : null;
  const payload = badgeSharePayload(siteUrl(), badge, game);
  return (
    <>
      <button
        type="button"
        className={`sp-badge__share button button--tertiary button--xs ${className}`.trim()}
        onClick={() => setOpen(true)}
        aria-label={`Share the ${badge.name} badge`}
        data-badge-share={badge.slug}
      >
        <svg className="sp-icon sp-icon--sm" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-share"></use></svg>
        Share
      </button>
      {open && (
        <ShareSheet
          open={open}
          onClose={() => setOpen(false)}
          heading={`Share your ${badge.name} badge`}
          payload={payload}
          imageFile={payload.image ? { url: payload.image, filename: `${badge.slug}-badge.png` } : undefined}
        />
      )}
    </>
  );
}
