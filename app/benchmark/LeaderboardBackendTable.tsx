'use client';

import React, { useState, useMemo } from 'react';
import { BenchmarkLeaderboardEntry } from './models/types';

interface LeaderboardBackendTableProps {
  entries: BenchmarkLeaderboardEntry[];
  selectedProviderKey: string | null;
  onSelectProvider: (key: string) => void;
  activeGame: string;
  activeMood: string;
}

type SortField = 'provider' | 'key' | 'sessions' | 'rating' | 'bayesianRating';

export default function LeaderboardBackendTable({
  entries,
  selectedProviderKey,
  onSelectProvider,
  activeGame,
  activeMood
}: LeaderboardBackendTableProps) {
  const [sortField, setSortField] = useState<SortField>('bayesianRating');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedEntries = useMemo(() => {
    const sorted = [...entries];
    sorted.sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;

      switch (sortField) {
        case 'provider':
          valA = a.providerDisplayName.toLowerCase();
          valB = b.providerDisplayName.toLowerCase();
          break;
        case 'key':
          valA = a.providerKey.toLowerCase();
          valB = b.providerKey.toLowerCase();
          break;
        case 'sessions':
          valA = a.totalSessions;
          valB = b.totalSessions;
          break;
        case 'bayesianRating':
          valA = a.bayesianAvgMoodRating ?? a.avgMoodRating;
          valB = b.bayesianAvgMoodRating ?? b.avgMoodRating;
          break;
        case 'rating':
          valA = a.avgMoodRating;
          valB = b.avgMoodRating;
          break;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [entries, sortField, sortDirection]);

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="opacity-25 ml-1">⇅</span>;
    return sortDirection === 'asc' ? <span className="text-indigo-400 ml-1">▲</span> : <span className="text-indigo-400 ml-1">▼</span>;
  };

  const renderRating = (rating: number, colorClass = 'text-emerald-400') => {
    return (
      <div className="flex flex-col items-center justify-center">
        <span className={`font-mono font-bold ${colorClass} text-sm`}>
          {rating.toFixed(2)} / 5.00
        </span>
      </div>
    );
  };

  return (
    <div className="w-full bg-slate-950/45 border border-slate-900 rounded-2xl p-4 md:p-6 backdrop-blur-md overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Backend Leaderboard</h3>
          <p className="text-[11px] text-slate-500">
            Real provider ratings computed from gameplay sessions for {activeGame === 'all' ? 'All Games' : activeGame.replace('_', ' ')} (
            {activeMood === 'all' ? 'All Moods' : activeMood}).
          </p>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800 font-mono">
          Count: {entries.length} Providers
        </span>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
              <th className="pb-3 pl-2 w-12 text-center">Rank</th>
              <th className="pb-3 cursor-pointer select-none hover:text-white" onClick={() => handleSort('provider')}>
                Provider <SortIndicator field="provider" />
              </th>
              <th className="pb-3 cursor-pointer select-none hover:text-white font-mono" onClick={() => handleSort('key')}>
                Key <SortIndicator field="key" />
              </th>
              <th className="pb-3 cursor-pointer select-none hover:text-white text-center" onClick={() => handleSort('sessions')}>
                Sessions Played <SortIndicator field="sessions" />
              </th>
              <th className="pb-3 cursor-pointer select-none hover:text-white text-center" onClick={() => handleSort('bayesianRating')}>
                Bayesian Rating <SortIndicator field="bayesianRating" />
              </th>
              <th className="pb-3 cursor-pointer select-none hover:text-white text-center" onClick={() => handleSort('rating')}>
                Avg Mood Rating <SortIndicator field="rating" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/60">
            {sortedEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 font-medium">
                  No sessions have been rated yet for these filters. Play a game below to populate the leaderboard!
                </td>
              </tr>
            ) : (
              sortedEntries.map((entry, idx) => {
                const isSelected = entry.providerKey === selectedProviderKey;
                const rank = idx + 1;

                return (
                  <tr
                    key={entry.providerKey}
                    onClick={() => onSelectProvider(entry.providerKey)}
                    className={`cursor-pointer transition-all duration-200 hover:bg-slate-900/40 ${isSelected ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500 border-y border-y-indigo-500/20' : ''
                      }`}
                  >
                    <td className="py-4 pl-2 font-mono font-bold text-center text-slate-400">
                      {isSelected ? (
                        <span className="text-indigo-400">⚡</span>
                      ) : (
                        `#${rank}`
                      )}
                    </td>
                    <td className="py-4 font-bold text-white">
                      {entry.providerDisplayName}
                    </td>
                    <td className="py-4 font-mono text-slate-400">
                      {entry.providerKey}
                    </td>
                    <td className="py-4 text-center font-mono font-semibold text-slate-300">
                      {entry.totalSessions}
                    </td>
                    <td className="py-4 text-center">
                      {renderRating(entry.bayesianAvgMoodRating ?? entry.avgMoodRating, 'text-emerald-400')}
                    </td>
                    <td className="py-4 text-center">
                      {renderRating(entry.avgMoodRating, 'text-slate-400')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
