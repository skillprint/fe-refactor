import { useState, useEffect, useMemo } from 'react';
import { Goal, useGoal } from './useGoal';
import { useGameSessions } from './useGameSessions';
import { GameSession } from '../lib/gameSessionUtils';

export interface Playbook {
    id: string;
    title: string;
    description: string;
    slug: string;
    associated_skills: string[];
    associated_moods: string[];
    game_ids: string[];
    tone: string | null;
    icon: string | null;
    target: string | null;
    est_time: string | null;
    how_it_works: string | null;
    created_at: string;
}

export function usePlaybooks() {
    const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let mounted = true;
        fetch('/api/playbooks')
            .then(res => res.json())
            .then(data => {
                if (mounted) {
                    setPlaybooks(data);
                    setIsLoaded(true);
                }
            })
            .catch(err => {
                console.error('Failed to load playbooks:', err);
                if (mounted) setIsLoaded(true);
            });
        
        return () => { mounted = false; };
    }, []);

    return { playbooks, isLoaded };
}

export function usePlaybook(slugOrId?: string) {
    const { playbooks, isLoaded: isPlaybooksLoaded } = usePlaybooks();
    const { sessions, isLoaded: isSessionsLoaded } = useGameSessions();

    const currentPlaybook = useMemo(() => {
        if (!slugOrId) return playbooks[0];
        return playbooks.find(p => p.slug === slugOrId || p.id === slugOrId) || playbooks[0];
    }, [playbooks, slugOrId]);

    const progress = useMemo(() => {
        if (!currentPlaybook || !sessions.length || !currentPlaybook.game_ids) {
            return { completedGames: [], percentComplete: 0, isFinished: false, completedCount: 0 };
        }

        const completedGames = currentPlaybook.game_ids.map(gameSlug => {
            return sessions.some(s =>
                s.gameSlug === gameSlug &&
                s.metadata?.playbookId === currentPlaybook.id &&
                s.completed
            );
        });

        const completedCount = completedGames.filter(Boolean).length;
        const percentComplete = Math.round((completedCount / currentPlaybook.game_ids.length) * 100);

        return {
            completedGames,
            completedCount,
            percentComplete,
            isFinished: completedCount === currentPlaybook.game_ids.length
        };
    }, [currentPlaybook, sessions]);

    return {
        currentPlaybook,
        progress,
        isLoaded: isPlaybooksLoaded && isSessionsLoaded
    };
}
