'use client';

import React, { useState, useEffect, useRef } from 'react';

type SimulatedVLMState = 'idle' | 'capturing' | 'processing' | 'complete';

interface VLMOutput {
    targetMood: string;
    adjustments: {
        enemySpeedMultiplier: number;
        spawnRateMultiplier: number;
        colorPaletteShift: string;
        musicTempo: string;
    };
    reasoning: string;
}

export default function VLMOverlayDemo() {
    const [vlmState, setVlmState] = useState<SimulatedVLMState>('idle');
    const [output, setOutput] = useState<VLMOutput | null>(null);
    const [metrics, setMetrics] = useState({
        inferenceTimeMs: 0,
        vramUsageMb: 0,
        fpsImpact: 0,
    });

    const [targetMood, setTargetMood] = useState('relax');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Simulate a game loop running in a canvas just for visual effect
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let time = 0;
        let animationFrameId: number;

        const renderGameLoop = () => {
            time += 0.05;

            // Clear
            ctx.fillStyle = '#0f172a'; // slate-900
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw "player"
            ctx.fillStyle = '#38bdf8'; // sky-400
            const playerY = canvas.height / 2 + Math.sin(time) * 50;
            ctx.beginPath();
            ctx.arc(50, playerY, 15, 0, Math.PI * 2);
            ctx.fill();

            // Draw "obstacles"
            ctx.fillStyle = '#f43f5e'; // rose-500
            for (let i = 0; i < 3; i++) {
                const obsX = (canvas.width - ((time * 100 + i * 150) % canvas.width));
                ctx.fillRect(obsX, canvas.height / 2 - 20, 20, 40);
            }

            // If processing VLM, show a scanning effect
            if (vlmState === 'processing' || vlmState === 'capturing') {
                ctx.fillStyle = 'rgba(16, 185, 129, 0.2)'; // emerald-500 tint
                const scanY = (time * 200) % canvas.height;
                ctx.fillRect(0, scanY, canvas.width, 10);
            }

            animationFrameId = requestAnimationFrame(renderGameLoop);
        };

        renderGameLoop();

        return () => cancelAnimationFrame(animationFrameId);
    }, [vlmState]);


    const runSimulatedInference = async () => {
        if (vlmState !== 'idle' && vlmState !== 'complete') return;

        setVlmState('capturing');

        // 1. Simulate capture time
        await new Promise(resolve => setTimeout(resolve, 150));

        setVlmState('processing');

        // 2. Simulate WebGPU VLM Inference (e.g., Moondream2 or Phi-3-Vision)
        // Vary inference time based on hardware simulation
        const simulatedInferenceTime = Math.floor(Math.random() * 800) + 1200; // 1.2s - 2.0s

        setMetrics({
            vramUsageMb: 2450 + Math.floor(Math.random() * 100),
            inferenceTimeMs: 0,
            fpsImpact: 45 // Drops FPS to 15 temporarily
        });

        const startTime = Date.now();

        // Simulate the blocking/async work of the GPU
        await new Promise(resolve => setTimeout(resolve, simulatedInferenceTime));

        const actualTime = Date.now() - startTime;

        // 3. Generate mock JSON based on target mood
        let adjustments: VLMOutput['adjustments'];
        let reasoning = "";

        switch (targetMood) {
            case 'focus':
                adjustments = { enemySpeedMultiplier: 1.2, spawnRateMultiplier: 0.8, colorPaletteShift: 'desaturated', musicTempo: 'steady' };
                reasoning = "Player is distracted; reducing visual clutter and standardizing pace to encourage flow state.";
                break;
            case 'relax':
                adjustments = { enemySpeedMultiplier: 0.6, spawnRateMultiplier: 0.5, colorPaletteShift: 'warm', musicTempo: 'slow' };
                reasoning = "Visual scene parsing indicates high intensity. Slowing entities and warming palette to induce calm.";
                break;
            case 'speed':
                adjustments = { enemySpeedMultiplier: 1.5, spawnRateMultiplier: 1.5, colorPaletteShift: 'high-contrast', musicTempo: 'fast' };
                reasoning = "Increasing cognitive load and reaction speed demands to meet 'speed' target.";
                break;
            default:
                adjustments = { enemySpeedMultiplier: 1.0, spawnRateMultiplier: 1.0, colorPaletteShift: 'neutral', musicTempo: 'normal' };
                reasoning = "Maintaining current parameters.";
        }

        setOutput({
            targetMood,
            adjustments,
            reasoning
        });

        setMetrics({
            vramUsageMb: 2450,
            inferenceTimeMs: actualTime,
            fpsImpact: 0 // FPS recovers
        });

        setVlmState('complete');
    };

    return (
        <div className="w-full max-w-5xl mx-auto rounded-3xl overflow-hidden border border-border/50 shadow-2xl bg-background/95 backdrop-blur-xl flex flex-col md:flex-row">

            {/* Left: The "Game" View */}
            <div className="flex-1 relative bg-slate-950 p-6 flex flex-col border-r border-border/20">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-200 tracking-tight">Simulated Canvas</h3>
                    <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${metrics.fpsImpact > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                        <span className="text-xs text-slate-400 font-mono">
                            {metrics.fpsImpact > 0 ? `${60 - metrics.fpsImpact} FPS` : '60 FPS'}
                        </span>
                    </div>
                </div>

                <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-black/50 aspect-video ring-1 ring-white/10">
                    <canvas
                        ref={canvasRef}
                        width={800}
                        height={450}
                        className="w-full h-full object-cover"
                    />
                    {vlmState === 'capturing' && (
                        <div className="absolute inset-0 bg-white/20 animate-flash backdrop-blur-[1px] flex items-center justify-center">
                            <span className="bg-black/80 text-white text-xs px-3 py-1 rounded-full font-mono">Capturing Frame...</span>
                        </div>
                    )}
                    {vlmState === 'processing' && (
                        <div className="absolute inset-x-0 bottom-4 flex justify-center">
                            <span className="bg-emerald-500/90 text-emerald-50 text-xs px-4 py-1.5 rounded-full font-mono flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                WebGPU Inference...
                            </span>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="mt-6 flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Target Mood</label>
                        <select
                            value={targetMood}
                            onChange={(e) => setTargetMood(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            disabled={vlmState === 'processing'}
                        >
                            <option value="relax">Relax</option>
                            <option value="focus">Focus</option>
                            <option value="speed">Speed</option>
                        </select>
                    </div>
                    <button
                        onClick={runSimulatedInference}
                        disabled={vlmState === 'processing' || vlmState === 'capturing'}
                        className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-primary/25 transition-all active:scale-95"
                    >
                        {vlmState === 'processing' ? 'Processing...' : 'Capture & Analyze'}
                    </button>
                </div>
            </div>

            {/* Right: Telemetry & Output */}
            <div className="flex-1 bg-card p-6 flex flex-col overflow-hidden">
                <h3 className="font-bold text-foreground tracking-tight mb-6 flex items-center gap-2">
                    Local VLM Telemetry
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider">In-Browser</span>
                </h3>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Inference Time</div>
                        <div className="text-2xl font-mono text-foreground">
                            {metrics.inferenceTimeMs > 0 ? `${(metrics.inferenceTimeMs / 1000).toFixed(2)}s` : '--'}
                        </div>
                    </div>
                    <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">WebGPU VRAM</div>
                        <div className="text-2xl font-mono text-foreground">
                            {metrics.vramUsageMb > 0 ? `${metrics.vramUsageMb} MB` : '--'}
                        </div>
                    </div>
                </div>

                {/* JSON Output Window */}
                <div className="flex-1 flex flex-col min-h-[300px]">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-semibold text-foreground">Structured JSON Output</div>
                        <div className="text-xs text-muted-foreground font-mono">Phi-3-Vision (ONNX)</div>
                    </div>
                    <div className="flex-1 bg-[#1e1e1e] rounded-xl border border-slate-800 p-4 font-mono text-sm overflow-y-auto custom-scrollbar relative">
                        {vlmState === 'idle' && !output && (
                            <div className="text-slate-500 h-full flex items-center justify-center italic">
                                Awaiting first capture...
                            </div>
                        )}
                        {vlmState === 'processing' && (
                            <div className="text-emerald-500/70 h-full flex items-center space-x-2">
                                <span className="animate-pulse">▶</span>
                                <span className="animate-pulse">Analyzing visual scene...</span>
                            </div>
                        )}
                        {vlmState === 'complete' && output && (
                            <div className="text-sky-300">
                                <pre className="whitespace-pre-wrap leading-relaxed">
                                    {JSON.stringify(output, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
