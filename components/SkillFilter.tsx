import React from 'react';
import { MOOD_SKILLS, COGNITION_SKILLS, PERSONALITY_SKILLS } from '@/lib/skillsData';

interface SkillFilterProps {
  currentSkillId: string;
  onSkillChange: (skillId: string) => void;
}

export function SkillFilter({ currentSkillId, onSkillChange }: SkillFilterProps) {
  return (
    <section className="skill-filter" aria-labelledby="pickerTitle">
      <span className="ui-label skill-filter__label" id="pickerTitle">Choose a skill</span>
      
      <div className="layout-flex wrap gap-md mt-2 mb-4">
        <select 
          className="field__input"
          style={{ width: 'auto', minWidth: '200px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
          value={currentSkillId} 
          onChange={(e) => onSkillChange(e.target.value)}
        >
          <optgroup label="Mood">
            {MOOD_SKILLS.map(skill => (
              <option key={skill.id} value={skill.id}>
                {skill.name} {skill.progressPercentage > 0 ? '•' : ''}
              </option>
            ))}
          </optgroup>
          <optgroup label="Cognition">
            {COGNITION_SKILLS.map(skill => (
              <option key={skill.id} value={skill.id}>
                {skill.name} {skill.progressPercentage > 0 ? '•' : ''}
              </option>
            ))}
          </optgroup>
          <optgroup label="Personality">
            {PERSONALITY_SKILLS.map(skill => (
              <option key={skill.id} value={skill.id}>
                {skill.name} {skill.progressPercentage > 0 ? '•' : ''}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      <span className="skill-filter__legend layout-inline-flex items-center gap-lg font-xs weight-semibold text-muted wrap">
        <span className="layout-inline-flex items-center gap-sm">
          <i className="progression-key radius-round" data-has-data="true" aria-hidden="true"></i>Progression available
        </span>
        <span className="layout-inline-flex items-center gap-sm">
          <i className="progression-key radius-round" aria-hidden="true"></i>Not started
        </span>
      </span>
    </section>
  );
}
