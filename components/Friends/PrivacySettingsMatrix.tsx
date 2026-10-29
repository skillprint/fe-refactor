'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MockDataTag from '../MockDataTag';
import {
  DEFAULT_OVERRIDE_MAP,
  FriendCardSummary,
  PRIVACY_GROUPING_CATALOG,
  PRIVACY_GROUPING_KEYS,
  PRIVACY_PRESETS,
  PrivacyDataGroupingKey,
  PrivacyGroupScopes,
  PrivacyOverrideMap,
  PrivacyOverrideScope,
  PrivacyScope,
  evaluateEffectivePrivacy,
} from '@/lib/models/portal/FriendsAndPrivacy';

export interface PrivacySettingsMatrixProps {
  friendCode: string;
  allowFriendRequests: boolean;
  privacyGroups: PrivacyGroupScopes;
  friends: FriendCardSummary[];
  friendOverridesMap: Record<string, PrivacyOverrideMap>;
  isUsingMockFallback?: boolean;
  onUpdateGroupScope: (groupKey: PrivacyDataGroupingKey, scope: PrivacyScope) => void;
  onApplyPreset: (groups: PrivacyGroupScopes) => void;
  onToggleAllowRequests: (allow: boolean) => void;
  onRegenerateCode?: () => Promise<string>;
  onSetFriendOverride: (
    friendId: string,
    groupKey: PrivacyDataGroupingKey,
    overrideScope: PrivacyOverrideScope,
  ) => void;
  onResetFriendOverrides: (friendId: string) => void;
  initialSelectedFriendForOverride?: string | null;
}

const SCOPE_OPTIONS: Array<{ value: PrivacyScope; label: string; icon: string; badgeTone: string }> = [
  { value: 'public', label: 'Public', icon: '#ti-world', badgeTone: '#09e08f' },
  { value: 'friends', label: 'Friends Only', icon: '#ti-users', badgeTone: '#38bdf8' },
  { value: 'private', label: 'Only Me', icon: '#ti-lock', badgeTone: '#a78bfa' },
];

const OVERRIDE_OPTIONS: Array<{ value: PrivacyOverrideScope; label: string }> = [
  { value: 'inherit', label: 'Use Default' },
  { value: 'allow', label: 'Always Allow' },
  { value: 'deny', label: 'Always Hide' },
];

