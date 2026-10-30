'use client';

import React from 'react';
import Link from 'next/link';
import {
  PRIVACY_GROUPING_CATALOG,
  PrivacyDataGroupingKey,
  PrivacyGateReason,
  RelationshipStatus,
} from '@/lib/models/portal/FriendsAndPrivacy';

export interface PrivacyGateCardProps {
  groupingKey: PrivacyDataGroupingKey;
  ownerName: string;
  gateReason: PrivacyGateReason;
  relationship: RelationshipStatus;
  isOwnPreview?: boolean;
  onConnectClick?: () => void;
  compact?: boolean;
}

export default function PrivacyGateCard({
  groupingKey,
  ownerName,
  gateReason,
  relationship,
  isOwnPreview = false,
  onConnectClick,
  compact = false,
}: PrivacyGateCardProps) {
  const meta =
    PRIVACY_GROUPING_CATALOG.find((g) => g.key === groupingKey) || PRIVACY_GROUPING_CATALOG[0];

  const isFriendsOnly = gateReason === 'friends_only';
  const isCustomDenied = gateReason === 'friend_override_denied';

  const headline = isFriendsOnly
    ? `${meta.label} — Friends Only`
    : `${meta.label} — Private`;

  const description = isOwnPreview
    ? isFriendsOnly
      ? `In this preview mode, ${meta.label} is hidden because your setting requires a Friend connection.`
      : isCustomDenied
        ? `In this preview mode, ${meta.label} is hidden by your Per-Friend Custom Override for this friend.`
        : `In this preview mode, ${meta.label} is hidden because you set it to Only Me.`
    : isFriendsOnly
      ? `${ownerName} shares ${meta.label.toLowerCase()} with connected Skillprint friends. Connect with ${ownerName} to unlock this section.`
      : isCustomDenied
        ? `${ownerName} has restricted access to ${meta.label.toLowerCase()} with a custom friend privacy setting.`
        : `${ownerName} keeps their ${meta.label.toLowerCase()} private (Only Me).`;

  return (
    <section
      className="pp-section"
      data-privacy-gate={groupingKey}
      data-gate-reason={gateReason}
      style={{ marginTop: compact ? '0' : undefined }}
    >
      <div
        className="sp-card"
        style={{
          padding: compact ? '16px 20px' : '24px 28px',
          border: '1px dashed var(--surface-border-hover, rgba(255,255,255,0.16))',
          background: 'rgba(15, 23, 42, 0.38)',
          display: 'grid',
          gap: '14px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', minWidth: 0, flex: '1 1 280px' }}>
            <span
              className="sp-icon-frame sp-icon-frame--md sp-icon-frame--round no-grow"
              aria-hidden="true"
              style={{
                borderColor: `${meta.accentColor}44`,
                color: meta.accentColor,
              }}
            >
              <svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24">
                <use href={isFriendsOnly ? '#ti-users' : '#ti-lock'}></use>
              </svg>
            </span>
            <div style={{ display: 'grid', gap: '4px', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <strong className="font-md weight-semibold">{headline}</strong>
                <span
                  className="ui-badge ui-badge--sm"
                  style={{
                    background: isFriendsOnly ? 'rgba(56, 189, 248, 0.14)' : 'rgba(167, 139, 250, 0.14)',
                    color: isFriendsOnly ? '#38bdf8' : '#a78bfa',
                    border: `1px solid ${isFriendsOnly ? 'rgba(56, 189, 248, 0.35)' : 'rgba(167, 139, 250, 0.35)'}`,
                  }}
                >
                  {isFriendsOnly ? 'Friends Only' : isCustomDenied ? 'Custom Override' : 'Only Me'}
                </span>
              </div>
              <p className="margin-none text-muted font-sm leading-md">{description}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {isOwnPreview ? (
              <Link href="/settings#privacy" className="button button--secondary button--sm">
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                  <use href="#ti-shield"></use>
                </svg>
                Edit Privacy Settings
              </Link>
            ) : isFriendsOnly && relationship === 'none' && onConnectClick ? (
              <button
                type="button"
                className="button button--primary button--sm"
                onClick={onConnectClick}
              >
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                  <use href="#ti-plus"></use>
                </svg>
                Add Friend to Unlock
              </button>
            ) : isFriendsOnly && relationship === 'outgoing_request' ? (
              <span className="ui-badge ui-badge--pill">Friend Request Pending</span>
            ) : null}
          </div>
        </div>

        {!compact && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              paddingTop: '10px',
              borderTop: '1px solid var(--surface-border, rgba(255,255,255,0.08))',
            }}
          >
            <span className="font-xs text-muted">Protected data in this group:</span>
            {meta.includedItems.map((item) => (
              <span
                key={item}
                className="font-xs text-muted"
                style={{
                  padding: '2px 10px',
                  borderRadius: '9999px',
                  background: 'var(--surface-box, rgba(255,255,255,0.04))',
                  border: '1px solid var(--surface-border, rgba(255,255,255,0.08))',
                }}
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
