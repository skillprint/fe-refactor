import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import BadgeShareClient from './BadgeShareClient';
import { fetchTalent } from '@/lib/models/portal/serverTalents';
import { fetchLibraryGame } from '@/lib/models/portal/serverLibraryGame';
import { badgeSharePath } from '@/lib/share';
import { STATIC_EXPORT } from '@/lib/staticExport';

interface BadgePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ game?: string }>;
}

async function load({ params, searchParams }: BadgePageProps) {
  const { slug } = await params;
  const { game } = await searchParams;
  const [talent, record] = await Promise.all([
    fetchTalent(decodeURIComponent(slug)),
    // The game comes from the link, so it is only named when the library knows it.
    game ? fetchLibraryGame(decodeURIComponent(game)) : Promise.resolve(null),
  ]);
  return { talent, game: record };
}

export async function generateMetadata(props: BadgePageProps): Promise<Metadata> {
  // The static export has no request to read: it gets the generic card until
  // share cards are prebuilt for it.
  if (STATIC_EXPORT) return { title: 'Badge' };
  const { talent, game } = await load(props);
  if (!talent) return { title: 'Badge', robots: { index: false } };

  const title = `${talent.name} badge on Skillprint`;
  const description = game
    ? `Earned playing ${game.name}. ${talent.description}`
    : talent.description;
  const path = badgeSharePath(talent.slug, game?.baseSlug);
  const image = { url: `/api/og/badge/?slug=${encodeURIComponent(talent.slug)}`, width: 1200, height: 630, alt: title };

  return {
    title: `${talent.name} badge`,
    description,
    alternates: { canonical: path },
    openGraph: { siteName: 'Skillprint', type: 'website', title, description, url: path, images: [image] },
    twitter: { card: 'summary_large_image', title, description, images: [image.url] },
  };
}

export default function BadgePage() {
  return (
    <Suspense fallback={<main className="badge-share layout-grid place-center" aria-busy="true" />}>
      <BadgeShareClient />
    </Suspense>
  );
}
