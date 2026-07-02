'use client';

import { useState, useRef, useEffect } from 'react';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { useUserSession } from '../../hooks/useUserSession';
import FloatingExitButton from '../../components/FloatingExitButton';
import { getGameConfig, knownGameSlugs } from '../../config/gameConfig';
import React from 'react';
import { saveGameSession, GameSession } from '../../lib/gameSessionUtils';
import { SkillprintClient, Mood, LogLevel, ParameterUpdateResult, PollResultsResponse, Adjustment } from '../../lib/skillprintSdk';
import GameAdjustmentBanner from '../../components/GameAdjustmentBanner';
import GameAdjustmentTester from '../../components/GameAdjustmentTester';
import { getGameBySlug, get } from '../../api/api';
import { getApiBaseUrl } from '../../utils/cookieUtils';

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

export const mapLocalGameSlugToServerGameSlug = (slug: string) => {
    const map: any = {
        '/games/live/Change Word/static/index.html': 'change-word-0bc38905-8138-43f2-9ff5-a01a5f038782',
        'change-word': 'change-word-0bc38905-8138-43f2-9ff5-a01a5f038782',
        'colorize-2': 'colorize-2-79f1475d-c180-43e0-a496-0123c3972709'
    }

    console.log("Mapped: ", slug, map[slug]);

    return map[slug] || slug;
}

export const unifiedSlugFromBESlug = (slug: string) => {
    const lowerSlug = slug.toLowerCase().replace(/\s+/g, '-');
    if (lowerSlug.indexOf('0hh1') >= 0 || lowerSlug.indexOf('0h-h1') >= 0) return '0hh1';
    if (lowerSlug.indexOf('2048') >= 0) return '2048';
    if (lowerSlug.indexOf('alchemy') >= 0) return 'alchemy';
    if (lowerSlug.indexOf('box-tower') >= 0) return 'box-tower';
    if (lowerSlug.indexOf('brick-out-54e74305-8000-4605-b6b7-cf9412dd285b') >= 0) return 'brick-out';
    if (lowerSlug.indexOf('bubble-spirit') >= 0) return 'bubble-spirit';
    if (lowerSlug.indexOf('change-word') >= 0) return 'change-word';
    if (lowerSlug.indexOf('colorize') >= 0) return 'colorize-2';
    if (lowerSlug.indexOf('flapcat-steampunk-2') >= 0) return 'flapcat-steampunk-2';
    if (lowerSlug.indexOf('flapcat-steampunk') >= 0) return 'flapcat-steampunk';
    if (lowerSlug.indexOf('fruit-boom') >= 0) return 'fruit-boom';
    if (lowerSlug.indexOf('fruit-sorting') >= 0) return 'fruit-sorting';
    if (lowerSlug.indexOf('garden-match') >= 0) return 'garden-match';
    if (lowerSlug.indexOf('gems-of-hanoi') >= 0) return 'gems-of-hanoi';
    if (lowerSlug.indexOf('gummy-blocks') >= 0) return 'gummy-blocks';
    if (lowerSlug.indexOf('hextris') >= 0) return 'hextris';
    if (lowerSlug.indexOf('hiding-master') >= 0) return 'hiding-master';
    if (lowerSlug.indexOf('i-love-hue') >= 0) return 'i-love-hue';
    if (lowerSlug.indexOf('impossible-10') >= 0) return 'impossible-10';
    if (lowerSlug.indexOf('katana-fruits') >= 0) return 'katana-fruits';
    if (lowerSlug.indexOf('mahjong-deluxe') >= 0) return 'mahjong-deluxe';
    if (lowerSlug.indexOf('match-doodle') >= 0) return 'match-doodle';
    if (lowerSlug.indexOf('mine-rusher') >= 0) return 'mine-rusher';
    if (lowerSlug.indexOf('photo-hunt') >= 0) return 'photo-hunt';
    if (lowerSlug.indexOf('snake-attack') >= 0) return 'snake-attack';
    if (lowerSlug.indexOf('space-adventure-pinball') >= 0) return 'space-adventure-pinball';
    if (lowerSlug.indexOf('space-trip') >= 0) return 'space-trip';
    if (lowerSlug.indexOf('stacks-tower') >= 0) return 'stacks-tower';
    if (lowerSlug.indexOf('star-puzzles') >= 0) return 'star-puzzles';
    if (lowerSlug.indexOf('sumagi') >= 0) return 'sumagi';
    if (lowerSlug.indexOf('sweet-memory') >= 0) return 'sweet-memory';
    if (lowerSlug.indexOf('ultimate-sudoku') >= 0) return 'ultimate-sudoku';
    if (lowerSlug.indexOf('whack-em-all') >= 0 || lowerSlug.indexOf('whack') >= 0) return 'whack-em-all';
    if (lowerSlug.indexOf('doodle-god-next') >= 0) return 'doodle-god-next';
    if (lowerSlug.indexOf('cut-the-rope') >= 0) return 'cut-the-rope';
    if (lowerSlug.indexOf('omnomrun') >= 0) return 'omnomrun';

    return slug;
}


