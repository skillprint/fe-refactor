'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { useUserSession } from '../../hooks/useUserSession';
import PlayStage from '../../../components/GameSession/PlayStage';
import SessionVeil from '../../../components/GameSession/SessionVeil';
import PlayBar from '../../../components/GameSession/PlayBar';
import GameResultDialog, { MIN_SCORED_SECONDS, SessionOutcome, type GameResultDialogProps } from '../../../components/GameSession/GameResultDialog';
import { AnimatedGameTiles } from '../../components/AnimatedGameTiles';
import { getGameDetails } from '../../config/gameConfig';
import React from 'react';
import { SkillprintClient, LogLevel, ParameterUpdateResult, PollResultsResponse, Adjustment, SdkGameParameter } from '../../lib/skillprintSdk';
import { latestPerParameter, markApplied, pendingAdjustments } from '../../lib/adjustments';
import GameAdjustmentBanner from '../../components/GameAdjustmentBanner';
import GameAdjustmentTester from '../../components/GameAdjustmentTester';
import { getCatalogGames, getGameCatalogDetail } from '../../api/api';
import { gameReviewApi } from '@/lib/models/gameReview/gameReviewApi';
import { getApiBaseUrl } from '../../utils/cookieUtils';
import { baseSlug, resolveCatalogGame } from '@/lib/gameSlug';
import { gameBuildUrl, gameParameterManifestUrl, isRoomGame, type GameBuildRef } from '@/lib/localGames';
import { isGameMessageOrigin } from '@/lib/gameAssets';
import { openPortalRoom, stopPortalRoom, type PortalRoom } from '@/lib/models/portal/portalRooms';
import { PortalApiError } from '@/lib/models/portal/portalFetch';
import { chooseTargetMood, type CatalogMood } from '@/lib/targetMood';
import { titleFromSlug } from '@/lib/skillIcons';
import { sessionAttribution } from '@/lib/emailLinks';
import { useIslandCoach } from '../../hooks/useIslandCoach';
import { useLibraryPersonalStats } from '@/lib/models/portal/useLibraryPersonalStats';
import { useLibraryGameLeaderboard } from '@/lib/models/portal/useLibraryGameLeaderboard';
import { extractLeaderboardBaseline } from '@/lib/highScores';
import { useProfileAggregate } from '@/lib/models/portal/useProfileAggregate';
import { profileDimensionMap } from '@/lib/models/portal/ProfileAggregate';

/** Minimum time between batches of difficulty changes sent to the game. */
const ADJUSTMENT_COOLDOWN_MS = 30000;

/** How long a session waits for the player's token before starting without one. */
const TOKEN_WAIT_MS = 8000;

interface GameClientProps {
    slug: string;
    autoPlay?: boolean;
    /** Where leaving the results goes. Defaults to the games list. */
    exitHref?: string;
    /** Options for the results dialog, such as a shared station's footer. */
    resultOptions?: Pick<GameResultDialogProps, 'exitLabel' | 'primaryAction' | 'renderExtra' | 'extraPlacement' | 'hideMoodSurvey' | 'hidePortalLinks'>;
}

interface GameResults {
    /** The game's own points. Undefined when the game didn't report one. */
    score?: number;
    time?: number;
    outcome: SessionOutcome;
    /** Under MIN_SCORED_SECONDS: shown without skill or mood scores. */
    unscored?: boolean;
}

/** What the game last told the shell about itself, from `gameState` / `GAME_SCORE_UPDATE`. */
interface ReportedGameState {
    score?: number;
    isGameOver?: boolean;
}

async function loadGameParameters(manifestUrl?: string): Promise<SdkGameParameter[] | undefined> {
    if (!manifestUrl) return undefined;
    try {
        const res = await fetch(manifestUrl);
        if (!res.ok) return undefined;
        const json = await res.json();
        return Array.isArray(json.sdk_game_parameters) ? json.sdk_game_parameters : undefined;
    } catch (e) {
        console.warn('Could not load game parameter manifest', manifestUrl, e);
        return undefined;
    }
}

