'use client';

import React from 'react';

interface GameCardsProps {
  activeGame: string;
  onSelectGame: (gameId: string) => void;
}

export default function GameCards({ activeGame, onSelectGame }: GameCardsProps) {
  const gamesList = [
    {
      id: 'colorize',
      name: 'Colorize',
      mood: 'Relax',
      colorClass: 'border-emerald-500/20 hover:border-emerald-500/80 text-emerald-400 bg-emerald-500/5',
      accentColor: '#05DF91',
      description: 'A soothing flood-fill color matching game. Players must unify a fragmented board by selecting adjacent colors within a move limit.',
      cognitiveTraits: ['Pattern Matching', 'De-stressing Logic', 'Patience'],
      details: {
        density: 'Low (1 action / 3s)',
        complexity: 'O(N) State Pathing',
        aiBaseline: '85.4% (Gemini 1.5 Pro)'
      },
      svgIcon: (
        <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none">
          <rect x="10" y="10" width="35" height="35" rx="4" fill="#05DF91" fillOpacity="0.8" />
          <rect x="55" y="10" width="35" height="35" rx="4" fill="#543DEB" fillOpacity="0.8" />
          <rect x="10" y="55" width="35" height="35" rx="4" fill="#26B8FF" fillOpacity="0.8" />
          <rect x="55" y="55" width="35" height="35" rx="4" fill="#05DF91" fillOpacity="0.8" />
          <circle cx="50" cy="50" r="14" fill="#ffffff" className="animate-pulse" />
        </svg>
      )
    },
    {
      id: 'hextris',
      name: 'Hextris',
      mood: 'Focus',
      colorClass: 'border-indigo-500/20 hover:border-indigo-500/80 text-indigo-400 bg-indigo-500/5',
      accentColor: '#543DEB',
      description: 'A rapid, hexagonal puzzle game. Blocks of various colors fall from the outer edges, requiring fast rotation to stack and clear color groups.',
      cognitiveTraits: ['Spatial Processing', 'Attentional Focus', 'Reaction Speed'],
      details: {
        density: 'High (4+ actions / s)',
        complexity: 'Real-time VLM feedback',
        aiBaseline: '92.1% (o1-pro)'
      },
      svgIcon: (
        <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none">
          <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" stroke="#543DEB" strokeWidth="3" fill="none" />
          <polygon points="50,25 73,38 73,62 50,75 27,62 27,38" fill="#543DEB" fillOpacity="0.2" />
          <circle cx="50" cy="50" r="8" fill="#543DEB" />
          <line x1="50" y1="5" x2="50" y2="95" stroke="#543DEB" strokeWidth="0.5" strokeDasharray="3 3" />
        </svg>
      )
    },
    {
      id: 'box_tower',
      name: 'Box Tower',
      mood: 'Creativity',
      colorClass: 'border-sky-500/20 hover:border-sky-500/80 text-sky-400 bg-sky-500/5',
      accentColor: '#26B8FF',
      description: 'A physics-driven tower stacking challenge. Swing boxes via a pendulum and release them at correct anchor offsets to build the highest structure.',
      cognitiveTraits: ['Trajectory Planning', 'Mass Equilibrium', 'Adaptation'],
      details: {
        density: 'Medium (1 action / 1.5s)',
        complexity: 'Momentum & Wind telemetry',
        aiBaseline: '88.5% (Claude 3.7)'
      },
      svgIcon: (
        <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none">
          <rect x="25" y="70" width="50" height="15" rx="2" fill="#26B8FF" fillOpacity="0.4" stroke="#26B8FF" strokeWidth="2" />
          <rect x="30" y="52" width="40" height="15" rx="2" fill="#26B8FF" fillOpacity="0.6" stroke="#26B8FF" strokeWidth="2" />
          <rect x="38" y="34" width="32" height="15" rx="2" fill="#26B8FF" fillOpacity="0.8" stroke="#26B8FF" strokeWidth="2" />
          <line x1="50" y1="0" x2="54" y2="28" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="1 1" />
          <rect x="42" y="22" width="20" height="10" rx="1" fill="#ff4f8e" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {gamesList.map((game) => {
        const isActive = activeGame === game.id;
        
        return (
          <div
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            className={`border rounded-2xl p-5 md:p-6 backdrop-blur-md cursor-pointer transition-all duration-300 flex flex-col justify-between hover:scale-[1.01] ${
              isActive 
                ? `bg-slate-900/40 shadow-xl border-l-4` 
                : 'bg-slate-950/20 hover:bg-slate-950/45 border-slate-900/60'
            }`}
            style={{
              borderColor: isActive ? game.accentColor : undefined,
              borderLeftColor: isActive ? game.accentColor : undefined,
              boxShadow: isActive ? `0 10px 20px -10px ${game.accentColor}33` : undefined
            }}
          >
            <div>
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-900">
                  {game.svgIcon}
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${game.colorClass}`}>
                  {game.mood}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-extrabold text-white mb-2">{game.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{game.description}</p>

              {/* Cognitive Traits */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {game.cognitiveTraits.map((trait) => (
                  <span
                    key={trait}
                    className="text-[9px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 font-medium"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Performance Grid */}
            <div className="border-t border-slate-900/80 pt-4 mt-auto">
              <div className="grid grid-cols-3 gap-2 text-[10px] mb-4">
                <div>
                  <div className="text-slate-500 font-medium">Action Density</div>
                  <div className="text-slate-300 font-bold mt-0.5 font-mono">{game.details.density}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Complexity</div>
                  <div className="text-slate-300 font-bold mt-0.5 font-mono">{game.details.complexity}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Top AI Accuracy</div>
                  <div className="text-slate-300 font-bold mt-0.5 font-mono text-right">{game.details.aiBaseline}</div>
                </div>
              </div>

              <button
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all active:scale-98 text-center flex items-center justify-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-slate-950 shadow-md'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                }`}
              >
                {isActive ? (
                  <>
                    <span className="flex h-1.5 w-1.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: game.accentColor }} />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: game.accentColor }} />
                    </span>
                    Inspecting Game Telemetry
                  </>
                ) : (
                  'Analyze Game Results'
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
