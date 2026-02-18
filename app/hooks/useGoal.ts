import { useState, useEffect } from 'react';

export type Goal = 'focus' | 'learning' | 'wellness';

export interface GoalOption {
    id: Goal;
    title: string;
    description: string;
    details: string[];
}

export const GOAL_OPTIONS: GoalOption[] = [
    {
        id: 'focus',
        title: 'Focus & Performance',
        description: 'Enhance your mental clarity and performance.',
        details: [
            'Sharpen your thinking before big moments, recover focus mid-day, and reset your mind to reduce fatigue.'
        ]
    },
    {
        id: 'learning',
        title: 'Learning & Education',
        description: 'Optimize your brain for learning and retention.',
        details: [
            'Boost concentration before studying, reduce distractions, and enter the ideal state for deep learning.'
        ]
    },
    {
        id: 'wellness',
        title: 'Wellness & Mental Health',
        description: 'Support your emotional well-being and mental health.',
        details: [
            'Stabilize your emotions, monitor your daily mood, and regain control when stress or fatigue hits.'
        ]
    }
];

const STORAGE_KEY = 'skillprint-goal';

export function useGoal() {
    const [goal, setGoal] = useState<Goal>('focus');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const storedGoal = localStorage.getItem(STORAGE_KEY) as Goal | null;
        if (storedGoal && GOAL_OPTIONS.some(opt => opt.id === storedGoal)) {
            setGoal(storedGoal);
        }
        setIsLoaded(true);
    }, []);

    const saveGoal = (newGoal: Goal) => {
        setGoal(newGoal);
        localStorage.setItem(STORAGE_KEY, newGoal);
    };

    return { goal, setGoal: saveGoal, isLoaded };
}
