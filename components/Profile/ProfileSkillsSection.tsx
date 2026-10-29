import React from 'react';
import ProfileSkillsWheel from './ProfileSkillsWheel';
import ProfileSkillBreakdown, { SkillBaselineMap } from './ProfileSkillBreakdown';

interface ProfileSkillsSectionProps {
  scores: Record<string, number>;
  /** Lifetime baseline and delta per skill slug, from `GET /api/portal/profile/`. */
  baselines?: SkillBaselineMap;
  /** The wheel's title; the viewer's own profile leaves it as "Your skills". */
  who?: string;
}

export default function ProfileSkillsSection({ scores, baselines = {}, who }: ProfileSkillsSectionProps) {
  return (
    <div className="pp-wheel-layout">
      <div className="pp-wheel-layout__wheel">
        <ProfileSkillsWheel scores={scores} who={who} />
      </div>
      <ProfileSkillBreakdown scores={scores} baselines={baselines} />
    </div>
  );
}
