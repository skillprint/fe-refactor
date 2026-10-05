import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar as RechartsBar,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  CartesianGrid as RechartsCartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer as RechartsResponsiveContainer
} from 'recharts';

interface ProfileGameInsightsProps {
  uniqueGames: any[];
  selectedGames: string[];
  setSelectedGames: (slugs: string[]) => void;
  isMetricsLoading: boolean;
  metricsData: any;
  parsedChartData: any[];
  formatSecondsToDuration: (sec: number) => string;
}

export default function ProfileGameInsights({
  uniqueGames,
  selectedGames,
  setSelectedGames,
  isMetricsLoading,
  metricsData,
  parsedChartData,
  formatSecondsToDuration
}: ProfileGameInsightsProps) {
  return (
    <section className="pp-section" id="games">
      <div className="section-head pp-head layout-flex wrap items-end justify-between gap-2xl">
        <div className="section-head-copy">
          <h2>Performance by game</h2>
          <p className="margin-none text-muted">Pick one or more games to see how you score when you play them.</p>
        </div>
        <div className="cluster gap-md">
          <button 
            className="button button--secondary button--sm" 
            onClick={() => setSelectedGames(uniqueGames.map(g => g.slug))}
            type="button"
          >
            <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-check"></use></svg>
            Select all
          </button>
          <button 
            className="button button--tertiary button--sm" 
            onClick={() => setSelectedGames([])}
            type="button"
          >
            <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-close"></use></svg>
            Clear all
          </button>
        </div>
      </div>

      <div className="pp-game-filters cluster wrap gap-md mb-6" data-pp-game-list role="group" aria-label="Games" data-pp-chips>
        {uniqueGames.length === 0 ? (
           <p className="text-sm text-muted-foreground">Loading games...</p>
        ) : (
          uniqueGames.map((game) => {
            const isSelected = selectedGames.includes(game.slug);
            return (
              <button
                key={game.slug}
                aria-pressed={isSelected}
                className={`ui-tag ${isSelected ? 'is-selected' : ''}`}
                onClick={() => {
                  if (isSelected) {
                    setSelectedGames(selectedGames.filter(slug => slug !== game.slug));
                  } else {
                    setSelectedGames([...selectedGames, game.slug]);
                  }
                }}
                type="button"
              >
                <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-gamepad"></use></svg>
                {game.name}
              </button>
            )
          })
        )}
      </div>

      <div className="pp-insight sp-panel">
        <div className="pp-insight__head">
          <span className="ui-label">Selected games</span>
          <strong className="pp-insight__title" data-pp-game-title>
             {selectedGames.length === 0 ? 'None selected' : selectedGames.length === uniqueGames.length ? 'All Games' : `${selectedGames.length} Games Selected`}
          </strong>
          <p className="pp-insight__note">Your cognition and mood scores, averaged across the games you picked.</p>
        </div>
        
        {isMetricsLoading ? (
          <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : !metricsData || selectedGames.length === 0 ? (
          <div className="p-8 text-center">
            <p className="empty-state text-muted font-sm">Select one or more games above to view metrics.</p>
          </div>
        ) : (
          <>
            <div className="pp-insight__stats">
              <div className="metric-card sp-card">
                <div className="metric-card-head cluster items-center gap-md">
                  <svg className="sp-icon sp-icon--sm sp-icon--brand" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-gamepad"></use></svg>
                  <span className="ui-label">Sessions played</span>
                </div>
                <strong className="metric-value layout-block" data-pp-stat="sessions">{metricsData.sessionCount || 0}</strong>
              </div>
              <div className="metric-card sp-card">
                <div className="metric-card-head cluster items-center gap-md">
                  <svg className="sp-icon sp-icon--sm sp-icon--brand" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-clock"></use></svg>
                  <span className="ui-label">Total playtime</span>
                </div>
                <strong className="metric-value layout-block" data-pp-stat="time">{formatSecondsToDuration(metricsData.totalPlayTimeSeconds || 0)}</strong>
              </div>
              <div className="metric-card sp-card">
                <div className="metric-card-head cluster items-center gap-md">
                  <svg className="sp-icon sp-icon--sm sp-icon--brand" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-trending"></use></svg>
                  <span className="ui-label">Average flow score</span>
                </div>
                <strong className="metric-value layout-block" data-pp-stat="flow">
                  {metricsData.flow && typeof metricsData.flow.avgScore === 'number'
                    ? `${Math.round(metricsData.flow.avgScore * 100)}%`
                    : '—'}
                </strong>
              </div>
            </div>
            <div className="pp-insight__chart">
               {parsedChartData.length === 0 ? (
                  <p className="empty-state text-muted font-sm" data-pp-game-empty>Select one or more games above to view metrics.</p>
               ) : (
                  <div className="chart-frame compact h-[320px]" data-pp-game-chart>
                    <RechartsResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={parsedChartData}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                      >
                        <RechartsCartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                        <RechartsXAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} />
                        <RechartsYAxis dataKey="name" type="category" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={{ stroke: 'var(--border)' }} width={80} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: 'var(--card)',
                            borderColor: 'var(--border)',
                            color: 'var(--foreground)',
                            borderRadius: '0.75rem',
                          }}
                        />
                        <RechartsBar dataKey="score" fill="var(--primary)" fillOpacity={0.85} radius={[0, 4, 4, 0]} maxBarSize={20} />
                      </RechartsBarChart>
                    </RechartsResponsiveContainer>
                  </div>
               )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
