"use client";

import { useState, useRef, useEffect } from 'react';
import GameAdjustmentBanner from '../components/GameAdjustmentBanner';

const MOODS = [
    'relax', 'focus', 'creativity', 'collaborate', 'grit', 'joy', 'curiosity', 'empathy', 'awe'
];
const SKILLS = [
    'problem solving', 'memory', 'logic', 'spatial reasoning', 'attention', 'pattern recognition', 'reaction time'
];

export default function GameSandboxPage() {
    const [targetMode, setTargetMode] = useState<'mood' | 'skill'>('mood');
    const [targetValue, setTargetValue] = useState(MOODS[0]);
    const [optionalPrompt, setOptionalPrompt] = useState('');
    const [artStyleId, setArtStyleId] = useState('');
    const [artStyles, setArtStyles] = useState<{ id: string, name: string }[]>([]);

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationOutput, setGenerationOutput] = useState('');
    const [gameUrl, setGameUrl] = useState<string | null>(null);
    const [tokenUsage, setTokenUsage] = useState<{ promptTokenCount?: number, candidatesTokenCount?: number, totalTokenCount?: number } | null>(null);

    const outputRef = useRef<HTMLPreElement>(null);

    // keep scroll to bottom for streaming output
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [generationOutput]);

    const [currentAdjustment, setCurrentAdjustment] = useState<{ parameterName: string, parameterValue: any } | null>(null);
    const [adjustmentMappings, setAdjustmentMappings] = useState<Record<string, { parameterName: string, description: string, value: any }> | null>(null);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.type === 'ADJUSTMENT_MADE') {
                setCurrentAdjustment({
                    parameterName: event.data.parameterName,
                    parameterValue: event.data.parameterValue
                });
            } else if (event.data?.type === 'REGISTER_ADJUSTMENTS' && event.data.mappings) {
                setAdjustmentMappings(event.data.mappings);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    useEffect(() => {
        fetch('/api/art-styles')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setArtStyles(data);
            })
            .catch(err => console.error("Could not fetch art styles", err));
    }, []);

    useEffect(() => {
        // reset target value when mode changes
        if (targetMode === 'mood') setTargetValue(MOODS[0]);
        else setTargetValue(SKILLS[0]);
    }, [targetMode]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setGenerationOutput('');
        setGameUrl(null);
        setAdjustmentMappings(null);
        setCurrentAdjustment(null);
        setTokenUsage(null);

        try {
            const response = await fetch('/api/generate-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetMode, targetValue, optionalPrompt, artStyleId: artStyleId || undefined }),
            });

            if (!response.ok || !response.body) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || 'Failed to generate game');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let buffer = '';

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk;

                    const tokenMatch = buffer.match(/\n___TOKEN_USAGE___:({.*?})\n/);
                    if (tokenMatch) {
                        try {
                            setTokenUsage(JSON.parse(tokenMatch[1]));
                        } catch (e) { }
                        buffer = buffer.replace(tokenMatch[0], '');
                    }

                    if (buffer.includes('___FILE_READY___:')) {
                        const parts = buffer.split('___FILE_READY___:');
                        setGenerationOutput(prev => prev + parts[0]);
                        const rawUrl = parts[1].trim(); // e.g. /games/generated/mood-focus-123.html

                        let gameId = '';
                        if (rawUrl.startsWith('/games/generated/') && rawUrl.endsWith('.html')) {
                            gameId = rawUrl.substring('/games/generated/'.length, rawUrl.length - 5);
                        }

                        if (gameId) {
                            setGameUrl("/sandbox/" + gameId);
                        } else {
                            setGameUrl(rawUrl);
                        }
                        buffer = '';
                    } else if (buffer.includes('___ERROR___:')) {
                        const parts = buffer.split('___ERROR___:');
                        setGenerationOutput(prev => prev + parts[0] + '\nError: ' + parts[1]);
                        buffer = '';
                    } else {
                        setGenerationOutput(prev => prev + chunk);
                    }
                }
            }
        } catch (error: any) {
            console.error(error);
            setGenerationOutput(prev => prev + '\n\nError: ' + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col md:flex-row dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            {/* Sidebar Controls */}
            <div className="w-full md:w-1/3 xl:w-1/4 p-6 bg-white dark:bg-gray-800 shadow-sm z-10 overflow-y-auto">
                <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Game Sandbox</h1>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Type</label>
                        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                            <button
                                onClick={() => setTargetMode('mood')}
                                className={"flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all " + (targetMode === 'mood' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white')}
                            >
                                Mood
                            </button>
                            <button
                                onClick={() => setTargetMode('skill')}
                                className={"flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all " + (targetMode === 'skill' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white')}
                            >
                                Skill
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                            Select {targetMode}
                        </label>
                        <select
                            value={targetValue}
                            onChange={(e) => setTargetValue(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white py-2 px-3"
                        >
                            {(targetMode === 'mood' ? MOODS : SKILLS).map(opt => (
                                <option key={opt} value={opt} className="capitalize">{opt}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Art Style (Optional)
                        </label>
                        <select
                            value={artStyleId}
                            onChange={(e) => setArtStyleId(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white py-2 px-3"
                        >
                            <option value="">None / Default</option>
                            {artStyles.map(style => (
                                <option key={style.id} value={style.id}>{style.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Optional Prompt
                        </label>
                        <textarea
                            value={optionalPrompt}
                            onChange={(e) => setOptionalPrompt(e.target.value)}
                            placeholder="e.g. Make it a puzzle game with space theme..."
                            rows={4}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-3 text-sm resize-none"
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isGenerating ? (
                            <span className="flex items-center space-x-2">
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Generating...</span>
                            </span>
                        ) : 'Generate Game'}
                    </button>

                    {/* Token Debug Panel */}
                    {(tokenUsage || isGenerating) && (
                        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 dark:bg-gray-900/50 dark:border-gray-700 rounded-lg shadow-sm">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Debug Info</h3>
                            {tokenUsage ? (
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-500 text-xs text-opacity-80">Prompt Tokens</p>
                                        <p className="font-mono text-indigo-400 font-bold">{tokenUsage.promptTokenCount?.toLocaleString() || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs text-opacity-80">Output Tokens</p>
                                        <p className="font-mono text-green-400 font-bold">{tokenUsage.candidatesTokenCount?.toLocaleString() || 0}</p>
                                    </div>
                                    <div className="col-span-2 pt-2 border-t border-gray-200 dark:border-gray-700 mt-1">
                                        <p className="text-gray-500 text-xs text-opacity-80">Total Tokens</p>
                                        <p className="font-mono text-white font-bold">{tokenUsage.totalTokenCount?.toLocaleString() || 0}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-400 animate-pulse font-mono">
                                    Streaming response...
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col p-6 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
                {!gameUrl ? (
                    <div className="flex-1 bg-gray-900 rounded-xl overflow-hidden shadow-inner flex flex-col">
                        <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
                            <span className="text-xs font-mono text-gray-400">Terminal Output</span>
                            {isGenerating && <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>}
                        </div>
                        <pre
                            ref={outputRef}
                            className="flex-1 p-6 text-sm font-mono text-green-400 overflow-y-auto whitespace-pre-wrap break-words leading-relaxed"
                        >
                            {generationOutput || "Ready to generate a new game.\nSelect parameters and click generate..."}
                        </pre>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden relative border border-gray-200 dark:border-gray-700">
                        <div className="absolute top-0 w-full bg-gray-100 dark:bg-gray-800 py-2 px-4 shadow-sm z-10 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <span className="text-sm font-mono text-gray-600 dark:text-gray-400 truncate max-w-[200px] md:max-w-md">
                                {gameUrl.split('?')[0].split('/').pop()}
                            </span>
                            <a href={gameUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:text-indigo-600 px-3 py-1 border border-indigo-200 dark:border-indigo-800 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                                Open New Tab
                            </a>
                        </div>

                        <div className="flex-1 w-full bg-black mt-[45px] relative overflow-hidden">
                            {currentAdjustment && (
                                <GameAdjustmentBanner
                                    parameterName={currentAdjustment.parameterName}
                                    parameterValue={currentAdjustment.parameterValue}
                                    onDismiss={() => setCurrentAdjustment(null)}
                                />
                            )}
                            <iframe
                                src={gameUrl}
                                title="Generated Game"
                                className="absolute inset-0 w-full h-full border-0 select-none"
                                sandbox="allow-scripts allow-same-origin allow-pointer-lock"
                            />
                        </div>
                        {adjustmentMappings && (
                            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shrink-0 overflow-y-auto max-h-[30vh]">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                    Use Keys 1-9 to Test Parameters
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {Object.entries(adjustmentMappings).map(([key, mapping]) => (
                                        <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 transition-colors hover:border-indigo-200 dark:hover:border-indigo-800">
                                            <div className="flex-shrink-0 w-7 h-7 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center font-mono text-xs font-bold text-gray-700 dark:text-gray-300 shadow-sm mt-0.5">
                                                {key}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                                    {mapping.description || mapping.parameterName}
                                                </p>
                                                <div className="mt-1 flex items-center justify-between gap-2">
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono truncate">
                                                        {mapping.parameterName}
                                                    </p>
                                                    <span className="inline-flex rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 font-mono border border-indigo-100 dark:border-indigo-800/50">
                                                        {JSON.stringify(mapping.value)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
