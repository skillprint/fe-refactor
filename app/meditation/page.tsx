import type { Metadata } from 'next';
import { Suspense } from 'react';
import MeditationStudio from './MeditationStudio';

// Internal tool: not linked from the portal and kept out of search results.
export const metadata: Metadata = {
  title: 'Meditation Studio | Skillprint',
  robots: { index: false, follow: false },
};

export default function MeditationPage() {
  return (
    <Suspense fallback={null}>
      <MeditationStudio />
    </Suspense>
  );
}
