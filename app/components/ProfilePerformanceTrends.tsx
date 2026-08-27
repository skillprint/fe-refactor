'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import DynamicChart from '../visualize/components/DynamicChart';
import { generateSyntheticData, DataPoint } from '../visualize/utils/syntheticData';

const PILLAR_DIMENSIONS = {
  Mood: ['relax', 'grit', 'focus', 'collaborate', 'empathy', 'creativity', 'joy', 'curiosity', 'awe'],
  Cognition: ['pattern_matching', 'attention', 'memory', 'planning', 'task_switching', 'math', 'deduction', 'visualization', 'verbal', 'timing', 'perceptual_speed', 'knowledge', 'action', 'spatial'],
  Personality: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'emotional_stability']
};

const PILLAR_MODELS = {
  Mood: 'MoodData',
  Cognition: 'CognitionData',
  Personality: 'PersonalityData'
};

export default function ProfilePerformanceTrends() {
  const [selectedPillar, setSelectedPillar] = useState<'Mood' | 'Cognition' | 'Personality'>('Mood');
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>(['focus']);
  const [comparePeriods, setComparePeriods] = useState<number>(1);
  const [chartType, setChartType] = useState<'BarLine' | 'Area'>('BarLine');
  const [chartData, setChartData] = useState<DataPoint[]>([]);

  // Reset selected dimensions when pillar changes
  useEffect(() => {
    if (selectedPillar === 'Mood') {
      setSelectedDimensions(['focus']);
    } else if (selectedPillar === 'Cognition') {
      setSelectedDimensions(['pattern_matching']);
    } else if (selectedPillar === 'Personality') {
      setSelectedDimensions(['openness']);
    }
  }, [selectedPillar]);

  // Generate chart data when parameters change
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);

    if (selectedDimensions.length > 0) {
      const data = generateSyntheticData({
        modelName: PILLAR_MODELS[selectedPillar],
        selectedFields: selectedDimensions,
        chartType: chartType,
        startDate: start,
        endDate: end,
        comparePeriods: comparePeriods,
        compareCohort: false
      });
      setChartData(data);
    } else {
      setChartData([]);
    }
  }, [comparePeriods, chartType, selectedPillar, selectedDimensions]);

  const toggleDimension = (dim: string) => {
    const isSelected = selectedDimensions.includes(dim);
    if (isSelected) {
      if (selectedDimensions.length > 1) {
        setSelectedDimensions(selectedDimensions.filter(d => d !== dim));
      } else {
        toast.error('At least one metric must be selected.');
      }
    } else {
      if (selectedDimensions.length < 4) {
        setSelectedDimensions([...selectedDimensions, dim]);
      } else {
        toast.error('You can select a maximum of 4 metrics to compare.');
      }
    }
  };

  return (
    <section className="pp-section" id="trends">
      <div className="section-head pp-head layout-flex wrap items-end justify-between gap-2xl">
        <div className="section-head-copy">
          <h2>Performance trends</h2>
          <p className="margin-none text-muted">
            Track your cognitive, mood, and personality metrics over time.
          </p>
        </div>
        <div className="pp-toolbar cluster wrap items-center gap-lg" data-state-when="semi complete">
          <div className="status-tabs layout-inline-flex" role="group" aria-label="Dimension">
            {(['Mood', 'Cognition', 'Personality'] as const).map((pillar) => (
              <button
                key={pillar}
                type="button"
                aria-pressed={selectedPillar === pillar}
                className="status-tab"
                onClick={() => setSelectedPillar(pillar)}
              >
                {pillar}
              </button>
            ))}
          </div>
          <div className="chart-view-switch layout-inline-flex" role="group" aria-label="Chart type">
            <button aria-pressed={chartType === 'BarLine'} className={chartType === 'BarLine' ? 'is-active' : ''} onClick={() => setChartType('BarLine')} type="button">Bar &amp; Lines</button>
            <button aria-pressed={chartType === 'Area'} className={chartType === 'Area' ? 'is-active' : ''} onClick={() => setChartType('Area')} type="button">Area Chart</button>
          </div>
          <div className="field pp-compare" data-size="sm">
            <label htmlFor="ppCompare">Compare:</label>
            <select id="ppCompare" name="compare" value={comparePeriods} onChange={(e) => setComparePeriods(parseInt(e.target.value, 10))}>
              <option value={0}>None</option>
              <option value={1}>Last week</option>
              <option value={2}>Last 2 weeks</option>
              <option value={3}>Last 3 weeks</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pp-trend-filters sp-panel padding-md margin-bottom-lg">
        <div className="filter-group">
          <span className="ui-label filter-label">{selectedPillar} metrics</span>
          <div className="filters cluster wrap gap-md">
            {PILLAR_DIMENSIONS[selectedPillar].map((dim) => {
              const isSelected = selectedDimensions.includes(dim);
              return (
                <button
                  key={dim}
                  type="button"
                  className={`chart-chip ${isSelected ? 'is-active' : ''}`}
                  onClick={() => toggleDimension(dim)}
                >
                  <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24">
                    <use href={`#ti-${selectedPillar.toLowerCase()}-${dim.replace('_', '-')}`}></use>
                  </svg>
                  {dim.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              );
            })}
          </div>
        </div>
        <p className="field__help pp-metric-note margin-none text-muted font-xs mt-4">
          Pick up to four metrics. The compare series traces the same first metric in an earlier week.
        </p>
      </div>

      <article className="chart-card sp-card min-width-0">
        <div className="chart-card-head">
          <div className="chart-card-title">
            <span className="theme-label">{selectedPillar}</span>
            <strong>{selectedDimensions.length > 0 ? selectedDimensions.map(d => d.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')).join(' and ') : 'No metrics selected'}, last 7 days</strong>
          </div>
          <div className="chart-actions layout-inline-flex">
            <button
              type="button"
              aria-pressed={chartType === 'BarLine'}
              className="chart-action"
              onClick={() => setChartType('BarLine')}
            >
              Bar & Lines
            </button>
            <button
              type="button"
              aria-pressed={chartType === 'Area'}
              className="chart-action"
              onClick={() => setChartType('Area')}
            >
              Area
            </button>
          </div>
        </div>
        <div className="chart-frame p-4 h-[400px]">
          {chartData.length > 0 ? (
            <DynamicChart
              data={chartData}
              type={chartType}
              selectedFields={selectedDimensions}
              comparePeriods={comparePeriods}
              compareCohort={false}
              yAxisLabel="score"
            />
          ) : (
            <div className="portal-blank" data-state-when="first">
              <span className="sp-icon-frame sp-icon-frame--md no-grow" aria-hidden="true">
                <svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24"><use href="#ti-gamepad"></use></svg>
              </span>
              <p className="portal-blank__title">Nothing to plot yet</p>
              <p className="portal-blank__note">This is the empty chart your scores will draw across. Play a game and the first week appears.</p>
              <a className="button button--secondary button--sm" href="/games">Play a game <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-right"></use></svg></a>
            </div>
          )}
        </div>
        
        <div className="chart-key" data-pp-trend-key="" data-state-when="semi complete"></div>
      </article>

      <article className="chart-card sp-card min-width-0">
        <div className="chart-card-head">
          <div className="chart-card-title">
            <span className="theme-label">Weekly wheel</span>
            <strong>Your skills this week</strong>
            <span>One dimension at a time, against your four-week average. Select a point for the skill behind it.</span>
          </div>
          <div className="chart-actions status-tabs layout-inline-flex" role="group" aria-label="Dimension">
            <button aria-pressed="true" className="status-tab" data-pp-view="mood" type="button">Mood</button>
            <button aria-pressed="false" className="status-tab" data-pp-view="cognition" type="button">Cognition</button>
            <button aria-pressed="false" className="status-tab" data-pp-view="personality" type="button">Personality</button>
            <button aria-pressed="false" className="status-tab" data-pp-view="sessions" type="button">Sessions</button>
          </div>
        </div>
        
        <div className="chart-frame" data-pp-orbit="" id="ppOrbit"></div>
        
        <div className="portal-blank" data-state-when="first">
          <span className="sp-icon-frame sp-icon-frame--md no-grow" aria-hidden="true"><svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24"><use href="#ti-gamepad"></use></svg></span>
          <p className="portal-blank__title">No skill has a score yet</p>
          <p className="portal-blank__note">Each spoke is one skill. A finished game puts a point on the skills it measured.</p>
          <a className="button button--secondary button--sm" href="/games">Play a game <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-right"></use></svg></a>
        </div>

        <div className="chart-key" data-state-when="semi complete">
          <span className="key-item" data-series="mood"><i></i>Mood</span>
          <span className="key-item" data-series="cognition"><i></i>Cognition</span>
          <span className="key-item" data-series="personality"><i></i>Personality</span>
          <span className="key-item" data-series="baseline"><i></i>Baseline</span>
        </div>
        <div className="pp-orbit-detail" data-orbit-detail aria-live="polite">
          <p className="pp-orbit-detail__empty margin-none text-muted font-sm" data-orbit-empty data-state-text="orbitDetailEmpty">Select a point on the wheel for that skill&apos;s score.</p>
        </div>
        <p className="chart-insight" data-state-when="semi complete" data-state-text="orbitInsight"><span className="insight-dot" aria-hidden="true"></span>Focus and Pattern Matching carry this week. Relax is the only mood below its four-week baseline.</p>
      </article>
    </section>
  );
}
