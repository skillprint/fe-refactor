'use client';

import React, { useState, useMemo } from 'react';
import { AIModel } from '../models/types';

interface LeaderboardTableProps {
  models: (AIModel & { displayedScore: number; displayedCost: number })[];
  selectedModelId: string | null;
  onSelectModel: (id: string) => void;
  activeGame: string;
  activeMood: string;
}

type SortField = 'name' | 'provider' | 'type' | 'score' | 'cost' | 'fps';

export default function LeaderboardTable({
  models,
  selectedModelId,
  onSelectModel,
  activeGame,
  activeMood
}: LeaderboardTableProps) {
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to descending
    }
  };

  const sortedModels = useMemo(() => {
    const sorted = [...models];
    sorted.sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;

      switch (sortField) {
        case 'name':
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case 'provider':
          valA = a.provider.toLowerCase();
          valB = b.provider.toLowerCase();
          break;
        case 'type':
          valA = a.type.toLowerCase();
          valB = b.type.toLowerCase();
          break;
        case 'score':
          valA = a.displayedScore;
          valB = b.displayedScore;
          break;
        case 'cost':
          valA = a.displayedCost;
          valB = b.displayedCost;
          break;
        case 'fps':
          valA = a.vlmFramesPerSec;
          valB = b.vlmFramesPerSec;
          break;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [models, sortField, sortDirection]);

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="opacity-25 ml-1">⇅</span>;
    return sortDirection === 'asc' ? <span className="text-indigo-400 ml-1">▲</span> : <span className="text-indigo-400 ml-1">▼</span>;
  };

  return (
    <div className="w-full bg-slate-950/45 border border-slate-900 rounded-2xl p-4 md:p-6 backdrop-blur-md overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Benchmark Leaderboard</h3>
          <p className="text-[11px] text-slate-500">
            Model rankings evaluated on {activeGame === 'all' ? 'All Games' : activeGame.replace('_', ' ')} (
            {activeMood === 'all' ? 'All Moods' : activeMood}).
          </p>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800 font-mono">
          Count: {models.length} Models
        </span>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
              <th className="pb-3 pl-2 w-12 text-center">Rank</th>
              <th className="pb-3 cursor-pointer select-none hover:text-white" onClick={() => handleSort('name')}>
                Model <SortIndicator field="name" />
              </th>
              <th className="pb-3 cursor-pointer select-none hover:text-white" onClick={() => handleSort('provider')}>
                Provider <SortIndicator field="provider" />
              </th>
              <th className="pb-3 cursor-pointer select-none hover:text-white" onClick={() => handleSort('type')}>
                Type <SortIndicator field="type" />
              </th>
              <th className="pb-3 cursor-pointer select-none hover:text-white text-center" onClick={() => handleSort('score')}>
                Score <SortIndicator field="score" />
              </th>
              <th className="pb-3 cursor-pointer select-none hover:text-white text-center" onClick={() => handleSort('cost')}>
                Move Cost <SortIndicator field="cost" />
              </th>
              <th className="pb-3 cursor-pointer select-none hover:text-white text-center" onClick={() => handleSort('fps')}>
                Speed <SortIndicator field="fps" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/60">
            {sortedModels.map((model, idx) => {
              // Calculate actual rank based on sorted list or overallScore sorting position
              // Since sorting changes order, let's keep index as list position for rank if sorted by score desc,
              // or find its score-based ranking position.
              const overallRank = idx + 1;
              const isSelected = model.id === selectedModelId;

              return (
                <tr
                  key={model.id}
                  onClick={() => onSelectModel(model.id)}
                  className={`cursor-pointer transition-all duration-200 hover:bg-slate-900/40 ${
                    isSelected ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500 border-y border-y-indigo-500/20' : ''
                  }`}
                >
                  <td className="py-3.5 pl-2 font-mono font-bold text-center text-slate-400">
                    {isSelected ? (
                      <span className="text-indigo-400">⚡</span>
                    ) : (
                      `#${overallRank}`
                    )}
                  </td>
                  <td className="py-3.5 font-bold text-white">
                    {model.name}
                  </td>
                  <td className="py-3.5 text-slate-400">
                    {model.provider}
                  </td>
                  <td className="py-3.5">
                    {model.type === 'reasoning' && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        Reasoning
                      </span>
                    )}
                    {model.type === 'vision_agent' && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Vision Agent
                      </span>
                    )}
                    {model.type === 'base_llm' && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        Base LLM
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 text-center font-mono font-bold text-emerald-400 text-sm">
                    {model.displayedScore}%
                  </td>
                  <td className="py-3.5 text-center font-mono text-amber-400 font-semibold">
                    ${model.displayedCost.toFixed(2)}
                  </td>
                  <td className="py-3.5 text-center font-mono text-sky-400 font-semibold">
                    {model.vlmFramesPerSec} FPS
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
