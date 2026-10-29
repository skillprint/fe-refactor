import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PortalSection } from './LayoutGrid';
import { PortalSectionTitle, PortalSectionHint } from './Typography';
import { relativeDay } from '@/lib/relativeDay';
import {
  normalizeLeaderboardBoard,
  type LeaderboardPeriod,
  type LibraryGameLeaderboard,
} from '@/lib/models/portal/LibraryGameLeaderboard';
import { enrichLeaderboardWithFriends } from '@/lib/models/portal/FriendsAndPrivacy';
import { useFriendsAndPrivacy, useFriendsFeatureFlag } from '@/lib/models/portal/useFriendsAndPrivacy';
import { useUserSession } from '@/app/hooks/useUserSession';
import {
  createLeaderboardRankNotification,
  pushPortalNotificationOnce,
} from '@/lib/notifications';

export interface GameDetailLeaderboardProps {
  gameTitle: string;
  /** The board for `period`, or null until it arrives. */
  board: LibraryGameLeaderboard | null;
  /** True while a board is being fetched; the previous one stays up meanwhile. */
  isLoading: boolean;
  period: LeaderboardPeriod;
  onPeriodChange: (period: LeaderboardPeriod) => void;
}

const PERIODS: { value: LeaderboardPeriod; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: 'week', label: 'This week' },
];

