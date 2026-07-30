'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserAchievementType } from '../types';
import { useUserSession } from '../../../../hooks/useUserSession';
import { get } from '../../../../api/api';

const LEGACY_BADGES_METADATA: UserAchievementType[] = [
    {
        name: "Worldly Whale",
        slug: "worldly-whale",
        shortDescription: "Visualization",
        longDescription: "Humpback Whales migrate up to 10,190 miles (16,400 km) round trip between its breeding grounds near the equator and the food-rich waters of the Arctic and Antarctic.",
        acknowledged: false,
        triggerDescription: "Earn a score of 80 for Visualization",
        triggerTargetAttribute: {
            name: "Visualization",
            slug: "visualization",
            attributeType: "skill"
        }
    },
    {
        name: "First Mood Session",
        slug: "first-mood-session",
        shortDescription: "Mood Awareness",
        longDescription: "Congrats on taking your first step toward mastering your mood with Skillprint!",
        acknowledged: false,
        triggerDescription: "Play a game from any mood",
        userAchievementId: 3 // earned by default for new profiles to show variety
    },
    {
        name: "First Skill Score",
        slug: "first-skill-score",
        shortDescription: "Cognitive Baseline",
        longDescription: "You received your very first cognitive rating! Your gameplay is now translating into mental insights.",
        acknowledged: false,
        triggerDescription: "Receive your first skill rating",
        userAchievementId: 10
    },
    {
        name: "Persistent Penguin",
        slug: "persistent-penguin",
        shortDescription: "Consistency",
        longDescription: "Like a penguin weathering the Antarctic cold, you showed true grit and played for 5 days in a row!",
        acknowledged: false,
        triggerDescription: "Play games for 5 consecutive days",
        triggerTargetAttribute: {
            name: "Conscientiousness",
            slug: "conscientiousness",
            attributeType: "trait"
        }
    },
    {
        name: "Logical Lion",
        slug: "logical-lion",
        shortDescription: "Deductive Reasoning",
        longDescription: "You solved complex puzzles with sharp logic, earning the title of the Logical Lion.",
        acknowledged: false,
        triggerDescription: "Earn a high score in Deductive Reasoning",
        triggerTargetAttribute: {
            name: "Deductive Reasoning",
            slug: "deductive-reasoning",
            attributeType: "skill"
        }
    },
    {
        name: "Calculating Chimpanzee",
        slug: "calculating-chimpanzee",
        shortDescription: "Number Facility",
        longDescription: "Your arithmetic speed and precision rival the sharpest calculations. Quick, agile, and correct!",
        acknowledged: false,
        triggerDescription: "Achieve a score of 80 in Number Facility",
        triggerTargetAttribute: {
            name: "Number Facility",
            slug: "number-facility",
            attributeType: "skill"
        }
    },
    {
        name: "Storing Spider",
        slug: "storing-spider",
        shortDescription: "Memorization",
        longDescription: "Webbing facts together! You retained complex spatial positions, proving your memory storage is as elaborate as a spider's web.",
        acknowledged: false,
        triggerDescription: "Remember 10 grid items in Memory Match",
        triggerTargetAttribute: {
            name: "Memorization",
            slug: "memorization",
            attributeType: "skill"
        }
    },
    {
        name: "Keen Koala",
        slug: "keen-koala",
        shortDescription: "Selective Attention",
        longDescription: "Unshakable focus! You stayed calm, ignored distractions, and focused perfectly throughout the game.",
        acknowledged: false,
        triggerDescription: "Maintain concentration for a full game session",
        triggerTargetAttribute: {
            name: "Selective Attention",
            slug: "selective-attention",
            attributeType: "skill"
        }
    },
    {
        name: "Hurried Hummingbird",
        slug: "hurried-hummingbird",
        shortDescription: "Perceptual Speed",
        longDescription: "Wings of speed! Your reaction time is so rapid, you cleared the challenge in under 30 seconds.",
        acknowledged: false,
        triggerDescription: "Complete a speed challenge in under 30s",
        triggerTargetAttribute: {
            name: "Perceptual Speed",
            slug: "perceptual-speed",
            attributeType: "skill"
        }
    },
    {
        name: "Assembled Ant",
        slug: "assembled-ant",
        shortDescription: "Information Ordering",
        longDescription: "Perfect coordination! You placed items in sequence without a single slip-up, just like ants marching in formation.",
        acknowledged: false,
        triggerDescription: "Arrange a sequence correctly with zero errors",
        triggerTargetAttribute: {
            name: "Information Ordering",
            slug: "information-ordering",
            attributeType: "skill"
        }
    },
    {
        name: "Plural Pigeon",
        slug: "plural-pigeon",
        shortDescription: "Task Switching",
        longDescription: "Master of multiple horizons! You switched between cognitive rules instantly, keeping your flight perfectly steady.",
        acknowledged: false,
        triggerDescription: "Achieve high scores in task switching",
        triggerTargetAttribute: {
            name: "Task Switching",
            slug: "task-switching",
            attributeType: "skill"
        }
    }
];

