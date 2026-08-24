import React from 'react';

export interface ThisWeekRailCardProps {
  weekLabel?: string; // e.g. "Week 29"
  completionPercentage?: number; // e.g. 75
  streakDaysCount?: number; // e.g. 4
  daysStatus?: boolean[]; // [true, true, true, true, false, false, false]
  className?: string;
}

export const ThisWeekRailCard: React.FC<ThisWeekRailCardProps> = ({
  weekLabel = 'Week 29',
  completionPercentage = 75,
  streakDaysCount = 4,
  daysStatus = [true, true, true, true, false, false, false],
  className = '',
}) => {
  const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <article className={`rail-card sp-card p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 ${className}`} aria-labelledby="summaryTitle">
      <div className="rail-card__head flex items-center justify-between">
        <span className="rail-card__label font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold" id="summaryTitle">
          THIS WEEK
        </span>
        <span className="ui-badge ui-badge--sm px-2.5 py-0.5 bg-slate-800/90 border border-slate-700/80 rounded-full text-xs text-slate-300 font-medium">
          {weekLabel}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Skillprint complete</span>
          <span className="font-bold text-slate-100">{completionPercentage}%</span>
        </div>
        <div className="rail-meter w-full h-2 bg-slate-800/80 rounded-full overflow-hidden" role="img" aria-label={`Skillprint complete ${completionPercentage}%`}>
          <div className="h-full bg-[#00e58d] rounded-full transition-all duration-300" style={{ width: `${completionPercentage}%` }}></div>
        </div>
      </div>

      <div className="pt-3.5 mt-3 border-t border-slate-800 flex items-center justify-between wrap gap-2 text-sm">
        <span className="text-slate-400">{streakDaysCount}-day streak</span>
        <div className="pp-streak-days flex items-center gap-1.5">
          {dayLetters.map((letter, idx) => {
            const isDone = daysStatus[idx] ?? idx < streakDaysCount;
            return (
              <span
                key={idx}
                className={`day w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  isDone
                    ? 'done bg-[#00e58d] text-[#0d121f] font-bold'
                    : 'border border-slate-700/80 text-slate-400 bg-slate-900/40'
                }`}
              >
                {letter}
              </span>
            );
          })}
        </div>
      </div>
    </article>
  );
};

export default ThisWeekRailCard;