export const SLUG_TO_DIR_MAP: Record<string, string> = {
    '0hh1': '0hh1',
    '2048': '2048',
    'alchemy': 'Alchemy',
    'box-tower': 'Box Tower',
    'brick-out': 'Brick Out',
    'bubble-spirit': 'Bubble Spirit',
    'change-word': 'Change Word',
    'colorize-2': 'Colorize 2',
    'flapcat-steampunk': 'Flapcat Steampunk',
    'flapcat-steampunk-2': 'Flapcat Steampunk 2',
    'fruit-boom': 'Fruit Boom',
    'fruit-sorting': 'Fruit Sorting',
    'garden-match': 'Garden Match',
    'gems-of-hanoi': 'Gems of Hanoi',
    'gummy-blocks': 'Gummy Blocks',
    'hextris': 'Hextris',
    'hiding-master': 'Hiding Master',
    'i-love-hue': 'I Love Hue',
    'impossible-10': 'Impossible 10',
    'katana-fruits': 'Katana Fruits',
    'mahjong-deluxe': 'Mahjong Deluxe',
    'match-doodle': 'Match Doodle',
    'mine-rusher': 'Mine Rusher',
    'photo-hunt': 'Photo Hunt',
    'snake-attack': 'Snake Attack',
    'space-adventure-pinball': 'Space Adventure Pinball',
    'space-trip': 'Space Trip',
    'stacks-tower': 'Stacks Tower',
    'star-puzzles': 'Star Puzzles',
    'sumagi': 'Sumagi',
    'sweet-memory': 'Sweet Memory',
    'ultimate-sudoku': 'Ultimate Sudoku',
    'whack-em-all': "Whack 'em All",
    'doodle-god-next': 'Doodle God Next',
    'cut-the-rope': 'Cut The Rope',
    'omnomrun': 'Omnomrun'
};

export const INACTIVE_SLUG_TO_DIR_MAP: Record<string, string> = {
    'airport-rush': 'Airport Rush',
    'circle-word': 'Circle Word',
    'color-bump': 'Color Bump',
    'crossy-chicken': 'Crossy Chicken',
    'jigsaw-puzzle': 'Jigsaw Puzzle',
    'jumper-frog': 'Jumper Frog',
    'miner-block': 'Miner Block',
    'pipe-flow': 'Pipe Flow',
    'slide': 'Slide',
    'sweet-candy-saga': 'Sweet Candy Saga',
    'twenty-one': 'Twenty-One',
    'unlock-blox': 'Unlock Blox',
    'word-search': 'Word Search',
    'zig-zag-switch': 'Zig Zag Switch'
};

export const mapSlugToGamePath = (slug: string) => {
    const unifiedSlug = unifiedSlugFromBESlug(slug);

    const inactiveDir = INACTIVE_SLUG_TO_DIR_MAP[unifiedSlug];
    if (inactiveDir) return `/games/inactive/${inactiveDir}/static/index.html`;

    const dir = SLUG_TO_DIR_MAP[unifiedSlug];
    if (dir) return `/games/live/${dir}/static/index.html`;
    return `/games/live/${slug}/static/index.html`;
};

