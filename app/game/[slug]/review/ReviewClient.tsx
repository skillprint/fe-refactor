'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getGameDetails } from '../../../config/gameConfig';
import { PollResultsResponse, SkillprintClient } from '../../../lib/skillprintSdk';

interface GameResults {
    score?: number;
    time?: number;
    level?: number;
    achievements?: string[];
    accuracy?: number;
    mistakes?: number;
    bonus?: number;
}

interface ReviewClientProps {
    slug: string;
    sessionId?: string;
}

export default function ReviewClient({ slug, sessionId }: ReviewClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isCalculating, setIsCalculating] = useState(true);
    const [calculationError, setCalculationError] = useState<string | undefined>(undefined);
    const [closedSessionResult, setClosedSessionResult] = useState<PollResultsResponse | null>(null);
    const [gameResults, setGameResults] = useState<GameResults | null>(null);

    // Decode the URL slug (handle spaces and special characters)
    const decodedSlug = decodeURIComponent(slug);

    // Get game details
    const gameDetails = getGameDetails(decodedSlug);

    const getApiKey = () => {
        if (typeof document === 'undefined') return '';
        const cookie = document.cookie.split('; ').find(row => row.startsWith('api_key='));
        return cookie ? cookie.split('=')[1] : 'test-api-key';
    };

    // Poll for results when component mounts
    useEffect(() => {
        if (!sessionId) {
            setCalculationError('No session ID provided');
            setIsCalculating(false);
            return;
        }

        const pollResults = async () => {
            setIsCalculating(true);
            setCalculationError(undefined);

            const apiKey = getApiKey();
            const client = new SkillprintClient({
                apiKey,
                baseUrl: 'https://api.skillprint.co/',
                logger: (msg, level) => console.log(`[Skillprint SDK] ${level}: ${msg}`)
            });

            const startTime = Date.now();
            const timeout = 20000; // 20 seconds

            const poll = async () => {
                if (Date.now() - startTime > timeout) {
                    setIsCalculating(false);
                    setCalculationError('Score calculation took longer than expected. Please try again.');
                    return;
                }

                try {
                    const polledRes = await client.pollParameterResults(sessionId);

                    if (polledRes && polledRes.state === "CLOSED") {
                        setIsCalculating(false);
                        setClosedSessionResult(polledRes);

                        // Extract game results from session data if available
                        // This is a placeholder - adjust based on your actual data structure
                        const results: GameResults = {
                            score: 0, // Extract from polledRes if available
                            time: 0,
                            level: 1,
                            achievements: [],
                            accuracy: 0,
                            mistakes: 0,
                            bonus: 0
                        };
                        setGameResults(results);
                    } else {
                        setTimeout(poll, 2000);
                    }
                } catch (e) {
                    console.error('Polling error', e);
                    setTimeout(poll, 2000);
                }
            };

            poll();
        };

        pollResults();
    }, [sessionId]);

    const handlePlayAgain = () => {
        setIsLoading(true);
        router.push(`/game/${slug}/interstitial`);
    };

    const handleBackToGames = () => {
        router.push('/games');
    };

    const handleViewProfile = () => {
        router.push('/profile');
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6 text-center text-white">
                    <div className="w-20 h-20 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Game Complete!</h2>
                    <p className="text-blue-100">{gameDetails?.name || decodedSlug}</p>
                </div>

                {/* Results Content */}
                <div className="p-6">
                    {/* Calculation Loading State */}
                    {isCalculating ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <svg className="animate-spin h-12 w-12 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-lg font-medium text-foreground">Calculating results...</p>
                            <p className="text-sm text-muted-foreground mt-2">Just a moment while we analyze your gameplay.</p>
                        </div>
                    ) : (
                        <>
                            {/* Calculation Error */}
                            {calculationError && (
                                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg mb-6 text-center text-sm font-medium">
                                    {calculationError}
                                </div>
                            )}

                            {/* Session Results */}
                            {closedSessionResult && (
                                <div className="mb-6 space-y-6">
                                    <h3 className="text-lg font-semibold text-foreground mb-4">Your Skillprint Analysis</h3>

                                    {/* Skill Scores Section */}
                                    {closedSessionResult.skillScores && closedSessionResult.skillScores.metrics && (
                                        <div>
                                            <h4 className="text-md font-semibold text-foreground mb-3">Skill Scores</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                {Object.entries(closedSessionResult.skillScores.metrics)
                                                    .filter(([_, metric]) => metric.score > 0)
                                                    .map(([skillName, metric]) => (
                                                        <div key={skillName} className="bg-secondary rounded-lg p-3">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-medium text-muted-foreground capitalize mb-1">
                                                                    {skillName.replace(/-/g, ' ')}
                                                                </span>
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className="text-2xl font-bold text-primary">
                                                                        {(metric.score * 100).toFixed(0)}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground">/ 100</span>
                                                                </div>
                                                                {/* Progress bar */}
                                                                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                                                                        style={{ width: `${metric.score * 100}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Mood Scores Section */}
                                    {closedSessionResult.moodScores && (
                                        <div>
                                            <h4 className="text-md font-semibold text-foreground mb-3">Mood Analysis</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Target Mood */}
                                                <div className="bg-secondary rounded-lg p-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-medium text-muted-foreground mb-1">
                                                            Target Mood
                                                        </span>
                                                        <span className="text-lg font-bold text-primary capitalize">
                                                            {closedSessionResult.moodScores.targetMood}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Flow Score */}
                                                {closedSessionResult.moodScores.flowScore > 0 && (
                                                    <div className="bg-secondary rounded-lg p-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-medium text-muted-foreground mb-1">
                                                                Flow Score
                                                            </span>
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-2xl font-bold text-primary">
                                                                    {(closedSessionResult.moodScores.flowScore * 100).toFixed(0)}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">/ 100</span>
                                                            </div>
                                                            {/* Progress bar */}
                                                            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                                                                    style={{ width: `${closedSessionResult.moodScores.flowScore * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Confidence */}
                                                {closedSessionResult.moodScores.confidence > 0 && (
                                                    <div className="bg-secondary rounded-lg p-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-medium text-muted-foreground mb-1">
                                                                Confidence
                                                            </span>
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-2xl font-bold text-primary">
                                                                    {(closedSessionResult.moodScores.confidence * 100).toFixed(0)}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">/ 100</span>
                                                            </div>
                                                            {/* Progress bar */}
                                                            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                                                                    style={{ width: `${closedSessionResult.moodScores.confidence * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Display parameter updates if available */}
                                    {closedSessionResult.parameterUpdates && closedSessionResult.parameterUpdates.length > 0 && (
                                        <div>
                                            <h4 className="text-md font-semibold text-foreground mb-3">Parameter Updates</h4>
                                            <div className="space-y-3">
                                                {closedSessionResult.parameterUpdates.map((update, index) => (
                                                    <div key={index} className="bg-secondary rounded-lg p-4">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm font-medium text-foreground">{update.parameterName}</span>
                                                            <span className="text-lg font-bold text-primary">{update.newValue}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Stats Grid */}
                            {gameResults && (
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    {gameResults.time !== undefined && (
                                        <div className="bg-secondary rounded-lg p-4 text-center">
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {formatTime(gameResults.time)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Play Time</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={handlePlayAgain}
                                    disabled={isLoading}
                                    className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
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
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Play Again
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={handleViewProfile}
                                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    View Profile
                                </button>

                                <button
                                    onClick={handleBackToGames}
                                    className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                                >
                                    Back to Games
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
