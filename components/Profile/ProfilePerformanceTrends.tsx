import React, { useState } from 'react';
import { MockDataTag } from '../MockDataTag';

export default function ProfilePerformanceTrends() {
  const [pillar, setPillar] = useState('Mood');
  const [chartType, setChartType] = useState('BarLine');
  const [orbitView, setOrbitView] = useState('mood');

  return (
    <section className="pp-section" id="trends" style={{ position: 'relative' }}>
      <MockDataTag />
      <div className="section-head pp-head layout-flex wrap items-end justify-between gap-2xl">
        <div className="section-head-copy">
          <h2>Performance trends</h2>
          <p className="margin-none text-muted">
            How your Skillprint is moving. Pick mood, cognition or personality and follow it week by week.
          </p>
        </div>
        <div className="pp-toolbar cluster wrap items-center gap-lg" data-state-when="semi complete">
          <div className="status-tabs layout-inline-flex" role="group" aria-label="Dimension">
            <button aria-pressed={pillar === 'Mood'} className="status-tab" onClick={() => setPillar('Mood')} type="button">Mood</button>
            <button aria-pressed={pillar === 'Cognition'} className="status-tab" onClick={() => setPillar('Cognition')} type="button">Cognition</button>
            <button aria-pressed={pillar === 'Personality'} className="status-tab" onClick={() => setPillar('Personality')} type="button">Personality</button>
          </div>
          <div className="chart-view-switch layout-inline-flex" role="group" aria-label="Chart type">
            <button aria-pressed={chartType === 'BarLine'} className={chartType === 'BarLine' ? 'is-active' : ''} onClick={() => setChartType('BarLine')} type="button">Bar &amp; Lines</button>
            <button aria-pressed={chartType === 'Area'} className={chartType === 'Area' ? 'is-active' : ''} onClick={() => setChartType('Area')} type="button">Area Chart</button>
          </div>
          <div className="field pp-compare" data-size="sm">
            <label htmlFor="ppCompare">Compare:</label>
            <select id="ppCompare" name="compare" defaultValue="1">
              <option value="0">None</option>
              <option value="1">Last week</option>
              <option value="2">Last 2 weeks</option>
              <option value="3">Last 3 weeks</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pp-metric-bar filter-panel sp-card" data-pp-metrics="" data-state-when="semi complete">
        <div className="filter-group" data-pp-pillar-group="Mood" hidden={pillar !== 'Mood'}>
          <span className="ui-label filter-label">Mood metrics</span>
          <div className="filters cluster wrap gap-md">
            <button className="chart-chip is-active" data-pp-metric="focus" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-mood-focus"></use></svg>Focus</button>
            <button className="chart-chip is-active" data-pp-metric="grit" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-mood-grit"></use></svg>Grit</button>
            <button className="chart-chip" data-pp-metric="relax" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-mood-relax"></use></svg>Relax</button>
            <button className="chart-chip" data-pp-metric="collaborate" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-mood-collaborate"></use></svg>Collaborate</button>
            <button className="chart-chip" data-pp-metric="empathy" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-mood-empathy"></use></svg>Empathy</button>
            <button className="chart-chip" data-pp-metric="creativity" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-mood-creativity"></use></svg>Creativity</button>
            <button className="chart-chip" data-pp-metric="joy" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-mood-joy"></use></svg>Joy</button>
            <button className="chart-chip" data-pp-metric="curiosity" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-mood-curiosity"></use></svg>Curiosity</button>
            <button className="chart-chip" data-pp-metric="awe" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-mood-awe"></use></svg>Awe</button>
          </div>
        </div>
        <div className="filter-group" data-pp-pillar-group="Cognition" hidden={pillar !== 'Cognition'}>
          <span className="ui-label filter-label">Cognition metrics</span>
          <div className="filters cluster wrap gap-md">
            <button className="chart-chip is-active" data-pp-metric="pattern_matching" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-cognition-pattern-matching"></use></svg>Pattern Matching</button>
            <button className="chart-chip is-active" data-pp-metric="attention" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-cognition-attention"></use></svg>Attention</button>
            <button className="chart-chip" data-pp-metric="memory" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-cognition-memory"></use></svg>Memory</button>
            <button className="chart-chip" data-pp-metric="planning" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-cognition-planning"></use></svg>Planning</button>
            <button className="chart-chip" data-pp-metric="task_switching" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-cognition-task-switching"></use></svg>Task Switching</button>
            <button className="chart-chip" data-pp-metric="math" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-cognition-math"></use></svg>Math</button>
            <button className="chart-chip" data-pp-metric="deduction" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-cognition-deduction"></use></svg>Deduction</button>
            <button className="chart-chip" data-pp-metric="visualization" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-cognition-visualization"></use></svg>Visualization</button>
            <button className="chart-chip" data-pp-metric="verbal" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-cognition-verbal"></use></svg>Verbal</button>
            <button className="chart-chip" data-pp-metric="timing" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-cognition-timing"></use></svg>Timing</button>
            <button className="chart-chip" data-pp-metric="perceptual_speed" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-cognition-perceptual-speed"></use></svg>Perceptual Speed</button>
            <button className="chart-chip" data-pp-metric="knowledge" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-cognition-knowledge"></use></svg>Knowledge</button>
            <button className="chart-chip" data-pp-metric="action" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-cognition-action"></use></svg>Action</button>
            <button className="chart-chip" data-pp-metric="spatial" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-cognition-spatial"></use></svg>Spatial</button>
          </div>
        </div>
        <div className="filter-group" data-pp-pillar-group="Personality" hidden={pillar !== 'Personality'}>
          <span className="ui-label filter-label">Personality metrics</span>
          <div className="filters cluster wrap gap-md">
            <button className="chart-chip is-active" data-pp-metric="openness" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-personality-openness"></use></svg>Openness</button>
            <button className="chart-chip" data-pp-metric="conscientiousness" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-personality-conscientiousness"></use></svg>Conscientiousness</button>
            <button className="chart-chip" data-pp-metric="extraversion" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-personality-extraversion"></use></svg>Extraversion</button>
            <button className="chart-chip" data-pp-metric="agreeableness" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-personality-agreeableness"></use></svg>Agreeableness</button>
            <button className="chart-chip" data-pp-metric="emotional_stability" type="button"><svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-personality-emotional-stability"></use></svg>Emotional Stability</button>
          </div>
        </div>
        <p className="field__help pp-metric-note margin-none text-muted font-xs" data-pp-metric-note="" role="status">Pick up to four metrics. The compare series traces the same first metric in an earlier week.</p>
      </div>

      <article className="chart-card sp-card min-width-0">
        <div className="chart-card-head">
          <div className="chart-card-title">
            <span className="theme-label" data-pp-trend-pillar="">{pillar}</span>
            <strong data-pp-trend-title="">Focus and Grit, last 7 days</strong>
            <span data-state-when="semi complete">Compared against last week</span>
          </div>
        </div>
        
        <div className="chart-frame" data-pp-trends="" id="ppTrends"></div>
        <div className="portal-blank" data-state-when="first">
          <span className="sp-icon-frame sp-icon-frame--md no-grow" aria-hidden="true"><svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24"><use href="#ti-gamepad"></use></svg></span>
          <p className="portal-blank__title">Nothing to plot yet</p>
          <p className="portal-blank__note">This is the empty chart your scores will draw across. Play a game and the first week appears.</p>
          <a className="button button--secondary button--sm" href="/games">Play a game <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-right"></use></svg></a>
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
          <div className="chart-actions status-tabs layout-inline-flex" data-scroll-fade role="group" aria-label="Dimension">
            <button aria-pressed={orbitView === 'mood'} className="status-tab" onClick={() => setOrbitView('mood')} type="button">Mood</button>
            <button aria-pressed={orbitView === 'cognition'} className="status-tab" onClick={() => setOrbitView('cognition')} type="button">Cognition</button>
            <button aria-pressed={orbitView === 'personality'} className="status-tab" onClick={() => setOrbitView('personality')} type="button">Personality</button>
            <button aria-pressed={orbitView === 'sessions'} className="status-tab" onClick={() => setOrbitView('sessions')} type="button">Sessions</button>
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
          <p className="pp-orbit-detail__empty margin-none text-muted font-sm" data-orbit-empty data-state-text="orbitDetailEmpty">Select a point on the wheel for that skill&#x27;s score.</p>
          <div className="pp-orbit-detail__body" data-orbit-body hidden>
            <div className="pp-orbit-detail__head layout-flex items-center wrap gap-md">
              <strong className="pp-orbit-detail__name" data-orbit-name></strong>
              <span className="pp-orbit-detail__pillar ui-badge ui-badge--pill font-xs" data-orbit-pillar></span>
            </div>
            <dl className="pp-orbit-detail__stats margin-none">
              <div><dt className="ui-label">This week</dt><dd className="font-mono margin-none" data-orbit-score></dd></div>
              <div><dt className="ui-label">Four-week baseline</dt><dd className="font-mono margin-none" data-orbit-baseline></dd></div>
              <div><dt className="ui-label">Change</dt><dd className="margin-none"><span className="pp-orbit-detail__change font-mono" data-orbit-change></span></dd></div>
            </dl>
            <a className="button button--secondary button--sm" data-orbit-link href="/skill_progression"><span data-orbit-link-label>Open progression</span><svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-right"></use></svg></a>
          </div>
        </div>
      </article>

    </section>
  );
}
