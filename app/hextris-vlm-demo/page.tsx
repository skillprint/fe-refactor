'use client';

import React from 'react';
import TopNav from '../components/TopNav';
import HextrisVLMDemo from '../components/HextrisVLMDemo';

export default function HextrisVLMDemoPage() {
    return (
        <div className="min-h-screen bg-card flex flex-col font-sans">
            <TopNav />
            <main className="flex-1 flex flex-col py-6 px-4 sm:px-6 lg:px-8">

                <div className="max-w-7xl mx-auto w-full mb-6">
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">
                        Live Game VLM Integration
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Demonstrating how the client intercepts real Hextris frames, pipelines them to a local Vision Language Engine, and streams back structured JSON adjustments.
                    </p>
                </div>

                <HextrisVLMDemo />

            </main>
        </div>
    );
}
