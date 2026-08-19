import React, { useState } from 'react';

export interface TargetSkillItem {
  name: string;
  iconId: string;
  selected?: boolean;
}

export interface SkillGoalCardProps {
  initialTargets?: TargetSkillItem[];
  allAvailableSkills?: TargetSkillItem[];
  className?: string;
}

const DEFAULT_TARGETS: TargetSkillItem[] = [
  { name: 'Attention', iconId: 'ti-cognition-attention', selected: true },
  { name: 'Pattern Matching', iconId: 'ti-cognition-pattern-matching', selected: true },
  { name: 'Focus', iconId: 'ti-mood-focus', selected: true },
];

const AVAILABLE_OPTIONS: TargetSkillItem[] = [
  { name: 'Pattern Matching', iconId: 'ti-cognition-pattern-matching', selected: true },
  { name: 'Attention', iconId: 'ti-cognition-attention', selected: true },
  { name: 'Focus', iconId: 'ti-mood-focus', selected: true },
  { name: 'Memory', iconId: 'ti-cognition-memory', selected: false },
  { name: 'Planning', iconId: 'ti-cognition-planning', selected: false },
  { name: 'Task Switching', iconId: 'ti-cognition-task-switching', selected: false },
  { name: 'Math', iconId: 'ti-cognition-math', selected: false },
  { name: 'Deduction', iconId: 'ti-cognition-deduction', selected: false },
  { name: 'Visualization', iconId: 'ti-cognition-visualization', selected: false },
  { name: 'Verbal', iconId: 'ti-cognition-verbal', selected: false },
  { name: 'Timing', iconId: 'ti-cognition-timing', selected: false },
  { name: 'Perceptual Speed', iconId: 'ti-cognition-perceptual-speed', selected: false },
  { name: 'Knowledge', iconId: 'ti-cognition-knowledge', selected: false },
  { name: 'Action', iconId: 'ti-cognition-action', selected: false },
  { name: 'Spatial', iconId: 'ti-cognition-spatial', selected: false },
];

export const SkillGoalCard: React.FC<SkillGoalCardProps> = ({
  initialTargets = DEFAULT_TARGETS,
  allAvailableSkills = AVAILABLE_OPTIONS,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    initialTargets.map(t => t.name)
  );

  const toggleSkill = (skillName: string) => {
    setSelectedSkills(prev =>
      prev.includes(skillName)
        ? prev.filter(name => name !== skillName)
        : [...prev, skillName]
    );
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSelectedSkills(initialTargets.map(t => t.name));
    setIsEditing(false);
  };

  const currentSkillObjects = allAvailableSkills.filter(s => selectedSkills.includes(s.name));

  return (
    <article className={`rail-card sp-card skill-goal ${className}`} aria-labelledby="targetSkillsTitle">
      <div className="skill-goal__head layout-flex items-start justify-between gap-lg">
        <div className="min-width-0">
          <span className="portal-eyebrow skill-goal__eyebrow layout-block">My Goal</span>
          <h2 className="margin-none" id="targetSkillsTitle">
            Target skills
          </h2>
        </div>
        <button
          className="button button--tertiary button--sm no-grow flex items-center gap-1"
          type="button"
          onClick={() => setIsEditing(!isEditing)}
        >
          <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24">
            <use href="/assets/design-system/icons/sprite.svg#ti-edit"></use>
          </svg>
          <span>{isEditing ? 'Close' : 'Edit'}</span>
        </button>
      </div>

      <p className="skill-goal__copy margin-none text-muted font-sm">
        Pick the skills you want your sessions to push. Recommendations follow the list.
      </p>

      {!isEditing ? (
        <div className="skill-goal__view">
          {currentSkillObjects.length > 0 ? (
            <div className="skill-goal__chips cluster wrap gap-md flex flex-wrap mt-3">
              {currentSkillObjects.map(skill => (
                <span key={skill.name} className="ui-tag is-selected flex items-center gap-1">
                  <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24">
                    <use href={`/assets/design-system/icons/sprite.svg#${skill.iconId}`}></use>
                  </svg>
                  {skill.name}
                </span>
              ))}
            </div>
          ) : (
            <div className="skill-goal__empty text-center py-3">
              <p className="margin-none text-muted font-sm">No target skills yet. Pick the ones you want your sessions to push.</p>
              <button
                className="button button--primary button--sm mt-2"
                type="button"
                onClick={() => setIsEditing(true)}
              >
                + Add a skill
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="skill-goal__edit mt-3">
          <div className="pp-goal__picker cluster wrap gap-md flex flex-wrap">
            {allAvailableSkills.map(skill => {
              const selected = selectedSkills.includes(skill.name);
              return (
                <button
                  key={skill.name}
                  type="button"
                  aria-pressed={selected}
                  className={`ui-tag ${selected ? 'is-selected' : ''} flex items-center gap-1`}
                  onClick={() => toggleSkill(skill.name)}
                >
                  <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24">
                    <use href={`/assets/design-system/icons/sprite.svg#${skill.iconId}`}></use>
                  </svg>
                  {skill.name}
                </button>
              );
            })}
          </div>
          <div className="pp-goal__foot cluster gap-md separator-top flex items-center gap-2 mt-4 pt-3 border-t border-slate-700">
            <button className="button button--secondary button--xs" type="button" onClick={handleCancel}>
              Cancel
            </button>
            <button className="button button--primary button--xs" type="button" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      )}

      <p className="skill-goal__note margin-none text-muted font-sm separator-top flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
        <svg className="sp-icon sp-icon--sm shrink-0" aria-hidden="true" viewBox="0 0 24 24">
          <use href="/assets/design-system/icons/sprite.svg#ti-info"></use>
        </svg>
        <span>Three targets is the sweet spot. More than that and a week of play spreads too thin to read.</span>
      </p>
    </article>
  );
};

export default SkillGoalCard;