export default function GameClient({ slug, autoPlay = false, exitHref = '/games', resultOptions }: GameClientProps) {
    const router = useRouter();
    const { userId, userToken } = useUserSession();
    // For lookups that start before the token has arrived (resolvePath).
    const userTokenRef = useRef(userToken);
    useEffect(() => {
        userTokenRef.current = userToken;
    }, [userToken]);
    type SequenceState = 'loading' | 'ready' | 'playing' | 'calculating' | 'review' | 'badge';
    const [sequence, setSequence] = useState<SequenceState>('loading');
    const [isGamePaused, setIsGamePaused] = useState(false);
    const [gameResults, setGameResults] = useState<GameResults | null>(null);
    // Chosen per game once the catalog record resolves (chooseTargetMood).
    const [sessionMoodSlug, setSessionMoodSlug] = useState<string>('focus');
    const sessionMood = titleFromSlug(sessionMoodSlug);
    const [adjustmentsApplied, setAdjustmentsApplied] = useState<number>(0);
    const adjustmentsCountRef = useRef(0);
    const [gameStartTime, setGameStartTime] = useState<number>(Date.now());
    const skillprintSessionIdRef = useRef<string>('');
    // True once the backend accepted the session; surveys only reference a recorded one.
    const [sessionRecorded, setSessionRecorded] = useState(false);
    const skillprintClientRef = useRef<SkillprintClient | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);


    // Actually, I will replace the state with a Ref completely.

    const shouldPollRef = useRef(false);
    const [lastSessionResponse, setLastSessionResponse] = useState<PollResultsResponse | null>(null);
    const [currentAdjustment, setCurrentAdjustment] = useState<Adjustment | null>(null);
    const [latestAdjustment, setLatestAdjustment] = useState<Adjustment | null>(null);
    const processedAdjustmentsRef = useRef<Set<string>>(new Set());
    const lastAdjustmentTimeRef = useRef<number>(0);
    // Null until the game reports its state; most games never do.
    const reportedGameStateRef = useRef<ReportedGameState | null>(null);
    // Player inputs in the game frame since the last upload. Null when the frame
    // can't be listened to, so the backend treats the count as unknown, not as idle.
    const inputCountRef = useRef<number | null>(null);

    const getApiKey = () => {
        return process.env.NEXT_PUBLIC_API_KEY || 'test-api-key';
        // if (typeof document === 'undefined') return '';
        // const cookie = document.cookie.split('; ').find(row => row.startsWith('api_key='));
        // return cookie ? cookie.split('=')[1] : 'test-api-key';
    };

    // Decode the URL slug (handle spaces and special characters)
    const decodedSlug = decodeURIComponent(slug);
    const unifiedSlug = baseSlug(decodedSlug);

    const [gamePath, setGamePath] = useState<string>('');
    const [isLoadingGamePath, setIsLoadingGamePath] = useState<boolean>(true);
    // The catalog record this URL slug resolved to. `forSlug` guards against a stale
    // resolution being used for a new slug while the next lookup is in flight.
    const [resolvedGame, setResolvedGame] = useState<{ forSlug: string; serverSlug: string; name?: string; moods: CatalogMood[]; parameterManifest?: string; roomGame?: boolean } | null>(null);
    const [isUnknownGame, setIsUnknownGame] = useState(false);
    // A room game's room, once the backend has opened it, and why it couldn't.
    const roomRef = useRef<PortalRoom | null>(null);
    const [roomError, setRoomError] = useState<string | null>(null);
    const [hasImageError, setHasImageError] = useState(false);

    // The static config names only older games; the catalog record names every one.
    const gameTitle = getGameDetails(unifiedSlug)?.name || resolvedGame?.name || unifiedSlug;

    // Fetch player's past record, leaderboards, and profile aggregate
    const { data: personalStats, refetch: refetchPersonalStats } = useLibraryPersonalStats(resolvedGame?.serverSlug || unifiedSlug);
    const { data: allTimeBoard, refetch: refetchAllTimeBoard } = useLibraryGameLeaderboard(resolvedGame?.serverSlug || unifiedSlug, 'all');
    const { data: weeklyBoard, refetch: refetchWeeklyBoard } = useLibraryGameLeaderboard(resolvedGame?.serverSlug || unifiedSlug, 'week');
    const { data: profileAggregate } = useProfileAggregate();

    const preSessionBaselineRef = useRef<{
        personalAllTime: number | null;
        personalWeek: number | null;
        leaderAllTime: number | null;
        leaderWeek: number | null;
    }>({
        personalAllTime: null,
        personalWeek: null,
        leaderAllTime: null,
        leaderWeek: null,
    });

    // Capture the baseline scores while loading/playing before the session ends
    useEffect(() => {
        if (sequence !== 'loading' && sequence !== 'ready' && sequence !== 'playing') return;
        const currentSid = skillprintSessionIdRef.current;
        const allBaseline = extractLeaderboardBaseline(allTimeBoard, currentSid);
        const weekBaseline = extractLeaderboardBaseline(weeklyBoard, currentSid);

        const nextPersonalAll =
            personalStats?.bestScore ??
            allBaseline.personalBest ??
            preSessionBaselineRef.current.personalAllTime;
        const nextPersonalWeek =
            weekBaseline.personalBest ??
            preSessionBaselineRef.current.personalWeek;
        const nextLeaderAll =
            allBaseline.leaderTopScore ??
            preSessionBaselineRef.current.leaderAllTime;
        const nextLeaderWeek =
            weekBaseline.leaderTopScore ??
            preSessionBaselineRef.current.leaderWeek;

        preSessionBaselineRef.current = {
            personalAllTime: nextPersonalAll,
            personalWeek: nextPersonalWeek,
            leaderAllTime: nextLeaderAll,
            leaderWeek: nextLeaderWeek,
        };
    }, [sequence, personalStats, allTimeBoard, weeklyBoard]);

    const playerExperience = React.useMemo(() => {
        const dims = profileDimensionMap(profileAggregate);
        const profileSkills: Record<string, number> = {};
        Object.values(dims).forEach((stat) => {
            if (typeof stat.score === 'number') profileSkills[stat.slug] = stat.score;
        });
        return {
            userId,
            sessionsPlayed: personalStats?.sessionsPlayed ?? 0,
            bestScore: personalStats?.bestScore ?? null,
            lastScore: personalStats?.lastScore ?? null,
            lastFlow: personalStats?.lastFlowScore ?? null,
            targetMood: sessionMood,
            profileSkills,
        };
    }, [userId, personalStats, profileAggregate, sessionMood]);

    const {
        coachFeatureEnabled,
        tipsEnabled,
        setTipsEnabled,
        selectedCoachId,
        setSelectedCoachId,
        briefing,
        isLoadingBriefing,
        activeWhisper,
        whisperHistory,
        isAskingCoach,
        requestWhisper,
        dismissWhisper,
    } = useIslandCoach(unifiedSlug, playerExperience);

    const lastWhisperAtRef = useRef<number>(0);

    // 1. Opening cue whisper ~4.5s after play starts
    useEffect(() => {
        if (sequence !== 'playing' || !coachFeatureEnabled || !tipsEnabled) return;
        const timer = setTimeout(() => {
            lastWhisperAtRef.current = Date.now();
            requestWhisper({
                trigger: 'opening',
                elapsedSeconds: Math.floor((Date.now() - gameStartTime) / 1000),
                bestScore: personalStats?.bestScore ?? null,
            });
        }, 4500);
        return () => clearTimeout(timer);
    }, [sequence, coachFeatureEnabled, tipsEnabled, gameStartTime, personalStats?.bestScore, requestWhisper]);

    // 2. Live difficulty adjustment whisper
    useEffect(() => {
        if (sequence !== 'playing' || !coachFeatureEnabled || !tipsEnabled || !latestAdjustment) return;
        const now = Date.now();
        if (now - lastWhisperAtRef.current < 15000) return;
        lastWhisperAtRef.current = now;
        requestWhisper({
            trigger: 'adjustment',
            adjustmentName: latestAdjustment.parameterName,
            adjustmentValue: latestAdjustment.parameterValue,
            score: reportedGameStateRef.current?.score ?? null,
            elapsedSeconds: Math.floor((now - gameStartTime) / 1000),
        });
    }, [latestAdjustment, sequence, coachFeatureEnabled, tipsEnabled, gameStartTime, requestWhisper]);

    // 3. Periodic milestone / cadence whisper
    useEffect(() => {
        if (sequence !== 'playing' || !coachFeatureEnabled || !tipsEnabled) return;
        const interval = setInterval(() => {
            const now = Date.now();
            if (now - lastWhisperAtRef.current < 25000) return;
            const currentScore = reportedGameStateRef.current?.score ?? null;
            const bestScore = personalStats?.bestScore ?? null;
            const elapsed = Math.floor((now - gameStartTime) / 1000);
            if (currentScore !== null && bestScore && currentScore >= bestScore * 0.5) {
                lastWhisperAtRef.current = now;
                requestWhisper({
                    trigger: 'milestone',
                    score: currentScore,
                    bestScore,
                    elapsedSeconds: elapsed,
                });
            } else if (elapsed >= 20) {
                lastWhisperAtRef.current = now;
                requestWhisper({
                    trigger: 'cadence',
                    score: currentScore,
                    bestScore,
                    inputCount: inputCountRef.current ?? 0,
                    elapsedSeconds: elapsed,
                });
            }
        }, 18000);
        return () => clearInterval(interval);
    }, [sequence, coachFeatureEnabled, tipsEnabled, gameStartTime, personalStats?.bestScore, requestWhisper]);

    /** The player's token once useUserSession has it, or null if it doesn't come within TOKEN_WAIT_MS. */
    const waitForUserToken = async (): Promise<string | null> => {
        const deadline = Date.now() + TOKEN_WAIT_MS;
        while (!userTokenRef.current && Date.now() < deadline) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        return userTokenRef.current;
    };

    useEffect(() => {
        let isMounted = true;
        setIsLoadingGamePath(true);
        setIsUnknownGame(false);
        setResolvedGame(null);

        const resolvePath = async () => {
            // Any slug form (bare, legacy UUID-suffixed, truncated) resolves to one canonical
            // catalog record; that record's slug is what the backend gets on session start.
            let record: { slug: string; name?: string; moods?: CatalogMood[] } & GameBuildRef | null = null;
            try {
                record = resolveCatalogGame(decodedSlug, await getCatalogGames());
            } catch (error) {
                console.error('Error loading game catalog', error);
            }
            if (!record) {
                // Detail route 404s for unknown slugs (unlike `?slug=`, which returns everything).
                try {
                    const detail = await getGameCatalogDetail(decodedSlug);
                    if (detail?.slug) record = detail;
                } catch {
                    // Unknown to the backend; a local build may still exist.
                }
            }
            if (!record) {
                // A game in review is unlisted, so the catalog hasn't got it. Staff
                // play it from the review queue (/review), and the review API has
                // its record; anyone else gets a 403 here and falls through.
                const token = await waitForUserToken();
                if (token) {
                    try {
                        const review = await gameReviewApi.game(decodedSlug, token);
                        record = { slug: review.slug, name: review.name, moods: review.moods, url: review.url };
                    } catch {
                        // Not staff, or not a game.
                    }
                }
            }
            if (!isMounted) return;

            // A game played in a room has no build: its frame is the room the
            // backend opens once the session has started (see openRoom below).
            const roomGame = isRoomGame(record);
            // A catalogue record alone isn't enough: without a build on the games
            // CDN the iframe would load a 403 and still start a scored session.
            const buildUrl = roomGame ? null : gameBuildUrl(record);
            if (!buildUrl && !roomGame) {
                setIsUnknownGame(true);
                setIsLoadingGamePath(false);
                return;
            }

            const serverSlug = record?.slug || unifiedSlug;
            if (buildUrl) setGamePath(buildUrl);
            setResolvedGame({
                forSlug: decodedSlug,
                serverSlug,
                name: record?.name,
                moods: Array.isArray(record?.moods) ? record.moods : [],
                parameterManifest: buildUrl ? gameParameterManifestUrl(buildUrl) : undefined,
                roomGame,
            });
            if (buildUrl) setIsLoadingGamePath(false);
        };
        resolvePath();

        return () => {
            isMounted = false;
        };
    }, [decodedSlug]);

    const handleIframeLoad = () => {
        setSequence(autoPlay ? 'playing' : 'ready');
        setGameStartTime(Date.now());
        // Do not set shouldPollRef.current = true here. It is already set in useEffect,
        // and setting it here can re-enable polling during exit/navigation race conditions.

        // Set up message listener for communication with the game. Adding the same
        // function again on a reload (Play Again) is a no-op.
        window.addEventListener('message', onWindowMessage);
        countPlayerInputs();

        if (autoPlay) {
            if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage({ type: 'GAME_RESUME' }, '*');
            }
            // Keyboard games should take keys without a click into the frame first.
            iframeRef.current?.focus();
        }
    };

    // Chunks with no input are left out of skill scores (NEW-30): a still screen
    // shows what the game looks like, not what the player can do. Capture phase on
    // the frame's window sees every event before a game can stop it.
    const countPlayerInputs = () => {
        inputCountRef.current = null;
        try {
            const frameWindow = iframeRef.current?.contentWindow;
            if (!frameWindow) return;
            const count = () => {
                if (inputCountRef.current !== null) inputCountRef.current += 1;
            };
            for (const type of ['keydown', 'pointerdown', 'pointermove', 'touchstart', 'wheel']) {
                frameWindow.addEventListener(type, count, { capture: true, passive: true });
            }
            inputCountRef.current = 0;
        } catch {
            // A frame on the games CDN can't be listened to. Its screenshot script
            // counts the inputs itself and sends them with each screenshot.
        }
    };

    /** The inputs since the last upload, and start counting afresh. */
    const takeInputCount = () => {
        const count = inputCountRef.current;
        if (count !== null) inputCountRef.current = 0;
        return count;
    };

    const handleGameMessage = (event: MessageEvent) => {
        // Only messages from this page's own game frame: a build on the games CDN,
        // or, for a room game, the game server the room is on.
        const fromRoom = roomRef.current !== null && event.origin === new URL(roomRef.current.server).origin;
        if (!(isGameMessageOrigin(event.origin) || fromRoom) || event.source !== iframeRef.current?.contentWindow) return;

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
                setIsGamePaused(true);
                break;
            case 'GAME_RESUME':
                setIsGamePaused(false);
                break;
            case 'gameState':
            case 'GAME_SCORE_UPDATE':
                recordReportedGameState(data);
                break;
            case 'gameEvent':
                recordGameEvent(data);
                // A room's round begins once the team is in, not when its lobby
                // loaded: the wait for the agents is not time played.
                if (roomRef.current && data?.event === 'GAME_START') setGameStartTime(Date.now());
                break;
        }
    };

    // A discrete event from the game, universal (LEVEL_START, MATCH, ...) or its
    // own (Hextris's ROTATE_CLOCKWISE), with `at`: when it happened, in epoch ms.
    // It goes to the backend with the next screenshot upload.
    const recordGameEvent = (data: any) => {
        if (!skillprintSessionIdRef.current || typeof data?.event !== 'string' || !data.event) return;
        const { event: name, at, ...rest } = data;
        skillprintClientRef.current?.recordEvent(name, rest, typeof at === 'number' ? at : undefined);
    };

    // The window listener has to be one stable function: a handler from an old render
    // can't be removed later, and it would keep uploading this game's screenshots to
    // the session it was created with after a client-side navigation.
    const handleGameMessageRef = useRef(handleGameMessage);
    handleGameMessageRef.current = handleGameMessage;
    const onWindowMessage = useCallback((event: MessageEvent) => handleGameMessageRef.current(event), []);

    // A failed upload (e.g. the session already closed) is logged by the client.
    const uploadScreenshots = (...args: Parameters<SkillprintClient['postScreenshots']>) => {
        skillprintClientRef.current?.postScreenshots(...args).catch(() => {});
    };

    const recordReportedGameState = (data: any) => {
        const next: ReportedGameState = { ...reportedGameStateRef.current };
        if (typeof data?.score === 'number') next.score = data.score;
        if (typeof data?.isGameOver === 'boolean') next.isGameOver = data.isGameOver;
        reportedGameStateRef.current = next;
    };

    // A room game's agents play on until the round ends. A player who leaves
    // before then stops them; once it has ended they stop by themselves, and a
    // stop then would throw the round's record away.
    const leaveRoom = () => {
        const room = roomRef.current;
        if (!room || reportedGameStateRef.current?.isGameOver) return;
        roomRef.current = null;
        stopPortalRoom(room, userTokenRef.current || localStorage.getItem('userToken'));
    };
    // For the unmount cleanup, which outlives the render that defined leaveRoom.
    const leaveRoomRef = useRef(leaveRoom);
    leaveRoomRef.current = leaveRoom;

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

                    // Each chunk carries the game's latest state, so the session keeps a score
                    // even if the final upload never arrives.
                    const capturedAt = typeof base64Data.capturedAt === 'number' ? base64Data.capturedAt : null;
                    // A cross-origin frame counts its own inputs since its last screenshot.
                    const reportedInputs = typeof base64Data.inputCount === 'number' ? base64Data.inputCount : null;
                    const inputCount = inputCountRef.current !== null ? takeInputCount() : reportedInputs;
                    uploadScreenshots(skillprintSessionIdRef.current, [blob], false, reportedGameStateRef.current, inputCount, capturedAt);
                }
            } catch (e) {
                console.error('Failed to process screenshot', e);
            }
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

                    // Process telemetry adjustments. `telemetry` also holds the
                    // game's events, which aren't adjustments (see lib/adjustments).
                    if (!disableAdjustments) {
                        try {
                            const pending = pendingAdjustments(polledRes.telemetry, processedAdjustmentsRef.current);
                            const now = Date.now();
                            // At most one batch per cooldown, so the game isn't retuned
                            // on every poll. A batch carries the newest value for each
                            // parameter decided since the last one, oldest decision
                            // first; older values for a parameter are skipped, never
                            // applied after a newer one.
                            if (pending.length > 0 && now - lastAdjustmentTimeRef.current >= ADJUSTMENT_COOLDOWN_MS) {
                                const batch = latestPerParameter(pending);
                                markApplied(pending, processedAdjustmentsRef.current);
                                lastAdjustmentTimeRef.current = now;
                                adjustmentsCountRef.current += batch.length;
                                setAdjustmentsApplied(adjustmentsCountRef.current);

                                for (const adj of batch) {
                                    console.log("Applying game adjustment:", adj);
                                    iframeRef.current?.contentWindow?.postMessage({
                                        type: 'ADJUST_GAME',
                                        data: adj
                                    }, '*');
                                }

                                // Show the most recent change
                                const last = batch[batch.length - 1];
                                setCurrentAdjustment(last);
                                setLatestAdjustment(last);
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

    const pollForFinalResults = async () => {
        if (!skillprintClientRef.current || !skillprintSessionIdRef.current || disableSdk) {
            setTimeout(() => setSequence('review'), 2000);
            return;
        }

        let attempts = 0;
        const maxAttempts = 15; // 30 seconds max
        const poll = async () => {
            if (attempts >= maxAttempts) {
                setSequence('review');
                return;
            }

            try {
                const polledRes = await skillprintClientRef.current!.pollParameterResults(skillprintSessionIdRef.current);
                if (polledRes) {
                    setLastSessionResponse(polledRes);
                    // If state is closed, or we have populated skillScores, move to review
                    if (polledRes.state === "CLOSED" || (polledRes.skillScores && polledRes.skillScores.analyzedAt)) {
                        setSequence('review');
                        return;
                    }
                }
            } catch (e) {
                console.error('Error polling for final results', e);
            }

            attempts++;
            setTimeout(poll, 2000);
        };

        poll();
    };

    const searchParams = useSearchParams();
    const disableAdjustments = searchParams.get('adjustments') === 'false';
    const disableSdk = searchParams.get('sdk') === 'false';
    const devToolsEnabled = searchParams.get('dev') === 'true';

    const handleGameComplete = (data: any) => {
        const endTime = Date.now();
        const playTime = Math.floor((endTime - gameStartTime) / 1000);

        // Only the game knows its score; never invent one.
        const results: GameResults = {
            score: typeof data?.score === 'number' ? data.score : reportedGameStateRef.current?.score,
            time: playTime,
            outcome: 'complete',
            unscored: playTime < MIN_SCORED_SECONDS,
        };

        shouldPollRef.current = false;
        stopIframe();

        if (skillprintClientRef.current && skillprintSessionIdRef.current) {
            const finalState = typeof results.score === 'number'
                ? { ...reportedGameStateRef.current, score: results.score, isGameOver: true }
                : reportedGameStateRef.current;
            uploadScreenshots(skillprintSessionIdRef.current, [], true, finalState, takeInputCount());
        }

        // Navigate to review page with sessionId
        setGameResults(results);
        showResults(results);
    };

    // A session too short to score goes straight to the results; waiting up to
    // 30s for scores that shouldn't exist is what made a 2s session hang.
    const showResults = (results: GameResults) => {
        if (results.unscored) {
            setSequence('review');
            return;
        }
        setSequence('calculating');
        pollForFinalResults();
    };

    const stopIframe = () => {
        console.log('stopIframe', iframeRef.current);
        window.removeEventListener('message', onWindowMessage);
        if (iframeRef.current) {
            // remove iframe
            iframeRef.current.remove();
        }
    };

    const handlePlayAgain = () => {
        // A room is one round: another one is a new room, with a new session.
        if (resolvedGame?.roomGame) {
            window.location.reload();
            return;
        }
        if (typeof gameResults?.score === 'number' && gameResults.score > 0) {
            const s = gameResults.score;
            const prev = preSessionBaselineRef.current;
            preSessionBaselineRef.current = {
                personalAllTime: prev.personalAllTime !== null ? Math.max(prev.personalAllTime, s) : s,
                personalWeek: prev.personalWeek !== null ? Math.max(prev.personalWeek, s) : s,
                leaderAllTime: prev.leaderAllTime !== null ? Math.max(prev.leaderAllTime, s) : prev.leaderAllTime,
                leaderWeek: prev.leaderWeek !== null ? Math.max(prev.leaderWeek, s) : prev.leaderWeek,
            };
        }
        refetchPersonalStats();
        refetchAllTimeBoard();
        refetchWeeklyBoard();

        setSequence('loading');
        setGameStartTime(Date.now());
        setGameResults(null);
        setAdjustmentsApplied(0);
        adjustmentsCountRef.current = 0;
        reportedGameStateRef.current = null;

        // Reload the iframe to restart the game
        if (iframeRef.current) {
            iframeRef.current.src = iframeRef.current.src;
        }
    };

    const handleBackToGames = () => {
        // Reset game state when actually leaving
        setSequence('playing');
        setGameStartTime(Date.now());
        router.push(exitHref);
    };

    const handleExitGame = () => {
        if (sequence === 'review' || sequence === 'calculating') {
            handleBackToGames();
        } else {
            // If game is in progress, navigate to review page
            const currentTime = Math.floor((Date.now() - gameStartTime) / 1000);

            // The score is whatever the game last reported, if it reports one at all.
            // Only a game that says it's over counts as complete.
            const reported = reportedGameStateRef.current;
            const exitResults: GameResults = {
                score: reported?.score,
                time: currentTime,
                outcome: reported?.isGameOver ? 'complete' : reported ? 'exited' : 'unknown',
                unscored: currentTime < MIN_SCORED_SECONDS,
            };

            stopIframe();
            leaveRoom();
            shouldPollRef.current = false;

            if (skillprintClientRef.current && skillprintSessionIdRef.current) {
                uploadScreenshots(skillprintSessionIdRef.current, [], true, reported, takeInputCount());
            }

            setGameResults(exitResults);
            showResults(exitResults);
        }
    };



    // Reset state once the slug has resolved to a catalog record
    useEffect(() => {
        if (!resolvedGame || resolvedGame.forSlug !== decodedSlug) return;

        setSequence('loading');
        setIsGamePaused(false);
        setGameStartTime(Date.now());
        setCurrentAdjustment(null);
        setLatestAdjustment(null);
        processedAdjustmentsRef.current.clear();
        lastAdjustmentTimeRef.current = 0;
        reportedGameStateRef.current = null;
        preSessionBaselineRef.current = {
            personalAllTime: null,
            personalWeek: null,
            leaderAllTime: null,
            leaderWeek: null,
        };
    }, [resolvedGame, decodedSlug]);

    // A session started before the player's token arrives is recorded for nobody:
    // it never reaches their profile, and the results can't load it. That happens
    // when a game URL is opened directly, as a fresh guest does. Wait for the
    // token, but not forever: a token request that failed mustn't stop play.
    const [tokenWaitOver, setTokenWaitOver] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setTokenWaitOver(true), TOKEN_WAIT_MS);
        return () => clearTimeout(timer);
    }, []);
    // Only ever goes from false to true, so it can't start a second session for the same game.
    const canStartSession = Boolean(userToken) || tokenWaitOver;

    // Start the Skillprint session for the resolved game
    useEffect(() => {
        if (!resolvedGame || resolvedGame.forSlug !== decodedSlug || !canStartSession) return;

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
                // The mood must be one the game carries, or the backend refuses the session.
                const targetMood = chooseTargetMood(searchParams.get('mood'), resolvedGame.moods);
                setSessionMoodSlug(targetMood);
                setSessionRecorded(false);
                const serverSideSlug = resolvedGame.serverSlug;

                console.log('Starting session for slug', serverSideSlug, decodedSlug);
                // How the player got here -- an email, a playbook -- goes on the
                // session, so a click in an email can be followed to a play (SKI-271).
                const attribution = sessionAttribution(new URLSearchParams(window.location.search));
                loadGameParameters(resolvedGame.parameterManifest)
                    .then((gameParameters) => client.startSession(sessionId, targetMood, serverSideSlug, false, gameParameters, attribution))
                    .then((ok) => { if (ok && skillprintSessionIdRef.current === sessionId) setSessionRecorded(true); })
                    .catch((e) => console.error('Failed to start Skillprint session', e));
                shouldPollRef.current = true;
                pollSessionTips();
            } catch (e) {
                console.error('Failed to start Skillprint session', e);
            }
        }

        return () => {
            shouldPollRef.current = false;
        };
    }, [resolvedGame, decodedSlug, canStartSession]);

    // Update token if it changes (e.g. loads asynchronously)
    useEffect(() => {
        if (skillprintClientRef.current && userToken) {
            skillprintClientRef.current.setUserToken(userToken);
        }
    }, [userToken]);

    // A room game's frame is a room the backend opens for this player, with
    // agents in the other seats, once the session their seat is recorded
    // against has started. The player takes the seat when they press Play.
    useEffect(() => {
        if (!resolvedGame?.roomGame || resolvedGame.forSlug !== decodedSlug || !canStartSession) return;
        let isCurrent = true;
        setRoomError(null);
        const token = userTokenRef.current || localStorage.getItem('userToken');
        if (!token) {
            setRoomError('Playing with others needs a player profile. Sign in or play as a guest, then reload.');
            return;
        }
        openPortalRoom(token, { game: resolvedGame.serverSlug, sessionId: skillprintSessionIdRef.current || undefined })
            .then((room) => {
                if (!isCurrent) {
                    stopPortalRoom(room, token);
                    return;
                }
                roomRef.current = room;
                setGamePath(room.playUrl);
                setIsLoadingGamePath(false);
            })
            .catch((error) => {
                if (!isCurrent) return;
                console.error('Could not open a room', error);
                const busy = error instanceof PortalApiError && (error.status === 503 || error.status === 429);
                setRoomError(busy
                    ? 'Every AI player is busy. Try again in a few minutes.'
                    : 'The game server could not open a room. Try again in a moment.');
            });
        return () => {
            isCurrent = false;
        };
    }, [resolvedGame, decodedSlug, canStartSession]);

    // Cleanup message listener, and a room left mid-round
    useEffect(() => {
        return () => {
            window.removeEventListener('message', onWindowMessage);
            leaveRoomRef.current();
        };
    }, [onWindowMessage]);

    const handleTogglePlay = () => {
        if (sequence === 'playing') {
            setIsGamePaused(true);
            if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage({ type: 'GAME_PAUSE' }, '*');
            }
        } else if (sequence === 'ready') {
            setSequence('playing');
            setGameStartTime(Date.now());
            if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage({ type: 'GAME_RESUME' }, '*');
            }
        } else {
            setIsGamePaused(false);
            if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage({ type: 'GAME_RESUME' }, '*');
            }
        }
    };

    if (isUnknownGame) notFound();

    return (
        <div className="page scrollbar-subtle page--game-session margin-none text-default font-ui leading-base" data-sequence={sequence} data-skillprint-page="game-session">
            <div aria-hidden="true" className="play-field" data-stage-field>
                <AnimatedGameTiles />
                <img alt="" className="play-field__art" data-stage-art src={`/assets/images/games/game-${unifiedSlug}.svg`} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.closest('.play-field')?.setAttribute('data-tiles-active', ''); }} />
                
                {!isLoadingGamePath && (
                    <iframe
                        ref={iframeRef}
                        src={gamePath}
                        className="play-field__game border-0 z-10"
                        title={`${decodedSlug} Game`}
                        allowFullScreen
                        // A click on the Play button doesn't count as activation inside a
                        // cross-origin frame, so its sound needs autoplay delegated.
                        allow="autoplay; fullscreen; gamepad"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                        onLoad={handleIframeLoad}
                        style={{
                            opacity: (sequence === 'playing' || sequence === 'calculating' || sequence === 'review' || sequence === 'ready') ? 1 : 0,
                            pointerEvents: sequence === 'playing' ? 'auto' : 'none'
                        }}
                    />
                )}
            </div>

            {sequence === 'ready' && (
                <PlayStage
                    gameTitle={gameTitle}
                    onPlay={() => handleTogglePlay()}
                    briefing={coachFeatureEnabled ? briefing : null}
                    isLoadingBriefing={coachFeatureEnabled ? isLoadingBriefing : false}
                    tipsEnabled={tipsEnabled}
                    onToggleTips={coachFeatureEnabled ? setTipsEnabled : undefined}
                    selectedCoachId={selectedCoachId}
                    onSelectCoach={coachFeatureEnabled ? setSelectedCoachId : undefined}
                />
            )}

            {sequence === 'loading' && (
                roomError
                    ? <SessionVeil step="loading" title="No room right now" description={roomError} isCanvas />
                    : <SessionVeil step="loading" title="Loading game" description={`${gameTitle} is starting up.`} isCanvas />
            )}

            {sequence === 'calculating' && (
                <SessionVeil step="calculating" title="Calculating results" description="Just a moment while we analyse your gameplay." />
            )}

            {sequence === 'review' && gameResults && (
                <GameResultDialog
                    gameTitle={gameTitle}
                    score={gameResults.score}
                    highScore={preSessionBaselineRef.current.personalAllTime ?? undefined}
                    weeklyHighScore={preSessionBaselineRef.current.personalWeek}
                    leaderboardAllTimeHigh={preSessionBaselineRef.current.leaderAllTime}
                    leaderboardWeeklyHigh={preSessionBaselineRef.current.leaderWeek}
                    postAllTimeBoard={allTimeBoard}
                    postWeeklyBoard={weeklyBoard}
                    outcome={gameResults.outcome}
                    duration={gameResults.time || 0}
                    adjustmentsCount={adjustmentsApplied}
                    targetMood={sessionMood}
                    targetMoodSlug={sessionMoodSlug}
                    onReplay={handlePlayAgain}
                    skillScores={lastSessionResponse?.skillScores}
                    moodScores={lastSessionResponse?.moodScores}
                    gameSlug={resolvedGame?.serverSlug || decodedSlug}
                    userToken={userToken}
                    userId={userId}
                    sessionId={skillprintSessionIdRef.current}
                    sessionRecorded={sessionRecorded}
                    unscored={gameResults.unscored}
                    exitHref={exitHref}
                    coachFeatureEnabled={coachFeatureEnabled}
                    coach={briefing?.selectedCoach || null}
                    availableCoaches={briefing?.availableCoaches || []}
                    deliveredTip={activeWhisper || whisperHistory[0] || briefing?.tips?.[0] || null}
                    {...resultOptions}
                />
            )}

            {sequence === 'playing' && (
                <PlayBar
                    gameTitle={gameTitle}
                    gameSlug={unifiedSlug}
                    onExit={handleExitGame}
                    targetMood={sessionMood}
                    adjustmentName={latestAdjustment?.parameterName}
                    adjustmentValue={latestAdjustment?.parameterValue}
                    adjustmentCreateDate={latestAdjustment?.createDate}
                    coach={coachFeatureEnabled ? (briefing?.selectedCoach || null) : null}
                    availableCoaches={coachFeatureEnabled ? (briefing?.availableCoaches || []) : []}
                    selectedCoachId={selectedCoachId}
                    onSelectCoach={coachFeatureEnabled ? setSelectedCoachId : undefined}
                    tipsEnabled={tipsEnabled}
                    onToggleTips={coachFeatureEnabled ? setTipsEnabled : undefined}
                    activeWhisper={coachFeatureEnabled ? activeWhisper : null}
                    whisperHistory={coachFeatureEnabled ? whisperHistory : []}
                    isAskingCoach={isAskingCoach}
                    onAskCoach={coachFeatureEnabled ? (question) => {
                        lastWhisperAtRef.current = Date.now();
                        requestWhisper({
                            trigger: 'ask',
                            question,
                            score: reportedGameStateRef.current?.score ?? null,
                            bestScore: personalStats?.bestScore ?? null,
                            elapsedSeconds: Math.floor((Date.now() - gameStartTime) / 1000),
                        });
                    } : undefined}
                    onDismissWhisper={coachFeatureEnabled ? dismissWhisper : undefined}
                    onRefocusGame={() => iframeRef.current?.focus()}
                />
            )}

            {/* Sequence steps for testing */}
            {devToolsEnabled && (
                <nav aria-label="Sequence steps" className="session-rail layout-flex items-center" style={{ position: 'fixed', bottom: 10, left: 10, zIndex: 9999 }}>
                    <button aria-pressed={sequence === 'loading'} className="session-rail__step button button--tertiary" onClick={() => setSequence('loading')} type="button">Load</button>
                    <button aria-pressed={sequence === 'ready'} className="session-rail__step button button--tertiary" onClick={() => setSequence('ready')} type="button">Start</button>
                    <button aria-pressed={sequence === 'playing'} className="session-rail__step button button--tertiary" onClick={() => setSequence('playing')} type="button">Play</button>
                    <button aria-pressed={sequence === 'calculating'} className="session-rail__step button button--tertiary" onClick={() => setSequence('calculating')} type="button">Calculate</button>
                    <button aria-pressed={sequence === 'review'} className="session-rail__step button button--tertiary" onClick={() => setSequence('review')} type="button">Review</button>
                </nav>
            )}

            {/* Hidden keyboard adjustment tester */}
            {!disableAdjustments && (
                <GameAdjustmentTester
                    iframeRef={iframeRef}
                    slug={decodedSlug}
                    onAdjustment={(adj) => {
                        setCurrentAdjustment(adj);
                        setLatestAdjustment(adj);
                    }}
                />
            )}

            {/* Adjustment Banner (disabled, using bottom bar notification instead)
            {currentAdjustment && (
                <GameAdjustmentBanner
                    parameterName={currentAdjustment.parameterName}
                    parameterValue={currentAdjustment.parameterValue}
                    onDismiss={() => setCurrentAdjustment(null)}
                />
            )}
            */}
        </div>
    );
}