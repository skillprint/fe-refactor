'use client';

import React, { useState, useEffect } from 'react';
import DynamicChart from '@/app/visualize/components/DynamicChart';
import { generateSyntheticData, DataPoint } from '@/app/visualize/utils/syntheticData';
import { getSkillById } from '@/lib/skillsData';

interface SkillTrendSectionProps {
  skillId: string;
}

const PILLAR_MODELS: Record<string, string> = {
  mood: 'MoodData',
  cognition: 'CognitionData',
  personality: 'PersonalityData'
};

export function SkillTrendSection({ skillId }: SkillTrendSectionProps) {
  const [range, setRange] = useState<number>(3); // Default: Last 3 weeks
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const skill = getSkillById(skillId);

  useEffect(() => {
    if (!skill) return;

    const end = new Date();
    const start = new Date();
    // Assuming range is weeks: 1 = 7 days, 2 = 14 days, 3 = 21 days
    start.setDate(start.getDate() - (range * 7 - 1)); 

    const data = generateSyntheticData({
      modelName: PILLAR_MODELS[skill.dimension] || 'CognitionData',
      selectedFields: [skill.id.replace('-', '_')],
      chartType: 'Line',
      startDate: start,
      endDate: end,
      comparePeriods: 0,
      compareCohort: false
    });
    setChartData(data);
  }, [skillId, range, skill]);

  if (!skill) return null;

  return (
    <section aria-labelledby="trendTitle" className="stat-section separator-top" id="progression">
      <div className="stat-section__head layout-flex items-end justify-between gap-2xl wrap">
        <div className="min-width-0">
          <span className="eyebrow eyebrow--compact">Progression</span>
          <h2 className="portal-section__title" id="trendTitle">How it has changed</h2>
        </div>
        <div className="layout-inline-flex button-group no-grow padding-none" role="group">
          <button 
            aria-pressed={range === 1} 
            className={`button-group__item ${range === 1 ? 'is-active' : ''}`} 
            onClick={() => setRange(1)} 
            type="button"
          >
            Last week
          </button>
          <button 
            aria-pressed={range === 2} 
            className={`button-group__item ${range === 2 ? 'is-active' : ''}`} 
            onClick={() => setRange(2)} 
            type="button"
          >
            Last 2 weeks
          </button>
          <button 
            aria-pressed={range === 3} 
            className={`button-group__item ${range === 3 ? 'is-active' : ''}`} 
            onClick={() => setRange(3)} 
            type="button"
          >
            Last 3 weeks
          </button>
        </div>
      </div>
      
      <p className="stat-section__lede margin-none text-muted">
        Your progression for {skill.name} over the selected timeframe.
      </p>

      <div className="stat-trends layout-grid gap-2xl items-start mt-6">
        <div className="stat-trend sp-panel">
          <div className="stat-trend__head layout-flex items-start justify-between gap-lg wrap">
            <div className="min-width-0">
              <span className="ui-label layout-block">Change over period</span>
              <strong className="stat-trend__value layout-block">+24 pts</strong>
              <span className="layout-block font-sm text-muted">Upward trend</span>
            </div>
            <span className="ui-badge ui-badge--pill ui-badge--md ui-badge--leading stat-trend__badge">
              <svg className="ui-badge__icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-trending"></use></svg>
              <span>+12%</span>
            </span>
          </div>
          
          <div className="stat-trend__chart chart-frame padding-none h-[250px] mt-4">
             {chartData.length > 0 ? (
                <DynamicChart
                  data={chartData}
                  type="Line"
                  selectedFields={[skill.id.replace('-', '_')]}
                  comparePeriods={0}
                  compareCohort={false}
                  yAxisLabel="score"
                />
             ) : (
               <div className="flex items-center justify-center h-full text-muted">No data available</div>
             )}
          </div>
        </div>

        <div className="stat-weeks sp-panel">
          <p className="ui-label stat-weeks__title margin-none">Sessions per week</p>
          <ul className="stat-weeks__list margin-none padding-none layout-grid gap-lg mt-4">
            <li className="flex justify-between items-center text-sm">
              <span className="text-muted">This week</span>
              <span className="weight-semibold">4 sessions</span>
            </li>
            <li className="flex justify-between items-center text-sm">
              <span className="text-muted">Last week</span>
              <span className="weight-semibold">2 sessions</span>
            </li>
            <li className="flex justify-between items-center text-sm">
              <span className="text-muted">2 weeks ago</span>
              <span className="weight-semibold">5 sessions</span>
            </li>
          </ul>
          <div className="stat-weeks__foot streak-row cluster justify-between separator-top text-muted font-sm mt-4 pt-4">
            <span className="layout-inline-flex items-center gap-md">
              <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-calendar"></use></svg>
              <span>3-week streak</span>
            </span>
            <div className="streak-days layout-flex gap-sm">
              <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
              <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
              <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
