import React from 'react';
import ProfileSkillsWheel from './ProfileSkillsWheel';
import ProfileSkillBreakdown, { SkillBaselineMap } from './ProfileSkillBreakdown';

interface ProfileSkillsSectionProps {
  scores: Record<string, number>;
  /** Lifetime baseline and delta per skill slug, from `GET /api/portal/profile/`. */
  baselines?: SkillBaselineMap;
}

export default function ProfileSkillsSection({ scores, baselines = {} }: ProfileSkillsSectionProps) {
  return (
    <div className="pp-wheel-layout">
      <div className="pp-wheel-layout__wheel">
        <ProfileSkillsWheel scores={scores} />
      </div>
      <ProfileSkillBreakdown scores={scores} baselines={baselines} />
    </div>
  );
}
