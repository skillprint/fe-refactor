import React from 'react';
import { PortalSection } from './LayoutGrid';
import { PortalSectionTitle, PortalSectionHint } from './Typography';
import { relativeDay } from '@/lib/relativeDay';
import type { LeaderboardPeriod, LibraryGameLeaderboard } from '@/lib/models/portal/LibraryGameLeaderboard';

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
 * own score, one row each, anonymised except for the viewer, with the
 * viewer's standing under the list whether or not their row made the top.
 */
export function GameDetailLeaderboard({ gameTitle, board, isLoading, period, onPeriodChange }: GameDetailLeaderboardProps) {
  const entries = board?.entries ?? [];
  const total = board?.totalPlayers ?? 0;
  const you = board?.you ?? null;
  const periodLabel = period === 'week' ? 'this week' : 'all time';
  const youInTop = entries.some((e) => e.isYou);

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

      <div className="gd-panel gd-board sp-card" data-gd-board="" aria-busy={isLoading || undefined}>
        {!board && isLoading ? (
          <div className="layout-flex items-center gap-md text-muted">
            <span aria-hidden="true" className="session-spinner" style={{ width: '18px', height: '18px' }}></span>
            <span className="font-sm">Loading the board.</span>
          </div>
        ) : entries.length === 0 ? (
          <p className="gd-board__empty margin-none text-muted leading-md">
            Nobody has posted a score on {gameTitle} {periodLabel} yet. Finish a run with a score and the top spot is yours.
          </p>
        ) : (
          <ol className="gd-board__list margin-none padding-none" data-gd-board-list="">
            {entries.map((entry, i) => (
              <li
                key={`${entry.rank}-${i}`}
                className="gd-board__row"
                data-own={entry.isYou ? 'true' : 'false'}
                data-podium={entry.rank <= 3 ? 'true' : 'false'}
                aria-current={entry.isYou ? 'true' : undefined}
              >
                <span className="gd-board__rank">
                  {entry.rank === 1 ? (
                    <svg className="sp-icon sp-icon--sm" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-trophy"></use></svg>
                  ) : null}
                  <span className="gd-board__rank-number">{entry.rank}</span>
                </span>
                <span className="gd-board__name">{entry.userDisplay}</span>
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
