'use client';

import { useState, useRef, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import BottomTabs from '../../components/BottomTabs';
import FloatingExitButton from '../../components/FloatingExitButton';
import GameResultsInterstitial from '../../components/GameResultsInterstitial';
import FirstGameBadge from '../../components/FirstGameBadge';
import { getGameConfig } from '../../config/gameConfig';
import React from 'react';

interface GameClientProps {
    slug: string;
}

interface GameResults {
    score?: number;
    time?: number;
    level?: number;
    achievements?: string[];
    accuracy?: number;
    mistakes?: number;
    bonus?: number;
}

export default function GameClient({ slug }: GameClientProps) {
    const router = useRouter();
    const [isIframeLoaded, setIsIframeLoaded] = useState(false);
    const [gameState, setGameState] = useState<'playing' | 'completed' | 'paused'>('playing');
    const [gameResults, setGameResults] = useState<GameResults | null>(null);
    const [gameStartTime, setGameStartTime] = useState<number>(Date.now());
    const [isEarlyExit, setIsEarlyExit] = useState(false);
    const [showBadge, setShowBadge] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Decode the URL slug (handle spaces and special characters)
    const decodedSlug = decodeURIComponent(slug);

    // Get game configuration
    const gameConfig = getGameConfig(decodedSlug);

    // Construct the path to the game's index.html file
    const gamePath = `/games/live/${decodedSlug}/static/index.html`;

    const handleIframeLoad = () => {
        setIsIframeLoaded(true);
        setGameStartTime(Date.now());

        // Set up message listener for communication with the game
        window.addEventListener('message', handleGameMessage);

        console.log('handleIframeLoad');
    };

    const handleGameMessage = (event: MessageEvent) => {
        // Only accept messages from our game domain
        if (event.origin !== window.location.origin) return;

        const { type, data } = event.data;

        console.log(event.type, event.data);

        if (type == 'SCREENSHOT') {
            handleScreenshot(event);
            return;
        }

        switch (type) {
            case 'GAME_COMPLETE':
                handleGameComplete(data);
                break;
            case 'GAME_PAUSE':
                setGameState('paused');
                break;
            case 'GAME_RESUME':
                setGameState('playing');
                break;
            case 'GAME_SCORE_UPDATE':
                // Handle real-time score updates if needed
                break;
        }
    };

    const handleScreenshot = (event: MessageEvent) => {
        console.log('handleScreenshot', event.data);
    };

    const handleGameComplete = (data: any) => {
        const endTime = Date.now();
        const playTime = Math.floor((endTime - gameStartTime) / 1000);

        // Process the game completion data
        const results: GameResults = {
            score: data.score || Math.floor(Math.random() * 40) + 60, // Fallback score for demo
            time: playTime,
            level: data.level || 1,
            achievements: data.achievements || generateAchievements(data.score || 70),
            accuracy: data.accuracy || Math.floor(Math.random() * 30) + 70,
            mistakes: data.mistakes || Math.floor(Math.random() * 5),
            bonus: data.bonus || Math.floor(Math.random() * 20)
        };

        setIsEarlyExit(false);
        setGameResults(results);
        setGameState('completed');
        stopIframe();

        // Check for first game badge
        const hasSeenBadge = document.cookie.split('; ').find(row => row.startsWith('first_game_badge_seen='));
        if (!hasSeenBadge) {
            setShowBadge(true);
        }
    };

    const stopIframe = () => {
        if (iframeRef.current) {
            // remove event listener
            window.removeEventListener('message', handleGameMessage);
            // remove iframe
            iframeRef.current.remove();
        }
    };

    const generateAchievements = (score: number): string[] => {
        const achievements: string[] = [];

        if (score >= 90) {
            achievements.push('Perfect Score!', 'Master Player', 'Speed Demon');
        } else if (score >= 80) {
            achievements.push('Great Performance', 'Quick Thinker');
        } else if (score >= 70) {
            achievements.push('Good Effort', 'Getting Better');
        } else if (score >= 50) {
            achievements.push('Good Start', 'Keep Going');
        } else if (score >= 30) {
            achievements.push('First Steps', 'Learning');
        } else {
            achievements.push('Getting Started', 'Try Again');
        }

        return achievements;
    };

    const handlePlayAgain = () => {
        // Reset game state
        setGameState('playing');
        setGameResults(null);
        setGameStartTime(Date.now());
        setIsEarlyExit(false);

        // Reload the iframe to restart the game
        if (iframeRef.current) {
            iframeRef.current.src = iframeRef.current.src;
        }
    };

    const handleBackToGames = () => {
        // Reset game state when actually leaving
        setGameState('playing');
        setGameResults(null);
        setGameStartTime(Date.now());
        setIsEarlyExit(false);
        router.push('/games');
    };

    const handleExitGame = () => {
        if (gameState === 'completed') {
            // If game is already completed, just go back to games
            handleBackToGames();
        } else {
            // If game is in progress, show results interstitial with current progress
            const currentTime = Math.floor((Date.now() - gameStartTime) / 1000);

            // Generate results based on current game state
            const exitResults: GameResults = {
                score: Math.max(0, Math.min(100, Math.floor(Math.random() * 40) + 40)), // Fallback score for demo
                time: currentTime,
                level: 1, // Default level for early exit
                achievements: generateAchievements(40), // Default achievements for early exit
                accuracy: Math.max(0, Math.min(100, Math.floor(Math.random() * 30) + 50)), // Default accuracy for early exit
                mistakes: Math.floor(Math.random() * 3), // Default mistakes for early exit
                bonus: Math.floor(Math.random() * 10) // Default bonus for early exit
            };

            setIsEarlyExit(true);
            setGameResults(exitResults);
            setGameState('completed');

            // Check for first game badge on early exit too? Maybe only on full completion?
            // Let's show it on any completion for now to encourage the user.
            const hasSeenBadge = document.cookie.split('; ').find(row => row.startsWith('first_game_badge_seen='));
            if (!hasSeenBadge) {
                setShowBadge(true);
            }
        }
    };

    const handleBadgeDismiss = () => {
        setShowBadge(false);
        // Set cookie to expire in 1 year
        const date = new Date();
        date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
        document.cookie = `first_game_badge_seen=true; expires=${date.toUTCString()}; path=/`;
    };

    // Reset state when slug changes
    useEffect(() => {
        setIsIframeLoaded(false);
        setGameState('playing');
        setGameResults(null);
        setGameStartTime(Date.now());
        setIsEarlyExit(false);
    }, [slug]);

    // Cleanup message listener
    useEffect(() => {
        return () => {
            window.removeEventListener('message', handleGameMessage);
        };
    }, []);

    console.log('gamePath', gamePath);

    return (
        <div className="font-sans min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col min-h-screen">
                {/* Game iframe */}
                <main className="flex-1 relative">
                    <iframe
                        ref={iframeRef}
                        src={gamePath}
                        className="w-full h-full min-h-screen border-0"
                        title={`${decodedSlug} Game`}
                        allowFullScreen
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                        onLoad={handleIframeLoad}
                    />

                    {/* Floating exit button - only show when iframe is loaded */}
                    {isIframeLoaded && (
                        <FloatingExitButton
                            position={gameConfig.exitButtonPosition}
                            color={gameConfig.customExitButton?.color || 'red'}
                            size={gameConfig.customExitButton?.size || 'md'}
                            onClick={handleExitGame}
                        />
                    )}
                </main>

                {/* Bottom tabs - hide when iframe is loaded and hideBottomTabs is true */}
                {(!isIframeLoaded || !gameConfig.hideBottomTabs) && <BottomTabs />}
            </div>

            {/* Post-game results interstitial */}
            {gameState === 'completed' && gameResults && (
                <GameResultsInterstitial
                    gameSlug={decodedSlug}
                    results={gameResults}
                    onPlayAgain={handlePlayAgain}
                    onBackToGames={handleBackToGames}
                    isEarlyExit={isEarlyExit}
                />
            )}

            {/* First Game Badge Popup */}
            {showBadge && (
                <FirstGameBadge onDismiss={handleBadgeDismiss} />
            )}
        </div>
    );
}
