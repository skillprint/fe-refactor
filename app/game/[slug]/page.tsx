import { Suspense } from 'react';
import { gameDetails, knownGameSlugs } from '../../config/gameConfig';
import GameClient from './GameClient';
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
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
      {/* Every game has its own start screen, so the portal's Play overlay
          would only be a second Play button in front of it. */}
      <GameClient slug={slug} autoPlay />
    </Suspense>
  );
}