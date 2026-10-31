import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import GameDetailClient, { GameDetailLoading } from './GameDetailClient';
import { fetchLibraryGame } from '@/lib/models/portal/serverLibraryGame';
import { gameSharePath } from '@/lib/share';
import { STATIC_EXPORT } from '@/lib/staticExport';

interface GameDetailPageProps {
  searchParams: Promise<{
    game?: string;
  }>;
}

/**
 * The game's preview card for anything that unfurls a link (X, Facebook,
 * LinkedIn, iMessage, Slack...). Crawlers do not run the page, so this is
 * resolved on the server from the library record.
 *
 * The static export has no request to read: it gets the generic card until
 * share cards are prebuilt for it.
 */
export async function generateMetadata({ searchParams }: GameDetailPageProps): Promise<Metadata> {
  if (STATIC_EXPORT) return { title: 'Game Detail' };
  const { game } = await searchParams;
  const record = game ? await fetchLibraryGame(decodeURIComponent(game)) : null;
  if (!record) return { title: 'Game Detail' };

  const title = `${record.name} on Skillprint`;
  const skills = [...record.skills, ...record.moods].map((t) => t.name).filter(Boolean);
  const description =
    record.shortDescription ||
    record.longDescription ||
    (skills.length ? `Play ${record.name} and train ${skills.slice(0, 3).join(', ')}.` : `Play ${record.name} on Skillprint.`);
  const path = gameSharePath(record.baseSlug);
  const image = { url: `/api/og/game/?slug=${encodeURIComponent(record.baseSlug)}`, width: 1200, height: 630, alt: `${record.name} on Skillprint` };

  return {
    title: record.name,
    description,
    alternates: { canonical: path },
    openGraph: { siteName: 'Skillprint', type: 'website', title, description, url: path, images: [image] },
    twitter: { card: 'summary_large_image', title, description, images: [image.url] },
  };
}

/**
 * Game detail (SKI-165). Everything on the page comes from the portal API:
 * the library record, the player's own record on the game and the community's
 * play need the player's token, so the page body is a client component.
 */
export default function GameDetailPage() {
  return (
    <Suspense fallback={<GameDetailLoading />}>
      <GameDetailClient />
    </Suspense>
  );
}
