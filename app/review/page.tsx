import type { Metadata } from 'next';
import { Suspense } from 'react';
import ReviewQueue from './ReviewQueue';

// Internal tool for Skillprint staff: kept out of search results.
export const metadata: Metadata = {
  title: 'Game Review | Skillprint',
  robots: { index: false, follow: false },
};

export default function ReviewPage() {
  return (
    <Suspense fallback={null}>
      <ReviewQueue />
    </Suspense>
  );
}
