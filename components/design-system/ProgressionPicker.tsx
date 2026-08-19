import React from 'react';

export interface ProgressionPickerProps {
  selectedSkill: string;
  onSelectSkill: (skillId: string) => void;
  className?: string;
}

const MOOD_ITEMS = [
  { id: 'awe', label: 'Awe', iconId: 'ti-mood-awe' },
  { id: 'collaborate', label: 'Collaborate', iconId: 'ti-mood-collaborate' },
  { id: 'creativity', label: 'Creativity', iconId: 'ti-mood-creativity' },
  { id: 'curiosity', label: 'Curiosity', iconId: 'ti-mood-curiosity' },
  { id: 'empathy', label: 'Empathy', iconId: 'ti-mood-empathy' },
  { id: 'focus', label: 'Focus', iconId: 'ti-mood-focus' },
  { id: 'grit', label: 'Grit', iconId: 'ti-mood-grit' },
  { id: 'joy', label: 'Joy', iconId: 'ti-mood-joy' },
  { id: 'relax', label: 'Relax', iconId: 'ti-mood-relax' },
];

const COGNITION_ITEMS = [
  { id: 'action', label: 'Action', iconId: 'ti-cognition-action' },
  { id: 'attention', label: 'Attention', iconId: 'ti-cognition-attention' },
  { id: 'deduction', label: 'Deduction', iconId: 'ti-cognition-deduction' },
  { id: 'knowledge', label: 'Knowledge', iconId: 'ti-cognition-knowledge' },
  { id: 'math', label: 'Math', iconId: 'ti-cognition-math' },
  { id: 'memory', label: 'Memory', iconId: 'ti-cognition-memory' },
  { id: 'pattern-matching', label: 'Pattern Matching', iconId: 'ti-cognition-pattern-matching' },
  { id: 'perceptual-speed', label: 'Perceptual Speed', iconId: 'ti-cognition-perceptual-speed' },
  { id: 'planning', label: 'Planning', iconId: 'ti-cognition-planning' },
  { id: 'spatial', label: 'Spatial', iconId: 'ti-cognition-spatial' },
  { id: 'task-switching', label: 'Task Switching', iconId: 'ti-cognition-task-switching' },
  { id: 'timing', label: 'Timing', iconId: 'ti-cognition-timing' },
  { id: 'verbal', label: 'Verbal', iconId: 'ti-cognition-verbal' },
  { id: 'visualization', label: 'Visualization', iconId: 'ti-cognition-visualization' },
];

const PERSONALITY_ITEMS = [
  { id: 'agreeableness', label: 'Agreeableness', iconId: 'ti-personality-agreeableness' },
  { id: 'conscientiousness', label: 'Conscientiousness', iconId: 'ti-personality-conscientiousness' },
  { id: 'emotional-stability', label: 'Emotional Stability', iconId: 'ti-personality-emotional-stability' },
  { id: 'extraversion', label: 'Extraversion', iconId: 'ti-personality-extraversion' },
  { id: 'openness', label: 'Openness', iconId: 'ti-personality-openness' },
];

