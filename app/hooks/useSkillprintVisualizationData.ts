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
          };
          dataMap[skillKey.toLowerCase()] = dataMap[capitalizedSkill];
          hasScore[capitalizedSkill] = true;
          hasScore[skillKey.toLowerCase()] = true;
        }
      });
    }

    if (skillProfile?.currentSession) {
      const key = skillProfile.currentSession.skill || skillProfile.currentSession.targetMood;
      if (key && typeof key === 'string') {
        const capitalizedSkill = key.charAt(0).toUpperCase() + key.slice(1);
        if (!dataMap[capitalizedSkill]) {
          dataMap[capitalizedSkill] = { yearly: null, weekly: [], current: skillProfile.currentSession };
          dataMap[key.toLowerCase()] = dataMap[capitalizedSkill];
          hasScore[capitalizedSkill] = true;
          hasScore[key.toLowerCase()] = true;
        } else {
          dataMap[capitalizedSkill].current = skillProfile.currentSession;
          dataMap[key.toLowerCase()].current = skillProfile.currentSession;
        }
      }
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
          };
          dataMap[moodKey.toLowerCase()] = dataMap[capitalizedMood];
          hasScore[capitalizedMood] = true;
          hasScore[moodKey.toLowerCase()] = true;
        }
      });
    }

    if (moodProfile?.currentSession) {
      const key = moodProfile.currentSession.mood || moodProfile.currentSession.targetMood;
      if (key && typeof key === 'string') {
        const capitalizedMood = key.charAt(0).toUpperCase() + key.slice(1);
        if (!dataMap[capitalizedMood]) {
          dataMap[capitalizedMood] = { yearly: null, weekly: [], current: moodProfile.currentSession };
          dataMap[key.toLowerCase()] = dataMap[capitalizedMood];
          hasScore[capitalizedMood] = true;
          hasScore[key.toLowerCase()] = true;
        } else {
          dataMap[capitalizedMood].current = moodProfile.currentSession;
          dataMap[key.toLowerCase()].current = moodProfile.currentSession;
        }
      }
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
