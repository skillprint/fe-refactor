'use client';

import { useState, useEffect } from 'react';
import { getCookie, setCookie } from '../utils/cookieUtils';

export interface GoalOptionItem {
  slug: string;
  name: string;
}

export const AVAILABLE_SKILLS: GoalOptionItem[] = [
  { slug: 'pattern-matching', name: 'Pattern Matching' },
  { slug: 'attention', name: 'Attention' },
  { slug: 'memory', name: 'Memory' },
  { slug: 'planning', name: 'Planning' },
  { slug: 'task-switching', name: 'Task Switching' },
  { slug: 'math', name: 'Math' },
  { slug: 'deduction', name: 'Deduction' },
  { slug: 'visualization', name: 'Visualization' },
  { slug: 'verbal', name: 'Verbal' },
  { slug: 'timing', name: 'Timing' },
  { slug: 'perceptual-speed', name: 'Perceptual Speed' },
  { slug: 'knowledge', name: 'Knowledge' },
  { slug: 'action', name: 'Action' },
  { slug: 'spatial', name: 'Spatial' },
];

export const AVAILABLE_MOODS: GoalOptionItem[] = [
  { slug: 'focus', name: 'Focus' },
  { slug: 'grit', name: 'Grit' },
  { slug: 'relax', name: 'Relax' },
  { slug: 'collaborate', name: 'Collaborate' },
  { slug: 'empathy', name: 'Empathy' },
  { slug: 'creativity', name: 'Creativity' },
  { slug: 'joy', name: 'Joy' },
  { slug: 'curiosity', name: 'Curiosity' },
  { slug: 'awe', name: 'Awe' },
];

const SKILLS_COOKIE_KEY = 'goal_skills';
const MOODS_COOKIE_KEY = 'goal_moods';

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
      const validSkills = storedSkills
        .split(',')
        .filter(Boolean)
        .filter(slug => AVAILABLE_SKILLS.some(s => s.slug === slug));
      setGoalSkills(validSkills);
    } else {
      setGoalSkills([]);
    }

    const storedMoods = getCookie(MOODS_COOKIE_KEY);
    if (storedMoods) {
      const validMoods = storedMoods
        .split(',')
        .filter(Boolean)
        .filter(slug => AVAILABLE_MOODS.some(m => m.slug === slug));
      setGoalMoods(validMoods);
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
