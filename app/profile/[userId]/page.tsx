'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import PortalHead from '@/components/PortalHead';
import { PortalSection } from '@/components/LayoutGrid';
import MockDataTag from '@/components/MockDataTag';
import ProfileSkillsSection from '@/components/Profile/ProfileSkillsSection';
import ProfileSessions from '@/components/Profile/ProfileSessions';
import PrivacyGateCard from '@/components/Friends/PrivacyGateCard';
import FriendComparisonPanel from '@/components/Friends/FriendComparisonPanel';
import { useFriendProfile, useFriendsAndPrivacy, useFriendsFeatureFlag } from '@/lib/models/portal/useFriendsAndPrivacy';
import { PRIVACY_GROUPING_CATALOG } from '@/lib/models/portal/FriendsAndPrivacy';
import { getGameDetails } from '@/app/config/gameConfig';
import { DEFAULT_GAME_IMAGE, showDefaultGameImageOnError } from '@/lib/playbookUtils';
import type { SkillBaselineMap } from '@/components/Profile/ProfileSkillBreakdown';
import { useRouteParams } from '@/lib/useRouteParams';

function formatSecondsToDuration(sec: number): string {
  if (!sec || isNaN(sec)) return '0m 0s';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function FriendProfilePage() {
  const { userId } = useRouteParams('/profile/[userId]');
  const decodedId = decodeURIComponent(userId);
  const { friendsFeatureEnabled, setFriendsFeatureEnabled } = useFriendsFeatureFlag();
  const {
    profile,
    isLoading,
    isUsingMockData,
    sendFriendRequest,
    respondToRequest,
    removeFriend,
  } = useFriendProfile(decodedId);
  const { friends } = useFriendsAndPrivacy();

  const [showCompare, setShowCompare] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const friendDimensions = useMemo(() => {
    const scores: Record<string, number> = {};
    const baselines: SkillBaselineMap = {};
    if (!profile) return { scores, baselines };

    const addStats = (list?: Array<{ slug: string; score: number | null; baselineScore?: number | null; delta?: number | null }>) => {
      if (!list) return;
      list.forEach((d) => {
        if (typeof d.score === 'number') {
          scores[d.slug] = d.score;
          baselines[d.slug] = {
            baselineScore: d.baselineScore ?? null,
            delta: d.delta ?? null,
          };
        }
      });
    };

    if (profile.cognitionPersonality) {
      addStats(profile.cognitionPersonality.cognition);
      addStats(profile.cognitionPersonality.personality);
    }
    if (profile.moodSignals) {
      addStats(profile.moodSignals.mood);
    }
    return { scores, baselines };
  }, [profile]);

  if (!friendsFeatureEnabled) {
    return (
      <PortalLayout pageClass="page--portal-profile">
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
              Viewing friend and player profiles is hidden behind the Friends toggle in{' '}
              <Link href="/settings/toggles">/settings/toggles</Link>. Enable it below to view this profile.
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

  if (isLoading) {
    return (
      <PortalLayout pageClass="page--portal-profile">
        <div className="sp-card" style={{ padding: '2rem' }}>
          <p className="margin-none font-sm text-muted">Loading player Skillprint...</p>
        </div>
      </PortalLayout>
    );
  }

  if (!profile) {
    return (
      <PortalLayout pageClass="page--portal-profile">
        <div className="sp-card text-center" style={{ padding: '2.5rem' }}>
          <h2 className="margin-none font-lg">Player not found</h2>
          <p className="font-sm text-muted" style={{ marginTop: '0.5rem' }}>
            No player or AI companion matched identifier <code className="font-mono">{decodedId}</code>, or their profile is not discoverable.
          </p>
          <Link href="/friends" className="button button--primary button--md" style={{ marginTop: '1rem' }}>
            Back to Friends Hub
          </Link>
        </div>
      </PortalLayout>
    );
  }

  const { user, relationship, visibleGroups, gateReasons } = profile;
  const isFriend = relationship === 'friend';
  const isIncoming = relationship === 'incoming_request';
  const isOutgoing = relationship === 'outgoing_request';

  const handleConnect = async () => {
    const res = await sendFriendRequest(user.friendCode || user.userId);
    setActionFeedback(res.message);
  };

  const handleAccept = async () => {
    await respondToRequest(user.userId, 'accept');
    setActionFeedback(`You and ${user.displayName} are now connected!`);
  };

  const handleRemove = async () => {
    await removeFriend(user.userId);
    setActionFeedback(`Removed ${user.displayName} from your friends.`);
  };

  const headerActions = (
    <div className="layout-flex items-center gap-sm wrap">
      {isUsingMockData && <MockDataTag label="Demo Friend Profile" />}
      <Link href="/friends" className="button button--tertiary button--md">
        &larr; Friends
      </Link>
      {isFriend && (
        <>
          <button
            type="button"
            className="button button--secondary button--md"
            onClick={() => setShowCompare((prev) => !prev)}
          >
            {showCompare ? 'Hide Comparison' : 'Compare with My Skillprint'}
          </button>
          <button
            type="button"
            className="button button--tertiary button--md text--danger"
            onClick={handleRemove}
          >
            Remove Friend
          </button>
        </>
      )}
      {isIncoming && (
        <button type="button" className="button button--primary button--md" onClick={handleAccept}>
          Accept Friend Request
        </button>
      )}
      {isOutgoing && (
        <span className="ui-badge ui-badge--md">Friend Request Sent</span>
      )}
      {!isFriend && !isIncoming && !isOutgoing && (
        <button type="button" className="button button--primary button--md" onClick={handleConnect}>
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
            <use href="#ti-users"></use>
          </svg>
          Add Friend
        </button>
      )}
    </div>
  );

  const rail = (
    <>
      {/* Relationship & Privacy Access Card */}
      <article className="rail-card sp-card sp-card--raised" aria-labelledby="friendRelationshipTitle">
        <div className="rail-card__head">
          <h2 className="rail-card__title" id="friendRelationshipTitle">Connection Status</h2>
          <span
            className="ui-badge ui-badge--sm"
            style={{
              background: isFriend
                ? 'color-mix(in srgb, #12b886 18%, transparent)'
                : 'color-mix(in srgb, #f59f00 18%, transparent)',
              color: isFriend ? '#12b886' : '#f59f00',
            }}
          >
            {isFriend
              ? 'Connected Friend'
              : isIncoming
                ? 'Incoming Request'
                : isOutgoing
                  ? 'Request Pending'
                  : 'Public Visitor'}
          </span>
        </div>
        <div className="layout-flex items-center justify-between gap-sm font-xs text-muted">
          <span>Friend Code</span>
          <code className="font-mono text-strong">{user.friendCode}</code>
        </div>
        {user.isAiPersona && (
          <div className="font-xs text-muted">
            <span className="ui-badge ui-badge--sm">LLM Island AI Companion</span>
          </div>
        )}
        <div className="separator-top" style={{ paddingTop: '0.6rem' }}>
          <span className="font-xs text-muted" style={{ display: 'block', marginBottom: '0.4rem' }}>
            {user.displayName}&apos;s Privacy Grants to You:
          </span>
          <div className="layout-grid gap-xs">
            {PRIVACY_GROUPING_CATALOG.map((meta) => {
              const allowed = visibleGroups[meta.key];
              return (
                <div
                  key={meta.key}
                  className="layout-flex items-center justify-between gap-xs font-xs"
                >
                  <span>{meta.shortLabel}</span>
                  <span
                    className="weight-semibold"
                    style={{ color: allowed ? '#12b886' : 'var(--text-muted, #8b95a5)' }}
                  >
                    {allowed ? 'Shared' : 'Restricted'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </article>

      {/* Activity Summary Rail Card (Grouping 1) */}
      {visibleGroups.activitySummary && profile.activitySummary ? (
        <article className="rail-card sp-card" aria-labelledby="friendActivityRail">
          <div className="rail-card__head">
            <span className="rail-card__label" id="friendActivityRail">Activity &amp; Streak</span>
            <span className="ui-badge ui-badge--sm">
              {profile.activitySummary.streakDays ?? profile.activitySummary.activeDays}d streak
            </span>
          </div>
          <div className="layout-grid gap-sm font-sm">
            <div className="layout-flex items-center justify-between gap-sm">
              <span className="text-muted">Total sessions</span>
              <span className="weight-semibold font-mono">{profile.activitySummary.sessions}</span>
            </div>
            <div className="layout-flex items-center justify-between gap-sm">
              <span className="text-muted">Active days</span>
              <span className="weight-semibold font-mono">{profile.activitySummary.activeDays}</span>
            </div>
            <div className="layout-flex items-center justify-between gap-sm">
              <span className="text-muted">Total play time</span>
              <span className="weight-semibold font-mono">
                {Math.round((profile.activitySummary.totalPlaySeconds || 0) / 60)} mins
              </span>
            </div>
          </div>
        </article>
      ) : (
        <PrivacyGateCard
          groupingKey="activitySummary"
          ownerName={user.displayName}
          gateReason={gateReasons.activitySummary}
          relationship={relationship}
          compact={true}
          onConnectClick={!isFriend && !isOutgoing ? handleConnect : undefined}
        />
      )}
    </>
  );

  const mappedFriendSessions = (profile.sessionHistory?.results ?? []).map((s) => ({
    id: s.sessionId,
    gameSlug: s.gameSlug,
    gameName: s.gameName || getGameDetails(s.gameSlug)?.name || s.gameSlug,
    gameImage: getGameDetails(s.gameSlug)?.image || DEFAULT_GAME_IMAGE,
    date: s.playedAt,
    score: s.primaryScore ?? 0,
    skillMeasured: s.primaryMood || 'Protected',
    duration: formatSecondsToDuration(s.durationSeconds),
  }));

  return (
    <PortalLayout
      pageClass="page--portal-profile"
      header={
        <PortalHead
          eyebrow={user.isAiPersona ? 'AI Companion Profile' : 'Player Profile'}
          title={`${user.displayName}'s Skillprint`}
          description={
            user.bio ||
            user.personaRole ||
            `Viewing ${user.displayName}'s Skillprint profile with their active privacy settings applied.`
          }
          actions={headerActions}
        />
      }
      rail={rail}
    >
      {actionFeedback && (
        <div
          className="sp-card border-subtle radius-md layout-flex items-center justify-between gap-md"
          style={{ padding: '0.75rem 1rem', marginBottom: '1rem' }}
        >
          <span className="font-sm">{actionFeedback}</span>
          <button
            type="button"
            className="button button--tertiary button--sm"
            onClick={() => setActionFeedback(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Optional Side-by-Side Comparison Panel */}
      {showCompare && isFriend && (
        <PortalSection ariaLabelledBy="inline-friend-compare">
          <FriendComparisonPanel
            friends={friends}
            initialFriendId={user.userId}
          />
        </PortalSection>
      )}

      {/* GROUPINGS 2 & 3: COGNITION/PERSONALITY & MOOD SIGNALS */}
      <PortalSection ariaLabelledBy="friend-skills-section">
        {visibleGroups.cognitionPersonality || visibleGroups.moodSignals ? (
          <div className="layout-grid gap-md">
            <ProfileSkillsSection
              scores={friendDimensions.scores}
              baselines={friendDimensions.baselines}
              who={`${user.displayName}'s skills`}
            />
            {!visibleGroups.moodSignals && (
              <PrivacyGateCard
                groupingKey="moodSignals"
                ownerName={user.displayName}
                gateReason={gateReasons.moodSignals}
                relationship={relationship}
                compact={true}
                onConnectClick={!isFriend && !isOutgoing ? handleConnect : undefined}
              />
            )}
            {!visibleGroups.cognitionPersonality && (
              <PrivacyGateCard
                groupingKey="cognitionPersonality"
                ownerName={user.displayName}
                gateReason={gateReasons.cognitionPersonality}
                relationship={relationship}
                compact={true}
                onConnectClick={!isFriend && !isOutgoing ? handleConnect : undefined}
              />
            )}
          </div>
        ) : (
          <div className="layout-grid gap-md">
            <PrivacyGateCard
              groupingKey="cognitionPersonality"
              ownerName={user.displayName}
              gateReason={gateReasons.cognitionPersonality}
              relationship={relationship}
              onConnectClick={!isFriend && !isOutgoing ? handleConnect : undefined}
            />
            <PrivacyGateCard
              groupingKey="moodSignals"
              ownerName={user.displayName}
              gateReason={gateReasons.moodSignals}
              relationship={relationship}
              compact={true}
              onConnectClick={!isFriend && !isOutgoing ? handleConnect : undefined}
            />
          </div>
        )}
      </PortalSection>

      {/* GROUPING 4: PER-GAME STATS & HIGH SCORES */}
      <PortalSection ariaLabelledBy="friend-game-stats">
        {visibleGroups.gameStats && profile.gameStats ? (
          <div className="sp-card layout-grid gap-md" style={{ padding: '1.25rem' }}>
            <div>
              <h2 className="margin-none font-lg" id="friend-game-stats">
                Per-Game Performance &amp; High Scores
              </h2>
              <p className="margin-none font-sm text-muted">
                {user.displayName}&apos;s top games and personal bests.
              </p>
            </div>
            <div
              className="layout-grid gap-sm"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
            >
              {profile.gameStats.games.map((g) => {
                const details = getGameDetails(g.gameSlug);
                return (
                  <Link
                    key={g.gameSlug}
                    href={`/game/${encodeURIComponent(g.gameSlug)}`}
                    className="border-subtle radius-md layout-flex items-center gap-sm"
                    style={{
                      padding: '0.75rem',
                      textDecoration: 'none',
                      color: 'inherit',
                      background: 'color-mix(in srgb, var(--surface-raised, #141824) 60%, transparent)',
                    }}
                  >
                    <img
                      src={details?.image || DEFAULT_GAME_IMAGE}
                      alt=""
                      onError={showDefaultGameImageOnError}
                      style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                    />
                    <div className="min-width-0" style={{ flex: 1 }}>
                      <div className="layout-flex items-center justify-between gap-xs">
                        <span className="font-sm weight-semibold text-strong text-truncate">
                          {g.gameName}
                        </span>
                      </div>
                      <div className="layout-flex items-center justify-between gap-xs font-xs text-muted" style={{ marginTop: '0.2rem' }}>
                        <span>Best: <strong className="font-mono text-strong">{(g.bestScore ?? 0).toLocaleString()}</strong></span>
                        <span>{g.sessionsPlayed} runs</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <PrivacyGateCard
            groupingKey="gameStats"
            ownerName={user.displayName}
            gateReason={gateReasons.gameStats}
            relationship={relationship}
            onConnectClick={!isFriend && !isOutgoing ? handleConnect : undefined}
          />
        )}
      </PortalSection>

      {/* GROUPING 6: BADGES, GOALS & SHARED LESSONS */}
      <PortalSection ariaLabelledBy="friend-badges-goals">
        {visibleGroups.badgesGoalsLessons && profile.badgesGoalsLessons ? (
          <div className="sp-card layout-grid gap-md" style={{ padding: '1.25rem' }}>
            <div>
              <h2 className="margin-none font-lg" id="friend-badges-goals">
                Badges, Target Goals &amp; Shared Lessons
              </h2>
              <p className="margin-none font-sm text-muted">
                {profile.badgesGoalsLessons.totalUnlocked} of {profile.badgesGoalsLessons.totalBadges} badges unlocked ({profile.badgesGoalsLessons.totalPoints} pts) &bull; shared by {user.displayName}.
              </p>
            </div>

            <div
              className="layout-grid gap-md"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
            >
              {/* Goals */}
              <div className="border-subtle radius-md" style={{ padding: '0.85rem' }}>
                <h3 className="margin-none font-sm weight-semibold">Target Skill &amp; Mood Goals</h3>
                <div className="layout-flex items-center gap-xs wrap" style={{ marginTop: '0.5rem' }}>
                  {(profile.badgesGoalsLessons.goalSkills || []).map((skill) => (
                    <span key={skill} className="ui-badge ui-badge--sm">
                      Skill: {skill}
                    </span>
                  ))}
                  {(profile.badgesGoalsLessons.goalMoods || []).map((mood) => (
                    <span key={mood} className="ui-badge ui-badge--sm">
                      Mood: {mood}
                    </span>
                  ))}
                </div>
              </div>

              {/* Badges */}
              <div className="border-subtle radius-md" style={{ padding: '0.85rem' }}>
                <h3 className="margin-none font-sm weight-semibold">Earned Badges</h3>
                <div className="layout-grid gap-xs" style={{ marginTop: '0.5rem' }}>
                  {profile.badgesGoalsLessons.badges.map((badge) => (
                    <div key={badge.slug} className="layout-flex items-center justify-between gap-xs font-xs">
                      <div>
                        <strong className="text-strong">{badge.name}</strong>
                        <span className="text-muted" style={{ display: 'block' }}>{badge.description}</span>
                      </div>
                      <span className="font-mono text-muted">{badge.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Shared Lessons */}
            {profile.badgesGoalsLessons.sharedLessons && profile.badgesGoalsLessons.sharedLessons.length > 0 && (
              <div className="border-subtle radius-md" style={{ padding: '0.85rem' }}>
                <h3 className="margin-none font-sm weight-semibold">Shared Gameplay Lessons</h3>
                <div className="layout-grid gap-xs" style={{ marginTop: '0.5rem' }}>
                  {profile.badgesGoalsLessons.sharedLessons.map((lesson) => (
                    <div key={lesson.id} className="font-xs">
                      <span className="ui-badge ui-badge--sm" style={{ marginRight: '0.4rem' }}>
                        {lesson.gameTitle}
                      </span>
                      <span className="text-muted">{lesson.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <PrivacyGateCard
            groupingKey="badgesGoalsLessons"
            ownerName={user.displayName}
            gateReason={gateReasons.badgesGoalsLessons}
            relationship={relationship}
            onConnectClick={!isFriend && !isOutgoing ? handleConnect : undefined}
          />
        )}
      </PortalSection>

      {/* GROUPING 5: SESSION HISTORY */}
      <PortalSection ariaLabelledBy="friend-session-history">
        {visibleGroups.sessionHistory && profile.sessionHistory ? (
          <ProfileSessions
            sessions={mappedFriendSessions}
            totalCount={mappedFriendSessions.length}
          />
        ) : (
          <PrivacyGateCard
            groupingKey="sessionHistory"
            ownerName={user.displayName}
            gateReason={gateReasons.sessionHistory}
            relationship={relationship}
            onConnectClick={!isFriend && !isOutgoing ? handleConnect : undefined}
          />
        )}
      </PortalSection>
    </PortalLayout>
  );
}
