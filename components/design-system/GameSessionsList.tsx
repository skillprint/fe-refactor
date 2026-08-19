import React from 'react';
import Link from 'next/link';

export interface SessionRecord {
  id: string;
  gameTitle: string;
  gameSlug: string;
  iconArt: string;
  timestamp: string; // e.g. "Today 09:14"
  duration: string; // e.g. "8 min"
  skillRead: string; // e.g. "Timing"
  score: string; // e.g. "1,240"
}

const SESSIONS_DATA: SessionRecord[] = [
  {
    id: 's1',
    gameTitle: 'Snake Attack',
    gameSlug: 'snake-attack',
    iconArt: '/assets/design-system/game-art/game-snake-attack.svg',
    timestamp: 'Today 09:14',
    duration: '8 min',
    skillRead: 'Timing',
    score: '1,240',
  },
  {
    id: 's2',
    gameTitle: 'Hextris',
    gameSlug: 'hextris',
    iconArt: '/assets/design-system/game-art/game-hextris.svg',
    timestamp: 'Sunday 20:35',
    duration: '9 min',
    skillRead: 'Pattern Matching',
    score: '980',
  },
  {
    id: 's3',
    gameTitle: 'Gummy Blocks',
    gameSlug: 'gummy-blocks',
    iconArt: '/assets/design-system/game-art/game-gummy-blocks.svg',
    timestamp: 'Sunday 20:02',
    duration: '10 min',
    skillRead: 'Planning',
    score: '1,510',
  },
  {
    id: 's4',
    gameTitle: 'Box Tower',
    gameSlug: 'box-tower',
    iconArt: '/assets/design-system/game-art/game-box-tower.svg',
    timestamp: 'Saturday 11:40',
    duration: '7 min',
    skillRead: 'Planning',
    score: '640',
  },
  {
    id: 's5',
    gameTitle: 'Space Trip',
    gameSlug: 'space-trip',
    iconArt: '/assets/design-system/game-art/game-space-trip.svg',
    timestamp: 'Friday 18:12',
    duration: '9 min',
    skillRead: 'Visualization',
    score: '1,065',
  },
  {
    id: 's6',
    gameTitle: 'Sweet Memory',
    gameSlug: 'sweet-memory',
    iconArt: '/assets/design-system/game-art/game-memory.svg',
    timestamp: 'Thursday 08:47',
    duration: '8 min',
    skillRead: 'Deduction',
    score: '1,120',
  },
  {
    id: 's7',
    gameTitle: 'I Love Hue',
    gameSlug: 'i-love-hue',
    iconArt: '/assets/design-system/game-art/game-color-palette.svg',
    timestamp: '10 August 21:05',
    duration: '11 min',
    skillRead: 'Deduction',
    score: '890',
  },
  {
    id: 's8',
    gameTitle: 'Ultimate Sudoku',
    gameSlug: 'ultimate-sudoku',
    iconArt: '/assets/design-system/game-art/game-pastime.svg',
    timestamp: '3 August 19:30',
    duration: '10 min',
    skillRead: 'Deduction',
    score: '760',
  },
];

export const GameSessionsList: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`pp-sessions sp-panel ${className}`}>
      <div className="pp-sessions__head separator-bottom pb-4 mb-4 border-b border-slate-800 flex items-center justify-between wrap gap-lg">
        <div className="min-width-0">
          <h3 className="font-semibold text-lg text-slate-100">All sessions</h3>
          <p className="margin-none text-muted font-sm text-sm text-slate-400">Eight sessions across four weeks, 1h 12m of play.</p>
        </div>
        <span className="pp-played radius-full px-3 py-1 bg-slate-800/80 rounded-full flex items-center gap-2 text-xs font-semibold text-slate-300">
          Games played <strong className="text-white font-bold">8</strong>
        </span>
      </div>

      <ul className="pp-session-list space-y-3 margin-none padding-none list-none max-h-[500px] overflow-y-auto pr-1">
        {SESSIONS_DATA.map(session => (
          <li key={session.id} className="pp-session">
            <Link
              className="pp-session__link flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 transition-colors"
              href={`/game/${session.gameSlug}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <img className="pp-session__icon w-10 h-10 rounded-lg object-cover bg-slate-800" src={session.iconArt} alt="" />
                <div className="min-width-0">
                  <p className="margin-none weight-semibold font-semibold text-slate-100 text-sm">{session.gameTitle}</p>
                  <p className="margin-none text-muted font-sm leading-sm text-xs text-slate-400 mt-0.5">
                    {session.timestamp} · {session.duration} · {session.skillRead}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="pp-session__score text-right">
                  <strong className="block font-mono text-base font-bold text-slate-100">{session.score}</strong>
                  <span className="ui-label block text-[10px] uppercase font-mono tracking-wider text-slate-400">Score</span>
                </div>
                <svg className="sp-icon sp-icon--sm sp-icon--muted text-slate-500 w-4 h-4" aria-hidden="true" viewBox="0 0 24 24">
                  <use href="/assets/design-system/icons/sprite.svg#ti-chevron-right"></use>
                </svg>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameSessionsList;
