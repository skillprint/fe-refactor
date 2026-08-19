import React from 'react';

export interface SkillProgressItem {
  id: string;
  name: string;
  dimension: 'mood' | 'cognition' | 'personality';
  iconId: string;
  score?: number; // undefined if "Needs play"
}

const MOOD_SKILLS: SkillProgressItem[] = [
  { id: 'focus', name: 'Focus', dimension: 'mood', iconId: 'ti-mood-focus', score: 84 },
  { id: 'grit', name: 'Grit', dimension: 'mood', iconId: 'ti-mood-grit', score: 77 },
  { id: 'curiosity', name: 'Curiosity', dimension: 'mood', iconId: 'ti-mood-curiosity', score: 71 },
  { id: 'creativity', name: 'Creativity', dimension: 'mood', iconId: 'ti-mood-creativity', score: 66 },
  { id: 'joy', name: 'Joy', dimension: 'mood', iconId: 'ti-mood-joy', score: 62 },
  { id: 'collaborate', name: 'Collaborate', dimension: 'mood', iconId: 'ti-mood-collaborate', score: 54 },
  { id: 'relax', name: 'Relax', dimension: 'mood', iconId: 'ti-mood-relax', score: 48 },
  { id: 'awe', name: 'Awe', dimension: 'mood', iconId: 'ti-mood-awe' },
  { id: 'empathy', name: 'Empathy', dimension: 'mood', iconId: 'ti-mood-empathy' },
];

const COGNITION_SKILLS: SkillProgressItem[] = [
  { id: 'pattern-matching', name: 'Pattern Matching', dimension: 'cognition', iconId: 'ti-cognition-pattern-matching', score: 86 },
  { id: 'action', name: 'Action', dimension: 'cognition', iconId: 'ti-cognition-action', score: 81 },
  { id: 'attention', name: 'Attention', dimension: 'cognition', iconId: 'ti-cognition-attention', score: 79 },
  { id: 'timing', name: 'Timing', dimension: 'cognition', iconId: 'ti-cognition-timing', score: 76 },
  { id: 'perceptual-speed', name: 'Perceptual Speed', dimension: 'cognition', iconId: 'ti-cognition-perceptual-speed', score: 73 },
  { id: 'planning', name: 'Planning', dimension: 'cognition', iconId: 'ti-cognition-planning', score: 70 },
  { id: 'deduction', name: 'Deduction', dimension: 'cognition', iconId: 'ti-cognition-deduction', score: 68 },
  { id: 'visualization', name: 'Visualization', dimension: 'cognition', iconId: 'ti-cognition-visualization', score: 67 },
  { id: 'memory', name: 'Memory', dimension: 'cognition', iconId: 'ti-cognition-memory', score: 64 },
  { id: 'spatial', name: 'Spatial', dimension: 'cognition', iconId: 'ti-cognition-spatial', score: 58 },
  { id: 'knowledge', name: 'Knowledge', dimension: 'cognition', iconId: 'ti-cognition-knowledge' },
  { id: 'math', name: 'Math', dimension: 'cognition', iconId: 'ti-cognition-math' },
  { id: 'task-switching', name: 'Task Switching', dimension: 'cognition', iconId: 'ti-cognition-task-switching' },
  { id: 'verbal', name: 'Verbal', dimension: 'cognition', iconId: 'ti-cognition-verbal' },
];

const PERSONALITY_SKILLS: SkillProgressItem[] = [
  { id: 'conscientiousness', name: 'Conscientiousness', dimension: 'personality', iconId: 'ti-personality-conscientiousness', score: 74 },
  { id: 'openness', name: 'Openness', dimension: 'personality', iconId: 'ti-personality-openness', score: 72 },
  { id: 'agreeableness', name: 'Agreeableness', dimension: 'personality', iconId: 'ti-personality-agreeableness', score: 69 },
  { id: 'emotional-stability', name: 'Emotional Stability', dimension: 'personality', iconId: 'ti-personality-emotional-stability', score: 61 },
  { id: 'extraversion', name: 'Extraversion', dimension: 'personality', iconId: 'ti-personality-extraversion' },
];

