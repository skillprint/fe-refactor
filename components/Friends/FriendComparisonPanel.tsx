'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FriendCardSummary,
  SEEDED_PLAYERS,
  buildGatedProfileFromSeed,
} from '@/lib/models/portal/FriendsAndPrivacy';
import { useProfileAggregate } from '@/lib/models/portal/useProfileAggregate';
import { profileDimensionMap } from '@/lib/models/portal/ProfileAggregate';
import { getStoredGameHighScores } from '@/lib/highScores';
import { titleFromSlug } from '@/lib/skillIcons';
import PrivacyGateCard from './PrivacyGateCard';

export interface FriendComparisonPanelProps {
  friends: FriendCardSummary[];
  initialFriendId?: string | null;
}

const DEFAULT_USER_SCORES: Record<string, number> = {
  attention: 81,
  'pattern-matching': 76,
  spatial: 74,
  planning: 78,
  memory: 73,
  'task-switching': 71,
  'perceptual-speed': 79,
  timing: 75,
  deduction: 77,
  openness: 74,
  conscientiousness: 76,
  extraversion: 68,
  agreeableness: 75,
  'emotional-stability': 72,
  focus: 78,
  relax: 71,
  curiosity: 76,
  grit: 79,
  joy: 73,
};

const DEFAULT_USER_GAME_SCORES: Record<string, number> = {
  hextris: 3990,
  '2048': 18420,
  'gummy-blocks': 3510,
  'box-tower': 68,
  'snake-attack': 1560,
  'cat-focus': 1940,
};

