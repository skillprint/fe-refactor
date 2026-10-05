import { Suspense } from 'react';
import type { Metadata } from 'next';
import AiGuideClient from './AiGuideClient';

export const metadata: Metadata = {
  title: 'AI Guide',
  description: 'The AI Guide live session console: play a game while the scoring API returns skill and flow scores and adjusts the game as you play.',
};

export default function AiGuidePage() {
  return (
    <Suspense fallback={<div className="page--adaptive-assist"><p className="aa-placeholder">Loading the AI Guide…</p></div>}>
      <AiGuideClient />
    </Suspense>
  );
}
