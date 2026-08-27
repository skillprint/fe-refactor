import React from 'react';

export function SkillsRail() {
  return (
    <aside className="portal-rail" aria-label="This week">
      <article className="rail-card sp-card" aria-labelledby="skillBreakdownTitle">
        <div className="skill-panel__head">
          <span className="ui-label skill-panel__week layout-block">This week</span>
          <h2 className="margin-none" id="skillBreakdownTitle">Skill breakdown</h2>
        </div>
        <div className="skill-panel__metrics">
          <div className="metric metric--portal metric--stacked border-subtle">
            <span className="ui-label metric__label layout-block">Sessions</span>
            <strong className="metric__value layout-block" data-state-text="sessions">8</strong>
            <small className="metric__note layout-block font-xs leading-compact weight-semibold" data-state-text="sessionsNote">+2 on last week</small>
          </div>
          <div className="metric metric--portal metric--stacked border-subtle">
            <span className="ui-label metric__label layout-block">Average flow score</span>
            <strong className="metric__value layout-block" data-state-text="flow">72</strong>
            <small className="metric__note layout-block font-xs leading-compact weight-semibold" data-state-text="flowNote">Low 70s, holding</small>
          </div>
          <div className="metric metric--portal metric--stacked border-subtle">
            <span className="ui-label metric__label layout-block">Skills touched</span>
            <strong className="metric__value layout-block" data-state-text="touched">9</strong>
            <small className="metric__note layout-block font-xs leading-compact weight-semibold" data-state-text="touchedNote">of 28 across all three</small>
          </div>
        </div>
        
        <div className="skill-panel__meters" data-state-when="complete">
          <span className="ui-label skill-panel__label layout-block">Strongest this week</span>
          
          <div className="skill-meter" data-dimension="mood">
            <div className="skill-meter__head layout-flex items-center justify-between gap-md font-sm">
              <span className="layout-inline-flex items-center gap-sm">
                <svg className="sp-icon sp-icon--sm skill-meter__icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-mood-focus"></use></svg>
                Focus
              </span>
              <span className="skill-meter__reading layout-inline-flex items-center gap-sm">
                <span className="skill-meter__pillar font-xs weight-semibold">Mood</span>
                <strong className="font-mono font-xs">74</strong>
              </span>
            </div>
            <div className="sp-progress skill-meter__bar skill-meter__bar--74">
              <span className="sp-progress__track"><span className="sp-progress__fill" style={{ width: '74%' }}></span></span>
            </div>
          </div>
          
          <div className="skill-meter" data-dimension="cognition">
            <div className="skill-meter__head layout-flex items-center justify-between gap-md font-sm">
              <span className="layout-inline-flex items-center gap-sm">
                <svg className="sp-icon sp-icon--sm skill-meter__icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-cognition-attention"></use></svg>
                Attention
              </span>
              <span className="skill-meter__reading layout-inline-flex items-center gap-sm">
                <span className="skill-meter__pillar font-xs weight-semibold">Cognition</span>
                <strong className="font-mono font-xs">78</strong>
              </span>
            </div>
            <div className="sp-progress skill-meter__bar skill-meter__bar--78">
              <span className="sp-progress__track"><span className="sp-progress__fill" style={{ width: '78%' }}></span></span>
            </div>
          </div>
          
          <div className="skill-meter" data-dimension="personality">
            <div className="skill-meter__head layout-flex items-center justify-between gap-md font-sm">
              <span className="layout-inline-flex items-center gap-sm">
                <svg className="sp-icon sp-icon--sm skill-meter__icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-personality-conscientiousness"></use></svg>
                Conscientiousness
              </span>
              <span className="skill-meter__reading layout-inline-flex items-center gap-sm">
                <span className="skill-meter__pillar font-xs weight-semibold">Personality</span>
                <strong className="font-mono font-xs">66</strong>
              </span>
            </div>
            <div className="sp-progress skill-meter__bar skill-meter__bar--66">
              <span className="sp-progress__track"><span className="sp-progress__fill" style={{ width: '66%' }}></span></span>
            </div>
          </div>
        </div>

        <div className="skill-panel__streak layout-flex items-center justify-between gap-lg wrap separator-top text-muted font-sm" data-state-when="complete">
          <span>4-day playing streak</span>
          <div className="skill-panel__days layout-flex gap-sm">
            <span className="skill-day is-done layout-grid place-center border-subtle">M</span>
            <span className="skill-day is-done layout-grid place-center border-subtle">T</span>
            <span className="skill-day is-done layout-grid place-center border-subtle">W</span>
            <span className="skill-day is-done layout-grid place-center border-subtle">T</span>
            <span className="skill-day layout-grid place-center border-subtle">F</span>
            <span className="skill-day layout-grid place-center border-subtle">S</span>
            <span className="skill-day layout-grid place-center border-subtle">S</span>
          </div>
        </div>
      </article>

      <article className="rail-card sp-card skill-goal" data-pp-goal="skills" aria-labelledby="targetSkillsTitle">
        <div className="skill-goal__head layout-flex items-start justify-between gap-lg">
          <div className="min-width-0">
            <span className="portal-eyebrow skill-goal__eyebrow layout-block">My goals</span>
            <h2 className="margin-none" id="targetSkillsTitle">Target skills</h2>
          </div>
          <button className="button button--tertiary button--sm no-grow" type="button" data-pp-goal-edit="">
            <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-edit"></use></svg>Edit
          </button>
        </div>
        <p className="skill-goal__copy margin-none text-muted font-sm">Pick the skills you want your sessions to push. Recommendations follow the list.</p>
        
        <div className="skill-goal__view" data-pp-goal-view="">
          <div className="skill-goal__chips cluster wrap gap-md" data-pp-goal-chips="">
            <span className="ui-tag is-selected">
              <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-cognition-pattern-matching"></use></svg>Pattern Matching
            </span>
            <span className="ui-tag is-selected">
              <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-cognition-attention"></use></svg>Attention
            </span>
            <span className="ui-tag is-selected">
              <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-cognition-memory"></use></svg>Memory
            </span>
          </div>
        </div>

        <p className="skill-goal__note margin-none text-muted font-sm separator-top">
          <svg className="sp-icon sp-icon--sm" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-info"></use></svg>
          <span>Three targets is the sweet spot. More than that and a week of play spreads too thin to read.</span>
        </p>
      </article>
    </aside>
  );
}
