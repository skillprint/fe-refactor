'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import FloatingExitButton from '../components/FloatingExitButton';
import { SkillprintClient, Mood, Adjustment } from '../lib/skillprintSdk';
import GameAdjustmentTester from '../components/GameAdjustmentTester';
import GameAdjustmentBanner from '../components/GameAdjustmentBanner';

const ADJUSTMENTS = [
    { key: 1, desc: 'Set heroDamage to 10' },
    { key: 2, desc: 'Set heroDamage to 50' },
    { key: 3, desc: 'Set enemyDamage to 5' },
    { key: 4, desc: 'Set enemyDamage to 40' },
    { key: 5, desc: 'Set enemyAttackRateMs to 8000' },
    { key: 6, desc: 'Set enemyAttackRateMs to 3000' },
    { key: 7, desc: 'Set enemyAttackRateMs to 1000' },
    { key: 8, desc: 'Set healAmount to 10' },
    { key: 9, desc: 'Set healAmount to 60' },
];

export default function TestMageDuelPage() {
    const router = useRouter();

    const [isIframeLoaded, setIsIframeLoaded] = useState(false);
    const [currentAdjustment, setCurrentAdjustment] = useState<any | null>(null);
    const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const skillprintClientRef = useRef<SkillprintClient | null>(null);
    const skillprintSessionIdRef = useRef<string>('');
    const gameStartTimeRef = useRef<number>(0);

    useEffect(() => {
        setIsIframeLoaded(false);
        gameStartTimeRef.current = Date.now();
        setCurrentAdjustment(null);

        const sessionId = crypto.randomUUID();
        skillprintSessionIdRef.current = sessionId;

        let apiKey = process.env.NEXT_PUBLIC_API_KEY || 'test-api-key';
        const cacheKey = 'mageduel_token_jeremy';
        let cachedToken = localStorage.getItem(cacheKey);

        const client = new SkillprintClient({
            apiKey,
            baseUrl: 'https://api.staging.skillprint.co/',
            logger: (msg, level) => console.log(`[Skillprint SDK] ${level}: ${msg}`),
            userToken: cachedToken || undefined
        });
        skillprintClientRef.current = client;

        const initSession = async () => {
            try {
                if (!cachedToken) {
                    cachedToken = await client.createOrGetUserToken('jeremy@mageduel.com');
                    localStorage.setItem(cacheKey, cachedToken as string);
                    client.setUserToken(cachedToken as string);
                    console.log('[TestMageDuel] Created new user token for jeremy@mageduel.com');
                } else {
                    console.log('[TestMageDuel] Using cached user token for jeremy@mageduel.com');
                }

                const targetMood = localStorage.getItem('targetMood') || Mood.FOCUS;
                await client.startSession(sessionId, targetMood as Mood, 'mage-duel');
                setIsSessionActive(true);
            } catch (e) {
                console.error('Failed to start Skillprint session', e);
            }
        };

        initSession();

    }, []);

    // const injectJavascriptIntoIframe = () => {
    //     if (iframeRef.current) {
    //         const iframeDocument = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
    //         const scriptUrl = '/lib/skillprint-js-sdk/main-manager.js';
    //         if (iframeDocument) {
    //             const script = iframeDocument.createElement('script');
    //             script.src = scriptUrl;
    //             iframeDocument.body.appendChild(script);
    //         }
    //     }
    // };

    const handleIframeLoad = () => {
        setIsIframeLoaded(true);
    };

    const handleGameMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        const { type, data } = event.data;

        if (type === 'screenshot') {
            if (skillprintClientRef.current && skillprintSessionIdRef.current) {
                try {
                    const base64Data = event.data?.data || event.data;
                    if (typeof base64Data === 'object' && base64Data.dataUrl) {
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
        }
    };

    useEffect(() => {
        window.addEventListener('message', handleGameMessage);

        return () => {
            window.removeEventListener('message', handleGameMessage);
        };
    }, []);

    // Polling logic for parameter updates
    useEffect(() => {
        if (!isSessionActive || !skillprintClientRef.current || !skillprintSessionIdRef.current) return;

        let pollingTimeoutId: NodeJS.Timeout;
        let isPollingActive = true;

        const pollData = async () => {
            if (!isPollingActive || !skillprintClientRef.current || !skillprintSessionIdRef.current) return;

            // Default to polling every 5 seconds
            let nextDelay = 5000;
            try {
                const results = await skillprintClientRef.current.pollParameterResults(skillprintSessionIdRef.current);
                if (results?.parameterUpdates && results.parameterUpdates.length > 0) {
                    const latestUpdate = results.parameterUpdates[results.parameterUpdates.length - 1];
                    const adjustmentData = {
                        parameterName: latestUpdate.parameterName,
                        parameterValue: latestUpdate.newValue
                    };

                    setCurrentAdjustment(adjustmentData);

                    if (iframeRef.current && iframeRef.current.contentWindow) {
                        iframeRef.current.contentWindow.postMessage({
                            type: 'ADJUST_GAME',
                            data: adjustmentData
                        }, '*');
                    }

                    // Apply a 20 second cooldown before the next poll
                    nextDelay = 20000;
                }
            } catch (error) {
                console.error("Error polling for parameter updates:", error);
            }

            if (isPollingActive) {
                pollingTimeoutId = setTimeout(pollData, nextDelay);
            }
        };

        // Begin polling 5 seconds after starting gameplay
        pollingTimeoutId = setTimeout(pollData, 5000);

        return () => {
            isPollingActive = false;
            clearTimeout(pollingTimeoutId);
        };
    }, [isSessionActive]);

    const handleExitGame = async () => {
        if (iframeRef.current) {
            window.removeEventListener('message', handleGameMessage);
        }

        // Post empty array with is_last_chunk = true
        if (skillprintClientRef.current && skillprintSessionIdRef.current) {
            try {
                await skillprintClientRef.current.postScreenshots(skillprintSessionIdRef.current, [], true);
            } catch (e) {
                console.error("Failed to post final screenshots:", e);
            }
        }

        if (skillprintSessionIdRef.current) {
            router.push(`/game/mage-duel-2d/review?sessionId=${skillprintSessionIdRef.current}`);
        }
    };

    return (
        <div className="relative w-full h-screen bg-gray-50 dark:bg-gray-900">
            <div className="hidden absolute top-4 left-4 z-50 bg-black/80 text-white p-4 rounded-xl shadow-xl pointer-events-none w-72 backdrop-blur-sm border border-white/10">
                <h3 className="font-bold mb-1 text-lg">Mage Duel Adjustments</h3>
                <p className="mb-4 text-white/60 text-sm">Press keys 1-9 to test parameters:</p>
                <ul className="space-y-2">
                    {ADJUSTMENTS.map(adj => (
                        <li key={adj.key} className="flex gap-3 items-center">
                            <span className="font-mono bg-white/20 text-white px-2 py-0.5 rounded-md text-xs font-bold w-6 text-center shadow-inner">{adj.key}</span>
                            <span className="text-sm font-medium text-white/90">{adj.desc}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <Suspense fallback={<div className="flex h-screen w-full items-center justify-center text-gray-500">Loading Mage Duel...</div>}>
                <iframe
                    ref={iframeRef}
                    src="/games/live/mage-duel-2d/static/index.html"
                    className="w-full h-full min-h-screen border-0"
                    title="Mage Duel Sandbox"
                    allowFullScreen
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                    onLoad={handleIframeLoad}
                />
            </Suspense>

            {currentAdjustment && (
                <GameAdjustmentBanner
                    parameterName={currentAdjustment.parameterName}
                    parameterValue={currentAdjustment.parameterValue}
                    onDismiss={() => setCurrentAdjustment(null)}
                />
            )}

            <FloatingExitButton
                position="top-right"
                color="red"
                size="md"
                onClick={handleExitGame}
            />

            <GameAdjustmentTester
                iframeRef={iframeRef}
                slug="mage-duel-2d"
                onAdjustment={(adj) => setCurrentAdjustment(adj)}
            />
        </div>
    );
}
