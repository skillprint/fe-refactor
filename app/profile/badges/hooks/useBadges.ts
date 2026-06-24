'use client';

import { useState, useEffect } from 'react';
import { Badge, Goal } from '../types';

const INITIAL_MOCK_BADGES: Badge[] = [
    {
        id: 'first-steps',
        name: 'First Steps',
        description: 'Completed your very first game session',
        longDescription: 'You took your first step into the cognitive playground! Playing your first game opens up your potential for personalized brain insights.',
        icon: '🎯',
        color: 'from-amber-400 via-orange-500 to-red-500',
        date: '2026-06-20',
        gameTitle: '2048',
        gameImage: '/games/live/2048/screenshot.png',
        earned: true,
        category: 'milestone'
    },
    {
        id: 'cognitive-explorer',
        name: 'Cognitive Explorer',
        description: 'Played games across 3 different cognitive skills',
        longDescription: 'You have demonstrated mental flexibility by engaging with games targeting memory, spatial reasoning, and response speed.',
        icon: '🧭',
        color: 'from-blue-400 via-indigo-500 to-purple-600',
        date: '2026-06-22',
        gameTitle: 'Hextris',
        gameImage: '/games/live/Hextris/screenshot.png',
        earned: true,
        category: 'cognitive'
    },
    {
        id: 'social-pioneer',
        name: 'Social Pioneer',
        description: 'Connected a social account to your profile',
        longDescription: 'You linked your social profile, securing your achievements and making it easier to share your mental insights with friends!',
        icon: '🤝',
        color: 'from-teal-400 via-cyan-500 to-blue-600',
        date: '2026-06-23',
        gameTitle: 'Skillprint Hub',
        gameImage: '/logo192.png',
        earned: true,
        category: 'social'
    },
    {
        id: 'laser-focus',
        name: 'Laser Focus',
        description: 'Complete 3 puzzle games with high accuracy',
        longDescription: 'Unlocking this means you demonstrated persistent high focus and minimized mistakes over multiple puzzle rounds.',
        icon: '🔍',
        color: 'from-green-400 via-emerald-500 to-teal-600',
        date: '2026-06-23',
        gameTitle: 'Memory Match',
        gameImage: '/games/live/Alchemy/icon_144.png',
        earned: true,
        category: 'focus'
    },
    {
        id: 'speed-demon',
        name: 'Speed Demon',
        description: 'Complete Hextris clearing 100 rows in under 2 mins',
        longDescription: 'Lightning fast decisions! You managed blocks at extreme speed, showcasing highly efficient visual-spatial processing.',
        icon: '⚡',
        color: 'from-pink-500 via-rose-500 to-orange-500',
        gameTitle: 'Hextris',
        gameImage: '/games/live/Hextris/screenshot.png',
        earned: false,
        category: 'cognitive',
        progressCurrent: 64,
        progressTarget: 100
    },
    {
        id: 'brain-marathon',
        name: 'Brain Marathon',
        description: 'Play 10 game sessions in a single day',
        longDescription: 'Mental endurance champion! Play 10 gaming sessions in 24 hours to prove your cognitive durability and focus stamina.',
        icon: '🏃',
        color: 'from-yellow-400 via-amber-500 to-orange-600',
        gameTitle: 'Any Game',
        gameImage: '/games/live/Bubble Spirit/bubble-spirit.png',
        earned: false,
        category: 'milestone',
        progressCurrent: 6,
        progressTarget: 10
    },
    {
        id: 'night-owl',
        name: 'Night Owl',
        description: 'Play any game session between 12 AM and 4 AM',
        longDescription: 'Late-night cognitive workout! Your brain does not sleep when it comes to challenges. Play during late-night hours to earn this.',
        icon: '🦉',
        color: 'from-violet-600 via-purple-800 to-slate-900',
        gameTitle: 'Any Game',
        gameImage: '/games/live/Hextris/screenshot.png',
        earned: false,
        category: 'milestone',
        progressCurrent: 0,
        progressTarget: 1
    },
    {
        id: 'zen-master',
        name: 'Zen Master',
        description: 'Play 5 calming games in a row to reduce stress',
        longDescription: 'Finding calm in the storm. You played 5 calming sessions consecutively, displaying great self-regulation and stress management.',
        icon: '🧘',
        color: 'from-sky-400 via-teal-400 to-emerald-500',
        gameTitle: 'Zen Garden',
        gameImage: '/games/live/Alchemy/icon_144.png',
        earned: false,
        category: 'focus',
        progressCurrent: 3,
        progressTarget: 5
    },
    {
        id: 'feedback-loop',
        name: 'Insight Sharer',
        description: 'Share your cognitive profile graph on social media',
        longDescription: 'Help build the collective intelligence! Share your Skillprint profile graph with others to compare cognitive playstyles.',
        icon: '📢',
        color: 'from-purple-400 via-pink-500 to-rose-500',
        gameTitle: 'Profile Share',
        gameImage: '/logo192.png',
        earned: false,
        category: 'social',
        progressCurrent: 0,
        progressTarget: 1
    }
];

const LOCAL_STORAGE_KEY = 'skillprint_mock_badges';

export function useBadges() {
    const [badges, setBadges] = useState<Badge[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial load
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) {
                try {
                    setBadges(JSON.parse(saved));
                } catch (e) {
                    console.error('Failed to parse badges from localStorage, resetting to default', e);
                    setBadges(INITIAL_MOCK_BADGES);
                }
            } else {
                setBadges(INITIAL_MOCK_BADGES);
            }
            setIsLoaded(true);
        }
    }, []);

    // Save changes
    const saveBadges = (newBadges: Badge[]) => {
        setBadges(newBadges);
        if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newBadges));
        }
    };

    const earnBadge = (badgeId: string): Badge | null => {
        let earnedBadge: Badge | null = null;
        const updated = badges.map(badge => {
            if (badge.id === badgeId && !badge.earned) {
                const today = new Date().toISOString().split('T')[0];
                earnedBadge = {
                    ...badge,
                    earned: true,
                    date: today,
                    progressCurrent: badge.progressTarget // complete progress
                };
                return earnedBadge;
            }
            return badge;
        });

        if (earnedBadge) {
            saveBadges(updated);
        }
        return earnedBadge;
    };

    const resetBadges = () => {
        saveBadges(INITIAL_MOCK_BADGES);
    };

    const earnedBadgesCount = badges.filter(b => b.earned).length;
    const totalBadgesCount = badges.length;

    return {
        badges,
        isLoaded,
        earnedBadgesCount,
        totalBadgesCount,
        earnBadge,
        resetBadges
    };
}
