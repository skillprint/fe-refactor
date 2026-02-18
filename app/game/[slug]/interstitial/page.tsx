import { Suspense } from 'react';
import { gameDetails, knownGameSlugs } from '../../../config/gameConfig';
import GameInterstitialClient from './GameInterstitialClient';



interface GameInterstitialProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function GameInterstitial({ params }: GameInterstitialProps) {
  const { slug } = await params;

  if (!slug) {
    return null;
  }

  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
      <GameInterstitialClient slug={slug} />
    </Suspense>
  );
}