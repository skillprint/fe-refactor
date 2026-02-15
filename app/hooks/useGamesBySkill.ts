'use client';

import { useEffect, useState } from 'react';
import { getSkills, getMoods, getCatalogItemsBySkill, getCatalogItemsByMood } from '../api/api';

/**
 * Hook that calls the api for skills and moods and then calls and filters games by skill and mood
 */
export function useGamesBySkill() {

    const [skills, setSkills] = useState<any>([]);
    const [moods, setMoods] = useState<any>([]);
    const [gamesBySkill, setGamesBySkill] = useState<any>([]);
    const [gamesByMood, setGamesByMood] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchGames = async () => {
            setIsLoading(true);
            try {
                // Fetch basics first
                const [skillsData, moodsData] = await Promise.all([
                    getSkills(),
                    getMoods()
                ]);

                // Then fetch dependent game data
                // The API calls here are cached in api.ts so repeated calls are cheap
                const gamesBySkillRaw = await Promise.all(skillsData.map((skill: any) => getCatalogItemsBySkill(skill.slug)));
                const gamesByMoodRaw = await Promise.all(moodsData.map((mood: any) => getCatalogItemsByMood(mood.slug)));

                setSkills(skillsData);
                setMoods(moodsData);
                setGamesBySkill(gamesBySkillRaw.map((game: any) => game.results).flat());
                setGamesByMood(gamesByMoodRaw.map((game: any) => game.results).flat());
            } catch (error) {
                console.error('Error fetching games data:', error);
                setError(error as Error);
            }
            setIsLoading(false);
        };
        fetchGames();
    }, []);

    return {
        skills,
        moods,
        gamesBySkill,
        gamesByMood,
        isLoading,
        error
    }
}
