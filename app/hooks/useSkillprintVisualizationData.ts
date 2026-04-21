import { useMemo } from 'react';
import { useVisualizeMoodProfile } from './useVisualizeMoodProfile';
import { useVisualizeSkillProfile } from './useVisualizeSkillProfile';

export function useSkillprintVisualizationData(processedProfile: any) {
  const { data: moodProfile, isLoading: isLoadingMoodProfile } = useVisualizeMoodProfile();
  const { data: skillProfile, isLoading: isLoadingSkillProfile } = useVisualizeSkillProfile();

  const { nodeDataBySkill, hasScoreBySkill } = useMemo(() => {
    const dataMap: { [key: string]: any } = {};
    const hasScore: { [key: string]: boolean } = {};
    
    if (skillProfile?.yearlySummary && Array.isArray(skillProfile.yearlySummary)) {
      skillProfile.yearlySummary.forEach((item: any) => {
        const skillKey = item.skill || item.mood;
        if (typeof skillKey === 'string') {
          const capitalizedSkill = skillKey.charAt(0).toUpperCase() + skillKey.slice(1);
          dataMap[capitalizedSkill] = {
            yearly: item,
            weekly: Array.isArray(skillProfile.weeklySessions) ? skillProfile.weeklySessions : [],
            current: skillProfile.currentSession || null
          };
          dataMap[skillKey.toLowerCase()] = dataMap[capitalizedSkill];
          hasScore[capitalizedSkill] = true;
          hasScore[skillKey.toLowerCase()] = true;
        }
      });
    }
    return { nodeDataBySkill: dataMap, hasScoreBySkill: hasScore };
  }, [skillProfile]);

  const { nodeDataByMood, hasScoreByMood } = useMemo(() => {
    const dataMap: { [key: string]: any } = {};
    const hasScore: { [key: string]: boolean } = {};

    if (processedProfile?.latestMoods) {
      processedProfile.latestMoods.forEach((m: any) => {
        if (!m.targetMood) return;
        hasScore[m.targetMood.charAt(0).toUpperCase() + m.targetMood.slice(1)] = true;
        hasScore[m.targetMood.toLowerCase()] = true;
      });
    }
    
    if (moodProfile?.yearlySummary && Array.isArray(moodProfile.yearlySummary)) {
      moodProfile.yearlySummary.forEach((item: any) => {
        const moodKey = item.mood;
        if (typeof moodKey === 'string') {
          const capitalizedMood = moodKey.charAt(0).toUpperCase() + moodKey.slice(1);
          dataMap[capitalizedMood] = {
            yearly: item,
            weekly: Array.isArray(moodProfile.weeklySessions) ? moodProfile.weeklySessions : [],
            current: moodProfile.currentSession || null
          };
          dataMap[moodKey.toLowerCase()] = dataMap[capitalizedMood];
          hasScore[capitalizedMood] = true;
          hasScore[moodKey.toLowerCase()] = true;
        }
      });
    }
    return { nodeDataByMood: dataMap, hasScoreByMood: hasScore };
  }, [moodProfile, processedProfile]);

  return {
    nodeDataBySkill,
    hasScoreBySkill,
    nodeDataByMood,
    hasScoreByMood,
    nodeDataMap: { ...nodeDataBySkill, ...nodeDataByMood },
    isLoading: isLoadingMoodProfile || isLoadingSkillProfile,
    moodProfile,
    skillProfile
  };
}
