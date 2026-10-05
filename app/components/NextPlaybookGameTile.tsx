'use client';

import React from 'react';
import { usePlaybookDetail } from '@/lib/models/portal/usePlaybookDetail';
import { nextGameIndex, playbookGameImage } from '@/lib/playbookUtils';
import { useAuth } from '../context/AuthContext';
import GamePreviewShareSheet from './GamePreviewShareSheet';

interface NextPlaybookGameTileProps {
    playbookId: string;
}

export default function NextPlaybookGameTile({ playbookId }: NextPlaybookGameTileProps) {
    const { status } = useAuth();
    const [isShareSheetOpen, setIsShareSheetOpen] = React.useState(false);

    const { data: playbook } = usePlaybookDetail(playbookId);

    if (!playbook || status === 'partner' || !playbook.games.length) return null;

    const { playedGames, totalGames, percent } = playbook.progress;
    const isFinished = playedGames >= totalGames;

    if (isFinished) {
        return (
            <div className="mb-6 bg-card rounded-lg shadow-sm border border-border p-6 text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-lg font-bold text-foreground mb-1">Playbook Complete!</h3>
                <p className="text-muted-foreground text-sm">You have finished all games in the {playbook.title} playbook.</p>
            </div>
        );
    }

    const nextGame = playbook.games[nextGameIndex(playbook)];
    if (!nextGame) return null;

    return (
        <div className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-foreground">Next in {playbook.title}</h2>
            <button
                onClick={() => setIsShareSheetOpen(true)}
                className="block group w-full text-left"
            >
                <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <div className="relative h-48 w-full bg-secondary">
                        <img
                            src={playbookGameImage(nextGame)}
                            alt={nextGame.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {nextGame.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                            {nextGame.description}
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
                                <span className="text-muted-foreground">{playedGames} of {totalGames} games</span>
                                <span className="text-primary">{percent}%</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full transition-all duration-500 ease-out bg-primary"
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </button>
            <GamePreviewShareSheet
                slug={nextGame.slug}
                isOpen={isShareSheetOpen}
                onClose={() => setIsShareSheetOpen(false)}
                source="playbook"
                playbookId={playbook.slug}
            />
        </div>
    );
}
