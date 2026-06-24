import { Suspense } from 'react';
import GameClient from '../../../game/[slug]/GameClient';

interface PlayPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PlayPage({ params }: PlayPageProps) {
  const { slug } = await params;
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-slate-950 text-slate-200">Loading playtest sandbox...</div>}>
      <GameClient slug={slug} />
    </Suspense>
  );
}
