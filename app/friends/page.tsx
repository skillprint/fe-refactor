'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PortalLayout from '@/components/PortalLayout';
import PortalHead from '@/components/PortalHead';
import { PortalSection } from '@/components/LayoutGrid';
import MockDataTag from '@/components/MockDataTag';
import PrivacySettingsMatrix from '@/components/Friends/PrivacySettingsMatrix';
import FriendComparisonPanel from '@/components/Friends/FriendComparisonPanel';
import { useFriendsAndPrivacy, useFriendsFeatureFlag } from '@/lib/models/portal/useFriendsAndPrivacy';
import { PRIVACY_GROUPING_CATALOG } from '@/lib/models/portal/FriendsAndPrivacy';

type FriendsTab = 'friends' | 'requests' | 'compare' | 'privacy';

function FriendsPageContent() {
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get('tab') as FriendsTab | null;
  const inviteParam = searchParams.get('invite') || '';

  const [activeTab, setActiveTab] = useState<FriendsTab>(
    initialTabParam && ['friends', 'requests', 'compare', 'privacy'].includes(initialTabParam)
      ? initialTabParam
      : inviteParam
        ? 'requests'
        : 'friends'
  );
  const [selectedCompareFriendId, setSelectedCompareFriendId] = useState<string | null>(null);
  const [selectedOverrideFriendId, setSelectedOverrideFriendId] = useState<string | null>(null);
  const [inviteInput, setInviteInput] = useState(inviteParam);
  const [discoverQuery, setDiscoverQuery] = useState('');
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const { friendsFeatureEnabled, setFriendsFeatureEnabled } = useFriendsFeatureFlag();

  const {
    hydrated,
    friendCode,
    allowFriendRequests,
    privacyGroups,
    friendOverridesMap,
    friends,
    incomingRequests,
    outgoingRequests,
    discoverablePlayers,
    isUsingMockFallback,
    updateGroupScope,
    applyPrivacyPreset,
    setAllowFriendRequests,
    regenerateFriendCode,
    setFriendOverride,
    resetFriendOverrides,
    sendFriendRequest,
    respondToRequest,
    removeFriend,
  } = useFriendsAndPrivacy();

  useEffect(() => {
    if (inviteParam) {
      setInviteInput(inviteParam);
      setActiveTab('requests');
    }
  }, [inviteParam]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;
    const res = await sendFriendRequest(inviteInput.trim());
    setFeedback({ ok: res.ok, message: res.message });
    if (res.ok) {
      setInviteInput('');
    }
  };

  const handleQuickAddPlayer = async (codeOrId: string) => {
    const res = await sendFriendRequest(codeOrId);
    setFeedback({ ok: res.ok, message: res.message });
  };

  const filteredDiscoverable = useMemo(() => {
    const q = discoverQuery.trim().toLowerCase();
    if (!q) return discoverablePlayers;
    return discoverablePlayers.filter(
      (p) =>
        p.displayName.toLowerCase().includes(q) ||
        p.userId.toLowerCase().includes(q) ||
        p.friendCode.toLowerCase().includes(q) ||
        (p.personaRole && p.personaRole.toLowerCase().includes(q))
    );
  }, [discoverablePlayers, discoverQuery]);

  const headerActions = (
    <div className="layout-flex items-center gap-sm wrap">
      {isUsingMockFallback && <MockDataTag label="Demo Friends & Privacy" />}
      <Link href="/profile" className="button button--secondary button--md">
        My Profile
      </Link>
      <button
        type="button"
        className="button button--primary button--md"
        onClick={() => setActiveTab('requests')}
      >
        <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
          <use href="#ti-users"></use>
        </svg>
        Add Friend
      </button>
    </div>
  );

  if (!friendsFeatureEnabled) {
    return (
      <PortalLayout
        pageClass="page--portal-friends"
        header={
          <PortalHead
            eyebrow="Social & Privacy"
            title="Skillprint Friends"
            description="Connect with players and AI companions, compare cognitive & game performance side-by-side, and control who can view each part of your Skillprint."
          />
        }
      >
        <div
          className="sp-card text-center layout-grid gap-md"
          style={{ padding: '2.5rem', maxWidth: 560, margin: '1rem auto' }}
          data-friends-feature-disabled=""
        >
          <div>
            <span className="ui-badge ui-badge--sm">Feature Disabled</span>
            <h2 className="margin-none font-lg" style={{ marginTop: '0.5rem' }}>
              Skillprint Friends &amp; Profile Privacy is turned off
            </h2>
            <p className="margin-none font-sm text-muted" style={{ marginTop: '0.4rem' }}>
              This feature is hidden behind a toggle setting in{' '}
              <Link href="/settings/toggles">/settings/toggles</Link>. Enable it below to access the Friends hub, shareable friend codes, side-by-side Skillprint comparisons, and 6-grouping profile privacy controls.
            </p>
          </div>
          <div className="layout-flex items-center justify-center gap-sm wrap">
            <button
              type="button"
              className="button button--primary button--md"
              onClick={() => setFriendsFeatureEnabled(true)}
            >
              Enable Skillprint Friends
            </button>
            <Link href="/settings/toggles" className="button button--secondary button--md">
              Feature Toggles
            </Link>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout
      pageClass="page--portal-friends"
      header={
        <PortalHead
          eyebrow="Social & Privacy"
          title="Skillprint Friends"
          description="Connect with players and AI companions, compare cognitive & game performance side-by-side, and control who can view each part of your Skillprint."
          actions={headerActions}
        />
      }
    >
      {/* Top Navigation Tabs */}
      <PortalSection ariaLabelledBy="friends-nav-tabs">
        <div className="layout-flex items-center justify-between gap-md wrap">
          <div className="button-group" role="tablist" aria-label="Friends sections" id="friends-nav-tabs">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'friends'}
              className={`button-group__item ${activeTab === 'friends' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('friends')}
            >
              My Friends ({friends.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'requests'}
              className={`button-group__item ${activeTab === 'requests' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              Add &amp; Requests
              {incomingRequests.length > 0 && (
                <span
                  className="ui-badge ui-badge--sm"
                  style={{
                    marginLeft: '0.35rem',
                    background: 'var(--accent-primary, #5d6bff)',
                    color: '#fff',
                  }}
                >
                  {incomingRequests.length}
                </span>
              )}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'compare'}
              className={`button-group__item ${activeTab === 'compare' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('compare')}
            >
              Compare Skillprints
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'privacy'}
              className={`button-group__item ${activeTab === 'privacy' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              Privacy Controls
            </button>
          </div>

          <div className="layout-flex items-center gap-sm">
            <span className="font-xs text-muted">Your Friend Code:</span>
            <code className="font-mono font-sm weight-semibold text-strong">{friendCode}</code>
          </div>
        </div>
      </PortalSection>

      {feedback && (
        <div
          className="sp-card border-subtle radius-md layout-flex items-center justify-between gap-md"
          role="status"
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderLeft: `3px solid ${feedback.ok ? '#12b886' : '#fa5252'}`,
          }}
        >
          <span className="font-sm">{feedback.message}</span>
          <button
            type="button"
            className="button button--tertiary button--sm"
            onClick={() => setFeedback(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: MY FRIENDS */}
      {activeTab === 'friends' && (
        <PortalSection ariaLabelledBy="my-friends-heading">
          <div className="layout-grid gap-md">
            <div className="layout-flex items-center justify-between gap-md wrap">
              <div>
                <h2 className="margin-none font-lg" id="my-friends-heading">Connected Friends</h2>
                <p className="margin-none font-sm text-muted">
                  Each friend card displays only the data groupings that friend has chosen to share with you.
                </p>
              </div>
            </div>

            {!hydrated ? (
              <div className="sp-card" style={{ padding: '1.5rem' }}>
                <p className="margin-none font-sm text-muted">Loading friends...</p>
              </div>
            ) : friends.length === 0 ? (
              <div className="sp-card text-center" style={{ padding: '2rem' }}>
                <h3 className="margin-none font-md">No connected friends yet</h3>
                <p className="font-sm text-muted" style={{ marginTop: '0.35rem' }}>
                  Connect with players by Friend Code or add an AI companion from LLM Island.
                </p>
                <button
                  type="button"
                  className="button button--primary button--md"
                  onClick={() => setActiveTab('requests')}
                  style={{ marginTop: '0.75rem' }}
                >
                  Find or Invite Friends
                </button>
              </div>
            ) : (
              <div
                className="layout-grid gap-md"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))' }}
              >
                {friends.map((friend) => {
                  const initials = friend.displayName
                    .split(' ')
                    .map((p) => p[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  const myOverrideForFriend = friendOverridesMap[friend.userId];
                  const hasMyOverrides =
                    myOverrideForFriend &&
                    Object.values(myOverrideForFriend).some((v) => v && v !== 'inherit');

                  return (
                    <article
                      key={String(friend.friendshipId || friend.userId)}
                      className="sp-card layout-grid gap-md"
                      style={{ padding: '1.25rem' }}
                      data-friend-card={friend.userId}
                    >
                      {/* Friend Card Header */}
                      <div className="layout-flex items-start justify-between gap-sm">
                        <div className="layout-flex items-center gap-sm min-width-0">
                          <span
                            aria-hidden="true"
                            className="layout-grid place-center radius-round font-sm weight-semibold"
                            style={{
                              width: 42,
                              height: 42,
                              background: friend.avatarColor || '#5d6bff',
                              color: '#fff',
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </span>
                          <div className="min-width-0">
                            <div className="layout-flex items-center gap-xs wrap">
                              <Link
                                href={`/profile/${encodeURIComponent(friend.userId)}`}
                                className="font-md weight-semibold text-strong"
                                style={{ textDecoration: 'none' }}
                              >
                                {friend.displayName}
                              </Link>
                              {friend.isAiPersona && (
                                <span
                                  className="ui-badge ui-badge--sm"
                                  style={{
                                    background: 'color-mix(in srgb, #15aabf 18%, transparent)',
                                    color: '#15aabf',
                                  }}
                                >
                                  AI Companion
                                </span>
                              )}
                              {hasMyOverrides && (
                                <span className="ui-badge ui-badge--sm" title="You set custom privacy overrides for this friend">
                                  Custom Privacy
                                </span>
                              )}
                            </div>
                            <span className="font-xs text-muted font-mono">{friend.friendCode}</span>
                          </div>
                        </div>
                      </div>

                      {friend.personaRole && (
                        <p className="margin-none font-xs text-muted leading-md">{friend.personaRole}</p>
                      )}

                      {friend.customGrantNote && (
                        <div
                          className="radius-sm font-xs"
                          style={{
                            padding: '0.4rem 0.65rem',
                            background: 'color-mix(in srgb, #f59f00 14%, transparent)',
                            color: '#f59f00',
                          }}
                        >
                          {friend.customGrantNote}
                        </div>
                      )}

                      {/* Privacy-Gated Snapshot Metrics */}
                      <div
                        className="layout-grid gap-sm border-subtle radius-md"
                        style={{
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          padding: '0.65rem',
                          background: 'color-mix(in srgb, var(--surface-raised, #141824) 65%, transparent)',
                        }}
                      >
                        <div>
                          <span className="font-xs text-muted" style={{ display: 'block' }}>Activity</span>
                          {friend.visibleGroups.activitySummary && friend.activitySummary ? (
                            <span className="font-sm weight-semibold">
                              {friend.activitySummary.streakDays ?? friend.activitySummary.activeDays}d ({friend.activitySummary.sessions} runs)
                            </span>
                          ) : (
                            <span className="font-xs text-muted">Private</span>
                          )}
                        </div>
                        <div>
                          <span className="font-xs text-muted" style={{ display: 'block' }}>Top Skill</span>
                          {friend.visibleGroups.cognitionPersonality && friend.topCognitionSkill ? (
                            <span className="font-sm weight-semibold">
                              {friend.topCognitionSkill.name} ({friend.topCognitionSkill.score})
                            </span>
                          ) : (
                            <span className="font-xs text-muted">Private</span>
                          )}
                        </div>
                        <div>
                          <span className="font-xs text-muted" style={{ display: 'block' }}>Top Mood</span>
                          {friend.visibleGroups.moodSignals && friend.topMood ? (
                            <span className="font-sm weight-semibold">
                              {friend.topMood.name} ({friend.topMood.score})
                            </span>
                          ) : (
                            <span className="font-xs text-muted">Private</span>
                          )}
                        </div>
                      </div>

                      {/* Shared vs Private Grouping Pills */}
                      <div>
                        <span className="font-xs text-muted" style={{ display: 'block', marginBottom: '0.35rem' }}>
                          Data shared with you:
                        </span>
                        <div className="layout-flex items-center gap-xs wrap">
                          {PRIVACY_GROUPING_CATALOG.map((meta) => {
                            const allowed = friend.visibleGroups[meta.key];
                            return (
                              <span
                                key={meta.key}
                                className="ui-badge ui-badge--sm"
                                title={
                                  allowed
                                    ? `${friend.displayName} shares ${meta.label} with you`
                                    : `${friend.displayName} keeps ${meta.label} private`
                                }
                                style={{
                                  opacity: allowed ? 1 : 0.45,
                                  background: allowed
                                    ? 'color-mix(in srgb, #12b886 15%, transparent)'
                                    : undefined,
                                  color: allowed ? '#12b886' : undefined,
                                }}
                              >
                                {allowed ? '✓ ' : '🔒 '}
                                {meta.shortLabel}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="layout-flex items-center justify-between gap-xs wrap separator-top" style={{ paddingTop: '0.65rem' }}>
                        <div className="layout-flex items-center gap-xs wrap">
                          <Link
                            href={`/profile/${encodeURIComponent(friend.userId)}`}
                            className="button button--primary button--sm"
                          >
                            View Profile
                          </Link>
                          <button
                            type="button"
                            className="button button--secondary button--sm"
                            onClick={() => {
                              setSelectedCompareFriendId(friend.userId);
                              setActiveTab('compare');
                            }}
                          >
                            Compare
                          </button>
                          <button
                            type="button"
                            className="button button--tertiary button--sm"
                            onClick={() => {
                              setSelectedOverrideFriendId(friend.userId);
                              setActiveTab('privacy');
                            }}
                            title="Configure custom privacy overrides for this friend"
                          >
                            Privacy
                          </button>
                        </div>
                        <button
                          type="button"
                          className="button button--tertiary button--sm text--danger"
                          onClick={() => removeFriend(friend.userId)}
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </PortalSection>
      )}

      {/* TAB 2: ADD & REQUESTS */}
      {activeTab === 'requests' && (
        <PortalSection ariaLabelledBy="requests-add-heading">
          <div className="layout-grid gap-lg">
            {/* Add by Friend Code or Username */}
            <div className="sp-card" style={{ padding: '1.25rem' }}>
              <h2 className="margin-none font-md" id="requests-add-heading">
                Connect by Friend Code or Display Name
              </h2>
              <p className="margin-none font-sm text-muted" style={{ marginTop: '0.25rem' }}>
                Enter a player&apos;s Skillprint Friend Code (e.g. <code className="font-mono">SP-2W5G-9J6K</code>) or display name to send a friend request.
              </p>
              <form
                onSubmit={handleSendInvite}
                className="layout-flex items-center gap-sm wrap"
                style={{ marginTop: '0.85rem' }}
              >
                <input
                  type="text"
                  className="sp-input"
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  placeholder="Enter Friend Code (SP-XXXX-XXXX) or display name..."
                  aria-label="Friend code or display name"
                  style={{
                    flex: '1 1 260px',
                    padding: '0.55rem 0.85rem',
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid var(--border-subtle, rgba(255,255,255,0.16))',
                    background: 'var(--surface-default, #0f1320)',
                    color: 'inherit',
                  }}
                />
                <button type="submit" className="button button--primary button--md">
                  Send Friend Request
                </button>
              </form>
            </div>

            {/* Incoming & Outgoing Requests */}
            <div
              className="layout-grid gap-md"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}
            >
              {/* Incoming */}
              <div className="sp-card layout-grid gap-sm" style={{ padding: '1.25rem' }}>
                <div className="layout-flex items-center justify-between gap-sm">
                  <h3 className="margin-none font-md">Incoming Requests</h3>
                  <span className="ui-badge ui-badge--sm">{incomingRequests.length}</span>
                </div>
                {incomingRequests.length === 0 ? (
                  <p className="margin-none font-sm text-muted">No pending incoming friend requests.</p>
                ) : (
                  <ul className="layout-grid gap-sm margin-none padding-none" style={{ listStyle: 'none' }}>
                    {incomingRequests.map((req) => (
                      <li
                        key={String(req.friendshipId)}
                        className="border-subtle radius-md layout-flex items-center justify-between gap-sm wrap"
                        style={{ padding: '0.75rem' }}
                      >
                        <div>
                          <div className="layout-flex items-center gap-xs">
                            <Link
                              href={`/profile/${encodeURIComponent(req.user.userId)}`}
                              className="font-sm weight-semibold text-strong"
                            >
                              {req.user.displayName}
                            </Link>
                            <code className="font-mono font-xs text-muted">{req.user.friendCode}</code>
                          </div>
                          {req.note && <p className="margin-none font-xs text-muted">{req.note}</p>}
                        </div>
                        <div className="layout-flex items-center gap-xs">
                          <button
                            type="button"
                            className="button button--primary button--sm"
                            onClick={() => respondToRequest(String(req.friendshipId), 'accept')}
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            className="button button--tertiary button--sm"
                            onClick={() => respondToRequest(String(req.friendshipId), 'decline')}
                          >
                            Decline
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Outgoing */}
              <div className="sp-card layout-grid gap-sm" style={{ padding: '1.25rem' }}>
                <div className="layout-flex items-center justify-between gap-sm">
                  <h3 className="margin-none font-md">Sent Requests</h3>
                  <span className="ui-badge ui-badge--sm">{outgoingRequests.length}</span>
                </div>
                {outgoingRequests.length === 0 ? (
                  <p className="margin-none font-sm text-muted">No outgoing requests waiting for approval.</p>
                ) : (
                  <ul className="layout-grid gap-sm margin-none padding-none" style={{ listStyle: 'none' }}>
                    {outgoingRequests.map((req) => (
                      <li
                        key={String(req.friendshipId)}
                        className="border-subtle radius-md layout-flex items-center justify-between gap-sm wrap"
                        style={{ padding: '0.75rem' }}
                      >
                        <div>
                          <div className="layout-flex items-center gap-xs">
                            <Link
                              href={`/profile/${encodeURIComponent(req.user.userId)}`}
                              className="font-sm weight-semibold text-strong"
                            >
                              {req.user.displayName}
                            </Link>
                            <code className="font-mono font-xs text-muted">{req.user.friendCode}</code>
                          </div>
                          <span className="font-xs text-muted">Awaiting response</span>
                        </div>
                        <button
                          type="button"
                          className="button button--tertiary button--sm"
                          onClick={() => respondToRequest(String(req.friendshipId), 'cancel')}
                        >
                          Cancel
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Discover Players & AI Personas */}
            <div className="sp-card layout-grid gap-md" style={{ padding: '1.25rem' }}>
              <div className="layout-flex items-center justify-between gap-md wrap">
                <div>
                  <h3 className="margin-none font-md">Discover Players &amp; LLM Island AI Companions</h3>
                  <p className="margin-none font-xs text-muted">
                    Preview public profiles or connect with community players and AI sparring partners.
                  </p>
                </div>
                <input
                  type="search"
                  value={discoverQuery}
                  onChange={(e) => setDiscoverQuery(e.target.value)}
                  placeholder="Filter directory..."
                  aria-label="Filter discoverable players"
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid var(--border-subtle, rgba(255,255,255,0.16))',
                    background: 'var(--surface-default, #0f1320)',
                    color: 'inherit',
                  }}
                />
              </div>

              {filteredDiscoverable.length === 0 ? (
                <p className="margin-none font-sm text-muted">No matching players in the directory.</p>
              ) : (
                <div
                  className="layout-grid gap-sm"
                  style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
                >
                  {filteredDiscoverable.map((player) => (
                    <div
                      key={player.userId}
                      className="border-subtle radius-md layout-flex flex-col justify-between gap-sm"
                      style={{ padding: '0.85rem' }}
                    >
                      <div>
                        <div className="layout-flex items-center justify-between gap-xs">
                          <Link
                            href={`/profile/${encodeURIComponent(player.userId)}`}
                            className="font-sm weight-semibold text-strong"
                          >
                            {player.displayName}
                          </Link>
                          {player.isAiPersona ? (
                            <span className="ui-badge ui-badge--sm">AI Companion</span>
                          ) : (
                            <code className="font-mono font-xs text-muted">{player.friendCode}</code>
                          )}
                        </div>
                        {player.personaRole && (
                          <p className="margin-none font-xs text-muted" style={{ marginTop: '0.25rem' }}>
                            {player.personaRole}
                          </p>
                        )}
                      </div>
                      <div className="layout-flex items-center justify-between gap-xs" style={{ marginTop: '0.5rem' }}>
                        <Link
                          href={`/profile/${encodeURIComponent(player.userId)}`}
                          className="button button--tertiary button--sm"
                        >
                          View Public Profile
                        </Link>
                        <button
                          type="button"
                          className="button button--secondary button--sm"
                          onClick={() => handleQuickAddPlayer(player.friendCode)}
                        >
                          {player.isAiPersona ? 'Add AI Friend' : 'Send Request'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </PortalSection>
      )}

      {/* TAB 3: COMPARE SKILLPRINTS */}
      {activeTab === 'compare' && (
        <PortalSection ariaLabelledBy="compare-skillprints-heading">
          <FriendComparisonPanel
            friends={friends}
            initialFriendId={selectedCompareFriendId}
          />
        </PortalSection>
      )}

      {/* TAB 4: PRIVACY SETTINGS MATRIX */}
      {activeTab === 'privacy' && (
        <PortalSection ariaLabelledBy="privacy-matrix-heading">
          <PrivacySettingsMatrix
            friendCode={friendCode}
            allowFriendRequests={allowFriendRequests}
            privacyGroups={privacyGroups}
            friends={friends}
            friendOverridesMap={friendOverridesMap}
            isUsingMockFallback={isUsingMockFallback}
            onUpdateGroupScope={updateGroupScope}
            onApplyPreset={applyPrivacyPreset}
            onToggleAllowRequests={setAllowFriendRequests}
            onRegenerateCode={regenerateFriendCode}
            onSetFriendOverride={setFriendOverride}
            onResetFriendOverrides={resetFriendOverrides}
            initialSelectedFriendForOverride={selectedOverrideFriendId}
          />
        </PortalSection>
      )}
    </PortalLayout>
  );
}

export default function FriendsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem' }}>Loading Skillprint Friends...</div>}>
      <FriendsPageContent />
    </Suspense>
  );
}
