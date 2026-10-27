import { Suspense } from 'react';
import { gameDetails, knownGameSlugs } from '../../config/gameConfig';
import GameClient from './GameClient';
import GameSessionLoading from '@/components/GameSession/GameSessionLoading';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Game Session',
};

interface GamePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { slug } = await params;
  return (
    <Suspense fallback={<GameSessionLoading />}>
      {/* Every game has its own start screen, so the portal's Play overlay
          would only be a second Play button in front of it. */}
      <GameClient slug={slug} autoPlay />
    </Suspense>
  );
}