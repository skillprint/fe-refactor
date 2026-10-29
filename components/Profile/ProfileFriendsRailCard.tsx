'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MockDataTag from '../MockDataTag';
import { useFriendsAndPrivacy } from '@/lib/models/portal/useFriendsAndPrivacy';

export default function ProfileFriendsRailCard() {
  const {
    friendCode,
    friends,
    incomingRequests,
    isUsingMockFallback,
  } = useFriendsAndPrivacy();
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(friendCode);
      setCopied('code');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyInviteLink = async () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://skillprint.co';
      const inviteUrl = `${origin}/friends?invite=${encodeURIComponent(friendCode)}`;
      await navigator.clipboard.writeText(inviteUrl);
      setCopied('link');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <article className="rail-card sp-card" id="profile-friends-rail" aria-labelledby="railFriendsTitle">
      <div className="rail-card__head">
        <div className="layout-flex items-center gap-xs wrap">
          <span className="rail-card__label" id="railFriendsTitle">Friends &amp; Privacy</span>
          {isUsingMockFallback && <MockDataTag label="Demo Friends" />}
        </div>
        <div className="layout-flex items-center gap-xs">
          {incomingRequests.length > 0 && (
            <Link
              href="/friends?tab=requests"
              className="ui-badge ui-badge--sm"
              style={{
                background: 'color-mix(in srgb, var(--accent-primary, #5d6bff) 18%, transparent)',
                color: 'var(--accent-primary, #5d6bff)',
                textDecoration: 'none',
              }}
            >
              {incomingRequests.length} request{incomingRequests.length === 1 ? '' : 's'}
            </Link>
          )}
          <span className="ui-badge ui-badge--sm">{friends.length} connected</span>
        </div>
      </div>

      {/* Shareable Friend Code Box */}
      <div
        className="border-subtle radius-md"
        style={{
          padding: '0.6rem 0.75rem',
          background: 'color-mix(in srgb, var(--surface-raised, #151928) 65%, transparent)',
        }}
      >
        <div className="layout-flex items-center justify-between gap-sm">
          <div>
            <span className="font-xs text-muted" style={{ display: 'block' }}>Your Friend Code</span>
            <code className="font-mono font-sm weight-semibold text-strong">{friendCode}</code>
          </div>
          <div className="layout-flex items-center gap-xs">
            <button
              type="button"
              className="button button--secondary button--sm"
              onClick={handleCopyCode}
              title="Copy Friend Code"
            >
              {copied === 'code' ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              className="button button--tertiary button--sm"
              onClick={handleCopyInviteLink}
              title="Copy Invite Link"
            >
              {copied === 'link' ? 'Link Copied' : 'Invite'}
            </button>
          </div>
        </div>
      </div>

      {/* Connected Friends List */}
      {friends.length > 0 ? (
        <ul className="rail-list" data-pp-friends-list="">
          {friends.slice(0, 5).map((friend) => {
            const initials = friend.displayName
              .split(' ')
              .map((p) => p[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();
            const sublabel = friend.topCognitionSkill
              ? `${friend.topCognitionSkill.name} ${friend.topCognitionSkill.score}`
              : friend.activitySummary
                ? `${friend.activitySummary.streakDays ?? friend.activitySummary.activeDays}d streak`
                : 'Privacy restricted';

            return (
              <li key={String(friend.friendshipId || friend.userId)}>
                <Link className="rail-list__link" href={`/profile/${encodeURIComponent(friend.userId)}`}>
                  <span
                    aria-hidden="true"
                    className="layout-grid place-center radius-round font-xs weight-semibold"
                    style={{
                      width: 28,
                      height: 28,
                      background: friend.avatarColor || '#5d6bff',
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </span>
                  <span className="rail-list__name layout-flex items-center gap-xs min-width-0">
                    <span className="text-truncate">{friend.displayName}</span>
                    {friend.isAiPersona && (
                      <span className="ui-badge ui-badge--sm" style={{ fontSize: '0.65rem', padding: '0 0.35rem' }}>
                        AI
                      </span>
                    )}
                  </span>
                  <span className="rail-list__value font-xs text-muted">{sublabel}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="margin-none font-sm text-muted">
          No friends connected yet. Share your code or add a friend to compare Skillprints.
        </p>
      )}

      <div className="layout-grid gap-xs separator-top" style={{ paddingTop: '0.5rem' }}>
        <Link className="portal-section__link font-sm" href="/friends">
          Friends hub &amp; compare
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
            <use href="#ti-chevron-right"></use>
          </svg>
        </Link>
        <Link className="portal-section__link font-sm" href="/settings#privacy">
          Profile privacy settings
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
            <use href="#ti-chevron-right"></use>
          </svg>
        </Link>
      </div>
    </article>
  );
}
