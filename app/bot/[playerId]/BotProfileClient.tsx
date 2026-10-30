'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import PortalHead from '@/components/PortalHead';
import { PortalSection } from '@/components/LayoutGrid';
import ProfileSkillsSection from '@/components/Profile/ProfileSkillsSection';
import ProfileSessions from '@/components/Profile/ProfileSessions';
import type { SkillBaselineMap } from '@/components/Profile/ProfileSkillBreakdown';
import { profileDimensionMap } from '@/lib/models/portal/ProfileAggregate';
import type { BotProfile } from '@/lib/models/portal/serverBotProfile';
import { DEFAULT_GAME_IMAGE, showDefaultGameImageOnError } from '@/lib/playbookUtils';
import { getGameDetails } from '../../config/gameConfig';
import { formatPlayTime } from '../../profile/embed/buildEmbedData';

const TOTAL_SKILLS = 28;

function formatSecondsToDuration(sec: number): string {
  if (!sec || isNaN(sec)) return '0m 0s';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/**
 * A bot's profile, read-only. The same skill wheel, breakdown and session
 * list as a player's own profile, from payloads the server fetched as the
 * bot; nothing here reads or changes the viewer's session.
 */
export default function BotProfileClient({ bot }: { bot: BotProfile }) {
  const { name, playerId, profile } = bot;

  // Dates render in the viewer's locale and time zone, which the server does
  // not know, so the session list waits for the browser.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dimensions = useMemo(() => profileDimensionMap(profile), [profile]);
  const scores = useMemo(() => {
    const out: Record<string, number> = {};
    Object.values(dimensions).forEach((stat) => {
      if (typeof stat.score === 'number') out[stat.slug] = stat.score;
    });
    return out;
  }, [dimensions]);
  const baselines = useMemo<SkillBaselineMap>(() => {
    const out: SkillBaselineMap = {};
    Object.values(dimensions).forEach((stat) => {
      out[stat.slug] = { baselineScore: stat.baselineScore, delta: stat.delta };
    });
    return out;
  }, [dimensions]);

  const sessions = bot.sessions.map((s) => ({
    id: s.sessionId,
    gameSlug: s.gameSlug,
    gameName: s.gameName || (s.gameSlug ? (getGameDetails(s.gameSlug)?.name || s.gameSlug) : 'Unknown'),
    gameImage: s.gameSlug ? getGameDetails(s.gameSlug)?.image : undefined,
    date: s.playedAt,
    score: s.primaryScore ?? 0,
    skillMeasured: s.primaryMood || 'Unknown',
    duration: s.durationSeconds ? formatSecondsToDuration(s.durationSeconds) : undefined,
  }));

  const totals = profile.totals ?? { sessions: 0, totalPlaySeconds: 0, activeDays: 0 };
  const measured = Object.keys(scores).length;
  const stats = [
    { label: 'Sessions', value: totals.sessions ?? sessions.length },
    { label: 'Play time', value: formatPlayTime(totals.totalPlaySeconds ?? 0) },
    { label: 'Active days', value: totals.activeDays ?? 0 },
    { label: 'Skills measured', value: `${measured} of ${TOTAL_SKILLS}` },
  ];

  const header = (
    <PortalHead
      eyebrow="Bot profile"
      title={`${name}'s Skillprint`}
      titleId="botPageTitle"
      description={`${name} is an AI agent that plays on LLM Island. Its sessions are scored the same way a person's are: ${TOTAL_SKILLS} skills across mood, cognition and personality.`}
      actions={
        <span className="ui-badge ui-badge--pill ui-badge--md" data-bot-badge="">
          Bot
        </span>
      }
    />
  );

  const rail = (
    <>
      <article className="rail-card sp-card sp-card--raised" aria-labelledby="botAbout">
        <div className="rail-card__head">
          <h2 className="rail-card__title" id="botAbout">{name}</h2>
          <span className="ui-badge ui-badge--sm">AI agent</span>
        </div>
        <p className="margin-none font-sm leading-md">
          A bot, not a person. It plays the same games and is scored by the same model as everyone else.
        </p>
        <div className="layout-flex items-center justify-between gap-md separator-top font-sm">
          <span className="text-muted">Player ID</span>
          <span className="font-mono">{playerId}</span>
        </div>
      </article>

      <article className="rail-card sp-card" aria-labelledby="botTotals">
        <div className="rail-card__head">
          <span className="rail-card__label" id="botTotals">All time</span>
        </div>
        <div className="layout-grid gap-sm">
          {stats.map((stat) => (
            <div key={stat.label} className="layout-flex items-center justify-between gap-md font-sm">
              <span className="text-muted">{stat.label}</span>
              <span className="weight-semibold">{stat.value}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="rail-card sp-card" aria-labelledby="botRecent">
        <div className="rail-card__head">
          <span className="rail-card__label" id="botRecent">Recent sessions</span>
        </div>
        {sessions.length > 0 ? (
          <ul className="rail-list">
            {sessions.slice(0, 5).map((session) => (
              <li key={session.id}>
                <Link className="rail-list__link" href={`/game_detail?game=${session.gameSlug}`}>
                  <img className="rail-thumb" alt="" src={session.gameImage || DEFAULT_GAME_IMAGE} onError={showDefaultGameImageOnError} />
                  <span className="rail-list__name">{session.gameName}</span>
                  <span className="rail-list__value">{session.score}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="margin-none text-muted font-sm">No sessions recorded yet.</p>
        )}
      </article>
    </>
  );

  return (
    <PortalLayout pageClass="page--portal-profile page--bot-profile" header={header} rail={rail}>
      <PortalSection ariaLabelledBy="profile-skills-breakdown">
        <ProfileSkillsSection scores={scores} baselines={baselines} who={`${name}'s skills`} />
      </PortalSection>

      {mounted && <ProfileSessions sessions={sessions} totalCount={totals.sessions} ownerName={name} />}
    </PortalLayout>
  );
}
