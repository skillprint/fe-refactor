'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ChallengeWidget({ currentGameId }: { currentGameId?: string }) {
    const [challenges, setChallenges] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchChallenges() {
            try {
                const res = await fetch('/api/challenges');
                const data = await res.json();
                if (data.success) {
                    setChallenges(data.challenges);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchChallenges();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-card rounded-lg shadow-sm border border-border p-4 animate-pulse h-32 flex items-center justify-center">
                <span className="text-muted-foreground">Loading challenges...</span>
            </div>
        );
    }

    if (!challenges || challenges.length === 0) {
        return null;
    }

    // Pick the most recent challenge or one that features the current game
    let displayChallenge = challenges[0];
    if (currentGameId) {
        const match = challenges.find(c => c.game_ids && c.game_ids.includes(currentGameId));
        if (match) displayChallenge = match;
    }

    return (
        <div className="mb-6 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-xl p-4 border border-orange-500/20 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-24 h-24 text-orange-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-orange-500 text-white">
                        {displayChallenge.temporal_period ? `${displayChallenge.temporal_period} Challenge` : 'Active Challenge'}
                    </span>
                    {displayChallenge.type === 'skill_mood' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-500 text-white">
                            Skill & Mood
                        </span>
                    )}
                </div>

                <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-orange-500 transition-colors">
                    {displayChallenge.title}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {displayChallenge.description}
                </p>

                <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-neutral-500">
                        Includes {(displayChallenge.game_ids || []).length} games
                    </div>

                    <Link
                        href="/games"
                        className="text-sm font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
                    >
                        Participate
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}
