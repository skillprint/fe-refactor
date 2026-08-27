import React from 'react';
import { GameTileSkill } from './GameTile';

interface TraitSkillPillProps {
  skill: GameTileSkill;
}

export const SKILL_ICON_MAP: Record<string, string> = {
  'Spatial Reasoning': 'ti-cognition-spatial',
  'Quick Thinking': 'ti-cognition-perceptual-speed',
  'Hand-Eye Coordination': 'ti-cognition-action',
  'Strategic Planning': 'ti-cognition-planning',
  'Risk Management': 'ti-cognition-deduction',
  'Quick Reactions': 'ti-cognition-action',
  'Pattern Matching': 'ti-cognition-pattern-matching',
  'Action': 'ti-cognition-action',
  'Attention': 'ti-cognition-attention',
  'Deduction': 'ti-cognition-deduction',
  'Focus': 'ti-mood-focus',
  'Grit': 'ti-mood-grit',
  'Knowledge': 'ti-cognition-knowledge',
  'Memory': 'ti-cognition-memory',
  'Perceptual Speed': 'ti-cognition-perceptual-speed',
  'Planning': 'ti-cognition-planning',
  'Relax': 'ti-mood-relax',
  'Spatial': 'ti-cognition-spatial',
  'Timing': 'ti-cognition-timing',
  'Verbal': 'ti-cognition-verbal',
  'Visualization': 'ti-cognition-visualization'
};

export function getSkillIconId(skillName: string, dimension: string = 'cognition'): string {
  let iconId = SKILL_ICON_MAP[skillName];
  if (!iconId) {
    if (dimension === 'mood') iconId = 'ti-mood-focus';
    else if (dimension === 'personality') iconId = 'ti-personality-openness';
    else iconId = 'ti-cognition-attention';
  }
  return iconId;
}

export function TraitSkillPill({ skill }: TraitSkillPillProps) {
  const dimension = skill?.dimension || 'cognition';
  const iconId = getSkillIconId(skill.name, dimension);

  return (
    <button className="trait-skill" type="button" data-skill-peek={skill.name} data-dimension={dimension}>
      <svg className="sp-icon sp-icon--2xs trait-skill__icon" aria-hidden="true" viewBox="0 0 24 24">
        <use href={`#${iconId}`}></use>
      </svg>
      <span className="trait-skill__name">{skill.name}</span>
    </button>
  );
}
