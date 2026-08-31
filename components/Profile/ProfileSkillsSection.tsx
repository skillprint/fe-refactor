import React from 'react';
import ProfileSkillsWheel from './ProfileSkillsWheel';
import ProfileSkillBreakdown from './ProfileSkillBreakdown';

interface ProfileSkillsSectionProps {
  scores: Record<string, number>;
}

export default function ProfileSkillsSection({ scores }: ProfileSkillsSectionProps) {
  return (
    <div className="pp-wheel-layout">
      <div className="pp-wheel-layout__wheel">
        <ProfileSkillsWheel scores={scores} />
      </div>
      <ProfileSkillBreakdown scores={scores} />
    </div>
  );
}
