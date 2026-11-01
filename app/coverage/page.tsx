import type { Metadata } from 'next';
import { Suspense } from 'react';
import CoverageClient from './CoverageClient';

// Internal tool for Skillprint staff: kept out of search results.
export const metadata: Metadata = {
  title: 'Game Coverage | Skillprint',
  robots: { index: false, follow: false },
};

export default function CoveragePage() {
  return (
    <Suspense fallback={null}>
      <CoverageClient />
    </Suspense>
  );
}
