'use client';

import React from 'react';
import TopNav from '../components/TopNav';
import HextrisTextVLMDemo from '../components/HextrisTextVLMDemo';

export default function HextrisTextVLMDemoPage() {
    return (
        <div className="min-h-screen bg-card flex flex-col font-sans">
            <TopNav />
            <main className="flex-1 flex flex-col py-6 px-4 sm:px-6 lg:px-8">

                <div className="max-w-7xl mx-auto w-full mb-6">
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">
                        Pipeline Comparison: Vision vs Text Inference
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Compare the simulated latency and WebGPU VRAM usage between processing raw Game Canvas screenshots (Vision) vs structured JSON state (Text).
                    </p>
                </div>

                <HextrisTextVLMDemo />

            </main>
        </div>
    );
}
