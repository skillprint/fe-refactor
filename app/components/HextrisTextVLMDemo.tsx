'use client';

import React, { useState, useEffect, useRef } from 'react';
import { mapSlugToGamePath } from '../game/[slug]/GameClient';

type VLMStatus = 'idle' | 'capturing' | 'processing' | 'ready';
type InferenceMode = 'vision' | 'text';

interface VLMLog {
    id: string;
    timestamp: number;
    inferenceTimeMs: number;
    targetMood: string;
    mode: InferenceMode;
    output: {
        enemySpeedMultiplier: number;
        spawnRateMultiplier: number;
        colorPaletteShift: string;
        musicTempo: string;
    };
    reasoning: string;
}

export default function HextrisTextVLMDemo() {
    // Mode toggle
    const [inferenceMode, setInferenceMode] = useState<InferenceMode>('text');

    // Input States
    const [latestScreenshot, setLatestScreenshot] = useState<string | null>(null);
    const [latestGameState, setLatestGameState] = useState<any | null>(null);

    // Processing States
    const [vlmStatus, setVlmStatus] = useState<VLMStatus>('idle');
    const [logs, setLogs] = useState<VLMLog[]>([]);
    const [targetMood, setTargetMood] = useState('focus');

    // Performance Metrics
    const [metrics, setMetrics] = useState({
        vramUsageMb: 0,
        avgInferenceTimeMs: 0,
        totalInferences: 0
    });

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logic for the JSON output panel
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [logs]);

    // Handle iframe load and attach the message listener
    const handleIframeLoad = () => {
        if (iframeRef.current) {
            // Inject the script that sets up screenshot polling
            const iframeDocument = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
            const scriptUrl = '/lib/skillprint-js-sdk/main-manager.js';
            if (iframeDocument) {
                const script = iframeDocument.createElement('script');
                script.src = scriptUrl;
                iframeDocument.body.appendChild(script);
            }

            window.addEventListener('message', handleGameMessage);
        }
    };

    // Cleanup message listener
    useEffect(() => {
        return () => {
            window.removeEventListener('message', handleGameMessage);
        };
    }, [vlmStatus, targetMood, inferenceMode]);

    // Handle incoming messages from the Hextris iframe
    const handleGameMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        const { type, data } = event.data;

        // Route incoming data based on our selected inference mode
        if (inferenceMode === 'vision' && type === 'screenshot') {
            const base64Data = data?.dataUrl || data;
            if (vlmStatus === 'idle' || vlmStatus === 'ready') {
                processInferencePipeline(base64Data, null);
            }
        } else if (inferenceMode === 'text' && type === 'gameState') {
            if (vlmStatus === 'idle' || vlmStatus === 'ready') {
                processInferencePipeline(null, data);
            }
        }
    };

    const processInferencePipeline = async (base64Image: string | null, gameState: any | null) => {
        setVlmStatus('processing');

        if (inferenceMode === 'vision') setLatestScreenshot(base64Image);
        if (inferenceMode === 'text') setLatestGameState(gameState);

        const startTime = Date.now();

        // Simulate pipeline delays based on mode
        let simulatedDelay = 0;
        let simulatedVram = 0;

        if (inferenceMode === 'vision') {
            // Vision is slow and heavy (simulating something like Phi-3-Vision)
            simulatedDelay = Math.floor(Math.random() * 700) + 1200; // 1.2s - 1.9s
            simulatedVram = 2850 + Math.floor(Math.random() * 50);
        } else {
            // Text is fast and light (simulating something like Llama-3-8B or smaller)
            simulatedDelay = Math.floor(Math.random() * 150) + 200; // 0.2s - 0.35s
            simulatedVram = 850 + Math.floor(Math.random() * 20);
        }

        await new Promise(resolve => setTimeout(resolve, simulatedDelay));
        const actualTime = Date.now() - startTime;

        // Generate Mock Output
        const newLog: VLMLog = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            inferenceTimeMs: actualTime,
            targetMood: targetMood,
            mode: inferenceMode,
            output: getMockAdjustments(targetMood, inferenceMode, gameState),
            reasoning: getMockReasoning(targetMood, inferenceMode)
        };

        setLogs(prev => [...prev, newLog].slice(-10)); // Keep last 10 logs

        setMetrics(prev => {
            const newTotal = prev.totalInferences + 1;
            const newAvg = prev.totalInferences === 0
                ? actualTime
                : ((prev.avgInferenceTimeMs * prev.totalInferences) + actualTime) / newTotal;

            return {
                vramUsageMb: simulatedVram,
                avgInferenceTimeMs: Math.round(newAvg),
                totalInferences: newTotal
            };
        });

        setVlmStatus('ready');
    };

    const getMockAdjustments = (mood: string, mode: string, state: any) => {
        // Text mode can theoretically be more precise because it sees exact scalar values
        const speedBoost = mode === 'text' && state?.score > 500 ? 1.05 : 1.0;

        switch (mood) {
            case 'focus': return { enemySpeedMultiplier: 1.1 * speedBoost, spawnRateMultiplier: 0.9, colorPaletteShift: 'desaturated', musicTempo: 'steady' };
            case 'relax': return { enemySpeedMultiplier: 0.7, spawnRateMultiplier: 0.6, colorPaletteShift: 'warm', musicTempo: 'slow' };
            case 'speed': return { enemySpeedMultiplier: 1.4 * speedBoost, spawnRateMultiplier: 1.3, colorPaletteShift: 'high-contrast', musicTempo: 'fast' };
            default: return { enemySpeedMultiplier: 1.0, spawnRateMultiplier: 1.0, colorPaletteShift: 'none', musicTempo: 'normal' };
        }
    };

    const getMockReasoning = (mood: string, mode: string) => {
        if (mode === 'text') {
            return `Analyzed JSON state keys. Target mood is ${mood}. Adjusting parameters based on absolute score and block count thresholds.`;
        } else {
            return `Visual scene analysis suggests activity level. Adjusting bounds to match '${mood}' objective.`;
        }
    };

    const resetMetrics = () => {
        setLogs([]);
        setMetrics({ vramUsageMb: 0, avgInferenceTimeMs: 0, totalInferences: 0 });
        setLatestScreenshot(null);
        setLatestGameState(null);
    };

    return (
        <div className="w-full max-w-7xl mx-auto rounded-3xl overflow-hidden border border-border bg-background flex flex-col lg:flex-row shadow-2xl h-[85vh]">

            {/* Left Col: Live Game View */}
            <div className="flex-[1.5] relative bg-slate-950 flex flex-col border-r border-border">
                {/* Header */}
                <div className="p-4 border-b border-border/20 bg-slate-900 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                            🎮
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-100 uppercase tracking-wide text-sm">Hextris Engine</h2>
                            <p className="text-xs text-slate-400 font-mono">Live environment</p>
                        </div>
                    </div>
                </div>

                {/* iFrame Container */}
                <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                    <iframe
                        ref={iframeRef}
                        src={mapSlugToGamePath('hextris')}
                        className="w-full h-full max-w-[600px] border-0"
                        title="Hextris Game"
                        sandbox="allow-scripts allow-same-origin allow-forms"
                        onLoad={handleIframeLoad}
                    />
                </div>
            </div>

            {/* Right Col: VLM Diagnostic Side Panel */}
            <div className="flex-1 bg-card flex flex-col transition-colors duration-500">

                {/* Diagnostics Header */}
                <div className="p-4 border-b border-border bg-card flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-foreground text-sm flex items-center gap-2">
                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Inference Pipeline Comparison
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground mr-1">Target:</span>
                            <select
                                value={targetMood}
                                onChange={(e) => setTargetMood(e.target.value)}
                                className="bg-secondary border border-border text-foreground rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary outline-none"
                            >
                                <option value="focus">Focus</option>
                                <option value="relax">Relax</option>
                                <option value="speed">Speed</option>
                            </select>
                        </div>
                    </div>

                    {/* Mode Toggle Tabs */}
                    <div className="flex bg-secondary/50 p-1 rounded-lg">
                        <button
                            onClick={() => { setInferenceMode('vision'); resetMetrics(); }}
                            className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${inferenceMode === 'vision' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-secondary/80'}`}
                        >
                            Vision (Pixels)
                        </button>
                        <button
                            onClick={() => { setInferenceMode('text'); resetMetrics(); }}
                            className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${inferenceMode === 'text' ? 'bg-emerald-600 text-white shadow' : 'text-muted-foreground hover:bg-secondary/80'}`}
                        >
                            Text (JSON State)
                        </button>
                    </div>
                </div>

                <div className="p-5 flex-1 flex flex-col overflow-hidden gap-6">

                    {/* Top row of diagnostics: Snapshot + Metrics */}
                    <div className="flex gap-4">
                        {/* Latest Input Source View */}
                        <div className="flex-1 bg-secondary/30 rounded-xl border border-border/50 overflow-hidden flex flex-col">
                            <div className="bg-secondary/50 px-3 py-1.5 border-b border-border/50 flex justify-between items-center">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                    Input: {inferenceMode === 'vision' ? 'Base64 Native Canvas' : 'Structured JSON Object'}
                                </span>
                                {vlmStatus === 'processing' && (
                                    <span className={`flex items-center gap-1 text-[10px] font-mono animate-pulse ${inferenceMode === 'vision' ? 'text-primary' : 'text-emerald-500'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${inferenceMode === 'vision' ? 'bg-primary' : 'bg-emerald-500'}`}></div> Running
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 min-h-[120px] bg-slate-950 relative overflow-hidden">
                                {inferenceMode === 'vision' ? (
                                    <div className="absolute inset-0 flex items-center justify-center p-2 bg-[url('/grid-pattern.svg')]">
                                        {latestScreenshot ? (
                                            <img
                                                src={latestScreenshot}
                                                alt="Latest game frame"
                                                className={`max-w-full max-h-full rounded object-contain shadow-sm ${vlmStatus === 'processing' ? 'ring-2 ring-primary/50 opacity-90' : 'ring-1 ring-border'}`}
                                            />
                                        ) : (
                                            <div className="text-xs text-muted-foreground text-center italic">Awaiting Visual Frame...</div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 p-3 overflow-auto custom-scrollbar">
                                        {latestGameState ? (
                                            <pre className={`text-[10px] font-mono leading-relaxed transition-opacity ${vlmStatus === 'processing' ? 'text-emerald-400 opacity-80' : 'text-emerald-200 opacity-100'}`}>
                                                {JSON.stringify(latestGameState, null, 2)}
                                            </pre>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">Awaiting State Broadcast...</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Metrics Panel */}
                        <div className="w-32 flex flex-col gap-2">
                            <div className="flex-1 bg-secondary/30 rounded-xl border border-border/50 p-2 flex flex-col justify-center items-center">
                                <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mb-1 text-center">Avg Latency</span>
                                <span className={`text-lg font-mono font-bold ${inferenceMode === 'text' ? 'text-emerald-500' : 'text-foreground'}`}>
                                    {metrics.avgInferenceTimeMs > 0 ? `${(metrics.avgInferenceTimeMs / 1000).toFixed(2)}s` : '--'}
                                </span>
                            </div>
                            <div className="flex-1 bg-secondary/30 rounded-xl border border-border/50 p-2 flex flex-col justify-center items-center">
                                <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mb-1 text-center">WebGPU VRAM</span>
                                <span className={`text-lg font-mono font-bold ${inferenceMode === 'text' ? 'text-emerald-500' : 'text-foreground'}`}>
                                    {metrics.vramUsageMb > 0 ? `${metrics.vramUsageMb}` : '--'}
                                </span>
                                <span className="text-[9px] text-muted-foreground">MB</span>
                            </div>
                        </div>
                    </div>

                    {/* VLM JSON Output Log */}
                    <div className="flex-1 flex flex-col bg-[#111] rounded-xl border border-slate-800 overflow-hidden shadow-inner">
                        <div className="bg-[#1a1a1a] px-3 py-2 border-b border-slate-800 flex justify-between items-center">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
                                <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                Model Output Stream
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 bg-black/50 px-2 py-0.5 rounded">Inferences: {metrics.totalInferences}</span>
                        </div>

                        <div
                            ref={scrollContainerRef}
                            className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-xs space-y-4"
                        >
                            {logs.length === 0 && (
                                <div className="text-slate-600 h-full flex items-center justify-center italic text-center">
                                    No output generated yet.<br />Ensure game is running.
                                </div>
                            )}

                            {logs.map((log, index) => (
                                <div key={log.id} className="border-l-2 border-slate-700 pl-3 relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {/* Small connector dot */}
                                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-700"></div>

                                    <div className="text-slate-500 mb-1 flex gap-3">
                                        <span>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                        <span className={log.inferenceTimeMs < 500 ? 'text-emerald-500 font-bold' : (log.inferenceTimeMs < 1000 ? 'text-emerald-400' : 'text-amber-500')}>
                                            {log.inferenceTimeMs}ms
                                        </span>
                                    </div>
                                    <div className="text-sky-300">
                                        <pre className="whitespace-pre-wrap leading-relaxed">
                                            {JSON.stringify({ output: log.output, reasoning: log.reasoning }, null, 2)}
                                        </pre>
                                    </div>

                                    {(index < logs.length - 1 || vlmStatus === 'processing') && (
                                        <div className="mt-4 border-b border-slate-800/50 w-8"></div>
                                    )}
                                </div>
                            ))}

                            {vlmStatus === 'processing' && (
                                <div className={`border-l-2 pl-3 opacity-70 ${inferenceMode === 'vision' ? 'border-primary/50' : 'border-emerald-500/50'}`}>
                                    <div className={`mb-1 flex gap-2 items-center ${inferenceMode === 'vision' ? 'text-primary' : 'text-emerald-500'}`}>
                                        <span className="animate-pulse">▶</span>
                                        <span className="animate-pulse flex gap-1">
                                            Computing
                                            {inferenceMode === 'vision' ? (
                                                <span className="text-white/50">ViT Embeddings...</span>
                                            ) : (
                                                <span className="text-white/50">Text Tokens...</span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}
