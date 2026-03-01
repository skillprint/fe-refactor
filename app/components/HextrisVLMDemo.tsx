'use client';

import React, { useState, useEffect, useRef } from 'react';
import { mapSlugToGamePath } from '../game/[slug]/GameClient';

type VLMStatus = 'idle' | 'capturing' | 'processing' | 'ready';

interface VLMLog {
    id: string;
    timestamp: number;
    inferenceTimeMs: number;
    targetMood: string;
    output: {
        enemySpeedMultiplier: number;
        spawnRateMultiplier: number;
        colorPaletteShift: string;
        musicTempo: string;
    };
    reasoning: string;
}

export default function HextrisVLMDemo() {
    const [latestScreenshot, setLatestScreenshot] = useState<string | null>(null);
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

    // Handle iframe load and attach the screenshot listener
    const handleIframeLoad = () => {
        if (iframeRef.current) {
            // Inject the script that sets up screenshot polling (same as GameClient)
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
    }, [vlmStatus, targetMood]); // Re-bind if target mood changes so the closure uses the latest mood

    const handleGameMessage = async (event: MessageEvent) => {
        // Only accept messages from our domain
        if (event.origin !== window.location.origin) return;

        const { type, data } = event.data;

        if (type === 'screenshot') {
            const base64Data = data?.dataUrl || data;

            // Only process if we are ready/idle. If we are currently "processing" a previous frame, drop this one.
            // This prevents building a massive queue and simulates realistic hardware constraints.
            if (vlmStatus === 'idle' || vlmStatus === 'ready') {
                processScreenshotWithSimulatedVLM(base64Data);
            }
        }
    };

    const processScreenshotWithSimulatedVLM = async (base64Image: string) => {
        setVlmStatus('processing');
        setLatestScreenshot(base64Image); // Show the exact frame we are analyzing

        const startTime = Date.now();

        // Simulate WebGPU Inference Latency (e.g., 800ms to 1500ms)
        const simulatedDelay = Math.floor(Math.random() * 700) + 800;
        await new Promise(resolve => setTimeout(resolve, simulatedDelay));

        const actualTime = Date.now() - startTime;

        // Generate Mock Output based on the intended target mood
        const newLog: VLMLog = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            inferenceTimeMs: actualTime,
            targetMood: targetMood,
            output: getMockAdjustments(targetMood),
            reasoning: getMockReasoning(targetMood)
        };

        setLogs(prev => [...prev, newLog].slice(-10)); // Keep last 10 logs

        setMetrics(prev => {
            const newTotal = prev.totalInferences + 1;
            const newAvg = prev.totalInferences === 0
                ? actualTime
                : ((prev.avgInferenceTimeMs * prev.totalInferences) + actualTime) / newTotal;

            return {
                vramUsageMb: 2450 + Math.floor(Math.random() * 50),
                avgInferenceTimeMs: Math.round(newAvg),
                totalInferences: newTotal
            };
        });

        setVlmStatus('ready');
    };

    const getMockAdjustments = (mood: string) => {
        switch (mood) {
            case 'focus': return { enemySpeedMultiplier: 1.1, spawnRateMultiplier: 0.9, colorPaletteShift: 'desaturated', musicTempo: 'steady' };
            case 'relax': return { enemySpeedMultiplier: 0.7, spawnRateMultiplier: 0.6, colorPaletteShift: 'warm', musicTempo: 'slow' };
            case 'speed': return { enemySpeedMultiplier: 1.4, spawnRateMultiplier: 1.3, colorPaletteShift: 'high-contrast', musicTempo: 'fast' };
            default: return { enemySpeedMultiplier: 1.0, spawnRateMultiplier: 1.0, colorPaletteShift: 'none', musicTempo: 'normal' };
        }
    };

    const getMockReasoning = (mood: string) => {
        switch (mood) {
            case 'focus': return "Visual scene analysis suggests high activity; tightening spawn rates to encourage continuous flow.";
            case 'relax': return "Player approaching fail-state geometry; reducing block fall speed to induce calming response.";
            case 'speed': return "Reaction bounds look safe; increasing block fall velocity to match 'speed' objective.";
            default: return "Maintaining parameters.";
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto rounded-3xl overflow-hidden border border-border bg-background flex flex-col lg:flex-row shadow-2xl h-[85vh]">

            {/* Left Col: Live Game View */}
            <div className="flex-[1.5] relative bg-slate-950 flex flex-col border-r border-border">

                {/* Header */}
                <div className="p-4 border-b border-border/20 bg-slate-900 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                            🎮
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-100 uppercase tracking-wide text-sm">Hextris WebGL Viewport</h2>
                            <p className="text-xs text-slate-400 font-mono">Real-time gameplay source</p>
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
            <div className="flex-1 bg-card flex flex-col">

                {/* Diagnostics Header */}
                <div className="p-4 border-b border-border bg-card flex justify-between items-center">
                    <h2 className="font-bold text-foreground text-sm flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        VLM WebGPU Pipeline
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">Target Mood:</span>
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

                <div className="p-5 flex-1 flex flex-col overflow-hidden gap-6">

                    {/* Top row of diagnostics: Snapshot + Metrics */}
                    <div className="flex gap-4">
                        {/* Latest Snapshot View */}
                        <div className="flex-1 bg-secondary/30 rounded-xl border border-border/50 overflow-hidden flex flex-col">
                            <div className="bg-secondary/50 px-3 py-1.5 border-b border-border/50 flex justify-between items-center">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Latest Input Frame</span>
                                {vlmStatus === 'processing' && (
                                    <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-mono animate-pulse">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Analyzing
                                    </span>
                                )}
                            </div>
                            <div className="p-2 flex-1 flex items-center justify-center min-h-[120px] bg-[url('/grid-pattern.svg')]">
                                {latestScreenshot ? (
                                    <img
                                        src={latestScreenshot}
                                        alt="Latest game frame"
                                        className={`max-w-full max-h-[140px] rounded object-contain shadow-sm ${vlmStatus === 'processing' ? 'ring-2 ring-emerald-500/50 opacity-90' : 'ring-1 ring-border'}`}
                                    />
                                ) : (
                                    <div className="text-xs text-muted-foreground text-center italic px-4">
                                        Waiting for first iFrame postMessage...
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Metrics Panel */}
                        <div className="w-32 flex flex-col gap-2">
                            <div className="flex-1 bg-secondary/30 rounded-xl border border-border/50 p-2 flex flex-col justify-center items-center">
                                <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mb-1 text-center">Avg Latency</span>
                                <span className="text-lg font-mono text-foreground">{metrics.avgInferenceTimeMs > 0 ? `${(metrics.avgInferenceTimeMs / 1000).toFixed(2)}s` : '--'}</span>
                            </div>
                            <div className="flex-1 bg-secondary/30 rounded-xl border border-border/50 p-2 flex flex-col justify-center items-center">
                                <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mb-1 text-center">WebGPU VRAM</span>
                                <span className="text-lg font-mono text-foreground">{metrics.vramUsageMb > 0 ? `${metrics.vramUsageMb}` : '--'}</span>
                                <span className="text-[9px] text-muted-foreground">MB</span>
                            </div>
                        </div>
                    </div>

                    {/* VLM JSON Output Log */}
                    <div className="flex-1 flex flex-col bg-[#1e1e1e] rounded-xl border border-slate-800 overflow-hidden shadow-inner">
                        <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 flex justify-between items-center">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
                                <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                Streamed JSON Adjustments
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">Frames Processed: {metrics.totalInferences}</span>
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
                                        <span className={log.inferenceTimeMs < 1000 ? 'text-emerald-500' : 'text-amber-500'}>
                                            {log.inferenceTimeMs}ms
                                        </span>
                                    </div>
                                    <div className="text-sky-300">
                                        <pre className="whitespace-pre-wrap leading-relaxed">
                                            {JSON.stringify({ output: log.output, reasoning: log.reasoning }, null, 2)}
                                        </pre>
                                    </div>

                                    {/* Add a divider unless it's the last item and we aren't currently processing */}
                                    {(index < logs.length - 1 || vlmStatus === 'processing') && (
                                        <div className="mt-4 border-b border-slate-800/50 w-8"></div>
                                    )}
                                </div>
                            ))}

                            {vlmStatus === 'processing' && (
                                <div className="border-l-2 border-emerald-500/50 pl-3 opacity-70">
                                    <div className="text-emerald-500/80 mb-1 flex gap-2 items-center">
                                        <span className="animate-pulse">▶</span>
                                        <span className="animate-pulse">Analyzing frame for '{targetMood}' mood...</span>
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
