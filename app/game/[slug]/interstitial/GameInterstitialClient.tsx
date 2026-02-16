'use client';

import React, { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { getGameConfig, getGameDetails } from '../../../config/gameConfig';
import { getGameBySlug } from '../../../api/api';

const SKILL_ICONS: Record<string, string> = {
    // Explicit mappings for known deviations or preferred naming
    'Deduction': '/images/skills/DeductiveReasoning.png',
    'Attention': '/images/skills/SelectiveAttention.png',
    'Memory': '/images/skills/Memorization.png',
    'Logic': '/images/skills/DeductiveReasoning.png', // Fallback
    // Direct matches that might need help
    'Perceptual Speed': '/images/skills/PerceptualSpeed.png',
    'Speed Of Closure': '/images/skills/SpeedOfClosure.png',
    'Selective Attention': '/images/skills/SelectiveAttention.png',
    'Task Switching': '/images/skills/TaskSwitching.png',
    'Information Ordering': '/images/skills/InformationOrdering.png',
    'Inductive Reasoning': '/images/skills/InductiveReasoning.png',
    'Deductive Reasoning': '/images/skills/DeductiveReasoning.png',
    'Number Facility': '/images/skills/NumberFacility.png',
    'Visualization': '/images/skills/Visualization.png',
};

const MOOD_ICONS: Record<string, string> = {
    'Focus': '/images/mindsets/Focus.png',
    'Relax': '/images/mindsets/Relax.png',
    'Collaboration': '/images/mindsets/Collaboration.png',
    'Innovate': '/images/mindsets/Innovate.png',
    // Fallbacks or missing icons can use default handling or be added here
};

interface GameInterstitialClientProps {
    slug: string;
}

export default function GameInterstitialClient({ slug }: GameInterstitialClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [gameApiData, setGameApiData] = useState<any>(null);

    // Decode the URL slug (handle spaces and special characters)
    const decodedSlug = decodeURIComponent(slug);

    // Get game configuration and details
    const gameConfig = getGameConfig(decodedSlug);
    const gameDetails = getGameDetails(decodedSlug);

    useEffect(() => {
        const fetchGameData = async () => {
            try {
                const data = await getGameBySlug(decodedSlug);
                if (data) {
                    setGameApiData(data);
                }
            } catch (error) {
                console.error("Error fetching game data:", error);
            }
        };
        fetchGameData();
    }, [decodedSlug]);

    if (!gameDetails) {
        notFound();
    }

    const handleStartGame = () => {
        setIsLoading(true);
        router.push(`/game/${encodeURIComponent(decodedSlug)}`);
    };

    const handleBackToGames = () => {
        router.push('/games');
    };

    const displayImage = gameDetails.image || gameApiData?.image;

    return (
        <div className="font-sans min-h-screen bg-background">
            <div className="flex flex-col min-h-screen pb-2">
                {/* Header */}
                <header className="bg-card shadow-sm border-b border-border">
                    <div className="px-4 py-4">
                        <div className="flex items-center">
                            <button
                                onClick={handleBackToGames}
                                className="mr-3 p-2 rounded-lg hover:bg-secondary transition-colors"
                            >
                                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h1 className="text-xl font-semibold text-foreground">
                                {gameDetails.name}
                            </h1>
                        </div>
                    </div>
                </header>


                {/* Game Title and Image */}
                <div className="bg-card mb-2">
                    {displayImage ? (
                        <div className="w-full h-48 sm:h-64 relative">
                            <img
                                src={displayImage}
                                alt={gameDetails.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Game Preview Section */}
                <main className="flex-1 px-2 py-2">
                    <div className="max-w-2xl mx-auto">

                        {/* Game Information */}
                        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
                            <h3 className="text-xl font-semibold text-foreground mb-4">
                                About This Game
                            </h3>

                            {gameDetails.category && (
                                <div className="mb-4">
                                    <span className="text-sm font-medium text-muted-foreground">Category:</span>
                                    <span className="ml-2 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                                        {gameDetails.category}
                                    </span>
                                </div>
                            )}

                            {/* {gameDetails.difficulty && (
                                <div className="mb-4">
                                    <span className="text-sm font-medium text-muted-foreground">Difficulty:</span>
                                    <span className="ml-2 px-3 py-1 bg-accent/10 text-accent text-sm rounded-full">
                                        {gameDetails.difficulty}
                                    </span>
                                </div>
                            )} */}

                            {gameDetails.estimatedTime && (
                                <div className="mb-4">
                                    <span className="text-sm font-medium text-muted-foreground">Estimated Time:</span>
                                    <span className="ml-2 text-foreground">
                                        {gameDetails.estimatedTime}
                                    </span>
                                </div>
                            )}

                            {/* Skills Section */}
                            {(gameApiData?.skills?.length > 0 || (!gameApiData && gameDetails.skills)) && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Skills Developed</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {(gameApiData?.skills || gameDetails.skills?.map(s => ({ name: s, slug: s.toLowerCase().replace(/ /g, '-') }))).map((skill: any, index: number) => {
                                            const iconPath = SKILL_ICONS[skill.name] || SKILL_ICONS[skill.name.replace(/\s+/g, '')] || `/images/skills/${skill.name.replace(/\s+/g, '')}.png`;
                                            // Fallback to text if image fails to load is handled by the browser alt, but we can't check existence easily here.
                                            // We will try to use the map first.

                                            return (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg shadow-sm"
                                                >
                                                    <img
                                                        src={iconPath}
                                                        alt={skill.name}
                                                        className="w-5 h-5 object-contain rounded-[4px]"
                                                        onError={(e) => {
                                                            e.currentTarget.onerror = null;
                                                            e.currentTarget.src = '/logo192.png';
                                                        }}
                                                    />
                                                    <span className="text-sm font-medium text-foreground">
                                                        {skill.name}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Moods Section */}
                            {gameApiData?.moods?.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Moods</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {gameApiData.moods.map((mood: any, index: number) => {
                                            const iconPath = MOOD_ICONS[mood.name] || `/images/mindsets/${mood.name.replace(/\s+/g, '')}.png`;

                                            return (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg shadow-sm"
                                                >
                                                    <img
                                                        src={iconPath}
                                                        alt={mood.name}
                                                        className="w-5 h-5 object-contain rounded-[4px]"
                                                        onError={(e) => {
                                                            e.currentTarget.onerror = null;
                                                            e.currentTarget.src = '/logo192.png';
                                                        }}
                                                    />
                                                    <span className="text-sm font-medium text-foreground">
                                                        {mood.name}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {gameDetails.instructions && (
                                <div>
                                    <span className="text-sm font-medium text-muted-foreground">How to Play:</span>
                                    <p className="mt-2 text-foreground">
                                        {gameDetails.instructions}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleStartGame}
                                disabled={isLoading}
                                className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        Start Game
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleBackToGames}
                                className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-4 px-6 rounded-lg transition-colors duration-200"
                            >
                                Back to Games
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
