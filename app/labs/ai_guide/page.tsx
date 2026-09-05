import { Suspense } from 'react';
import type { Metadata } from 'next';
import AiGuideClient from './AiGuideClient';

export const metadata: Metadata = {
  title: 'AI Guide Lab | Skillprint',
};

export default function AiGuidePage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading AI Guide...</div>}>
      <AiGuideClient />
    </Suspense>
  );
}