/** A game score as the game counts it: whole points plain, fractions kept. */
function formatScore(score: number): string {
  return score.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/**
 * The game's leaderboard (marketplace #148): the top players by the game's
 * own score, one row each, displaying each player's name or shortened
 * `playerId` (with `(You)` on the viewer's own row) and the viewer's standing
 * under the list whether or not their row made the top.
 */
export function GameDetailLeaderboard({ gameTitle, board, isLoading, period, onPeriodChange }: GameDetailLeaderboardProps) {
  const { userId } = useUserSession();
  const { friendsFeatureEnabled } = useFriendsFeatureFlag();
  const { friends } = useFriendsAndPrivacy();
  const [friendsOnly, setFriendsOnly] = useState(false);

  const normalizedBoard = useMemo(
    () =>
      normalizeLeaderboardBoard(board, {
        playerId: userId,
      }),
    [board, userId],
  );

  const enrichedBoard = useMemo(
    () => (friendsFeatureEnabled ? enrichLeaderboardWithFriends(normalizedBoard, friends) : normalizedBoard),
    [normalizedBoard, friends, friendsFeatureEnabled],
  );

  const allEntries = enrichedBoard?.entries ?? [];
  const entries = useMemo(
    () =>
      friendsFeatureEnabled && friendsOnly
        ? allEntries.filter((e) => e.isYou || e.isFriend)
        : allEntries,
    [allEntries, friendsFeatureEnabled, friendsOnly]
  );
  const total = enrichedBoard?.totalPlayers ?? 0;
  const you = enrichedBoard?.you ?? null;
  const periodLabel = period === 'week' ? 'this week' : 'all time';
  const youInTop = entries.some((e) => e.isYou);

  useEffect(() => {
    if (!board?.you || board.you.rank > 3 || !board.gameSlug) return;
    pushPortalNotificationOnce(
      createLeaderboardRankNotification({
        gameSlug: board.gameSlug,
        gameTitle,
        rank: board.you.rank,
        score: board.you.score,
        period: board.period,
        totalPlayers: board.totalPlayers,
      }),
    );
  }, [board, gameTitle]);

  return (
    <PortalSection ariaLabelledBy="gdBoard" className="separator-top">
      <div className="portal-section__bar">
        <div className="min-width-0">
          <PortalSectionTitle id="gdBoard">Leaderboard</PortalSectionTitle>
          <PortalSectionHint data-gd-board-hint="">
            Best scores on {gameTitle} across Skillprint
            {board && total > 0 && <>, {total.toLocaleString()} {total === 1 ? 'player' : 'players'} ranked {periodLabel}</>}.
          </PortalSectionHint>
        </div>
        <div className="layout-flex items-center gap-sm wrap">
          {friendsFeatureEnabled && (
            <div className="layout-inline-flex button-group no-grow padding-none" role="group" aria-label="Leaderboard scope">
              <button
                type="button"
                aria-pressed={!friendsOnly}
                className={`button-group__item ${!friendsOnly ? 'is-active' : ''}`}
                onClick={() => setFriendsOnly(false)}
              >
                All ranked
              </button>
              <button
                type="button"
                aria-pressed={friendsOnly}
                className={`button-group__item ${friendsOnly ? 'is-active' : ''}`}
                onClick={() => setFriendsOnly(true)}
              >
                Friends
              </button>
            </div>
          )}
          <div className="layout-inline-flex button-group no-grow padding-none" role="group" aria-label="Period">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                aria-pressed={period === p.value}
                className={`button-group__item ${period === p.value ? 'is-active' : ''}`}
                onClick={() => onPeriodChange(p.value)}
                type="button"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="gd-panel gd-board sp-card" data-gd-board="" aria-busy={isLoading || undefined}>
        {!board && isLoading ? (
          <div className="layout-flex items-center gap-md text-muted">
            <span aria-hidden="true" className="session-spinner" style={{ width: '18px', height: '18px' }}></span>
            <span className="font-sm">Loading the board.</span>
          </div>
        ) : entries.length === 0 ? (
          <p className="gd-board__empty margin-none text-muted leading-md">
            {friendsOnly
              ? `No connected friends with shared Game Stats have posted a score on ${gameTitle} ${periodLabel} yet.`
              : `Nobody has posted a score on ${gameTitle} ${periodLabel} yet. Finish a run with a score and the top spot is yours.`}
          </p>
        ) : (
          <ol className="gd-board__list margin-none padding-none" data-gd-board-list="">
            {entries.map((entry, i) => (
              <li
                key={`${entry.rank}-${i}`}
                className="gd-board__row"
                data-own={entry.isYou ? 'true' : 'false'}
                data-friend={entry.isFriend ? 'true' : 'false'}
                data-podium={entry.rank <= 3 ? 'true' : 'false'}
                aria-current={entry.isYou ? 'true' : undefined}
              >
                <span className="gd-board__rank">
                  {entry.rank === 1 ? (
                    <svg className="sp-icon sp-icon--sm" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-trophy"></use></svg>
                  ) : null}
                  <span className="gd-board__rank-number">{entry.rank}</span>
                </span>
                <span className="gd-board__name layout-flex items-center gap-xs wrap">
                  {entry.isFriend && entry.userId ? (
                    <Link
                      href={`/profile/${encodeURIComponent(entry.userId)}`}
                      className="text-strong weight-semibold"
                      style={{ textDecoration: 'none' }}
                    >
                      {entry.userDisplay}
                    </Link>
                  ) : (
                    <span>{entry.userDisplay}</span>
                  )}
                  {entry.playerId &&
                    !entry.userDisplay.toLowerCase().includes(entry.playerId.toLowerCase()) && (
                      <span
                        className="text-muted font-xs font-mono"
                        data-gd-board-player-id={entry.playerId}
                      >
                        @{entry.playerId}
                      </span>
                    )}
                  {entry.isFriend && (
                    <span
                      className="ui-badge ui-badge--sm"
                      style={{
                        background: 'color-mix(in srgb, var(--accent-primary, #5d6bff) 18%, transparent)',
                        color: 'var(--accent-primary, #5d6bff)',
                      }}
                    >
                      Friend
                    </span>
                  )}
                </span>
                <span className="gd-board__when text-muted">{relativeDay(entry.achievedAt)}</span>
                <span className="gd-board__score font-mono weight-semibold">{formatScore(entry.score)}</span>
              </li>
            ))}
          </ol>
        )}

        {board && (you || entries.length > 0) && (
          <p className="gd-board__standing margin-none text-muted font-sm leading-md" data-gd-board-standing="">
            {you ? (
              <>
                {youInTop ? 'You are' : 'You stand'} <span className="text-default weight-semibold">#{you.rank}</span> of {total.toLocaleString()} {periodLabel} with a best of{' '}
                <span className="text-default weight-semibold font-mono">{formatScore(you.score)}</span>, set {relativeDay(you.achievedAt)}.
              </>
            ) : (
              <>You are not on the board {periodLabel}. Finish a run with a score to take your place.</>
            )}
          </p>
        )}
      </div>
    </PortalSection>
  );
}
