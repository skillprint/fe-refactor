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
                                        <div className="flex gap-2 text-white/90 mb-2 items-center">
                                            <div className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
                                                RECOMMENDED
                                            </div>
                                            <div className="relative group/tooltip">
                                                <svg className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-2.5 bg-gray-900 text-white text-xs font-normal Normal rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:visible group-hover/tooltip:opacity-100 transition-all z-20 pointer-events-none text-center">
                                                    We've picked a game just for you based on your goals to help improve your Skillprint.
                                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                                </div>
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
