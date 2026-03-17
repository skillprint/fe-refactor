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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                    href={`/game/${unifiedSlugFromBESlug(game.slug)}/interstitial`}
                    className="block group"
                >
                    {(() => {
                        // For RecommendedGameTile we don't have direct access to getColorForSlug from page.tsx, 
                        // so we can use a simpler fallback or hardcode to a primary color.
                        // Since 'focus' mapping is '#6366F1' lets use that as default, or implement a basic version.
                        const tileColor = '#6366F1';

                        return (
                            <div
                                className="rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-row h-44"
                                style={{ backgroundColor: tileColor }}
                            >
                                <div className="flex-1 p-5 flex flex-col justify-between items-start">
                                    <div>
                                        <div className="flex gap-2 text-white/90 mb-2">
                                            <div className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
                                                RECOMMENDED
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-white leading-tight mt-1 line-clamp-2">
                                            {game.name}
                                        </h3>
                                    </div>
                                    <button className="bg-white text-black font-bold py-2 px-6 rounded-xl hover:bg-gray-100 transition-colors mt-2 text-lg">
                                        Play
                                    </button>
                                </div>
                                {game.screenshot && (
                                    <div className="relative aspect-square h-full shrink-0">
                                        <Image
                                            src={game.screenshot}
                                            alt={game.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </Link>
            </div>
        </div>
    );
}
