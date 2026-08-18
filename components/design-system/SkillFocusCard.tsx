import React from 'react';
import { Card } from './Card';
import { Icon } from '@/components/ui/Icon';

interface SkillMeterItem {
  name: string;
  score: number;
}

interface SkillFocusCardProps {
  title?: string;
  skillsHref?: string;
  skills: SkillMeterItem[];
  className?: string;
}

export const SkillFocusCard: React.FC<SkillFocusCardProps> = ({
  title = 'Skill focus',
  skillsHref = '/skills',
  skills,
  className = '',
}) => {
  return (
    <Card className={`rail-card ${className}`}>
      <div className="rail-card__head">
        <span className="rail-card__label font-bold text-sm">{title}</span>
        {skillsHref && (
          <a className="portal-section__link font-sm flex items-center gap-1" href={skillsHref}>
            <span>Skills</span>
            <Icon name="ti-chevron-right" size="xs" />
          </a>
        )}
      </div>
      <div className="layout-grid gap-lg">
        {skills.map((skill, idx) => (
          <div key={idx} className="layout-grid gap-sm">
            <div className="layout-flex items-center justify-between gap-md font-sm">
              <span className="weight-semibold font-ui">{skill.name}</span>
              <span className="text-muted font-mono">{skill.score}</span>
            </div>
            <div
              className="rail-meter"
              data-meter={skill.score}
              style={{ '--meter': `${skill.score}%` } as React.CSSProperties}
            >
              <i />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SkillFocusCard;
