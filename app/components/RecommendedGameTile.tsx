'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRecommendedGames } from '../hooks/useRecommendedGames';
import { unifiedSlugFromBESlug } from '../game/[slug]/GameClient';

export default function RecommendedGameTile() {
    const { recommendedGames, isLoading, error } = useRecommendedGames(1);

    if (isLoading) {
        return (
            <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden p-4 flex justify-center items-center h-48 animate-pulse">
                <div className="text-muted-foreground font-medium">Loading recommendations...</div>
            </div>
        );
    }

    if (error || !recommendedGames || recommendedGames.length === 0) {
        return null;
    }

    const game = recommendedGames[0];

    return (
        <div className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-foreground">Recommended for You</h2>
            <p className="text-muted-foreground text-sm mb-3">We've picked a game just for you based on your goals to help improve your Skillprint.</p>
            <Link
                href={`/game/${unifiedSlugFromBESlug(game.slug)}/interstitial`}
                className="block group"
            >
                <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow duration-200">
                    {game.screenshot && (
                        <div className="relative h-48 w-full bg-secondary">
                            <Image
                                src={game.screenshot}
                                alt={game.name}
                                fill
                                className="object-cover"
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
                            Play Now
                            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