export default function FriendComparisonPanel({
  friends,
  initialFriendId = null,
}: FriendComparisonPanelProps) {
  const [selectedId, setSelectedId] = useState<string>(
    initialFriendId || friends[0]?.userId || '',
  );
  const [pillarTab, setPillarTab] = useState<'cognition' | 'personality' | 'mood'>('cognition');

  const { data: myProfileAggregate } = useProfileAggregate();
  const myDimensionMap = useMemo(
    () => profileDimensionMap(myProfileAggregate),
    [myProfileAggregate],
  );

  const myScores = useMemo(() => {
    const merged = { ...DEFAULT_USER_SCORES };
    Object.values(myDimensionMap).forEach((stat) => {
      if (typeof stat.score === 'number') {
        merged[stat.slug] = stat.score;
      }
    });
    return merged;
  }, [myDimensionMap]);

  const activeFriendCard =
    friends.find((f) => f.userId === selectedId) || friends[0] || null;

  const friendProfile = useMemo(() => {
    if (!activeFriendCard) return null;
    const seed = SEEDED_PLAYERS.find((p) => p.userId === activeFriendCard.userId);
    if (seed) {
      return buildGatedProfileFromSeed(seed, 'friend');
    }
    return null;
  }, [activeFriendCard]);

  if (!activeFriendCard || !friendProfile) {
    return (
      <div className="sp-card" style={{ padding: '24px' }}>
        <p className="margin-none text-muted font-sm">
          Connect with at least one friend to compare Skillprints and game high scores side by side.
        </p>
      </div>
    );
  }

  const canSeeCognition = friendProfile.visibleGroups.cognitionPersonality;
  const canSeeMood = friendProfile.visibleGroups.moodSignals;
  const canSeeGames = friendProfile.visibleGroups.gameStats;

  const friendDimensions =
    pillarTab === 'cognition'
      ? friendProfile.cognitionPersonality?.cognition || []
      : pillarTab === 'personality'
        ? friendProfile.cognitionPersonality?.personality || []
        : friendProfile.moodSignals?.mood || [];

  const isCurrentPillarAllowed =
    pillarTab === 'mood' ? canSeeMood : canSeeCognition;

  return (
    <div className="layout-grid gap-xl" data-friend-comparison="">
      {/* Friend Picker Bar */}
      <div
        className="sp-card"
        style={{
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span className="ui-label">Compare Your Skillprint With:</span>
          {friends.map((f) => {
            const active = f.userId === activeFriendCard.userId;
            return (
              <button
                key={f.userId}
                type="button"
                aria-pressed={active}
                className={`ui-tag ${active ? 'is-selected' : ''}`}
                onClick={() => setSelectedId(f.userId)}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '9999px',
                    background: f.avatarColor || '#38bdf8',
                    display: 'inline-block',
                  }}
                />
                {f.displayName}
                {f.isAiPersona && (
                  <span className="ui-badge ui-badge--sm" style={{ marginLeft: '4px' }}>
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <Link
          href={`/profile/${encodeURIComponent(activeFriendCard.userId)}`}
          className="button button--secondary button--sm"
        >
          Open {activeFriendCard.displayName}&apos;s Full Profile
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
            <use href="#ti-arrow-right"></use>
          </svg>
        </Link>
      </div>

      {/* Skillprint Dimension Comparison */}
      <div className="sp-card" style={{ padding: '22px 24px', display: 'grid', gap: '18px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h3 className="margin-none font-md weight-semibold">
              Skillprint Dimension Comparison: You vs. {activeFriendCard.displayName}
            </h3>
            <p className="margin-none text-muted font-xs">
              Head-to-head comparison across measured dimensions. Respects {activeFriendCard.displayName}&apos;s privacy settings.
            </p>
          </div>

          <div className="button-group no-grow" role="group" aria-label="Skillprint pillar">
            {(['cognition', 'personality', 'mood'] as const).map((p) => {
              const locked = p === 'mood' ? !canSeeMood : !canSeeCognition;
              return (
                <button
                  key={p}
                  type="button"
                  aria-pressed={pillarTab === p}
                  className={`button-group__item ${pillarTab === p ? 'is-active' : ''}`}
                  onClick={() => setPillarTab(p)}
                >
                  <svg className="sp-icon button-group__icon" aria-hidden="true" viewBox="0 0 24 24">
                    <use href={locked ? '#ti-lock' : `#ti-category-${p}`}></use>
                  </svg>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {!isCurrentPillarAllowed ? (
          <PrivacyGateCard
            groupingKey={pillarTab === 'mood' ? 'moodSignals' : 'cognitionPersonality'}
            ownerName={activeFriendCard.displayName}
            gateReason={
              pillarTab === 'mood'
                ? friendProfile.gateReasons.moodSignals
                : friendProfile.gateReasons.cognitionPersonality
            }
            relationship="friend"
            compact={true}
          />
        ) : (
          <div className="layout-grid gap-md">
            {friendDimensions.map((dim) => {
              const myScore = myScores[dim.slug] ?? 72;
              const theirScore = dim.score;
              const diff = myScore - theirScore;
              return (
                <div
                  key={dim.slug}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'var(--surface-box, rgba(255,255,255,0.03))',
                    border: '1px solid var(--surface-border, rgba(255,255,255,0.08))',
                    display: 'grid',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <strong className="font-sm weight-semibold">{titleFromSlug(dim.slug)}</strong>
                    <span
                      className="font-xs font-mono weight-semibold"
                      style={{
                        color: diff > 0 ? '#09e08f' : diff < 0 ? '#38bdf8' : 'var(--muted-foreground)',
                      }}
                    >
                      {diff > 0
                        ? `You +${diff}`
                        : diff < 0
                          ? `${activeFriendCard.displayName.split(' ')[0]} +${Math.abs(diff)}`
                          : 'Tied'}
                    </span>
                  </div>

                  {/* Dual Bars */}
                  <div style={{ display: 'grid', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="font-xs text-muted" style={{ width: '90px', flexShrink: 0 }}>
                        You
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: '8px',
                          borderRadius: '9999px',
                          background: 'rgba(255,255,255,0.08)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(100, Math.max(0, myScore))}%`,
                            height: '100%',
                            borderRadius: '9999px',
                            background: '#ff518d',
                          }}
                        />
                      </div>
                      <span className="font-xs font-mono weight-semibold" style={{ width: '32px', textAlign: 'right' }}>
                        {myScore}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        className="font-xs text-muted"
                        style={{
                          width: '90px',
                          flexShrink: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {activeFriendCard.displayName.split(' ')[0]}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: '8px',
                          borderRadius: '9999px',
                          background: 'rgba(255,255,255,0.08)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(100, Math.max(0, theirScore))}%`,
                            height: '100%',
                            borderRadius: '9999px',
                            background: activeFriendCard.avatarColor || '#38bdf8',
                          }}
                        />
                      </div>
                      <span className="font-xs font-mono weight-semibold" style={{ width: '32px', textAlign: 'right' }}>
                        {theirScore}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Head-to-Head Game High Scores */}
      <div className="sp-card" style={{ padding: '22px 24px', display: 'grid', gap: '16px' }}>
        <div>
          <h3 className="margin-none font-md weight-semibold">
            Game High Scores: You vs. {activeFriendCard.displayName}
          </h3>
          <p className="margin-none text-muted font-xs">
            Compare personal best scores on shared games. Requires the Game Play Stats &amp; High Scores privacy grouping.
          </p>
        </div>

        {!canSeeGames ? (
          <PrivacyGateCard
            groupingKey="gameStats"
            ownerName={activeFriendCard.displayName}
            gateReason={friendProfile.gateReasons.gameStats}
            relationship="friend"
            compact={true}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '12px',
            }}
          >
            {(friendProfile.gameStats?.games || []).map((game) => {
              const localHigh = getStoredGameHighScores(game.gameSlug).allTimeBest;
              const myBest = localHigh ?? DEFAULT_USER_GAME_SCORES[game.gameSlug] ?? 0;
              const theirBest = game.bestScore ?? 0;
              const youLead = myBest >= theirBest;

              return (
                <div
                  key={game.gameSlug}
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: 'var(--surface-box, rgba(255,255,255,0.03))',
                    border: '1px solid var(--surface-border, rgba(255,255,255,0.08))',
                    display: 'grid',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <Link
                      href={`/game_detail?game=${encodeURIComponent(game.gameSlug)}`}
                      className="weight-semibold font-sm"
                    >
                      {game.gameName}
                    </Link>
                    <span
                      className="ui-badge ui-badge--sm"
                      style={{
                        background: youLead ? 'rgba(9, 224, 143, 0.16)' : 'rgba(56, 189, 248, 0.16)',
                        color: youLead ? '#09e08f' : '#38bdf8',
                      }}
                    >
                      {youLead ? 'You Lead' : `${activeFriendCard.displayName.split(' ')[0]} Leads`}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gap: '4px' }}>
                    <div className="layout-flex items-center justify-between font-sm">
                      <span className="text-muted">Your Best</span>
                      <strong className="font-mono">{myBest.toLocaleString()}</strong>
                    </div>
                    <div className="layout-flex items-center justify-between font-sm">
                      <span className="text-muted">{activeFriendCard.displayName.split(' ')[0]}&apos;s Best</span>
                      <strong className="font-mono">{theirBest.toLocaleString()}</strong>
                    </div>
                  </div>

                  <Link
                    href={`/game/${encodeURIComponent(game.gameSlug)}`}
                    className="button button--tertiary button--xs full-width"
                  >
                    Play {game.gameName}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
