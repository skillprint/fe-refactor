import { useState, useEffect, useMemo } from 'react';
import { Goal, useGoal } from './useGoal';
import { useGameSessions } from './useGameSessions';
import { GameSession } from '../lib/gameSessionUtils';

export interface Playbook {
    id: string;
    title: string;
    description: string;
    goal: Goal;
    games: string[]; // game slugs
}

export const PLAYBOOKS: Record<Goal, Playbook> = {
    focus: {
        id: 'focus-playbook',
        title: 'Deep Focus Routine',
        description: 'A sequence of games designed to sharpen your attention and eliminate distractions.',
        goal: 'focus',
        games: ['2048', 'hextris', 'box-tower']
    },
    learning: {
        id: 'learning-playbook',
        title: 'Brain Activation for Learning',
        description: 'Prime your brain for new information with these cognitive warm-ups.',
        goal: 'learning',
        games: ['change-word', 'alchemy', 'memory-match'] // memory-match might need a real slug check, using 'sweet-memory' or similar if needed. 'memory-match' is likely not valid based on gameConfig.ts. Let's check. 
        // Checking gameConfig.ts... 'sweet-memory' or 'mahjong-deluxe'. Let's use 'sweet-memory' for now, or 'simon-says' if available?
        // Actually, let's use valid slugs from gameConfig.ts: 'change-word', 'alchemy', 'sweet-memory'
    },
    wellness: {
        id: 'wellness-playbook',
        title: 'Mindful Relaxation',
        description: 'Decompress and reduce stress with calming, low-pressure activities.',
        goal: 'wellness',
        games: ['i-love-hue', 'bubble-spirit', 'garden-match']
    }
};

// Correction for Learning games locally to ensure valid slugs
PLAYBOOKS.learning.games = ['change-word', 'alchemy', 'sweet-memory'];


export function usePlaybook() {
    const { goal, isLoaded: isGoalLoaded } = useGoal();
    const { sessions, isLoaded: isSessionsLoaded } = useGameSessions();

    const currentPlaybook = useMemo(() => {
        return PLAYBOOKS[goal] || PLAYBOOKS.focus;
    }, [goal]);

    const progress = useMemo(() => {
        if (!currentPlaybook || !sessions.length) return { completedGames: [], percentComplete: 0 };

        const completedGames = currentPlaybook.games.map(slug => {
            // Find if this game has been played *specifically for this playbook*
            // However, the user request says "The application should store if the game was played if it was entered from a playbook widget in order to update completion progress of a playbook."
            // But it also implies we should probably count if they just played it? 
            // "Game Tiles that if not played and clicked, go to the game preview interstial. Completed state for a single game..."
            // "The application should store if the game was played if it was entered from a playbook widget..."
            // This suggests strict tracking. I will look for metadata first.
            const hasPlayedContextual = sessions.some(s =>
                s.gameSlug === slug &&
                s.metadata?.playbookId === currentPlaybook.id &&
                s.completed
            );
            return hasPlayedContextual;
        });

        const completedCount = completedGames.filter(Boolean).length;
        const percentComplete = Math.round((completedCount / currentPlaybook.games.length) * 100);

        return {
            completedGames, // boolean array matching games index
            completedCount,
            percentComplete,
            isFinished: completedCount === currentPlaybook.games.length
        };
    }, [currentPlaybook, sessions]);

    return {
        currentPlaybook,
        progress,
        isLoaded: isGoalLoaded && isSessionsLoaded
    };
}