export const ProfileSkillBreakdown: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`pp-breakdown sp-panel padding-none clip ${className}`}>
      <div className="pp-breakdown__head separator-bottom p-6 border-b border-slate-800">
        <div className="layout-flex items-center justify-between gap-md font-sm mb-2">
          <span className="weight-semibold font-semibold text-slate-100">21 of 28 skills have a reading</span>
          <span className="text-muted text-slate-400 text-sm">7 still need play</span>
        </div>
        <div className="rail-meter mb-3" role="img" aria-label="21 of 28 skills measured" data-meter="75" style={{ '--meter': '75%' } as React.CSSProperties}>
          <i></i>
        </div>
        <p className="margin-none text-subtle font-xs leading-md text-slate-400 text-xs">
          A bar is a skill your sessions have measured, and how far it has come.{' '}
          <span className="weight-semibold font-semibold text-slate-200">Needs play</span> is a skill no finished game has read yet — those seven are what the games recommended on Home are picked to reach.
        </p>
      </div>

      <div className="pp-breakdown__scroll space-y-6 p-6 max-h-[600px] overflow-y-auto">
        {/* Mood Group */}
        <div className="pp-breakdown__group space-y-2" data-pillar="mood" role="group" aria-label="Mood skills">
          <p className="portal-eyebrow pp-breakdown__label flex items-center justify-between text-xs font-mono uppercase text-slate-400 mb-2">
            <span>Mood</span>
            <span className="ui-label pp-breakdown__count font-normal normal-case">7 of 9 read · 2 need play</span>
          </p>
          {MOOD_SKILLS.map(skill => (
            <a
              key={skill.id}
              className={`pp-skill flex items-center justify-between p-3 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 transition-colors border border-slate-800 ${skill.score === undefined ? 'pp-skill--empty opacity-60' : ''}`}
              href={`/design-system/skills#${skill.id}`}
              data-pillar="mood"
              data-score={skill.score}
            >
              <div className="flex items-center gap-3 min-w-[160px]">
                <svg className="sp-icon sp-icon--sm text-purple-400 w-5 h-5" aria-hidden="true" viewBox="0 0 24 24">
                  <use href={`/assets/design-system/icons/sprite.svg#${skill.iconId}`}></use>
                </svg>
                <span className="pp-skill__name weight-medium font-medium text-slate-200 text-sm">{skill.name}</span>
              </div>

              {skill.score !== undefined ? (
                <div className="flex items-center gap-4 flex-1 max-w-[280px] mx-4">
                  <span className="pp-skill__track track radius-full w-full h-2 bg-slate-800 rounded-full overflow-hidden" aria-hidden="true" style={{ '--track-fill': `${skill.score}%` } as React.CSSProperties}>
                    <i className="radius-full block h-full bg-purple-500 rounded-full" style={{ width: `${skill.score}%` }}></i>
                  </span>
                  <span className="pp-skill__value font-sm text-sm font-mono text-slate-300 min-w-[24px] text-right">{skill.score}</span>
                </div>
              ) : (
                <span className="pp-skill__state font-sm text-muted text-xs text-slate-500 italic flex-1 text-right mr-4">Needs play</span>
              )}

              <svg className="sp-icon sp-icon--sm sp-icon--muted text-slate-500 w-4 h-4" aria-hidden="true" viewBox="0 0 24 24">
                <use href="/assets/design-system/icons/sprite.svg#ti-chevron-right"></use>
              </svg>
            </a>
          ))}
        </div>

        {/* Cognition Group */}
        <div className="pp-breakdown__group space-y-2" data-pillar="cognition" role="group" aria-label="Cognition skills">
          <p className="portal-eyebrow pp-breakdown__label flex items-center justify-between text-xs font-mono uppercase text-slate-400 mb-2">
            <span>Cognition</span>
            <span className="ui-label pp-breakdown__count font-normal normal-case">10 of 14 read · 4 need play</span>
          </p>
          {COGNITION_SKILLS.map(skill => (
            <a
              key={skill.id}
              className={`pp-skill flex items-center justify-between p-3 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 transition-colors border border-slate-800 ${skill.score === undefined ? 'pp-skill--empty opacity-60' : ''}`}
              href={`/design-system/skills#${skill.id}`}
              data-pillar="cognition"
              data-score={skill.score}
            >
              <div className="flex items-center gap-3 min-w-[160px]">
                <svg className="sp-icon sp-icon--sm text-blue-400 w-5 h-5" aria-hidden="true" viewBox="0 0 24 24">
                  <use href={`/assets/design-system/icons/sprite.svg#${skill.iconId}`}></use>
                </svg>
                <span className="pp-skill__name weight-medium font-medium text-slate-200 text-sm">{skill.name}</span>
              </div>

              {skill.score !== undefined ? (
                <div className="flex items-center gap-4 flex-1 max-w-[280px] mx-4">
                  <span className="pp-skill__track track radius-full w-full h-2 bg-slate-800 rounded-full overflow-hidden" aria-hidden="true" style={{ '--track-fill': `${skill.score}%` } as React.CSSProperties}>
                    <i className="radius-full block h-full bg-blue-500 rounded-full" style={{ width: `${skill.score}%` }}></i>
                  </span>
                  <span className="pp-skill__value font-sm text-sm font-mono text-slate-300 min-w-[24px] text-right">{skill.score}</span>
                </div>
              ) : (
                <span className="pp-skill__state font-sm text-muted text-xs text-slate-500 italic flex-1 text-right mr-4">Needs play</span>
              )}

              <svg className="sp-icon sp-icon--sm sp-icon--muted text-slate-500 w-4 h-4" aria-hidden="true" viewBox="0 0 24 24">
                <use href="/assets/design-system/icons/sprite.svg#ti-chevron-right"></use>
              </svg>
            </a>
          ))}
        </div>

        {/* Personality Group */}
        <div className="pp-breakdown__group space-y-2" data-pillar="personality" role="group" aria-label="Personality skills">
          <p className="portal-eyebrow pp-breakdown__label flex items-center justify-between text-xs font-mono uppercase text-slate-400 mb-2">
            <span>Personality</span>
            <span className="ui-label pp-breakdown__count font-normal normal-case">4 of 5 read · 1 needs play</span>
          </p>
          {PERSONALITY_SKILLS.map(skill => (
            <a
              key={skill.id}
              className={`pp-skill flex items-center justify-between p-3 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 transition-colors border border-slate-800 ${skill.score === undefined ? 'pp-skill--empty opacity-60' : ''}`}
              href={`/design-system/skills#${skill.id}`}
              data-pillar="personality"
              data-score={skill.score}
            >
              <div className="flex items-center gap-3 min-w-[160px]">
                <svg className="sp-icon sp-icon--sm text-emerald-400 w-5 h-5" aria-hidden="true" viewBox="0 0 24 24">
                  <use href={`/assets/design-system/icons/sprite.svg#${skill.iconId}`}></use>
                </svg>
                <span className="pp-skill__name weight-medium font-medium text-slate-200 text-sm">{skill.name}</span>
              </div>

              {skill.score !== undefined ? (
                <div className="flex items-center gap-4 flex-1 max-w-[280px] mx-4">
                  <span className="pp-skill__track track radius-full w-full h-2 bg-slate-800 rounded-full overflow-hidden" aria-hidden="true" style={{ '--track-fill': `${skill.score}%` } as React.CSSProperties}>
                    <i className="radius-full block h-full bg-emerald-500 rounded-full" style={{ width: `${skill.score}%` }}></i>
                  </span>
                  <span className="pp-skill__value font-sm text-sm font-mono text-slate-300 min-w-[24px] text-right">{skill.score}</span>
                </div>
              ) : (
                <span className="pp-skill__state font-sm text-muted text-xs text-slate-500 italic flex-1 text-right mr-4">Needs play</span>
              )}

              <svg className="sp-icon sp-icon--sm sp-icon--muted text-slate-500 w-4 h-4" aria-hidden="true" viewBox="0 0 24 24">
                <use href="/assets/design-system/icons/sprite.svg#ti-chevron-right"></use>
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSkillBreakdown;
