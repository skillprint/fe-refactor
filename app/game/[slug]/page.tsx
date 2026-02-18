import { Suspense } from 'react';
import { gameDetails, knownGameSlugs } from '../../config/gameConfig';
import GameClient from './GameClient';



interface GamePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { slug } = await params;
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
      <GameClient slug={slug} />
    </Suspense>
  );
}