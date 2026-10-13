import type { Metadata } from 'next';
import { Suspense } from 'react';
import BreatheSession from './BreatheSession';

export const metadata: Metadata = {
  title: 'Breathe | Skillprint',
  robots: { index: false, follow: false },
};

export default function BreathePage() {
  return (
    <Suspense fallback={null}>
      <BreatheSession />
    </Suspense>
  );
}
