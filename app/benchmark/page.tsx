import { Metadata } from 'next';
import { Suspense } from 'react';
import BenchmarkBackendClient from './BenchmarkBackendClient';

export const metadata: Metadata = {
  title: 'Skillprint AI Game-Agent Live Benchmark - Cognitive Human Performance Analytics',
  description: 'Assessing popular Vision-Language Models & Reasoning Agents on Skillprint’s catalog of games using backend data. Evaluate model focus, relax, and creativity scores through real-time VLM action efficiency.',
  keywords: ['AI Benchmark', 'Skillprint', 'VLM', 'Cognitive Assessment', 'Hextris AI', 'Box Tower AI', 'Colorize AI'],
  openGraph: {
    title: 'Skillprint AI Game-Agent Live Benchmark',
    description: 'Assessing popular Vision-Language Models & Reasoning Agents on Skillprint’s catalog of games using backend data.',
    type: 'website',
  }
};

export default function BenchmarkPage() {
  return (
    <main id="benchmark-backend-landing-page" className="bg-slate-950 min-h-screen">
      <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-bold">Loading...</div>}>
        <BenchmarkBackendClient />
      </Suspense>
    </main>
  );
}
