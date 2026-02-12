'use client';

import { useState, useRef, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import BottomTabs from '../../components/BottomTabs';
import FloatingExitButton from '../../components/FloatingExitButton';
import GameResultsInterstitial from '../../components/GameResultsInterstitial';
import FirstGameBadge from '../../components/FirstGameBadge';
import { getGameConfig } from '../../config/gameConfig';
import React from 'react';
import { saveGameSession, GameSession } from '../../lib/gameSessionUtils';
import { SkillprintClient, Mood, LogLevel, ParameterUpdateResult, PollResultsResponse, Adjustment } from '../../lib/skillprintSdk';
import GameAdjustmentBanner from '../../components/GameAdjustmentBanner';

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

export const unifiedSlugFromBESlug = (slug: string) => {
    if (slug.indexOf('0hh1') >= 0) return '0hh1';
    if (slug.indexOf('2048') >= 0) return '2048';
    if (slug.indexOf('alchemy') >= 0) return 'alchemy';
    if (slug.indexOf('box-tower') >= 0) return 'box-tower';
    if (slug.indexOf('brick-out') >= 0) return 'brick-out';
    if (slug.indexOf('bubble-spirit') >= 0) return 'bubble-spirit';
    if (slug.indexOf('change-word') >= 0) return 'change-word';
    if (slug.indexOf('colorize-2') >= 0) return 'colorize-2';
    if (slug.indexOf('flapcat-steampunk-2') >= 0) return 'flapcat-steampunk-2';
    if (slug.indexOf('flapcat-steampunk') >= 0) return 'flapcat-steampunk';
    if (slug.indexOf('fruit-boom') >= 0) return 'fruit-boom';
    if (slug.indexOf('fruit-sorting') >= 0) return 'fruit-sorting';
    if (slug.indexOf('garden-match') >= 0) return 'garden-match';
    if (slug.indexOf('gems-of-hanoi') >= 0) return 'gems-of-hanoi';
    if (slug.indexOf('gummy-blocks') >= 0) return 'gummy-blocks';
    if (slug.indexOf('hextris') >= 0) return 'hextris';
    if (slug.indexOf('hiding-master') >= 0) return 'hiding-master';
    if (slug.indexOf('i-love-hue') >= 0) return 'i-love-hue';
    if (slug.indexOf('impossible-10') >= 0) return 'impossible-10';
    if (slug.indexOf('katana-fruits') >= 0) return 'katana-fruits';
    if (slug.indexOf('mahjong-deluxe') >= 0) return 'mahjong-deluxe';
    if (slug.indexOf('match-doodle') >= 0) return 'match-doodle';
    if (slug.indexOf('mine-rusher') >= 0) return 'mine-rusher';
    if (slug.indexOf('photo-hunt') >= 0) return 'photo-hunt';
    if (slug.indexOf('snake-attack') >= 0) return 'snake-attack';
    if (slug.indexOf('space-adventure-pinball') >= 0) return 'space-adventure-pinball';
    if (slug.indexOf('space-trip') >= 0) return 'space-trip';
    if (slug.indexOf('stacks-tower') >= 0) return 'stacks-tower';
    if (slug.indexOf('star-puzzles') >= 0) return 'star-puzzles';
    if (slug.indexOf('sumagi') >= 0) return 'sumagi';
    if (slug.indexOf('sweet-memory') >= 0) return 'sweet-memory';
    if (slug.indexOf('ultimate-sudoku') >= 0) return 'ultimate-sudoku';
    if (slug.indexOf('whack-em-all') >= 0) return 'whack-em-all';

    return slug;
}


export const mapSlugToGamePath = (slug: string) => {
    const unifiedSlug = unifiedSlugFromBESlug(slug);

    switch (unifiedSlug) {
        case '0hh1': return '/games/live/0hh1/static/index.html';
        case '2048': return '/games/live/2048/static/index.html';
        case 'alchemy': return '/games/live/Alchemy/static/index.html';
        case 'box-tower': return '/games/live/Box Tower/static/index.html';
        case 'brick-out': return '/games/live/Brick Out/static/index.html';
        case 'bubble-spirit': return '/games/live/Bubble Spirit/static/index.html';
        case 'change-word': return '/games/live/Change Word/static/index.html';
        case 'colorize-2': return '/games/live/Colorize 2/static/index.html';
        case 'flapcat-steampunk': return '/games/live/Flapcat Steampunk/static/index.html';
        case 'flapcat-steampunk-2': return '/games/live/Flapcat Steampunk 2/static/index.html';
        case 'fruit-boom': return '/games/live/Fruit Boom/static/index.html';
        case 'fruit-sorting': return '/games/live/Fruit Sorting/static/index.html';
        case 'garden-match': return '/games/live/Garden Match/static/index.html';
        case 'gems-of-hanoi': return '/games/live/Gems of Hanoi/static/index.html';
        case 'gummy-blocks': return '/games/live/Gummy Blocks/static/index.html';
        case 'hextris': return '/games/live/Hextris/static/index.html';
        case 'hiding-master': return '/games/live/Hiding Master/static/index.html';
        case 'i-love-hue': return '/games/live/I Love Hue/static/index.html';
        case 'impossible-10': return '/games/live/Impossible 10/static/index.html';
        case 'katana-fruits': return '/games/live/Katana Fruits/static/index.html';
        case 'mahjong-deluxe': return '/games/live/Mahjong Deluxe/static/index.html';
        case 'match-doodle': return '/games/live/Match Doodle/static/index.html';
        case 'mine-rusher': return '/games/live/Mine Rusher/static/index.html';
        case 'photo-hunt': return '/games/live/Photo Hunt/static/index.html';
        case 'snake-attack': return '/games/live/Snake Attack/static/index.html';
        case 'space-adventure-pinball': return '/games/live/Space Adventure Pinball/static/index.html';
        case 'space-trip': return '/games/live/Space Trip/static/index.html';
        case 'stacks-tower': return '/games/live/Stacks Tower/static/index.html';
        case 'star-puzzles': return '/games/live/Star Puzzles/static/index.html';
        case 'sumagi': return '/games/live/Sumagi/static/index.html';
        case 'sweet-memory': return '/games/live/Sweet Memory/static/index.html';
        case 'ultimate-sudoku': return '/games/live/Ultimate Sudoku/static/index.html';
        case 'whack-em-all': return "/games/live/Whack 'em All/static/index.html";
        default: return `/games/live/${slug}/static/index.html`;
    }
};

export default function GameClient({ slug }: GameClientProps) {
    const router = useRouter();
    const [isIframeLoaded, setIsIframeLoaded] = useState(false);
    const [gameState, setGameState] = useState<'playing' | 'completed' | 'paused'>('playing');
    const [gameResults, setGameResults] = useState<GameResults | null>(null);
    const [gameStartTime, setGameStartTime] = useState<number>(Date.now());
    const [isEarlyExit, setIsEarlyExit] = useState(false);
    const [showBadge, setShowBadge] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [calculationError, setCalculationError] = useState<string | undefined>(undefined);
    const [closedSessionResult, setClosedSessionResult] = useState<PollResultsResponse | null>(null);
    const skillprintSessionIdRef = useRef<string>('');
    const skillprintClientRef = useRef<SkillprintClient | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [pollForSessionTips, setPollForSessionTips] = useState(false);
    const [lastSessionResponse, setLastSessionResponse] = useState<PollResultsResponse | null>(null);
    const [currentAdjustment, setCurrentAdjustment] = useState<Adjustment | null>(null);
    const processedAdjustmentsRef = useRef<Set<string>>(new Set());
    const lastAdjustmentTimeRef = useRef<number>(0);

    const getApiKey = () => {
        if (typeof document === 'undefined') return '';
        const cookie = document.cookie.split('; ').find(row => row.startsWith('api_key='));
        return cookie ? cookie.split('=')[1] : 'test-api-key';
    };

    // Decode the URL slug (handle spaces and special characters)
    const decodedSlug = decodeURIComponent(slug);
    const gamePath = mapSlugToGamePath(decodedSlug);

    // Get game configuration
    const gameConfig = getGameConfig(decodedSlug);

    const handleIframeLoad = () => {
        setIsIframeLoaded(true);
        setGameStartTime(Date.now());
        setPollForSessionTips(true);

        // Set up message listener for communication with the game
        window.addEventListener('message', handleGameMessage);
    };

    const handleGameMessage = (event: MessageEvent) => {
        // Only accept messages from our game domain
        if (event.origin !== window.location.origin) return;

        const { type, data } = event.data;

        if (type == 'screenshot') {
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

    const handleScreenshot = async (event: MessageEvent) => {
        if (skillprintClientRef.current && skillprintSessionIdRef.current) {
            try {
                // Assuming event.data is the base64 string directly or contains it
                const base64Data = event.data?.data || event.data;

                if (typeof base64Data === 'object') {
                    const base64String = base64Data.dataUrl;
                    skillprintClientRef.current.setLastScreenshotDataURI(base64String);
                    const fetchedResponse = await fetch(base64String);
                    const blob = await fetchedResponse.blob();

                    skillprintClientRef.current.postScreenshots(skillprintSessionIdRef.current, [blob]);
                }
            } catch (e) {
                console.error('Failed to process screenshot', e);
            }
        }
    };

    const pollResults = async () => {
        if (!skillprintClientRef.current || !skillprintSessionIdRef.current) return;

        setIsCalculating(true);
        setCalculationError(undefined);

        const startTime = Date.now();
        const timeout = 20000; // 20 seconds

        const poll = async () => {
            if (Date.now() - startTime > timeout) {
                setIsCalculating(false);
                setCalculationError('Score calculation took longer than expected. Please try again.');
                return;
            }

            try {
                const polledRes = await skillprintClientRef.current!.pollParameterResults(skillprintSessionIdRef.current);

                if (polledRes && polledRes.state === "CLOSED") {
                    setIsCalculating(false);
                    setClosedSessionResult(polledRes);
                } else {
                    // Keep polling if no updates or empty updates (depending on API behavior, usually empty implies still processing or no changes)
                    // If API returns empty array when 'done but no changes', we might need a status field. 
                    // The requirement says "poll to see if when the computed data... is ready".
                    // We'll assume any successful response means 'ready' if it's not a 202 or similar?
                    // The API client throws on error. If it returns [], it means success but no updates?
                    // Let's assume we poll for a bit. If we get something, great. If not, eventually timeout?
                    // Or maybe just ONE poll is enough if we wait?
                    // Re-reading: "polling should occur... If 20 seconds go by... timeout".
                    // This implies repeated polling.
                    setTimeout(poll, 2000);
                }
            } catch (e) {
                console.error('Polling error', e);
                // On error, we might want to retry or fail?
                // For now, retry until timeout (as some errors might be 404/not ready?)
                setTimeout(poll, 2000);
            }
        };

        poll();
    };

    const pollSessionTips = async () => {
        if (!skillprintClientRef.current || !skillprintSessionIdRef.current) return;

        const poll = async () => {
            try {
                const polledRes = await skillprintClientRef.current!.pollParameterResults(skillprintSessionIdRef.current);

                if (polledRes && polledRes.state === "OPEN") {
                    setLastSessionResponse(polledRes);

                    // Process telemetry adjustments
                    if (polledRes.telemetry && polledRes.telemetry.length > 0) {
                        try {
                            const now = Date.now();
                            // Check cooldown (30 seconds)
                            if (now - lastAdjustmentTimeRef.current >= 30000) {
                                // Find the latest adjustment we haven't processed yet
                                // Sort by date descending to get latest first
                                const sortedTelemetry = [...polledRes.telemetry].sort((a, b) =>
                                    new Date(b.adjustment.createDate).getTime() - new Date(a.adjustment.createDate).getTime()
                                );

                                // Find the first one that hasn't been processed
                                const latestItem = sortedTelemetry.find(item => {
                                    const adj = item.adjustment;
                                    const adjId = `${adj.gameSlug}-${adj.createDate}-${adj.parameterName}`;
                                    return !processedAdjustmentsRef.current.has(adjId);
                                });

                                if (latestItem && latestItem.adjustment) {
                                    const adj = latestItem.adjustment;
                                    const adjId = `${adj.gameSlug}-${adj.createDate}-${adj.parameterName}`;

                                    console.log("Applying game adjustment:", adj);
                                    processedAdjustmentsRef.current.add(adjId);
                                    lastAdjustmentTimeRef.current = now;

                                    // Send to iframe
                                    if (iframeRef.current?.contentWindow) {
                                        iframeRef.current.contentWindow.postMessage({
                                            type: 'ADJUST_GAME',
                                            data: adj
                                        }, '*');
                                    }

                                    // Show banner
                                    setCurrentAdjustment(adj);
                                }
                            }
                        } catch (err) {
                            console.error("Error processing telemetry:", err);
                        }
                    }
                }

                if (pollForSessionTips) {
                    setTimeout(poll, 2000);
                }
            } catch (e) {
                console.error('Polling error', e);
                if (pollForSessionTips) {
                    setTimeout(poll, 2000);
                }
            }
        };

        setTimeout(poll, 2000);
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

        setPollForSessionTips(false);
        setIsEarlyExit(false);
        setGameResults(results);
        setGameState('completed');
        stopIframe();
        // skillprintClientRef.current?.stopGameSession();

        // Record the game session
        const session: GameSession = {
            id: Math.random().toString(36).substr(2, 9),
            gameSlug: decodedSlug,
            timestamp: endTime,
            duration: playTime,
            score: results.score,
            completed: true,
            metadata: {
                level: results.level,
                accuracy: results.accuracy,
                mistakes: results.mistakes
            }
        };
        saveGameSession(session);

        if (skillprintClientRef.current && skillprintSessionIdRef.current) {
            skillprintClientRef.current.postScreenshots(skillprintSessionIdRef.current, [], true);
            pollResults();
        }

        // Check for first game badge
        const hasSeenBadge = document.cookie.split('; ').find(row => row.startsWith('first_game_badge_seen='));
        if (!hasSeenBadge) {
            setShowBadge(true);
        }
    };

    const stopIframe = () => {
        console.log('stopIframe', iframeRef.current);
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

            setIsEarlyExit(false);
            setGameResults(exitResults);
            setGameState('completed');
            stopIframe();
            setPollForSessionTips(false);

            // Check for first game badge on early exit too? Maybe only on full completion?
            // Let's show it on any completion for now to encourage the user.
            if (skillprintClientRef.current && skillprintSessionIdRef.current) {
                skillprintClientRef.current.postScreenshots(skillprintSessionIdRef.current, [], true);
                pollResults();
            }

            // Check for first game adge
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
        setIsCalculating(false);
        setCalculationError(undefined);
        setCurrentAdjustment(null);
        processedAdjustmentsRef.current.clear();
        lastAdjustmentTimeRef.current = 0;

        // Initialize Skillprint Session
        const sessionId = crypto.randomUUID();
        skillprintSessionIdRef.current = sessionId;
        const apiKey = getApiKey();

        // Use staging by default as per existing code
        const client = new SkillprintClient({
            apiKey,
            baseUrl: 'https://api.skillprint.co/',
            logger: (msg, level) => console.log(`[Skillprint SDK] ${level}: ${msg}`)
        });
        skillprintClientRef.current = client;

        try {
            client.startSession(sessionId, Mood.FOCUS, decodedSlug);
            setPollForSessionTips(true);
            pollSessionTips();
        } catch (e) {
            console.error('Failed to start Skillprint session', e);
        }

        injectJavascriptIntoIframe();
    }, [slug, setPollForSessionTips, pollForSessionTips]);

    // Cleanup message listener
    useEffect(() => {
        return () => {
            window.removeEventListener('message', handleGameMessage);
        };
    }, []);

    const injectJavascriptIntoIframe = () => {
        if (iframeRef.current) {
            const iframeDocument = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
            const scriptUrl = '/lib/skillprint-js-sdk/main-manager.js';
            if (iframeDocument) {
                const script = iframeDocument.createElement('script');
                script.src = scriptUrl;
                iframeDocument.body.appendChild(script);
            }
        }
    };

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

                    {/* Adjustment Banner */}
                    {currentAdjustment && (
                        <GameAdjustmentBanner
                            parameterName={currentAdjustment.parameterName}
                            parameterValue={currentAdjustment.parameterValue}
                            onDismiss={() => setCurrentAdjustment(null)}
                        />
                    )}

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
                    isCalculating={isCalculating}
                    calculationError={calculationError}
                    closedSessionResult={closedSessionResult}
                />
            )}

            {/* First Game Badge Popup */}
            {showBadge && (
                <FirstGameBadge onDismiss={handleBadgeDismiss} />
            )}
        </div>
    );
}
