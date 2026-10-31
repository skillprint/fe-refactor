import type { Metadata } from 'next';
import { Suspense } from 'react';
import GameReviewClient from './GameReviewClient';

// Internal tool for Skillprint staff: kept out of search results.
export const metadata: Metadata = {
  title: 'Game Review | Skillprint',
  robots: { index: false, follow: false },
};

export default function GameReviewPage() {
  return (
    <Suspense fallback={null}>
      <GameReviewClient />
    </Suspense>
  );
}
