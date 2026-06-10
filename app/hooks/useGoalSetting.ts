'use client';

import { useState, useEffect } from 'react';

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

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days = 365) => {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
};

export function useGoalSetting() {
  const [goalSkills, setGoalSkills] = useState<string[]>([]);
  const [goalMoods, setGoalMoods] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSkills, setIsSavingSkills] = useState(false);
  const [isSavingMoods, setIsSavingMoods] = useState(false);

  // Load from cookies on mount (client-side only)
  useEffect(() => {
    // STUB: Replace this with backend GET request when connected to backend:
    // try {
    //   const response = await axios.get('/api/user/goals');
    //   setGoalSkills(response.data.skills);
    //   setGoalMoods(response.data.moods);
    // } catch (e) { ... }
    
    const storedSkills = getCookie(SKILLS_COOKIE_KEY);
    if (storedSkills) {
      setGoalSkills(storedSkills.split(',').filter(Boolean));
    } else {
      setGoalSkills([]);
    }

    const storedMoods = getCookie(MOODS_COOKIE_KEY);
    if (storedMoods) {
      setGoalMoods(storedMoods.split(',').filter(Boolean));
    } else {
      setGoalMoods([]);
    }

    setIsLoading(false);
  }, []);

  const saveSkills = async (skills: string[]) => {
    setIsSavingSkills(true);
    
    // Simulate backend write delay (1.5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // STUB: Replace this with backend API write call when connected to backend:
    // try {
    //   await axios.post('/api/user/goals/skills', { skills });
    // } catch (e) {
    //   console.error("Failed to save skills to backend:", e);
    //   throw e;
    // }

    // Save to cookies for now
    setCookie(SKILLS_COOKIE_KEY, skills.join(','));
    setGoalSkills(skills);
    
    setIsSavingSkills(false);
  };

  const saveMoods = async (moods: string[]) => {
    setIsSavingMoods(true);
    
    // Simulate backend write delay (1.5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // STUB: Replace this with backend API write call when connected to backend:
    // try {
    //   await axios.post('/api/user/goals/moods', { moods });
    // } catch (e) {
    //   console.error("Failed to save moods to backend:", e);
    //   throw e;
    // }

    // Save to cookies for now
    setCookie(MOODS_COOKIE_KEY, moods.join(','));
    setGoalMoods(moods);
    
    setIsSavingMoods(false);
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
