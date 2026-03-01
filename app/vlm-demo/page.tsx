'use client';

import React from 'react';
import TopNav from '../components/TopNav';
import VLMOverlayDemo from '../components/VLMOverlayDemo';

export default function VLMDemoPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <TopNav />
            <main className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">

                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
                        Local VLM Inference Demo
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        This interactive demo simulates the latency, resource usage, and output of running a small Vision-Language Model (like Moondream or Phi-3-Vision) directly in the browser using WebGPU to analyze game frames.
                    </p>
                </div>

                <VLMOverlayDemo />

                <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Maximum Privacy</h3>
                        <p className="text-sm text-muted-foreground">Screenshots never leave the user's device. No Gemini API calls required for gameplay analysis.</p>
                    </div>

                    <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">WebGPU Accelerated</h3>
                        <p className="text-sm text-muted-foreground">Utilizes the device's native graphics processing power directly inside the browser for rapid inference.</p>
                    </div>

                    <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Zero Server Cost</h3>
                        <p className="text-sm text-muted-foreground">Offloads the expensive cost of continuous computer vision analysis entirely to the client.</p>
                    </div>
                </div>

            </main>
        </div>
    );
}
