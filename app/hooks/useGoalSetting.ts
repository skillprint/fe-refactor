'use client';

import { useState, useEffect } from 'react';
import { getUserGoals, updateUserGoals } from '../api/api';
import { useUserSession } from './useUserSession';

export interface GoalOptionItem {
  slug: string;
  name: string;
}

export const AVAILABLE_SKILLS: GoalOptionItem[] = [
  { slug: 'problem-solving', name: 'Problem Solving' },
  { slug: 'memory', name: 'Memory' },
  { slug: 'speed', name: 'Speed' },
  { slug: 'logic', name: 'Logic' },
  { slug: 'attention', name: 'Attention' },
  { slug: 'visual', name: 'Visual' },
  { slug: 'creativity', name: 'Creativity' },
  { slug: 'language', name: 'Language' },
  { slug: 'math', name: 'Math' },
];

export const AVAILABLE_MOODS: GoalOptionItem[] = [
  { slug: 'focus', name: 'Focus' },
  { slug: 'relax', name: 'Relax' },
  { slug: 'innovate', name: 'Innovate' },
  { slug: 'collaborate', name: 'Collaborate' },
];

const SKILLS_COOKIE_KEY = 'goal_skills';
const MOODS_COOKIE_KEY = 'goal_moods';

export function useGoalSetting() {
  const { userToken } = useUserSession();
  const [goalSkills, setGoalSkills] = useState<string[]>([]);
  const [goalMoods, setGoalMoods] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSkills, setIsSavingSkills] = useState(false);
  const [isSavingMoods, setIsSavingMoods] = useState(false);

  // Load goals from the backend API when userToken is available
  useEffect(() => {
    if (!userToken) {
      setIsLoading(false);
      return;
    }

    const fetchGoals = async () => {
      setIsLoading(true);
      try {
        const goals = await getUserGoals(userToken);
        const skills = goals
          .filter((g: any) => g.goalType === 'SKILL' && g.skill)
          .map((g: any) => g.skill);
        const moods = goals
          .filter((g: any) => g.goalType === 'MOOD' && g.mood)
          .map((g: any) => g.mood);
        setGoalSkills(skills);
        setGoalMoods(moods);
      } catch (e) {
        console.error("Failed to fetch goals:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoals();
  }, [userToken]);

  const saveSkills = async (skills: string[]) => {
    if (!userToken) return;
    setIsSavingSkills(true);
    try {
      const payload = [
        ...skills.map(s => ({ goalType: 'SKILL', skill: s })),
        ...goalMoods.map(m => ({ goalType: 'MOOD', mood: m }))
      ];
      await updateUserGoals(payload, userToken);
      setGoalSkills(skills);
    } catch (e) {
      console.error("Failed to save skills:", e);
      throw e;
    } finally {
      setIsSavingSkills(false);
    }
  };

  const saveMoods = async (moods: string[]) => {
    if (!userToken) return;
    setIsSavingMoods(true);
    try {
      const payload = [
        ...goalSkills.map(s => ({ goalType: 'SKILL', skill: s })),
        ...moods.map(m => ({ goalType: 'MOOD', mood: m }))
      ];
      await updateUserGoals(payload, userToken);
      setGoalMoods(moods);
    } catch (e) {
      console.error("Failed to save moods:", e);
      throw e;
    } finally {
      setIsSavingMoods(false);
    }
  };

  return {
    goalSkills,
    goalMoods,
    isLoading,
    isSavingSkills,
    isSavingMoods,
    saveSkills,
    saveMoods,
  };
}
