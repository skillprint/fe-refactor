import { Suspense } from 'react';
import type { Metadata } from 'next';
import MeditationPlayer from './MeditationPlayer';

export const metadata: Metadata = {
  title: 'Meditation | Skillprint',
  robots: { index: false, follow: false },
};

export default function MeditationPlayPage() {
  return (
    <Suspense fallback={null}>
      <MeditationPlayer />
    </Suspense>
  );
}
