import { Metadata } from 'next';
import { Suspense } from 'react';
import BenchmarkClient from '../BenchmarkClient';

export const metadata: Metadata = {
  title: 'Skillprint AI Game-Agent Local Benchmark - Cognitive Human Performance Analytics',
  description: 'Assessing popular Vision-Language Models & Reasoning Agents on Skillprint’s catalog of games. Evaluate model focus, relax, and creativity scores through real-time VLM action efficiency.',
  keywords: ['AI Benchmark', 'Skillprint', 'VLM', 'Cognitive Assessment', 'Hextris AI', 'Box Tower AI', 'Colorize AI'],
  openGraph: {
    title: 'Skillprint AI Game-Agent Local Benchmark',
    description: 'Assessing popular Vision-Language Models & Reasoning Agents on Skillprint’s catalog of games.',
    type: 'website',
  }
};

export default function BenchmarkStaticPage() {
  return (
    <main id="benchmark-landing-page" className="bg-slate-950 min-h-screen">
      <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-bold">Loading...</div>}>
        <BenchmarkClient />
      </Suspense>
    </main>
  );
}