export default function GameClient({ slug }: GameClientProps) {
    const router = useRouter();
    const { userToken } = useUserSession();
    const searchParams = useSearchParams();
    const source = searchParams.get('source');
    const playbookId = searchParams.get('playbookId');
    const disableAdjustments = searchParams.get('adjustments') === 'false';
    const disableSdk = searchParams.get('sdk') === 'false';
    const providerKey = searchParams.get('providerKey');
    const useAi = searchParams.get('use_ai') === 'true';

    const [isIframeLoaded, setIsIframeLoaded] = useState(false);
    const [gameState, setGameState] = useState<'playing' | 'completed' | 'paused'>('playing');
    const [gameStartTime, setGameStartTime] = useState<number>(Date.now());
    const skillprintSessionIdRef = useRef<string>('');
    const skillprintClientRef = useRef<SkillprintClient | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);


    // Actually, I will replace the state with a Ref completely.

    const shouldPollRef = useRef(false);
    const [lastSessionResponse, setLastSessionResponse] = useState<PollResultsResponse | null>(null);
    const [currentAdjustment, setCurrentAdjustment] = useState<Adjustment | null>(null);
    const processedAdjustmentsRef = useRef<Set<string>>(new Set());
    const lastAdjustmentTimeRef = useRef<number>(0);

    const getApiKey = () => {
        return process.env.NEXT_PUBLIC_API_KEY || 'test-api-key';
        // if (typeof document === 'undefined') return '';
        // const cookie = document.cookie.split('; ').find(row => row.startsWith('api_key='));
        // return cookie ? cookie.split('=')[1] : 'test-api-key';
    };

    // Decode the URL slug (handle spaces and special characters)
    const decodedSlug = decodeURIComponent(slug);

    const [gamePath, setGamePath] = useState<string>('');
    const [isLoadingGamePath, setIsLoadingGamePath] = useState<boolean>(true);

    // Get game configuration
    const gameConfig = getGameConfig(decodedSlug);

    useEffect(() => {
        let isMounted = true;
        const resolvePath = async () => {
            try {
                const normalizedSlug = unifiedSlugFromBESlug(decodedSlug);
                const apiData = await getGameBySlug(normalizedSlug);

                let targetSlug = decodedSlug;

                // Validate that the API returned the expected game, avoiding fallbacks like Hextris.
                if (apiData && apiData.slug) {
                    const returnedUnified = unifiedSlugFromBESlug(apiData.slug);
                    if (returnedUnified === normalizedSlug) {
                        targetSlug = apiData.slug;
                    }
                }

                if (isMounted) {
                    let path = mapSlugToGamePath(targetSlug);
                    if (providerKey) {
                        path += (path.includes('?') ? '&' : '?') + `providerKey=${encodeURIComponent(providerKey)}`;
                    } else if (useAi) {
                        path += (path.includes('?') ? '&' : '?') + `use_ai=true`;
                    }
                    setGamePath(path);
                }
            } catch (error) {
                console.error("Error fetching game slug mapping", error);
                if (isMounted) {
                    let path = mapSlugToGamePath(decodedSlug);
                    if (providerKey) {
                        path += (path.includes('?') ? '&' : '?') + `providerKey=${encodeURIComponent(providerKey)}`;
                    } else if (useAi) {
                        path += (path.includes('?') ? '&' : '?') + `use_ai=true`;
                    }
                    setGamePath(path);
                }
            } finally {
                if (isMounted) {
                    setIsLoadingGamePath(false);
                }
            }
        };
        resolvePath();

        return () => {
            isMounted = false;
        };
    }, [decodedSlug, providerKey, useAi]);

    const handleIframeLoad = () => {
        setIsIframeLoaded(true);
        setGameStartTime(Date.now());
        // Do not set shouldPollRef.current = true here. It is already set in useEffect,
        // and setting it here can re-enable polling during exit/navigation race conditions.

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



    const fetchAndSaveEarnedBadgesBeforePlay = async () => {
        try {
            let earnedIds: string[] = [];
            const tokenToUse = userToken || (typeof window !== 'undefined' ? localStorage.getItem('userToken') : null);
            
            if (tokenToUse) {
                const headers: any = {};
                headers["X-Auth-Token"] = `Token ${tokenToUse}`;
                const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'test-api-key';
                if (apiKey) {
                    headers["Authorization"] = `Api-Key ${apiKey}`;
                }
                
                try {
                    const response = await get('games/api/talents/me/', false, headers);
                    const serverData = Array.isArray(response)
                        ? response
                        : (response.results || response.talents || response.data || []);
                    
                    serverData.forEach((item: any) => {
                        const isEarned = item.earned ?? item.date ?? item.earnedAt ?? item.earned_at;
                        const id = item.id || item.badgeId || item.badge_id || (item.name && item.name.toLowerCase().replace(/\s+/g, '-'));
                        if (isEarned && id) {
                            earnedIds.push(id);
                        }
                    });
                } catch (apiErr) {
                    console.warn('[GameClient] Failed to fetch badges from API before play, falling back to local:', apiErr);
                }
            }
            
            if (earnedIds.length === 0 && typeof window !== 'undefined') {
                const saved = localStorage.getItem('skillprint_mock_badges');
                if (saved) {
                    try {
                        const localBadges = JSON.parse(saved);
                        localBadges.forEach((b: any) => {
                            if (b.earned) {
                                earnedIds.push(b.id);
                            }
                        });
                    } catch (parseErr) {
                        console.error('[GameClient] Failed to parse local badges:', parseErr);
                    }
                } else {
                    earnedIds = ['first-steps', 'cognitive-explorer', 'social-pioneer', 'laser-focus'];
                }
            }
            
            if (typeof window !== 'undefined') {
                localStorage.setItem('skillprint_earned_badges_before_play', JSON.stringify(earnedIds));
                console.log('[GameClient] Earned badges before play saved:', earnedIds);
            }
        } catch (err) {
            console.error('[GameClient] Error saving earned badges before play:', err);
        }
    };

    const pollSessionTips = async () => {
        if (!skillprintClientRef.current || !skillprintSessionIdRef.current) return;

        const poll = async () => {
            try {
                if (!shouldPollRef.current) return;

                const polledRes = await skillprintClientRef.current!.pollParameterResults(skillprintSessionIdRef.current);

                if (!shouldPollRef.current) return;

                if (polledRes && polledRes.state === "OPEN") {
                    setLastSessionResponse(polledRes);

                    // Process telemetry adjustments
                    if (!disableAdjustments && polledRes.telemetry && polledRes.telemetry.length > 0) {
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

                if (shouldPollRef.current) {
                    setTimeout(poll, 2000);
                }
            } catch (e) {
                console.error('Polling error', e);
                if (shouldPollRef.current) {
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

        shouldPollRef.current = false;
        stopIframe();

        // Record the game session
        const session: GameSession = {
            id: skillprintSessionIdRef.current || Math.random().toString(36).substr(2, 9),
            gameSlug: decodedSlug,
            timestamp: endTime,
            duration: playTime,
            score: results.score,
            completed: true,
            metadata: {
                level: results.level,
                accuracy: results.accuracy,
                mistakes: results.mistakes,
                source,
                playbookId
            }
        };
        saveGameSession(session);

        if (skillprintClientRef.current && skillprintSessionIdRef.current) {
            skillprintClientRef.current.postScreenshots(skillprintSessionIdRef.current, [], true);
        }



        // Navigate to review page with sessionId or return to benchmark survey
        if (source === 'benchmark-backend') {
            router.push(`/benchmark?postGameSurvey=true&gameSlug=${decodedSlug}&mood=${localStorage.getItem('targetMood') || 'focus'}&sessionId=${skillprintSessionIdRef.current}`);
        } else if (source === 'benchmark') {
            router.push(`/benchmark/static?postGameSurvey=true&gameSlug=${decodedSlug}&mood=${localStorage.getItem('targetMood') || 'focus'}&sessionId=${skillprintSessionIdRef.current}`);
        } else if (skillprintSessionIdRef.current) {
            router.push(`/game/${decodedSlug}/review?sessionId=${skillprintSessionIdRef.current}`);
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
        setGameStartTime(Date.now());

        // Reload the iframe to restart the game
        if (iframeRef.current) {
            iframeRef.current.src = iframeRef.current.src;
        }
    };

    const handleBackToGames = () => {
        // Reset game state when actually leaving
        setGameState('playing');
        setGameStartTime(Date.now());
        if (source === 'benchmark-backend') {
            router.push(`/benchmark?postGameSurvey=true&gameSlug=${decodedSlug}&mood=${localStorage.getItem('targetMood') || 'focus'}&sessionId=${skillprintSessionIdRef.current}`);
        } else if (source === 'benchmark') {
            router.push(`/benchmark/static?postGameSurvey=true&gameSlug=${decodedSlug}&mood=${localStorage.getItem('targetMood') || 'focus'}&sessionId=${skillprintSessionIdRef.current}`);
        } else {
            router.push('/games');
        }
    };

    const handleExitGame = () => {
        if (gameState === 'completed') {
            // If game is already completed, just go back to games
            handleBackToGames();
        } else {
            // If game is in progress, navigate to review page
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

            stopIframe();
            shouldPollRef.current = false;

            // Record the game session
            const session: GameSession = {
                id: skillprintSessionIdRef.current || Math.random().toString(36).substr(2, 9),
                gameSlug: decodedSlug,
                timestamp: Date.now(),
                duration: currentTime,
                score: exitResults.score,
                completed: true, // Mark as completed for playbook tracking when exiting to review
                metadata: {
                    level: exitResults.level,
                    accuracy: exitResults.accuracy,
                    mistakes: exitResults.mistakes,
                    source,
                    playbookId
                }
            };
            saveGameSession(session);

            if (skillprintClientRef.current && skillprintSessionIdRef.current) {
                skillprintClientRef.current.postScreenshots(skillprintSessionIdRef.current, [], true);
            }



            // Navigate to review page with sessionId or return to benchmark survey
            if (source === 'benchmark-backend') {
                router.push(`/benchmark?postGameSurvey=true&gameSlug=${decodedSlug}&mood=${localStorage.getItem('targetMood') || 'focus'}&sessionId=${skillprintSessionIdRef.current}`);
            } else if (source === 'benchmark') {
                router.push(`/benchmark/static?postGameSurvey=true&gameSlug=${decodedSlug}&mood=${localStorage.getItem('targetMood') || 'focus'}&sessionId=${skillprintSessionIdRef.current}`);
            } else if (skillprintSessionIdRef.current) {
                router.push(`/game/${decodedSlug}/review?sessionId=${skillprintSessionIdRef.current}`);
            }
        }
    };



    // Reset state when slug changes
    useEffect(() => {
        setIsIframeLoaded(false);
        setGameState('playing');
        setGameStartTime(Date.now());
        setCurrentAdjustment(null);
        processedAdjustmentsRef.current.clear();
        lastAdjustmentTimeRef.current = 0;

        fetchAndSaveEarnedBadgesBeforePlay();

        // Initialize Skillprint Session
        if (!disableSdk) {
            const sessionId = crypto.randomUUID();
            skillprintSessionIdRef.current = sessionId;
            const apiKey = getApiKey();

            // Try to get token from hook or localStorage directly for immediate availability
            const tokenToUse = userToken || localStorage.getItem('userToken');

            // Use staging by default as per existing code
            const client = new SkillprintClient({
                apiKey,
                baseUrl: getApiBaseUrl(),
                logger: (msg, level) => console.log(`[Skillprint SDK] ${level}: ${msg}`),
                userToken: tokenToUse || undefined
            });
            skillprintClientRef.current = client;

            try {
                const targetMood = localStorage.getItem('targetMood') || Mood.FOCUS;
                const serverSideSlug = mapLocalGameSlugToServerGameSlug(decodedSlug);

                console.log('Starting session for slug', serverSideSlug, decodedSlug);
                const isBenchmarkSession = source === 'benchmark' || source === 'benchmark-backend';
                client.startSession(sessionId, targetMood, serverSideSlug, false, isBenchmarkSession, providerKey || undefined, useAi);
                shouldPollRef.current = true;
                pollSessionTips();
            } catch (e) {
                console.error('Failed to start Skillprint session', e);
            }

            injectJavascriptIntoIframe();
        }

        return () => {
            shouldPollRef.current = false;
        };
    }, [slug, providerKey, useAi]);

    // Update token if it changes (e.g. loads asynchronously)
    useEffect(() => {
        if (skillprintClientRef.current && userToken) {
            skillprintClientRef.current.setUserToken(userToken);
            fetchAndSaveEarnedBadgesBeforePlay();
        }
    }, [userToken]);

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
                    {isLoadingGamePath ? (
                        <div className="w-full h-full min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 border-0">
                            <div className="flex flex-col items-center gap-4">
                                <svg className="animate-spin h-8 w-8 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Loading Game...</span>
                            </div>
                        </div>
                    ) : (
                        <iframe
                            ref={iframeRef}
                            src={gamePath}
                            className="w-full h-full min-h-screen border-0"
                            title={`${decodedSlug} Game`}
                            allowFullScreen
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                            onLoad={handleIframeLoad}
                        />
                    )}

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

                    {/* Hidden keyboard adjustment tester */}
                    {!disableAdjustments && (
                        <GameAdjustmentTester
                            iframeRef={iframeRef}
                            slug={decodedSlug}
                            onAdjustment={(adj) => setCurrentAdjustment(adj)}
                        />
                    )}
                </main>
            </div>




        </div>
    );
}
