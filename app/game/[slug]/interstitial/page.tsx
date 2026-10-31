import { Suspense } from 'react';
import GameInterstitialClient from './GameInterstitialClient';

export default function GameInterstitial() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
      <GameInterstitialClient />
    </Suspense>
  );
}
