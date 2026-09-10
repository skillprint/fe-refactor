'use client';

import React, { useMemo } from 'react';
import type { SkillCatalogEntry } from '@/lib/skillCatalog';
import type { LongitudinalMetric } from '@/lib/models/portal/LongitudinalMetric';
import { usePaginatedSession } from '@/lib/models/portal/usePaginatedSession';
import { unifiedSlugFromBESlug } from '@/app/utils/slugUtils';
import { PORTAL_SKILLS } from '@/app/config/skillsTaxonomy';
import { titleFromSlug } from '@/lib/skillIcons';

interface SkillSessionsTableProps {
  skill: SkillCatalogEntry;
  metric: LongitudinalMetric | null;
}

const MAX_ROWS = 8;

function formatPlayed(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (sameDay) return `Today, ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export function SkillSessionsTable({ skill, metric }: SkillSessionsTableProps) {
  const { data, isLoading } = usePaginatedSession(false, { limit: 50 });

  // The session log is not indexed by skill, so we keep the sessions played on
  // games the backend says train this skill (or, for moods, sessions that
  // targeted the mood).
  const rows = useMemo(() => {
    const results = data?.results || [];
    const trainingSlugs = new Set((metric?.gamesThatTrainThis || []).map((g) => unifiedSlugFromBESlug(g.slug)));
    const tileSlugs = new Set(skill.gameTiles.map((g) => unifiedSlugFromBESlug(g.id)));
    return results
      .filter((s) => {
        if (skill.pillar === 'mood' && s.primaryMood === skill.id) return true;
        const slug = unifiedSlugFromBESlug(s.gameSlug || '');
        return trainingSlugs.has(slug) || tileSlugs.has(slug);
      })
      .slice(0, MAX_ROWS);
  }, [data, metric, skill]);

  return (
    <section aria-labelledby="sessionsTitle" className="stat-section separator-top" id="sessions">
      <div className="stat-section__head layout-flex items-end justify-between gap-2xl wrap">
        <div className="min-width-0">
          <span className="eyebrow eyebrow--compact">Recent activity</span>
          <h2 className="portal-section__title" id="sessionsTitle">Sessions that moved it</h2>
        </div>
      </div>
      <p className="stat-section__lede margin-none text-muted">
        Your most recent sessions on games that measure {skill.name}.
      </p>

      <div className="stat-table sp-panel padding-none clip mt-6">
        <div className="table-scroll table-wrap">
          <table className="sp-table full-width stat-table__table">
            <caption className="sr-only position-absolute padding-none clip no-wrap border-none">
              Recent sessions for {skill.name}
            </caption>
            <thead>
              <tr>
                <th className="ui-label separator-bottom text-left surface-box text-subtle py-3 px-4" scope="col">Played</th>
                <th className="ui-label separator-bottom text-left surface-box text-subtle py-3 px-4" scope="col">Game</th>
                <th className="ui-label separator-bottom text-left surface-box text-subtle py-3 px-4" scope="col">Target mood</th>
                <th className="ui-label separator-bottom text-left surface-box text-subtle py-3 px-4" scope="col">Duration</th>
                <th className="ui-label separator-bottom text-left surface-box text-subtle py-3 px-4" scope="col">Mood score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((session) => (
                <tr key={session.sessionId} className="border-b border-border-subtle last:border-0 hover:bg-surface-box transition-colors">
                  <td className="py-4 px-4 text-sm">{formatPlayed(session.playedAt)}</td>
                  <td className="py-4 px-4 text-sm font-semibold">{session.gameName}</td>
                  <td className="py-4 px-4 text-sm text-muted">{session.primaryMood ? (PORTAL_SKILLS[session.primaryMood]?.name || titleFromSlug(session.primaryMood)) : '—'}</td>
                  <td className="py-4 px-4 text-sm text-muted">{formatDuration(session.durationSeconds || 0)}</td>
                  <td className="py-4 px-4 text-sm">{session.primaryScore ?? '—'}</td>
                </tr>
              ))}
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td className="py-6 px-4 text-sm text-muted" colSpan={5}>No recent sessions on games that measure {skill.name}.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="stat-table__foot margin-none separator-top font-xs leading-md text-muted p-4">
          {isLoading ? 'Loading sessions…' : `Showing the last ${rows.length} ${rows.length === 1 ? 'session' : 'sessions'}.`}
        </p>
      </div>
    </section>
  );
}
