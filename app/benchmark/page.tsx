import { Metadata } from 'next';
import BenchmarkClient from './BenchmarkClient';

export const metadata: Metadata = {
  title: 'Skillprint AI Game-Agent Benchmark - Cognitive Human Performance Analytics',
  description: 'Assessing popular Vision-Language Models & Reasoning Agents on Skillprint’s catalog of games. Evaluate model focus, relax, and creativity scores through real-time VLM action efficiency.',
  keywords: ['AI Benchmark', 'Skillprint', 'VLM', 'Cognitive Assessment', 'Hextris AI', 'Box Tower AI', 'Colorize AI'],
  openGraph: {
    title: 'Skillprint AI Game-Agent Benchmark',
    description: 'Assessing popular Vision-Language Models & Reasoning Agents on Skillprint’s catalog of games.',
    type: 'website',
  }
};

export default function BenchmarkPage() {
  return (
    <main id="benchmark-landing-page" className="bg-slate-950 min-h-screen">
      <BenchmarkClient />
    </main>
  );
}