const LOCAL_STORAGE_KEY = 'skillprint_legacy_achievements';

export function useLegacyBadges() {
    const { userToken } = useUserSession();
    const [achievements, setAchievements] = useState<UserAchievementType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadLocalAchievements = useCallback(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) {
                try {
                    setAchievements(JSON.parse(saved));
                } catch (e) {
                    console.error('Failed to parse legacy achievements from localStorage', e);
                    setAchievements(LEGACY_BADGES_METADATA);
                }
            } else {
                setAchievements(LEGACY_BADGES_METADATA);
            }
        } else {
            setAchievements(LEGACY_BADGES_METADATA);
        }
        setIsLoading(false);
    }, []);

    // Merge server response with client mock formatting
    const mergeWithServerData = useCallback((serverData: any[], local: UserAchievementType[]): UserAchievementType[] => {
        if (!Array.isArray(serverData)) return local;
        return local.map(item => {
            const serverItem = serverData.find((s: any) =>
                s.slug === item.slug ||
                (s.name && s.name.toLowerCase() === item.name.toLowerCase()) ||
                (s.animalName && s.animalName.toLowerCase() === item.name.toLowerCase())
            );
            if (serverItem) {
                return {
                    ...item,
                    userAchievementId: serverItem.userAchievementId || (serverItem.unlocked ? (serverItem.id || serverItem.number || 1) : undefined) || item.userAchievementId,
                    acknowledged: serverItem.acknowledged ?? item.acknowledged
                };
            }
            return item;
        });
    }, []);

    // Fetch achievements from backend
    const fetchAchievementsFromBackend = useCallback(async () => {
        setIsLoading(true);
        try {
            const headers: any = {};
            if (userToken) {
                headers["X-Auth-Token"] = `Token ${userToken}`;
            }
            const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'test-api-key';
            if (apiKey) {
                headers["Authorization"] = `Api-Key ${apiKey}`;
            }

            console.log('[useLegacyBadges] Fetching talents/me from BE...');
            const response = await get('games/api/talents/me/', false, headers);

            // Handle unlocked and locked arrays in response
            const serverData = response
                ? [...(response.unlocked || []), ...(response.locked || [])]
                : [];

            const merged = mergeWithServerData(serverData, LEGACY_BADGES_METADATA);
            setAchievements(merged);
        } catch (error) {
            console.error('[useLegacyBadges] Failed to fetch legacy achievements, using local storage:', error);
            loadLocalAchievements();
        } finally {
            setIsLoading(false);
        }
    }, [userToken, loadLocalAchievements, mergeWithServerData]);

    useEffect(() => {
        if (userToken) {
            fetchAchievementsFromBackend();
        } else {
            loadLocalAchievements();
        }
    }, [userToken, fetchAchievementsFromBackend, loadLocalAchievements]);

    // Save changes locally for testing simulation
    const saveAchievements = (newAchievements: UserAchievementType[]) => {
        setAchievements(newAchievements);
        if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newAchievements));
        }
    };

    const earnAchievement = (slug: string): UserAchievementType | null => {
        let earnedItem: UserAchievementType | null = null;
        const updated = achievements.map(item => {
            if (item.slug === slug && !item.userAchievementId) {
                earnedItem = {
                    ...item,
                    userAchievementId: Math.floor(Math.random() * 1000) + 1 // assign a mock ID
                };
                return earnedItem;
            }
            return item;
        });

        if (earnedItem) {
            saveAchievements(updated);
        }
        return earnedItem;
    };

    const resetAchievements = () => {
        saveAchievements(LEGACY_BADGES_METADATA);
    };

    const earnedCount = achievements.filter(a => !!a.userAchievementId).length;
    const totalCount = achievements.length;

    return {
        achievements,
        isLoaded: !isLoading,
        earnedCount,
        totalCount,
        earnAchievement,
        resetAchievements,
        refresh: fetchAchievementsFromBackend
    };
}
