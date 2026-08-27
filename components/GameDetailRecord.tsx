import React from 'react';
import Link from 'next/link';
import { GameTileSkill } from './GameTile';

import { TraitSkillPill } from './TraitSkillPill';

export interface GameDetailRecordProps {
  gameTitle: string;
  gameSlug: string;
  hasRecord: boolean;
  sessionsCount?: number;
  bestFlow?: number;
  minutes?: number;
  streak?: number;
  lastFlow?: number;
  skillsCount: number;
  totalSkills?: number;
  skills: GameTileSkill[];
}

export function GameDetailRecord({
  gameTitle,
  gameSlug,
  hasRecord,
  sessionsCount = 0,
  bestFlow = 0,
  minutes = 0,
  streak = 0,
  lastFlow = 0,
  skillsCount,
  totalSkills = 28,
  skills
}: GameDetailRecordProps) {

  const skillPills = skills.map((skill) => (
    <li key={skill.id}>
      <TraitSkillPill skill={skill} />
    </li>
  ));

  return (
    <aside className="portal-rail" aria-label="Your record">
      <article className="rail-card rail-card--record sp-card" aria-labelledby="gdRecord">
        <div className="rail-card__head">
          <h2 className="rail-card__title" id="gdRecord">Your record</h2>
          <p className="rail-card__hint" data-gd-record-hint="">Yours on this game, and part of your Skillprint.</p>
        </div>
        
        {hasRecord ? (
          <div data-gd-record="">
            <div className="gd-record__figures grid grid-4">
              <div className="gd-metric">
                <span className="gd-metric__value">{sessionsCount}</span>
                <span className="gd-metric__label">Your sessions</span>
                <span className="gd-metric__note">{sessionsCount === 1 ? 'First run logged' : 'On this game'}</span>
              </div>
              <div className="gd-metric">
                <span className="gd-metric__value">{bestFlow}</span>
                <span className="gd-metric__label">Your best flow</span>
                <span className="gd-metric__note">Personal best</span>
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
                <span className="font-mono weight-semibold">{lastFlow}</span>
              </div>
              <div className="sp-progress gd-meter">
                <div className="sp-progress__track">
                  <span className="sp-progress__fill" style={{ '--progress': `${lastFlow}%` } as React.CSSProperties}></span>
                </div>
              </div>
              
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
              
              <Link className="button button--primary button--md" href={`/game_session?game=${gameSlug}`}>
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-play"></use></svg>
                Play {gameTitle}
              </Link>
            </div>
          </div>
        )}
      </article>
      {/* We can place the badge component below this rail card since it's part of the same aside */}
    </aside>
  );
}
