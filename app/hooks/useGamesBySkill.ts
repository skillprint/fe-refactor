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
                const skills = await getSkills();
                const moods = await getMoods();

                const gamesBySkill = await Promise.all(skills.map((skill: any) => getCatalogItemsBySkill(skill.slug)));
                const gamesByMood = await Promise.all(moods.map((mood: any) => getCatalogItemsByMood(mood.slug)));

                setSkills(skills);
                setMoods(moods);
                setGamesBySkill(gamesBySkill.map((game: any) => game.results).flat());
                setGamesByMood(gamesByMood.map((game: any) => game.results).flat());
            } catch (error) {
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
