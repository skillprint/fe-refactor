import React from 'react';

export interface SkillMeterItem {
  name: string;
  pillar: 'Mood' | 'Cognition' | 'Personality';
  iconId: string;
  value: number; // e.g. 74
  dimension: 'mood' | 'cognition' | 'personality';
}

export interface SkillBreakdownCardProps {
  weekLabel?: string; // e.g. "Week 29"
  sessionsCount?: number; // e.g. 8
  sessionsNote?: string; // e.g. "+2 on last week"
  avgFlowScore?: number; // e.g. 72
  avgFlowNote?: string; // e.g. "Low 70s, holding"
  skillsTouchedCount?: number; // e.g. 9
  skillsTouchedNote?: string; // e.g. "of 28 across all three"
  strongestMeters?: SkillMeterItem[];
  streakDaysCount?: number; // e.g. 4
  daysStatus?: boolean[]; // [true, true, true, true, false, false, false]
  className?: string;
}

export const SkillBreakdownCard: React.FC<SkillBreakdownCardProps> = ({
  weekLabel = 'Week 29',
  sessionsCount = 8,
  sessionsNote = '+2 on last week',
  avgFlowScore = 72,
  avgFlowNote = 'Low 70s, holding',
  skillsTouchedCount = 9,
  skillsTouchedNote = 'of 28 across all three',
  strongestMeters = [
    { name: 'Focus', pillar: 'Mood', iconId: 'ti-mood-focus', value: 74, dimension: 'mood' },
    { name: 'Attention', pillar: 'Cognition', iconId: 'ti-cognition-attention', value: 78, dimension: 'cognition' },
    { name: 'Conscientiousness', pillar: 'Personality', iconId: 'ti-personality-conscientiousness', value: 66, dimension: 'personality' },
  ],
  streakDaysCount = 4,
  daysStatus = [true, true, true, true, false, false, false],
  className = '',
}) => {
  const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <article className={`rail-card sp-card ${className}`} aria-labelledby="skillBreakdownTitle">
      <div className="skill-panel__head">
        <span className="ui-label skill-panel__week layout-block">{weekLabel}</span>
        <h2 className="margin-none" id="skillBreakdownTitle">
          Skill breakdown
        </h2>
      </div>

      <div className="skill-panel__metrics">
        <div className="metric metric--portal metric--stacked border-subtle">
          <span className="ui-label metric__label layout-block">Sessions</span>
          <strong className="metric__value layout-block">{sessionsCount}</strong>
          <small className="metric__note layout-block font-xs leading-compact weight-semibold">{sessionsNote}</small>
        </div>
        <div className="metric metric--portal metric--stacked border-subtle">
          <span className="ui-label metric__label layout-block">Average flow score</span>
          <strong className="metric__value layout-block">{avgFlowScore}</strong>
          <small className="metric__note layout-block font-xs leading-compact weight-semibold">{avgFlowNote}</small>
        </div>
        <div className="metric metric--portal metric--stacked border-subtle">
          <span className="ui-label metric__label layout-block">Skills touched</span>
          <strong className="metric__value layout-block">{skillsTouchedCount}</strong>
          <small className="metric__note layout-block font-xs leading-compact weight-semibold">{skillsTouchedNote}</small>
        </div>
      </div>

      <div className="skill-panel__meters">
        <span className="ui-label skill-panel__label layout-block">Strongest this week</span>
        {strongestMeters.map(meter => (
          <div key={meter.name} className="skill-meter" data-dimension={meter.dimension}>
            <div className="skill-meter__head layout-flex items-center justify-between gap-md font-sm">
              <span className="layout-inline-flex items-center gap-sm">
                <svg className="sp-icon sp-icon--sm skill-meter__icon" aria-hidden="true" viewBox="0 0 24 24">
                  <use href={`/assets/design-system/icons/sprite.svg#${meter.iconId}`}></use>
                </svg>
                {meter.name}
              </span>
              <span className="skill-meter__reading layout-inline-flex items-center gap-sm">
                <span className="skill-meter__pillar font-xs weight-semibold">{meter.pillar}</span>
                <strong className="font-mono font-xs">{meter.value}</strong>
              </span>
            </div>
            <div className={`sp-progress skill-meter__bar skill-meter__bar--${meter.value}`}>
              <span className="sp-progress__track">
                <span className="sp-progress__fill" style={{ width: `${meter.value}%` }}></span>
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="skill-panel__streak layout-flex items-center justify-between gap-lg wrap separator-top text-muted font-sm">
        <span>{streakDaysCount}-day playing streak</span>
        <div className="skill-panel__days layout-flex gap-sm">
          {dayLetters.map((letter, idx) => (
            <span
              key={idx}
              className={`skill-day ${daysStatus[idx] ? 'is-done' : ''} layout-grid place-center border-subtle`}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};

export default SkillBreakdownCard;
