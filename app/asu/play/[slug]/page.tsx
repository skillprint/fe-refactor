import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { STATION_GAMES, stationGame } from '@/lib/asuStation';
import AsuPlayClient from './AsuPlayClient';

interface AsuPlayPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return STATION_GAMES.map((game) => ({ slug: game.slug }));
}

export default async function AsuPlayPage({ params }: AsuPlayPageProps) {
  const { slug } = await params;
  // Only the station's four games: a station visitor can't wander into the rest of the catalog.
  if (!stationGame(slug)) notFound();
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
      <AsuPlayClient slug={slug} />
    </Suspense>
  );
}