export default function PrivacySettingsMatrix({
  friendCode,
  allowFriendRequests,
  privacyGroups,
  friends,
  friendOverridesMap,
  isUsingMockFallback = false,
  onUpdateGroupScope,
  onApplyPreset,
  onToggleAllowRequests,
  onRegenerateCode,
  onSetFriendOverride,
  onResetFriendOverrides,
  initialSelectedFriendForOverride = null,
}: PrivacySettingsMatrixProps) {
  const [copiedType, setCopiedType] = useState<'code' | 'link' | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<string>(
    initialSelectedFriendForOverride || friends[0]?.userId || '',
  );

  const activeFriend =
    friends.find((f) => f.userId === selectedFriendId) || friends[0] || null;
  const activeFriendOverrides: PrivacyOverrideMap = activeFriend
    ? friendOverridesMap[activeFriend.userId] || { ...DEFAULT_OVERRIDE_MAP }
    : { ...DEFAULT_OVERRIDE_MAP };

  const hasCustomOverridesForActiveFriend = PRIVACY_GROUPING_KEYS.some(
    (k) => activeFriendOverrides[k] && activeFriendOverrides[k] !== 'inherit',
  );

  const activeFriendEffective = activeFriend
    ? evaluateEffectivePrivacy(privacyGroups, 'friend', activeFriendOverrides)
    : null;

  const activePresetId = PRIVACY_PRESETS.find((preset) =>
    PRIVACY_GROUPING_KEYS.every((k) => preset.groups[k] === privacyGroups[k]),
  )?.id;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(friendCode);
      setCopiedType('code');
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleCopyInviteLink = async () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://skillprint.co';
      await navigator.clipboard.writeText(`${origin}/friends?invite=${encodeURIComponent(friendCode)}`);
      setCopiedType('link');
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      // Ignore clipboard failure
    }
  };

  return (
    <div className="layout-grid gap-xl" data-privacy-matrix="">
      {/* Friend Code & Request Discovery Card */}
      <div
        className="sp-card"
        style={{
          padding: '20px 24px',
          display: 'grid',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'grid', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="ui-label">Your Skillprint Friend Code</span>
              {isUsingMockFallback && <MockDataTag label="Local + Seeded Friends" />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <code
                className="font-mono weight-semibold"
                style={{
                  fontSize: '18px',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  background: 'var(--surface-box, rgba(255,255,255,0.06))',
                  border: '1px solid var(--surface-border-hover, rgba(255,255,255,0.16))',
                  letterSpacing: '0.06em',
                }}
                data-friend-code=""
              >
                {friendCode}
              </code>
              <button
                type="button"
                className="button button--secondary button--sm"
                onClick={handleCopyCode}
              >
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                  <use href={copiedType === 'code' ? '#ti-check' : '#ti-copy'}></use>
                </svg>
                {copiedType === 'code' ? 'Copied Code!' : 'Copy Code'}
              </button>
              <button
                type="button"
                className="button button--secondary button--sm"
                onClick={handleCopyInviteLink}
              >
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                  <use href={copiedType === 'link' ? '#ti-check' : '#ti-share'}></use>
                </svg>
                {copiedType === 'link' ? 'Copied Invite Link!' : 'Copy Invite Link'}
              </button>
              {onRegenerateCode && (
                <button
                  type="button"
                  className="button button--tertiary button--sm"
                  onClick={() => onRegenerateCode()}
                  title="Generate a new friend code and invalidate the old one"
                >
                  <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                    <use href="#ti-refresh"></use>
                  </svg>
                  Reset Code
                </button>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '12px',
              background: 'var(--surface-box, rgba(255,255,255,0.03))',
              border: '1px solid var(--surface-border, rgba(255,255,255,0.08))',
            }}
          >
            <div>
              <span className="font-sm weight-semibold" id="allow-friend-requests-label">
                Allow friend requests
              </span>
              <p className="margin-none text-muted font-xs">
                Let other players find you by friend code or display name
              </p>
            </div>
            <button
              className="sp-toggle"
              type="button"
              role="switch"
              aria-checked={allowFriendRequests}
              aria-labelledby="allow-friend-requests-label"
              onClick={() => onToggleAllowRequests(!allowFriendRequests)}
            >
              <span className="sp-toggle__thumb"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Presets Bar */}
      <div className="sp-card" style={{ padding: '20px 24px', display: 'grid', gap: '14px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h3 className="margin-none font-md weight-semibold">Privacy Presets</h3>
            <p className="margin-none text-muted font-xs">
              Apply a preset across all 6 data groupings, or customize each grouping individually below.
            </p>
          </div>
          <Link href="/profile?previewAs=friends" className="button button--tertiary button--sm">
            <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
              <use href="#ti-eye"></use>
            </svg>
            Preview Profile as Friend
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '10px',
          }}
        >
          {PRIVACY_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onApplyPreset(preset.groups)}
                style={{
                  textAlign: 'left',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: isSelected
                    ? '1.5px solid var(--primary, #ff518d)'
                    : '1px solid var(--surface-border, rgba(255,255,255,0.1))',
                  background: isSelected
                    ? 'rgba(255, 81, 141, 0.1)'
                    : 'var(--surface-box, rgba(255,255,255,0.03))',
                  color: 'inherit',
                  cursor: 'pointer',
                  display: 'grid',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                  <strong className="font-sm weight-semibold">{preset.label}</strong>
                  {isSelected && (
                    <span className="ui-badge ui-badge--sm" style={{ background: 'rgba(255,81,141,0.2)', color: '#ff518d' }}>
                      Active
                    </span>
                  )}
                </div>
                <span className="text-muted font-xs leading-sm">{preset.tagline}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6 Granular Groupings Table */}
      <div className="sp-card" style={{ padding: '20px 24px', display: 'grid', gap: '16px' }}>
        <div>
          <h3 className="margin-none font-md weight-semibold">
            Data Groupings &amp; Default Visibility (6 Groups)
          </h3>
          <p className="margin-none text-muted font-xs">
            Choose who can view each part of your Skillprint profile. Mood Signals and Session History are separated from your cognitive Skillprint so you stay in full control.
          </p>
        </div>

        <div className="layout-grid gap-md">
          {PRIVACY_GROUPING_CATALOG.map((meta) => {
            const currentScope = privacyGroups[meta.key] || meta.defaultScope;
            return (
              <div
                key={meta.key}
                data-privacy-group-row={meta.key}
                style={{
                  padding: '16px 18px',
                  borderRadius: '14px',
                  background: 'var(--surface-box, rgba(255,255,255,0.03))',
                  border: '1px solid var(--surface-border, rgba(255,255,255,0.08))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: '1 1 320px', minWidth: 0 }}>
                  <span
                    className="sp-icon-frame sp-icon-frame--md sp-icon-frame--round no-grow"
                    aria-hidden="true"
                    style={{
                      color: meta.accentColor,
                      borderColor: `${meta.accentColor}40`,
                    }}
                  >
                    <svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24">
                      <use href={meta.icon}></use>
                    </svg>
                  </span>
                  <div style={{ display: 'grid', gap: '6px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <strong className="font-sm weight-semibold" id={`privacy-group-${meta.key}`}>
                        {meta.label}
                      </strong>
                      {meta.key === 'moodSignals' && (
                        <span
                          className="ui-badge ui-badge--sm"
                          style={{
                            background: 'rgba(255, 178, 27, 0.14)',
                            color: '#ffb21b',
                            border: '1px solid rgba(255, 178, 27, 0.35)',
                          }}
                        >
                          Separate from Cognition
                        </span>
                      )}
                    </div>
                    <p className="margin-none text-muted font-xs leading-md">{meta.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {meta.includedItems.map((item) => (
                        <span
                          key={item}
                          className="font-xs text-muted"
                          style={{
                            padding: '1px 8px',
                            borderRadius: '9999px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                    {meta.sensitiveNote && (
                      <span className="font-xs" style={{ color: '#a78bfa' }}>
                        🔒 {meta.sensitiveNote}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className="button-group no-grow"
                  role="group"
                  aria-labelledby={`privacy-group-${meta.key}`}
                >
                  {SCOPE_OPTIONS.map((opt) => {
                    const active = currentScope === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        aria-pressed={active}
                        className={`button-group__item ${active ? 'is-active' : ''}`}
                        onClick={() => onUpdateGroupScope(meta.key, opt.value)}
                      >
                        <svg className="sp-icon button-group__icon" aria-hidden="true" viewBox="0 0 24 24">
                          <use href={opt.icon}></use>
                        </svg>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-Friend Custom Overrides */}
      <div className="sp-card" style={{ padding: '20px 24px', display: 'grid', gap: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h3 className="margin-none font-md weight-semibold">
              Per-Friend Custom Privacy Overrides
            </h3>
            <p className="margin-none text-muted font-xs">
              Grant a trusted friend extra access (e.g. allow Mood Signals even when your default is Only Me) or hide specific sections from an individual friend.
            </p>
          </div>
          {activeFriend && hasCustomOverridesForActiveFriend && (
            <button
              type="button"
              className="button button--tertiary button--sm"
              onClick={() => onResetFriendOverrides(activeFriend.userId)}
            >
              Reset {activeFriend.displayName}&apos;s Overrides
            </button>
          )}
        </div>

        {friends.length === 0 ? (
          <p className="margin-none text-muted font-sm">
            Connect with a friend first to configure per-friend privacy overrides.
          </p>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="font-xs text-muted">Configure overrides for:</span>
              {friends.map((friend) => {
                const isSelected = activeFriend?.userId === friend.userId;
                const friendMap = friendOverridesMap[friend.userId];
                const customCount = friendMap
                  ? PRIVACY_GROUPING_KEYS.filter((k) => friendMap[k] && friendMap[k] !== 'inherit').length
                  : 0;
                return (
                  <button
                    key={friend.userId}
                    type="button"
                    aria-pressed={isSelected}
                    className={`ui-tag ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSelectedFriendId(friend.userId)}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '9999px',
                        background: friend.avatarColor || '#38bdf8',
                        display: 'inline-block',
                      }}
                    />
                    {friend.displayName}
                    {customCount > 0 && (
                      <span className="ui-badge ui-badge--sm" style={{ marginLeft: '4px' }}>
                        {customCount} custom
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {activeFriend && activeFriendEffective && (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'var(--surface-box, rgba(255,255,255,0.03))',
                  border: '1px solid var(--surface-border, rgba(255,255,255,0.08))',
                  display: 'grid',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span className="font-sm weight-semibold">
                    What <strong>{activeFriend.displayName}</strong> can view on your profile:
                  </span>
                  <Link
                    href={`/profile?previewAs=${encodeURIComponent(activeFriend.userId)}`}
                    className="button button--secondary button--xs"
                  >
                    <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                      <use href="#ti-eye"></use>
                    </svg>
                    Preview My Profile as {activeFriend.displayName}
                  </Link>
                </div>

                <div className="layout-grid gap-sm">
                  {PRIVACY_GROUPING_CATALOG.map((meta) => {
                    const overrideVal = activeFriendOverrides[meta.key] || 'inherit';
                    const isVisibleToFriend = activeFriendEffective.visibleGroups[meta.key];
                    return (
                      <div
                        key={meta.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          flexWrap: 'wrap',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          background: 'rgba(255,255,255,0.02)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <svg
                            className="sp-icon sp-icon--sm"
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            style={{ color: meta.accentColor }}
                          >
                            <use href={meta.icon}></use>
                          </svg>
                          <span className="font-sm weight-medium">{meta.label}</span>
                          <span
                            className="ui-badge ui-badge--sm"
                            style={{
                              background: isVisibleToFriend
                                ? 'rgba(9, 224, 143, 0.14)'
                                : 'rgba(255, 81, 141, 0.14)',
                              color: isVisibleToFriend ? '#09e08f' : '#ff518d',
                            }}
                          >
                            {isVisibleToFriend ? 'Visible' : 'Hidden'}
                          </span>
                        </div>

                        <div className="button-group no-grow" role="group" aria-label={`${meta.label} override for ${activeFriend.displayName}`}>
                          {OVERRIDE_OPTIONS.map((opt) => {
                            const active = overrideVal === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                aria-pressed={active}
                                className={`button-group__item ${active ? 'is-active' : ''}`}
                                onClick={() =>
                                  onSetFriendOverride(activeFriend.userId, meta.key, opt.value)
                                }
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
