'use client';

import React from 'react';
import Link from 'next/link';
import { getGameDetails } from '../config/gameConfig';
import { unifiedSlugFromBESlug } from '../utils/slugUtils';
import { PLAYBOOKS } from '../hooks/usePlaybook';
import { useGameSessions } from '../hooks/useGameSessions';
import { useAuth } from '../context/AuthContext';
import GamePreviewShareSheet from './GamePreviewShareSheet';

interface NextPlaybookGameTileProps {
    playbookId: string;
}

export default function NextPlaybookGameTile({ playbookId }: NextPlaybookGameTileProps) {
    const { sessions } = useGameSessions();
    const { status } = useAuth();
    const [isShareSheetOpen, setIsShareSheetOpen] = React.useState(false);

    // Find playbook
    const playbook = Object.values(PLAYBOOKS).find(p => p.id === playbookId);

    if (!playbook || status === 'partner') return null;

    // Find next game
    let nextGameSlug = playbook.games[0];
    let completedCount = 0;

    for (let i = 0; i < playbook.games.length; i++) {
        const slug = playbook.games[i];
        const isCompleted = sessions.some(s => s.gameSlug === slug && s.metadata?.playbookId === playbook.id && s.completed);
        if (isCompleted) {
            completedCount++;
        } else if (nextGameSlug === playbook.games[0] && completedCount === i) {
            nextGameSlug = slug;
        }
    }

    const isFinished = completedCount === playbook.games.length;

    if (isFinished) {
        return (
            <div className="mb-6 bg-card rounded-lg shadow-sm border border-border p-6 text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-lg font-bold text-foreground mb-1">Playbook Complete!</h3>
                <p className="text-muted-foreground text-sm">You have finished all games in the {playbook.title} playbook.</p>
            </div>
        );
    }

    const game = getGameDetails(nextGameSlug);
    if (!game) return null;

    return (
        <div className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-foreground">Next in {playbook.title}</h2>
            <button
                onClick={() => setIsShareSheetOpen(true)}
                className="block group w-full text-left"
            >
                <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow duration-200">
                    {game.image && (
                        <div className="relative h-48 w-full bg-secondary">
                            <img
                                src={game.image}
                                alt={game.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {game.name}
                        </h3>
                        <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                            {game.description}
                        </p>

                        <div className="mt-3 flex items-center text-primary text-sm font-medium">
                            Play Next Game
                            <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>

                        {/* Progress Meter inside card */}
                        <div className="mt-4">
                            <div className="flex justify-between text-xs font-semibold mb-1.5">
                                <span className="text-muted-foreground">{completedCount} of {playbook.games.length} games</span>
                                <span className="text-primary">{Math.round((completedCount / playbook.games.length) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full transition-all duration-500 ease-out bg-primary"
                                    style={{ width: `${Math.round((completedCount / playbook.games.length) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </button>
            <GamePreviewShareSheet 
                slug={nextGameSlug} 
                isOpen={isShareSheetOpen} 
                onClose={() => setIsShareSheetOpen(false)} 
                source="playbook"
                playbookId={playbook.id}
            />
        </div>
    );
}
