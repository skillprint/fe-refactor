'use client';

import { useState, useEffect, useRef } from 'react';
import TopNav from '../components/TopNav';
import { gameDetails, knownGameSlugs } from '../config/gameConfig';
import toast from 'react-hot-toast';

interface Recording {
    id: string;
    game_slug: string;
    user_id: string | null;
    duration: number;
    score: number | null;
    created_at: string;
}

// Map slug to human readable names in case gameDetails is missing them
const GAME_NAME_MAP: Record<string, string> = {
    '0hh1': '0h h1',
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
    'omnomrun': 'Om Nom Run'
};

const getGameUrl = (slug: string) => {
    const map: Record<string, string> = {
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
    const dir = map[slug] || slug;
    return `/games/live/${dir}/static/index.html`;
};

const cleanSerializedNode = (node: any): any => {
    if (!node) return node;
    
    // Change script tag elements to hidden divs to prevent iframe sandbox script execution blocks
    if (node.tagName === 'script') {
        node.tagName = 'div';
        node.attributes = { ...node.attributes, style: 'display: none !important;' };
        node.childNodes = [];
    }

    if (node.childNodes && Array.isArray(node.childNodes)) {
        node.childNodes = node.childNodes.map(cleanSerializedNode);
    }
    return node;
};

const cleanEventsOfScripts = (events: any[]): any[] => {
    return events.map((event) => {
        if (!event) return event;
        const cleanedEvent = { ...event };
        if (cleanedEvent.type === 2 && cleanedEvent.data && cleanedEvent.data.node) {
            cleanedEvent.data = {
                ...cleanedEvent.data,
                node: cleanSerializedNode(cleanedEvent.data.node)
            };
        } else if (cleanedEvent.type === 3 && cleanedEvent.data && cleanedEvent.data.source === 0) {
            if (cleanedEvent.data.adds && Array.isArray(cleanedEvent.data.adds)) {
                cleanedEvent.data = {
                    ...cleanedEvent.data,
                    adds: cleanedEvent.data.adds.map((add: any) => {
                        const cleanedAdd = { ...add };
                        if (cleanedAdd.node) {
                            cleanedAdd.node = cleanSerializedNode(cleanedAdd.node);
                        }
                        return cleanedAdd;
                    })
                };
            }
        }
        return cleanedEvent;
    });
};

export default function RrwebDashboard() {
    const [activeTab, setActiveTab] = useState<'record' | 'sessions'>('record');
    const [selectedGame, setSelectedGame] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
    const [timerText, setTimerText] = useState('00:00');
    const [eventsBuffer, setEventsBuffer] = useState<any[]>([]);
    
    // Sessions tab states
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [isLoadingRecordings, setIsLoadingRecordings] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Replay modal states
    const [scriptsLoaded, setScriptsLoaded] = useState(false);
    const [replayingRecording, setReplayingRecording] = useState<any | null>(null);
    const [showReplayModal, setShowReplayModal] = useState(false);
    const [replayError, setReplayError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch saved recordings
    const fetchRecordings = async () => {
        setIsLoadingRecordings(true);
        try {
            const res = await fetch('/api/rrweb/recordings/');
            const json = await res.json();
            if (json.success) {
                setRecordings(json.data);
            } else {
                toast.error('Failed to load recordings: ' + json.error);
            }
        } catch (error: any) {
            toast.error('Error fetching recordings: ' + error.message);
        } finally {
            setIsLoadingRecordings(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'sessions') {
            fetchRecordings();
        }
    }, [activeTab]);

    // Handle messages coming from the game iframe
    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            // Allow same-origin, or "null" (common for sandboxed iframes), or if it's our specific event types
            const isFriendlyOrigin = e.origin === window.location.origin || e.origin === 'null' || e.origin === '';
            const isFriendlyEvent = e.data && (e.data.type === 'RRWEB_RECORDING_EVENT' || e.data.type === 'GAME_COMPLETE');

            if (!isFriendlyOrigin && !isFriendlyEvent) {
                return;
            }

            // 1. Capture events emitted by the injected rrweb-record inside the iframe
            if (e.data && e.data.type === 'RRWEB_RECORDING_EVENT') {
                setEventsBuffer((prev) => [...prev, e.data.event]);
            }

            // 2. Automatically detect if the game has completed
            if (e.data && e.data.type === 'GAME_COMPLETE') {
                const score = e.data.data?.score || null;
                handleStopRecording(score);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [isRecording, recordingStartTime]);

    // Manage timer interval
    useEffect(() => {
        if (isRecording && recordingStartTime) {
            timerIntervalRef.current = setInterval(() => {
                const elapsedMs = Date.now() - recordingStartTime;
                const elapsedSecs = Math.floor(elapsedMs / 1000);
                const minutes = String(Math.floor(elapsedSecs / 60)).padStart(2, '0');
                const seconds = String(elapsedSecs % 60).padStart(2, '0');
                setTimerText(`${minutes}:${seconds}`);
            }, 1000);
        } else {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        }

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [isRecording, recordingStartTime]);

    // Load rrweb player scripts dynamically
    useEffect(() => {
        if (showReplayModal && !scriptsLoaded) {
            // Check if player script already exists in global
            if ((window as any).rrwebPlayer) {
                setScriptsLoaded(true);
                return;
            }

            // Load CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/lib/rrweb/rrweb-player.css';
            document.head.appendChild(link);

            // Load JS
            const script = document.createElement('script');
            script.src = '/lib/rrweb/rrweb-player.js';
            script.onload = () => {
                setScriptsLoaded(true);
            };
            script.onerror = () => {
                toast.error('Failed to load rrweb-player assets locally.');
            };
            document.body.appendChild(script);
        }
    }, [showReplayModal, scriptsLoaded]);

    // Instantiate rrweb player in DOM container
    useEffect(() => {
        if (showReplayModal && scriptsLoaded && replayingRecording && !replayError && playerContainerRef.current) {
            playerContainerRef.current.innerHTML = '';
            try {
                const rrPlayerClass = (window as any).rrwebPlayer;
                new rrPlayerClass({
                    target: playerContainerRef.current,
                    props: {
                        events: replayingRecording.events,
                        autoPlay: true,
                        width: Math.min(800, window.innerWidth - 40),
                        height: Math.min(500, (window.innerWidth - 40) * 0.625),
                        showController: true,
                        UNSAFE_replayCanvas: true
                    }
                });
            } catch (err: any) {
                console.error('Failed to load rrwebPlayer:', err);
                setReplayError('Failed to initialize replay player: ' + err.message);
            }
        }
    }, [showReplayModal, scriptsLoaded, replayingRecording, replayError]);

    // Start play & recording
    const handleStartRecording = () => {
        if (!selectedGame) return;
        setEventsBuffer([]);
        setTimerText('00:00');
        setRecordingStartTime(Date.now());
        setIsRecording(true);
        toast.success('Recording started. Play the game below!');
    };

    // Callback on iframe loading to inject record script
    const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
        console.log('[RrwebPage] handleIframeLoad called. isRecording:', isRecording);
        if (!isRecording) return;
        
        try {
            const iframe = e.currentTarget;
            const iframeWindow = iframe.contentWindow;
            const doc = iframe.contentDocument || iframeWindow?.document;
            if (!doc || !iframeWindow) {
                console.error('[RrwebPage] Iframe document or window not accessible');
                return;
            }

            console.log('[RrwebPage] Injecting record.esm.js as ES Module into game document');
            // Inject the ES module loader script into the game document
            const script = doc.createElement('script');
            script.type = 'module';
            script.textContent = `
                import { record } from '/lib/rrweb/record.esm.js';
                console.log('[Iframe ESM] rrweb record module executing');
                try {
                    record({
                        emit(event) {
                            window.parent.postMessage({ type: 'RRWEB_RECORDING_EVENT', event }, '*');
                        },
                        recordCanvas: true,
                        collectFonts: true,
                        ignoreSelector: 'script', // Ignore script elements during recording
                        sampling: {
                            mousemove: false, // Disable hover events (clicks/touches are still fully captured)
                            canvas: 2,        // Capture canvas snapshots at 2 FPS (prevents heavy draw mutation tracking)
                            scroll: 150,      // Throttle scroll checks
                            media: 800        // Throttle media checks
                        },
                        dataURLOptions: {
                            type: 'image/webp',
                            quality: 0.3      // Lower quality WebP to minimize database storage footprints
                        }
                    });
                    console.log('[Iframe ESM] rrweb record initialized successfully');
                } catch (err) {
                    console.error('[Iframe ESM] rrweb record failed to initialize:', err);
                }
            `;
            script.onerror = (err) => {
                console.error('[RrwebPage] Failed to execute ESM script inside iframe:', err);
            };
            (doc.head || doc.documentElement).appendChild(script);
        } catch (err: any) {
            console.error('[RrwebPage] Failed to inject recording script:', err);
            toast.error('Iframe access blocked or script error: ' + err.message);
        }
    };

    // Stop recording and trigger database save
    const handleStopRecording = async (score: number | null = null) => {
        if (!isRecording) return;
        setIsRecording(false);
        
        const durationSecs = recordingStartTime ? Math.floor((Date.now() - recordingStartTime) / 1000) : 0;
        
        if (eventsBuffer.length < 2) {
            toast.error('Not enough actions recorded to save.');
            setSelectedGame(null);
            return;
        }

        setIsSaving(true);
        const savePromise = async () => {
            const res = await fetch('/api/rrweb/recordings/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    game_slug: selectedGame,
                    events: eventsBuffer,
                    duration: durationSecs,
                    score: score || null,
                })
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.error);
            return json.data;
        };

        toast.promise(
            savePromise(),
            {
                loading: 'Persisting recording in Postgres...',
                success: (data) => {
                    setIsSaving(false);
                    setSelectedGame(null);
                    setEventsBuffer([]);
                    return `Recording saved successfully! (ID: ${data.id.substring(0, 8)})`;
                },
                error: (err) => {
                    setIsSaving(false);
                    return `Failed to save recording: ${err.message}`;
                }
            }
        );
    };

    const handleCancelRecording = () => {
        setIsRecording(false);
        setSelectedGame(null);
        setEventsBuffer([]);
        toast('Recording cancelled', { icon: '🗑️' });
    };

    // Load recording details and play it
    const handleReplaySession = async (id: string) => {
        const fetchPromise = async () => {
            const res = await fetch(`/api/rrweb/recordings/${id}/`);
            const json = await res.json();
            if (!json.success) throw new Error(json.error);
            return json.data;
        };

        try {
            const recordingData = await toast.promise(
                fetchPromise(),
                {
                    loading: 'Fetching event payload...',
                    success: 'Recording loaded.',
                    error: 'Error loading session.'
                }
            );

            // Validate that we have at least 2 events for rrweb replayer
            if (!recordingData.events || !Array.isArray(recordingData.events) || recordingData.events.length < 2) {
                setReplayError('This recording contains too few events (fewer than 2) and cannot be replayed. rrweb requires at least a start and end event.');
            } else {
                setReplayError(null);
                // Clean up any script tags in loaded events to prevent iframe sandbox console warnings
                recordingData.events = cleanEventsOfScripts(recordingData.events);
            }

            setReplayingRecording(recordingData);
            setShowReplayModal(true);
        } catch (error) {
            console.error(error);
        }
    };

    // Delete session
    const handleDeleteSession = async (id: string) => {
        if (!confirm('Are you sure you want to delete this gameplay recording?')) return;

        try {
            const res = await fetch(`/api/rrweb/recordings/${id}/`, {
                method: 'DELETE',
            });
            const json = await res.json();
            if (json.success) {
                toast.success('Session deleted successfully');
                fetchRecordings();
            } else {
                toast.error('Failed to delete recording: ' + json.error);
            }
        } catch (error: any) {
            toast.error('Error deleting: ' + error.message);
        }
    };

    // Filter recordings for search query
    const filteredRecordings = recordings.filter((rec) => {
        const gameName = GAME_NAME_MAP[rec.game_slug] || rec.game_slug;
        return gameName.toLowerCase().includes(searchQuery.toLowerCase()) || 
               rec.id.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const formatDuration = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            <TopNav />
            
            <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-800 pb-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400">
                            Gameplay Recording Hub
                        </h1>
                        <p className="text-slate-400 mt-2 text-lg">
                            Record user gameplay actions, inputs, and canvas animations in real-time, then replay them with precision controls.
                        </p>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 backdrop-blur-md self-start md:self-center">
                        <button
                            onClick={() => { if (!isRecording) setActiveTab('record'); }}
                            disabled={isRecording}
                            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                                activeTab === 'record'
                                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-slate-200 disabled:opacity-50'
                            }`}
                        >
                            Record Gameplay
                        </button>
                        <button
                            onClick={() => { if (!isRecording) setActiveTab('sessions'); }}
                            disabled={isRecording}
                            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                                activeTab === 'sessions'
                                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-slate-200 disabled:opacity-50'
                            }`}
                        >
                            Recorded Sessions ({recordings.length})
                        </button>
                    </div>
                </div>

                {/* Tab: Record Gameplay */}
                {activeTab === 'record' && (
                    <div className="space-y-8">
                        {!selectedGame ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {knownGameSlugs.map((slug) => {
                                    const details = gameDetails[slug];
                                    const name = details?.name || GAME_NAME_MAP[slug] || slug;
                                    const desc = details?.description || 'Test gameplay recording with rrweb module.';
                                    return (
                                        <div
                                            key={slug}
                                            onClick={() => setSelectedGame(slug)}
                                            className="group relative bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 cursor-pointer hover:border-violet-500/60 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300 flex flex-col justify-between"
                                        >
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-violet-400 border border-slate-700/50">
                                                        {details?.category || 'Arcade'}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {details?.difficulty || 'Medium'}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold group-hover:text-violet-300 transition-colors">
                                                    {name}
                                                </h3>
                                                <p className="text-slate-400 text-sm line-clamp-2">
                                                    {desc}
                                                </p>
                                            </div>
                                            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                                                <span className="text-xs text-slate-500">
                                                    {details?.estimatedTime || '3-5 min'}
                                                </span>
                                                <span className="text-sm text-violet-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                                    Select Game
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden flex flex-col min-h-[700px]">
                                {/* Workspace Header */}
                                <div className="bg-slate-900/80 border-b border-slate-800 px-6 py-4 flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleCancelRecording}
                                            disabled={isSaving}
                                            className="text-slate-400 hover:text-slate-200 transition-colors p-2 bg-slate-800/60 hover:bg-slate-800 rounded-xl"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                        </button>
                                        <div>
                                            <h2 className="text-xl font-bold">
                                                {GAME_NAME_MAP[selectedGame] || selectedGame}
                                            </h2>
                                            <p className="text-xs text-slate-400">
                                                {isRecording ? 'Session is recording in progress' : 'Ready to record'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-4">
                                        {isRecording ? (
                                            <>
                                                {/* Recording Indicator */}
                                                <div className="flex items-center gap-2.5 bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20">
                                                    <span className="w-3 h-3 bg-rose-500 rounded-full animate-ping"></span>
                                                    <span className="text-sm font-bold text-rose-400 tracking-wider">
                                                        REC {timerText}
                                                    </span>
                                                </div>

                                                <span className="text-xs text-slate-400 hidden sm:inline">
                                                    {eventsBuffer.length} events buffered
                                                </span>

                                                <button
                                                    onClick={() => handleStopRecording()}
                                                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all duration-300"
                                                >
                                                    Stop & Save
                                                </button>
                                                <button
                                                    onClick={handleCancelRecording}
                                                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300"
                                                >
                                                    Discard
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={handleStartRecording}
                                                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all duration-300"
                                            >
                                                Start Recording Session
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Iframe area */}
                                <div className="flex-1 bg-slate-950 relative flex items-center justify-center">
                                    {isRecording ? (
                                        <iframe
                                            ref={iframeRef}
                                            src={getGameUrl(selectedGame)}
                                            onLoad={handleIframeLoad}
                                            className="w-full h-full min-h-[600px] border-0"
                                            sandbox="allow-scripts allow-same-origin allow-forms"
                                        />
                                    ) : (
                                        <div className="text-center p-8 max-w-md space-y-4">
                                            <div className="w-16 h-16 bg-violet-600/10 border border-violet-500/20 rounded-full flex items-center justify-center mx-auto text-violet-400 text-2xl">
                                                🎮
                                            </div>
                                            <h3 className="text-lg font-semibold">Recording Workspace Ready</h3>
                                            <p className="text-sm text-slate-400">
                                                Clicking start will load the game and inject the rrweb recorder module inside the sandbox window to track actions.
                                            </p>
                                            <button
                                                onClick={handleStartRecording}
                                                className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 mt-2"
                                            >
                                                Load & Start
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Recorded Sessions */}
                {activeTab === 'sessions' && (
                    <div className="space-y-6">
                        {/* Search bar */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/30 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80">
                            <div className="relative flex-1 w-full">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                    🔍
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search by game name or recording ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* List */}
                        {isLoadingRecordings ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <svg className="animate-spin h-8 w-8 text-violet-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-slate-400 font-medium">Loading session recordings...</span>
                            </div>
                        ) : filteredRecordings.length === 0 ? (
                            <div className="text-center py-20 bg-slate-900/10 border border-slate-800/60 rounded-3xl">
                                <div className="text-4xl mb-4">📭</div>
                                <h3 className="text-lg font-bold">No recordings found</h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    {searchQuery ? 'Adjust your search queries' : 'Record and complete your first game to see it here!'}
                                </p>
                            </div>
                        ) : (
                            <div className="bg-slate-900/20 border border-slate-850 rounded-2xl overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900/60 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                                            <th className="px-6 py-4">Game</th>
                                            <th className="px-6 py-4">Recording ID</th>
                                            <th className="px-6 py-4">Played Date</th>
                                            <th className="px-6 py-4">Duration</th>
                                            <th className="px-6 py-4 text-center">Score</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-850 text-sm">
                                        {filteredRecordings.map((rec) => {
                                            const gameName = GAME_NAME_MAP[rec.game_slug] || rec.game_slug;
                                            return (
                                                <tr
                                                    key={rec.id}
                                                    className="hover:bg-slate-900/30 transition-colors"
                                                >
                                                    <td className="px-6 py-4 font-bold text-slate-200">
                                                        {gameName}
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                                                        {rec.id}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-400">
                                                        {new Date(rec.created_at).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-400">
                                                        {formatDuration(rec.duration)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {rec.score !== null ? (
                                                            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md font-bold">
                                                                {rec.score}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-600">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right space-x-3">
                                                        <button
                                                            onClick={() => handleReplaySession(rec.id)}
                                                            className="text-violet-400 hover:text-violet-300 font-semibold text-sm transition-colors"
                                                        >
                                                            Replay
                                                        </button>
                                                        <span className="text-slate-800">|</span>
                                                        <button
                                                            onClick={() => handleDeleteSession(rec.id)}
                                                            className="text-rose-500 hover:text-rose-400 font-semibold text-sm transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Replay Player Modal */}
            {showReplayModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-200">
                                    Replaying Session
                                </h3>
                                <p className="text-xs text-slate-400">
                                    {replayingRecording && (GAME_NAME_MAP[replayingRecording.game_slug] || replayingRecording.game_slug)} (ID: {replayingRecording?.id})
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowReplayModal(false);
                                    setReplayingRecording(null);
                                    setReplayError(null);
                                }}
                                className="text-slate-400 hover:text-slate-200 transition-colors p-2 hover:bg-slate-800/80 rounded-xl"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Player Container */}
                        <div className="flex-1 bg-slate-950 p-6 flex justify-center items-center min-h-[400px]">
                            {replayError ? (
                                <div className="text-center p-8 max-w-md space-y-4">
                                    <div className="w-16 h-16 bg-rose-600/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-400 text-2xl">
                                        ⚠️
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-200">Replay Unavailable</h3>
                                    <p className="text-sm text-slate-400">
                                        {replayError}
                                    </p>
                                </div>
                            ) : !scriptsLoaded ? (
                                <div className="flex flex-col items-center gap-3">
                                    <svg className="animate-spin h-8 w-8 text-violet-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="text-sm text-slate-400">Loading replay engine...</span>
                                </div>
                            ) : (
                                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-inner">
                                    <div ref={playerContainerRef} />
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex justify-end">
                            <button
                                onClick={() => {
                                    setShowReplayModal(false);
                                    setReplayingRecording(null);
                                    setReplayError(null);
                                }}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                            >
                                Close Replay
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