export const ProgressionPicker: React.FC<ProgressionPickerProps> = ({
  selectedSkill = 'all',
  onSelectSkill,
  className = '',
}) => {
  return (
    <div className={`progression-picker sp-panel ${className}`} role="group" aria-labelledby="skillFilterTitle">
      <div className="progression-picker__bar layout-flex items-center justify-between gap-lg wrap">
        <h3 className="progression-picker__title margin-none font-lg leading-lg weight-semibold" id="skillFilterTitle">
          Filter by skill
        </h3>
      </div>

      <div className="progression-picker__groups layout-grid">
        {/* Dimension Section */}
        <div className="progression-picker__group" data-pillar="all">
          <span className="portal-eyebrow progression-picker__label">Dimension</span>
          <div className="progression-picker__row layout-flex wrap gap-sm">
            <button
              className="ui-tag progression-chip"
              type="button"
              data-skill-filter="all"
              aria-pressed={selectedSkill === 'all'}
              onClick={() => onSelectSkill('all')}
            >
              <span>All skills</span>
            </button>
            <button
              className="ui-tag progression-chip"
              type="button"
              data-skill-filter="mood"
              data-pillar="mood"
              aria-pressed={selectedSkill === 'mood'}
              onClick={() => onSelectSkill('mood')}
            >
              <svg className="sp-icon sp-icon--2xs" aria-hidden="true" viewBox="0 0 24 24">
                <use href="/assets/design-system/icons/sprite.svg#ti-mood-focus"></use>
              </svg>
              <span>Mood</span>
            </button>
            <button
              className="ui-tag progression-chip"
              type="button"
              data-skill-filter="cognition"
              data-pillar="cognition"
              aria-pressed={selectedSkill === 'cognition'}
              onClick={() => onSelectSkill('cognition')}
            >
              <svg className="sp-icon sp-icon--2xs" aria-hidden="true" viewBox="0 0 24 24">
                <use href="/assets/design-system/icons/sprite.svg#ti-cognition-pattern-matching"></use>
              </svg>
              <span>Cognition</span>
            </button>
            <button
              className="ui-tag progression-chip"
              type="button"
              data-skill-filter="personality"
              data-pillar="personality"
              aria-pressed={selectedSkill === 'personality'}
              onClick={() => onSelectSkill('personality')}
            >
              <svg className="sp-icon sp-icon--2xs" aria-hidden="true" viewBox="0 0 24 24">
                <use href="/assets/design-system/icons/sprite.svg#ti-personality-openness"></use>
              </svg>
              <span>Personality</span>
            </button>
          </div>
        </div>

        {/* Mood Section */}
        <div className="progression-picker__group" data-pillar="mood">
          <span className="portal-eyebrow progression-picker__label">Mood</span>
          <div className="progression-picker__row layout-flex wrap gap-sm">
            {MOOD_ITEMS.map(item => (
              <button
                key={item.id}
                className="ui-tag progression-chip"
                type="button"
                data-skill-filter={item.id}
                aria-pressed={selectedSkill === item.id}
                onClick={() => onSelectSkill(item.id)}
              >
                <svg className="sp-icon sp-icon--2xs" aria-hidden="true" viewBox="0 0 24 24">
                  <use href={`/assets/design-system/icons/sprite.svg#${item.iconId}`}></use>
                </svg>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cognition Section */}
        <div className="progression-picker__group" data-pillar="cognition">
          <span className="portal-eyebrow progression-picker__label">Cognition</span>
          <div className="progression-picker__row layout-flex wrap gap-sm">
            {COGNITION_ITEMS.map(item => (
              <button
                key={item.id}
                className="ui-tag progression-chip"
                type="button"
                data-skill-filter={item.id}
                aria-pressed={selectedSkill === item.id}
                onClick={() => onSelectSkill(item.id)}
              >
                <svg className="sp-icon sp-icon--2xs" aria-hidden="true" viewBox="0 0 24 24">
                  <use href={`/assets/design-system/icons/sprite.svg#${item.iconId}`}></use>
                </svg>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Personality Section */}
        <div className="progression-picker__group" data-pillar="personality">
          <span className="portal-eyebrow progression-picker__label">Personality</span>
          <div className="progression-picker__row layout-flex wrap gap-sm">
            {PERSONALITY_ITEMS.map(item => (
              <button
                key={item.id}
                className="ui-tag progression-chip"
                type="button"
                data-skill-filter={item.id}
                aria-pressed={selectedSkill === item.id}
                onClick={() => onSelectSkill(item.id)}
              >
                <svg className="sp-icon sp-icon--2xs" aria-hidden="true" viewBox="0 0 24 24">
                  <use href={`/assets/design-system/icons/sprite.svg#${item.iconId}`}></use>
                </svg>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressionPicker;
