import { Suspense } from 'react';
import GamePageClient from './GamePageClient';
import GameSessionLoading from '@/components/GameSession/GameSessionLoading';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Game Session',
};

export default function GamePage() {
  return (
    <Suspense fallback={<GameSessionLoading />}>
      <GamePageClient />
    </Suspense>
  );
}
