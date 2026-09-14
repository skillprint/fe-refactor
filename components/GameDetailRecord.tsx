import React from 'react';
import Link from 'next/link';
import { GameTileSkill } from './GameTile';
import { TraitSkillPill } from './TraitSkillPill';
import type { LibraryCommunityStats } from '@/lib/models/portal/LibraryCommunityStats';

export interface GameDetailRecordProps {
  gameTitle: string;
  /** Canonical slug, for the play link. */
  gameSlug: string;
  /** True once the player has at least one play on this game. */
  hasRecord: boolean;
  /** True while the record is still being fetched (nothing to show yet either way). */
  isLoading?: boolean;
  sessionsCount?: number;
  sessionsThisWeek?: number;
  /** Flow scores are 0–100; null until a session has been scored for its target mood. */
  bestFlow?: number | null;
  lastFlow?: number | null;
  /** The game's own scores; null until the game reports one. */
  bestScore?: number | null;
  lastScore?: number | null;
  minutes?: number;
  streak?: number;
  lastPlayedAt?: string | null;
  /** Everyone's play on this game, for context under the player's own. */
  community?: LibraryCommunityStats | null;
  skillsCount: number;
  totalSkills: number;
  skills: GameTileSkill[];
}

/** "today", "yesterday", "3 days ago", or the date once it is more than a fortnight back. */
function relativeDay(iso: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return '';
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(new Date()) - startOf(then)) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days <= 14) return `${days} days ago`;
  return then.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function GameDetailRecord({
  gameTitle,
  gameSlug,
  hasRecord,
  isLoading = false,
  sessionsCount = 0,
  sessionsThisWeek = 0,
  bestFlow = null,
  lastFlow = null,
  bestScore = null,
  lastScore = null,
  minutes = 0,
  streak = 0,
  lastPlayedAt = null,
  community = null,
  skillsCount,
  totalSkills,
  skills
}: GameDetailRecordProps) {
  const playUrl = `/game/${encodeURIComponent(gameSlug)}`;

  const skillPills = skills.map((skill) => (
    <li key={skill.id}>
      <TraitSkillPill skill={skill} />
    </li>
  ));

  const communityLine = community && community.totalSessions > 0
    ? community.uniquePlayers > 0
      ? `Played ${community.totalSessions.toLocaleString()} times by ${community.uniquePlayers.toLocaleString()} ${community.uniquePlayers === 1 ? 'player' : 'players'}.`
      : `Played ${community.totalSessions.toLocaleString()} times across Skillprint.`
    : null;

  // The page rail (PortalPageRail) is the sticky container; a second nested
  // rail here made this card stick on its own and slide over the badge card.
  return (
      <article className="rail-card rail-card--record sp-card" aria-labelledby="gdRecord">
        <div className="rail-card__head">
          <h2 className="rail-card__title" id="gdRecord">Your record</h2>
          <p className="rail-card__hint" data-gd-record-hint="">
            Yours on this game, and part of your Skillprint.
            {communityLine && <> <span data-gd-community="">{communityLine}</span></>}
          </p>
        </div>

        {isLoading ? (
          <div data-gd-record="" className="gd-record__empty sp-card layout-flex items-center gap-md text-muted">
            <span aria-hidden="true" className="session-spinner" style={{ width: '18px', height: '18px' }}></span>
            <span className="font-sm">Loading your record.</span>
          </div>
        ) : hasRecord ? (
          <div data-gd-record="">
            <div className="gd-record__figures grid grid-4">
              <div className="gd-metric">
                <span className="gd-metric__value">{sessionsCount}</span>
                <span className="gd-metric__label">Your sessions</span>
                <span className="gd-metric__note">
                  {sessionsCount === 1 ? 'First run logged' : sessionsThisWeek > 0 ? `${sessionsThisWeek} this week` : 'On this game'}
                </span>
              </div>
              <div className="gd-metric">
                <span className="gd-metric__value">{bestFlow ?? '–'}</span>
                <span className="gd-metric__label">Your best flow</span>
                <span className="gd-metric__note">{bestFlow == null ? 'Not scored yet' : 'Personal best'}</span>
              </div>
              <div className="gd-metric">
                <span className="gd-metric__value">{minutes}</span>
                <span className="gd-metric__label">Your minutes</span>
                <span className="gd-metric__note">Time on this game</span>
              </div>
              <div className="gd-metric">
                <span className="gd-metric__value">{streak}</span>
                <span className="gd-metric__label">Your streak</span>
                <span className="gd-metric__note">{streak === 1 ? 'Day' : 'Days in a row'}</span>
              </div>
            </div>

            <div className="gd-record__feed sp-card">
              <div className="layout-flex items-center justify-between gap-lg">
                <h3 className="margin-none">Last run flow score</h3>
                <span className="font-mono weight-semibold">{lastFlow ?? '–'}</span>
              </div>
              <div className="sp-progress gd-meter">
                <div className="sp-progress__track">
                  <span className="sp-progress__fill" style={{ '--progress': `${lastFlow ?? 0}%` } as React.CSSProperties}></span>
                </div>
              </div>
              {(lastPlayedAt || bestScore != null) && (
                <p className="margin-none text-muted font-sm leading-md" data-gd-record-scores="">
                  {lastPlayedAt && <>Last played {relativeDay(lastPlayedAt)}.</>}
                  {bestScore != null && (
                    <> Best score <span className="text-default weight-semibold font-mono">{bestScore.toLocaleString()}</span>
                    {lastScore != null && lastScore !== bestScore && <>, last run <span className="font-mono">{lastScore.toLocaleString()}</span></>}.</>
                  )}
                </p>
              )}

              <p className="gd-record__into margin-none text-muted font-sm leading-md">
                These runs are already in your Skillprint. {gameTitle} feeds <span className="text-default weight-semibold">{skillsCount} of your {totalSkills} skills</span>:
              </p>

              <ul className="trait-skills layout-flex wrap items-center margin-none padding-none">
                {skillPills}
              </ul>

              <Link className="gd-record__link button button--primary button--md" href="/profile">
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chart"></use></svg>
                See it in your Skillprint
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chevron-right"></use></svg>
              </Link>
            </div>
          </div>
        ) : (
          <div data-gd-record="">
            <div className="gd-record__empty sp-card layout-flex flow-column gap-lg">
              <p className="margin-none text-muted leading-md">
                You have not played {gameTitle} yet, so there is nothing here that belongs to you. One finished run logs a flow score and starts moving <span className="text-default weight-semibold">{skillsCount} of your {totalSkills} skills</span>:
              </p>

              <ul className="trait-skills layout-flex wrap items-center margin-none padding-none">
                {skillPills}
              </ul>

              <Link className="button button--primary button--md" href={playUrl}>
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-play"></use></svg>
                Play {gameTitle}
              </Link>
            </div>
          </div>
        )}
      </article>
  );
}
