import React from 'react';
import { getSkillById } from '@/lib/skillsData';

interface SkillSessionsTableProps {
  skillId: string;
}

export function SkillSessionsTable({ skillId }: SkillSessionsTableProps) {
  const skill = getSkillById(skillId);

  if (!skill) return null;

  // Mock sessions data
  const sessions = [
    { id: 1, date: 'Today, 2:45 PM', game: 'Hextris', result: 'Completed', duration: '2m 14s', score: 1450, change: '+2', changeIsPositive: true },
    { id: 2, date: 'Yesterday, 10:30 AM', game: 'Space Trip', result: 'Completed', duration: '5m 02s', score: 3200, change: '+5', changeIsPositive: true },
    { id: 3, date: 'Aug 24, 2026', game: 'Hextris', result: 'Quit', duration: '0m 45s', score: 240, change: '-1', changeIsPositive: false },
    { id: 4, date: 'Aug 22, 2026', game: 'Bubble Spirit', result: 'Completed', duration: '3m 20s', score: 2100, change: '+4', changeIsPositive: true },
  ];

  return (
    <section aria-labelledby="sessionsTitle" className="stat-section separator-top" id="sessions">
      <div className="stat-section__head layout-flex items-end justify-between gap-2xl wrap">
        <div className="min-width-0">
          <span className="eyebrow eyebrow--compact">Recent activity</span>
          <h2 className="portal-section__title" id="sessionsTitle">Sessions that moved it</h2>
        </div>
      </div>
      <p className="stat-section__lede margin-none text-muted">
        Your most recent game sessions that impacted your {skill.name} score.
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
                <th className="ui-label separator-bottom text-left surface-box text-subtle py-3 px-4" scope="col">Result</th>
                <th className="ui-label separator-bottom text-left surface-box text-subtle py-3 px-4" scope="col">Duration</th>
                <th className="ui-label separator-bottom text-left surface-box text-subtle py-3 px-4" scope="col">Score</th>
                <th className="ui-label separator-bottom text-left surface-box text-subtle py-3 px-4" scope="col">Change</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="border-b border-border-subtle last:border-0 hover:bg-surface-box transition-colors">
                  <td className="py-4 px-4 text-sm">{session.date}</td>
                  <td className="py-4 px-4 text-sm font-semibold">{session.game}</td>
                  <td className="py-4 px-4 text-sm text-muted">{session.result}</td>
                  <td className="py-4 px-4 text-sm text-muted">{session.duration}</td>
                  <td className="py-4 px-4 text-sm">{session.score}</td>
                  <td className={`py-4 px-4 text-sm font-semibold ${session.changeIsPositive ? 'text-brand-primary' : 'text-danger'}`}>
                    {session.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="stat-table__foot margin-none separator-top font-xs leading-md text-muted p-4">
          Showing the last 4 sessions.
        </p>
      </div>
    </section>
  );
}
