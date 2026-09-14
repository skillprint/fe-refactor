import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import GameDetailClient from './GameDetailClient';

export const metadata: Metadata = {
  title: 'Game Detail',
};

interface GameDetailPageProps {
  searchParams: Promise<{
    game?: string;
  }>;
}

/**
 * Game detail (SKI-165). Everything on the page comes from the portal API:
 * the library record, the player's own record on the game and the community's
 * play need the player's token, so the page body is a client component.
 */
export default async function GameDetailPage({ searchParams }: GameDetailPageProps) {
  const { game } = await searchParams;
  return (
    <Suspense fallback={null}>
      <GameDetailClient slug={game || ''} />
    </Suspense>
  );
}
